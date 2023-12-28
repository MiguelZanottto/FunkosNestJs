import { PartialType } from '@nestjs/mapped-types';
import { CreateFunkoDto } from './create-funko.dto';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateFunkoDto extends PartialType(CreateFunkoDto) {
  @IsNotEmpty({message: "El nombre no puede estar vacia"})
  @IsString({message: "El nombre solo puede ser un string"})
  @Length(3, 50, { message: 'El nombre debe tener entre 3 y 50 caracteres'})
  @Transform((nombre) => nombre.value.trim())
  @IsOptional()
  nombre?: string;
  @IsNumber({},{message: "El precio tiene que ser un número"})
  @Min(0, {message: "El precio no puede ser negativo"})
  @IsOptional()
  precio?: number;
  @Min(0, {message: "La cantidad no puede ser negativa"})
  @IsInt({message: "La cantidad solo puede ser un número entero"})
  @IsOptional()
  cantidad?:number;
  @IsOptional()
  @IsString({message: "La imagen solo puede ser un string"})
  imagen?: string;
  @IsNotEmpty({message: "La categoria no puede estar vacia"})
  @IsString({message: "La categoria solo puede ser un string"})
  @Transform((categoria) => categoria.value.trim())
  @IsOptional()
  categoria?: string;
  @IsOptional()
  @IsBoolean({message: "La variable isDeleted solo puede ser un booleano"})
  isDeleted?: boolean
}
