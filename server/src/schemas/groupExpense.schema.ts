import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';
import { Group } from './group.schma';
import { Category } from './category.schema';

@Schema()
export class GroupExpense extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Group',
    required: true,
  })
  groupId: Group;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  amount: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: User;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Category',
    required: true,
  })
  categoryId: Category;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: false })
  updatedAt: Date;

  @Prop({ required: false })
  deletedAt: Date;
}

export const GroupExpenseSchema = SchemaFactory.createForClass(GroupExpense);
