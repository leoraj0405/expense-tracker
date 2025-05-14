import { Module } from "@nestjs/common";
import { CategoryController } from "./category.controller";
import { CategoryService } from "./category.service";
import { Category, CategorySchema } from "src/schemas/category.schema";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
    imports: [MongooseModule.forFeature([{
        name: Category.name, 
        schema: CategorySchema
    }])],
    providers: [CategoryService],
    controllers: [CategoryController],
})

export class CategoryModule {}
