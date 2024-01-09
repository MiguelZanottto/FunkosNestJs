import { Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { Notificacion } from './models/notificacion.model';
import { ResponseCategoriaDto } from '../../categorias/dto/response-categoria.dto';
import { FunkoResponseDto } from '../../funkos/dto/response-funko.dto';

const ENDPOINT: string = `/ws/${process.env.API_VERSION || 'v1'}/notifications`

@WebSocketGateway({
  namespace: ENDPOINT
})
export class NotificationsGateway {
  @WebSocketServer()
  private server: Server

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor() {
    this.logger.log(`NotificationsGateway is listening on ${ENDPOINT}`);
  }

  sendMessage(notification: Notificacion<ResponseCategoriaDto | FunkoResponseDto>){
    this.server.emit('updates', notification)
  }

  private handleConnection(client: Socket) {
    this.logger.debug('Cliente conectado:', client.id)
    this.server.emit(
      'connection',
      'Updates Notifications WS - Tienda Funkos NestJS',
    )
  }

  private handleDisconnect(client: Socket) {
    console.log('Cliente desconectado:', client.id)
    this.logger.debug('Cliente desconectado:', client.id)
  }
}
