import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { Categoria } from './entities/categoria.entity';
import { Repository } from 'typeorm';
import { CategoriasMapper } from './mappers/categorias.mapper';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ResponseCategoriaDto } from './dto/response-categoria.dto';


@Injectable()
export class CategoriasService {
  private readonly logger: Logger = new Logger(CategoriasService.name)

  constructor(
    @InjectRepository(Categoria)
    private readonly categoriasRepository : Repository<Categoria>,
    private readonly categoriasMapper : CategoriasMapper) {}

  async findAll() {
    this.logger.log("Buscando todas las categorias");
    const categorias = await this.categoriasRepository.find();
    return categorias.map((categoria) => this.categoriasMapper.toResponseDto(categoria));
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
    const newCategoria = this.categoriasMapper.toEntityCreate(createCategoriaDto);
    const res : Categoria = await this.categoriasRepository.save({
      ...newCategoria,
      id: uuidv4(),
    })
    return this.categoriasMapper.toResponseDto(res);
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
    const categoriaActualizada = this.categoriasMapper.toEntityUpdate(updateCategoriaDto, categoriaActual);
    return this.categoriasMapper.toResponseDto(
      await this.categoriasRepository.save(categoriaActualizada)
    );
  }

  async remove(id: string) {
    this.logger.log(`Borrando la categoria con id: ${id}`);
    const categoriaToDelete = await this.findOne(id);
    return this.categoriasMapper.toResponseDto(
      await this.categoriasRepository.remove(categoriaToDelete)
    );
  }

  async removeSoft(id: string): Promise <ResponseCategoriaDto> {
    this.logger.log(`Borrando la categoria con id: ${id}`)
    const categoriaToDelete = await this.findOne(id)
    return this.categoriasMapper.toResponseDto(
    await this.categoriasRepository.save({...categoriaToDelete, updatedAt: new Date(), isDeleted: true})
    );
  }


  public async exists(nombreCategoria: string): Promise<Categoria>{
    return await this.categoriasRepository
      .createQueryBuilder()
      .where('UPPER(nombre) = UPPER(:nombre)', {
        nombre: nombreCategoria.toLowerCase(),
      })
      .getOne()
  }
}

