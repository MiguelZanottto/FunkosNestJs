import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as process from 'process'
import { AuthMapper } from './mappers/usuarios.mapper';
import { JwtAuthStrategy } from './strategies/jwt-strategy';
import { UsersModule } from '../users/users.module';
@Module({
  imports:[
    JwtModule.register({
      secret: Buffer.from(
        process.env.TOKEN_SECRET ||
        'Me_Gustan_Los_Pepinos_De_Leganes_Porque_Son_Grandes_Y_Hermosos',
        'utf-8',
      ).toString('base64'),
      signOptions: {
        expiresIn: Number(process.env.TOKEN_EXPIRATION) || 3600,
        algorithm: 'HS512',
      },
    }),
    PassportModule.register({defaultStrategy: 'jwt'}),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthMapper, JwtAuthStrategy],
})
export class AuthModule {}
