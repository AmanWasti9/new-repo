import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage } from './entities/chat-message.entity';
import { UserService } from '../users/users.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatMessage.name)
    private readonly chatMessageModel: Model<ChatMessage>,
    private readonly userService: UserService,
  ) {}

  async createMessage(senderId: string, receiverId: string, content: string): Promise<any> {
    const message = new this.chatMessageModel({
      senderId,
      receiverId,
      content,
    });

    const savedMessage = await message.save();
    
    // Fetch user details for the real-time response
    const sender = await this.userService.findOne(senderId);
    const receiver = await this.userService.findOne(receiverId);

    return {
      id: savedMessage._id.toString(),
      content: savedMessage.content,
      createdAt: (savedMessage as any).createdAt,
      sender: { id: sender.id, name: sender.name },
      receiver: { id: receiver.id, name: receiver.name },
      isRead: savedMessage.isRead,
    };
  }

  async getMessages(user1Id: string, user2Id: string): Promise<any[]> {
    const messages = await this.chatMessageModel.find({
      $or: [
        { senderId: user1Id, receiverId: user2Id },
        { senderId: user2Id, receiverId: user1Id },
      ],
    }).sort({ createdAt: 1 }).exec();

    const sender = await this.userService.findOne(user1Id);
    const receiver = await this.userService.findOne(user2Id);

    return messages.map((msg: any) => ({
      id: msg._id.toString(),
      content: msg.content,
      createdAt: msg.createdAt,
      sender: msg.senderId === user1Id ? { id: sender.id, name: sender.name } : { id: receiver.id, name: receiver.name },
      receiver: msg.receiverId === user1Id ? { id: sender.id, name: sender.name } : { id: receiver.id, name: receiver.name },
      isRead: msg.isRead,
    }));
  }

  async getMyConversations(userId: string) {
    const messages = await this.chatMessageModel.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).sort({ createdAt: -1 }).exec();

    const participants = new Map();
    
    for (const msg of messages) {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!participants.has(otherUserId)) {
        try {
          const otherUser = await this.userService.findOne(otherUserId);
          participants.set(otherUserId, {
            user: { id: otherUser.id, name: otherUser.name, email: otherUser.email },
            lastMessage: msg.content,
            lastMessageDate: (msg as any).createdAt,
          });
        } catch (error) {
          // User might not exist anymore
          continue;
        }
      }
    }

    return Array.from(participants.values());
  }

  async markAsRead(messageId: string): Promise<void> {
    await this.chatMessageModel.findByIdAndUpdate(messageId, { isRead: true }).exec();
  }
}
