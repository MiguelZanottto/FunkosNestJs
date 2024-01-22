import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { getSSLOptions } from './config/ssl/ssl.config';
import { setupSwagger } from './config/swagger/swagger.config';
import * as dotenv from 'dotenv'
import * as process from 'process'

dotenv.config()
async function bootstrap() {
  if (process.env.NODE_ENV === 'dev') {
    console.log('🛠️ Iniciando Nestjs Modo desarrollo 🛠️')
  } else {
    console.log('🚗 Iniciando Nestjs Modo producción 🚗')
  }
  const httpsOptions = getSSLOptions();
  const app = await NestFactory.create(AppModule,  { httpsOptions });
  app.setGlobalPrefix(process.env.API_VERSION || 'v1')
  if (process.env.NODE_ENV === 'dev') {
    setupSwagger(app)
  }
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(process.env.API_PORT || 3000);
}
bootstrap().then(() =>
  console.log(
    `🟢 Servidor escuchando en puerto: ${
      process.env.API_PORT || 3000
    } y perfil: ${process.env.NODE_ENV} 🚀`,
  ),
)
