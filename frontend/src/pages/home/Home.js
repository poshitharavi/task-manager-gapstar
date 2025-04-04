import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { FiEye, FiEdit, FiTrash, FiPlus } from "react-icons/fi";
import { useTaskStore } from "../../store/taskStore";
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
    const { tasks, counts, sortBy, isLoading, error, searchTerm, fetchTasks, setSort, updateStatus, setSearchTerm, } = useTaskStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedViewTask, setSelectedViewTask] = useState(null);
    const [selectedEditTask, setSelectedEditTask] = useState(null);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [localSearch, setLocalSearch] = useState(searchTerm);
    const debouncedSearch = useDebounce(localSearch, 500);
    useEffect(() => {
        fetchTasks();
    }, []);
    useEffect(() => {
        setSearchTerm(debouncedSearch);
    }, [debouncedSearch, setSearchTerm]);
    const handleView = (taskId) => {
        const task = tasks.find((t) => t.id === taskId);
        setSelectedViewTask(task || null);
    };
    const handleEdit = (taskId) => {
        const task = tasks.find((t) => t.id === taskId);
        setSelectedEditTask(task || null);
    };
    const handleDelete = (taskId) => {
        setTaskToDelete(taskId);
    };
    const handleStatusChange = async (taskId, currentStatus) => {
        const newStatus = currentStatus === "DONE" ? "NOT_DONE" : "DONE";
        try {
            await updateStatus(taskId, newStatus);
        }
        catch (error) {
            useAlertStore
                .getState()
                .showAlert("error", error.response?.data?.message || "Failed to update task status");
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-800", children: [_jsx(Navbar, {}), _jsx("div", { className: "pt-8 flex items-center justify-center", children: _jsxs(BodyCard, { children: [_jsxs("div", { className: "flex justify-between items-center mb-4 gap-4", children: [_jsx("div", { className: "flex-1", children: _jsx("input", { type: "text", placeholder: "Search tasks...", className: "w-full bg-gray-700 text-white px-4 py-2 rounded-lg", value: localSearch, onChange: (e) => setLocalSearch(e.target.value) }) }), _jsx("button", { onClick: () => setIsModalOpen(true), className: "p-2 bg-green-500 rounded-lg hover:bg-green-600 shrink-0", title: "Create New Task", children: _jsx(FiPlus, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "mb-6 flex justify-between items-center", children: [_jsxs("div", { className: "text-gray-400", children: [counts.active, " active tasks, ", counts.completed, " completed"] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs("select", { value: sortBy, onChange: (e) => setSort(e.target.value), className: "bg-gray-700 text-white px-3 py-1 rounded-lg", children: [_jsx("option", { value: "id", children: "ID" }), _jsx("option", { value: "priority", children: "Priority" }), _jsx("option", { value: "dueDate", children: "Due Date" }), _jsx("option", { value: "status", children: "Status" })] }) })] }), isLoading ? (_jsx("div", { className: "text-center py-4 text-gray-400", children: "Loading tasks..." })) : error ? (_jsx("div", { className: "text-center py-4 text-red-500", children: error })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-700", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left", children: "Task" }), _jsx("th", { className: "px-4 py-3 text-left", children: "Priority" }), _jsx("th", { className: "px-4 py-3 text-left", children: "Due Date" }), _jsx("th", { className: "px-4 py-3 text-left", children: "Status" }), _jsx("th", { className: "px-4 py-3 text-left", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-700", children: tasks.map((task) => (_jsxs("tr", { children: [_jsx("td", { className: "px-4 py-3", children: task.title }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: `px-2 py-1 rounded-full text-xs ${task.priority === "HIGH"
                                                            ? "bg-red-500"
                                                            : task.priority === "MEDIUM"
                                                                ? "bg-yellow-500"
                                                                : "bg-green-500"}`, children: task.priority }) }), _jsx("td", { className: "px-4 py-3", children: format(new Date(task.dueDate), "MMM dd, yyyy") }), _jsx("td", { className: "px-4 py-3", children: _jsx("button", { onClick: () => handleStatusChange(task.id, task.status), className: `px-2 py-1 rounded-full text-xs cursor-pointer ${task.status === "DONE"
                                                            ? "bg-green-500 hover:bg-green-600"
                                                            : "bg-gray-500 hover:bg-gray-600"}`, children: task.status.replace("_", " ") }) }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleView(task.id), className: "p-2 bg-blue-500 rounded-lg hover:bg-blue-600", title: "View", children: _jsx(FiEye, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handleEdit(task.id), className: "p-2 bg-yellow-500 rounded-lg hover:bg-yellow-600", title: "Edit", children: _jsx(FiEdit, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handleDelete(task.id), className: "p-2 bg-red-500 rounded-lg hover:bg-red-600", title: "Delete", children: _jsx(FiTrash, { className: "w-4 h-4" }) })] }) })] }, task.id))) })] }) })), _jsx("div", { className: "mt-6 pt-4 border-t border-gray-700 text-center text-sm text-gray-500", children: "Powered by Poshitha" })] }) }), _jsx(CreateTaskModal, { isOpen: isModalOpen, onClose: () => setIsModalOpen(false), onSuccess: fetchTasks }), _jsx(ViewTaskModal, { task: selectedViewTask, onClose: () => setSelectedViewTask(null) }), _jsx(EditTaskModal, { task: selectedEditTask, onClose: () => setSelectedEditTask(null), onSuccess: fetchTasks }), _jsx(DeleteConfirmationModal, { taskId: taskToDelete, onClose: () => setTaskToDelete(null), onSuccess: fetchTasks })] }));
};
export default Home;
