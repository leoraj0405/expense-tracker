import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { Expense } from '../entities/expense.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Expense])],
  providers: [ExpenseService],
  controllers: [ExpenseController],
})
export class ExpenseModule {}
