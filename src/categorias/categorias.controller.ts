import { Controller, Get, Post, Body, Param, Delete, HttpCode, ParseUUIDPipe, Put, Logger } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Controller('categorias')
export class CategoriasController {
  private readonly logger: Logger = new Logger(CategoriasController.name)
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  async findAll() {
    this.logger.log(`Searching all categories from database`)
    return  await this.categoriasService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Searching category by id ${id} from database`)
    return await this.categoriasService.findOne(id)
  }

  @Post()
  @HttpCode(201)
  async create(@Body() createCategoriaDto: CreateCategoriaDto) {
    this.logger.log(`Creating category`)
    return await this.categoriasService.create(createCategoriaDto);
  }

  @Put(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCategoriaDto: UpdateCategoriaDto) {
    this.logger.log(`Updating category by id ${id} from database`)
    return await this.categoriasService.update(id, updateCategoriaDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Deleting category by id ${id} from database`)
    await this.categoriasService.remove(id);
  }
}
