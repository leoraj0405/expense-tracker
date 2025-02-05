import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { FastifyReply } from 'fastify';
import { QueryFailedError } from 'typeorm';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Res() reply: FastifyReply) {
    const usersResult = await this.usersService.findAll();

    if (!usersResult) {
      return reply.status(404).send({
        statusCode: 404,
        message: 'Requested resource could not be found.',
        data: null,
      });
    }

    return reply.status(200).send({
      statusCode: 200,
      message: 'Success',
      data: usersResult,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Res() reply: FastifyReply) {
    const singleUserResult = await this.usersService.findOne(id);

    if (!singleUserResult) {
      return reply.status(404).send({
        statusCode: 404,
        message: 'Requested resource could not be found.',
        data: null,
      });
    }
    return reply.status(200).send({
      statusCode: 200,
      message: 'Success',
      data: singleUserResult,
    });
  }

  @Post()
  async create(@Body() user: User, @Res() reply: FastifyReply) {
    try {
      const postUserResult = await this.usersService.create(user);
      return reply.status(200).send({
        statusCode: 200,
        message: 'User Created.',
        data: postUserResult,
      });
    } catch (error) {
      return reply.status(400).send({
        statusCode: 400,
        message: error.message,
        data: null,
      });
    }
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() user: Partial<User>) {
    
    return this.usersService.update(id, user);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}
