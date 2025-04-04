import { ReactNode } from "react";
interface AuthCardProps {
    title: string;
    subtitle: string;
    subtitleAction: string;
    children: ReactNode;
    buttonText: string;
    onSubmit: (e: React.FormEvent) => Promise<void>;
}
declare const AuthCard: ({ title, subtitle, subtitleAction, children, buttonText, onSubmit, }: AuthCardProps) => import("react/jsx-runtime").JSX.Element;
export default AuthCard;
