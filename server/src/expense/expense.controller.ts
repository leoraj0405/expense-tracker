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
  async postExpense(
    @Body() body: RequestExpense,
    @Res() reply: any,
  ): Promise<void | Expense> {
    const response: ResponseDto = {
      message: 'Success',
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
  async getExpense(@Res() reply: any): Promise<void | Expense> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      const getExpense = await this.expenseService.findAllExpense();
      if (!getExpense.length) {
        response.message = 'Not Found';
        return reply.status(404).send(response);
      }
      response.data = getExpense;
      return reply.status(200).send(response);
    } catch (error) {
      response.message = `Error : ${error.message}`;
      reply.status(500).send(response);
    }
  }
  @Put('/:id')
  async updateExpense(
    @Param('id') id: string,
    @Res() reply: any,
    @Body() body: RequestExpense,
  ): Promise<Expense | null> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      const putExpense = await this.expenseService.putExpense(id, body);
      response.data = putExpense;
      return reply.status(200).send(response);
    } catch (error) {
      response.message = `Error : ${error.message}`;
      return reply.status(500).send(response);
    }
  }
  @Delete('/:id')
  async deleteExepense(
    @Param('id') id: string,
    @Res() reply: any,
  ): Promise<Expense | null> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      const deleteData = await this.expenseService.deleteExpense(id);
      response.data = deleteData;
      return reply.status(200).send(response);
    } catch (error) {
      response.message = `Error : ${error.message}`;
      return reply.status(500).send(response);
    }
  }
  @Get('/:id')
  async getOneExpense(
    @Param('id') id: string,
    @Res() reply: any,
  ): Promise<Expense | null> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      const oneExpense = await this.expenseService.singleExpense(id);
      if (!oneExpense) {
        response.message = 'Not found';
        return reply.status(404).send(response);
      } else {
        response.data = oneExpense;
        return reply.status(200).send(response);
      }
    } catch (error) {
      response.message = `Error : ${error.message}`;
      return reply.status(500).send(response);
    }
  }

  @Get('/userexpense/:id')
  async oneUserExpenses(
    @Param('id') id: string,
    @Res() reply: any,
    @Query('date') date: string,
    @Query('limit') limit: number,
    @Query('page') page: number,
  ): Promise<Expense | null> {
    const response: ResponseDto = {
      message: '',
      data: null,
    };
    try {
      const userExpenses = await this.expenseService.userExpenses(id, date, limit, page);
      if (!userExpenses) {
        response.message = 'Not found';
        return reply.status(404).send(response);
      } else {
        response.message = 'success';
        response.data = userExpenses;
        return reply.status(200).send(response);
      }
    } catch (error) {
      response.message = `Error : ${error.message}`;
      return reply.status(500).send(response);
    }
  }
}
