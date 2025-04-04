import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from "react-router-dom";
import "./App.css";
import AlertComponent from "./components/ui/AlertComponent";
// import { useAuth } from "./context/AuthContext";
// import Navbar from "./components/ui/Navbar";
const App = () => {
    // const { isAuthenticated } = useAuth();
    return (_jsxs("div", { children: [_jsx(AlertComponent, {}), _jsx(Outlet, {})] }));
};
export default App;
