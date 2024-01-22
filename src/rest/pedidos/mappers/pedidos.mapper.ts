import { Injectable } from "@nestjs/common";
import { CreatePedidoDto } from "../dto/create-pedido.dto";
import { plainToClass } from "class-transformer";
import { Pedido } from "../schemas/pedido.schema";

@Injectable()
export class PedidosMapper {
  toEntity(createPedidoDto: CreatePedidoDto): Pedido {
    return plainToClass(Pedido, createPedidoDto)
  }
}