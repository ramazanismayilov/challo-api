import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        console.log(`✅ Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`❌ Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinChat')
    handleJoin(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
        client.join(`chat-${room}`);
        console.log(`👥 Client ${client.id} joined room chat-${room}`);
    }

    emitNewMessage(chatId: number, message: any) {
        this.server.to(`chat-${chatId}`).emit('newMessage', message);
    }

    emitUpdatedMessage(chatId: number, message: any) {
        this.server.to(`chat-${chatId}`).emit('message:updated', message);
    }

    emitDeleteMessage(chatId: number, messageId: number) {
        this.server.to(`chat-${chatId}`).emit('message:deleted', messageId);
    }
}
