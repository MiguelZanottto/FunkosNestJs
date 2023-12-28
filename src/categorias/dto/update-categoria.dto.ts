import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaDto } from './create-categoria.dto';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class UpdateCategoriaDto extends PartialType(CreateCategoriaDto) {
  @IsString()
  @IsNotEmpty()
  @Length(3, 50, {message: 'El nombre de la categoria debe tener entre 3 y 50 caracteres'})
  @IsOptional()
  nombre?: string
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean
}
