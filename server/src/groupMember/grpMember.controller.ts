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
import { RequestGrpMember } from '../request';
import { GrpMemberService } from './grpMember.service';
import { UserService } from '../user/user.service';
import { isDuplicateKeyError } from '../utils/mongo-compat';
import { sendError, sendSuccess } from '../utils/api-response.util';

@Controller('api/groupmember')
export class GrpMemberController {
  constructor(
    private readonly grpMemberService: GrpMemberService,
    private readonly userService: UserService,
  ) {}

  @Post()
  async postGrpMember(
    @Body() body: RequestGrpMember,
    @Res() reply: Response,
  ): Promise<void> {
    try {
      const groupId = body.groupId;
      const inputEmail = body.email;

      if (!inputEmail) {
        return sendError(reply, 'Email is required', 400);
      }

      const isUser = await this.userService.checkUserByEmail(inputEmail);
      if (!isUser?.length) {
        const createUser = await this.userService.createUser(
          {
            name: null,
            email: inputEmail,
            password: '12345678',
            parentEmail: null,
          },
          undefined,
        );
        const userId = createUser.id;
        await this.grpMemberService.createGroupMember(groupId, userId);
        await this.grpMemberService.sendLoginCredentialsInfoToUserEmail(
          inputEmail,
        );
        sendSuccess(reply, {
          item: {
            message:
              'New user created and added to the group. Login credentials sent to ' +
              inputEmail,
          },
        });
      } else {
        const userId = isUser[0].id;
        const createMember = await this.grpMemberService.createGroupMember(
          groupId,
          userId,
        );
        sendSuccess(reply, { item: createMember });
      }
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        return sendError(reply, 'This user is already in the group.', 409);
      }
      sendError(reply, error?.message || 'Failed to add group member', 500);
    }
  }

  @Put('/:id')
  async updateGroupMemberById(
    @Param('id') id: string,
    @Res() reply: Response,
    @Body() body: RequestGrpMember,
  ): Promise<void> {
    try {
      const member = await this.grpMemberService.updateGroupMember(id, body);
      sendSuccess(reply, { item: member });
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        return sendError(reply, 'Duplicate group member', 409);
      }
      sendError(reply, error?.message || 'Failed to update group member', 500);
    }
  }

  @Delete('/:id')
  async deleteGroupMemberbyId(
    @Param('id') id: string,
    @Res() reply: Response,
  ): Promise<void> {
    try {
      const member = await this.grpMemberService.deleteGrpMember(id);
      sendSuccess(reply, { item: member });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to delete group member', 500);
    }
  }

  @Get('onegroup/:id')
  async getGroupMembersByGroupId(
    @Param('id') id: string,
    @Res() reply: Response,
  ): Promise<void> {
    try {
      const groupMembers =
        await this.grpMemberService.fetchGroupMembersByGroupId(id);
      sendSuccess(reply, { items: groupMembers || [] });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to fetch group members', 500);
    }
  }

  @Get('/:id')
  async fetchGroupMemberById(
    @Param('id') id: string,
    @Res() reply: Response,
  ): Promise<void> {
    try {
      const groupMember = await this.grpMemberService.fetchGroupMemberById(id);
      if (!groupMember) {
        return sendError(reply, 'Group member not found', 404);
      }
      sendSuccess(reply, { item: groupMember });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to fetch group member', 500);
    }
  }
}
