import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class BodyNotEmptyValidatorPipe implements PipeTransform {
  transform(body: any, metadata: ArgumentMetadata) {
    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestException('El cuerpo de la solicitud no puede estar vacío');
    }
    return body;
  }
}