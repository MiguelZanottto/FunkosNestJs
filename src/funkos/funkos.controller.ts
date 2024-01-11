import { Controller, Get, Post, Body, Param, Delete, HttpCode, Logger, Put, Req, UploadedFile, ParseIntPipe, BadRequestException, UseInterceptors, Patch, UseGuards} from '@nestjs/common';
import { FunkosService } from './funkos.service';
import { CreateFunkoDto } from './dto/create-funko.dto';
import { UpdateFunkoDto } from './dto/update-funko.dto';
import { NumericIdValidatorPipe } from '../pipes/validations/numeric-id-validator/numeric-id-validator.pipe';
import { BodyNotEmptyValidatorPipe } from '../pipes/validations/body-not-empty-validator/body-not-empty-validator.pipe';
import { extname, parse } from 'path';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';
import { FunkoExistsGuard } from './guards/funko-exists.guard';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';

@Controller('funkos')
@UseInterceptors(CacheInterceptor)
export class FunkosController {
  private readonly logger: Logger = new Logger(FunkosController.name);

  constructor(private readonly funkosService: FunkosService) {}

  @Get()
  @CacheKey('all_funks')
  @CacheTTL(30000)
  @HttpCode(200)
  async findAll() {
    this.logger.log(`Searching all funks`)
    return await this.funkosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', new NumericIdValidatorPipe()) id: number) {
    this.logger.log(`Searching funk by id: ${id}`)
    return await this.funkosService.findOne(id);
  }

  @Post()
  @HttpCode(201)
  async create(@Body() createFunkoDto: CreateFunkoDto) {
    this.logger.log(`Creating funk`)
    return await this.funkosService.create(createFunkoDto);
  }

  @Put(':id')
  async update(@Param('id', new NumericIdValidatorPipe()) id: number, @Body(new BodyNotEmptyValidatorPipe()) updateFunkoDto: UpdateFunkoDto) {
    this.logger.log(`Updating funk by id: ${id}`);
    return await this.funkosService.update(id, updateFunkoDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', new NumericIdValidatorPipe()) id: number) {
    this.logger.log(`Deleting funk by id: ${id}`)
    return await this.funkosService.remove(id);
  }

  @Patch('/imagen/:id')
  @UseGuards(FunkoExistsGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOADS_DIR || './storage-dir',
        filename: (req, file, cb) => {
          const { name } = parse(file.originalname)
          const uuid = uuidv4();
          const fileName = `${uuid}_${name.replace(/\s/g, '')}`
          const fileExt = extname(file.originalname)
          cb(null, `${fileName}${fileExt}`)
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif']
        const maxFileSize = 1024 * 1024 // 1 megabyte
        if (!allowedMimes.includes(file.mimetype)) {
          cb(
            new BadRequestException(
              'Fichero no soportado. No es del tipo imagen válido',
            ),
            false,
          )
        } else if (file.size > maxFileSize) {
          cb(
            new BadRequestException(
              'El tamaño del archivo no puede ser mayor a 1 megabyte.',
            ),
            false,
          )
        } else {
          cb(null, true)
        }
      },
    }),
  )
  async updateImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    this.logger.log(`Actualizando imagen al funko con ${id}:  ${file}`)

    return await this.funkosService.updateImage(id, file)
  }
}
