import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { NewTaskDto } from './dtos/new-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { MyTaskResponse } from './interface/my-tasks.interface';

const mockTaskService = {
  addNewTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  getMyTasks: jest.fn(),
  updateStatus: jest.fn(),
};

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('TaskController', () => {
  let controller: TaskController;
  let service: TaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addNewTask', () => {
    it('should call taskService.addNewTask and return success response', async () => {
      const newTaskDto: NewTaskDto = {
        title: 'Test Task',
        priority: 'HIGH',
        recurrence: 'NONE',
        dueDate: '2025-04-05',
        isDependent: false,
      };
      const mockUser = { sub: 1 };
      const mockCreatedTask = {
        id: 1,
        ...newTaskDto,
        userId: 1,
        active: true,
        status: 'NOT_DONE',
        createdAt: new Date(),
        updatedAt: new Date(),
        nextRecurrence: null,
        dependencies: [],
      };
      const res = mockResponse();

      (service.addNewTask as jest.Mock).mockResolvedValue(mockCreatedTask);

      await controller.addNewTask({ user: mockUser }, res, newTaskDto);

      expect(service.addNewTask).toHaveBeenCalledWith(newTaskDto, mockUser.sub);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: StatusCodes.OK,
        message: 'Successfully new task added',
        body: {
          newTask: mockCreatedTask,
        },
      });
    });

    it('should handle errors from taskService and return internal server error', async () => {
      const newTaskDto: NewTaskDto = {
        title: 'Test Task',
        priority: 'HIGH',
        recurrence: 'NONE',
        dueDate: '2025-04-05',
        isDependent: false,
      };
      const mockUser = { sub: 1 };
      const res = mockResponse();
      const errorMessage = 'Database error';

      (service.addNewTask as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      await controller.addNewTask({ user: mockUser }, res, newTaskDto);

      expect(service.addNewTask).toHaveBeenCalledWith(newTaskDto, mockUser.sub);
      expect(res.status).toHaveBeenCalledWith(
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
      expect(res.json).toHaveBeenCalledWith({
        message: 'Something went wrong',
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe('updateTask', () => {
    it('should call taskService.updateTask and return success response', async () => {
      const taskId = 1;
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        priority: 'MEDIUM',
        recurrence: 'WEEKLY',
        dueDate: '2025-04-12',
        isDependent: true,
        prerequisite: 2,
      };
      const mockUser = { sub: 1 };
      const mockUpdatedTask = {
        id: taskId,
        ...updateTaskDto,
        userId: 1,
        active: true,
        status: 'NOT_DONE',
        createdAt: new Date(),
        updatedAt: new Date(),
        nextRecurrence: new Date(),
        dependencies: [],
      };
      const res = mockResponse();

      (service.updateTask as jest.Mock).mockResolvedValue(mockUpdatedTask);

      await controller.updateTask(
        taskId,
        { user: mockUser },
        res,
        updateTaskDto,
      );

      expect(service.updateTask).toHaveBeenCalledWith(
        taskId,
        updateTaskDto,
        mockUser.sub,
      );
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: StatusCodes.OK,
        message: `Successfully updated task details of  ${taskId}`,
        body: {
          updatedTask: mockUpdatedTask,
        },
      });
    });

    it('should handle NotFoundException from taskService', async () => {
      const taskId = 1;
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        priority: 'MEDIUM',
        recurrence: 'WEEKLY',
        dueDate: '2025-04-12',
        isDependent: true,
        prerequisite: 2,
      };
      const mockUser = { sub: 1 };
      const res = mockResponse();
      const errorMessage = `Task with id ${taskId} not found`;

      (service.updateTask as jest.Mock).mockRejectedValue(
        new NotFoundException(errorMessage),
      );

      await controller.updateTask(
        taskId,
        { user: mockUser },
        res,
        updateTaskDto,
      );

      expect(service.updateTask).toHaveBeenCalledWith(
        taskId,
        updateTaskDto,
        mockUser.sub,
      );
      expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage,
        error: getReasonPhrase(StatusCodes.NOT_FOUND),
        statusCode: StatusCodes.NOT_FOUND,
      });
    });

    it('should handle ConflictException from taskService', async () => {
      const taskId = 1;
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        priority: 'MEDIUM',
        recurrence: 'WEEKLY',
        dueDate: '2025-04-12',
        isDependent: true,
        prerequisite: 2,
      };
      const mockUser = { sub: 1 };
      const res = mockResponse();
      const errorMessage = 'Task has a dependency that is not completed';

      (service.updateTask as jest.Mock).mockRejectedValue(
        new ConflictException(errorMessage),
      );

      await controller.updateTask(
        taskId,
        { user: mockUser },
        res,
        updateTaskDto,
      );

      expect(service.updateTask).toHaveBeenCalledWith(
        taskId,
        updateTaskDto,
        mockUser.sub,
      );
      expect(res.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage,
        error: getReasonPhrase(StatusCodes.CONFLICT),
        statusCode: StatusCodes.CONFLICT,
      });
    });

    it('should handle generic errors from taskService', async () => {
      const taskId = 1;
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        priority: 'MEDIUM',
        recurrence: 'WEEKLY',
        dueDate: '2025-04-12',
        isDependent: true,
        prerequisite: 2,
      };
      const mockUser = { sub: 1 };
      const res = mockResponse();
      const errorMessage = 'Something went wrong in the service';

      (service.updateTask as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      await controller.updateTask(
        taskId,
        { user: mockUser },
        res,
        updateTaskDto,
      );

      expect(service.updateTask).toHaveBeenCalledWith(
        taskId,
        updateTaskDto,
        mockUser.sub,
      );
      expect(res.status).toHaveBeenCalledWith(
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
      expect(res.json).toHaveBeenCalledWith({
        message: 'Something went wrong',
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe('deleteTask', () => {
    it('should call taskService.deleteTask and return success response', async () => {
      const taskId = 1;
      const mockUser = { sub: 1 };
      const res = mockResponse();

      (service.deleteTask as jest.Mock).mockResolvedValue(true);

      await controller.deleteTask(taskId, { user: mockUser }, res);

      expect(service.deleteTask).toHaveBeenCalledWith(taskId, mockUser.sub);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: StatusCodes.OK,
        message: `Successfully deleted the task`,
      });
    });

    it('should handle NotFoundException from taskService', async () => {
      const taskId = 1;
      const mockUser = { sub: 1 };
      const res = mockResponse();
      const errorMessage = `Task with id ${taskId} not found`;

      (service.deleteTask as jest.Mock).mockRejectedValue(
        new NotFoundException(errorMessage),
      );

      await controller.deleteTask(taskId, { user: mockUser }, res);

      expect(service.deleteTask).toHaveBeenCalledWith(taskId, mockUser.sub);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage,
        error: getReasonPhrase(StatusCodes.NOT_FOUND),
        statusCode: StatusCodes.NOT_FOUND,
      });
    });

    it('should handle generic errors from taskService', async () => {
      const taskId = 1;
      const mockUser = { sub: 1 };
      const res = mockResponse();
      const errorMessage = 'Something went wrong in the service';

      (service.deleteTask as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      await controller.deleteTask(taskId, { user: mockUser }, res);

      expect(service.deleteTask).toHaveBeenCalledWith(taskId, mockUser.sub);
      expect(res.status).toHaveBeenCalledWith(
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
      expect(res.json).toHaveBeenCalledWith({
        message: 'Something went wrong',
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe('getMyTasks', () => {
    it('should call taskService.getMyTasks and return success response with tasks', async () => {
      const mockUser = { sub: 1 };
      const mockTasksResponse: MyTaskResponse = {
        tasks: [
          {
            id: 1,
            title: 'Task 1',
            status: 'NOT_DONE',
            dueDate: '2025-04-01',
            priority: 'HIGH',
            recurrence: 'NONE',
            nextRecurrence: null,
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: 1,
            dependencies: [],
          },
          {
            id: 2,
            title: 'Task 2',
            status: 'DONE',
            dueDate: '2025-04-05',
            priority: 'MEDIUM',
            recurrence: 'WEEKLY',
            nextRecurrence: new Date(),
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: 1,
            dependencies: [],
          },
        ],
        counts: {
          active: 1,
          completed: 1,
        },
      };
      const res = mockResponse();

      (service.getMyTasks as jest.Mock).mockResolvedValue(mockTasksResponse);

      await controller.getMyTasks(
        { user: mockUser },
        res,
        undefined,
        'asc',
        undefined,
      );

      expect(service.getMyTasks).toHaveBeenCalledWith(
        mockUser.sub,
        undefined,
        'asc',
        undefined,
      );
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: StatusCodes.OK,
        message: 'Successfully retrieved all tasks',
        body: {
          ...mockTasksResponse,
        },
      });
    });

    it('should call taskService.getMyTasks with provided query parameters', async () => {
      const mockUser = { sub: 1 };
      const mockTasksResponse: MyTaskResponse = {
        tasks: [],
        counts: { active: 0, completed: 0 },
      };
      const res = mockResponse();
      const sortBy = 'dueDate';
      const sortOrder = 'desc';
      const title = 'Test';

      (service.getMyTasks as jest.Mock).mockResolvedValue(mockTasksResponse);

      await controller.getMyTasks(
        { user: mockUser },
        res,
        sortBy,
        sortOrder,
        title,
      );

      expect(service.getMyTasks).toHaveBeenCalledWith(
        mockUser.sub,
        sortBy,
        sortOrder,
        title,
      );
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: StatusCodes.OK,
        message: 'Successfully retrieved all tasks',
        body: {
          ...mockTasksResponse,
        },
      });
    });

    it('should handle errors from taskService and return internal server error', async () => {
      const mockUser = { sub: 1 };
      const res = mockResponse();
      const errorMessage = 'Database error';

      (service.getMyTasks as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      await controller.getMyTasks(
        { user: mockUser },
        res,
        undefined,
        'asc',
        undefined,
      );

      expect(service.getMyTasks).toHaveBeenCalledWith(
        mockUser.sub,
        undefined,
        'asc',
        undefined,
      );
      expect(res.status).toHaveBeenCalledWith(
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
      expect(res.json).toHaveBeenCalledWith({
        message: 'Something went wrong',
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe('updateStatus', () => {
    it('should call taskService.updateStatus and return success response', async () => {
      const taskId = 1;
      const mockUser = { sub: 1 };
      const res = mockResponse();

      (service.updateStatus as jest.Mock).mockResolvedValue(true);

      await controller.updateStatus(taskId, { user: mockUser }, res);

      expect(service.updateStatus).toHaveBeenCalledWith(taskId, mockUser.sub);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: StatusCodes.OK,
        message: `Successfully updated task status ${taskId}`,
        body: {},
      });
    });

    it('should handle NotFoundException from taskService', async () => {
      const taskId = 1;
      const mockUser = { sub: 1 };
      const res = mockResponse();
      const errorMessage = `Task with id ${taskId} not found`;

      (service.updateStatus as jest.Mock).mockRejectedValue(
        new NotFoundException(errorMessage),
      );

      await controller.updateStatus(taskId, { user: mockUser }, res);

      expect(service.updateStatus).toHaveBeenCalledWith(taskId, mockUser.sub);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage,
        error: getReasonPhrase(StatusCodes.NOT_FOUND),
        statusCode: StatusCodes.NOT_FOUND,
      });
    });

    it('should handle ConflictException from taskService', async () => {
      const taskId = 1;
      const mockUser = { sub: 1 };
      const res = mockResponse();
      const errorMessage = 'Task has a dependency that is not completed';

      (service.updateStatus as jest.Mock).mockRejectedValue(
        new ConflictException(errorMessage),
      );

      await controller.updateStatus(taskId, { user: mockUser }, res);

      expect(service.updateStatus).toHaveBeenCalledWith(taskId, mockUser.sub);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage,
        error: getReasonPhrase(StatusCodes.CONFLICT),
        statusCode: StatusCodes.CONFLICT,
      });
    });

    it('should handle generic errors from taskService', async () => {
      const taskId = 1;
      const mockUser = { sub: 1 };
      const res = mockResponse();
      const errorMessage = 'Something went wrong in the service';

      (service.updateStatus as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      await controller.updateStatus(taskId, { user: mockUser }, res);

      expect(service.updateStatus).toHaveBeenCalledWith(taskId, mockUser.sub);
      expect(res.status).toHaveBeenCalledWith(
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
      expect(res.json).toHaveBeenCalledWith({
        message: 'Something went wrong',
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    });
  });
});
