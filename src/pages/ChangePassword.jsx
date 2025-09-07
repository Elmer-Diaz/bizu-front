import { useState } from "react";
import api from "../api";
import AlertModal from "../components/AlertModal";

export default function ChangePassword() {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (form.new_password !== form.confirm_password) {
      setAlert({ type: "error", message: "Las nuevas contraseñas no coinciden." });
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/change-password/", {
        current_password: form.current_password,
        new_password: form.new_password,
      });

      setAlert({ type: "success", message: res.data.detail });
      setForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      setAlert({
        type: "error",
        message: err.response?.data?.detail || "Error al cambiar la contraseña.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md border">
        <h2 className="text-2xl font-bold text-[#28364e] mb-4 text-center">
          Cambiar contraseña
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Contraseña actual */}
          <input
            type="password"
            name="current_password"
            value={form.current_password}
            onChange={handleChange}
            placeholder="Contraseña actual"
            required
            className="w-full px-4 py-2 border rounded"
          />
          {/* Nueva contraseña */}
          <input
            type="password"
            name="new_password"
            value={form.new_password}
            onChange={handleChange}
            placeholder="Nueva contraseña"
            required
            className="w-full px-4 py-2 border rounded"
          />
          {/* Confirmar nueva contraseña */}
          <input
            type="password"
            name="confirm_password"
            value={form.confirm_password}
            onChange={handleChange}
            placeholder="Confirmar nueva contraseña"
            required
            className="w-full px-4 py-2 border rounded"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f4a261] hover:bg-[#e07b19] text-white font-semibold py-2 rounded"
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>

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
