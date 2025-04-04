import { jsx as _jsx } from "react/jsx-runtime";
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/home/Home";
import PrivateRoute from "./PrivateRoute";
import Login from "../pages/login/Login";
import Registration from "../pages/registration/Registration";
export const router = createBrowserRouter([
    {
        path: "/",
        element: _jsx(App, {}),
        children: [
            {
                path: "",
                element: (_jsx(PrivateRoute, { children: _jsx(Home, {}) })),
            },
            {
                path: "home",
                element: (_jsx(PrivateRoute, { children: _jsx(Home, {}) })),
            },
            {
                path: "login",
                element: _jsx(Login, {}),
            },
            {
                path: "register",
                element: _jsx(Registration, {}),
            },
        ],
    },
]);
