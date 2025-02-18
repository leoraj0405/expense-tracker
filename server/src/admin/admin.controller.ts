import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Res,
  Param,
} from '@nestjs/common';
import { Admin } from 'src/schemas/admin.schema';
import { RequsetAdmin } from 'src/request';
import { ResponseDto } from 'src/response';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  async postAdmin(
    @Body() body: RequsetAdmin,
    @Res() reply: any,
  ): Promise<void | Admin> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      response.data = await this.adminService.createAdmin({
        name: body.name,
        email: body.email,
        password: body.password
      });
      return reply.status(200).send(response);
    } catch (error) {
      if (error.name === 'ValidationError') {
        response.message = 'Invalid user | group ';
      } else {
        response.message = `Error : ${error.message}`;
      }
      return reply.status(500).send(response);
    }
  }

  @Get()
  async getAdmin(@Res() reply: any): Promise<void | Admin> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      const getAdmin = await this.adminService.findAllAdmin();
      if (!getAdmin.length) {
        response.message = 'Not Found';
        return reply.status(404).send(response);
      }
      response.data = getAdmin;
      return reply.status(200).send(response);
    } catch (error) {
      response.message = `Error : ${error.message}`;
      reply.status(500).send(response);
    }
  }

  @Put('/:id')
  async updateAdmin(
    @Param('id') id: string,
    @Res() reply: any,
    @Body() body: RequsetAdmin,
  ): Promise<Admin | null> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      response.data = await this.adminService.putAdmin(id, body);
      return reply.status(200).send(response);
    } catch (error) {
      response.message = `Error : ${error.message}`;
      return reply.status(500).send(response);
    }
  }

  @Delete('/:id')
  async deleteAdmin(
    @Param('id') id: string,
    @Res() reply: any,
  ): Promise<Admin | null> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      response.data = await this.adminService.deleteAdmin(id);
      return reply.status(200).send(response);
    } catch (error) {
      response.message = `Error : ${error.message}`;
      return reply.status(500).send(response);
    }
  }

  @Get('/:id')
  async getOneAdmin(
    @Param('id') id: string,
    @Res() reply: any,
  ): Promise<Admin | null> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      const oneAdmin = await this.adminService.singleAdmin(id);
      if (!oneAdmin) {
        response.message = 'Not found';
        return reply.status(404).send(response);
      } else {
        response.data = oneAdmin;
        return reply.status(200).send(response);
      }
    } catch (error) {
      response.message = `Error : ${error.message}`;
      return reply.status(500).send(response);
    }
  }
}
