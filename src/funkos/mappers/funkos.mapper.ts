import { Injectable } from "@nestjs/common";
import { CreateFunkoDto } from "../dto/create-funko.dto";

import { FunkoResponseDto } from "../dto/response-funko.dto";
import { Funko } from "../entities/funko.entity";
import { UpdateFunkoDto } from "../dto/update-funko.dto";
import { Categoria } from "src/categorias/entities/categoria.entity";

@Injectable()
export class FunkosMapper{

  toCreateEntity(createFunkosDto : CreateFunkoDto,
                 categoria : Categoria): Funko {
      const funko = new Funko();
      funko.nombre = createFunkosDto.nombre;
      funko.precio = createFunkosDto.precio;
      funko.cantidad = createFunkosDto.cantidad;
      funko.imagen = Funko.IMAGE_DEFAULT;
      funko.createdAt = new Date();
      funko.updatedAt = new Date();
      funko.isDeleted = false;
      funko.categoria = categoria;
      return funko;
  }

  toUpdateEntity(funkoActual : Funko, updateFunkosDto : UpdateFunkoDto, categoria : Categoria): Funko {
    const funko = new Funko();
    funko.id = funkoActual.id;
    funko.nombre = updateFunkosDto.nombre || funkoActual.nombre;
    funko.precio = updateFunkosDto.precio || funkoActual.precio;
    funko.cantidad = updateFunkosDto.cantidad || funkoActual.cantidad;
    funko.imagen = funkoActual.imagen;
    funko.createdAt = funkoActual.createdAt;
    funko.updatedAt = new Date();
    funko.isDeleted = updateFunkosDto.isDeleted != null ? updateFunkosDto.isDeleted : funkoActual.isDeleted;
    funko.categoria = categoria;
    return funko;
  }

  toResponseDto(funko: Funko): FunkoResponseDto{
    const response : FunkoResponseDto = new FunkoResponseDto();
    response.id = funko.id;
    response.nombre = funko.nombre;
    if (funko.categoria && funko.categoria.nombre) {
      response.categoria = funko.categoria.nombre
    } else {
      response.categoria = null
    }
    response.precio = funko.precio;
    response.cantidad = funko.cantidad;
    response.imagen = funko.imagen == Funko.IMAGE_DEFAULT
      ? funko.imagen
      : `${process.env.API_PROTOCOL || 'http'}://${process.env.API_HOST || 'localhost'}:${process.env.API_PORT || '3000'}/${process.env.API_VERSION || 'v1'}/storage/${funko.imagen}`;
    response.isDeleted = funko.isDeleted;
    return response
    }
  }




