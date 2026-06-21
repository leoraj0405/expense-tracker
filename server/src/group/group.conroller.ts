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
import { Response } from 'express';
import { GroupService } from './group.service';
import { RequestGroup } from '../request';
import { sendError, sendSuccess } from '../utils/api-response.util';

@Controller('api/group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post('/')
  async creteExpense(
    @Body() body: RequestGroup,
    @Res() reply: Response,
  ): Promise<void> {
    try {
      const group = await this.groupService.createGroup({
        name: body.name,
        createdBy: body.createdBy,
      });
      sendSuccess(reply, { item: group });
    } catch (error) {
      if (error?.name === 'ValidationError') {
        return sendError(reply, 'Invalid group data', 401);
      }
      sendError(reply, error?.message || 'Failed to create group', 500);
    }
  }

  @Put('/:id')
  async updateGroupById(
    @Param('id') id: string,
    @Res() reply: Response,
    @Body() body: RequestGroup,
  ): Promise<void> {
    try {
      const group = await this.groupService.updateGroupById(id, body);
      sendSuccess(reply, { item: group });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to update group', 500);
    }
  }

  @Delete('/:id')
  async deleteGroupById(
    @Param('id') id: string,
    @Res() reply: Response,
  ): Promise<void> {
    try {
      const group = await this.groupService.deleteGroup(id);
      sendSuccess(reply, { item: group });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to delete group', 500);
    }
  }

  @Get('/usergroups/:id')
  async fetchGroupsByUserId(
    @Param('id') id: string,
    @Res() reply: Response,
  ): Promise<void> {
    try {
      const groups = await this.groupService.fetchGroupByUserId(id);
      sendSuccess(reply, { items: groups || [] });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to fetch groups', 500);
    }
  }

  @Get('/:id')
  async fetchOneGroupById(
    @Param('id') id: string,
    @Res() reply: Response,
  ): Promise<void> {
    try {
      const groups = await this.groupService.fetchGroupById(id);
      if (!groups?.length) {
        return sendError(reply, 'Group not found', 404);
      }
      sendSuccess(reply, { item: groups[0] });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to fetch group', 500);
    }
  }
}
