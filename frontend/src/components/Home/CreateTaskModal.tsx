/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useTaskStore } from "../../store/taskStore";
import { TasksService } from "../../services/tasks.service";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateTaskModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateTaskModalProps) => {
  const { tasks } = useTaskStore();
  const [formData, setFormData] = useState({
    title: "",
    dueDate: "",
    priority: "LOW" as "LOW" | "MEDIUM" | "HIGH",
    recurrence: "NONE" as "DAILY" | "WEEKLY" | "MONTHLY" | "NONE",
    isDependent: false,
    prerequisite: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await TasksService.createTask({
        ...formData,
        dueDate: new Date(formData.dueDate).toISOString(),
        prerequisite: formData.prerequisite
          ? parseInt(formData.prerequisite)
          : undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create task");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create New Task</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input
              type="text"
              required
              className="w-full bg-gray-700 rounded p-2"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Due Date</label>
            <input
              type="datetime-local"
              required
              className="w-full bg-gray-700 rounded p-2"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Priority</label>
              <select
                className="w-full bg-gray-700 rounded p-2"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as any })
                }
              >
                {["LOW", "MEDIUM", "HIGH"].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Recurrence</label>
              <select
                className="w-full bg-gray-700 rounded p-2"
                value={formData.recurrence}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    recurrence: e.target.value as any,
                  })
                }
              >
                {["NONE", "DAILY", "WEEKLY", "MONTHLY"].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDependent"
              checked={formData.isDependent}
              onChange={(e) =>
                setFormData({ ...formData, isDependent: e.target.checked })
              }
            />
            <label htmlFor="isDependent">Has Dependency</label>
          </div>

          {formData.isDependent && (
            <div>
              <label className="block text-sm mb-1">Prerequisite Task</label>
              <select
                className="w-full bg-gray-700 rounded p-2"
                value={formData.prerequisite}
                onChange={(e) =>
                  setFormData({ ...formData, prerequisite: e.target.value })
                }
                required={formData.isDependent}
              >
                <option value="">Select a task</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title} (ID: {task.id})
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
