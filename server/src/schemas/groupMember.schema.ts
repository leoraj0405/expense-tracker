import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';
import { Group } from './group.schma';

@Schema()
export class GroupMember extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Group',
    required: true,
  })
  groupId: Group;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: User;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: false })
  updatedAt: Date;

  @Prop({ required: false })
  deletedAt: Date;
}

export const GroupMemberSchema = SchemaFactory.createForClass(GroupMember);
GroupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });
