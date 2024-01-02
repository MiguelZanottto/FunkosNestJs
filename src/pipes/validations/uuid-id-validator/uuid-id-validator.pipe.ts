import { ArgumentMetadata, Injectable, NotAcceptableException, ParseUUIDPipe, PipeTransform } from '@nestjs/common';

@Injectable()
export class UuidIdValidatorPipe implements PipeTransform {
  constructor(private errorMessage = 'ID invalido o de formato incorrecto') {
  }
  async transform(id: string, metadata: ArgumentMetadata) {
    const uuidPipe = new ParseUUIDPipe();
    try {
      return await uuidPipe.transform(id, metadata);
    } catch (error) {
      throw new NotAcceptableException(this.errorMessage);
    }
  }
}
