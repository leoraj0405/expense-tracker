import type { PaginationMeta } from './entities';

export interface ApiResponse<TItem = unknown, TListItem = TItem> {
  statusCode: number;
  items: TListItem[];
  item: TItem | null;
  errorMessage: string;
}

export type PaginatedResponse<T> = ApiResponse<PaginationMeta, T>;

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  parentEmail?: string;
  profileImage?: File | null;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  parentEmail?: string;
  profileImage?: File | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OtpRequest {
  email: string;
}

export interface ProcessOtpRequest {
  email: string;
  otp: string;
  password: string;
}

export interface ParentOtpRequest {
  parentEmail: string;
  parentotp?: string;
}

export interface CategoryRequest {
  name: string;
}

export interface ExpenseRequest {
  userId: string;
  description: string;
  amount: number;
  date: string;
  categoryId: string;
}

export interface GroupRequest {
  name: string;
  createdBy: string;
}

export interface GroupMemberRequest {
  groupId: string;
  email: string;
}

export interface GroupExpenseRequest {
  groupId: string;
  userId: string;
  categoryId: string;
  description: string;
  amount: number;
  splitMethod: string;
  usersAndShares: { memberId: string; share: number }[] | null;
}

export { PaginationMeta };
