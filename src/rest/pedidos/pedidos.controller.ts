import { Body, Controller, DefaultValuePipe, Delete, Get, HttpCode, Logger, Param, ParseIntPipe, Post, Put, Query,
  UseGuards, UseInterceptors } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { OrderValidatePipe } from './pipes/order-validate.pipe';
import { OrderByValidatePipe } from './pipes/orderby-validate-pipe';
import { IdValidatePipe } from './pipes/id-validate.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesAuthGuard } from '../auth/guards/roles-auth.guard';
import { UsuarioExistsGuard } from './guards/usuario-exists.guard';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('pedidos')
@UseInterceptors(CacheInterceptor)
@UseGuards(JwtAuthGuard, RolesAuthGuard)
@ApiExcludeController()
export class PedidosController {
  private readonly logger = new Logger(PedidosController.name);

  constructor(private readonly pedidosService: PedidosService){}

  @Get()
  @Roles('ADMIN')
  async findAll(
    @Query('page', new DefaultValuePipe(1)) page: number = 1,
    @Query('limit', new DefaultValuePipe(20)) limit: number = 20,
    @Query('sort', new DefaultValuePipe('idUsuario'), OrderByValidatePipe) orderBy: string = 'idUsuario',
    @Query('order', new DefaultValuePipe('asc'), new OrderValidatePipe) order: string
  ){
    this.logger.log(`Buscando todos los pedidos con: ${JSON.stringify({
      page,
      limit,
      orderBy,
      order,
    })}`
    )
    return await this.pedidosService.findAll(page, limit, orderBy, order);
  }

  @Get(':id')
  @Roles('ADMIN')
  async findOne(@Param('id', IdValidatePipe) id: string) {
    this.logger.log(`Buscando pedido con id ${id}`);
    return await this.pedidosService.findOne(id);
  }

  @Get('usuario/:idUsuario')
  @Roles('ADMIN')
  async findPedidosPorUsuario(
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
  ) {
    this.logger.log(`Buscando pedidos por usuario ${idUsuario}`)
    return await this.pedidosService.findByIdUsuario(idUsuario)
  }

  @Post()
  @Roles('ADMIN')
  @HttpCode(201)
  @UseGuards(UsuarioExistsGuard)
  async create(@Body() createPedidoDto: CreatePedidoDto){
    this.logger.log(`Creando pedido ${JSON.stringify(createPedidoDto)}`)
    return await this.pedidosService.create(createPedidoDto);
  }

  @Put(':id')
  @UseGuards(UsuarioExistsGuard)
  @Roles('ADMIN')
  async update(
    @Param('id', IdValidatePipe) id: string,
    @Body() updatePedido: UpdatePedidoDto
  ) {
    this.logger.log(`Actualizando pedido con id ${id} con ${JSON.stringify(updatePedido)}`)
    return await this.pedidosService.update(id, updatePedido);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('ADMIN')
  async remove(@Param('id', IdValidatePipe) id: string){
    this.logger.log(`Borrando pedido con id ${id}`);
    await this.pedidosService.remove(id);
  }
}
