import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { TasksService } from "../../services/tasks.service";
const DeleteConfirmationModal = ({ taskId, onClose, onSuccess, }) => {
    const [confirmationText, setConfirmationText] = useState("");
    const [error, setError] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const handleDelete = async () => {
        if (!taskId)
            return;
        setIsDeleting(true);
        setError("");
        try {
            await TasksService.deleteTask(taskId);
            onSuccess();
            onClose();
        }
        catch (err) {
            setError(err.message || "Failed to delete task");
        }
        finally {
            setIsDeleting(false);
        }
    };
    if (!taskId)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-gray-800 p-6 rounded-lg w-full max-w-md", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Confirm Deletion" }), _jsxs("div", { className: "space-y-4", children: [_jsx("p", { className: "text-gray-300", children: "Are you sure you want to delete this task? This action cannot be undone." }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm mb-1", children: "Type \"confirm\" to continue:" }), _jsx("input", { type: "text", className: "w-full bg-gray-700 rounded p-2", value: confirmationText, onChange: (e) => setConfirmationText(e.target.value) })] }), error && _jsx("div", { className: "text-red-500 text-sm", children: error }), _jsxs("div", { className: "flex justify-end gap-2 mt-6", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 bg-gray-600 rounded hover:bg-gray-700", disabled: isDeleting, children: "Cancel" }), _jsx("button", { type: "button", onClick: handleDelete, className: "px-4 py-2 bg-red-500 rounded hover:bg-red-600 disabled:opacity-50", disabled: confirmationText.toLowerCase() !== "confirm" || isDeleting, children: isDeleting ? "Deleting..." : "Delete Permanently" })] })] })] }) }));
};
export default DeleteConfirmationModal;
