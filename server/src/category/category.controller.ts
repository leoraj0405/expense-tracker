import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Res,
  Param,
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { RequestCategory } from 'src/request';
import { ResponseDto } from 'src/response';
import { Category } from 'src/schemas/category.schema';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('/')
  async createNewCategory(
    @Body() body: RequestCategory,
    @Res() reply: any,
  ): Promise<void | Category> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      response.data = await this.categoryService.createCategory({
        name: body.name,
      });
      reply.status(200).send(response);
    } catch (error) {
      if (error.code === 11000) {
        return reply.status(409).send('This entry already exists');
      }
      reply.status(500).send(response);
    }
  }

  @Get('/')
  async fetchAllCategory(
    @Res() reply: any,
    @Query('limit') limit: number,
    @Query('page') page: number,
  ): Promise<void | Category> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      const getCategory = await this.categoryService.findAllCategory(
        page,
        limit,
      );
      if (!Array(getCategory).length) {
        response.data = [];
        return reply.status(404).send(response);
      }
      response.data = getCategory;
      reply.status(200).send(response);
    } catch (error) {
      reply.status(500).send(error);
    }
  }

  @Put('/:id')
  async putCategory(
    @Param('id') id: string,
    @Res() reply: any,
    @Body() body: RequestCategory,
  ): Promise<Category | void> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      const putCategory = await this.categoryService.updateCategoryById(
        id,
        body,
      );
      response.data = putCategory;
      reply.status(200).send(response);
    } catch (error) {
      reply.status(500).send(response);
    }
  }

  @Delete('/:id')
  async deleteCategory(
    @Param('id') id: string,
    @Res() reply: any,
  ): Promise<Category | void> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      const deleteData = await this.categoryService.deleteCategory(id);
      response.data = deleteData;
      reply.status(200).send(response);
    } catch (error) {
      reply.status(500).send(error.message);
    }
  }

  @Get('/:id')
  async getSingleCategory(
    @Param('id') id: string,
    @Res() reply: any,
  ): Promise<Category | void> {
    const response: ResponseDto = {
      data: null,
    };
    try {
      const oneCategory = await this.categoryService.findCategoryById(id);
      if (!oneCategory) {
        return reply.status(404).send(response);
      }
      response.data = oneCategory;
      reply.status(200).send(response);
    } catch (error) {
      reply.status(500).send(response);
    }
  }
}
