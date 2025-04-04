/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { TasksService } from "../services/tasks.service";
import { useAlertStore } from "./alertStore";
export const useTaskStore = create((set, get) => ({
    tasks: [],
    counts: { active: 0, completed: 0 },
    isLoading: false,
    error: null,
    sortBy: "id",
    sortOrder: "asc",
    searchTerm: "",
    fetchTasks: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await TasksService.getMyTasks(get().sortBy, get().sortOrder, get().searchTerm);
            set({
                tasks: response.body.tasks,
                counts: response.body.counts,
                isLoading: false,
            });
        }
        catch (error) {
            set({
                error: error.message || "Failed to fetch tasks",
                isLoading: false,
            });
        }
    },
    setSort: (sortBy) => {
        set((state) => {
            // Toggle order if sorting the same column
            const sortOrder = state.sortBy === sortBy
                ? state.sortOrder === "asc"
                    ? "desc"
                    : "asc"
                : "asc";
            return { sortBy, sortOrder };
        });
        get().fetchTasks();
    },
    updateStatus: async (taskId, status) => {
        try {
            await TasksService.updateStatus(taskId, status);
            set((state) => ({
                tasks: state.tasks.map((task) => task.id === taskId ? { ...task, status } : task),
                counts: {
                    ...state.counts,
                    ...(status === "DONE"
                        ? {
                            active: state.counts.active - 1,
                            completed: state.counts.completed + 1,
                        }
                        : {
                            active: state.counts.active + 1,
                            completed: state.counts.completed - 1,
                        }),
                },
            }));
        }
        catch (error) {
            useAlertStore
                .getState()
                .showAlert("error", error.response?.data?.message || "Failed to update task status");
            // Rollback to previous state
            get().fetchTasks();
        }
    },
    setSearchTerm: (term) => {
        set({ searchTerm: term });
        get().fetchTasks();
    },
}));
