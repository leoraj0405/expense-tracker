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
import { GroupService } from './group.service';
import { RequestGroup } from 'src/request';
import { ResponseDto } from 'src/response';
import { Group } from 'src/schemas/group.schma';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  async postExpense(
    @Body() body: RequestGroup,
    @Res() reply: any,
  ): Promise<void | Group> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      response.data = await this.groupService.createGroup({
        name: body.name,
        createdBy: body.createdBy,
      });
      return reply.status(200).send(response);
    } catch (error) {
      if (error.name === 'ValidationError') {
        response.message = 'Invalid user or expense category';
      } else {
        response.message = `Error : ${error.message}`;
      }
      return reply.status(500).send(response);
    }
  }

  @Get()
  async getGroup(@Res() reply: any): Promise<void | Group> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      const getGroup = await this.groupService.findAllGroup();
      if (!getGroup.length) {
        response.message = 'Not Found';
        return reply.status(404).send(response);
      }
      response.data = getGroup;
      return reply.status(200).send(response);
    } catch (error) {
      response.message = `Error : ${error.message}`;
      reply.status(500).send(response);
    }
  }

  @Put('/:id')
  async updateGroup(
    @Param('id') id: string,
    @Res() reply: any,
    @Body() body: RequestGroup,
  ): Promise<Group | null> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      const putGroup = await this.groupService.putGroup(id, body);
      response.data = putGroup;
      return reply.status(200).send(response);
    } catch (error) {
      response.message = `Error : ${error.message}`;
      return reply.status(500).send(response);
    }
  }

  @Delete('/:id')
  async deleteGroup(
    @Param('id') id: string,
    @Res() reply: any,
  ): Promise<Group | null> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      const deleteData = await this.groupService.deleteGroup(id);
      response.data = deleteData;
      return reply.status(200).send(response);
    } catch (error) {
      response.message = `Error : ${error.message}`;
      return reply.status(500).send(response);
    }
  }

  @Get('/:id')
  async getOneGroup(
    @Param('id') id: string,
    @Res() reply: any,
  ): Promise<Group | null> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      const oneGroup = await this.groupService.singleGroup(id);
      if (!oneGroup) {
        response.message = 'Not found';
        return reply.status(404).send(response);
      } else {
        response.data = oneGroup;
        return reply.status(200).send(response);
      }
    } catch (error) {
      response.message = `Error : ${error.message}`;
      return reply.status(500).send(response);
    }
  }

  @Get('/usergroups/:id')
  async userGroups(
    @Param('id') id: string,
    @Res() reply: any,
  ): Promise<Group | null> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };

    try {
      const userGroups = await this.groupService.userGroups(id);
      if (!userGroups) {
        response.message = 'Not found';
        return reply.status(404).send(response);
      } else {
        response.data = userGroups;
        return reply.status(200).send(response);
      }
    } catch (error) {
      console.log(error)
      response.message = `Error : ${error.message}`;
      return reply.status(500).send(response);
    }
  }
}
