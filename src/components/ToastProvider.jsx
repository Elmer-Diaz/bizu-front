import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

const ToastContext = createContext(null);

export function ToastProvider({ children, duration = 3500, maxToasts = 4 }) {
  const [toasts, setToasts] = useState([]);

  // Limpieza automática por tiempo
  useEffect(() => {
    const timers = toasts.map(t =>
      setTimeout(() => dismiss(t.id), t.duration ?? duration)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, duration]);

  const show = useCallback((payload) => {
    setToasts(prev => {
      const id = crypto.randomUUID();
      const next = [{ id, ...payload }, ...prev];
      return next.slice(0, maxToasts);
    });
  }, [maxToasts]);

  const success = useCallback((message, opts = {}) => {
    show({ type: "success", message, ...opts });
  }, [show]);

  const error = useCallback((message, opts = {}) => {
    show({ type: "error", message, ...opts });
  }, [show]);

  const info = useCallback((message, opts = {}) => {
    show({ type: "info", message, ...opts });
  }, [show]);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const value = useMemo(() => ({ success, error, info, show, dismiss }), [success, error, info, show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-[200] space-y-3 w-[92vw] max-w-sm">
          {toasts.map(t => (
            <Toast key={t.id} toast={t} onClose={() => dismiss(t.id)} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

function Toast({ toast, onClose }) {
  const base = "w-full rounded-lg shadow-lg p-4 text-sm border flex items-start gap-3";
  const stylesByType = {
    success: "bg-white border-green-200",
    error:   "bg-white border-red-200",
    info:    "bg-white border-slate-200",
  };
  const dotByType = {
    success: "bg-green-500",
    error:   "bg-red-500",
    info:    "bg-slate-500",
  };

  return (
    <div className={`${base} ${stylesByType[toast.type] || stylesByType.info}`} role="status" aria-live="polite">
      <span className={`mt-1 h-2 w-2 rounded-full ${dotByType[toast.type] || dotByType.info}`} />
      <div className="flex-1 text-slate-800">
        {toast.title && <div className="font-medium mb-0.5">{toast.title}</div>}
        <div>{toast.message}</div>
      </div>
      <button
        onClick={onClose}
        className="shrink-0 text-slate-400 hover:text-slate-600"
        aria-label="Cerrar notificación"
        title="Cerrar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}
