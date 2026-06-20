import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrpExpenseController } from './grpExpense.controller';
import { GrpExpenseService } from './grpExpense.service';
import { GroupExpense } from '../entities/group-expense.entity';
import { GroupExpenseSplit } from '../entities/group-expense-split.entity';
import { GroupMemberModule } from 'src/groupMember/grpMember.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupExpense, GroupExpenseSplit]),
    GroupMemberModule,
  ],
  providers: [GrpExpenseService],
  controllers: [GrpExpenseController],
})
export class GroupExpenseModule {}
