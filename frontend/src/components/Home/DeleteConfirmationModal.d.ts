interface DeleteConfirmationModalProps {
    taskId: number | null;
    onClose: () => void;
    onSuccess: () => void;
}
declare const DeleteConfirmationModal: ({ taskId, onClose, onSuccess, }: DeleteConfirmationModalProps) => import("react/jsx-runtime").JSX.Element | null;
export default DeleteConfirmationModal;
