export interface EntityRef {
  id: string;
  _id?: string;
}

export interface User extends EntityRef {
  name: string;
  email: string;
  parentEmail?: string | null;
  profileImage?: string | null;
  profileUrl?: string;
  createdAt?: string;
}

export interface SessionUser {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  profileImage?: string | null;
  data?: User;
  profileUrl?: string;
}

export interface Category extends EntityRef {
  name: string;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface CategoryRef {
  id: string;
  _id?: string;
  name: string;
}

export interface Expense extends EntityRef {
  description: string;
  amount: number;
  date: string;
  createdAt?: string;
  category?: CategoryRef | CategoryRef[];
  user?: User;
}

export interface Group extends EntityRef {
  name: string;
  createdBy: User;
}

export interface GroupMember extends EntityRef {
  user?: User;
  groupId?: string;
}

export interface ExpenseSplit {
  memberId: string;
  share: number;
}

export interface GroupExpense extends EntityRef {
  description: string;
  amount: number;
  user?: User;
  category?: CategoryRef;
  group?: EntityRef;
  splitAmong?: ExpenseSplit[];
  splitUnequal?: ExpenseSplit[];
}

export interface LoginResponse {
  token: string;
  loggedUserData: User;
}

export interface PaginationMeta {
  limit: number;
  page: number;
  total: number;
}
