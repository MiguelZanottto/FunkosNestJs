import { Logger, Module } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CategoriasController } from './categorias.controller';
import { CategoriasMapper } from './mappers/categorias.mapper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([Categoria]),
  ],
  controllers: [CategoriasController],
  providers: [CategoriasService, CategoriasMapper],
  exports: []
})
export class CategoriasModule {}
