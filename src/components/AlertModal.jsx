import { useEffect } from "react";
import { XCircle } from "lucide-react";

export default function AlertModal({ type = "success", message, onClose, duration = 3000 }) {
  const bg = type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  const border = type === "success" ? "border-green-300" : "border-red-300";

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      className={`fixed top-5 right-5 z-50 rounded-md shadow-lg px-5 py-3 border ${bg} ${border}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm">{message}</span>
        <button onClick={onClose} className="ml-2 text-gray-600 hover:text-black">
          <XCircle size={18} />
        </button>
      </div>
    </div>
  );
}
