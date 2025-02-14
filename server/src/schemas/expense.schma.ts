import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';
import { Category } from './category.schema';

export type ExpenseDocument = HydratedDocument<Expense>

@Schema()
export class Expense extends Document {
  @Prop({ required: true})
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;  

  @Prop({ required: true })
  amount: number;

  @Prop({ required: false })
  updatedAt: Date;

  @Prop({ required: false })
  deletedAt: Date;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
