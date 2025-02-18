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
import { GroupMember } from 'src/schemas/groupMember.schema';
import { RequestGrpMember } from 'src/request';
import { ResponseDto } from 'src/response';
import { GrpMemberService } from './grpMember.service';
@Controller('groupmember')
export class GrpMemberController {
  constructor(private readonly grpMemberService: GrpMemberService) {}

  @Post()
  async postGrpMember(
    @Body() body: RequestGrpMember,
    @Res() reply: any,
  ): Promise<void | GroupMember> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      response.data = await this.grpMemberService.createGrpMember({
        groupId: body.groupId,
        userId: body.userId,
      });
      return reply.status(200).send(response);
    } catch (error) {
      if (error.name === 'ValidationError') {
        response.message = 'Invalid user | group ';
      } else {
        response.message = `Error : ${error.message}`;
      }
      return reply.status(500).send(response);
    }
  }

    @Get()
    async getGrpMember(@Res() reply: any): Promise<void | GroupMember> {
      const response: ResponseDto = {
        message: 'Success',
        data: null,
      };
      try {
        const getGrpMember = await this.grpMemberService.findAllGrpMember();
        if (!getGrpMember.length) {
          response.message = 'Not Found';
          return reply.status(404).send(response);
        }
        response.data = getGrpMember;
        return reply.status(200).send(response);
      } catch (error) {
        response.message = `Error : ${error.message}`;
        reply.status(500).send(response);
      }
    }

    @Put('/:id')
    async updateGrpMember(
      @Param('id') id: string,
      @Res() reply: any,
      @Body() body: RequestGrpMember,
    ): Promise<GroupMember | null> {
      const response: ResponseDto = {
        message: 'Success',
        data: null,
      };
      try {
        response.data = await this.grpMemberService.putGrpMember(id, body);
        return reply.status(200).send(response);
      } catch (error) {
        response.message = `Error : ${error.message}`;
        return reply.status(500).send(response);
      }
    }

    @Delete('/:id')
    async deleteGrpMember(
      @Param('id') id: string,
      @Res() reply: any,
    ): Promise<GroupMember | null> {
      const response: ResponseDto = {
        message: 'Success',
        data: null,
      };
      try {
        response.data = await this.grpMemberService.deleteGrpMember(id);
        return reply.status(200).send(response);
      } catch (error) {
        response.message = `Error : ${error.message}`;
        return reply.status(500).send(response);
      }
    }

    @Get('/:id')
    async getOneGrpMember(
      @Param('id') id: string,
      @Res() reply: any,
    ): Promise<GroupMember | null> {
      const response: ResponseDto = {
        message: 'Success',
        data: null,
      };
      try {
        const oneGrpMember = await this.grpMemberService.singleGrpMember(id);
        if (!oneGrpMember) {
          response.message = 'Not found';
          return reply.status(404).send(response);
        } else {
          response.data = oneGrpMember
          return reply.status(200).send(response);
        }
      } catch (error) {
        response.message = `Error : ${error.message}`;
        return reply.status(500).send(response);
      }
    }
}
