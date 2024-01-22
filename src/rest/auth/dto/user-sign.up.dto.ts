import { IsEmail, IsNotEmpty, IsString, Matches } from "class-validator";

export class UserSignUpDto{
  @IsNotEmpty({message:'El nombre no puede estar vacio'})
  @IsString({message:'El nombre no es valido'})
  nombre: string;

  @IsNotEmpty({message:'El apellido no puede estar vacio'})
  @IsString({message:'El apellido no es valido'})
  apellidos: string

  @IsNotEmpty({message:'El username no puede estar vacio'})
  @IsString({message:'El username no es valido'})
  username: string

  @IsEmail({}, {message:'El email no es valido'})
  @IsNotEmpty({message:'El email no puede estar vacio'})
  email: string

  @IsString({ message: 'La contraseña no es válida' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
    message:
      'Contraseña invalida, debe contener al menos 8 caracteres, una mayúscula, una minúscula y un número',
  })
  password: string
}