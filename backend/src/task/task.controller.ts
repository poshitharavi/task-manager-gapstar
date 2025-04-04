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
} from "@nestjs/common";
import { TaskService } from "./task.service";
import { NewTaskDto } from "./dtos/new-task.dto";
import { Response } from "express";
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { UpdateTaskDto } from "./dtos/update-task.dto";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

@ApiTags("task")
@Controller("task")
@ApiBearerAuth() // All endpoints in this controller require a Bearer token
export class TaskController {
  private readonly logger = new Logger(TaskController.name);

  constructor(private readonly taskService: TaskService) {}

  @Post("new")
  @ApiOperation({ summary: "Add a new task for the authenticated user" })
  @ApiBody({ type: NewTaskDto })
  @ApiCreatedResponse({
    description: "Successfully added a new task",
    schema: {
      example: {
        statusCode: StatusCodes.OK,
        message: "Successfully new task added",
        body: {
          newTask: {
            id: 2,
            title: "Sample Title",
            status: "NOT_DONE",
            dueDate: "2025-10-04T00:00:00.000Z",
            priority: "LOW",
            recurrence: "NONE",
            nextRecurrence: null,
            active: true,
            createdAt: "2025-04-04T16:40:39.337Z",
            updatedAt: "2025-04-04T16:40:39.337Z",
            userId: 1,
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: "Invalid input for creating a new task",
  })
  @ApiInternalServerErrorResponse({
    description: "Something went wrong while adding a new task",
  })
  async addNewTask(
    @Req() request: any,
    @Res() response: Response,
    @Body() newTaskDto: NewTaskDto
  ): Promise<any> {
    try {
      const { user } = request;
      const newTask = await this.taskService.addNewTask(newTaskDto, user.sub);

      return response.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Successfully new task added",
        body: {
          newTask,
        },
      });
    } catch (error) {
      this.logger.error(`Error at /task/new : ${error.message}`);

      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Something went wrong",
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Patch("update/:id")
  @ApiOperation({
    summary: "Update an existing task by ID for the authenticated user",
  })
  @ApiParam({
    name: "id",
    type: "number",
    description: "ID of the task to update",
  })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({
    status: StatusCodes.OK,
    description: "Successfully updated the task",
    schema: {
      example: {
        statusCode: StatusCodes.OK,
        message: "Successfully updated task details of 1",
        body: {
          updatedTask: {
            id: 1,
            title: "Updated Task Title",
            description: "Updated details of the task",
            status: "IN_PROGRESS",
            userId: "user-uuid",
            updatedAt: "2025-04-05T03:05:00.000Z",
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: "Task not found" })
  @ApiConflictResponse({
    description:
      "Conflict during task update (e.g., invalid status transition)",
  })
  @ApiBadRequestResponse({ description: "Invalid input for updating the task" })
  @ApiInternalServerErrorResponse({
    description: "Something went wrong while updating the task",
  })
  async updateTask(
    @Param("id", ParseIntPipe) id: number,
    @Req() request: any,
    @Res() response: Response,
    @Body() updateTaskDto: UpdateTaskDto
  ): Promise<any> {
    try {
      const { user } = request;

      const updatedTask = await this.taskService.updateTask(
        id,
        updateTaskDto,
        user.sub
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
        return response.status(StatusCodes.NOT_FOUND).json({
          message: error.message,
          error: getReasonPhrase(StatusCodes.NOT_FOUND),
          statusCode: StatusCodes.NOT_FOUND,
        });
      }

      if (error instanceof ConflictException) {
        return response.status(StatusCodes.CONFLICT).json({
          message: error.message,
          error: getReasonPhrase(StatusCodes.CONFLICT),
          statusCode: StatusCodes.CONFLICT,
        });
      }

      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Something went wrong",
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Delete("delete/:id")
  @ApiOperation({ summary: "Delete a task by ID for the authenticated user" })
  @ApiParam({
    name: "id",
    type: "number",
    description: "ID of the task to delete",
  })
  @ApiResponse({
    status: StatusCodes.OK,
    description: "Successfully deleted the task",
    schema: {
      example: {
        statusCode: StatusCodes.OK,
        message: "Successfully deleted the task",
      },
    },
  })
  @ApiNotFoundResponse({ description: "Task not found" })
  @ApiConflictResponse({
    description: "Conflict during task deletion (e.g., task in a final state)",
  })
  @ApiInternalServerErrorResponse({
    description: "Something went wrong while deleting the task",
  })
  async deleteTask(
    @Param("id", ParseIntPipe) id: number,
    @Req() request: any,
    @Res() response: Response
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
        return response.status(StatusCodes.NOT_FOUND).json({
          message: error.message,
          error: getReasonPhrase(StatusCodes.NOT_FOUND),
          statusCode: StatusCodes.NOT_FOUND,
        });
      }

      if (error instanceof ConflictException) {
        return response.status(StatusCodes.CONFLICT).json({
          message: error.message,
          error: getReasonPhrase(StatusCodes.CONFLICT),
          statusCode: StatusCodes.CONFLICT,
        });
      }

      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Something went wrong",
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Get("my")
  @ApiOperation({ summary: "Get all tasks for the authenticated user" })
  @ApiQuery({
    name: "sortBy",
    required: false,
    type: "string",
    description: "Field to sort by",
  })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    enum: ["asc", "desc"],
    description: "Sort order (asc or desc)",
    default: "asc",
  })
  @ApiQuery({
    name: "title",
    required: false,
    type: "string",
    description: "Filter by task title",
  })
  @ApiResponse({
    status: StatusCodes.OK,
    description: "Successfully retrieved all tasks for the user",
    schema: {
      example: {
        statusCode: StatusCodes.OK,
        message: "Successfully retrieved all tasks",
        body: [
          {
            id: 1,
            title: "Task One",
            description: "Description for task one",
            status: "TODO",
            createdAt: "2025-04-05T02:00:00.000Z",
            updatedAt: "2025-04-05T02:00:00.000Z",
          },
          {
            id: 2,
            title: "Task Two",
            description: "Description for task two",
            status: "IN_PROGRESS",
            createdAt: "2025-04-05T02:30:00.000Z",
            updatedAt: "2025-04-05T02:30:00.000Z",
          },
        ],
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: "Something went wrong while retrieving tasks",
  })
  async getMyTasks(
    @Req() request: any,
    @Res() response: Response,
    @Query("sortBy") sortBy?: string,
    @Query("sortOrder") sortOrder: "asc" | "desc" = "asc",
    @Query("title") title?: string
  ): Promise<any> {
    try {
      const { user } = request;

      const tasks = await this.taskService.getMyTasks(
        user.sub,
        sortBy,
        sortOrder,
        title
      );

      return response.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Successfully retrieved all tasks",
        body: {
          ...tasks,
        },
      });
    } catch (error) {
      this.logger.error(`Error at /task/my: ${error.message}`);

      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Something went wrong",
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Patch("update-status/:id")
  @ApiOperation({
    summary: "Update the status of a task by ID for the authenticated user",
  })
  @ApiParam({
    name: "id",
    type: "number",
    description: "ID of the task to update status",
  })
  @ApiResponse({
    status: StatusCodes.OK,
    description: "Successfully updated task status",
    schema: {
      example: {
        statusCode: StatusCodes.OK,
        message: "Successfully updated task status 1",
        body: {},
      },
    },
  })
  @ApiNotFoundResponse({ description: "Task not found" })
  @ApiConflictResponse({
    description: "Conflict during status update (e.g., invalid status)",
  })
  @ApiInternalServerErrorResponse({
    description: "Something went wrong while updating the task status",
  })
  async updateStatus(
    @Param("id", ParseIntPipe) id: number,
    @Req() request: any,
    @Res() response: Response
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
        return response.status(StatusCodes.NOT_FOUND).json({
          message: error.message,
          error: getReasonPhrase(StatusCodes.NOT_FOUND),
          statusCode: StatusCodes.NOT_FOUND,
        });
      }

      if (error instanceof ConflictException) {
        return response.status(StatusCodes.CONFLICT).json({
          message: error.message,
          error: getReasonPhrase(StatusCodes.CONFLICT),
          statusCode: StatusCodes.CONFLICT,
        });
      }

      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Something went wrong",
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
