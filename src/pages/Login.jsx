import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, XCircle, X as CloseIcon } from "lucide-react";
import api from "../api";
import AlertModal from "../components/AlertModal";
import { AuthContext } from "../context/AuthContext.jsx";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState(null);           // modal success
  const [inlineError, setInlineError] = useState(""); // banner de error
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { loadUser } = useContext(AuthContext);

  const validate = () => {
    const errs = { email: "", password: "" };
    const email = form.email.trim();
    const pass = form.password;

    if (!email) {
      errs.email = "Ingresa tu correo electrónico.";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errs.email = "El correo no tiene un formato válido.";
    }

    if (!pass) {
      errs.password = "Ingresa tu contraseña.";
    }

    setFieldErrors(errs);
    // retorna true si todo OK
    return !errs.email && !errs.password;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    // Limpia error del campo al escribir
    if (fieldErrors[name]) {
      setFieldErrors((fe) => ({ ...fe, [name]: "" }));
    }
    // No limpiamos el banner general automáticamente para que sea “fijo”
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // evita recarga
    setInlineError("");

    // ✅ Validación antes de llamar al backend
    const ok = validate();
    if (!ok) {
      setInlineError("Revisa los campos marcados e inténtalo de nuevo.");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post("/token/", {
        email: form.email.trim(),
        password: form.password,
      });

      const { access, refresh, uuid, full_name, role } = data;

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("uuid", uuid);
      localStorage.setItem("full_name", full_name);
      localStorage.setItem("role", role);

      await loadUser();
      setAlert({ type: "success", message: "Inicio de sesión exitoso" });

      setTimeout(() => {
        navigate(`/profile/${uuid}`);
      }, 1200);
    } catch (error) {
      console.error("Error en login:", error);
      // ❌ Error del backend: credenciales inválidas, etc.
      setInlineError(error.response?.data?.detail || "Credenciales inválidas.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold text-[#28364e] mb-2 text-center">¡Bienvenido!</h2>

        <p className="text-center text-sm text-gray-500">
          Ingresa tus credenciales para continuar
        </p>

        {/* Banner de error fijo */}
        {inlineError && (
          <div
            role="alert"
            aria-live="assertive"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2"
          >
            <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
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
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                  fieldErrors.email
                    ? "border-red-300 focus:ring-red-300"
                    : "border-gray-300 focus:ring-[#f4a261]"
                }`}
                placeholder="correo@ejemplo.com"
                required
                autoComplete="email"
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
              />
            </div>
            {fieldErrors.email && (
              <p id="email-error" className="mt-1 text-xs text-red-600">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 py-2 border rounded focus:outline-none focus:ring-2 ${
                  fieldErrors.password
                    ? "border-red-300 focus:ring-red-300"
                    : "border-gray-300 focus:ring-[#f4a261]"
                }`}
                placeholder="********"
                required
                autoComplete="current-password"
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

            <div className="text-right mt-1">
              <a href="/forgot-password" className="text-xs text-[#f4a261] hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#f4a261] hover:bg-[#e07b19] disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-2 rounded transition-colors"
          >
            {submitting ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-600">
          ¿No tienes cuenta?{" "}
          <a href="/register" className="text-[#f4a261] hover:underline">
            Regístrate
          </a>
        </p>
      </div>

      {/* Modal solo para success */}
      {alert?.type === "success" && (
        <AlertModal
          type="success"
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
    </div>
  );
}
