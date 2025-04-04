import { Task } from "../../store/taskStore";
interface ViewTaskModalProps {
    task: Task | null;
    onClose: () => void;
}
declare const ViewTaskModal: ({ task, onClose }: ViewTaskModalProps) => import("react/jsx-runtime").JSX.Element | null;
export default ViewTaskModal;
