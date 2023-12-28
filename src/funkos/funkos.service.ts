import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateFunkoDto } from './dto/create-funko.dto';
import { UpdateFunkoDto } from './dto/update-funko.dto';
import { Funko } from './entities/funko.entity';
import { FunkosMapper } from './mappers/funkos.mapper';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Categoria } from '../categorias/entities/categoria.entity';

@Injectable()
export class FunkosService {
  private readonly logger: Logger = new Logger(FunkosService.name)

  constructor(@InjectRepository(Funko)
              private readonly funkoRepository:Repository<Funko>,
              @InjectRepository(Categoria)
              private readonly categoriaRepository: Repository<Categoria>,
              private readonly funkoMapper: FunkosMapper,) {
  }
  async findAll() {
    this.logger.log('Mostrando todos los funkos');
    const funkos = await this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.categoria', 'categoria')
      .orderBy('funko.id', 'ASC')
      .getMany();

    return funkos.map((funko) => this.funkoMapper.toResponseDto(funko));
  }


  async findOne(id: number) {
    this.logger.log(`Buscando un Funko con id: ${id}`);
    const funkoFound = await this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.categoria', 'categoria')
      .where('funko.id = :id', {id})
      .getOne()
    if (!funkoFound) {
      this.logger.log(`Funko con id ${id} no encontrado`)
      throw new NotFoundException(`Funko con id ${id} no encontrado`)
    }
    return this.funkoMapper.toResponseDto(funkoFound);
  }

  async create(createFunkoDto: CreateFunkoDto) {
    this.logger.log(`Creando funko ${JSON.stringify(createFunkoDto)}`);
    const categoria = await this.findCategoria(createFunkoDto.categoria)
    const funkoCreado: Funko = this.funkoMapper.toCreateEntity(createFunkoDto, categoria);
    const res = await this.funkoRepository.save(funkoCreado);
    return this.funkoMapper.toResponseDto(res);
  }

  async update(id: number, updateFunkoDto: UpdateFunkoDto) {
    this.logger.log(
      `Actualizando Funko con id: ${id} con funko: ${JSON.stringify(updateFunkoDto)}`
    );
    if (!updateFunkoDto || Object.keys(updateFunkoDto).length === 0) {
      this.logger.log(`No se ha enviado ningun dato para actualizar`)
      throw new BadRequestException('No se ha enviado ningun dato para actualizar');
    }
    const funkoActual = await this.exists(id);
    let categoria: Categoria;
    if(updateFunkoDto.categoria){
      categoria = await this.findCategoria(updateFunkoDto.categoria)
    } else {
      categoria = funkoActual.categoria;
    }
    const funkoActualizado = this.funkoMapper.toUpdateEntity(funkoActual, updateFunkoDto, categoria);
    const res = await this.funkoRepository.save(funkoActualizado);
    return this.funkoMapper.toResponseDto(funkoActualizado);
  }

  public async findCategoria(nombreCategoria: string): Promise<Categoria>{
    const categoriaFound = await this.categoriaRepository
      .createQueryBuilder()
      .where('UPPER(nombre) = UPPER(:nombre)', {
        nombre: nombreCategoria,
      })
      .getOne();
    if(!categoriaFound){
      this.logger.log(`La categoria ${nombreCategoria} no existe en la database`)
      throw new BadRequestException(`La categoria con nombre ${nombreCategoria} no existe en la BD`)
    }
    return categoriaFound;
  }

  async remove(id: number) {
    this.logger.log(`Borrando Funko con id ${id}`)
    const funkoToDelete = await this.exists(id)
    return this.funkoMapper.toResponseDto(
      await this.funkoRepository.remove(funkoToDelete)
    );
  }

  async removeSoft(id:number){
    const funkoToDelete = await this.exists(id);
    funkoToDelete.isDeleted = true;
    return this.funkoMapper.toResponseDto(
      await this.funkoRepository.save(funkoToDelete)
    );
  }

  public async exists(id:number): Promise<Funko>{
    const funko = await this.funkoRepository.findOneBy({id})
    if (!funko){
      this.logger.log(`No se ha encontrado el funko con id: ${id}`)
      throw new NotFoundException(`Funko con id: ${id} no encontrado`)
    }
    return funko;
  }
}