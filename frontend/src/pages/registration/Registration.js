import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { MdAlternateEmail, MdPerson } from "react-icons/md";
import { FaFingerprint } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AuthService } from "../../services/auth.service";
import InputField from "../../components/ui/InputField";
import AuthCard from "../../components/ui/AuthCard";
const Registration = () => {
    const [name, setName] = useState("");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setIsLoading(true);
        try {
            const response = await AuthService.register(name, userName, password);
            if (response.statusCode === 200 && response.body) {
                await login(userName, password);
                navigate("/");
            }
        }
        catch (err) {
            setError(err instanceof Error
                ? err.message
                : "Registration failed. Please try again.");
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs(AuthCard, { title: "Create Account", subtitle: "Already have an account?", subtitleAction: "Sign in", buttonText: isLoading ? "Registering..." : "Register", onSubmit: handleRegister, children: [error && (_jsx("div", { className: "text-red-500 text-sm text-center mb-2", children: error })), _jsxs("form", { className: "w-full flex flex-col gap-3", onSubmit: handleRegister, children: [_jsx(InputField, { type: "text", placeholder: "Full Name", icon: _jsx(MdPerson, {}), value: name, onChange: (e) => setName(e.target.value), required: true }), _jsx(InputField, { type: "text", placeholder: "Username", icon: _jsx(MdAlternateEmail, {}), value: userName, onChange: (e) => setUserName(e.target.value), required: true }), _jsx(InputField, { type: "password", placeholder: "Password", icon: _jsx(FaFingerprint, {}), showPasswordToggle: true, value: password, onChange: (e) => setPassword(e.target.value), required: true }), _jsx(InputField, { type: "password", placeholder: "Confirm Password", icon: _jsx(FaFingerprint, {}), showPasswordToggle: true, value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), required: true })] })] }));
};
export default Registration;
