import { Controller, Get, Post, Body, Param, Delete, HttpCode, Put, Logger, UseInterceptors, UseGuards } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { UuidIdValidatorPipe } from '../pipes/validations/uuid-id-validator/uuid-id-validator.pipe';
import { BodyNotEmptyValidatorPipe } from '../pipes/validations/body-not-empty-validator/body-not-empty-validator.pipe';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesAuthGuard } from '../auth/guards/roles-auth.guard';
import { ApiExcludeController } from '@nestjs/swagger';


@Controller('categorias')
@UseInterceptors(CacheInterceptor)
@UseGuards(JwtAuthGuard, RolesAuthGuard)
@ApiExcludeController()
export class CategoriasController {
  private readonly logger: Logger = new Logger(CategoriasController.name)
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  @CacheKey('all_categories')
  @CacheTTL(3)
  @Roles('USER')
  async findAll(@Paginate() query: PaginateQuery) {
    this.logger.log(`Searching all categories`)
    return  await this.categoriasService.findAll(query);
  }

  @Get(':id')
  @Roles('USER')
  async findOne(@Param('id', new UuidIdValidatorPipe()) id: string) {
    this.logger.log(`Searching category by id ${id}`)
    return await this.categoriasService.findOne(id)
  }

  @Post()
  @HttpCode(201)
  @Roles('ADMIN')
  async create(@Body() createCategoriaDto: CreateCategoriaDto) {
    this.logger.log(`Creating category`)
    return await this.categoriasService.create(createCategoriaDto);
  }

  @Put(':id')
  @Roles('ADMIN')
  async update(@Param('id', new UuidIdValidatorPipe()) id: string, @Body(new BodyNotEmptyValidatorPipe()) updateCategoriaDto: UpdateCategoriaDto) {
    this.logger.log(`Updating category by id ${id}`)
    return await this.categoriasService.update(id, updateCategoriaDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('ADMIN')
  async remove(@Param('id', new UuidIdValidatorPipe()) id: string) {
    this.logger.log(`Deleting category by id ${id}`)
    await this.categoriasService.remove(id);
  }
}
