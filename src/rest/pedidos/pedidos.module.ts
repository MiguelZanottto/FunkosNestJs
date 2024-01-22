import { Module } from '@nestjs/common';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { PedidosMapper } from './mappers/pedidos.mapper';
import { MongooseModule, SchemaFactory } from '@nestjs/mongoose';
import { Pedido } from './schemas/pedido.schema';
import * as mongoosePaginate from 'mongoose-paginate-v2'
import { TypeOrmModule } from '@nestjs/typeorm';
import { Funko } from '../funkos/entities/funko.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { Usuario } from '../users/entities/user.entity';
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
    {
      name: Pedido.name,
      useFactory: () => {
        const schema = SchemaFactory.createForClass(Pedido);
        schema.plugin(mongoosePaginate);
        return schema;
      },
    },
  ]),
    TypeOrmModule.forFeature([Usuario]),
  TypeOrmModule.forFeature([Funko]),
  CacheModule.register(),
  ],
  controllers: [PedidosController],
  providers: [PedidosService, PedidosMapper],
  exports: [PedidosService]
})
export class PedidosModule {}
