import { Module } from "@nestjs/common";
import { GroupController } from "./group.conroller";
import { GroupService } from "./group.service";
import { Group, GroupSchema } from "src/schemas/group.schma";
import { MongooseModule } from "@nestjs/mongoose";
import { GroupMember, GroupMemberSchema } from "src/schemas/groupMember.schema";

@Module({
    imports: [MongooseModule.forFeature([
        {name: Group.name, schema: GroupSchema},
        {name:GroupMember.name, schema: GroupMemberSchema}
    ])],
    providers: [GroupService],
    controllers: [GroupController],
})

export class GroupModule {}
