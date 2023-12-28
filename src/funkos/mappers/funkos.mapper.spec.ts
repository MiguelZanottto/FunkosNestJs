import { Test, TestingModule } from "@nestjs/testing";
import { Categoria } from "../../categorias/entities/categoria.entity";
import { CreateFunkoDto } from "../dto/create-funko.dto";
import { UpdateFunkoDto } from "../dto/update-funko.dto";
import { Funko } from "../entities/funko.entity";
import { FunkosMapper } from "./funkos.mapper";
import { FunkoResponseDto } from "../dto/response-funko.dto";

describe('FunkosMapper', () => {
  let funkosMapper: FunkosMapper;

  const categoria : Categoria = {
    id: 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9',
    nombre: 'CATEGORIA 1',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    funkos: []
  }

  const createFunkoDto: CreateFunkoDto = {
    nombre: 'Funko Test',
    precio: 19.99,
    cantidad: 10,
    imagen: 'cristianoronaldo.es',
    categoria: categoria.nombre,
  }

  const updateFunkoDto: UpdateFunkoDto = {
    nombre: 'Funko Actualizado',
    precio: 29.99,
    cantidad: 15,
    imagen: 'lionelmessi.es'
  }

  const funko: Funko = {
    id: 1,
    nombre: 'Funko Test',
    precio: 19.99,
    cantidad: 10,
    imagen: 'cristianoronaldo.es',
    createdAt: new Date(),
    updatedAt: new Date(),
    categoria: categoria,
    isDeleted: false,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
        providers: [FunkosMapper]
      }).compile()

    funkosMapper = module.get<FunkosMapper>(FunkosMapper);
  })

  it("should be defined", () => {
    expect(funkosMapper).toBeDefined();
  });

  it("should map CreateFunkoDto to Funko", () => {
    const actualFunko: Funko = funkosMapper.toCreateEntity(createFunkoDto, categoria);

    expect(actualFunko).toBeInstanceOf(Funko);
    expect(actualFunko.id).toBeUndefined()
    expect(actualFunko.nombre).toEqual(createFunkoDto.nombre);
    expect(actualFunko.precio).toEqual(createFunkoDto.precio);
    expect(actualFunko.cantidad).toEqual(createFunkoDto.cantidad);
    expect(actualFunko.imagen).toEqual(createFunkoDto.imagen);
    expect(actualFunko.createdAt).toBeDefined();
    expect(actualFunko.updatedAt).toBeDefined();
    expect(actualFunko.categoria).toEqual(categoria);
    expect(actualFunko.isDeleted).toBeFalsy();
  });

  it("should map UpdateFunkoDto to Funko", () => {
    const actualFunko: Funko = funkosMapper.toUpdateEntity(funko, updateFunkoDto, categoria)

    expect(actualFunko).toBeInstanceOf(Funko);
    expect(actualFunko.id).toEqual(funko.id)
    expect(actualFunko.nombre).toEqual(updateFunkoDto.nombre);
    expect(actualFunko.precio).toEqual(updateFunkoDto.precio);
    expect(actualFunko.cantidad).toEqual(updateFunkoDto.cantidad);
    expect(actualFunko.imagen).toEqual(updateFunkoDto.imagen);
    expect(actualFunko.createdAt).toEqual(funko.createdAt);
    expect(actualFunko.updatedAt).toBeDefined();
    expect(actualFunko.categoria).toEqual(categoria);
    expect(actualFunko.isDeleted).toEqual(funko.isDeleted)
  });

  it("should map Funko to FunkoResponseDto", () => {
    const actualResponse: FunkoResponseDto = funkosMapper.toResponseDto(funko);

    expect(actualResponse).toBeInstanceOf(FunkoResponseDto);
    expect(actualResponse.id).toEqual(funko.id)
    expect(actualResponse.nombre).toEqual(funko.nombre);
    expect(actualResponse.precio).toEqual(funko.precio);
    expect(actualResponse.cantidad).toEqual(funko.cantidad);
    expect(actualResponse.imagen).toEqual(funko.imagen);
    expect(actualResponse.categoria).toEqual(funko.categoria.nombre);
    expect(actualResponse.isDeleted).toEqual(funko.isDeleted)
  });
})











