import { create } from "zustand";
export const useAlertStore = create((set) => ({
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
