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
import { GrpExpenseService } from './grpExpense.service';
import { RequestGrpExpense } from 'src/request';
import { sendError, sendSuccess } from 'src/utils/api-response.util';

@Controller('api/groupexpense')
export class GrpExpenseController {
  constructor(private readonly grpExpenseService: GrpExpenseService) {}

  @Post()
  async createGroupExpense(
    @Body() body: RequestGrpExpense,
    @Res() reply: Response,
  ): Promise<void> {
    try {
      const expense = await this.grpExpenseService.createGroupExpense({
        groupId: body.groupId,
        description: body.description,
        amount: body.amount,
        userId: body.userId,
        categoryId: body.categoryId,
        usersAndShares: body.usersAndShares,
        splitMethod: body.splitMethod,
      });
      sendSuccess(reply, { item: expense });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to create group expense', 500);
    }
  }

  @Put('/:id')
  async updateGroupExpenseById(
    @Param('id') id: string,
    @Res() reply: Response,
    @Body() body: RequestGrpExpense,
  ): Promise<void> {
    try {
      const expense = await this.grpExpenseService.updateGroupExpenseById(id, body);
      sendSuccess(reply, { item: expense });
    } catch (error) {
      if (error?.status) {
        return sendError(reply, error.message || 'Invalid request', 400);
      }
      sendError(reply, error?.message || 'Failed to update group expense', 500);
    }
  }

  @Delete('/:id')
  async deleteGroupExpenseById(@Param('id') id: string, @Res() reply: Response): Promise<void> {
    try {
      const expense = await this.grpExpenseService.deleteGroupExpenseById(id);
      sendSuccess(reply, { item: expense });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to delete group expense', 500);
    }
  }

  @Get('/onegroup/:id')
  async fetchGroupExpensesByGroupId(
    @Param('id') id: string,
    @Res() reply: Response,
  ): Promise<void> {
    try {
      const expenses = await this.grpExpenseService.getGroupExpensesByGroupId(id);
      sendSuccess(reply, { items: expenses || [] });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to fetch group expenses', 500);
    }
  }

  @Get('/user/:user/:group')
  async fetchGroupExpensesByUserId(
    @Param('user') userId: string,
    @Param('group') groupId: string,
    @Res() reply: Response,
  ): Promise<void> {
    try {
      const expenses = await this.grpExpenseService.getExpensesByUserId(userId, groupId);
      sendSuccess(reply, { items: expenses || [] });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to fetch user group expenses', 500);
    }
  }

  @Get('/:id')
  async fetchGroupExpenseById(@Param('id') id: string, @Res() reply: Response): Promise<void> {
    try {
      const expenses = await this.grpExpenseService.getGroupExpenseById(id);
      if (!expenses?.length) {
        return sendError(reply, 'Group expense not found', 404);
      }
      sendSuccess(reply, { item: expenses[0] });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to fetch group expense', 500);
    }
  }
}
