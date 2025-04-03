import { format } from "date-fns";
import { Task } from "../../store/taskStore";

interface ViewTaskModalProps {
  task: Task | null;
  onClose: () => void;
}

const ViewTaskModal = ({ task, onClose }: ViewTaskModalProps) => {
  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Task Details</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input
              type="text"
              readOnly
              className="w-full bg-gray-700 rounded p-2 cursor-not-allowed"
              value={task.title}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Due Date</label>
              <input
                type="text"
                readOnly
                className="w-full bg-gray-700 rounded p-2 cursor-not-allowed"
                value={format(new Date(task.dueDate), "MMM dd, yyyy HH:mm")}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Priority</label>
              <input
                type="text"
                readOnly
                className="w-full bg-gray-700 rounded p-2 cursor-not-allowed"
                value={task.priority}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Status</label>
              <input
                type="text"
                readOnly
                className="w-full bg-gray-700 rounded p-2 cursor-not-allowed"
                value={task.status.replace("_", " ")}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Recurrence</label>
              <input
                type="text"
                readOnly
                className="w-full bg-gray-700 rounded p-2 cursor-not-allowed"
                value={task.recurrence}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Prerequisites</label>
            <div className="bg-gray-700 rounded p-2 min-h-10 cursor-not-allowed">
              {task.dependencies.length > 0 ? (
                task.dependencies.map((dep) => (
                  <div key={dep.id} className="text-sm py-1">
                    • {dep.prerequisite.title} (ID: {dep.prerequisite.id})
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-sm">None</div>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTaskModal;
