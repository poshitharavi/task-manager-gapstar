import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NewTaskDto } from './dtos/new-task.dto';
import { Priority, Recurrence, Task, TaskStatus } from '@prisma/client';
import { calculateNextRecurrence } from '../common/util/recurrence.utils';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { MyTaskResponse } from './interface/my-tasks.interface';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async addNewTask(newTaskDto: NewTaskDto, userId: number): Promise<Task> {
    try {
      const { dueDate, recurrence } = newTaskDto;

      const nextRecurrence = calculateNextRecurrence(recurrence, dueDate);

      const newTask = await this.prisma.task.create({
        data: {
          title: newTaskDto.title,
          priority: newTaskDto.priority as Priority,
          recurrence: newTaskDto.recurrence as Recurrence,
          dueDate: newTaskDto.dueDate,
          userId: userId,
          nextRecurrence,
        },
      });

      if (newTaskDto.isDependent) {
        await this.prisma.taskDependency.create({
          data: {
            dependentId: newTask.id,
            prerequisiteId: newTaskDto.prerequisite,
          },
        });
      }

      return newTask;
    } catch (error) {
      throw error;
    }
  }

  async updateTask(
    taskId: number,
    updateTaskDto: UpdateTaskDto,
    userId: number,
  ): Promise<Task> {
    try {
      const task = await this.prisma.task.findUniqueOrThrow({
        where: {
          id: taskId,
          active: true,
          userId,
          status: 'NOT_DONE',
        },
        include: {
          dependencies: true,
        },
      });

      const { dueDate, recurrence } = updateTaskDto;

      const nextRecurrence = calculateNextRecurrence(recurrence, dueDate);

      const updatedTask = await this.prisma.task.update({
        where: {
          id: taskId,
        },
        data: {
          title: updateTaskDto.title,
          priority: updateTaskDto.priority as Priority,
          recurrence: updateTaskDto.recurrence as Recurrence,
          dueDate: updateTaskDto.dueDate,
          userId: userId,
          nextRecurrence,
        },
      });

      if (updateTaskDto.isDependent) {
        await this.prisma.taskDependency.upsert({
          where: {
            dependentId_prerequisiteId: {
              dependentId: task.id,
              prerequisiteId: updateTaskDto.prerequisite,
            },
          },
          update: {
            prerequisiteId: updateTaskDto.prerequisite,
          },
          create: {
            dependentId: task.id,
            prerequisiteId: updateTaskDto.prerequisite,
          },
        });
      } else {
        if (task.dependencies[0]) {
          await this.prisma.taskDependency.delete({
            where: {
              id: task.dependencies[0].id,
            },
          });
        }
      }

      return updatedTask;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Task with id ${taskId} not found`);
      }

      // throw error if any
      throw error;
    }
  }

  async deleteTask(taskId: number, userId: number): Promise<boolean> {
    try {
      await this.prisma.task.findUniqueOrThrow({
        where: {
          id: taskId,
          active: true,
          userId,
          status: 'NOT_DONE',
        },
      });

      await this.prisma.task.update({
        where: {
          id: taskId,
        },
        data: {
          active: false,
        },
      });

      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Task with id ${taskId} not found`);
      }

      // throw error if any
      throw error;
    }
  }

  async getMyTasks(
    userId: number,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc',
    title?: string,
  ): Promise<MyTaskResponse> {
    const where: any = {
      active: true,
      userId,
    };

    if (title) {
      where.title = {
        contains: title,
        mode: 'insensitive', // Perform case-insensitive search
      };
    }

    const orderBy = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy['id'] = 'asc';
    }

    const tasks = await this.prisma.task.findMany({
      where,
      include: {
        dependencies: {
          include: {
            prerequisite: true,
          },
        },
      },
      orderBy: [orderBy],
    });

    const activeTaskCount = await this.prisma.task.count({
      where: {
        active: true,
        userId,
      },
    });

    const completedTaskCount = await this.prisma.task.count({
      where: {
        status: TaskStatus.DONE,
        userId,
      },
    });

    return {
      tasks,
      counts: {
        active: activeTaskCount,
        completed: completedTaskCount,
      },
    };
  }

  async updateStatus(taskId: number, userId: number): Promise<boolean> {
    try {
      const task = await this.prisma.task.findUniqueOrThrow({
        where: {
          id: taskId,
          active: true,
          userId,
        },
        include: {
          dependencies: {
            include: {
              prerequisite: true,
            },
          },
        },
      });

      if (task.status === 'NOT_DONE' && task.dependencies.length > 0) {
        if (task.dependencies[0].prerequisite.status === 'NOT_DONE')
          throw new ConflictException(
            'Task has a dependency that is not completed',
          );
      }

      await this.prisma.task.update({
        where: {
          id: taskId,
        },
        data: {
          status: task.status === 'NOT_DONE' ? 'DONE' : 'NOT_DONE',
        },
      });

      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Task with id ${taskId} not found`);
      }

      // throw error if any
      throw error;
    }
  }
}
