import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ChatMessage extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true })
  receiverId: string;

  @Prop({ default: false })
  isRead: boolean;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
