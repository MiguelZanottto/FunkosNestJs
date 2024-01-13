import { CreateCategoriaDto } from "../dto/create-categoria.dto";
import { ResponseCategoriaDto } from "../dto/response-categoria.dto";
import { UpdateCategoriaDto } from "../dto/update-categoria.dto";
import { Categoria } from "../entities/categoria.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CategoriasMapper{

  toEntityCreate(
    createCategoriaDto: CreateCategoriaDto,
  ): Categoria {
    const categoria = new Categoria();
    categoria.nombre = createCategoriaDto.nombre.toUpperCase();
    categoria.createdAt = new Date();
    categoria.updatedAt = new Date();
    categoria.isDeleted = false;
    return categoria;
  }

  toEntityUpdate(updateCategoriaDto: UpdateCategoriaDto, categoriaActual : Categoria): Categoria {
    categoriaActual.nombre = updateCategoriaDto.nombre != null? updateCategoriaDto.nombre.toUpperCase() : categoriaActual.nombre;
    categoriaActual.isDeleted = updateCategoriaDto.isDeleted!= null? updateCategoriaDto.isDeleted : categoriaActual.isDeleted;
    categoriaActual.updatedAt = new Date();
    return categoriaActual;
  }

  toResponseDto(categoria: Categoria): ResponseCategoriaDto {
    const response = new ResponseCategoriaDto();
    response.id = categoria.id;
    response.nombre = categoria.nombre;
    response.isDeleted = categoria.isDeleted;
    return response;
  }
}
