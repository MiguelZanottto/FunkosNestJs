import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import * as mongoosePaginate from 'mongoose-paginate-v2'
export class Direccion {
  @Prop({
    type: String,
    required: true,
    length: 100,
    default: '',
  })
  calle: string;
  numero: string;
  ciudad: string;
  provincia: string;
  pais: string;
  codigoPostal:string
}

export class Cliente {
  nombreCompleto: string;
  email: string;
  telefone: string;
  direccion: Direccion;
}

export class LineaPedido{
  idFunko: number;
  precioFunko: number;
  cantidad: number;
  total: number;
}

export type PedidoDocument = Pedido & Document

@Schema({
  collection: 'pedidos',
  timestamps: false,
  versionKey: false,
  id: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.__v
      ret.id = ret._id
      delete ret._id
      delete ret._class
    },
  },
})

export class Pedido{
  idUsuario: number;
  cliente: Cliente;
  lineasPedido: LineaPedido[];
  totalItems: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export const PedidoSchema = SchemaFactory.createForClass(Pedido)
PedidoSchema.plugin(mongoosePaginate)