import { IsAlpha, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min } from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class CreateFunkoDto {
  @ApiProperty({
    example: 'Funko Cristiano Ronaldo',
    description: 'El nombre del funko',
    minLength: 3,
    maxLength: 50,
  })
  @IsNotEmpty({message: "El nombre no puede estar vacia"})
  @IsString({message: "El nombre solo puede ser un string"})
  @Length(3, 50, { message: 'El nombre debe tener entre 3 y 50 caracteres'})
  @Transform((nombre) => nombre.value.trim())
  nombre: string;
  @ApiProperty({
    example: 59.99,
    description: 'El precio del funko',
    minimum: 0,
  })
  @IsNumber({},{message: "El precio tiene que ser un número"})
  @Min(0, {message: "El precio no puede ser negativo"})
  precio: number;
  @ApiProperty({
    example: 20,
    description: 'La cantidad del funko',
    minimum: 0,
  })
  @Min(0, {message: "La cantidad no puede ser negativa"})
  @IsInt({message: "La cantidad solo puede ser un número entero"})
  cantidad:number;
  @ApiProperty({
    example: 'MARVEL',
    description: 'La categoría del funko',
  })
  @IsNotEmpty({message: "La categoria no puede estar vacia"})
  @IsString({message: "La categoria solo puede ser un string"})
  @Transform((categoria) => categoria.value.trim())
  categoria: string;
}





