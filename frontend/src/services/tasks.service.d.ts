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
export declare const TasksService: {
    getMyTasks: (sortBy: string, sortOrder: "asc" | "desc", title?: string) => Promise<TasksResponse>;
    createTask: (taskData: {
        title: string;
        dueDate: string;
        priority: "LOW" | "MEDIUM" | "HIGH";
        recurrence: "DAILY" | "WEEKLY" | "MONTHLY" | "NONE";
        isDependent: boolean;
        prerequisite?: number;
    }) => Promise<TasksResponse>;
    updateTask: (taskId: number, taskData: {
        title: string;
        dueDate: string;
        priority: "LOW" | "MEDIUM" | "HIGH";
        recurrence: "DAILY" | "WEEKLY" | "MONTHLY" | "NONE";
        isDependent: boolean;
        prerequisite?: number;
    }) => Promise<TasksResponse>;
    deleteTask: (taskId: number) => Promise<{
        statusCode: number;
        message: string;
    }>;
    updateStatus: (taskId: number, status: "DONE" | "NOT_DONE") => Promise<TasksResponse>;
};
export {};
