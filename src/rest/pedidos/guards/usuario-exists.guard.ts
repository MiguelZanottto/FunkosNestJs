import { BadRequestException, CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { PedidosService } from "../pedidos.service"
import { Observable } from "rxjs"

@Injectable()
export class UsuarioExistsGuard implements CanActivate {
  constructor(private readonly pedidosService: PedidosService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    const body = request.body
    const idUsuario = body.idUsuario

    if (!idUsuario) {
      throw new BadRequestException('El id del usuario es obligatorio')
    }

    if (isNaN(idUsuario)) {
      throw new BadRequestException('El id del usuario no es válido')
    }

    return this.pedidosService.userExists(idUsuario).then((exists) => {
      if (!exists) {
        throw new BadRequestException(
          'El ID del usuario no existe en el sistema',
        )
      }
      return true
    })
  }
}