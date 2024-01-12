import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateFunkoDto } from './dto/create-funko.dto';
import { UpdateFunkoDto } from './dto/update-funko.dto';
import { Funko } from './entities/funko.entity';
import { FunkosMapper } from './mappers/funkos.mapper';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Categoria } from '../categorias/entities/categoria.entity';
import { StorageService } from '../storage/storage.service';
import { NotificationsGateway } from '../websockets/notifications/notifications.gateway';
import { Notificacion, NotificacionTipo } from '../websockets/notifications/models/notificacion.model';
import { FunkoResponseDto } from './dto/response-funko.dto';
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { query } from 'express';
import { hash } from 'typeorm/util/StringUtils'
import { FilterOperator, FilterSuffix, PaginateQuery, paginate } from 'nestjs-paginate';

@Injectable()
export class FunkosService {
  private readonly logger: Logger = new Logger(FunkosService.name)

  constructor(@InjectRepository(Funko)
              private readonly funkoRepository:Repository<Funko>,
              @InjectRepository(Categoria)
              private readonly categoriaRepository: Repository<Categoria>,
              private readonly storageService:StorageService,
              private readonly funkoMapper: FunkosMapper,
              private readonly notificationsGateway: NotificationsGateway,
              @Inject(CACHE_MANAGER) private cacheManager: Cache
              ) {
  }
  async findAll(query: PaginateQuery){
    this.logger.log('Mostrando todos los funkos');

    const cache = await this.cacheManager.get(
      `all_funks_page_${hash(JSON.stringify(query))}`,
    );

    if (cache){
      this.logger.log('Funkos recuperado de la cache');
      return cache;
    }

    const queryBuilder = this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.categoria', 'categoria');

    const pagination = await paginate(query, queryBuilder, {
        sortableColumns: ['nombre', 'precio', 'cantidad'],
        //nullSort: 'last',
        defaultSortBy: [['id', 'ASC']],
        searchableColumns: ['nombre', 'precio', 'cantidad'],
        filterableColumns: {
          nombre: [FilterOperator.EQ, FilterSuffix.NOT],
          precio: true,
          cantidad: true,
          isDeleted: [FilterOperator.EQ, FilterSuffix.NOT],
        },
        // select: ['id', 'nombre', 'precio', 'cantidad', 'imagen']
    })

    const res = {
      data: (pagination.data ?? []).map((funko) =>
      this.funkoMapper.toResponseDto(funko),
      ),
      meta: pagination.meta,
      links: pagination.links
    }
    await this.cacheManager.set(`all_funks_page_${hash(JSON.stringify(query))}`,
      res,
      6000,
      )
    return res;
  }

  async findOne(id: number) {
    this.logger.log(`Buscando un Funko con id: ${id}`);
    const cache: FunkoResponseDto = await this.cacheManager.get(
      `funk_${id}`
    )
    if(cache){
     this.logger.log('Funko recuperado de la cache');
     return cache
    }
    const funkoFound : Funko = await this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.categoria', 'categoria')
      .where('funko.id = :id', {id})
      .getOne()
    if (!funkoFound) {
      this.logger.log(`Funko con id ${id} no encontrado`)
      throw new NotFoundException(`Funko con id ${id} no encontrado`)
    }
    const funkResponse : FunkoResponseDto = this.funkoMapper.toResponseDto(funkoFound);
    await this.cacheManager.set(`funk_${id}`, funkResponse, 60000);
    return funkResponse;
  }

  async create(createFunkoDto: CreateFunkoDto) {
    this.logger.log(`Creando funko ${JSON.stringify(createFunkoDto)}`);
    const categoria : Categoria = await this.findCategoria(createFunkoDto.categoria)
    const funkoToCreate: Funko = this.funkoMapper.toCreateEntity(createFunkoDto, categoria);
    const funkoCreated : Funko = await this.funkoRepository.save(funkoToCreate);
    const funkoResponse : FunkoResponseDto = this.funkoMapper.toResponseDto(funkoCreated);
    this.onChange(NotificacionTipo.CREATE, funkoResponse);
    await this.invalidateCacheKey('all_funks');
    return funkoResponse;
  }

  async update(id: number, updateFunkoDto: UpdateFunkoDto) {
    this.logger.log(
      `Actualizando Funko con id: ${id} con funko: ${JSON.stringify(updateFunkoDto)}`
    );
    const funkoActual : Funko = await this.exists(id);
    let categoria: Categoria;
    if(updateFunkoDto.categoria){
      categoria = await this.findCategoria(updateFunkoDto.categoria)
    } else {
      categoria = funkoActual.categoria;
    }
    const funkoToUpdated : Funko = this.funkoMapper.toUpdateEntity(funkoActual, updateFunkoDto, categoria);
    const funkoUpdated : Funko = await this.funkoRepository.save(funkoToUpdated);
    const funkoResponse : FunkoResponseDto = this.funkoMapper.toResponseDto(funkoUpdated);
    this.onChange(NotificacionTipo.UPDATE, funkoResponse);
    await this.invalidateCacheKey(`funk_${id}`)
    await this.invalidateCacheKey(`funk_entity_${id}`)
    await this.invalidateCacheKey('all_funks')
    return funkoResponse;
  }

