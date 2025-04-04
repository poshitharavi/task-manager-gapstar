type AlertType = "error" | "success" | "warning" | "info";
interface Alert {
    id: string;
    type: AlertType;
    message: string;
}
interface AlertState {
    alerts: Alert[];
    showAlert: (type: AlertType, message: string, timeout?: number) => void;
    removeAlert: (id: string) => void;
}
export declare const useAlertStore: import("zustand").UseBoundStore<import("zustand").StoreApi<AlertState>>;
export {};
