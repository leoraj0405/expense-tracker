import { User } from '../schemas/user.schema';

export interface ResponseUser {
    message: string,
    data: null | User | User[],
}

export interface RequestUser {
    name: User.name,
    email: User.email,
    password: User.password
}
