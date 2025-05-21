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

  @Post('/')
  async creteExpense(
    @Body() body: RequestGroup,
    @Res() reply: any,
  ): Promise<void | Group> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      response.data = await this.groupService.createGroup({
        name: body.name,
        createdBy: body.createdBy,
      });
      reply.status(200).send(response);
    } catch (error) {
      if (error.name === 'ValidationError') {
        return reply.status(401).status(response);
      }
      reply.status(500).send(response);
    }
  }

  @Put('/:id')
  async updateGroupById(
    @Param('id') id: string,
    @Res() reply: any,
    @Body() body: RequestGroup,
  ): Promise<Group | void> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      const putGroup = await this.groupService.updateGroupById(id, body);
      response.data = putGroup;
      reply.status(200).send(response);
    } catch (error) {
      reply.status(500).send(response);
    }
  }

  @Delete('/:id')
  async deleteGroupById(
    @Param('id') id: string,
    @Res() reply: any,
  ): Promise<Group | void> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      const deleteData = await this.groupService.deleteGroup(id);
      response.data = deleteData;
      reply.status(200).send(response);
    } catch (error) {
      reply.status(500).send(response);
    }
  }

  @Get('/:id')
  async fetchOneGroupById(
    @Param('id') id: string,
    @Res() reply: any,
  ): Promise<Group | void> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      const oneGroup = await this.groupService.fetchGroupById(id);
      if (!oneGroup || !oneGroup?.length) {
        return reply.status(404).send(response);
      }
      response.data = oneGroup;
      reply.status(200).send(response);
    } catch (error) {
      reply.status(500).send(response);
    }
  }

  @Get('/usergroups/:id')
  async fetchGroupsByUserId(
    @Param('id') id: string,
    @Res() reply: any,
  ): Promise<Group | void> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      const userGroups = await this.groupService.fetchGroupByUserId(id);
      if (!userGroups || !userGroups.length) {
        return reply.status(404).send(response);
      }
      response.data = userGroups;
      reply.status(200).send(response);
    } catch (error) {
      reply.status(500).send(response);
    }
  }
}
