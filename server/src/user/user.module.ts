import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DashboardService } from './dashboard.service';
import { User } from '../entities/user.entity';
import { Expense } from '../entities/expense.entity';
import { Group } from '../entities/group.entity';
import { GroupMember } from '../entities/group-member.entity';
import { GroupExpense } from '../entities/group-expense.entity';
import { GroupExpenseSplit } from '../entities/group-expense-split.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Expense,
      Group,
      GroupMember,
      GroupExpense,
      GroupExpenseSplit,
    ]),
    AuthModule,
  ],
  providers: [UserService, DashboardService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
