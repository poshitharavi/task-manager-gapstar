import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
const InputField = ({ type, placeholder, icon, showPasswordToggle = false, value, required = false, onChange, }) => {
    const [showPassword, setShowPassword] = useState(false);
    return (_jsxs("div", { className: "w-full flex items-center gap-2 bg-gray-800 p-2 rounded-xl relative", children: [icon, _jsx("input", { type: showPasswordToggle ? (showPassword ? "text" : "password") : type, placeholder: placeholder, className: "bg-transparent border-0 w-full outline-none text-sm md:text-base", value: value, onChange: onChange, required: required }), showPasswordToggle && (_jsx("div", { className: "absolute right-5 cursor-pointer", onClick: () => setShowPassword(!showPassword), children: showPassword ? _jsx(FaRegEyeSlash, {}) : _jsx(FaRegEye, {}) }))] }));
};
export default InputField;
