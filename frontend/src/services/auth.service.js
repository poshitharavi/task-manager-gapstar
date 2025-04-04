/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";
export const AuthService = {
    login: async (userName, password) => {
        try {
            const response = await api.post("/user/login", { userName, password });
            return response.data;
        }
        catch (error) {
            throw error.response?.data || { message: "An error occurred" };
        }
    },
    register: async (name, userName, password) => {
        try {
            const response = await api.post("/user/register", {
                name,
                userName,
                password,
            });
            return response.data;
        }
        catch (error) {
            throw error.response?.data || { message: "Registration failed" };
        }
    },
};
