import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserSignUpDto } from './dto/user-sign.up.dto';
import { UserSignInDto } from './dto/user-sign.in.dto';
import { ApiBadRequestResponse, ApiBody, ApiExcludeEndpoint, ApiInternalServerErrorResponse, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiExcludeEndpoint()
  async signUp(@Body() userSignUpDto: UserSignUpDto) {
    this.logger.log(`signup ${JSON.stringify(userSignUpDto)}`)
    return await this.authService.signUp(userSignUpDto);
  }

 @Post('signin')
 @ApiResponse({
   status: 200,
   description:
     'El usuario se ha logueado correctamente devolviendo el token de acceso',
   type: String,
 })
 @ApiBody({
   description: 'Credenciales de acceso',
   type: UserSignInDto,
 })
 @ApiInternalServerErrorResponse({
   description: 'Error interno de la api en bases de datos',
 })
 @ApiBadRequestResponse({
   description: 'Error en los datos de entrada',
 })
  async signIn(@Body() userSignInDto: UserSignInDto){
    this.logger.log(`signin ${JSON.stringify(userSignInDto)}`)
    return await this.authService.signIn(userSignInDto);
  }
}
