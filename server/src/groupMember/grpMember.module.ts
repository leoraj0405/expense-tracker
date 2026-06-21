import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrpMemberController } from './grpMember.controller';
import { GrpMemberService } from './grpMember.service';
import { GroupMember } from '../entities/group-member.entity';
import { GroupExpense } from '../entities/group-expense.entity';
import { GroupExpenseSplit } from '../entities/group-expense-split.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupMember, GroupExpense, GroupExpenseSplit]),
    UserModule,
  ],
  providers: [GrpMemberService],
  controllers: [GrpMemberController],
  exports: [GrpMemberService],
})
export class GroupMemberModule {}
