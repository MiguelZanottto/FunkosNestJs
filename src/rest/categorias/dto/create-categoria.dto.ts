import { Transform } from "class-transformer"
import { IsNotEmpty, IsString, Length } from "class-validator"

export class CreateCategoriaDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 50, {message: 'El nombre de la categoria debe tener entre 3 y 50 caracteres'})
  @Transform((nombre) => nombre.value.trim())
  nombre: string
}
