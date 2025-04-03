import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { logout } = useAuth();

  return (
    <nav className="w-full bg-gray-900 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <img src="/logo.png" alt="logo" className="w-8 h-8" />
            <span className="ml-2 text-xl font-semibold text-white">
              Task Manager
            </span>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
