import { JSX } from "react";
interface PrivateRouteProps {
    children: JSX.Element;
}
declare const PrivateRoute: ({ children }: PrivateRouteProps) => import("react/jsx-runtime").JSX.Element | "Loading...";
export default PrivateRoute;
