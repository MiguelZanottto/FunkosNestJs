import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { Categoria } from './entities/categoria.entity';
import { Repository } from 'typeorm';
import { CategoriasMapper } from './mappers/categorias.mapper';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ResponseCategoriaDto } from './dto/response-categoria.dto';
import { Funko } from '../funkos/entities/funko.entity';
import { Notificacion, NotificacionTipo } from '../websockets/notifications/models/notificacion.model';
import { NotificationsGateway } from '../websockets/notifications/notifications.gateway';


@Injectable()
export class CategoriasService {
  private readonly logger: Logger = new Logger(CategoriasService.name)

  constructor(
    @InjectRepository(Categoria)
    private readonly categoriasRepository : Repository<Categoria>,
    @InjectRepository(Funko)
    private readonly funkoRepository : Repository<Funko>,
    private readonly categoriasMapper : CategoriasMapper,
    private readonly notificationsGateway: NotificationsGateway) {}

  async findAll() {
    this.logger.log("Buscando todas las categorias");
    const categorias : Categoria[] = await this.categoriasRepository.find();
    return categorias.map((categoria : Categoria) => this.categoriasMapper.toResponseDto(categoria));
  }

  async findOne(id: string) {
    this.logger.log(`Buscando una categoria con id: ${id}`)
    const categoriaFound: Categoria = await this.categoriasRepository.findOneBy({id});
    if(!categoriaFound){
      this.logger.log(`No se ha encontrado la categoria con id: ${id}`)
      throw new NotFoundException(`Categoria con id: ${id} no encontrada`);
    }
    return categoriaFound;
  }

  async create(createCategoriaDto: CreateCategoriaDto) : Promise<ResponseCategoriaDto> {
    this.logger.log(`Creando la categoria ${JSON.stringify(createCategoriaDto)}`)
    const categoriaActual: Categoria = await this.exists(createCategoriaDto.nombre);
    if(categoriaActual){
      this.logger.log(`La categoria con nombre ${categoriaActual.nombre} ya existe en la BD`)
      throw new BadRequestException(`La categoria con nombre ${categoriaActual.nombre} ya existe en la BD`)
    }
    const categoryToCreate = this.categoriasMapper.toEntityCreate(createCategoriaDto);
    const categoryCreated : Categoria = await this.categoriasRepository.save({
      ...categoryToCreate,
      id: uuidv4(),
    })
    const categoryResponse = this.categoriasMapper.toResponseDto(categoryCreated);
    this.onChange(NotificacionTipo.CREATE, categoryResponse);
    return categoryResponse;
  }

  async update(id: string, updateCategoriaDto: UpdateCategoriaDto): Promise<ResponseCategoriaDto> {
    this.logger.log(`Actualizando la categoria con id: ${id} con categoria: ${JSON.stringify(updateCategoriaDto)}`)
    const categoriaActual: Categoria = await this.findOne(id);
    if(updateCategoriaDto.nombre){
      const categoria = await this.exists(updateCategoriaDto.nombre);
      if(categoria && categoria.id != id){
        this.logger.log(`La categoria ${updateCategoriaDto.nombre} ya existe en la BD`)
        throw new BadRequestException(`La categoria ${updateCategoriaDto.nombre} ya existe en la BD`)
      }
    }
    const categoriaToUpdate : Categoria = this.categoriasMapper.toEntityUpdate(updateCategoriaDto, categoriaActual);
    const categoriaUpdated : Categoria =  await this.categoriasRepository.save(categoriaToUpdate)
    const categoriaResponse : ResponseCategoriaDto = this.categoriasMapper.toResponseDto(categoriaUpdated);
    this.onChange(NotificacionTipo.UPDATE, categoriaResponse);
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
    return categoriaResponse;
  }

  async removeSoft(id: string): Promise <ResponseCategoriaDto> {
    this.logger.log(`Borrando la categoria con id: ${id}`)
    const categoriaToDelete : Categoria = await this.findOne(id)
    const categoriaDeleted : Categoria = await this.categoriasRepository.save({...categoriaToDelete, updatedAt: new Date(), isDeleted: true});
    const categoryReponse : ResponseCategoriaDto = this.categoriasMapper.toResponseDto(categoriaDeleted);
    this.onChange(NotificacionTipo.DELETE, categoryReponse);
    return categoryReponse;
  }

  public async exists(nombreCategoria: string): Promise<Categoria>{
    return await this.categoriasRepository
      .createQueryBuilder()
      .where('UPPER(nombre) = UPPER(:nombre)', {
        nombre: nombreCategoria.toLowerCase(),
      })
      .getOne()
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
}

