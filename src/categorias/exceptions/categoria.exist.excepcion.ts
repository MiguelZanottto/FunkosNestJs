import { HttpException, HttpStatus, Logger } from "@nestjs/common";

export class CategoriaAlreadyExistException extends HttpException{
  private readonly logger = new Logger('CATEGORIA ERROR')

  constructor(nombre:string) {
    super('La categoria ' + nombre + ' already exists in the database', HttpStatus.BAD_REQUEST);
    this.logger.error('La categoria ' + nombre + ' already exists in the database');
  }
}
