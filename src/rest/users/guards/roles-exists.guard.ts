import { BadRequestException, CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { UsersService } from "../users.service";
import { Observable } from "rxjs";

@Injectable()
export class RolesExistsGuard implements CanActivate{
  constructor(private readonly usersService: UsersService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean>{
    const request = context.switchToHttp().getRequest()
    const roles = request.body.roles

    if (!roles || roles.length === 0){
      throw new BadRequestException('El usuario debe tener al menos un rol')
    }

    if (!this.usersService.validateRoles(roles)){
      throw new BadRequestException('El usuario tiene roles inválidos')
    }

    return true;
  }
}