import { create } from "zustand";

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

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  showAlert: (type, message, timeout = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({ alerts: [...state.alerts, { id, type, message }] }));

    setTimeout(() => {
      set((state) => ({
        alerts: state.alerts.filter((alert) => alert.id !== id),
      }));
    }, timeout);
  },
  removeAlert: (id) => {
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== id),
    }));
  },
}));
