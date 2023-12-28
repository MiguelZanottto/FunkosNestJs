import { Test, TestingModule } from '@nestjs/testing';
import { CategoriasService } from './categorias.service';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';
import { CategoriasMapper } from './mappers/categorias.mapper';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ResponseCategoriaDto } from './dto/response-categoria.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateCategoriaDto } from "./dto/create-categoria.dto";
import { UpdateCategoriaDto } from "./dto/update-categoria.dto";

describe('CategoriasService', () => {
  let service: CategoriasService;
  let repo: Repository<Categoria>;
  let mapper: CategoriasMapper;

  const categoryMapper = {
    toEntityCreate: jest.fn(),
    toEntityUpdate: jest.fn(),
    toResponseDto: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriasService,
        {provide: CategoriasMapper, useValue: categoryMapper},
        {provide: getRepositoryToken(Categoria), useClass: Repository},
      ],
    }).compile();

    service = module.get<CategoriasService>(CategoriasService);
    repo = module.get<Repository<Categoria>>(
      getRepositoryToken(Categoria),
    )
    mapper = module.get<CategoriasMapper>(CategoriasMapper);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it("should return an array of responses categories", async ()  => {
      const categories = [new Categoria(), new Categoria(), new Categoria()]
      const response = new ResponseCategoriaDto();
      jest.spyOn(repo, 'find').mockResolvedValue(categories);
      jest.spyOn(mapper, 'toResponseDto').mockReturnValue(response);

      const categoriesResult = await service.findAll()
      expect(categoriesResult.length).toBe(3)
      expect(categoriesResult[0]).toBeInstanceOf(ResponseCategoriaDto)
    });
  })

  describe('findOne', () => {
    it("should return a reponse category", async ()  => {
      const category : Categoria = new Categoria();
      category.id = 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9';
      category.nombre = 'Category Found';
      category.createdAt = new Date();
      category.updatedAt = new Date();
      category.isDeleted = false;
      category.funkos = [];

      jest.spyOn(repo, 'findOneBy').mockResolvedValue(category);

      const categoryFound : Categoria = await service.findOne('d69cf3db-b77d-4181-b3cd-5ca8107fb6a9');
      expect(categoryFound).toEqual(category);
      expect(categoryFound).toBeInstanceOf(Categoria);
    });

    it("should thrown an error if the category doesn't exist", async ()  => {
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(null);
      await expect(service.findOne('d69cf3db-b77d-4181-b3cd-5ca8107fb6a9')).rejects.toThrow(NotFoundException);
    });
  })

  describe('create', () => {
    it("should return a new category response", async ()  => {
      const createCategoryDto: CreateCategoriaDto = {
        nombre : 'New Category'
      }
      const category : Categoria = new Categoria();
      category.id = 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9';
      category.nombre = 'New Category';
      category.createdAt = new Date();
      category.updatedAt = new Date();
      category.isDeleted = false;
      category.funkos = [];

      const response: ResponseCategoriaDto = new ResponseCategoriaDto();
      response.id = 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9';
      response.nombre = 'New Category';
      response.isDeleted = false;

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      }

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      jest.spyOn(mapper, 'toEntityCreate').mockReturnValue(category)
      jest.spyOn(repo, 'save').mockResolvedValue(category);
      jest.spyOn(mapper, 'toResponseDto').mockReturnValue(response);

      const newCategory : ResponseCategoriaDto = await service.create(createCategoryDto);
      expect(newCategory).toEqual(response);
      expect(newCategory).toBeInstanceOf(ResponseCategoriaDto);
    });

    it("should thrown an error if category already exists", async ()  => {
      const createCategoryDto: CreateCategoriaDto = {
        nombre : 'New Category'
      }

      const category : Categoria = new Categoria();
      category.id = 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9';
      category.nombre = 'New Category';
      category.createdAt = new Date();
      category.updatedAt = new Date();
      category.isDeleted = false;
      category.funkos = [];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(category),
      }

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)

      await expect(service.create(createCategoryDto)).rejects.toThrow(BadRequestException)
    });
  })

  describe('update', () => {
    it("should return a category updated response", async ()  => {
      const updateCategoryDto: UpdateCategoriaDto = {
        nombre : 'Updated Category',
        isDeleted: true
      }
      const categoriaActual : Categoria = new Categoria();
      categoriaActual.id = 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9';
      categoriaActual.nombre = 'Categoria 1';
      categoriaActual.createdAt = new Date();
      categoriaActual.updatedAt = new Date();
      categoriaActual.isDeleted = false;
      categoriaActual.funkos = [];

      const result: ResponseCategoriaDto = new ResponseCategoriaDto();
      result.id = 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9';
      result.nombre = 'Updated Category';
      result.isDeleted = true;

      const categoriaActualizada: Categoria = new Categoria();
      categoriaActualizada.id = 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9';
      categoriaActualizada.nombre = 'Updated Category';
      categoriaActualizada.createdAt = categoriaActual.createdAt;
      categoriaActualizada.updatedAt = new Date();
      categoriaActual.funkos = categoriaActual.funkos;

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(categoriaActual),
      }

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(categoriaActual)
      jest.spyOn(mapper, 'toEntityUpdate').mockReturnValue(categoriaActualizada)
      jest.spyOn(repo, 'save').mockResolvedValue(categoriaActualizada);
      jest.spyOn(mapper, 'toResponseDto').mockReturnValue(result);

      const updatedCategory : ResponseCategoriaDto = await service.update('d69cf3db-b77d-4181-b3cd-5ca8107fb6a9', updateCategoryDto);
      expect(updatedCategory).toEqual(result);
      expect(updatedCategory).toBeInstanceOf(ResponseCategoriaDto);
    });


    it("should thrown an error if the id doesn't match with any category", async ()  => {
      const updateCategoryDto: UpdateCategoriaDto = {
        nombre : 'Updated Category',
        isDeleted: true
      }
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(null);
      await expect(service.update('d69cf3db-b77d-4181-b3cd-5ca8107fb6a9', updateCategoryDto)).rejects.toThrow(NotFoundException)
    });

    it("should thrown an error if the request is empty", async ()  => {
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(new Categoria());
      await expect(service.update('d69cf3db-b77d-4181-b3cd-5ca8107fb6a9', null)).rejects.toThrow(BadRequestException)
    });

    it("should thrown an error if the category's name already exist on BD", async ()  => {
      const updateCategoryDto: UpdateCategoriaDto = {
        nombre : 'Categoria Test'
      }
      const category: Categoria = new Categoria();
      category.id = 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9';
      category.nombre = 'Categoria Test';

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(category),
      }

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(category);

      await expect(service.update('569cf3db-b77d-4181-b3cd-5ca8107fb6a9', updateCategoryDto)).rejects.toThrow(BadRequestException)
    });
  })

  describe('remove', () => {
    it("should  call the remove method", async () => {
      const categoryToDelete : Categoria = new Categoria();
      categoryToDelete.id = 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9';
      categoryToDelete.nombre = 'Categoria 1';
      categoryToDelete.createdAt = new Date();
      categoryToDelete.updatedAt = new Date();
      categoryToDelete.isDeleted = false;
      categoryToDelete.funkos = [];

      const result: ResponseCategoriaDto = new ResponseCategoriaDto();
      result.id = 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9';
      result.nombre = 'Categoria 1';
      result.isDeleted = false;

      jest.spyOn(mapper, 'toResponseDto').mockReturnValue(result);
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(categoryToDelete);
      jest.spyOn(repo, 'remove').mockResolvedValue(categoryToDelete);

      expect(await service.remove('d69cf3db-b77d-4181-b3cd-5ca8107fb6a9')).toEqual(result)
    });

    it("should thown an error if the category doesn't exist", async () => {
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(null)

      await expect(service.remove('d69cf3db-b77d-4181-b3cd-5ca8107fb6a9')).rejects.toThrow(NotFoundException);
    });
  })

  describe( 'removeSoft', () => {
    it("should call the remove soft method", async () => {
      const categoryToDelete : Categoria = new Categoria();
      categoryToDelete.id = 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9';
      categoryToDelete.nombre = 'Categoria 1';
      categoryToDelete.createdAt = new Date();
      categoryToDelete.updatedAt = new Date();
      categoryToDelete.isDeleted = false;
      categoryToDelete.funkos = [];

      const result: ResponseCategoriaDto = new ResponseCategoriaDto();
      result.id = 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9';
      result.nombre = 'Categoria 1';
      result.isDeleted = true;

      jest.spyOn(mapper, 'toResponseDto').mockReturnValue(result);
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(categoryToDelete);
      jest.spyOn(repo, 'save').mockResolvedValue(categoryToDelete);

      expect(await service.removeSoft('d69cf3db-b77d-4181-b3cd-5ca8107fb6a9')).toEqual(result)
    });

    it("should thown an error if the category doesn't exist", async () => {
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(null)

      await expect(service.removeSoft('d69cf3db-b77d-4181-b3cd-5ca8107fb6a9')).rejects.toThrow(NotFoundException);
    });
  })
});
