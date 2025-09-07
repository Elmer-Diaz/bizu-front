import { useState } from "react";
import api from "../api";
import AlertModal from "../components/AlertModal";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      const res = await api.post("/password-reset/", { email });
      setSubmitted(true);
      setAlert({ type: "success", message: res.data.detail });
    } catch (error) {
      setAlert({
        type: "error",
        message: error.response?.data?.detail || "Error al enviar solicitud. Intenta más tarde."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 py-12 min-h-screen px-4 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border">
        <h2 className="text-2xl font-bold text-[#28364e] mb-6 text-center">
          ¿Olvidaste tu contraseña?
        </h2>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-sm text-gray-600 text-center">
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Correo electrónico"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#f4a261]"
            />

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
        ) : (
          <div className="text-center text-gray-700">
            <p className="mb-4">
              Revisa tu correo para continuar con el proceso de recuperación.
            </p>
            <a href="/login" className="text-[#f4a261] hover:underline">
              Volver al login
            </a>
          </div>
        )}
      </div>

      {alert && (
        <AlertModal
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
    </div>
  );
}
