import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
createRoot(document.getElementById("root")).render(_jsx(StrictMode, { children: _jsx(AuthProvider, { children: _jsx(RouterProvider, { router: router }) }) }));
