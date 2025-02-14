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
import { CategoryService } from './category.service';
import { RequestCategory } from 'src/request';
import { ResponseDto } from 'src/response';
import { Category } from 'src/schemas/category.schema';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async postCategory(
    @Body() body: RequestCategory,
    @Res() reply: any,
  ): Promise<void | Category> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      response.data = await this.categoryService.createCategory({
        name: body.name,
      });
      return reply.status(200).send(response);
    } catch (error) {
      if (error.code === 11000) {
        response.message = 'Category already exists';
      } else {
        response.message = `Error : ${error.message}`;
      }

      return reply.status(500).send(response);
    }
  }

  @Get()
  async getCategory(@Res() reply: any): Promise<void | Category> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      const getCategory = await this.categoryService.findAllUser();
      if (!getCategory.length) {
        response.message = 'Not Found';
        return reply.status(404).send(response);
      }

      response.data = getCategory;
      return reply.status(200).send(response);
    } catch (error) {
      response.message = `Error : ${error.message}`;
      reply.status(500).send(response);
    }
  }

  @Put('/:id')
  async putCategory(
    @Param('id') id: string,
    @Res() reply: any,
    @Body() body: RequestCategory,
  ): Promise<Category | null> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      const putCategory = await this.categoryService.putCategory(id, body);
      response.data = putCategory;
      return reply.status(200).send(response);
    } catch (error) {
      response.message = `Error : ${error.message}`;
      return reply.status(500).send(response);
    }
  }

  @Delete('/:id')
  async deleteCategory(
    @Param('id') id: string,
    @Res() reply: any,
  ): Promise<Category | null> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      const deleteData = await this.categoryService.deleteCategory(id);
      console.log(deleteData);
      response.data = deleteData;
      return reply.status(200).send(response);
    } catch (error) {
      response.message = `Error : ${error.message}`;
      return reply.status(500).send(response);
    }
  }

  @Get('/:id')
  async getSingleCategory(
    @Param('id') id: string,
    @Res() reply: any,
  ): Promise<Category | null> {
    const response: ResponseDto = {
      message: 'Success',
      data: null,
    };
    try {
      response.data = await this.categoryService.singleCategory(id);
      return reply.status(200).send(response);
    } catch (error) {
      response.message = `Error : ${error.message}`;
      return reply.status(500).send(response);
    }
  }
}
