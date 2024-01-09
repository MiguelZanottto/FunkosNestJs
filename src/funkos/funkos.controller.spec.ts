import { Test, TestingModule } from '@nestjs/testing';
import { FunkosController } from './funkos.controller';
import { FunkosService } from './funkos.service';
import { FunkoResponseDto } from './dto/response-funko.dto';
import { NotFoundException } from '@nestjs/common';
import { CreateFunkoDto } from './dto/create-funko.dto';
import { UpdateFunkoDto } from './dto/update-funko.dto';

describe('FunkosController', () => {
  let controller: FunkosController;
  let service: FunkosService;

  const funkosServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateImage: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FunkosController],
      providers: [
        {provide: FunkosService, useValue: funkosServiceMock},
      ],
    }).compile();

    controller = module.get<FunkosController>(FunkosController);
    service = module.get<FunkosService>(FunkosService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a response of all funks', async () => {
      const expectedResult : FunkoResponseDto[] = [new FunkoResponseDto(), new FunkoResponseDto()];

      jest.spyOn(service, 'findAll').mockResolvedValue(expectedResult);

      const actualResult = await controller.findAll();
      expect(actualResult).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalled();
    });
  })

  describe('findOne', () => {
    it('should return a response of a funk', async () => {
      const expectedResult : FunkoResponseDto = new FunkoResponseDto();

      jest.spyOn(service, 'findOne').mockResolvedValue(expectedResult);

      const actualResult = await controller.findOne(1);
      expect(actualResult).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalled();
    });

    it("should throw an error if funk doesn't exist", async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());
      await expect(controller.findOne(1)).rejects.toThrow(NotFoundException);
    });
  })

  describe('create', () => {
    it('should create a new funk', async () => {
      const createFunkoDto: CreateFunkoDto = {
        nombre: 'test',
        precio: 100,
        cantidad: 10,
        categoria: 'test',
      }
      const expectedResult : FunkoResponseDto = new FunkoResponseDto();

      jest.spyOn(service, 'create').mockResolvedValue(expectedResult);

      const actualResult = await controller.create(createFunkoDto);
      expect(actualResult).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createFunkoDto);
      expect(actualResult).toBeInstanceOf(FunkoResponseDto);
    })
  })

  describe('update', () => {
    it('should update a funk', async () => {
      const updateFunkoDto: UpdateFunkoDto = {
        nombre: 'test',
        precio: 100,
        cantidad: 10,
        categoria: 'test',
      }
      const expectedResult : FunkoResponseDto = new FunkoResponseDto();

      jest.spyOn(service, 'update').mockResolvedValue(expectedResult);

      const actualResult = await controller.update(1, updateFunkoDto);
      expect(actualResult).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(1, updateFunkoDto);
      expect(actualResult).toBeInstanceOf(FunkoResponseDto);
    })

    it("should throw an error if funk doesn't exist", () => {
      jest.spyOn(service,'remove').mockRejectedValue(new NotFoundException());
      expect(controller.remove(1)).rejects.toThrow(NotFoundException);
    });
  })

  describe('remove', () => {
    it('should remove a funk', async () => {
      const expectedResult : FunkoResponseDto = new FunkoResponseDto();

      jest.spyOn(service,'remove').mockResolvedValue(expectedResult);

      await controller.remove(1);
      expect(service.remove).toHaveBeenCalledWith(1);
    })

    it("should thrown an error if funk doesn`t exist", async () => {
      jest.spyOn(service,'remove').mockRejectedValue(new NotFoundException());
      await expect(controller.remove(1)).rejects.toThrow(NotFoundException);
    });
  })

    describe('updateImage', () => {
      it('should update a funk image', async () => {
        const mockId = 1;
        const mockFile = {} as Express.Multer.File;
        const mockResult: FunkoResponseDto = new FunkoResponseDto();

        jest.spyOn(service, 'updateImage').mockResolvedValue(mockResult);

        await controller.updateImage(mockId, mockFile);
        expect(service.updateImage).toHaveBeenCalledWith(
          mockId,
          mockFile
        )
        expect(mockResult).toBeInstanceOf(FunkoResponseDto)
      })
    })
});
