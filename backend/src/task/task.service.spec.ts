import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { PrismaService } from '../prisma/prisma.service';
import { NewTaskDto } from './dtos/new-task.dto';
import { Priority, Recurrence, Task, TaskStatus } from '@prisma/client';
import { UpdateTaskDto } from './dtos/update-task.dto';
// import { NotFoundException, ConflictException } from '@nestjs/common';
import { calculateNextRecurrence } from '../common/util/recurrence.utils';

const mockPrismaService = {
  task: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  taskDependency: {
    create: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock('../common/util/recurrence.utils', () => ({
  calculateNextRecurrence: jest.fn(),
}));

describe('TaskService', () => {
  let service: TaskService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addNewTask', () => {
    const userId = 1;
    const newTaskDto: any = {
      title: 'Test Task',
      priority: 'HIGH',
      recurrence: 'NONE',
      dueDate: '2025-04-05',
      isDependent: false,
    };
    const mockNextRecurrence = null;
    const mockCreatedTask: any = {
      id: 1,
      ...newTaskDto,
      userId,
      active: true,
      status: 'NOT_DONE',
      createdAt: new Date(),
      updatedAt: new Date(),
      nextRecurrence: mockNextRecurrence,
      dependencies: [],
    };

    beforeEach(() => {
      (calculateNextRecurrence as jest.Mock).mockReturnValue(
        mockNextRecurrence,
      );
      (prisma.task.create as jest.Mock).mockResolvedValue(mockCreatedTask);
      (prisma.taskDependency.create as jest.Mock).mockResolvedValue(undefined); // No return value for create
    });

    it('should create a new task and return it', async () => {
      const result = await service.addNewTask(newTaskDto, userId);
      expect(calculateNextRecurrence).toHaveBeenCalledWith(
        newTaskDto.recurrence,
        newTaskDto.dueDate,
      );
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: newTaskDto.title,
          priority: newTaskDto.priority,
          recurrence: newTaskDto.recurrence,
          dueDate: newTaskDto.dueDate,
          userId: userId,
          nextRecurrence: mockNextRecurrence,
        },
      });
      expect(prisma.taskDependency.create).not.toHaveBeenCalled();
      expect(result).toEqual(mockCreatedTask);
    });

    it('should create a new task with a dependency if isDependent is true', async () => {
      const newTaskDtoWithDependency: NewTaskDto = {
        ...newTaskDto,
        isDependent: true,
        prerequisite: 2,
      };
      const result = await service.addNewTask(newTaskDtoWithDependency, userId);
      expect(calculateNextRecurrence).toHaveBeenCalledWith(
        newTaskDtoWithDependency.recurrence,
        newTaskDtoWithDependency.dueDate,
      );
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: newTaskDtoWithDependency.title,
          priority: newTaskDtoWithDependency.priority,
          recurrence: newTaskDtoWithDependency.recurrence,
          dueDate: newTaskDtoWithDependency.dueDate,
          userId: userId,
          nextRecurrence: mockNextRecurrence,
        },
      });
      expect(prisma.taskDependency.create).toHaveBeenCalledWith({
        data: {
          dependentId: mockCreatedTask.id,
          prerequisiteId: newTaskDtoWithDependency.prerequisite,
        },
      });
      expect(result).toEqual(mockCreatedTask);
    });

    // it('should throw an error if prisma.task.create fails and not try to create a dependency', async () => {
    //   const newTaskDtoWithDependency: NewTaskDto = {
    //     ...newTaskDto,
    //     isDependent: true,
    //     prerequisite: 2,
    //   };
    //   const errorMessage = 'Database error';
    //   (prisma.task.create as jest.Mock).mockRejectedValue(
    //     new Error(errorMessage),
    //   );

    //   await expect(
    //     service.addNewTask(newTaskDtoWithDependency, userId),
    //   ).rejects.toThrow(errorMessage);
    //   expect(calculateNextRecurrence).toHaveBeenCalledWith(
    //     newTaskDtoWithDependency.recurrence,
    //     newTaskDtoWithDependency.dueDate,
    //   );
    //   expect(prisma.taskDependency.create).not.toHaveBeenCalled();
    // });

    it('should throw an error if prisma.taskDependency.create fails', async () => {
      const newTaskDtoWithDependency: NewTaskDto = {
        ...newTaskDto,
        isDependent: true,
        prerequisite: 2,
      };
      const errorMessage = 'Dependency creation failed';
      (prisma.taskDependency.create as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );
      (prisma.task.create as jest.Mock).mockResolvedValue(mockCreatedTask); // Ensure task creation succeeds

      await expect(
        service.addNewTask(newTaskDtoWithDependency, userId),
      ).rejects.toThrow(errorMessage);
      expect(calculateNextRecurrence).toHaveBeenCalledWith(
        newTaskDtoWithDependency.recurrence,
        newTaskDtoWithDependency.dueDate,
      );
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: newTaskDtoWithDependency.title,
          priority: newTaskDtoWithDependency.priority,
          recurrence: newTaskDtoWithDependency.recurrence,
          dueDate: newTaskDtoWithDependency.dueDate,
          userId: userId,
          nextRecurrence: mockNextRecurrence,
        },
      });
    });
  });

  describe('updateTask', () => {
    const userId = 1;
    const taskId = 1;
    const initialTask: any = {
      // Using 'any' for brevity in mock
      id: taskId,
      title: 'Old Task',
      priority: 'LOW',
      recurrence: 'NONE',
      dueDate: '2025-03-25',
      userId,
      active: true,
      status: 'NOT_DONE',
      createdAt: new Date(),
      updatedAt: new Date(),
      nextRecurrence: null,
      dependencies: [],
    };
    const updateTaskDto: UpdateTaskDto = {
      title: 'Updated Task',
      priority: 'HIGH',
      recurrence: 'WEEKLY',
      dueDate: '2025-04-05',
      isDependent: true,
      prerequisite: 2,
    };
    const mockNextRecurrence = new Date('2025-04-12');
    const mockUpdatedTask: Task = {
      ...initialTask,
      ...updateTaskDto,
      nextRecurrence: mockNextRecurrence,
      dependencies: [
        {
          id: 3,
          dependentId: taskId,
          prerequisiteId: 2,
          prerequisite: {
            id: 2,
            title: 'Prerequisite',
            status: 'DONE',
            dueDate: '2025-03-20',
            priority: 'MEDIUM',
            recurrence: 'NONE',
            nextRecurrence: null,
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: 1,
          },
        },
      ],
    };

    beforeEach(() => {
      (prisma.task.findUniqueOrThrow as jest.Mock).mockResolvedValue(
        initialTask,
      );
      (prisma.task.update as jest.Mock).mockResolvedValue(mockUpdatedTask);
      (prisma.taskDependency.upsert as jest.Mock).mockResolvedValue(undefined);
      (prisma.taskDependency.delete as jest.Mock).mockResolvedValue(undefined);
      (calculateNextRecurrence as jest.Mock).mockReturnValue(
        mockNextRecurrence,
      );
    });

    it('should update an existing task and its dependency', async () => {
      const result = await service.updateTask(taskId, updateTaskDto, userId);
      expect(prisma.task.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: taskId, active: true, userId, status: 'NOT_DONE' },
        include: { dependencies: true },
      });
      expect(calculateNextRecurrence).toHaveBeenCalledWith(
        updateTaskDto.recurrence,
        updateTaskDto.dueDate,
      );
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: {
          title: updateTaskDto.title,
          priority: updateTaskDto.priority,
          recurrence: updateTaskDto.recurrence,
          dueDate: updateTaskDto.dueDate,
          userId,
          nextRecurrence: mockNextRecurrence,
        },
      });
      expect(prisma.taskDependency.upsert).toHaveBeenCalledWith({
        where: {
          dependentId_prerequisiteId: {
            dependentId: taskId,
            prerequisiteId: updateTaskDto.prerequisite,
          },
        },
        update: { prerequisiteId: updateTaskDto.prerequisite },
        create: {
          dependentId: taskId,
          prerequisiteId: updateTaskDto.prerequisite,
        },
      });
      expect(prisma.taskDependency.delete).not.toHaveBeenCalled();
      expect(result).toEqual(mockUpdatedTask);
    });

    it('should update a task and remove an existing dependency if isDependent is false', async () => {
      const taskWithDependency = { ...initialTask, dependencies: [{ id: 3 }] };
      (prisma.task.findUniqueOrThrow as jest.Mock).mockResolvedValue(
        taskWithDependency,
      );
      const updateDtoWithoutDependency: UpdateTaskDto = {
        ...updateTaskDto,
        isDependent: false,
        prerequisite: undefined,
      };
      const mockUpdatedTaskWithoutDependency = {
        ...mockUpdatedTask,
        ...updateDtoWithoutDependency,
        dependencies: [],
      };
      (prisma.task.update as jest.Mock).mockResolvedValue(
        mockUpdatedTaskWithoutDependency,
      );

      // Reset or redefine the mock for prisma.taskDependency.upsert for this test
      (prisma.taskDependency.upsert as jest.Mock).mockReset();

      const result = await service.updateTask(
        taskId,
        updateDtoWithoutDependency,
        userId,
      );

      expect(prisma.task.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: taskId, active: true, userId, status: 'NOT_DONE' },
        include: { dependencies: true },
      });
      expect(calculateNextRecurrence).toHaveBeenCalledWith(
        updateDtoWithoutDependency.recurrence,
        updateDtoWithoutDependency.dueDate,
      );
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: {
          title: updateDtoWithoutDependency.title,
          priority: updateDtoWithoutDependency.priority,
          recurrence: updateDtoWithoutDependency.recurrence,
          dueDate: updateDtoWithoutDependency.dueDate,
          userId,
          nextRecurrence: mockNextRecurrence,
        },
      });
      expect(prisma.taskDependency.upsert).not.toHaveBeenCalled();
      expect(prisma.taskDependency.delete).toHaveBeenCalledWith({
        where: { id: 3 },
      });
      expect(result).toEqual(mockUpdatedTaskWithoutDependency);
    });

    // it('should throw NotFoundException if the task does not exist', async () => {
    //   const errorMessage = `Task with id ${taskId} not found`;
    //   (prisma.task.findUniqueOrThrow as jest.Mock).mockRejectedValue({
    //     code: 'P2025',
    //     message: errorMessage,
    //   });

    //   // Reset the mock for prisma.task.update
    //   (prisma.task.update as jest.Mock).mockReset();

    //   await expect(
    //     service.updateTask(taskId, updateTaskDto, userId),
    //   ).rejects.toThrow(NotFoundException);
    //   await expect(
    //     service.updateTask(taskId, updateTaskDto, userId),
    //   ).rejects.toThrow(errorMessage);
    //   expect(prisma.task.findUniqueOrThrow).toHaveBeenCalledWith({
    //     where: { id: taskId, active: true, userId, status: 'NOT_DONE' },
    //     include: { dependencies: true },
    //   });
    //   expect(calculateNextRecurrence).toHaveBeenCalledWith(
    //     updateTaskDto.recurrence,
    //     updateTaskDto.dueDate,
    //   );
    //   expect(prisma.task.update).not.toHaveBeenCalled();
    //   expect(prisma.taskDependency.upsert).not.toHaveBeenCalled();
    //   expect(prisma.taskDependency.delete).not.toHaveBeenCalled();
    // });

    // it('should throw the original error if prisma.task.findUniqueOrThrow fails with a non-P2025 error', async () => {
    //   const errorMessage = 'Database connection error';
    //   (prisma.task.findUniqueOrThrow as jest.Mock).mockRejectedValue(
    //     new Error(errorMessage),
    //   );

    //   await expect(
    //     service.updateTask(taskId, updateTaskDto, userId),
    //   ).rejects.toThrow(errorMessage);
    //   expect(prisma.task.findUniqueOrThrow).toHaveBeenCalledWith({
    //     where: { id: taskId, active: true, userId, status: 'NOT_DONE' },
    //     include: { dependencies: true },
    //   });
    //   expect(calculateNextRecurrence).toHaveBeenCalledWith(
    //     updateTaskDto.recurrence,
    //     updateTaskDto.dueDate,
    //   );
    //   expect(prisma.task.update).not.toHaveBeenCalled();
    //   expect(prisma.taskDependency.upsert).not.toHaveBeenCalled();
    //   expect(prisma.taskDependency.delete).not.toHaveBeenCalled();
    // });

    // it('should throw an error if prisma.task.update fails', async () => {
    //   const errorMessage = 'Task update failed';
    //   (prisma.task.update as jest.Mock).mockRejectedValue(
    //     new Error(errorMessage),
    //   );

    //   await expect(
    //     service.updateTask(taskId, updateTaskDto, userId),
    //   ).rejects.toThrow(errorMessage);
    //   expect(prisma.task.findUniqueOrThrow).toHaveBeenCalledWith({
    //     where: { id: taskId, active: true, userId, status: 'NOT_DONE' },
    //     include: { dependencies: true },
    //   });
    //   expect(calculateNextRecurrence).toHaveBeenCalledWith(
    //     updateTaskDto.recurrence,
    //     updateTaskDto.dueDate,
    //   );
    //   expect(prisma.taskDependency.upsert).toHaveBeenCalledWith({
    //     where: {
    //       dependentId_prerequisiteId: {
    //         dependentId: taskId,
    //         prerequisiteId: updateTaskDto.prerequisite,
    //       },
    //     },
    //     update: { prerequisiteId: updateTaskDto.prerequisite },
    //     create: {
    //       dependentId: taskId,
    //       prerequisiteId: updateTaskDto.prerequisite,
    //     },
    //   });
    // });

    it('should throw an error if prisma.taskDependency.upsert fails', async () => {
      const errorMessage = 'Dependency upsert failed';
      (prisma.taskDependency.upsert as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(
        service.updateTask(taskId, updateTaskDto, userId),
      ).rejects.toThrow(errorMessage);
      expect(prisma.task.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: taskId, active: true, userId, status: 'NOT_DONE' },
        include: { dependencies: true },
      });
      expect(calculateNextRecurrence).toHaveBeenCalledWith(
        updateTaskDto.recurrence,
        updateTaskDto.dueDate,
      );
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: {
          title: updateTaskDto.title,
          priority: updateTaskDto.priority,
          recurrence: updateTaskDto.recurrence,
          dueDate: updateTaskDto.dueDate,
          userId,
          nextRecurrence: mockNextRecurrence,
        },
      });
    });

    // it('should throw an error if prisma.taskDependency.delete fails', async () => {
    //   const taskWithDependency = { ...initialTask, dependencies: [{ id: 3 }] };
    //   (prisma.task.findUniqueOrThrow as jest.Mock).mockResolvedValue(
    //     taskWithDependency,
    //   );
    //   const updateDtoWithoutDependency: UpdateTaskDto = {
    //     ...updateTaskDto,
    //     isDependent: false,
    //     prerequisite: undefined,
    //   };
    //   const mockUpdatedTaskWithoutDependency = {
    //     ...mockUpdatedTask,
    //     ...updateDtoWithoutDependency,
    //     dependencies: [],
    //   };
    //   (prisma.task.update as jest.Mock).mockResolvedValue(
    //     mockUpdatedTaskWithoutDependency,
    //   );
    //   const errorMessage = 'Dependency deletion failed';
    //   (prisma.taskDependency.delete as jest.Mock).mockRejectedValue(
    //     new Error(errorMessage),
    //   );

    //   await expect(
    //     service.updateTask(taskId, updateDtoWithoutDependency, userId),
    //   ).rejects.toThrow(errorMessage);
    //   expect(prisma.task.findUniqueOrThrow).toHaveBeenCalledWith({
    //     where: { id: taskId, active: true, userId, status: 'NOT_DONE' },
    //     include: { dependencies: true },
    //   });
    //   expect(calculateNextRecurrence).toHaveBeenCalledWith(
    //     updateDtoWithoutDependency.recurrence,
    //     updateDtoWithoutDependency.dueDate,
    //   );
    //   expect(prisma.task.update).toHaveBeenCalledWith({
    //     where: { id: taskId },
    //     data: {
    //       title: updateDtoWithoutDependency.title,
    //       priority: updateDtoWithoutDependency.priority,
    //       recurrence: updateDtoWithoutDependency.recurrence,
    //       dueDate: updateDtoWithoutDependency.dueDate,
    //       userId,
    //       nextRecurrence: mockNextRecurrence,
    //     },
    //   });
    //   expect(prisma.taskDependency.upsert).not.toHaveBeenCalled();
    // });
  });

  describe('deleteTask', () => {
    const userId = 1;
    const taskId = 1;
    const existingTask = {
      id: taskId,
      title: 'Test Task',
      priority: 'HIGH',
      recurrence: 'NONE',
      dueDate: '2025-04-05',
      userId,
      active: true,
      status: 'NOT_DONE',
      createdAt: new Date(),
      updatedAt: new Date(),
      nextRecurrence: null,
      dependencies: [],
    };

    beforeEach(() => {
      (prisma.task.findUniqueOrThrow as jest.Mock).mockResolvedValue(
        existingTask,
      );
      (prisma.task.update as jest.Mock).mockResolvedValue({
        ...existingTask,
        active: false,
      });
    });

    it('should successfully delete a task by setting active to false', async () => {
      const result = await service.deleteTask(taskId, userId);
      expect(prisma.task.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: taskId, active: true, userId, status: 'NOT_DONE' },
      });
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: { active: false },
      });
      expect(result).toBe(true);
    });

    // it('should throw NotFoundException if the task does not exist', async () => {
    //   const errorMessage = `Task with id ${taskId} not found`;
    //   (prisma.task.findUniqueOrThrow as jest.Mock).mockRejectedValue({
    //     code: 'P2025',
    //     message: errorMessage,
    //   });

    //   await expect(service.deleteTask(taskId, userId)).rejects.toThrow(
    //     NotFoundException,
    //   );
    //   await expect(service.deleteTask(taskId, userId)).rejects.toThrow(
    //     errorMessage,
    //   );
    //   expect(prisma.task.findUniqueOrThrow).toHaveBeenCalledWith({
    //     where: { id: taskId, active: true, userId, status: 'NOT_DONE' },
    //   });
    //   expect(prisma.task.update).not.toHaveBeenCalled();
    // });

    // it('should throw the original error if prisma.task.findUniqueOrThrow fails with a non-P2025 error', async () => {
    //   const errorMessage = 'Database connection error';
    //   (prisma.task.findUniqueOrThrow as jest.Mock).mockRejectedValue(
    //     new Error(errorMessage),
    //   );

    //   await expect(service.deleteTask(taskId, userId)).rejects.toThrow(
    //     errorMessage,
    //   );
    //   expect(prisma.task.findUniqueOrThrow).toHaveBeenCalledWith({
    //     where: { id: taskId, active: true, userId, status: 'NOT_DONE' },
    //   });
    //   expect(prisma.task.update).not.toHaveBeenCalled();
    // });

    it('should throw an error if prisma.task.update fails', async () => {
      const errorMessage = 'Task update failed';
      (prisma.task.update as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(service.deleteTask(taskId, userId)).rejects.toThrow(
        errorMessage,
      );
      expect(prisma.task.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: taskId, active: true, userId, status: 'NOT_DONE' },
      });
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: { active: false },
      });
    });
  });

  describe('getMyTasks', () => {
    const userId = 1;
    const mockTasks = [
      {
        id: 1,
        title: 'Task 1',
        status: 'NOT_DONE' as TaskStatus,
        dueDate: new Date('2025-04-01'),
        priority: 'HIGH' as Priority,
        recurrence: 'NONE' as Recurrence,
        nextRecurrence: null,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId,
        dependencies: [],
      },
      {
        id: 2,
        title: 'Task 2',
        status: 'DONE' as TaskStatus,
        dueDate: new Date('2025-04-05'),
        priority: 'MEDIUM' as Priority,
        recurrence: 'WEEKLY' as Recurrence,
        nextRecurrence: new Date('2025-04-12'),
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId,
        dependencies: [
          {
            id: 3,
            dependentId: 2,
            prerequisiteId: 1,
            prerequisite: {
              id: 1,
              title: 'Task 1',
              status: 'NOT_DONE' as TaskStatus,
              dueDate: new Date('2025-04-01'),
              priority: 'HIGH' as Priority,
              recurrence: 'NONE' as Recurrence,
              nextRecurrence: null,
              active: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              userId,
            },
          } as any, // Casting to 'any' to avoid strict type checking for nested object
        ],
      },
    ];
    const mockActiveCount = 1;
    const mockCompletedCount = 1;

    beforeEach(() => {
      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);
      (prisma.task.count as jest.Mock)
        .mockResolvedValueOnce(mockActiveCount)
        .mockResolvedValueOnce(mockCompletedCount);
    });

    it('should retrieve all active tasks for a user with default sorting', async () => {
      const result = await service.getMyTasks(userId);
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { active: true, userId },
        include: { dependencies: { include: { prerequisite: true } } },
        orderBy: [{ id: 'asc' }],
      });
      expect(prisma.task.count).toHaveBeenCalledWith({
        where: { active: true, userId },
      });
      expect(prisma.task.count).toHaveBeenCalledWith({
        where: { status: 'DONE', userId },
      });
      expect(result).toEqual({
        tasks: mockTasks,
        counts: { active: mockActiveCount, completed: mockCompletedCount },
      });
    });

    it('should retrieve tasks with specified sorting parameters', async () => {
      const sortBy = 'dueDate';
      const sortOrder = 'desc';
      await service.getMyTasks(userId, sortBy, sortOrder);
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { active: true, userId },
        include: { dependencies: { include: { prerequisite: true } } },
        orderBy: [{ [sortBy]: sortOrder }],
      });
      expect(prisma.task.count).toHaveBeenCalledWith({
        where: { active: true, userId },
      });
      expect(prisma.task.count).toHaveBeenCalledWith({
        where: { status: 'DONE', userId },
      });
    });

    // it('should retrieve tasks filtered by title', async () => {
    //   const title = 'Task';
    //   await service.getMyTasks(userId, undefined, 'asc', title);
    //   expect(prisma.task.findMany).toHaveBeenCalledWith({
    //     where: {
    //       active: true,
    //       userId,
    //       title: { contains: title, mode: 'insensitive' },
    //     },
    //     include: { dependencies: { include: { prerequisite: true } } },
    //     orderBy: [{ id: 'asc' }],
    //   });
    //   expect(prisma.task.count).toHaveBeenCalledWith({
    //     where: {
    //       active: true,
    //       userId,
    //       title: { contains: title, mode: 'insensitive' },
    //     },
    //   });
    //   expect(prisma.task.count).toHaveBeenCalledWith({
    //     where: {
    //       status: 'DONE',
    //       userId,
    //       title: { contains: title, mode: 'insensitive' },
    //     },
    //   });
    // });

    // it('should handle errors during findMany', async () => {
    //   const errorMessage = 'Error fetching tasks';
    //   (prisma.task.findMany as jest.Mock).mockRejectedValue(
    //     new Error(errorMessage),
    //   );

    //   await expect(service.getMyTasks(userId)).rejects.toThrow(errorMessage);
    //   expect(prisma.task.count).not.toHaveBeenCalled();
    // });

    // it('should handle errors during count operations', async () => {
    //   const errorMessage = 'Error counting tasks';
    //   (prisma.task.count as jest.Mock).mockRejectedValue(
    //     new Error(errorMessage),
    //   );

    //   await expect(service.getMyTasks(userId)).rejects.toThrow(errorMessage);
    //   expect(prisma.task.findMany).toHaveBeenCalledWith({
    //     where: { active: true, userId },
    //     include: { dependencies: { include: { prerequisite: true } } },
    //     orderBy: [{ id: 'asc' }],
    //   });
    // });
  });

  describe('updateStatus', () => {
    const userId = 1;
    const taskId = 1;
    const notDoneTask = {
      id: taskId,
      title: 'Not Done Task',
      status: 'NOT_DONE' as TaskStatus,
      active: true,
      userId,
      dependencies: [],
    };
    const doneTask = { ...notDoneTask, status: 'DONE' as TaskStatus };
    const notDoneTaskWithDependency = {
      ...notDoneTask,
      dependencies: [
        {
          prerequisite: { status: 'NOT_DONE' as TaskStatus },
        } as any,
      ],
    };
    const doneTaskWithDependency = {
      ...notDoneTask,
      dependencies: [
        {
          prerequisite: { status: 'DONE' as TaskStatus },
        } as any,
      ],
    };

    beforeEach(() => {
      (prisma.task.findUniqueOrThrow as jest.Mock)
        .mockResolvedValueOnce(notDoneTask)
        .mockResolvedValueOnce(doneTask)
        .mockResolvedValueOnce(notDoneTaskWithDependency)
        .mockResolvedValueOnce(doneTaskWithDependency)
        .mockResolvedValueOnce({
          ...notDoneTaskWithDependency,
          dependencies: [
            { prerequisite: { status: 'DONE' as TaskStatus } } as any,
          ],
        }); // For successful dependency check
      (prisma.task.update as jest.Mock)
        .mockResolvedValueOnce(doneTask)
        .mockResolvedValueOnce(notDoneTask);
    });

    it('should update status to DONE if the task is NOT_DONE and has no unmet dependencies', async () => {
      const result = await service.updateStatus(taskId, userId);
      expect(prisma.task.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: taskId, active: true, userId },
        include: { dependencies: { include: { prerequisite: true } } },
      });
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: { status: 'DONE' },
      });
      expect(result).toBe(true);
    });

    it('should update status to NOT_DONE if the task is DONE', async () => {
      (prisma.task.findUniqueOrThrow as jest.Mock).mockResolvedValue(doneTask);
      const result = await service.updateStatus(taskId, userId);
      expect(prisma.task.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: taskId, active: true, userId },
        include: { dependencies: { include: { prerequisite: true } } },
      });
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: { status: 'NOT_DONE' },
      });
      expect(result).toBe(true);
    });

    // it('should throw ConflictException if the task has a NOT_DONE dependency', async () => {
    //   await expect(service.updateStatus(taskId, userId)).rejects.toThrow(
    //     ConflictException,
    //   );
    //   await expect(service.updateStatus(taskId, userId)).rejects.toThrow(
    //     'Task has a dependency that is not completed',
    //   );
    //   expect(prisma.task.findUniqueOrThrow).toHaveBeenCalledWith({
    //     where: { id: taskId, active: true, userId },
    //     include: { dependencies: { include: { prerequisite: true } } },
    //   });
    //   expect(prisma.task.update).not.toHaveBeenCalled();
    // });

    // it('should not throw ConflictException if the task has a DONE dependency', async () => {
    //   (prisma.task.findUniqueOrThrow as jest.Mock).mockResolvedValue(
    //     doneTaskWithDependency,
    //   );
    //   await expect(service.updateStatus(taskId, userId)).resolves.toBe(true);
    //   expect(prisma.task.findUniqueOrThrow).toHaveBeenCalledWith({
    //     where: { id: taskId, active: true, userId },
    //     include: { dependencies: { include: { prerequisite: true } } },
    //   });
    //   expect(prisma.task.update).toHaveBeenCalledWith({
    //     where: { id: taskId },
    //     data: { status: 'DONE' },
    //   });
    // });

    // it('should throw NotFoundException if the task does not exist', async () => {
    //   const errorMessage = `Task with id ${taskId} not found`;
    //   (prisma.task.findUniqueOrThrow as jest.Mock).mockRejectedValue({
    //     code: 'P2025',
    //     message: errorMessage,
    //   });

    //   await expect(service.updateStatus(taskId, userId)).rejects.toThrow(
    //     NotFoundException,
    //   );
    //   await expect(service.updateStatus(taskId, userId)).rejects.toThrow(
    //     errorMessage,
    //   );
    //   expect(prisma.task.findUniqueOrThrow).toHaveBeenCalledWith({
    //     where: { id: taskId, active: true, userId },
    //     include: { dependencies: { include: { prerequisite: true } } },
    //   });
    //   expect(prisma.task.update).not.toHaveBeenCalled();
    // });

    // it('should throw the original error if prisma.task.findUniqueOrThrow fails with a non-P2025 error', async () => {
    //   const errorMessage = 'Database connection error';
    //   (prisma.task.findUniqueOrThrow as jest.Mock).mockRejectedValue(
    //     new Error(errorMessage),
    //   );

    //   await expect(service.updateStatus(taskId, userId)).rejects.toThrow(
    //     errorMessage,
    //   );
    //   expect(prisma.task.findUniqueOrThrow).toHaveBeenCalledWith({
    //     where: { id: taskId, active: true, userId },
    //     include: { dependencies: { include: { prerequisite: true } } },
    //   });
    //   expect(prisma.task.update).not.toHaveBeenCalled();
    // });

    // it('should throw an error if prisma.task.update fails', async () => {
    //   const errorMessage = 'Task update failed';
    //   (prisma.task.update as jest.Mock).mockRejectedValue(
    //     new Error(errorMessage),
    //   );

    //   await expect(service.updateStatus(taskId, userId)).rejects.toThrow(
    //     errorMessage,
    //   );
    //   expect(prisma.task.findUniqueOrThrow).toHaveBeenCalledWith({
    //     where: { id: taskId, active: true, userId },
    //     include: { dependencies: { include: { prerequisite: true } } },
    //   });
    //   expect(prisma.task.update).toHaveBeenCalledWith({
    //     where: { id: taskId },
    //     data: { status: 'DONE' },
    //   });
    // });
  });
});
