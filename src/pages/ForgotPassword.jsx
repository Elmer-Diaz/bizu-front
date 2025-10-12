import { useState } from "react";
import api from "../api";
import { useToast } from "../components/ToastProvider";
import { getErrorMessage } from "../utils/errors";
import { Link } from "react-router-dom";
import { X as CloseIcon } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Banner fijo dentro de la tarjeta
  const [inlineError, setInlineError] = useState("");
  const [fieldError, setFieldError] = useState(""); // error específico de email

  const { success: toastSuccess, error: toastError } = useToast();

  const validate = () => {
    const v = email.trim();
    if (!v) {
      setFieldError("Ingresa tu correo electrónico.");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(v)) {
      setFieldError("El correo no tiene un formato válido.");
      return false;
    }
    setFieldError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInlineError("");

    if (!validate()) {
      setInlineError("Revisa el correo ingresado e inténtalo de nuevo.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/password-reset/", { email: email.trim() });
      setSubmitted(true);
      toastSuccess(res?.data?.detail || "Hemos enviado un enlace a tu correo.");
    } catch (err) {
      const msg = getErrorMessage(err, "Error al enviar solicitud. Intenta más tarde.");
      setInlineError(msg);
      toastError(msg, { duration: 7000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 py-12 min-h-screen px-4 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border">
        <h2 className="text-2xl font-bold text-[#28364e] mb-2 text-center">
          ¿Olvidaste tu contraseña?
        </h2>

        {!submitted ? (
          <>
            <p className="text-sm text-gray-600 text-center">
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
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
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldError) setFieldError("");
                  }}
                  required
                  placeholder="Correo electrónico"
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                    fieldError
                      ? "border-red-300 focus:ring-red-300"
                      : "border-gray-300 focus:ring-[#f4a261]"
                  }`}
                  aria-invalid={!!fieldError}
                  aria-describedby={fieldError ? "email-error" : undefined}
                  autoComplete="email"
                />
                {fieldError && (
                  <p id="email-error" className="mt-1 text-xs text-red-600">
                    {fieldError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full text-white font-semibold py-2 rounded transition-colors ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#f4a261] hover:bg-[#e07b19]"
                }`}
              >
                {loading ? "Enviando..." : "Enviar enlace"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center text-gray-700">
            <p className="mb-4">
              Revisa tu correo para continuar con el proceso de recuperación.
            </p>
            <Link to="/login" className="text-[#f4a261] hover:underline">
              Volver al login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
