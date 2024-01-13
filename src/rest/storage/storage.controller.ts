import { Controller, Logger, UseInterceptors, UploadedFile, Req, BadRequestException, Get, Param, Res } from '@nestjs/common';
import { StorageService } from './storage.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express'
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
@Controller('storage')
export class StorageController {
  private readonly logger = new Logger(StorageController.name);
  constructor(private readonly storageService: StorageService) {}

  //@Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOADS_DIR || './storage-dir',
        filename: (req, file, cb) => {
          const fileName = uuidv4()
          const fileExt = extname(file.originalname)
          cb(null, `${fileName}${fileExt}`)
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)){
          cb(new BadRequestException('Fichero no soportado.'), false)
        } else {
          cb(null, true)
        }
      },
      }),
  ) storeFile(@UploadedFile() file: Express.Multer.File, @Req() req: Request){
    this.logger.log(`Subiendo archivo: ${file}`)
    if (!file){
      throw new BadRequestException('Fichero no encontrado.')
    }

    const apiVersion = process.env.API_VERSION
      ? `/${process.env.API_VERSION}`
      : '';
    const url = `${req.protocol}://${req.get('host')}${apiVersion}/storage/${file.filename}`
    return {
      originalname: file.originalname,
      filename: file.filename,
      size: file.size,
      mimeType: file.mimetype,
      path: file.path,
      url: url,
    }
  }

  @Get(':filename')
  getFile(@Param('filename') filename: string, @Res() res: Response){
    this.logger.log(`Buscando fichero ${filename}`)
    const filePath = this.storageService.findFile(filename)
    this.logger.log(`Fichero encontrado ${filePath}`)
    res.sendFile(filePath)
  }
}
