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
import { UserService } from 'src/user/user.service';

@Controller('groupmember')
export class GrpMemberController {

  constructor(
    private readonly grpMemberService: GrpMemberService,
    private readonly userService:UserService
  ) {}

  @Post('/')
  async postGrpMember(
    @Body() body: RequestGrpMember,
    @Res() reply: any,
  ): Promise<void | GroupMember> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      // const isUser = await this.userService.checkUserByEmail(email)
      // if(!isUser?.length) {
      //   const password = Math.floor(1000 + Math.random() * 9000);
      //   const createUser = await this.userService.createUser(email, password)
      // }
    } catch (error) {
      if (error.code === 11000) {
        return reply.status(409).send(response);
      }
      if (error.name === 'ValidationError') {
        return reply.status(401).send(response);
      }
      reply.status(500).send(response);
    }
  }

  @Put('/:id')
  async updateGroupMemberById(
    @Param('id') id: string,
    @Res() reply: any,
    @Body() body: RequestGrpMember,
  ): Promise<GroupMember | void> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      response.data = await this.grpMemberService.updateGroupMember(id, body);
      reply.status(200).send(response);
    } catch (error) {
      if (error.code === 11000) {
        return reply.status(409).send(response);
      }
      reply.status(500).send(response);
    }
  }

  @Delete('/:id')
  async deleteGroupMemberbyId(
    @Param('id') id: string,
    @Res() reply: any,
  ): Promise<GroupMember | void> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      response.data = await this.grpMemberService.deleteGrpMember(id);
      reply.status(200).send(response);
    } catch (error) {
      reply.status(500).send(response);
    }
  }

  @Get('/:id')
  async fetchGroupMemberById(
    @Param('id') id: string,
    @Res() reply: any,
  ): Promise<GroupMember | void> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      const groupMember = await this.grpMemberService.fetchGroupMemberById(id);
      if (!groupMember?.length || !groupMember) {
        return reply.status(404).send(response);
      }
      response.data = groupMember;
      reply.status(200).send(response);
    } catch (error) {
      reply.status(500).send(response);
    }
  }

  @Get('onegroup/:id')
  async getGroupMembersByGroupId(
    @Param('id') id: string,
    @Res() reply: any,
  ): Promise<GroupMember | void> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      const groupMembers =
        await this.grpMemberService.fetchGroupMembersByGroupId(id);
      if (!groupMembers?.length || !groupMembers) {
        return reply.status(404).send(response);
      }
      response.data = groupMembers
      reply.status(200).send(response);
    } catch (error) {
      reply.status(500).send(response);
    }
  }
}
