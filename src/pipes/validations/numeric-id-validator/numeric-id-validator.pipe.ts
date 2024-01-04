import { ArgumentMetadata, BadRequestException, Injectable, ParseIntPipe, PipeTransform } from '@nestjs/common';

@Injectable()
export class NumericIdValidatorPipe implements PipeTransform {
  constructor(private errorMessage = 'ID invalido, debe ser un numero entero mayor a 0') {
  }
  async transform(id: string, metadata: ArgumentMetadata) {
    const intPipe = new ParseIntPipe();
    try{
      const parsedValue = await intPipe.transform(id, metadata);
      if (parsedValue > 0) {
        return parsedValue;
      } else {
        throw new BadRequestException(this.errorMessage);
      }
    } catch (error) {
      throw new BadRequestException(this.errorMessage);
    }
  }
}
