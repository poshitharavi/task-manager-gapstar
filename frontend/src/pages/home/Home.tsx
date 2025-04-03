/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { FiEye, FiEdit, FiTrash, FiPlus } from "react-icons/fi";
import { Task, useTaskStore } from "../../store/taskStore";
import { format } from "date-fns";
import Navbar from "../../components/ui/Navbar";
import BodyCard from "../../components/ui/BodyCard";
import CreateTaskModal from "../../components/Home/CreateTaskModal";
import ViewTaskModal from "../../components/Home/ViewTaskModal";
import EditTaskModal from "../../components/Home/EditTaskModal";
import DeleteConfirmationModal from "../../components/Home/DeleteConfirmationModal";
import { useAlertStore } from "../../store/alertStore";
import { useDebounce } from "../../hooks/useDebounce";

const Home = () => {
  const {
    tasks,
    counts,
    sortBy,
    isLoading,
    error,
    searchTerm,
    fetchTasks,
    setSort,
    updateStatus,
    setSearchTerm,
  } = useTaskStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedViewTask, setSelectedViewTask] = useState<Task | null>(null);
  const [selectedEditTask, setSelectedEditTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const debouncedSearch = useDebounce(localSearch, 500);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    setSearchTerm(debouncedSearch);
  }, [debouncedSearch, setSearchTerm]);

  const handleView = (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    setSelectedViewTask(task || null);
  };

  const handleEdit = (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    setSelectedEditTask(task || null);
  };

  const handleDelete = (taskId: number) => {
    setTaskToDelete(taskId);
  };

  const handleStatusChange = async (
    taskId: number,
    currentStatus: "DONE" | "NOT_DONE"
  ) => {
    const newStatus = currentStatus === "DONE" ? "NOT_DONE" : "DONE";
    try {
      await updateStatus(taskId, newStatus);
    } catch (error: any) {
      useAlertStore
        .getState()
        .showAlert(
          "error",
          error.response?.data?.message || "Failed to update task status"
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-800">
      <Navbar />

      <div className="pt-8 flex items-center justify-center">
        <BodyCard>
          <div className="flex justify-between items-center mb-4 gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search tasks..."
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 bg-green-500 rounded-lg hover:bg-green-600 shrink-0"
              title="Create New Task"
            >
              <FiPlus className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-6 flex justify-between items-center">
            <div className="text-gray-400">
              {counts.active} active tasks, {counts.completed} completed
            </div>
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSort(e.target.value as any)}
                className="bg-gray-700 text-white px-3 py-1 rounded-lg"
              >
                <option value="id">ID</option>
                <option value="priority">Priority</option>
                <option value="dueDate">Due Date</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-4 text-gray-400">
              Loading tasks...
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">Task</th>
                    <th className="px-4 py-3 text-left">Priority</th>
                    <th className="px-4 py-3 text-left">Due Date</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td className="px-4 py-3">{task.title}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            task.priority === "HIGH"
                              ? "bg-red-500"
                              : task.priority === "MEDIUM"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {format(new Date(task.dueDate), "MMM dd, yyyy")}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            handleStatusChange(task.id, task.status)
                          }
                          className={`px-2 py-1 rounded-full text-xs cursor-pointer ${
                            task.status === "DONE"
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-gray-500 hover:bg-gray-600"
                          }`}
                        >
                          {task.status.replace("_", " ")}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleView(task.id)}
                            className="p-2 bg-blue-500 rounded-lg hover:bg-blue-600"
                            title="View"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(task.id)}
                            className="p-2 bg-yellow-500 rounded-lg hover:bg-yellow-600"
                            title="Edit"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="p-2 bg-red-500 rounded-lg hover:bg-red-600"
                            title="Delete"
                          >
                            <FiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-700 text-center text-sm text-gray-500">
            Powered by Poshitha
          </div>
        </BodyCard>
      </div>
      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTasks}
      />
      <ViewTaskModal
        task={selectedViewTask}
        onClose={() => setSelectedViewTask(null)}
      />
      <EditTaskModal
        task={selectedEditTask}
        onClose={() => setSelectedEditTask(null)}
        onSuccess={fetchTasks}
      />
      <DeleteConfirmationModal
        taskId={taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onSuccess={fetchTasks}
      />
    </div>
  );
};

export default Home;
