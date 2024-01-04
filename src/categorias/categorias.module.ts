import { Logger, Module } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CategoriasController } from './categorias.controller';
import { CategoriasMapper } from './mappers/categorias.mapper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';
import { Funko } from '../funkos/entities/funko.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([Categoria]),
    TypeOrmModule.forFeature([Funko]),
  ],
  controllers: [CategoriasController],
  providers: [CategoriasService, CategoriasMapper],
  exports: []
})
export class CategoriasModule {}
