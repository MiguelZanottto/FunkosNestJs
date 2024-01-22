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
import { Paginate, PaginateQuery, Paginated } from 'nestjs-paginate';
import { Roles, RolesAuthGuard } from '../auth/guards/roles-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody,
  ApiConsumes, ApiNotFoundResponse, ApiParam, ApiProperty, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FunkoResponseDto } from './dto/response-funko.dto';

@Controller('funkos')
@UseInterceptors(CacheInterceptor)
@ApiTags('Funkos')
export class FunkosController {
  private readonly logger: Logger = new Logger(FunkosController.name);

  constructor(private readonly funkosService: FunkosService) {}

  @Get()
  @CacheKey('all_funks')
  @CacheTTL(3)
  @ApiResponse({
    status: 200,
    description:
      'Lista de funkos paginada. Se puede filtrar por limite, pagina sortBy, filter y search',
    type: Paginated<FunkoResponseDto>,
  })
  @ApiQuery({
    description: 'Filtro por limite por pagina',
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiQuery({
    description: 'Filtro por pagina',
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    description: 'Filtro de ordenación: campo:ASC|DESC',
    name: 'sortBy',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Filtro de busqueda: filter.campo = $eq:valor',
    name: 'filter',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Filtro de busqueda: search = valor',
    name: 'search',
    required: false,
    type: String,
  })
  async findAll(@Paginate() query: PaginateQuery) {
    this.logger.log(`Searching all funks`)
    return await this.funkosService.findAll(query);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Funko encontrado',
    type: FunkoResponseDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del funko',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Funko no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del funko no es válido',
  })
  async findOne(@Param('id', new NumericIdValidatorPipe()) id: number) {
    this.logger.log(`Searching funk by id: ${id}`)
    return await this.funkosService.findOne(id);
  }

  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  async create(@Body() createFunkoDto: CreateFunkoDto) {
    this.logger.log(`Creating funk`)
    return await this.funkosService.create(createFunkoDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Funko creado',
    type: FunkoResponseDto,
  })
  @ApiBody({
    description: 'Datos del funko a crear',
    type: CreateFunkoDto,
  })
  @ApiBadRequestResponse({
    description:
      'El algunos de los campos no es válido según la especificación del DTO',
  })
  @ApiBadRequestResponse({
    description: 'La categoría no existe o no es válida',
  })
  async update(@Param('id', new NumericIdValidatorPipe()) id: number, @Body(new BodyNotEmptyValidatorPipe()) updateFunkoDto: UpdateFunkoDto) {
    this.logger.log(`Updating funk by id: ${id}`);
    return await this.funkosService.update(id, updateFunkoDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @ApiBearerAuth() // Indicar que se requiere autenticación con JWT en Swagger
  @ApiResponse({
    status: 204,
    description: 'Funko eliminado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del funko',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Funko no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del funko no es válido',
  })
  async remove(@Param('id', new NumericIdValidatorPipe()) id: number) {
    this.logger.log(`Deleting funk by id: ${id}`)
    return await this.funkosService.remove(id);
  }

  @Patch('/imagen/:id')
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @UseGuards(FunkoExistsGuard)
  @ApiBearerAuth() // Indicar que se requiere autenticación con JWT en Swagger
  @ApiResponse({
    status: 200,
    description: 'Imagen actualizada',
    type: FunkoResponseDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del funko',
    type: Number,
  })
  @ApiProperty({
    name: 'file',
    description: 'Fichero de imagen',
    type: 'string',
    format: 'binary',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Fichero de imagen',
    type: FileInterceptor('file'),
  })
  @ApiNotFoundResponse({
    description: 'Funko no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del funko no es válido',
  })
  @ApiBadRequestResponse({
    description: 'El fichero no es válido o de un tipo no soportado',
  })
  @ApiBadRequestResponse({
    description: 'El fichero no puede ser mayor a 1 megabyte',
  })
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
