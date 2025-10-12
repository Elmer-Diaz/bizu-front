import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, X as CloseIcon } from "lucide-react";
import api from "../api"; // instancia con interceptores
import { useToast } from "../components/ToastProvider";
import { getErrorMessage } from "../utils/errors";

export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState(""); // banner dentro del card
  const [fieldErrors, setFieldErrors] = useState({ password: "", confirmPassword: "" });

  const { success: toastSuccess, error: toastError } = useToast();
  const passRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((fe) => ({ ...fe, [name]: "" }));
    if (inlineError) setInlineError("");
  };

  const validate = () => {
    const errs = { password: "", confirmPassword: "" };
    let ok = true;

    if (!form.password) {
      errs.password = "Ingresa la nueva contraseña.";
      ok = false;
    }
    if (!form.confirmPassword) {
      errs.confirmPassword = "Confirma la nueva contraseña.";
      ok = false;
    }
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      errs.password = "Las contraseñas no coinciden.";
      errs.confirmPassword = "Las contraseñas no coinciden.";
      ok = false;
    }
    setFieldErrors(errs);
    return ok;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInlineError("");

    const ok = validate();
    if (!ok) {
      setInlineError("Revisa los campos marcados e inténtalo de nuevo.");
      // Llevar foco al primer campo
      passRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      await api.post(
        `/password-reset-confirm/${uid}/${token}/`,
        { password: form.password },
        { _skipAuthHandler: true } // evita redirección automática en 401
      );

      toastSuccess("Contraseña restablecida correctamente 🎉", { duration: 3500 });
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      const msg = getErrorMessage(err, "Token inválido o expirado.");
      setInlineError(msg);
      toastError(msg, { duration: 7000 });

      // Si tu backend envía errores por campo, mapéalos:
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        const next = { password: "", confirmPassword: "" };
        if (Array.isArray(data.password) && data.password.length) next.password = String(data.password[0]);
        if (typeof data.password === "string") next.password = data.password;
        // confirmPassword no suele venir del backend, pero lo dejamos por consistencia
        setFieldErrors((fe) => ({ ...fe, ...next }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold text-[#28364e] mb-2 text-center">
          Restablecer contraseña
        </h2>
        <p className="text-sm text-gray-600 text-center">
          Ingresa tu nueva contraseña
        </p>

        {/* Banner fijo de error */}
        {inlineError && (
          <div
            role="alert"
            aria-live="assertive"
            className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2"
          >
            <div className="min-w-0">{inlineError}</div>
            <button
              type="button"
              onClick={() => setInlineError("")}
              className="ml-auto -mr-1 rounded p-1 text-red-500 hover:bg-red-100"
              aria-label="Cerrar mensaje de error"
              title="Cerrar"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 mt-6" noValidate>
          {/* Nueva contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Lock size={18} />
              </span>
              <input
                ref={passRef}
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 py-2 border rounded focus:outline-none focus:ring-2 ${
                  fieldErrors.password
                    ? "border-red-300 focus:ring-red-300"
                    : "border-gray-300 focus:ring-[#f4a261]"
                }`}
                required
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#f4a261]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p id="password-error" className="mt-1 text-xs text-red-600">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                fieldErrors.confirmPassword
                  ? "border-red-300 focus:ring-red-300"
                  : "border-gray-300 focus:ring-[#f4a261]"
              }`}
              required
              aria-invalid={!!fieldErrors.confirmPassword}
              aria-describedby={fieldErrors.confirmPassword ? "confirm-password-error" : undefined}
            />
            {fieldErrors.confirmPassword && (
              <p id="confirm-password-error" className="mt-1 text-xs text-red-600">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f4a261] hover:bg-[#e07b19] disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-2 rounded transition-colors"
          >
            {loading ? "Guardando..." : "Restablecer contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
