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
import { GrpExpenseService } from './grpExpense.service';
import { RequestGrpExpense } from 'src/request';
import { ResponseDto } from 'src/response';
import { GroupExpense } from 'src/schemas/groupExpense.schema';

@Controller('groupexpense')
export class GrpExpenseController {
  constructor(private readonly grpExpenseService: GrpExpenseService) {}

  @Post()
  async createGroupExpense(
    @Body() body: RequestGrpExpense,
    @Res() reply: any,
  ): Promise<void | GroupExpense> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      response.data = await this.grpExpenseService.createGroupExpense({
        groupId: body.groupId,
        description: body.description,
        amount: body.amount,
        userId: body.userId,
        categoryId: body.categoryId,
        usersAndShares: body.usersAndShares,
        splitMethod: body.splitMethod,
      });
      reply.status(200).send(response);
    } catch (error) {
      console.log(error);
      reply.status(500).send(response);
    }
  }

  @Put('/:id')
  async updateGroupExpenseById(
    @Param('id') id: string,
    @Res() reply: any,
    @Body() body: RequestGrpExpense,
  ): Promise<GroupExpense | null | void> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      response.data = await this.grpExpenseService.updateGroupExpenseById(
        id,
        body,
      );
      reply.status(200).send(response);
    } catch (error) {
      if (error.status) {
        return reply.status(400).send(error.message);
      }
      reply.status(500).send(error);
    }
  }

  @Delete('/:id')
  async deleteGroupExpenseById(
    @Param('id') id: string,
    @Res() reply: any,
  ): Promise<GroupExpense | void> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      response.data = await this.grpExpenseService.deleteGroupExpenseById(id);
      reply.status(200).send(response);
    } catch (error) {
      reply.status(500).send(response);
    }
  }

  @Get('/:id')
  async fetchGroupExpenseById(
    @Param('id') id: string,
    @Res() reply: any,
  ): Promise<GroupExpense | void> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      const oneGroupExpense =
        await this.grpExpenseService.getGroupExpenseById(id);
      if (!oneGroupExpense?.length) {
        return reply.status(404).send(response);
      }
      response.data = oneGroupExpense;
      reply.status(200).send(response);
    } catch (error) {
      reply.status(500).send(response);
    }
  }

  @Get('/onegroup/:id')
  async fetchGroupExpensesByGroupId(
    @Param('id') id: string,
    @Res() reply: any,
  ): Promise<GroupExpense[] | void> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      const oneGroupExpenses =
        await this.grpExpenseService.getGroupExpensesByGroupId(id);
      if (!oneGroupExpenses.length) {
        return reply.status(404).send(response);
      }
      response.data = oneGroupExpenses;
      reply.status(200).send(response);
    } catch (error) {
      console.log(error);
      reply.status(500).send(response);
    }
  }

  @Get('/user/:user/:group')
  async fetchGroupExpensesByUserId(
    @Param('user') userId: string,
    @Param('group') groupId: string,
    @Res() reply: any,
  ): Promise<GroupExpense[] | void> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      const userExpenses = await this.grpExpenseService.getExpensesByUserId(
        userId,
        groupId,
      );
      if (!userExpenses || !userExpenses.length) {
        return reply.status(404).send(response);
      }
      response.data = userExpenses;
      reply.status(200).send(response);
    } catch (error) {
      console.log(error);
      reply.status(500).send(response);
    }
  }
}
