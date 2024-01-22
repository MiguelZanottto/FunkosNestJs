import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PaginateModel } from 'mongoose';
import { Pedido, PedidoDocument } from './schemas/pedido.schema';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Funko } from '../funkos/entities/funko.entity';
import { Repository } from 'typeorm';
import { PedidosMapper } from './mappers/pedidos.mapper';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { Usuario } from '../users/entities/user.entity';

export const PedidosOrderByValues: string[] = ['_id', 'idUsuario']
export const PedidosOrderValues: string[] = ['asc', 'desc']

@Injectable()
export class PedidosService {
  private logger = new Logger(PedidosService.name);

  constructor(
    @InjectModel(Pedido.name)
    private pedidosRepository: PaginateModel<PedidoDocument>,
    @InjectRepository(Funko)
    private readonly funkosRepository: Repository<Funko>,
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
    private readonly pedidosMapper: PedidosMapper,
  ){}

  async findAll(page: number, limit: number, orderBy: string, order: string){
    this.logger.log(
      `Buscando pedidos con paginación y filtros: ${JSON.stringify({page, limit, orderBy, order})}`
    )

    const options = {
      page,
      limit,
      sort: {
        [orderBy]: order,
      },
      collection: 'es_ES'
    }

    return await this.pedidosRepository.paginate({}, options);
  }

  async findOne(id: string){
    this.logger.log(`Buscando pedido con id ${id}`)
    const pedidoToFind = await this.pedidosRepository.findById(id).exec()
    if (!pedidoToFind){
      throw new NotFoundException(`Pedido con id ${id} no encontrado`)
    }
    return pedidoToFind;
  }

  async findByIdUsuario(idUsuario: number){
    this.logger.log(`Buscando pedidos por usuario ${idUsuario}`)
    return await this.pedidosRepository.find({idUsuario}).exec()
  }

  async create(createPedidoDto: CreatePedidoDto){
    this.logger.log(`Creando pedido ${JSON.stringify(createPedidoDto)}`)
    const pedidoToBeSaved = this.pedidosMapper.toEntity(createPedidoDto);
    await this.checkPedido(pedidoToBeSaved);
    const pedidoToSave = await this.reserverStockPedidos(pedidoToBeSaved)
    pedidoToSave.createdAt = new Date();
    pedidoToSave.updatedAt = new Date();
    return await  this.pedidosRepository.create(pedidoToSave)
  }

  async update(id: string, updatePedidoDto: UpdatePedidoDto){
    this.logger.log(`Actualizando pedido con id ${id} con pedido ${JSON.stringify(updatePedidoDto)}`)

    const pedidoToUpdate = await this.pedidosRepository.findById(id).exec();
    if (!pedidoToUpdate){
      throw new NotFoundException(`Pedido con id ${id} no encontrado`)
    }
    const pedidoToBeSaved = this.pedidosMapper.toEntity(updatePedidoDto);
    await this.returnStockPedidos(pedidoToUpdate);
    await this.checkPedido(pedidoToBeSaved);
    const pedidoToSave = await this.reserverStockPedidos(pedidoToBeSaved);
    pedidoToSave.updatedAt = new Date();
    return await this.pedidosRepository.findByIdAndUpdate(id, pedidoToSave, {new:true}).exec();
  }

  async remove(id:string){
    this.logger.log(`Eliminado pedido con id ${id}`);

    const pedidoToDelete = await this.pedidosRepository.findById(id).exec();
    if (!pedidoToDelete){
      throw new NotFoundException(`Pedido con id ${id} no encontrado`)
    }
    await this.returnStockPedidos(pedidoToDelete);
    await this.pedidosRepository.findByIdAndDelete(id).exec();
  }

  async userExists(idUsuario: number): Promise<boolean> {
    this.logger.log(`Comprobando si existe el usuario ${idUsuario}`)
    const usuario = await this.usuariosRepository.findOneBy({ id: idUsuario })
    return !!usuario
  }

  async getPedidosByUser(idUsuario: number): Promise<Pedido[]> {
    this.logger.log(`Buscando pedidos por usuario ${idUsuario}`)
    return await this.pedidosRepository.find({ idUsuario }).exec()
  }

  private async checkPedido(pedido: Pedido){
    this.logger.log(`Comprobando pedido ${JSON.stringify(pedido)}`)
    if(!pedido.lineasPedido || pedido.lineasPedido.length === 0){
      throw new BadRequestException(`No se han agregado lineas de pedidos al pedido actual`)
    }
    for(const lineaPedido of pedido.lineasPedido){
      const funko = await this.funkosRepository.findOneBy({
        id: lineaPedido.idFunko
      })
      if (!funko){
        throw new BadRequestException(`Funko con id ${lineaPedido.idFunko} no existe`)
      }
      if(funko.cantidad < lineaPedido.cantidad && lineaPedido.cantidad > 0){
        throw new BadRequestException(`No hay suficientes cantidad del funko con id ${funko.id} para satisfacer el pedido`)
      }
      if (funko.precio !== lineaPedido.precioFunko){
        throw new BadRequestException(`El precio del funko en el pedido no coincide con el precio actual del funko`)
      }
    }
  }
  private async reserverStockPedidos(pedido: Pedido){
    this.logger.log(`Reservando cantidad del pedido: ${pedido}`)

    if(!pedido.lineasPedido || pedido.lineasPedido.length === 0){
      throw new BadRequestException(`No se han agregado lineas de pedido`)
    }

    for(const lineaPedido of pedido.lineasPedido){
      const funko = await this.funkosRepository.findOneBy({
          id: lineaPedido.idFunko
      })
      funko.cantidad -= lineaPedido.cantidad;
      await this.funkosRepository.save(funko)
      lineaPedido.total = lineaPedido.cantidad * lineaPedido.precioFunko;
    }
    pedido.total = pedido.lineasPedido.reduce(
      (sum, lineaPedido) =>
        sum + lineaPedido.cantidad * lineaPedido.precioFunko,
      0
    )
    pedido.totalItems = pedido.lineasPedido.reduce(
      (sum, lineaPedido) => sum + lineaPedido.cantidad,
      0,
    )
    return pedido;
  }

  private async returnStockPedidos(pedido: Pedido) {
    this.logger.log(`Retornando cantidad del pedido: ${pedido}`)
    if (pedido.lineasPedido){
      for (const lineaPedido of pedido.lineasPedido){
        let funko = await this.funkosRepository.findOneBy({
          id: lineaPedido.idFunko
        })
        funko.cantidad += lineaPedido.cantidad
        await this.funkosRepository.save(funko)
      }
    }
    return pedido;
  }
}


