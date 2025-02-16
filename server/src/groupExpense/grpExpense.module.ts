import { Module } from "@nestjs/common";
import { GrpExpenseController } from "./grpExpense.controller";
import { GrpExpenseService } from "./grpExpense.service";
import { GroupExpense, GroupExpenseSchema } from "src/schemas/groupExpense.schema";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
    imports: [MongooseModule.forFeature([{
        name: GroupExpense.name, schema: GroupExpenseSchema
    }])],
    providers: [GrpExpenseService],
    controllers: [GrpExpenseController],
})

export class GroupExpenseModule {}
