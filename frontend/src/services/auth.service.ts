/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";

interface LoginResponse {
  statusCode: number;
  message: string;
  body?: {
    name: string;
    userName: string;
    token: string;
  };
}

export const AuthService = {
  login: async (userName: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post("/user/login", { userName, password });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: "An error occurred" };
    }
  },
  register: async (
    name: string,
    userName: string,
    password: string
  ): Promise<LoginResponse> => {
    try {
      const response = await api.post("/user/register", {
        name,
        userName,
        password,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: "Registration failed" };
    }
  },
};
