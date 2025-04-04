import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from "../../context/AuthContext";
const Navbar = () => {
    const { logout } = useAuth();
    return (_jsx("nav", { className: "w-full bg-gray-900 border-b border-gray-700", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex items-center justify-between h-16", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("img", { src: "/logo.png", alt: "logo", className: "w-8 h-8" }), _jsx("span", { className: "ml-2 text-xl font-semibold text-white", children: "Task Manager" })] }), _jsx("button", { onClick: logout, className: "px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700", children: "Logout" })] }) }) }));
};
export default Navbar;
