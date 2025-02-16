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

@Controller('group')
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

//   @Get()
//   async getGroup(@Res() reply: any): Promise<void | Group> {
//     const response: ResponseDto = {
//       message: 'Success',
//       data: null,
//     };
//     try {
//       const getGroup = await this.groupService.findAllGroup();
//       if (!getGroup.length) {
//         response.message = 'Not Found';
//         return reply.status(404).send(response);
//       }
//       response.data = getGroup;
//       return reply.status(200).send(response);
//     } catch (error) {
//       response.message = `Error : ${error.message}`;
//       reply.status(500).send(response);
//     }
//   }

//   @Put('/:id')
//   async updateGroup(
//     @Param('id') id: string,
//     @Res() reply: any,
//     @Body() body: RequestGroup,
//   ): Promise<Group | null> {
//     const response: ResponseDto = {
//       message: 'Success',
//       data: null,
//     };
//     try {
//       const putGroup = await this.groupService.putGroup(id, body);
//       response.data = putGroup;
//       return reply.status(200).send(response);
//     } catch (error) {
//       response.message = `Error : ${error.message}`;
//       return reply.status(500).send(response);
//     }
//   }

//   @Delete('/:id')
//   async deleteGroup(
//     @Param('id') id: string,
//     @Res() reply: any,
//   ): Promise<Group | null> {
//     const response: ResponseDto = {
//       message: 'Success',
//       data: null,
//     };
//     try {
//       const deleteData = await this.groupService.deleteGroup(id);
//       response.data = deleteData;
//       return reply.status(200).send(response);
//     } catch (error) {
//       response.message = `Error : ${error.message}`;
//       return reply.status(500).send(response);
//     }
//   }

//   @Get('/:id')
//   async getOneGroup(
//     @Param('id') id: string,
//     @Res() reply: any,
//   ): Promise<Group | null> {
//     const response: ResponseDto = {
//       message: 'Success',
//       data: null,
//     };
//     try {
//       const oneGroup = await this.groupService.singleGroup(id);
//       if (!oneGroup) {
//         response.message = 'Not found';
//         return reply.status(404).send(response);
//       } else {
//         response.data = oneGroup
//         return reply.status(200).send(response);
//       }
//     } catch (error) {
//       response.message = `Error : ${error.message}`;
//       return reply.status(500).send(response);
//     }
//   }
}
