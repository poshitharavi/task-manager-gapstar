import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { FiXCircle, FiAlertCircle, FiCheckCircle, FiInfo, } from "react-icons/fi";
import { useAlertStore } from "../../store/alertStore";
const AlertComponent = () => {
    const { alerts, removeAlert } = useAlertStore();
    const getIcon = (type) => {
        switch (type) {
            case "error":
                return _jsx(FiXCircle, { className: "w-5 h-5" });
            case "warning":
                return _jsx(FiAlertCircle, { className: "w-5 h-5" });
            case "success":
                return _jsx(FiCheckCircle, { className: "w-5 h-5" });
            default:
                return _jsx(FiInfo, { className: "w-5 h-5" });
        }
    };
    const getColor = (type) => {
        switch (type) {
            case "error":
                return "bg-red-500";
            case "warning":
                return "bg-yellow-500";
            case "success":
                return "bg-green-500";
            default:
                return "bg-blue-500";
        }
    };
    return (_jsx("div", { className: "fixed top-4 right-4 z-50 space-y-2", children: alerts.map((alert) => (_jsxs(motion.div, { initial: { x: 300, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 300, opacity: 0 }, className: `${getColor(alert.type)} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`, children: [getIcon(alert.type), _jsx("span", { className: "flex-1", children: alert.message }), _jsx("button", { onClick: () => removeAlert(alert.id), className: "hover:opacity-80", children: _jsx(FiXCircle, { className: "w-4 h-4" }) })] }, alert.id))) }));
};
export default AlertComponent;
