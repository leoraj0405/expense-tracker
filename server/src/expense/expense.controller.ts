import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Res,
  Param,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { ExpenseService } from './expense.service';
import { RequestExpense } from '../request';
import { sendError, sendPaginated, sendSuccess } from '../utils/api-response.util';

@Controller('api/expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  async createExpense(@Body() body: RequestExpense, @Res() reply: Response): Promise<void> {
    try {
      const expense = await this.expenseService.createExpense({
        userId: body.userId,
        description: body.description,
        amount: body.amount,
        date: body.date,
        categoryId: body.categoryId,
      });
      sendSuccess(reply, { item: expense });
    } catch (error) {
      if (error?.name === 'ValidationError' || error?.status === 400) {
        return sendError(reply, 'Enter valid amount.', 400);
      }
      sendError(reply, error?.message || 'Failed to create expense', 500);
    }
  }

  @Put('/:id')
  async updateExpenseById(
    @Param('id') id: string,
    @Res() reply: Response,
    @Body() body: RequestExpense,
  ): Promise<void> {
    try {
      const expense = await this.expenseService.updateExpense(id, body);
      sendSuccess(reply, { item: expense });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to update expense', 500);
    }
  }

  @Delete('/:id')
  async deleteExepenseById(@Param('id') id: string, @Res() reply: Response): Promise<void> {
    try {
      const expense = await this.expenseService.deleteExpense(id);
      sendSuccess(reply, { item: expense });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to delete expense', 500);
    }
  }

  @Get('/userexpense/:id')
  async fetchExpensesByUserId(
    @Param('id') id: string,
    @Res() reply: Response,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('date') date: string,
    @Query('limit') limit: number,
    @Query('page') page: number,
  ): Promise<void> {
    try {
      const result = await this.expenseService.fetchUserExpenses(
        id,
        startDate,
        endDate,
        limit,
        page,
        date,
      );
      const data = result as {
        limit: number;
        page: number;
        total: number;
        userExpenseData: unknown[];
      };
      sendPaginated(reply, data.userExpenseData || [], {
        limit: data.limit,
        page: data.page,
        total: data.total,
      });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to fetch expenses', 500);
    }
  }

  @Get('/:id')
  async fetchExpenseById(@Param('id') id: string, @Res() reply: Response): Promise<void> {
    try {
      const expenses = await this.expenseService.fetchExpense(id);
      if (!expenses?.length) {
        return sendError(reply, 'Expense not found', 404);
      }
      sendSuccess(reply, { item: expenses[0] });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to fetch expense', 500);
    }
  }
}
