import { User } from "./schemas/user.schema"
import { Category } from "./schemas/category.schema"

export interface RequestUser {
    name: string,
    email: string,
    password: string,
    parentEmail: string,
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
    email: string,
    userId: string
}

export interface LoginUserReq {
    email: string,
    password: string
}

export interface LoginParentReq {
    parentEmail : string,
    parentotp:? string
}