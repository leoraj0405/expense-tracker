import { Module } from "@nestjs/common";
import { GrpMemberController } from "./grpMember.controller";
import { GrpMemberService } from "./grpMember.service";
import { GroupMember, GroupMemberSchema } from "src/schemas/groupMember.schema";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
    imports: [MongooseModule.forFeature([{
        name: GroupMember.name, schema: GroupMemberSchema
    }])],
    providers: [GrpMemberService],
    controllers: [GrpMemberController],
})

export class GroupMemberModule {}
