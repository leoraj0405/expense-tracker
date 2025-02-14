import { User } from "./schemas/user.schema"
import { Category } from "./schemas/category.schema"

export interface RequestUser {
    name: User.name,
    email: User.email,
    password: User.password
}

export interface RequestCategory {
    name: Category.name
}