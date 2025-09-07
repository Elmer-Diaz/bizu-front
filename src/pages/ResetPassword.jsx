import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import api from "../api"; // ✅ Usamos la instancia global con interceptores
import AlertModal from "../components/AlertModal";

export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validación de contraseñas
    if (form.password !== form.confirmPassword) {
      setAlert({ type: "error", message: "Las contraseñas no coinciden." });
      setLoading(false);
      return;
    }

    try {
      // ✅ Llamada a API usando axios configurado
      await api.post(`/password-reset-confirm/${uid}/${token}/`, {
        password: form.password,
      });

      setAlert({ type: "success", message: "Contraseña restablecida correctamente." });

      // Redirigir después de un pequeño delay
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      console.error("Error al restablecer contraseña:", err);

      // Mostrar mensaje desde backend si existe
      if (err.response?.data?.detail) {
        setAlert({ type: "error", message: err.response.data.detail });
      } else {
        setAlert({ type: "error", message: "Token inválido o expirado." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold text-[#28364e] mb-4 text-center">
          Restablecer contraseña
        </h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Ingresa tu nueva contraseña
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
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
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#f4a261]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#f4a261]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
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
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#f4a261]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f4a261] hover:bg-[#e07b19] text-white font-semibold py-2 rounded transition-colors"
          >
            {loading ? "Guardando..." : "Restablecer contraseña"}
          </button>
        </form>

        {/* Modal de alerta */}
        {alert && (
          <AlertModal
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}
      </div>
    </div>
  );
}
