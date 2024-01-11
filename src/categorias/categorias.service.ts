import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { Categoria } from './entities/categoria.entity';
import { Repository } from 'typeorm';
import { CategoriasMapper } from './mappers/categorias.mapper';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ResponseCategoriaDto } from './dto/response-categoria.dto';
import { Funko } from '../funkos/entities/funko.entity';
import { Notificacion, NotificacionTipo } from '../websockets/notifications/models/notificacion.model';
import { NotificationsGateway } from '../websockets/notifications/notifications.gateway';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager'


@Injectable()
export class CategoriasService {
  private readonly logger: Logger = new Logger(CategoriasService.name)

  constructor(
    @InjectRepository(Categoria)
    private readonly categoriasRepository : Repository<Categoria>,
    @InjectRepository(Funko)
    private readonly funkoRepository : Repository<Funko>,
    private readonly categoriasMapper : CategoriasMapper,
    private readonly notificationsGateway: NotificationsGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {}

  async findAll() {
    this.logger.log("Buscando todas las categorias");
    const cache = await this.cacheManager.get('all_categories');
    if(cache){
      this.logger.log('Categorias recuperadas de la cache')
      return cache;
    }
    const categorias : Categoria[] = await this.categoriasRepository.find();
    const categoriesResponse : ResponseCategoriaDto [] = categorias.map((categoria : Categoria) => this.categoriasMapper.toResponseDto(categoria));
    await this.cacheManager.set('all_categories', categoriesResponse, 60);
    return categoriesResponse;
  }

  async findOne(id: string) {
    this.logger.log(`Buscando una categoria con id: ${id}`)
    const cache: Categoria = await this.cacheManager.get(`category_${id}`);
    if(cache){
      this.logger.log('Categoria recuperada de la cache')
      return cache;
    }
    const categoriaFound: Categoria = await this.categoriasRepository.findOneBy({id});
    if(!categoriaFound){
      this.logger.log(`No se ha encontrado la categoria con id: ${id}`)
      throw new NotFoundException(`Categoria con id: ${id} no encontrada`);
    }
    await this.cacheManager.set(`category_${id}`, categoriaFound, 60);
    return categoriaFound;
  }

  async create(createCategoriaDto: CreateCategoriaDto) : Promise<ResponseCategoriaDto> {
    this.logger.log(`Creando la categoria ${JSON.stringify(createCategoriaDto)}`)
    const categoriaActual: Categoria = await this.exists(createCategoriaDto.nombre);
    if(categoriaActual){
      this.logger.log(`La categoria con nombre ${categoriaActual.nombre} ya existe en la BD`)
      throw new BadRequestException(`La categoria con nombre ${categoriaActual.nombre} ya existe en la BD`)
    }
    const categoryToCreate : Categoria = this.categoriasMapper.toEntityCreate(createCategoriaDto);
    const categoryCreated : Categoria = await this.categoriasRepository.save({
      ...categoryToCreate,
      id: uuidv4(),
    })
    const categoryResponse : ResponseCategoriaDto = this.categoriasMapper.toResponseDto(categoryCreated);
    this.onChange(NotificacionTipo.CREATE, categoryResponse);
    await this.invalidateCacheKey('all_categories')
    return categoryResponse;
  }

  async update(id: string, updateCategoriaDto: UpdateCategoriaDto): Promise<ResponseCategoriaDto> {
    this.logger.log(`Actualizando la categoria con id: ${id} con categoria: ${JSON.stringify(updateCategoriaDto)}`)
    const categoriaActual : Categoria = await this.findOne(id);
    if(updateCategoriaDto.nombre){
      const categoria : Categoria = await this.exists(updateCategoriaDto.nombre);
      if(categoria && categoria.id != id){
        this.logger.log(`La categoria ${updateCategoriaDto.nombre} ya existe en la BD`)
        throw new BadRequestException(`La categoria ${updateCategoriaDto.nombre} ya existe en la BD`)
      }
    }
    const categoriaToUpdate : Categoria = this.categoriasMapper.toEntityUpdate(updateCategoriaDto, categoriaActual);
    const categoriaUpdated : Categoria =  await this.categoriasRepository.save(categoriaToUpdate)
    const categoriaResponse : ResponseCategoriaDto = this.categoriasMapper.toResponseDto(categoriaUpdated);
    this.onChange(NotificacionTipo.UPDATE, categoriaResponse);
    await this.invalidateCacheKey(`category_${id}`)
    await this.invalidateCacheKey('all_categories')
    return categoriaResponse;
  }

  async remove(id: string) {
    this.logger.log(`Borrando la categoria con id: ${id}`);
    const categoriaToDelete : Categoria = await this.findOne(id);

    await this.funkoRepository
      .createQueryBuilder()
      .update(Funko)
      .set({categoria : null })
      .where('categoria = :id', {id})
      .execute();

    const categoriaDeleted : Categoria = await this.categoriasRepository.remove(categoriaToDelete);
    const categoriaResponse : ResponseCategoriaDto = {...this.categoriasMapper.toResponseDto(categoriaDeleted), id: id, isDeleted: true};
    this.onChange(NotificacionTipo.DELETE, categoriaResponse);
    await this.invalidateCacheKey(`category_${id}`)
    await this.invalidateCacheKey('all_categories')
    return categoriaResponse;
  }

  async removeSoft(id: string): Promise <ResponseCategoriaDto> {
    this.logger.log(`Borrando la categoria con id: ${id}`)
    const categoriaToDelete : Categoria = await this.findOne(id)
    const categoriaDeleted : Categoria = await this.categoriasRepository.save({...categoriaToDelete, updatedAt: new Date(), isDeleted: true});
    const categoryReponse : ResponseCategoriaDto = this.categoriasMapper.toResponseDto(categoriaDeleted);
    this.onChange(NotificacionTipo.DELETE, categoryReponse);
    await this.invalidateCacheKey(`category_${id}`)
    await this.invalidateCacheKey('all_categories')
    return categoryReponse;
  }

  public async exists(nombreCategoria: string): Promise<Categoria>{
    const cache: Categoria = await this.cacheManager.get(`category_name_${nombreCategoria}`)
    if(cache){
      this.logger.log('Categoria encontrada en la cache')
      return cache;
    }
    const categoryFound: Categoria = await this.categoriasRepository
      .createQueryBuilder()
      .where('UPPER(nombre) = UPPER(:nombre)', {
        nombre: nombreCategoria.toLowerCase(),
      })
      .getOne();
    await this.cacheManager.set(`category_name_${nombreCategoria}`, categoryFound, 60);
    return categoryFound;
  }

  private onChange(tipo: NotificacionTipo, data: ResponseCategoriaDto){
    const notificacion : Notificacion<ResponseCategoriaDto> = new Notificacion <ResponseCategoriaDto>(
      'CATEGORIAS',
      tipo,
      data,
      new Date(),
    )
    this.notificationsGateway.sendMessage(notificacion)
  }

  async invalidateCacheKey(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
  }
}

