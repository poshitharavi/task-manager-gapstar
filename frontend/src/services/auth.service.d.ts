interface LoginResponse {
    statusCode: number;
    message: string;
    body?: {
        name: string;
        userName: string;
        token: string;
    };
}
export declare const AuthService: {
    login: (userName: string, password: string) => Promise<LoginResponse>;
    register: (name: string, userName: string, password: string) => Promise<LoginResponse>;
};
export {};
