import { ReactNode } from "react";
interface InputFieldProps {
    type: string;
    placeholder: string;
    icon: ReactNode;
    showPasswordToggle?: boolean;
    value: string;
    required?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
declare const InputField: ({ type, placeholder, icon, showPasswordToggle, value, required, onChange, }: InputFieldProps) => import("react/jsx-runtime").JSX.Element;
export default InputField;
