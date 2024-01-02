import { IsAlpha, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min } from "class-validator";
import { Transform } from "class-transformer";

export class CreateFunkoDto {
  @IsNotEmpty({message: "El nombre no puede estar vacia"})
  @IsString({message: "El nombre solo puede ser un string"})
  @Length(3, 50, { message: 'El nombre debe tener entre 3 y 50 caracteres'})
  @Transform((nombre) => nombre.value.trim())
  nombre: string;
  @IsNumber({},{message: "El precio tiene que ser un número"})
  @Min(0, {message: "El precio no puede ser negativo"})
  precio: number;
  @Min(0, {message: "La cantidad no puede ser negativa"})
  @IsInt({message: "La cantidad solo puede ser un número entero"})
  cantidad:number;
  @IsOptional()
  @IsString({message: "La imagen solo puede ser un string"})
  imagen?: string;
  @IsNotEmpty({message: "La categoria no puede estar vacia"})
  @IsString({message: "La categoria solo puede ser un string"})
  @Transform((categoria) => categoria.value.trim())
  categoria: string;
}





