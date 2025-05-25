import { Module } from '@nestjs/common';
import { GrpExpenseController } from './grpExpense.controller';
import { GrpExpenseService } from './grpExpense.service';
import {
  GroupExpense,
  GroupExpenseSchema,
} from 'src/schemas/groupExpense.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { GrpMemberService } from 'src/groupMember/grpMember.service';
import { GroupMember, GroupMemberSchema } from 'src/schemas/groupMember.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: GroupExpense.name,
        schema: GroupExpenseSchema,
      },
      {
        name: GroupMember.name,
        schema: GroupMemberSchema
      }
    ]),
  ],
  providers: [GrpExpenseService, GrpMemberService],
  controllers: [GrpExpenseController],
  exports: [GrpMemberService],
})
export class GroupExpenseModule {}
