import { Role } from "src/rest/users/entities/user-role.entity";
import { UserSignUpDto } from "../dto/user-sign.up.dto";
import { CreateUserDto } from "src/rest/users/dto/create-user.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthMapper{
  toCreateDto(userSignUpDto: UserSignUpDto): CreateUserDto{
    const userCreateDto = new CreateUserDto();
    userCreateDto.nombre = userSignUpDto.nombre;
    userCreateDto.apellidos = userSignUpDto.apellidos;
    userCreateDto.username = userSignUpDto.username;
    userCreateDto.email = userSignUpDto.email;
    userCreateDto.password = userSignUpDto.password;
    userCreateDto.roles = [Role.USER];
    return userCreateDto;

  }

}