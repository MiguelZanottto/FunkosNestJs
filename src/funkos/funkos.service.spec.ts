import { Test, TestingModule } from '@nestjs/testing';
import { FunkosService } from './funkos.service';
import { Repository } from 'typeorm';
import { Funko } from './entities/funko.entity';
import { Categoria } from '../categorias/entities/categoria.entity';
import { FunkosMapper } from './mappers/funkos.mapper';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FunkoResponseDto } from './dto/response-funko.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateFunkoDto } from './dto/create-funko.dto';
import { UpdateFunkoDto } from './dto/update-funko.dto';
import { StorageService } from '../storage/storage.service';
import { NotificationsGateway } from '../websockets/notifications/notifications.gateway';

describe('FunkosService', () => {
  let service: FunkosService;
  let funkosRepository: Repository<Funko>;
  let categoriaRepository: Repository<Categoria>;
  let mapper: FunkosMapper;
  let storageService: StorageService;
  let notificationsGateway: NotificationsGateway;

  const funkoMapperMock = {
    toCreateEntity: jest.fn(),
    toUpdateEntity: jest.fn(),
    toResponseDto: jest.fn(),
  }

  const storageServiceMock = {
    removeFile: jest.fn(),
  }

  const notificationsGatewayMock = {
    sendMessage: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FunkosService,
        {provide: getRepositoryToken(Funko), useClass: Repository},
        {provide: getRepositoryToken(Categoria), useClass: Repository},
        {provide: FunkosMapper, useValue: funkoMapperMock},
        {provide: StorageService, useValue: storageServiceMock},
        {provide: NotificationsGateway, useValue: notificationsGatewayMock}
      ],
    }).compile();

    service = module.get<FunkosService>(FunkosService);
    funkosRepository = module.get(getRepositoryToken(Funko));
    categoriaRepository = module.get(getRepositoryToken(Categoria));
    mapper = module.get<FunkosMapper>(FunkosMapper);
    storageService = module.get<StorageService>(StorageService);
    notificationsGateway = module.get<NotificationsGateway>(
      NotificationsGateway
    )
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of funkos response', async () => {
      const response: FunkoResponseDto = new FunkoResponseDto();
      const result: FunkoResponseDto[] = [new FunkoResponseDto(), new FunkoResponseDto()];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(result),
      }

      jest
        .spyOn(funkosRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      jest.spyOn(mapper, 'toResponseDto').mockReturnValue(response);

    expect(await service.findAll()).toEqual(result)
    })
  })

  describe('findOne', () => {
    it('should retrieve a funk by id', async () => {
      const result = new Funko();
      const resultDto = new FunkoResponseDto();
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(result),
      }
      jest
        .spyOn(funkosRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)

      jest.spyOn(mapper, 'toResponseDto').mockReturnValue(resultDto)

      expect(await service.findOne(1)).toEqual(resultDto);
      expect(mapper.toResponseDto).toHaveBeenCalled()
    })

    it("should throw an error if the funk doesn't exist", async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }
      jest
        .spyOn(funkosRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  })

  describe('create',() => {
    it("should create a new funko response", async () => {
      const categoria: Categoria = new Categoria();
      const funk: Funko = new Funko();
      const funkCreateDto: CreateFunkoDto = new CreateFunkoDto();
      const resultDto: FunkoResponseDto = new FunkoResponseDto();
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(categoria),
      }
      jest
        .spyOn(categoriaRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      jest.spyOn(mapper, 'toCreateEntity').mockReturnValue(funk)
      jest.spyOn(mapper, 'toResponseDto').mockReturnValue(resultDto)
      jest.spyOn(funkosRepository, 'save').mockResolvedValue(funk);

      expect(await service.create(funkCreateDto)).toEqual(resultDto)
      expect(mapper.toCreateEntity).toHaveBeenCalled()
      expect(funkosRepository.save).toHaveBeenCalled()
      expect(mapper.toResponseDto).toHaveBeenCalled()
    })

    it("should throw an error if category doesn't exist", async () => {
      const funkCreateDto: CreateFunkoDto = new CreateFunkoDto();
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      }
      jest
        .spyOn(categoriaRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)

      await expect(service.create(funkCreateDto)).rejects.toThrow(BadRequestException);
    })
  })

  describe('update', () => {
    it("should update an exist funk with an update request", async () => {
      const funkUpdateDto: UpdateFunkoDto = new UpdateFunkoDto();
      funkUpdateDto.nombre = "Funk Updated";
      funkUpdateDto.cantidad = 10;
      funkUpdateDto.precio = 29.99;
      const actualFunk: Funko = new Funko();
      const updatedFunk: Funko = new Funko();
      const result: FunkoResponseDto = new FunkoResponseDto();

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(actualFunk),
      }
      jest
        .spyOn(funkosRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      jest.spyOn(mapper, 'toUpdateEntity').mockReturnValue(updatedFunk);
      jest.spyOn(funkosRepository, 'save').mockResolvedValue(updatedFunk);
      jest.spyOn(mapper, 'toResponseDto').mockReturnValue(result);

      expect(await service.update(1, funkUpdateDto)).toEqual(result);
      expect(mapper.toResponseDto).toHaveBeenCalled();
      expect(mapper.toUpdateEntity).toHaveBeenCalled();
      expect(funkosRepository.save).toHaveBeenCalled();
    })


    it("should throw an error if doesn't exist any Funk by id", async () => {
      const funkUpdateDto: UpdateFunkoDto = new UpdateFunkoDto();
      funkUpdateDto.isDeleted = true;

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }
      jest
        .spyOn(funkosRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)

      await expect(service.update(1, funkUpdateDto)).rejects.toThrow(NotFoundException)
    })
  })

  describe('remove', () => {
    it("should call the remove method", async () => {
      const funkToDelete: Funko = new Funko();
      const result: FunkoResponseDto = new FunkoResponseDto();
      result.id = 1;
      result.isDeleted = true;

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(funkToDelete),
      }
      jest
        .spyOn(funkosRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      jest.spyOn(funkosRepository, 'remove').mockResolvedValue(funkToDelete);
      jest.spyOn(funkoMapperMock, 'toResponseDto').mockReturnValue(result);

      expect(await service.remove(1)).toEqual(result);
      expect(funkosRepository.remove).toHaveBeenCalledTimes(1);
      expect(funkoMapperMock.toResponseDto).toHaveBeenCalled();
    })

    it("should throw an error if funkoToDelete doesn't exist", async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }
      jest
        .spyOn(funkosRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    })
  })

  describe('removeSoft', () => {
    it("should call the remove soft method", async () => {
      const funkToDelete: Funko = new Funko();
      const expectedResult: FunkoResponseDto = new FunkoResponseDto();
      expectedResult.isDeleted = true;

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(funkToDelete),
      }
      jest
        .spyOn(funkosRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      jest.spyOn(funkosRepository, 'save').mockResolvedValue(funkToDelete);
      jest.spyOn(funkoMapperMock, 'toResponseDto').mockReturnValue(expectedResult);

      const actualResult = await service.removeSoft(1);

      expect(actualResult.isDeleted).toBeTruthy();
      expect(funkosRepository.save).toHaveBeenCalled()
      expect(funkoMapperMock.toResponseDto).toHaveBeenCalled()
    })

    it("should throw an error if funkoToDelete doesn't exist", async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }
      jest
        .spyOn(funkosRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    })
  })

  describe('updateImage', () => {
    it("should update a funk image", async () => {
      const mockFile = {
        filename: 'new_image',
      }
      const mockFunk = new Funko();
      const mockResponseDto = new FunkoResponseDto();

      jest.spyOn(service, 'exists').mockResolvedValue(mockFunk);

      jest
        .spyOn(funkosRepository, 'save')
        .mockResolvedValue(mockFunk)

      jest
        .spyOn(mapper, 'toResponseDto')
        .mockReturnValue(mockResponseDto)

      expect(
        await service.updateImage(1, mockFile as any)
      ).toEqual(mockResponseDto)
      expect(storageService.removeFile).toHaveBeenCalled()
    });
  })
});
