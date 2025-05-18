import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({required: false})
  parentOtp: string;

  @Prop ({required: false})
  parentEmail: string;

  @Prop({required: false})
  otp: string;

  @Prop({required: false})
  otpAttempt: number;

  @Prop({type: Date, required: false})
  blockTime: Date;

  @Prop({required: false})
  profileImage: string;

  @Prop({ type: Date, required: false })
  createdAt: Date;

  @Prop({ type: Date, required: false })
  updatedAt: Date;

  @Prop({ type: Date, required: false })
  deletedAt: Date;

}

export const UserSchema = SchemaFactory.createForClass(User);
