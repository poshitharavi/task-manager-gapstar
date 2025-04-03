import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { NewTaskDto } from './dtos/new-task.dto';
import { Response } from 'express';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { UpdateTaskDto } from './dtos/update-task.dto';

@Controller('task')
export class TaskController {
  private readonly logger = new Logger(TaskController.name);

  constructor(private readonly taskService: TaskService) {}

  @Post('new')
  async addNewTask(
    @Req() request: any,
    @Res() response: Response,
    @Body() newTaskDto: NewTaskDto,
  ): Promise<any> {
    try {
      const { user } = request;
      const newTask = await this.taskService.addNewTask(newTaskDto, user.sub);

      return response.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: 'Successfully new task added',
        body: {
          newTask,
        },
      });
    } catch (error) {
      this.logger.error(`Error at /task/new : ${error.message}`);

      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Something went wrong',
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }
  @Patch('update/:id')
  async updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: any,
    @Res() response: Response,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<any> {
    try {
      const { user } = request;

      const updatedTask = await this.taskService.updateTask(
        id,
        updateTaskDto,
        user.sub,
      );

      return response.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: `Successfully updated task details of  ${updatedTask.id}`,
        body: {
          updatedTask,
        },
      });
    } catch (error) {
      this.logger.error(`Error at /task/${id}: ${error.message}`);

      if (error instanceof NotFoundException) {
        // Handle UnauthorizedException differently
        return response.status(StatusCodes.NOT_FOUND).json({
          message: error.message,
          error: getReasonPhrase(StatusCodes.NOT_FOUND),
          statusCode: StatusCodes.NOT_FOUND,
        });
      }

      if (error instanceof ConflictException) {
        // Handle UnauthorizedException differently
        return response.status(StatusCodes.CONFLICT).json({
          message: error.message,
          error: getReasonPhrase(StatusCodes.CONFLICT),
          statusCode: StatusCodes.CONFLICT,
        });
      }

      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Something went wrong',
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Delete('delete/:id')
  async deleteTask(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: any,
    @Res() response: Response,
  ): Promise<any> {
    try {
      const { user } = request;

      await this.taskService.deleteTask(id, user.sub);

      return response.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: `Successfully deleted the task`,
      });
    } catch (error) {
      this.logger.error(`Error at /task/delete/${id}: ${error.message}`);

      if (error instanceof NotFoundException) {
        // Handle UnauthorizedException differently
        return response.status(StatusCodes.NOT_FOUND).json({
          message: error.message,
          error: getReasonPhrase(StatusCodes.NOT_FOUND),
          statusCode: StatusCodes.NOT_FOUND,
        });
      }

      if (error instanceof ConflictException) {
        // Handle UnauthorizedException differently
        return response.status(StatusCodes.CONFLICT).json({
          message: error.message,
          error: getReasonPhrase(StatusCodes.CONFLICT),
          statusCode: StatusCodes.CONFLICT,
        });
      }

      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Something went wrong',
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Get('my')
  async getMyTasks(
    @Req() request: any,
    @Res() response: Response,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
    @Query('title') title?: string,
  ): Promise<any> {
    try {
      const { user } = request;

      const tasks = await this.taskService.getMyTasks(
        user.sub,
        sortBy,
        sortOrder,
        title,
      );

      return response.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: 'Successfully retrieved all tasks',
        body: {
          ...tasks,
        },
      });
    } catch (error) {
      this.logger.error(`Error at /task/my: ${error.message}`);

      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Something went wrong',
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Patch('update-status/:id')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: any,
    @Res() response: Response,
  ): Promise<any> {
    try {
      const { user } = request;

      await this.taskService.updateStatus(id, user.sub);

      return response.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: `Successfully updated task status ${id}`,
        body: {},
      });
    } catch (error) {
      this.logger.error(`Error at /task/${id}: ${error.message}`);

      if (error instanceof NotFoundException) {
        // Handle UnauthorizedException differently
        return response.status(StatusCodes.NOT_FOUND).json({
          message: error.message,
          error: getReasonPhrase(StatusCodes.NOT_FOUND),
          statusCode: StatusCodes.NOT_FOUND,
        });
      }

      if (error instanceof ConflictException) {
        // Handle UnauthorizedException differently
        return response.status(StatusCodes.CONFLICT).json({
          message: error.message,
          error: getReasonPhrase(StatusCodes.CONFLICT),
          statusCode: StatusCodes.CONFLICT,
        });
      }

      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Something went wrong',
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
