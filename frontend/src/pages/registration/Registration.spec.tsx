import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Registration from "./Registration";

import { vi } from "vitest";

// Mock the AuthContext
vi.mock('../../context/AuthContext', () => {
  const mockLogin = vi.fn();
  return {
    useAuth: () => ({
      login: mockLogin,
    }),
  };
});

// Mock the AuthService
vi.mock('../../services/auth.service', () => {
  const mockRegister = vi.fn();
  return {
    AuthService: {
      register: mockRegister,
    },
  };
});

// Mock the useNavigate hook
vi.mock('react-router-dom', () => {
  const mockNavigate = vi.fn();
  return {
    useNavigate: () => mockNavigate,
  };
});

// Mock the child components
vi.mock('../../components/ui/AuthCard', (...) => ({
  default: ({ title, subtitle, subtitleAction, buttonText, onSubmit, children }) => (
    <div data-testid="auth-card">
      <h2>{title}</h2>
      <p>{subtitle} <button onClick={() => {}}>{subtitleAction}</button></p>
      <form onSubmit={onSubmit}>
        {children}
        <button type="submit" disabled={buttonText.includes('Registering...')}>{buttonText}</button>
      </form>
    </div>
  ),
}));

vi.mock('../../components/ui/InputField', (...) => ({
  default: ({ type, placeholder, icon, value, onChange, required, showPasswordToggle }) => (
    <div data-testid={`input-${placeholder.toLowerCase().replace(' ', '-')}`}>
      {icon}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
      {showPasswordToggle && <button onClick={() => {}}>Toggle Password</button>}
    </div>
  ),
}));

describe("<Registration />", () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockRegister.mockReset();
    mockNavigate.mockReset();
  });

  it("renders the registration form with all fields", () => {
    render(<Registration />);
    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Full Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirm Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Register" })
    ).toBeInTheDocument();
  });

  it("updates state for all input fields", () => {
    render(<Registration />);
    const nameInput = screen.getByPlaceholderText("Full Name");
    const usernameInput = screen.getByPlaceholderText("Username");
    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmPasswordInput =
      screen.getByPlaceholderText("Confirm Password");

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(usernameInput, { target: { value: "johndoe" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });

    expect((nameInput as HTMLInputElement).value).toBe("John Doe");
    expect((usernameInput as HTMLInputElement).value).toBe("johndoe");
    expect((passwordInput as HTMLInputElement).value).toBe("password123");
    expect((confirmPasswordInput as HTMLInputElement).value).toBe(
      "password123"
    );
  });

  it("displays an error if passwords do not match", async () => {
    render(<Registration />);
    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmPasswordInput =
      screen.getByPlaceholderText("Confirm Password");
    const registerButton = screen.getByRole("button", { name: "Register" });

    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "mismatch" } });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });
    expect(mockRegister).not.toHaveBeenCalled();
    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Register" })).toBeEnabled();
  });

  it("calls AuthService.register with correct data on successful registration and then logs in and navigates", async () => {
    mockRegister.mockResolvedValue({
      statusCode: 200,
      body: { user: { userName: "testuser" } },
    });
    mockLogin.mockResolvedValue(undefined);
    render(<Registration />);
    const nameInput = screen.getByPlaceholderText("Full Name");
    const usernameInput = screen.getByPlaceholderText("Username");
    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmPasswordInput =
      screen.getByPlaceholderText("Confirm Password");
    const registerButton = screen.getByRole("button", { name: "Register" });

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });
    fireEvent.click(registerButton);

    expect(
      screen.getByRole("button", { name: "Registering..." })
    ).toBeDisabled();
    expect(mockRegister).toHaveBeenCalledWith(
      "Test User",
      "testuser",
      "password123"
    );

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("testuser", "password123");
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
    expect(
      screen.queryByRole("button", { name: "Registering..." })
    ).not.toBeInTheDocument();
  });

  it("displays an error message if registration fails", async () => {
    mockRegister.mockRejectedValue(new Error("Failed to register"));
    render(<Registration />);
    const nameInput = screen.getByPlaceholderText("Full Name");
    const usernameInput = screen.getByPlaceholderText("Username");
    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmPasswordInput =
      screen.getByPlaceholderText("Confirm Password");
    const registerButton = screen.getByRole("button", { name: "Register" });

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });
    fireEvent.click(registerButton);

    expect(
      screen.getByRole("button", { name: "Registering..." })
    ).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText("Failed to register")).toBeInTheDocument();
    });
    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Register" })).toBeEnabled();
  });

  it("displays a generic error if registration throws a non-Error", async () => {
    mockRegister.mockRejectedValue("Registration service down");
    render(<Registration />);
    const nameInput = screen.getByPlaceholderText("Full Name");
    const usernameInput = screen.getByPlaceholderText("Username");
    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmPasswordInput =
      screen.getByPlaceholderText("Confirm Password");
    const registerButton = screen.getByRole("button", { name: "Register" });

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(
        screen.getByText("Registration failed. Please try again.")
      ).toBeInTheDocument();
    });
    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Register" })).toBeEnabled();
  });

  it("disables the register button while registering", async () => {
    mockRegister.mockResolvedValue({
      statusCode: 200,
      body: { user: { userName: "testuser" } },
    });
    render(<Registration />);
    const nameInput = screen.getByPlaceholderText("Full Name");
    const usernameInput = screen.getByPlaceholderText("Username");
    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmPasswordInput =
      screen.getByPlaceholderText("Confirm Password");
    const registerButton = screen.getByRole("button", { name: "Register" });

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });
    fireEvent.click(registerButton);

    expect(
      screen.getByRole("button", { name: "Registering..." })
    ).toBeDisabled();

    await waitFor(() => {
      // Wait for the registration process to complete (mocked promise resolution)
      expect(
        screen.queryByRole("button", { name: "Registering..." })
      ).not.toBeInTheDocument();
    });
  });
});
