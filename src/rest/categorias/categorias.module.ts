import { Logger, Module } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CategoriasController } from './categorias.controller';
import { CategoriasMapper } from './mappers/categorias.mapper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';
import { Funko } from '../funkos/entities/funko.entity';
import { NotificationsModule } from '../../websockets/notifications/notifications.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports:[
    TypeOrmModule.forFeature([Categoria]),
    TypeOrmModule.forFeature([Funko]),
    NotificationsModule,
    CacheModule.register()
  ],
  controllers: [CategoriasController],
  providers: [CategoriasService, CategoriasMapper],
  exports: []
})
export class CategoriasModule {}
