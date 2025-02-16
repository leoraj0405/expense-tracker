import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { ExpenseModule } from './expense/expense.module';
import { GroupModule } from './group/group.module';
import { GroupExpenseModule } from './groupExpense/grpExpense.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/expenseTracker'),
    UserModule,
    CategoryModule,
    ExpenseModule,
    GroupModule,
    GroupExpenseModule
  ],
})
export class AppModule {}
