import { useState } from "react";
import { MdAlternateEmail, MdPerson } from "react-icons/md";
import { FaFingerprint } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AuthService } from "../../services/auth.service";
import InputField from "../../components/ui/InputField";
import AuthCard from "../../components/ui/AuthCard";

const Registration = () => {
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await AuthService.register(name, userName, password);

      if (response.statusCode === 200 && response.body) {
        await login(userName, password);
        navigate("/");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create Account"
      subtitle="Already have an account?"
      subtitleAction="Sign in"
      subtitleActionLinkTo="/login"
      buttonText={isLoading ? "Registering..." : "Register"}
      onSubmit={handleRegister}
    >
      {error && (
        <div className="text-red-500 text-sm text-center mb-2">{error}</div>
      )}

      <form className="w-full flex flex-col gap-3" onSubmit={handleRegister}>
        <InputField
          type="text"
          placeholder="Full Name"
          icon={<MdPerson />}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
        <InputField
          type="password"
          placeholder="Confirm Password"
          icon={<FaFingerprint />}
          showPasswordToggle
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </form>
    </AuthCard>
  );
};

export default Registration;
