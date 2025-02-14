import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Category extends Document {
  @Prop({ required: true})
  name: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: false })
  updatedAt: Date;

  @Prop({ required: false })
  deletedAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
