import { Module } from '@nestjs/common';
import { FunkosModule } from './rest/funkos/funkos.module';
import { CategoriasModule } from './rest/categorias/categorias.module';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from './rest/storage/storage.module';
import { NotificationsModule } from './websockets/notifications/notifications.module';
import { CacheModule } from '@nestjs/cache-manager';
import { DatabaseModule } from './config/database/database.module';
import { PedidosModule } from './rest/pedidos/pedidos.module';
import { AuthModule } from './rest/auth/auth.module';
import { UsersModule } from './rest/users/users.module';
import { CorsConfigModule } from './config/cors/cors.module';
import * as process from 'process'
@Module({
  imports: [
    ConfigModule.forRoot(
      process.env.NODE_ENV === 'dev'
        ? { envFilePath: '.env.dev' || '.env' }
        : { envFilePath: '.env.prod' },
    ),
    CorsConfigModule,
    CacheModule.register(),
    DatabaseModule,
    FunkosModule,
    CategoriasModule,
    StorageModule,
    NotificationsModule,
    DatabaseModule,
    PedidosModule,
    AuthModule,
    UsersModule,
  ],
  providers: [],
})
export class AppModule {}