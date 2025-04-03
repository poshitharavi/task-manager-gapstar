/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { TasksService } from "../../services/tasks.service";

interface DeleteConfirmationModalProps {
  taskId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

const DeleteConfirmationModal = ({
  taskId,
  onClose,
  onSuccess,
}: DeleteConfirmationModalProps) => {
  const [confirmationText, setConfirmationText] = useState("");
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!taskId) return;

    setIsDeleting(true);
    setError("");

    try {
      await TasksService.deleteTask(taskId);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!taskId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>

        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to delete this task? This action cannot be
            undone.
          </p>

          <div>
            <label className="block text-sm mb-1">
              Type "confirm" to continue:
            </label>
            <input
              type="text"
              className="w-full bg-gray-700 rounded p-2"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 disabled:opacity-50"
              disabled={
                confirmationText.toLowerCase() !== "confirm" || isDeleting
              }
            >
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
