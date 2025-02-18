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

@Controller('grpexpense')
export class GrpExpenseController {
  constructor(private readonly grpExpenseService: GrpExpenseService) {}

  @Post()
  async postExpense(
    @Body() body: RequestGrpExpense,
    @Res() reply: any,
  ): Promise<void | GroupExpense> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      response.data = await this.grpExpenseService.createGrpExpense({
        groupId: body.groupId,
        description: body.description,
        amount: body.amount,
        userId: body.userId,
        categoryId: body.categoryId
      });
      return reply.status(200).send(response);
    } catch (error) {
      if (error.name === 'ValidationError') {
        response.message = 'Invalid user | group | category';
      } else {
        response.message = `Error : ${error.message}`;
      }
      return reply.status(500).send(response);
    }
  }

  @Get()
  async getGrpExpense(@Res() reply: any): Promise<void | GroupExpense> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      const getGrpExpense = await this.grpExpenseService.findAllGrpExpense();
      if (!getGrpExpense.length) {
        response.message = 'Not Found';
        return reply.status(404).send(response);
      }
      response.data = getGrpExpense;
      return reply.status(200).send(response);
    } catch (error) {
      response.message = `Error : ${error.message}`;
      reply.status(500).send(response);
    }
  }

  @Put('/:id')
  async updateGrpExpense(
    @Param('id') id: string,
    @Res() reply: any,
    @Body() body: RequestGrpExpense,
  ): Promise<GroupExpense | null> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      response.data = await this.grpExpenseService.putGrpExpense(id, body);
      return reply.status(200).send(response);
    } catch (error) {
      response.message = `Error : ${error.message}`;
      return reply.status(500).send(response);
    }
  }

  @Delete('/:id')
  async deleteGrpExpense(
    @Param('id') id: string,
    @Res() reply: any,
  ): Promise<GroupExpense | null> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      response.data = await this.grpExpenseService.deleteGrpExpense(id);
      return reply.status(200).send(response);
    } catch (error) {
      response.message = `Error : ${error.message}`;
      return reply.status(500).send(response);
    }
  }

  @Get('/:id')
  async getOneGrpExpense(
    @Param('id') id: string,
    @Res() reply: any,
  ): Promise<GroupExpense | null> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      const oneGrpExpense = await this.grpExpenseService.singleGrpExpense(id);
      if (!oneGrpExpense) {
        response.message = 'Not found';
        return reply.status(404).send(response);
      } else {
        response.data = oneGrpExpense
        return reply.status(200).send(response);
      }
    } catch (error) {
      response.message = `Error : ${error.message}`;
      return reply.status(500).send(response);
    }
  }
}
