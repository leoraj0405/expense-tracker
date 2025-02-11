import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(
    @Body() body: { name: string; email: string; password: string },
  ) {
    return this.userService.create(body.name, body.email, body.password);
  }

  @Get()
  async findAll() {
    return this.userService.findAll();
  }
}
