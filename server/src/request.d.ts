import { User } from "./schemas/user.schema"
import { Category } from "./schemas/category.schema"

export interface RequestUser {
    name: User.name,
    email: User.email,
    password: User.password,
    parentEmail: User.parentEmail,
}

export interface RequestCategory {
    name: Category.name
}

export interface RequestExpense {
    userId: string,
    description: string,
    amount: number,
    date: string,
    categoryId: string
}

export interface RequestGroup {
    name: string,
    createdBy: string
}

export interface RequestGrpExpense {
    groupId: string,
    description: string,
    amount: number,
    userId: string,
    categoryId: string
}

export interface RequestGrpMember {
    groupId: string,
    userId: string
}

export interface RequsetAdmin {
    name: string,
    email: string,
    password: string
}

export interface LoginUserReq {
    email: string,
    password: string
}

export interface LoginParentReq {
    parentEmail : string,
    parentotp:? string
}