import { Test, TestingModule } from "@nestjs/testing";
import { CategoriasMapper } from "./categorias.mapper";
import { CreateCategoriaDto } from "../dto/create-categoria.dto";
import { Categoria } from "../entities/categoria.entity";
import { UpdateCategoriaDto } from "../dto/update-categoria.dto";
import { ResponseCategoriaDto } from "../dto/response-categoria.dto";


describe('CategoriasMapper', () => {
  let provider: CategoriasMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriasMapper],
    }).compile()

    provider = module.get<CategoriasMapper>(CategoriasMapper)
  })

  it("should be defined", () => {
    expect(provider).toBeDefined()
  });

  describe('CategoriasMapper', () => {
    let categoriasMapper: CategoriasMapper

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [CategoriasMapper],
      }).compile()

      categoriasMapper = module.get<CategoriasMapper>(CategoriasMapper)
    })

    it ('should be defined', () => {
      expect(categoriasMapper).toBeDefined()
    })

    it("should map CreateCategoriaDto to Categoria", () => {
      const createCategoriaDto: CreateCategoriaDto = {
        nombre: 'CreateCategoria Test'
      }

      const actualCategoria: Categoria = categoriasMapper.toEntityCreate(createCategoriaDto);

      expect(actualCategoria.nombre).toEqual(createCategoriaDto.nombre.toUpperCase())
      expect(actualCategoria.id).toBeUndefined()
      expect(actualCategoria.createdAt).toBeDefined()
      expect(actualCategoria.updatedAt).toBeDefined()
      expect(actualCategoria.isDeleted).toBeFalsy()
    });

    it("should map UpdateCategoriaDto to Categoria", () => {
      const updateCategoriaDto: UpdateCategoriaDto = {
        nombre: 'Updated Category',
        isDeleted: true,
      }

      const categoriaToUpdate : Categoria = {
        id: 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9',
        nombre: 'CreateCategoria Test'.toUpperCase(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        funkos: []
      }

      const actualCategoria: Categoria = categoriasMapper.toEntityUpdate(updateCategoriaDto, categoriaToUpdate);

      expect(actualCategoria.nombre).toEqual(updateCategoriaDto.nombre.toUpperCase())
      expect(actualCategoria.id).toEqual(categoriaToUpdate.id)
      expect(actualCategoria.createdAt).toEqual(categoriaToUpdate.createdAt)
      expect(actualCategoria.updatedAt).toBeDefined()
      expect(actualCategoria.isDeleted).toEqual(updateCategoriaDto.isDeleted)
    });

    it("should map Categoria to ReponseCategoriaDto", () => {
      const categoria : Categoria = {
        id: 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9',
        nombre: 'RESPONSE TEST',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        funkos: []
      }

      const actualResponse: ResponseCategoriaDto = categoriasMapper.toResponseDto(categoria)

      expect(actualResponse.id).toEqual(categoria.id)
      expect(actualResponse.nombre).toEqual(categoria.nombre)
      expect(actualResponse.isDeleted).toEqual(categoria.isDeleted)
    });
  });
});