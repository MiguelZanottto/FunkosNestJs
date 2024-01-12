import { Controller, Get, Post, Body, Param, Delete, HttpCode, Put, Logger, UseInterceptors } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { UuidIdValidatorPipe } from '../pipes/validations/uuid-id-validator/uuid-id-validator.pipe';
import { BodyNotEmptyValidatorPipe } from '../pipes/validations/body-not-empty-validator/body-not-empty-validator.pipe';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { Paginate, PaginateQuery } from 'nestjs-paginate';


@Controller('categorias')
@UseInterceptors(CacheInterceptor)
export class CategoriasController {
  private readonly logger: Logger = new Logger(CategoriasController.name)
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  @CacheKey('all_categories')
  @CacheTTL(30000)
  async findAll(@Paginate() query: PaginateQuery) {
    this.logger.log(`Searching all categories`)
    return  await this.categoriasService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', new UuidIdValidatorPipe()) id: string) {
    this.logger.log(`Searching category by id ${id}`)
    return await this.categoriasService.findOne(id)
  }

  @Post()
  @HttpCode(201)
  async create(@Body() createCategoriaDto: CreateCategoriaDto) {
    this.logger.log(`Creating category`)
    return await this.categoriasService.create(createCategoriaDto);
  }

  @Put(':id')
  async update(@Param('id', new UuidIdValidatorPipe()) id: string, @Body(new BodyNotEmptyValidatorPipe()) updateCategoriaDto: UpdateCategoriaDto) {
    this.logger.log(`Updating category by id ${id}`)
    return await this.categoriasService.update(id, updateCategoriaDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', new UuidIdValidatorPipe()) id: string) {
    this.logger.log(`Deleting category by id ${id}`)
    await this.categoriasService.remove(id);
  }
}
