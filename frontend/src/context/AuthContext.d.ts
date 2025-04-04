interface User {
    name: string;
    userName: string;
    token: string;
}
interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (userName: string, password: string) => Promise<User>;
    logout: () => void;
    isLoading: boolean;
}
export declare function AuthProvider({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useAuth(): AuthContextType;
export {};
