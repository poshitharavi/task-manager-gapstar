export interface Task {
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
interface TaskState {
    tasks: Task[];
    counts: {
        active: number;
        completed: number;
    };
    isLoading: boolean;
    error: string | null;
    sortBy: "id" | "priority" | "dueDate" | "status";
    sortOrder: "asc" | "desc";
    searchTerm: string;
    updateStatus: (taskId: number, status: "DONE" | "NOT_DONE") => Promise<void>;
    fetchTasks: () => Promise<void>;
    setSort: (sortBy: "id" | "priority" | "dueDate" | "status") => void;
    setSearchTerm: (term: string) => void;
}
export declare const useTaskStore: import("zustand").UseBoundStore<import("zustand").StoreApi<TaskState>>;
export {};
