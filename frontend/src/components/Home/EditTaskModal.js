import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { FiSave } from "react-icons/fi";
import { useTaskStore } from "../../store/taskStore";
import { TasksService } from "../../services/tasks.service";
const EditTaskModal = ({ task, onClose, onSuccess }) => {
    const { tasks } = useTaskStore();
    const [formData, setFormData] = useState({
        title: "",
        dueDate: "",
        priority: "LOW",
        recurrence: "NONE",
        isDependent: false,
        prerequisite: "",
    });
    const [error, setError] = useState("");
    useEffect(() => {
        if (task) {
            const prerequisiteId = task.dependencies[0]?.prerequisiteId.toString() || "";
            setFormData({
                title: task.title,
                dueDate: format(new Date(task.dueDate), "yyyy-MM-dd'T'HH:mm"),
                priority: task.priority,
                recurrence: task.recurrence,
                isDependent: task.dependencies.length > 0,
                prerequisite: prerequisiteId,
            });
        }
    }, [task]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!task)
            return;
        try {
            await TasksService.updateTask(task.id, {
                ...formData,
                dueDate: new Date(formData.dueDate).toISOString(),
                prerequisite: formData.prerequisite
                    ? parseInt(formData.prerequisite)
                    : undefined,
            });
            onSuccess();
            onClose();
        }
        catch (err) {
            setError(err.message || "Failed to update task");
        }
    };
    if (!task)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-gray-800 p-6 rounded-lg w-full max-w-md", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Edit Task" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm mb-1", children: "Title" }), _jsx("input", { type: "text", required: true, className: "w-full bg-gray-700 rounded p-2", value: formData.title, onChange: (e) => setFormData({ ...formData, title: e.target.value }) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm mb-1", children: "Due Date" }), _jsx("input", { type: "datetime-local", required: true, className: "w-full bg-gray-700 rounded p-2", value: formData.dueDate, onChange: (e) => setFormData({ ...formData, dueDate: e.target.value }) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm mb-1", children: "Priority" }), _jsx("select", { className: "w-full bg-gray-700 rounded p-2", value: formData.priority, onChange: (e) => setFormData({ ...formData, priority: e.target.value }), children: ["LOW", "MEDIUM", "HIGH"].map((option) => (_jsx("option", { value: option, children: option }, option))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm mb-1", children: "Recurrence" }), _jsx("select", { className: "w-full bg-gray-700 rounded p-2", value: formData.recurrence, onChange: (e) => setFormData({
                                                ...formData,
                                                recurrence: e.target.value,
                                            }), children: ["NONE", "DAILY", "WEEKLY", "MONTHLY"].map((option) => (_jsx("option", { value: option, children: option }, option))) })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", id: "isDependent", checked: formData.isDependent, onChange: (e) => setFormData({ ...formData, isDependent: e.target.checked }) }), _jsx("label", { htmlFor: "isDependent", children: "Has Dependency" })] }), formData.isDependent && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm mb-1", children: "Prerequisite Task" }), _jsxs("select", { className: "w-full bg-gray-700 rounded p-2", value: formData.prerequisite, onChange: (e) => setFormData({ ...formData, prerequisite: e.target.value }), required: formData.isDependent, children: [_jsx("option", { value: "", children: "Select a task" }), tasks
                                            .filter((t) => t.id !== task.id)
                                            .map((task) => (_jsxs("option", { value: task.id, children: [task.title, " (ID: ", task.id, ")"] }, task.id)))] })] })), error && _jsx("div", { className: "text-red-500 text-sm", children: error }), _jsxs("div", { className: "flex justify-end gap-2 mt-6", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 bg-gray-600 rounded hover:bg-gray-700", children: "Cancel" }), _jsxs("button", { type: "submit", className: "px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 flex items-center gap-2", children: [_jsx(FiSave, { className: "w-4 h-4" }), "Save Changes"] })] })] })] }) }));
};
export default EditTaskModal;
