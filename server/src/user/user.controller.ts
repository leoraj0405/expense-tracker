import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import type { RequestUser, ResponseUser } from './user';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(
    @Body() body: RequestUser,
    @Res() reply: any,
  ): Promise<void> {
    const response: ResponseUser = {
      message: 'Success',
      data: null,
    };
    try {
      response.data = await this.userService.createUser({
        name: body.name,
        email: body.email,
        password: body.password,
      });
      return reply.status(200).send(response);
    } catch (error) {
      response.message = `Error : ${error.message}`;
      return reply.status(500).send(response);
    }
  }

  @Get()
  async findAllUser(@Res() reply: any): Promise<void> {
    const response: ResponseUser = {
      message: 'Success',
      data: null,
    };
    try {
      response.data = await this.userService.findAllUser();
      return reply.status(200).send(response);
    } catch (error) {
      response.message = `Error : ${error.message}`;
      return reply.status(500).send(response);
    }
  }

  @Put('/:id')
  async updateUser(
    @Body() body: RequestUser,
    @Param('id') id: any,
    @Res() reply: any,
  ): Promise<void> {
    const response: ResponseUser = {
      message: 'Success',
      data: null,
    };
    try {
      response.data = await this.userService.updateUser(id, body);
      reply.status(200).send(response);
    } catch (error) {
      response.message = `Error : ${error.message}`;
      reply.status(500).send(response);
    }
  }

  @Delete('/:id')
  async deleteUser(@Param('id') id: any, @Res() reply: any) {
    const response: ResponseUser = {
      message: 'Success',
      data: null,
    };
    try {
      response.data = await this.userService.deleteUser(id);
      reply.status(200).send(response);
    } catch (error) {
      response.message = `Error : ${error.message}`;
      reply.status(500).send(response);
    }
  }

  @Get('/:id')
  async findOneUser(@Res() reply: any, @Param('id') id: any): Promise<void> {
    const response: ResponseUser = {
      message: 'Success',
      data: null,
    };
    try {
      response.data = await this.userService.findOneUser(id);
      return reply.status(200).send(response);
    } catch (error) {
      response.message = `Error : ${error.message}`;
      return reply.status(500).send(response);
    }
  }
}
