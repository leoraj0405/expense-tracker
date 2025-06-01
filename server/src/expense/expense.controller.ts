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
import { ExpenseService } from './expense.service';
import { RequestExpense } from 'src/request';
import { ResponseDto } from 'src/response';
import { Expense } from 'src/schemas/expense.schma';

@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  async createExpense(
    @Body() body: RequestExpense,
    @Res() reply: any,
  ): Promise<void | Expense> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      response.data = await this.expenseService.createExpense({
        userId: body.userId,
        description: body.description,
        amount: body.amount,
        date: body.date,
        categoryId: body.categoryId,
      });
      reply.status(200).send(response);
    } catch (error) {
      if (error.name === 'ValidationError') {
        return reply.status(401).send(error.message);
      } 
      if(error.status === 400) {
        error.message = 'Enter vaild Amount'
        return reply.status(400).send(error.message);
      }
      reply.status(500).send(error);
    }
  }
  @Put('/:id')
  async updateExpenseById(
    @Param('id') id: string,
    @Res() reply: any,
    @Body() body: RequestExpense,
  ): Promise<Expense | void> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      const putExpense = await this.expenseService.updateExpense(id, body);
      response.data = putExpense;
      reply.status(200).send(response);
    } catch (error) {
      reply.status(500).send(response);
    }
  }
  @Delete('/:id')
  async deleteExepenseById(
    @Param('id') id: string,
    @Res() reply: any,
  ): Promise<Expense | void> {
    const response : ResponseDto = {
      data: null
    }
    try {
      const deleteData = await this.expenseService.deleteExpense(id);
      response.data = deleteData;
      reply.status(200).send(response);
    } catch (error) {
      reply.status(500).send(response);
    }
  }
  @Get('/:id')
  async fetchExpenseById(
    @Param('id') id: string,
    @Res() reply: any,
  ): Promise<Expense[] | void> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      const userExpense = await this.expenseService.fetchExpense(id);
      if (!userExpense?.length) {
        return reply.status(404).send(response);
      } 
      response.data = userExpense;
      reply.status(200).send(response); 
    } catch (error) {
      return reply.status(500).send(response);
    }
  }
  @Get('/userexpense/:id')
  async fetchExpensesByUserId(
    @Param('id') id: string,
    @Res() reply: any,
    @Query('date') date: string,
    @Query('limit') limit: number,
    @Query('page') page: number,
  ): Promise<Expense | void> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      const userExpenses = await this.expenseService.fetchUserExpenses(
        id,
        date,
        limit,
        page,
      );
      if (!Array(userExpenses).length) {
        return reply.status(200).send(response);
      } 
      response.data = userExpenses;
      reply.status(200).send(response);
    } catch (error) {
      console.log(error)
      reply.status(500).send(error);
    }
  }
}
