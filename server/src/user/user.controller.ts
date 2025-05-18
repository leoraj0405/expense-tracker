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
import { ResponseDto } from '../response';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async createUser(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: RequestUser,
    @Res() reply: any,
  ): Promise<void> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      response.data = await this.userService.createUser(
        {
          name: body.name,
          email: body.email,
          password: body.password,
          parentEmail: body.parentEmail,
        },
        file,
      );
      return reply.status(200).send(response);
    } catch (error) {
      response.message = `Error : ${error.message}`;
      return reply.status(500).send(response);
    }
  }

  @Get()
  async findAllUser(@Res() reply: any): Promise<void> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      const getUser = await this.userService.findAllUser();
      if (!getUser.length) {
        response.message = 'Not Found';
        return reply.status(404).send(response);
      }
      response.data = getUser;
      return reply.status(200).send(response);
    } catch (error) {
      if (error.code === 11000) {
        response.message = 'This email already exists';
      } else {
        response.message = `Error : ${error.message}`;
      }
      return reply.status(500).send(response);
    }
  }

  @Put('/:id')
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async updateUser(
    @Body() body: RequestUser,
    @Param('id') id: any,
    @Res() reply: any,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      response.data = await this.userService.updateUser({id, updateData: body}, file);
      reply.status(200).send(response);
    } catch (error) {
      response.message = `Error : ${error.message}`;
      reply.status(500).send(response);
    }
  }

  @Delete('/:id')
  async deleteUser(@Param('id') id: any, @Res() reply: any): Promise<void> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      response.data = await this.userService.deleteUser(id);
      reply.status(200).send(response);
    } catch (error) {
      response.message = `Error : ${error.message}`;
      reply.status(500).send(response);
    }
  }

  @Post('/login')
  async loginUser(
    @Res() reply: any,
    @Body() body: LoginUserReq,
    @Req() request: any,
  ): Promise<void> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      const loggedUser = await this.userService.loginUser(
        body.email,
        body.password,
      );
      if (loggedUser) {
        request.session.isLogged = true;
        request.session.data = loggedUser;
        return reply.status(200).send(response);
      } else {
        request.session.isLogged = false;
        request.session.data = null;
        response.message = 'Invalid Email | password';
        return reply.status(404).send(response);
      }
    } catch (error) {
      response.message = `Error : ${error.message}`;
      return reply.status(500).send(response);
    }
  }

  @Get('/home')
  async homeUser(@Res() reply: any, @Req() request: any): Promise<void> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      if (request.session.data) {
        response.data = request.session.data;
        const userProfile = request.session.data.profileImage;
        if (!userProfile) {
          response.message = 'User or profile image not found';
          response.profileUrl = '';
          return reply.status(404).send(response);
        }
        response.profileUrl = `/uploads/${userProfile}`;
        return reply.status(200).send(response);
      } else {
        response.message = 'No session data found';
        return reply.status(404).send(response);
      }
    } catch (error) {
      response.message = `Error : ${error.message}`;
      return reply.status(500).send(response);
    }
  }

  @Get('/logout')
  async logoutUser(@Res() reply: any, @Req() request: any): Promise<void> {
    const response: ResponseDto = {
      message: 'success',
      data: null,
    };
    try {
      if (request.session.isLogged) {
        request.session.destroy((err) => {
          if (err) {
            response.message = err.message;
            return reply.status(500).send(response);
          }
          response.message = 'Session destroy.';
          return reply.status(200).send(response);
        });
      } else {
        response.message = 'First you need to login.';
        return reply.status(400).send(response);
      }
    } catch (error) {
      response.message = `Error : ${error.message}`;
      return reply.status(500).send(response);
    }
  }

  @Get('/:id')
  async findOneUser(@Res() reply: any, @Param('id') id: string): Promise<void> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      const oneUser = await this.userService.findOneUser(id);
      if (!oneUser) {
        response.message = 'User not found';
        return reply.status(404).send(response);
      } else {
        response.profileUrl = `/uploads/${oneUser.profileImage}`;
        response.data = oneUser;
        return reply.status(200).send(response);
      }
    } catch (error) {
      response.message = `Error : ${error.message}`;
      return reply.status(500).send(response);
    }
  }

  @Post('/parentgenerateotp')
  async findParent(
    @Res() reply: any,
    @Body() body: LoginParentReq,
  ): Promise<void> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      const findParent = await this.userService.parentGenerateOtp(body);
      if (!findParent) {
        response.message = 'Not found';
        return reply.status(404).send(response);
      } else {
        response.data = findParent;
        return reply.status(200).send(response);
      }
    } catch (error) {
      response.message = `Error : ${error.message}`;
      return reply.status(500).send(response);
    }
  }

  @Post('/parentproccessotp')
  async processOtp(
    @Res() reply: any,
    @Body() body: LoginParentReq,
  ): Promise<void> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      let email = body.parentEmail;
      let otp = body.parentotp;
      const processOtp = await this.userService.parentProcessOtp(email, otp);
      if (!processOtp) {
        response.message = 'Not found';
        return reply.status(404).send(response);
      } else {
        response.data = processOtp;
        return reply.status(200).send(response);
      }
    } catch (error) {
      response.message = `Error : ${error.message}`;
      return reply.status(500).send(response);
    }
  }
}
