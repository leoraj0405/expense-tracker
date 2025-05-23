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
import { request } from 'http';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/')
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
      reply.status(200).send(response);
    } catch (error) {
      reply.status(500).send(response);
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
      data: null,
    };
    try {
      response.data = await this.userService.updateUser(
        { id, updateData: body },
        file,
      );
      reply.status(200).send(response);
    } catch (error) {
      reply.status(500).send(response);
    }
  }
  @Delete('/:id')
  async deleteUser(@Param('id') id: any, @Res() reply: any): Promise<void> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      response.data = await this.userService.deleteUser(id);
      reply.status(200).send(response);
    } catch (error) {
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
      data: null,
    };
    try {
      const loggedUser = await this.userService.loginUser(
        body.email,
        body.password,
      );
      console.log(loggedUser)
      if (loggedUser) {
        request.session.isLogged = true;
        request.session.data = loggedUser;
        response.data = loggedUser
        return reply.status(200).send(response);
      }
      request.session.isLogged = false;
      request.session.data = loggedUser;
      reply.status(401).send(response);
    } catch (error) {
      reply.status(500).send(response);
    }
  }
  @Get('/parenthome')
  async parentHome(@Res() reply: any, @Req() request: any): Promise<void> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      if (request.session.parentIsLogged) {
        response.data = request.session.parentData;
        return reply.status(200).send(response);
      }
      response.data = [];
      reply.status(400).send(response);
    } catch (error) {
      reply.status(500).send(response);
    }
  }

  @Get('/home')
  async homeUser(@Res() reply: any, @Req() request: any): Promise<void> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      console.log(request.session);
      if (!request.session.isLogged) {
        return reply.status(401).send('First you need to login.');
      }
      response.data = request.session.data;
      const userProfile = request.session.data.profileImage;
      response.profileUrl = `/uploads/${userProfile}`;
      reply.status(200).send(response);
    } catch (error) {
      reply.status(500).send(response);
    }
  }
  @Get('/logout')
  async logoutUser(@Res() reply: any, @Req() request: any): Promise<void> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      if (!request.session.isLogged) {
        return reply.status(400).send(response);
      }
      request.session.destroy((err) => {
        if (err) {
          return reply.status(500).send(response);
        }
        reply.status(200).send(response);
      });
    } catch (error) {
      return reply.status(500).send(response);
    }
  }
  @Get('/:id')
  async findOneUser(@Res() reply: any, @Param('id') id: string): Promise<void> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      const oneUser = await this.userService.findOneUser(id);
      if (!oneUser) {
        return reply.status(404).send(response);
      } else {
        response.profileUrl = `/uploads/${oneUser.profileImage}`;
        response.data = oneUser;
        reply.status(200).send(response);
      }
    } catch (error) {
      reply.status(500).send(response);
    }
  }
  @Post('/parentgenerateotp')
  async findParent(
    @Res() reply: any,
    @Body() body: LoginParentReq,
  ): Promise<void> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      const findParent = await this.userService.parentGenerateOtp(body);
      if (!findParent) {
        return reply.status(404).send(response);
      }
      response.data = findParent;
      reply.status(200).send(response);
    } catch (error) {
      reply.status(500).send(response);
    }
  }
  @Post('/parentproccessotp')
  async processOtp(
    @Res() reply: any,
    @Body() body: LoginParentReq,
    @Req() request: any,
  ): Promise<void> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      let email = body.parentEmail;
      let otp = body.parentotp;
      const processOtp = await this.userService.parentProcessOtp(email, otp);
      if (!processOtp) {
        request.session.parentIsLogged = false;
        request.session.parentData = [];
        return reply.status(404).send(response);
      }
      request.session.parentIsLogged = true;
      request.session.parentData = processOtp;
      response.data = 'You succesfully logged';
      reply.status(200).send(response);
    } catch (error) {
      reply.status(500).send(response);
    }
  }

  @Post('/checkuser')
  async checkUserByEmail(@Res() reply: any, @Body() body: any): Promise<void> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      let email = body.email;
      const isUser = await this.userService.checkUserByEmail(email);
      if (!isUser?.length) {
        return reply.status(404).send(response);
      }
      response.data = isUser[0];
      reply.status(200).send(response);
    } catch (error) {
      reply.status(500).send(response);
    }
  }
}
