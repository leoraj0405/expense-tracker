import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type StudentDocument = HydratedDocument<Students>

@Schema() 
export class Students {
    @Prop()
    name: string

    @Prop()
    age: number;
  
    @Prop()
    gender: string

    @Prop()
    dept: string

    @Prop()
    programme: string

}

export const StudentsSchema = SchemaFactory.createForClass(Students)