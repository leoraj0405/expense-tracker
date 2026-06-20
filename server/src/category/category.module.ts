import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Category } from '../entities/category.entity';
import { Expense } from '../entities/expense.entity';
import { GroupExpense } from '../entities/group-expense.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Expense, GroupExpense])],
  providers: [CategoryService],
  controllers: [CategoryController],
})
export class CategoryModule {}
