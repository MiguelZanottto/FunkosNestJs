import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { FunkosService } from '../funkos.service';

@Injectable()
export class FunkoExistsGuard implements CanActivate {
  constructor(private readonly funkosService: FunkosService) {
  }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    const funkId = parseInt(request.params.id, 10)

    if (isNaN(funkId)){
      throw new BadRequestException('El id del funko no es válido')
    }
    return this.funkosService.exists(funkId).then((exists) => {
      return true;
    }).catch(error => {
      throw new BadRequestException('El ID del funko no existe')
    })
  }
}