  async remove(id: number) {
    this.logger.log(`Borrando Funko con id ${id}`)
    const funkoToDelete : Funko = await this.exists(id)
    if(funkoToDelete.imagen && funkoToDelete.imagen !=  Funko.IMAGE_DEFAULT) {
      this.logger.log(`Borrando imagen ${funkoToDelete.imagen}`)
      this.storageService.removeFile(funkoToDelete.imagen)
    }
    const funkoDeleted : Funko = await this.funkoRepository.remove(funkoToDelete);
    const funkoResponse : FunkoResponseDto = {...this.funkoMapper.toResponseDto(funkoDeleted), id : id, isDeleted : true};
    this.onChange(NotificacionTipo.DELETE, funkoResponse);
    await this.invalidateCacheKey(`funk_${id}`);
    await this.invalidateCacheKey(`funk_entity_${id}`)
    await this.invalidateCacheKey(`all_funks`);
    return funkoResponse;
  }

  async removeSoft(id:number){
    const funkoToDelete : Funko = await this.exists(id);
    const funkoDeleted : Funko = await this.funkoRepository.save({...funkoToDelete, isDeleted: true, updatedAt: Date.now()});
    const funkoResponse : FunkoResponseDto = this.funkoMapper.toResponseDto(funkoDeleted);
    this.onChange(NotificacionTipo.DELETE, funkoResponse);
    await this.invalidateCacheKey(`funk_${id}`);
    await this.invalidateCacheKey(`funk_entity_${id}`)
    await this.invalidateCacheKey(`all_funks`);
    return funkoResponse;
  }

  public async findCategoria(nombreCategoria: string): Promise<Categoria>{
    const cache: Categoria = await this.cacheManager.get(
      `category_name_${nombreCategoria}`
    )
    if (cache){
      this.logger.log('Categoria recuperada de la cache');
      return cache;
    }
    const categoriaFound : Categoria = await this.categoriaRepository
      .createQueryBuilder()
      .where('UPPER(nombre) = UPPER(:nombre)', {
        nombre: nombreCategoria,
      })
      .getOne();
    if(!categoriaFound){
      this.logger.log(`La categoria ${nombreCategoria} no existe en la database`)
      throw new BadRequestException(`La categoria con nombre ${nombreCategoria} no existe en la BD`)
    }
    await this.cacheManager.set(`category_name_${nombreCategoria}`, categoriaFound, 60000);
    return categoriaFound;
  }

  public async exists(id:number): Promise<Funko>{
    const cache: Funko = await this.cacheManager.get(
      `funk_entity_${id}`
    )
    if (cache){
      this.logger.log('Funko recuperado de la cache');
      return cache;
    }
    const funko = await this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.categoria', 'categoria')
      .where('funko.id = :id', {id})
      .getOne()
    if (!funko){
      this.logger.log(`No se ha encontrado el funko con id: ${id}`)
      throw new NotFoundException(`Funko con id: ${id} no encontrado`)
    }
    await this.cacheManager.set(`funk_entity_${id}`, funko, 60000);
    return funko;
  }

  public async updateImage(
    id:number,
    file: Express.Multer.File
  ) {
    this.logger.log(`Update image funko by id: ${id}`)
    const funkToUpdate = await this.exists(id);

    if (funkToUpdate.imagen !== Funko.IMAGE_DEFAULT){
      this.logger.log(`Borrando imagen ${funkToUpdate.imagen}`)
      let imagePath : string = funkToUpdate.imagen;

      try {
        this.storageService.removeFile(imagePath);
      } catch (error){
        this.logger.error(error);
      }
    }

    if (!file){
      throw new BadRequestException('Fichero no encontrado.')
    }

    funkToUpdate.imagen = file.filename;
    const funkUpdated : Funko = await this.funkoRepository.save(funkToUpdate);
    const funkResponse : FunkoResponseDto = this.funkoMapper.toResponseDto(funkUpdated);
    this.onChange(NotificacionTipo.UPDATE, funkResponse)
    await this.invalidateCacheKey(`funk_${id}`)
    await this.invalidateCacheKey(`funk_entity_${id}`)
    await this.invalidateCacheKey('all_funks')
    return funkResponse;
  }

  private onChange(tipo: NotificacionTipo, data: FunkoResponseDto){
    const notificacion : Notificacion<FunkoResponseDto> = new Notificacion <FunkoResponseDto>(
      'FUNKOS',
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