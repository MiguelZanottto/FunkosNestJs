import { IsNotEmpty, IsString } from "class-validator"

export class UserSignInDto {
  @IsNotEmpty({message: 'El nombre de usuario no puede estar vacio'})
  username: string
  @IsString({message: 'La contraseña no es valida'})
  @IsNotEmpty({message: 'La contraseña no puede estar vacia'})
  password: string
}
