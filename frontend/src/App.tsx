import { Outlet } from "react-router-dom";
import "./App.css";
import AlertComponent from "./components/ui/AlertComponent";
// import { useAuth } from "./context/AuthContext";
// import Navbar from "./components/ui/Navbar";

const App = () => {
  // const { isAuthenticated } = useAuth();
  return (
    <div>
      {/* {isAuthenticated && <Navbar />} */}
      <AlertComponent />
      <Outlet />
    </div>
  );
};

export default App;
