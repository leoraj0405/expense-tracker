import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Category, CategorySchema } from 'src/schemas/category.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Expense, ExpenseSchema } from 'src/schemas/expense.schma';
import {
  GroupExpense,
  GroupExpenseSchema,
} from 'src/schemas/groupExpense.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Category.name,
        schema: CategorySchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: Expense.name,
        schema: ExpenseSchema,
      },
    ]),

    MongooseModule.forFeature([
      {
        name: GroupExpense.name,
        schema: GroupExpenseSchema,
      },
    ]),
  ],

  providers: [CategoryService],
  controllers: [CategoryController],
})
export class CategoryModule {}
