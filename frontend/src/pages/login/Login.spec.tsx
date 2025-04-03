import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, beforeEach, expect } from "vitest";
import Login from "./Login";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Mock the AuthContext
vi.mock("../../context/AuthContext", () => {
  const mockLogin = vi.fn();
  return {
    useAuth: () => ({
      login: mockLogin,
    }),
  };
});

// Mock the useNavigate hook
vi.mock("react-router-dom", () => {
  const mockNavigate = vi.fn();
  return {
    useNavigate: () => mockNavigate,
  };
});

// Mock the child components to isolate Login logic
vi.mock("../../components/ui/AuthCard", () => ({
  default: ({
    title,
    subtitle,
    subtitleAction,
    buttonText,
    onSubmit,
    children,
  }) => (
    <div data-testid="auth-card">
      <h2>{title}</h2>
      <p>
        {subtitle} <button onClick={() => {}}>{subtitleAction}</button>
      </p>
      <form onSubmit={onSubmit}>
        {children}
        <button type="submit" disabled={buttonText.includes("Logging in...")}>
          {buttonText}
        </button>
      </form>
    </div>
  ),
}));

vi.mock("../../components/ui/InputField", () => ({
  default: ({
    type,
    placeholder,
    icon,
    value,
    onChange,
    required,
    showPasswordToggle,
  }) => (
    <div data-testid={`input-${placeholder.toLowerCase()}`}>
      {icon}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
      {showPasswordToggle && (
        <button onClick={() => {}}>Toggle Password</button>
      )}
    </div>
  ),
}));

describe("<Login />", () => {
  let mockLogin: ReturnType<typeof vi.fn>;
  let mockNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    const authContext = useAuth() as { login: ReturnType<typeof vi.fn> };
    mockLogin = authContext.login;
    const router = useNavigate as () => ReturnType<typeof vi.fn>;
    mockNavigate = router();

    mockLogin.mockReset();
    mockNavigate.mockReset();
  });

  it("renders the login form with username and password fields", () => {
    render(<Login />);
    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  it("updates username and password state on input change", () => {
    render(<Login />);
    const usernameInput = screen.getByPlaceholderText("Username");
    const passwordInput = screen.getByPlaceholderText("Password");

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect((usernameInput as HTMLInputElement).value).toBe("testuser");
    expect((passwordInput as HTMLInputElement).value).toBe("password123");
  });

  it("calls the login function from AuthContext with correct credentials on form submission", async () => {
    render(<Login />);
    const usernameInput = screen.getByPlaceholderText("Username");
    const passwordInput = screen.getByPlaceholderText("Password");
    const loginButton = screen.getByRole("button", { name: "Login" });

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(loginButton);

    expect(mockLogin).toHaveBeenCalledWith("testuser", "password123");
    expect(
      screen.getByRole("button", { name: "Logging in..." })
    ).toBeDisabled();
  });

  it('navigates to "/" after successful login', async () => {
    mockLogin.mockResolvedValue(undefined); // Simulate successful login
    render(<Login />);
    const usernameInput = screen.getByPlaceholderText("Username");
    const passwordInput = screen.getByPlaceholderText("Password");
    const loginButton = screen.getByRole("button", { name: "Login" });

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("displays an error message for failed login", async () => {
    mockLogin.mockRejectedValue(new Error("Invalid credentials"));
    render(<Login />);
    const usernameInput = screen.getByPlaceholderText("Username");
    const passwordInput = screen.getByPlaceholderText("Password");
    const loginButton = screen.getByRole("button", { name: "Login" });

    fireEvent.change(usernameInput, { target: { value: "wronguser" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Login" })).toBeEnabled();
  });

  it("displays a generic error message if the login function throws a non-Error", async () => {
    mockLogin.mockRejectedValue("Login failed for unknown reason");
    render(<Login />);
    const usernameInput = screen.getByPlaceholderText("Username");
    const passwordInput = screen.getByPlaceholderText("Password");
    const loginButton = screen.getByRole("button", { name: "Login" });

    fireEvent.change(usernameInput, { target: { value: "test" } });
    fireEvent.change(passwordInput, { target: { value: "test" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(
        screen.getByText("Invalid email or password. Please try again.")
      ).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Login" })).toBeEnabled();
  });

  it("disables the login button while loading", async () => {
    render(<Login />);
    const usernameInput = screen.getByPlaceholderText("Username");
    const passwordInput = screen.getByPlaceholderText("Password");
    const loginButton = screen.getByRole("button", { name: "Login" });

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(loginButton);

    expect(
      screen.getByRole("button", { name: "Logging in..." })
    ).toBeDisabled();

    // Simulate login completion (either success or failure)
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: "Logging in..." })
      ).not.toBeInTheDocument();
    });
  });
});
