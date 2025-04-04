import { Task } from "../../store/taskStore";
interface EditTaskModalProps {
    task: Task | null;
    onClose: () => void;
    onSuccess: () => void;
}
declare const EditTaskModal: ({ task, onClose, onSuccess }: EditTaskModalProps) => import("react/jsx-runtime").JSX.Element | null;
export default EditTaskModal;
