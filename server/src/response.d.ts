import { User } from '../schemas/user.schema';
import { Category } from './schemas/category.schema';

export interface ResponseDto {
  message: string;
  data: null | User | User[] | Category | Category[];
}