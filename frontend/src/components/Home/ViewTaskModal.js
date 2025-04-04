import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { format } from "date-fns";
const ViewTaskModal = ({ task, onClose }) => {
    if (!task)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-gray-800 p-6 rounded-lg w-full max-w-md", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Task Details" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm mb-1", children: "Title" }), _jsx("input", { type: "text", readOnly: true, className: "w-full bg-gray-700 rounded p-2 cursor-not-allowed", value: task.title })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm mb-1", children: "Due Date" }), _jsx("input", { type: "text", readOnly: true, className: "w-full bg-gray-700 rounded p-2 cursor-not-allowed", value: format(new Date(task.dueDate), "MMM dd, yyyy HH:mm") })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm mb-1", children: "Priority" }), _jsx("input", { type: "text", readOnly: true, className: "w-full bg-gray-700 rounded p-2 cursor-not-allowed", value: task.priority })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm mb-1", children: "Status" }), _jsx("input", { type: "text", readOnly: true, className: "w-full bg-gray-700 rounded p-2 cursor-not-allowed", value: task.status.replace("_", " ") })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm mb-1", children: "Recurrence" }), _jsx("input", { type: "text", readOnly: true, className: "w-full bg-gray-700 rounded p-2 cursor-not-allowed", value: task.recurrence })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm mb-1", children: "Prerequisites" }), _jsx("div", { className: "bg-gray-700 rounded p-2 min-h-10 cursor-not-allowed", children: task.dependencies.length > 0 ? (task.dependencies.map((dep) => (_jsxs("div", { className: "text-sm py-1", children: ["\u2022 ", dep.prerequisite.title, " (ID: ", dep.prerequisite.id, ")"] }, dep.id)))) : (_jsx("div", { className: "text-gray-400 text-sm", children: "None" })) })] }), _jsx("div", { className: "flex justify-end mt-6", children: _jsx("button", { onClick: onClose, className: "px-4 py-2 bg-gray-600 rounded hover:bg-gray-700", children: "Close" }) })] })] }) }));
};
export default ViewTaskModal;
