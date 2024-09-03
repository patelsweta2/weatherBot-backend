import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User extends Document {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  chatId: number;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true, default: true })
  isSubscribed: boolean;

  @Prop({ required: true, default: false })
  isBlocked: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
