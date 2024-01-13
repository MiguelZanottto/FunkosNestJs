import { INestApplication, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { CategoriasController } from "../../../src/rest/categorias/categorias.controller";
import { CategoriasService } from "../../../src/rest/categorias/categorias.service";
import { CreateCategoriaDto } from "../../../src/rest/categorias/dto/create-categoria.dto";
import { UpdateCategoriaDto } from "../../../src/rest/categorias/dto/update-categoria.dto";
import { Categoria } from "../../../src/rest/categorias/entities/categoria.entity";
import * as request from 'supertest'
import { ResponseCategoriaDto } from "../../../src/rest/categorias/dto/response-categoria.dto";
import { CacheModule } from "@nestjs/cache-manager";

describe('CategoriasController (e2e)', () => {
  let app: INestApplication;
  const myEndpoint = `/categorias`;

  const myCategoria: Categoria = {
    id: 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9',
    nombre: 'Category Test',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    funkos: []
  }

  const myResponseDto: ResponseCategoriaDto = {
    id: 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9',
    nombre: 'Category Test',
    isDeleted: false
  }

  const createCategoriaDto: CreateCategoriaDto = {
    nombre: 'Category Test'
  }

  const updateCategoriaDto: UpdateCategoriaDto = {
    nombre: 'Updated Category Test',
    isDeleted: true,
  }

  const mockCategoriasService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [CategoriasController],
      providers: [
        CategoriasService,
        { provide: CategoriasService, useValue: mockCategoriasService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  })

  describe('GET /categorias', () => {
    it('should return an array of categorias response', async () => {
      mockCategoriasService.findAll.mockResolvedValue([myResponseDto]);

      const {body} = await request(app.getHttpServer())
        .get(myEndpoint)
        .expect(200);
      expect(()=> {
      expect(body).toEqual([myCategoria])
      expect(mockCategoriasService.findAll).toHaveBeenCalled();
      });
    });
  });

  describe('GET /categorias/:id', () => {
    it("should return a single category response", async () => {
      mockCategoriasService.findOne.mockResolvedValue(myResponseDto);

      const {body} = await request(app.getHttpServer())
        .get(`${myEndpoint}/${myResponseDto.id}`)
        .expect(200)
      expect(() => {
        expect(body).toEqual(myResponseDto);
        expect(mockCategoriasService.findOne).toHaveBeenCalled();
      });
    });

    it("should throw an error if category doesn't exist", async () => {
      mockCategoriasService.findOne.mockRejectedValue(new NotFoundException());

      await request(app.getHttpServer())
        .get(`${myEndpoint}/${myResponseDto.id}`)
        .expect(404);
    })
  })

  describe('POST /categorias', () => {
    it("should create a new category", async () => {
      mockCategoriasService.create.mockResolvedValue(myResponseDto);

      const {body} = await request(app.getHttpServer())
        .post(myEndpoint)
        .send(createCategoriaDto)
        .expect(201)
      expect(() => {
        expect(body).toEqual(myResponseDto);
        expect(mockCategoriasService.create).toHaveBeenCalledWith(createCategoriaDto);
      });
    });
  });

  describe('PUT /categorias/:id', () => {
    it("should update a category", async () => {
      mockCategoriasService.update.mockResolvedValue(myResponseDto);

      const {body} = await request(app.getHttpServer())
        .put(`${myEndpoint}/${myResponseDto.id}`)
        .send(updateCategoriaDto)
        .expect(200)
      expect(() => {
        expect(body).toEqual(myResponseDto);
        expect(mockCategoriasService.update).toHaveBeenCalledWith(myResponseDto.id, updateCategoriaDto)
      })
    });

    it("should throw an error if the category doesn't exist", async () => {
      mockCategoriasService.update.mockRejectedValue(new NotFoundException());
      await request(app.getHttpServer())
        .put(`${myEndpoint}/${myResponseDto.id}`)
        .send(updateCategoriaDto)
        .expect(404);
    });
  });

  describe('DELETE /categorias/:id', () => {
    it("should remove a category", async () => {
      mockCategoriasService.remove.mockResolvedValue(myResponseDto);

      await request(app.getHttpServer())
        .delete(`${myEndpoint}/${myResponseDto.id}`)
        .expect(204)
    });

    it("should throw an error if the category doesn't exist", async () => {
      mockCategoriasService.remove.mockRejectedValue(new NotFoundException());
      await request(app.getHttpServer())
        .delete(`${myEndpoint}/${myResponseDto.id}`)
        .expect(404)
    });
  });
});