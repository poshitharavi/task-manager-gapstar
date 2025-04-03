import { useState } from "react";
import { MdAlternateEmail } from "react-icons/md";
import { FaFingerprint } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthCard from "../../components/ui/AuthCard";
import InputField from "../../components/ui/InputField";

const Login = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(userName, password);
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid email or password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Don't have an account?"
      subtitleAction="Sign up"
      buttonText={isLoading ? "Logging in..." : "Login"}
      onSubmit={handleLogin}
    >
      {error && (
        <div className="text-red-500 text-sm text-center mb-2">{error}</div>
      )}

      <form className="w-full flex flex-col gap-3" onSubmit={handleLogin}>
        <InputField
          type="text"
          placeholder="Username"
          icon={<MdAlternateEmail />}
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
        <InputField
          type="password"
          placeholder="Password"
          icon={<FaFingerprint />}
          showPasswordToggle
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </form>
    </AuthCard>
  );
};

export default Login;
