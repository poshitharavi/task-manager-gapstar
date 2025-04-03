import { motion } from "framer-motion";
import {
  FiXCircle,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
} from "react-icons/fi";
import { useAlertStore } from "../../store/alertStore";

const AlertComponent = () => {
  const { alerts, removeAlert } = useAlertStore();

  const getIcon = (type: string) => {
    switch (type) {
      case "error":
        return <FiXCircle className="w-5 h-5" />;
      case "warning":
        return <FiAlertCircle className="w-5 h-5" />;
      case "success":
        return <FiCheckCircle className="w-5 h-5" />;
      default:
        return <FiInfo className="w-5 h-5" />;
    }
  };

  const getColor = (type: string) => {
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

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {alerts.map((alert) => (
        <motion.div
          key={alert.id}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className={`${getColor(
            alert.type
          )} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`}
        >
          {getIcon(alert.type)}
          <span className="flex-1">{alert.message}</span>
          <button
            onClick={() => removeAlert(alert.id)}
            className="hover:opacity-80"
          >
            <FiXCircle className="w-4 h-4" />
          </button>
        </motion.div>
      ))}
    </div>
  );
};

export default AlertComponent;
