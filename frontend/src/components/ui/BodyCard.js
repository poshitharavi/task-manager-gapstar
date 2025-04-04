import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const BodyCard = ({ children, title, headerContent }) => {
    return (_jsxs("div", { className: "w-[90%] max-w-6xl p-6 bg-gray-900 rounded-xl shadow-slate-500 shadow-lg mb-10", children: [(title || headerContent) && (_jsxs("div", { className: "flex items-center justify-between mb-6", children: [title && _jsx("h2", { className: "text-xl font-semibold", children: title }), headerContent] })), children] }));
};
export default BodyCard;
