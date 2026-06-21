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
import { Response } from 'express';
import { CategoryService } from './category.service';
import { RequestCategory } from '../request';
import {
  sendError,
  sendPaginated,
  sendSuccess,
} from '../utils/api-response.util';

@Controller('api/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('/')
  async createNewCategory(
    @Body() body: RequestCategory,
    @Res() reply: Response,
  ): Promise<void> {
    try {
      const category = await this.categoryService.createCategory({
        name: body.name,
      });
      sendSuccess(reply, { item: category });
    } catch (error) {
      if (error?.code === 11000) {
        return sendError(reply, 'This entry already exists', 409);
      }
      sendError(reply, error?.message || 'Failed to create category', 500);
    }
  }

  @Get('/')
  async fetchAllCategory(
    @Res() reply: Response,
    @Query('limit') limit: number,
    @Query('page') page: number,
  ): Promise<void> {
    try {
      const result = await this.categoryService.findAllCategory(page, limit);
      const data = result as {
        limit: number;
        page: number;
        total: number;
        categoryData: unknown[];
      };
      sendPaginated(reply, data.categoryData || [], {
        limit: data.limit,
        page: data.page,
        total: data.total,
      });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to fetch categories', 500);
    }
  }

  @Put('/:id')
  async putCategory(
    @Param('id') id: string,
    @Res() reply: Response,
    @Body() body: RequestCategory,
  ): Promise<void> {
    try {
      const category = await this.categoryService.updateCategoryById(id, body);
      sendSuccess(reply, { item: category });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to update category', 500);
    }
  }

  @Delete('/:id')
  async deleteCategory(
    @Param('id') id: string,
    @Res() reply: Response,
  ): Promise<void> {
    try {
      const category = await this.categoryService.deleteCategory(id);
      sendSuccess(reply, { item: category });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to delete category', 500);
    }
  }

  @Get('/:id')
  async getSingleCategory(
    @Param('id') id: string,
    @Res() reply: Response,
  ): Promise<void> {
    try {
      const category = await this.categoryService.findCategoryById(id);
      if (!category) {
        return sendError(reply, 'Category not found', 404);
      }
      sendSuccess(reply, { item: category });
    } catch (error) {
      sendError(reply, error?.message || 'Failed to fetch category', 500);
    }
  }
}
