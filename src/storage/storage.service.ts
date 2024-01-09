import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as fs from 'fs'
import * as path from 'path'
import { join } from 'path'

@Injectable()
export class StorageService {
  private readonly uploadsDir = process.env.UPLOADS_DIR || './storage-dir';
  private readonly isDev = process.env.NODE_ENV === `dev`;
  private readonly logger = new Logger(StorageService.name);

  async onModuleInit(){
    if (this.isDev){
      if(fs.existsSync(this.uploadsDir)){
        this.logger.log(`Eliminando ficheros de ${this.uploadsDir}`)
        fs.readdirSync(this.uploadsDir).forEach((file) => {
          fs.unlinkSync(path.join(this.uploadsDir, file));
        })
      } else {
        this.logger.log(`
         Creando directorio de subida de archivos en ${this.uploadsDir}
        `);
      }
    }
  }

  findFile(filename:string): string {
    this.logger.log(`Buscando fichero ${filename}`)
    const file = join(
      process.cwd(),
      process.env.UPLOADS_DIR || './storage-dir',
      filename,
    )
    if (fs.existsSync(file)){
      this.logger.log(`Fichero encontrado ${file}`)
      return file
    } else {
      throw new NotFoundException(`El fichero ${filename} no existe.`)
    }
  }

  removeFile(filename:string): void {
    this.logger.log(`Eliminando fichero ${filename}`);
    const file = this.findFile(filename);
    fs.unlinkSync(file);
  }
}
