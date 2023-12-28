import { Module } from '@nestjs/common';
import { FunkosService } from './funkos.service';
import { FunkosController } from './funkos.controller';
import { FunkosMapper } from './mappers/funkos.mapper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Funko } from './entities/funko.entity';
import { Categoria } from '../categorias/entities/categoria.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([Funko]),
    TypeOrmModule.forFeature([Categoria])
  ],
  controllers: [FunkosController],
  providers: [FunkosService, FunkosMapper],
})
export class FunkosModule {}
