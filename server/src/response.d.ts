import { User } from '../schemas/user.schema';
import { Category } from './schemas/category.schema';
import { Expense } from './schemas/expense.schma';
import { Group } from './schemas/group.schma';
import { GroupExpense } from './schemas/groupExpense.schema';
import { GroupMember } from './schemas/groupMember.schema';

export interface ResponseDto {
  message: string;
  data:
    | null
    | User
    | User[]
    | Category
    | Category[]
    | Expense
    | Expense[]
    | Group
    | Group[]
    | GroupExpense
    | GroupExpense[]
    | GroupMember
    |GroupMember [];
}
