import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "../home/Home";
import { useTaskStore } from "../../store/taskStore";
import { useAlertStore } from "../../store/alertStore";
import { useDebounce } from "../../hooks/useDebounce";
import { format } from "date-fns";
import { vi, describe, it, beforeEach, expect } from "vitest";

vi.mock("../../store/taskStore", () => ({
  useTaskStore: vi.fn(),
}));

vi.mock("../../store/alertStore", () => ({
  useAlertStore: vi.fn(),
}));

vi.mock("../../hooks/useDebounce", () => ({
  useDebounce: vi.fn((value) => value), // Mock to return the value immediately for testing
}));

vi.mock("../../components/ui/Navbar", () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock("../../components/ui/BodyCard", () => ({
  default: ({ children }) => <div data-testid="body-card">{children}</div>,
}));

vi.mock("../../components/Home/CreateTaskModal.tsx", () => ({
  default: ({ isOpen, onClose }) =>
    isOpen ? (
      <div data-testid="create-task-modal">
        CreateTaskModal <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

vi.mock("../../components/Home/ViewTaskModal.tsx", () => ({
  default: ({ task, onClose }) =>
    task ? (
      <div data-testid="view-task-modal">
        ViewTaskModal <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

vi.mock("../../components/Home/EditTaskModal", () => ({
  default: ({ task, onClose }) =>
    task ? (
      <div data-testid="edit-task-modal">
        EditTaskModal <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

vi.mock("../../components/Home/DeleteConfirmationModal", () => ({
  default: ({ taskId, onClose, onSuccess }) =>
    taskId !== null ? (
      <div data-testid="delete-confirmation-modal">
        DeleteConfirmationModal <button onClick={onClose}>Cancel</button>{" "}
        <button onClick={onSuccess}>Confirm Delete</button>
      </div>
    ) : null,
}));

const mockTasks = [
  {
    id: 1,
    title: "Task 1",
    priority: "HIGH",
    dueDate: new Date(),
    status: "NOT_DONE",
    dependencies: [],
  },
  {
    id: 2,
    title: "Task 2",
    priority: "LOW",
    dueDate: new Date(),
    status: "DONE",
    dependencies: [],
  },
];

const mockCounts = { active: 1, completed: 1 };
const mockFetchTasks = vi.fn();
const mockSetSort = vi.fn();
const mockUpdateStatus = vi.fn();
const mockSetSearchTerm = vi.fn();
const mockShowAlert = vi.fn();

describe("<Home />", () => {
  beforeEach(() => {
    (useTaskStore as vi.Mock).mockReturnValue({
      tasks: mockTasks,
      counts: mockCounts,
      sortBy: "id",
      isLoading: false,
      error: null,
      searchTerm: "",
      fetchTasks: mockFetchTasks,
      setSort: mockSetSort,
      updateStatus: mockUpdateStatus,
      setSearchTerm: mockSetSearchTerm,
    });
    (useAlertStore as vi.Mock).mockReturnValue({
      alerts: [],
      showAlert: mockShowAlert,
      removeAlert: vi.fn(),
    });
    (useDebounce as vi.Mock).mockImplementation((value) => value); // Reset debounce mock
  });

  it("renders the component with initial data", () => {
    render(<Home />);
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("body-card")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search tasks...")).toBeInTheDocument();
    expect(screen.getByText("1 active tasks, 1 completed")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveValue("id");
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("HIGH")).toBeInTheDocument();
    expect(
      screen.getByText(
        format(new Date(mockTasks[0].dueDate), `MMM dd,<\ctrl3348>`)
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "NOT DONE" })
    ).toBeInTheDocument();
    expect(screen.getByTitle("View")).toBeInTheDocument();
    expect(screen.getByTitle("Edit")).toBeInTheDocument();
    expect(screen.getByTitle("Delete")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("LOW")).toBeInTheDocument();
    expect(
      screen.getByText(
        format(new Date(mockTasks[1].dueDate), "MMM dd,<ctrl3348>")
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "DONE" })).toBeInTheDocument();
  });

  it("calls fetchTasks on mount", () => {
    render(<Home />);
    expect(mockFetchTasks).toHaveBeenCalledTimes(1);
  });

  it("opens the Create Task Modal when the plus button is clicked", () => {
    render(<Home />);
    fireEvent.click(screen.getByTitle("Create New Task"));
    expect(screen.getByTestId("create-task-modal")).toBeInTheDocument();
    fireEvent.click(
      screen.getByTestId("create-task-modal").querySelector("button")!
    ); // Close the modal
    expect(screen.queryByTestId("create-task-modal")).not.toBeInTheDocument();
  });

  it("updates local search state when the search input changes", () => {
    render(<Home />);
    const searchInput = screen.getByPlaceholderText("Search tasks...");
    fireEvent.change(searchInput, { target: { value: "Task" } });
    // In a real scenario with debounce, you might need to wait here
    expect((searchInput as HTMLInputElement).value).toBe("Task");
  });

  it("calls setSearchTerm with debounced value", async () => {
    (useDebounce as vi.Mock).mockImplementation((value) => value); // Simulate immediate debounce
    render(<Home />);
    const searchInput = screen.getByPlaceholderText("Search tasks...");
    fireEvent.change(searchInput, { target: { value: "Test" } });
    await waitFor(() => {
      expect(mockSetSearchTerm).toHaveBeenCalledWith("Test");
    });
  });

  it("opens the View Task Modal when the view button is clicked", () => {
    render(<Home />);
    fireEvent.click(screen.getAllByTitle("View")[0]);
    expect(screen.getByTestId("view-task-modal")).toBeInTheDocument();
    fireEvent.click(
      screen.getByTestId("view-task-modal").querySelector("button")!
    ); // Close the modal
    expect(screen.queryByTestId("view-task-modal")).not.toBeInTheDocument();
  });

  it("opens the Edit Task Modal when the edit button is clicked", () => {
    render(<Home />);
    fireEvent.click(screen.getAllByTitle("Edit")[0]);
    expect(screen.getByTestId("edit-task-modal")).toBeInTheDocument();
    fireEvent.click(
      screen.getByTestId("edit-task-modal").querySelector("button")!
    ); // Close the modal
    expect(screen.queryByTestId("edit-task-modal")).not.toBeInTheDocument();
  });

  it("opens the Delete Confirmation Modal when the delete button is clicked", () => {
    render(<Home />);
    fireEvent.click(screen.getAllByTitle("Delete")[0]);
    expect(screen.getByTestId("delete-confirmation-modal")).toBeInTheDocument();
    fireEvent.click(
      screen.getByTestId("delete-confirmation-modal").querySelector("button")!
    ); // Cancel delete
    expect(
      screen.queryByTestId("delete-confirmation-modal")
    ).not.toBeInTheDocument();
  });

  it("calls updateStatus when the status button is clicked", async () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "NOT DONE" }));
    expect(mockUpdateStatus).toHaveBeenCalledWith(1, "DONE");
  });

  it("calls setSort when the sort select changes", () => {
    render(<Home />);
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "priority" },
    });
    expect(mockSetSort).toHaveBeenCalledWith("priority");
  });

  it("renders loading state", () => {
    (useTaskStore as vi.Mock).mockReturnValue({
      ...mockTaskStoreReturnValue,
      isLoading: true,
    });
    render(<Home />);
    expect(screen.getByText("Loading tasks...")).toBeInTheDocument();
  });

  it("renders error state", () => {
    (useTaskStore as vi.Mock).mockReturnValue({
      ...mockTaskStoreReturnValue,
      isLoading: false,
      error: "Failed to fetch tasks",
    });
    render(<Home />);
    expect(screen.getByText("Failed to fetch tasks")).toBeInTheDocument();
  });
});

// Helper for the default return value of useTaskStore mock
const mockTaskStoreReturnValue = {
  tasks: mockTasks,
  counts: mockCounts,
  sortBy: "id",
  isLoading: false,
  error: null,
  searchTerm: "",
  fetchTasks: mockFetchTasks,
  setSort: mockSetSort,
  updateStatus: mockUpdateStatus,
  setSearchTerm: mockSetSearchTerm,
};
