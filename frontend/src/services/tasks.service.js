/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";
export const TasksService = {
    getMyTasks: async (sortBy, sortOrder, title) => {
        try {
            const params = {
                sortBy,
                sortOrder,
            };
            if (title && title.trim()) {
                params.title = title;
            }
            const response = await api.get(`/task/my`, { params });
            return response.data;
        }
        catch (error) {
            throw error.response?.data || { message: "Failed to fetch tasks" };
        }
    },
    createTask: async (taskData) => {
        try {
            const payload = { ...taskData };
            if (!payload.isDependent) {
                delete payload.prerequisite;
            }
            const response = await api.post("/task/new", payload);
            return response.data;
        }
        catch (error) {
            throw error.response?.data || { message: "Task creation failed" };
        }
    },
    updateTask: async (taskId, taskData) => {
        try {
            const payload = { ...taskData };
            if (!payload.isDependent) {
                delete payload.prerequisite;
            }
            const response = await api.patch(`/task/update/${taskId}`, payload);
            return response.data;
        }
        catch (error) {
            throw error.response?.data || { message: "Task update failed" };
        }
    },
    deleteTask: async (taskId) => {
        try {
            const response = await api.delete(`/task/delete/${taskId}`);
            return response.data;
        }
        catch (error) {
            throw error.response?.data || { message: "Task deletion failed" };
        }
    },
    updateStatus: async (taskId, status) => {
        try {
            const response = await api.patch(`/task/update-status/${taskId}`, {
                status,
            });
            return response.data;
        }
        catch (error) {
            throw error.response?.data || { message: "Status update failed" };
        }
    },
};
