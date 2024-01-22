import { IsNotEmpty, IsNumber } from "class-validator"
import { ClienteDto, CreatePedidoDto, LineaPedidoDto } from "./create-pedido.dto"
import { PartialType } from "@nestjs/mapped-types"

export class UpdatePedidoDto extends PartialType(CreatePedidoDto) {
  @IsNumber()
  @IsNotEmpty()
  idUsuario: number

  @IsNotEmpty()
  cliente: ClienteDto

  @IsNotEmpty()
  lineasPedido: LineaPedidoDto[]
}