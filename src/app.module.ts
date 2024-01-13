import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FunkosModule } from './rest/funkos/funkos.module';
import { CategoriasModule } from './rest/categorias/categorias.module';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from './rest/storage/storage.module';
import { NotificationsModule } from './websockets/notifications/notifications.module';
import { CacheModule } from '@nestjs/cache-manager';
import { DatabaseModule } from './config/database/database.module';
import { PedidosModule } from './rest/pedidos/pedidos.module';

@Module({
  imports: [
    CacheModule.register(),
    ConfigModule.forRoot(),
    DatabaseModule,
    FunkosModule,
    CategoriasModule,
    StorageModule,
    NotificationsModule,
    DatabaseModule,
    PedidosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}