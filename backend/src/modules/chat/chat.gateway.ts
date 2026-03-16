import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { AuthService } from '../auth/auth.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
  ) { }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.authService.verifyToken(token.replace('Bearer ', ''));
      const userId = payload.sub;

      this.connectedUsers.set(userId, client.id);
      console.log(`User connected: ${userId} (${client.id})`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        console.log(`User disconnected: ${userId}`);
        break;
      }
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string; content: string },
  ) {
    const senderId = this.getUserIdBySocketId(client.id);
    if (!senderId) return;

    const message = await this.chatService.createMessage(
      senderId,
      data.receiverId,
      data.content,
    );

    const receiverSocketId = this.connectedUsers.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('receiveMessage', message);
    }

    // Also send back to sender to confirm receipt/update UI
    client.emit('messageSent', message);
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { otherUserId: string },
  ) {
    const userId = this.getUserIdBySocketId(client.id);
    if (!userId) return;

    const messages = await this.chatService.getMessages(userId, data.otherUserId);
    client.emit('loadMessages', messages);
  }

  @SubscribeMessage('getConversations')
  async handleGetConversations(@ConnectedSocket() client: Socket) {
    const userId = this.getUserIdBySocketId(client.id);
    if (!userId) return;

    const conversations = await this.chatService.getMyConversations(userId);
    client.emit('loadConversations', conversations);
  }

  private getUserIdBySocketId(socketId: string): string | undefined {
    for (const [userId, id] of this.connectedUsers.entries()) {
      if (id === socketId) return userId;
    }
    return undefined;
  }
}
