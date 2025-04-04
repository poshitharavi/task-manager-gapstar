import { ReactNode } from "react";
interface BodyCardProps {
    children: ReactNode;
    title?: string;
    headerContent?: ReactNode;
}
declare const BodyCard: ({ children, title, headerContent }: BodyCardProps) => import("react/jsx-runtime").JSX.Element;
export default BodyCard;
