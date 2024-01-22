import { ApiProperty } from "@nestjs/swagger";

export class FunkoResponseDto {
  @ApiProperty({ example: 1, description: 'ID del funko' })
  id:number;
  @ApiProperty({ example: 'Funko Cristiano Ronaldo', description: 'Nombre del funko' })
  nombre: string;
  @ApiProperty({ example: 59.99, description: 'Precio del funko' })
  precio: number;
  @ApiProperty({ example: 20, description: 'Cantidad disponible en stock del funko' })
  cantidad: number;
  @ApiProperty({ example: 'MARVEL', description: 'Categoría del funko' })
  categoria: string;
  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'URL de la imagen del funko',
  })
  imagen: string;
  @ApiProperty({
    example: false,
    description: 'Indica si el funko ha sido eliminado',
  })
  isDeleted: boolean;
}