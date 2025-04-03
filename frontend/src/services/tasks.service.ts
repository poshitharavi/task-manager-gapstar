/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";

interface Task {
  id: number;
  title: string;
  status: "NOT_DONE" | "DONE";
  dueDate: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  recurrence: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";
  nextRecurrence: string | null;
  active: boolean;
  dependencies: Array<{
    id: number;
    dependentId: number;
    prerequisiteId: number;
    prerequisite: {
      id: number;
      title: string;
    };
  }>;
}

interface TasksResponse {
  statusCode: number;
  message: string;
  body: {
    tasks: Task[];
    counts: {
      active: number;
      completed: number;
    };
  };
}

export const TasksService = {
  getMyTasks: async (
    sortBy: string,
    sortOrder: "asc" | "desc",
    title?: string
  ): Promise<TasksResponse> => {
    try {
      const params: Record<string, any> = {
        sortBy,
        sortOrder,
      };

      if (title && title.trim()) {
        params.title = title;
      }

      const response = await api.get(`/task/my`, { params });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: "Failed to fetch tasks" };
    }
  },
  createTask: async (taskData: {
    title: string;
    dueDate: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    recurrence: "DAILY" | "WEEKLY" | "MONTHLY" | "NONE";
    isDependent: boolean;
    prerequisite?: number;
  }): Promise<TasksResponse> => {
    try {
      const payload = { ...taskData };
      if (!payload.isDependent) {
        delete payload.prerequisite;
      }
      const response = await api.post("/task/new", payload);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: "Task creation failed" };
    }
  },
  updateTask: async (
    taskId: number,
    taskData: {
      title: string;
      dueDate: string;
      priority: "LOW" | "MEDIUM" | "HIGH";
      recurrence: "DAILY" | "WEEKLY" | "MONTHLY" | "NONE";
      isDependent: boolean;
      prerequisite?: number;
    }
  ): Promise<TasksResponse> => {
    try {
      const payload = { ...taskData };
      if (!payload.isDependent) {
        delete payload.prerequisite;
      }
      const response = await api.patch(`/task/update/${taskId}`, payload);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: "Task update failed" };
    }
  },
  deleteTask: async (
    taskId: number
  ): Promise<{ statusCode: number; message: string }> => {
    try {
      const response = await api.delete(`/task/delete/${taskId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: "Task deletion failed" };
    }
  },
  updateStatus: async (
    taskId: number,
    status: "DONE" | "NOT_DONE"
  ): Promise<TasksResponse> => {
    try {
      const response = await api.patch(`/task/update-status/${taskId}`, {
        status,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: "Status update failed" };
    }
  },
};
