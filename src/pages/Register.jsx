// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { categories } from "../constants/categories";
import { cities } from "../constants/cities";
import { UploadCloud } from "lucide-react";
import AlertModal from "../components/AlertModal";
import api from "../api"; // usamos tu instancia con interceptores

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    full_name: "",
    password: "",
    role: "client",
    phone: "",
    city: "",
    bio: "",
    category: "",
    headline: "",
    services: [""],
    schedule: "",
    photo: null,
  });

  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      const file = files[0];
      setForm({ ...form, photo: file });
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleServiceChange = (index, value) => {
    const newServices = [...form.services];
    newServices[index] = value;
    setForm({ ...form, services: newServices });
  };

  const addServiceField = () => {
    setForm({ ...form, services: [...form.services, ""] });
  };

  const removeServiceField = (index) => {
    const newServices = form.services.filter((_, i) => i !== index);
    setForm({ ...form, services: newServices });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAlert(null);

    const payload = new FormData();
    for (const key in form) {
      if (key === "services") {
        form.services.forEach((s) => payload.append("services", s.trim()));
      } else {
        payload.append(key, form[key]);
      }
    }

    try {
      const res = await api.post("/register/", payload, {
        headers: {
          "Content-Type": "multipart/form-data", // importante para subir imagen
        },
      });

      setAlert({ type: "success", message: "Registro exitoso. Serás redirigido al login." });
      setTimeout(() => navigate("/login"), 2000);

    } catch (err) {
      let errorMsg = "Error en el registro";
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "object") {
          errorMsg = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(" | ");
        } else {
          errorMsg = data;
        }
      }
      setAlert({ type: "error", message: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-100 py-12 px-4 min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl border mx-auto">
        <h2 className="text-3xl font-bold text-[#28364e] mb-6 text-center">Crear cuenta</h2>

        <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
          {/* Selección de rol */}
          <div className="flex gap-4">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="role"
                value="client"
                checked={form.role === "client"}
                onChange={handleChange}
              />
              Cliente
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="role"
                value="provider"
                checked={form.role === "provider"}
                onChange={handleChange}
              />
              Servidor
            </label>
          </div>

          {/* Nombre completo */}
          <div>
            <label className="block text-sm font-medium mb-1">Nombre completo *</label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#f4a261]"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Correo electrónico *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#f4a261]"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium mb-1">Contraseña *</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#f4a261]"
            />
          </div>

          {/* Foto */}
          <div>
            <label className="block text-sm font-medium mb-1">Foto de perfil</label>
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#f4a261] rounded-lg cursor-pointer hover:bg-orange-50 transition">
              {preview ? (
                <img src={preview} alt="Preview" className="h-full object-cover rounded" />
              ) : (
                <div className="flex flex-col items-center text-[#f4a261]">
                  <UploadCloud size={32} />
                  <span className="text-sm mt-1">Haz clic para subir una imagen</span>
                </div>
              )}
              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Teléfono y ciudad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Teléfono *</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#f4a261]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ciudad *</label>
              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#f4a261]"
              >
                <option value="" disabled hidden>Selecciona una ciudad</option>
                {cities.map((city) => (
                  <option key={city.value} value={city.value}>
                    {city.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-1">Sobre mí *</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#f4a261]"
            />
          </div>

          {/* Campos adicionales si es proveedor */}
          {form.role === "provider" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Categoría *</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#f4a261]"
                >
                  <option value="" disabled hidden>Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Frase corta destacada *</label>
                <input
                  type="text"
                  name="headline"
                  value={form.headline}
                  onChange={handleChange}
                  required
                  maxLength={120}
                  placeholder="Plomero profesional con 10+ años de experiencia"
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#f4a261]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Servicios *</label>
                {form.services.map((service, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={service}
                      onChange={(e) => handleServiceChange(index, e.target.value)}
                      required
                      className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#f4a261]"
                    />
                    {form.services.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeServiceField(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addServiceField}
                  className="text-sm text-[#f4a261] hover:underline"
                >
                  + Agregar otro servicio
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Horario disponible *</label>
                <input
                  type="text"
                  name="schedule"
                  value={form.schedule}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#f4a261]"
                />
              </div>
            </>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full text-white font-semibold py-2 rounded transition-colors ${
              isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#f4a261] hover:bg-[#e07b19]"
            }`}
          >
            {isSubmitting ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          ¿Ya tienes una cuenta?{" "}
          <a href="/login" className="text-[#f4a261] hover:underline">
            Inicia sesión
          </a>
        </p>
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
