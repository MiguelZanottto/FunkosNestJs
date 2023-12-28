import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, ParseIntPipe, Logger, BadRequestException, Put } from '@nestjs/common';
import { FunkosService } from './funkos.service';
import { CreateFunkoDto } from './dto/create-funko.dto';
import { UpdateFunkoDto } from './dto/update-funko.dto';

@Controller('funkos')
export class FunkosController {
  private readonly logger: Logger = new Logger(FunkosController.name);

  constructor(private readonly funkosService: FunkosService) {}

  @Get()
  @HttpCode(200)
  async findAll() {
    this.logger.log(`Searching all funks`)
    return await this.funkosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Searching funk by id: ${id}`)
    return await this.funkosService.findOne(id);
  }

  @Post()
  @HttpCode(201)
  async create(@Body() createFunkoDto: CreateFunkoDto) {
    this.logger.log(`Creating funk ${createFunkoDto}`)
    return await this.funkosService.create(createFunkoDto);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateFunkoDto: UpdateFunkoDto) {
    this.logger.log(`Updating funk by id: ${id} with funk: ${updateFunkoDto}`)
    return await this.funkosService.update(id, updateFunkoDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Deleting funk by id: ${id}`)
    return await this.funkosService.remove(id);
  }
}
