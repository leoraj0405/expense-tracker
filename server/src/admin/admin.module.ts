import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { Admin, AdminSchema } from "src/schemas/admin.schema";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
    imports: [MongooseModule.forFeature([{
        name: Admin.name, schema: AdminSchema
    }])],
    providers: [AdminService],
    controllers: [AdminController],
})

export class AdminModule {}
