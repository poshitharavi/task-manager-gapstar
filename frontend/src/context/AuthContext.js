import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from "react";
import { AuthService } from "../services/auth.service";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        initializeAuth();
    }, []);
    const initializeAuth = async () => {
        const token = localStorage.getItem("token");
        if (token) {
            setUser(JSON.parse(localStorage.getItem("user")));
        }
        setIsLoading(false);
    };
    const login = async (userName, password) => {
        try {
            const response = await AuthService.login(userName, password);
            if (response.statusCode === 200 && response.body) {
                const userData = response.body;
                localStorage.setItem("token", userData.token);
                localStorage.setItem("user", JSON.stringify(userData));
                setUser(userData);
                return userData;
            }
            else {
                throw new Error(response.message);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
        catch (error) {
            throw new Error(error.message || "Login failed");
        }
    };
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };
    return (_jsx(AuthContext.Provider, { value: {
            isAuthenticated: !!user,
            user,
            login,
            logout,
            isLoading,
        }, children: children }));
}
export function useAuth() {
    return useContext(AuthContext);
}
