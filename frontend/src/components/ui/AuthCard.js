import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const AuthCard = ({ title, subtitle, subtitleAction, children, buttonText, onSubmit, }) => {
    return (_jsx("div", { className: "w-full h-screen flex items-center justify-center", children: _jsxs("div", { className: "w-[90%] max-w-sm md:max-w-md lg:max-w-md p-5 bg-gray-900 flex-col flex items-center gap-3 rounded-xl shadow-slate-500 shadow-lg", children: [_jsx("img", { src: "/logo.png", alt: "logo", className: "w-12 md:w-14" }), _jsx("h1", { className: "text-lg md:text-xl font-semibold", children: title }), _jsxs("p", { className: "text-xs md:text-sm text-gray-500 text-center", children: [subtitle, " ", _jsx("span", { className: "text-white cursor-pointer", children: subtitleAction })] }), _jsxs("div", { className: "w-full flex flex-col gap-3", children: [_jsx("form", { className: "w-full", onSubmit: onSubmit, children: children }), _jsx("button", { onClick: onSubmit, className: "w-full p-2 bg-blue-500 rounded-xl mt-3 hover:bg-blue-600 text-sm md:text-base", children: buttonText })] })] }) }));
};
export default AuthCard;
