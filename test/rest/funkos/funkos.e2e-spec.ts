import { INestApplication, NotFoundException } from "@nestjs/common";
import { FunkoResponseDto } from "../../../src/funkos/dto/response-funko.dto";
import { Categoria } from "../../../src/categorias/entities/categoria.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { FunkosService } from "../../../src/funkos/funkos.service";
import { FunkosController } from "../../../src/funkos/funkos.controller";
import * as request from 'supertest'
import { CreateFunkoDto } from "../../../src/funkos/dto/create-funko.dto";
import { UpdateFunkoDto } from "../../../src/funkos/dto/update-funko.dto";

describe('FunkosController (e2e)', () => {
  let app: INestApplication;
  const myEndpoint = `/funkos`;

  const myCategoria: Categoria = {
    id: 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9',
    nombre: 'Category Test',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    funkos: []
  }

  const funkoResponseDto: FunkoResponseDto = {
    id: 1,
    nombre: "Funko Test",
    precio: 12.99,
    cantidad: 45,
    categoria: 'Category Test',
    imagen: 'test.png',
    isDeleted: false,
  }

  const createFunkoDto: CreateFunkoDto = {
    nombre: "Funko Test",
    precio: 12.99,
    cantidad: 45,
    categoria: myCategoria.nombre,
    imagen: 'test.png'
  }

  const updateFunkoDto: UpdateFunkoDto = {
    nombre: "Updated Funk",
    precio: 34.99,
    cantidad: 90,
    imagen: 'imageupdated.png',
  }

  const mockFunkosService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [FunkosController],
      providers: [
        FunkosService,
        { provide: FunkosService, useValue: mockFunkosService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  })

  describe(`GET /funkos`, () => {
    it("should return an array of funks response", async () => {
      mockFunkosService.findAll.mockResolvedValue([funkoResponseDto])

      const {body} = await request(app.getHttpServer())
        .get(myEndpoint)
        .expect(200)
      expect(() => {
        expect(body).toEqual([funkoResponseDto]);
        expect(mockFunkosService.findAll).toHaveBeenCalled();
      })
    });
  })

  describe('GET /funkos/:id', () => {
    it("should return a single funk response", async () => {
      mockFunkosService.findOne.mockResolvedValue(funkoResponseDto)

      const {body} = await request(app.getHttpServer())
        .get(`${myEndpoint}/${funkoResponseDto.id}`)
        .expect(200)
      expect(() => {
        expect(body).toEqual(funkoResponseDto);
        expect(mockFunkosService.findOne).toHaveBeenCalled();
      })
    })

    it("should throw an error if the funk doesn't exist", async () => {
      mockFunkosService.findOne.mockRejectedValue(new NotFoundException());

      await request(app.getHttpServer())
        .get(`${myEndpoint}/${funkoResponseDto.id}`)
        .expect(404)
    });
  });

  describe('POST /funkos', () => {
    it("should create a new funk", async () => {
      mockFunkosService.create.mockResolvedValue(funkoResponseDto)

      const {body} = await request(app.getHttpServer())
        .post(myEndpoint)
        .send(createFunkoDto)
        .expect(201)
      expect(() => {
        expect(body).toEqual(funkoResponseDto);
        expect(mockFunkosService.create).toHaveBeenCalledWith(createFunkoDto);
      });
    });
  });

  describe('PUT /funkos/:id', () => {
    it("should update a funk", async () => {
      mockFunkosService.update.mockResolvedValue(funkoResponseDto);

      const {body} = await request(app.getHttpServer())
        .put(`${myEndpoint}/${funkoResponseDto.id}`)
        .send(updateFunkoDto)
        .expect(200);
      expect(() => {
        expect(body).toEqual(funkoResponseDto);
        expect(mockFunkosService.update).toHaveBeenCalledWith(funkoResponseDto.id, updateFunkoDto);
      });
    });

    it("should thrown an error if the funk doesn't exist", async () => {
      mockFunkosService.update.mockRejectedValue(new NotFoundException());
      await request(app.getHttpServer())
        .put(`${myEndpoint}/${funkoResponseDto.id}`)
        .send(updateFunkoDto)
        .expect(404);
    });
  });

  describe('DELETE /funkos/:id', () => {
    it("should remove a category", async () => {
      mockFunkosService.remove.mockResolvedValue(funkoResponseDto);

      await request(app.getHttpServer())
        .delete(`${myEndpoint}/${funkoResponseDto.id}`)
        .expect(204);
    });

    it("should throw an error if the funk doesn't exist", async () => {
      mockFunkosService.remove.mockRejectedValue(new NotFoundException());
      await request(app.getHttpServer())
        .delete(`${myEndpoint}/${funkoResponseDto.id}`)
        .expect(404);
    });
  });
});