import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Put,
  Param,
  Delete,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import type { LoginParentReq, LoginUserReq, RequestUser } from '../request';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { sendError, sendSuccess, buildSuccess } from '../utils/api-response.util';

const profileStorage = diskStorage({
  destination: './uploads',
  filename: (_req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueName}${extname(file.originalname)}`);
  },
});

@Controller('api/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('profileImage', { storage: profileStorage }))
  async createUser(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: RequestUser,
    @Res() reply: Response,
  ): Promise<void> {
    try {
      const user = await this.userService.createUser(
        {
          name: body.name,
          email: body.email,
          password: body.password,
          parentEmail: body.parentEmail,
        },
        file,
      );
      sendSuccess(reply, { item: user });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to create user', 500);
    }
  }

  @Put('/:id')
  @UseInterceptors(FileInterceptor('profileImage', { storage: profileStorage }))
  async updateUser(
    @Body() body: RequestUser,
    @Param('id') id: string,
    @Res() reply: Response,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    try {
      const user = await this.userService.updateUser({ id, updateData: body }, file);
      sendSuccess(reply, { item: user });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to update user', 500);
    }
  }

  @Delete('/:id')
  async deleteUser(@Param('id') id: string, @Res() reply: Response): Promise<void> {
    try {
      const user = await this.userService.deleteUser(id);
      sendSuccess(reply, { item: user });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to delete user', 500);
    }
  }

  @Post('/login')
  async loginUser(@Res() reply: Response, @Body() body: LoginUserReq): Promise<void> {
    try {
      const loggedUser = await this.userService.loginUser(body.email, body.password);
      if (!loggedUser) {
        return sendError(reply, 'Invalid Credentials.', 401);
      }
      const { name, email, profileImage } = loggedUser;
      const payload = { id: loggedUser.id, name, email, profileImage };
      const token = this.jwtService.sign(payload);
      sendSuccess(reply, {
        item: {
          token,
          loggedUserData: { name, email, profileImage, id: loggedUser.id },
        },
      });
    } catch (error) {
      sendError(reply, error?.message || 'Login failed', 500);
    }
  }

  @Get('/me')
  getMe(@Req() req: { user: Record<string, unknown> }) {
    const user = req.user;
    return buildSuccess({ item: { ...user, _id: user.id } });
  }

  @Get('/parenthome')
  async parentHome(@Res() reply: Response, @Req() request: any): Promise<void> {
    try {
      if (request.session?.parentIsLogged) {
        return sendSuccess(reply, { items: request.session.parentData || [] });
      }
      sendError(reply, 'Parent not logged in', 400);
    } catch (error) {
      sendError(reply, error?.message || 'Failed to fetch parent home', 500);
    }
  }

  @Get('/home')
  async homeUser(@Res() reply: Response, @Req() request: any): Promise<void> {
    try {
      if (!request.session?.isLogged) {
        return sendError(reply, 'First you need to login.', 401);
      }
      const userProfile = request.session.data.profileImage;
      sendSuccess(reply, {
        item: {
          ...request.session.data,
          profileUrl: `/uploads/${userProfile}`,
        },
      });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to fetch home', 500);
    }
  }

  @Get('/logout')
  async logoutUser(@Res() reply: Response, @Req() request: any): Promise<void> {
    try {
      if (!request.session?.isLogged) {
        return sendError(reply, 'Not logged in', 400);
      }
      request.session.destroy((err: Error) => {
        if (err) {
          return sendError(reply, 'Logout failed', 500);
        }
        sendSuccess(reply, { item: null });
      });
    } catch (error) {
      sendError(reply, error?.message || 'Logout failed', 500);
    }
  }

  @Get('/:id')
  async findOneUser(@Res() reply: Response, @Param('id') id: string): Promise<void> {
    try {
      const oneUser = await this.userService.findOneUser(id);
      if (!oneUser) {
        return sendError(reply, 'User not found', 404);
      }
      sendSuccess(reply, {
        item: {
          ...oneUser,
          profileUrl: `/uploads/${oneUser.profileImage}`,
        },
      });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to fetch user', 500);
    }
  }

  @Post('/processotp')
  async processOTP(@Res() reply: Response, @Body() body: any): Promise<void> {
    try {
      const process = await this.userService.processOTP(
        body.email,
        body.otp,
        body.password,
      );
      if (!process) {
        return sendError(reply, 'Invalid email or OTP', 401);
      }
      sendSuccess(reply, { item: process });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to process OTP', 500);
    }
  }

  @Post('/parentgenerateotp')
  async findParent(@Res() reply: Response, @Body() body: LoginParentReq): Promise<void> {
    try {
      const findParent = await this.userService.parentGenerateOtp(body);
      if (!findParent) {
        return sendError(reply, 'Parent not found', 404);
      }
      sendSuccess(reply, { item: findParent });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to generate OTP', 500);
    }
  }

  @Post('/parentproccessotp')
  async processOtp(
    @Res() reply: Response,
    @Body() body: LoginParentReq,
    @Req() request: any,
  ): Promise<void> {
    try {
      const email = body.parentEmail;
      const otp = body.parentotp;
      const processOtp = await this.userService.parentProcessOtp(email, otp);
      if (!processOtp) {
        if (request.session) {
          request.session.parentIsLogged = false;
          request.session.parentData = [];
        }
        return sendError(reply, 'Invalid OTP', 404);
      }
      if (request.session) {
        request.session.parentIsLogged = true;
        request.session.parentData = processOtp;
      }
      sendSuccess(reply, { item: 'You successfully logged in' });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to process parent OTP', 500);
    }
  }

  @Post('/checkuser')
  async checkUserByEmail(@Res() reply: Response, @Body() body: { email: string }): Promise<void> {
    try {
      const isUser = await this.userService.checkUserByEmail(body.email);
      if (!isUser?.length) {
        return sendError(reply, 'User not found', 404);
      }
      sendSuccess(reply, { item: isUser[0] });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to check user', 500);
    }
  }

  @Post('/generateotp')
  async generateOTPByUserEmail(
    @Res() reply: Response,
    @Body() body: { email: string },
  ): Promise<void> {
    try {
      const createOTP = await this.userService.generateOTP(body.email);
      if (!createOTP) {
        return sendError(reply, 'Invalid email address', 401);
      }
      sendSuccess(reply, { item: createOTP });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to generate OTP', 500);
    }
  }
}
