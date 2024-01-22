import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { ObjectId } from 'mongodb'

@Injectable()
export class IdValidatePipe implements PipeTransform{
  transform(value: any){
    console.log(value)
    if(!ObjectId.isValid(value)){
      throw new BadRequestException(
        `El id especificado no es valido o es de formato incorrecto`
      )
    }
    return value;
  }
}