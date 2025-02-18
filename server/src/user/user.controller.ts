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
import type { RequestUser } from '../request';
import { ResponseDto } from '../response';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(
    @Body() body: RequestUser,
    @Res() reply: any,
  ): Promise<void> {
    const response: ResponseDto = {
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
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      const getUser = await this.userService.findAllUser();
      if (!getUser.length) {
        response.message = 'Not Found';
        return reply.status(404).send(response);
      }
      response.data = getUser;
      return reply.status(200).send(response);
    } catch (error) {
      if (error.code === 11000) {
        response.message = 'This email already exists';
      } else {
        response.message = `Error : ${error.message}`;
      }
      return reply.status(500).send(response);
    }
  }

  @Put('/:id')
  async updateUser(
    @Body() body: RequestUser,
    @Param('id') id: any,
    @Res() reply: any,
  ): Promise<void> {
    const response: ResponseDto = {
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
  async deleteUser(@Param('id') id: any, @Res() reply: any): Promise<void> {
    const response: ResponseDto = {
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
  async findOneUser(@Res() reply: any, @Param('id') id: string): Promise<void> {
    console.log(id);
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      const oneUser = await this.userService.findOneUser(id);
      if (!oneUser) {
        response.message = 'Not found';
        return reply.status(404).send(response);
      } else {
        response.data = oneUser;
        return reply.status(200).send(response);
      }
    } catch (error) {
      response.message = `Error : ${error.message}`;
      return reply.status(500).send(response);
    }
  }
}
