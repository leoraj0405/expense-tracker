import { Module } from '@nestjs/common';
import { GrpMemberController } from './grpMember.controller';
import { GrpMemberService } from './grpMember.service';
import { GroupMember, GroupMemberSchema } from 'src/schemas/groupMember.schema';
import { MongooseModule } from '@nestjs/mongoose';
import {
  GroupExpense,
  GroupExpenseSchema,
} from 'src/schemas/groupExpense.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: GroupMember.name,
        schema: GroupMemberSchema,
      },

      {
        name: GroupExpense.name,
        schema: GroupExpenseSchema,
      },
    ]),
  ],
  providers: [GrpMemberService],
  controllers: [GrpMemberController],
})
export class GroupMemberModule {}
