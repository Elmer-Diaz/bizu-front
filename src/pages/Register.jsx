// src/pages/Register.jsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { categories } from "../constants/categories";
import { cities } from "../constants/cities";
import { UploadCloud } from "lucide-react";
import AlertModal from "../components/AlertModal";
import api from "../api"; // usamos tu instancia con interceptores

export default function Register() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Rol inicial desde la query (?role=provider|client)
  const initialRole = (() => {
    const r = (searchParams.get("role") || "").toLowerCase();
    return r === "provider" || r === "client" ? r : "client";
  })();

  const [form, setForm] = useState({
    email: "",
    full_name: "",
    password: "",
    role: initialRole,
    phone: "",
    city: "",
    bio: "",
    category: "",
    headline: "",
    services: [""],
    schedule: "",
    photo: null,
  });

  // Previews y manejo de fotos
  const [preview, setPreview] = useState(null); // foto de perfil
  const [workPhotos, setWorkPhotos] = useState([]); // File[]
  const [workPreviews, setWorkPreviews] = useState([]); // string[]
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  // Sincroniza la URL con el rol seleccionado
  useEffect(() => {
    const current = (searchParams.get("role") || "").toLowerCase();
    if (current !== form.role) {
      const sp = new URLSearchParams(searchParams);
      sp.set("role", form.role);
      setSearchParams(sp, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.role]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      const file = files?.[0] || null;
      setForm({ ...form, photo: file });
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
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

  // Manejo de fotos de trabajos (máximo 6)
  const handleWorkPhotosChange = (e) => {
    const files = Array.from(e.target.files || []);
    // Unimos con las que ya están y recortamos a 6
    const merged = [...workPhotos, ...files].slice(0, 6);
    setWorkPhotos(merged);

    // Generar previews
    const readers = merged.map(
      (file) =>
        new Promise((resolve) => {
          const fr = new FileReader();
          fr.onloadend = () => resolve(fr.result);
          fr.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((results) => setWorkPreviews(results));
  };

  const removeWorkPhoto = (idx) => {
    const nextFiles = workPhotos.filter((_, i) => i !== idx);
    const nextPreviews = workPreviews.filter((_, i) => i !== idx);
    setWorkPhotos(nextFiles);
    setWorkPreviews(nextPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAlert(null);

    const payload = new FormData();

    // Campos comunes
    ["email", "full_name", "password", "role", "phone", "city", "bio"].forEach((k) => {
      payload.append(k, form[k]);
    });
    if (form.photo) payload.append("photo", form.photo);

    // Campos de proveedor solo si aplica
    if (form.role === "provider") {
      payload.append("category", form.category);
      payload.append("headline", form.headline);
      payload.append("schedule", form.schedule);
      form.services.forEach((s) => payload.append("services", (s || "").trim()));

      // Agregar múltiples imágenes (máximo 6) con la misma key
      workPhotos.slice(0, 6).forEach((file) => payload.append("work_photos", file));
    }

    try {
      await api.post("/register/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAlert({ type: "success", message: "Registro exitoso. Serás redirigido al login." });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      let errorMsg = "Error en el registro";
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "object") {
          errorMsg = Object.entries(data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
            .join(" | ");
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
        <h2 className="text-3xl font-bold text-[#28364e] mb-3 text-center">
          {form.role === "provider" ? "Crear cuenta de Servidor" : "Crear cuenta de Cliente"}
        </h2>

        {/* Selector de rol visible y claro */}
        <div className="mb-6 flex flex-col items-center">
          <div className="inline-flex rounded-xl overflow-hidden border shadow-sm">
            <button
              type="button"
              onClick={() => setForm({ ...form, role: "client" })}
              className={`px-5 py-3 flex items-center gap-2 text-sm font-semibold transition ${
                form.role === "client" ? "bg-[#28364e] text-white" : "bg-white hover:bg-gray-50 text-[#28364e]"
              }`}
              aria-pressed={form.role === "client"}
            >
              👤 Cliente
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, role: "provider" })}
              className={`px-5 py-3 flex items-center gap-2 text-sm font-semibold transition border-l ${
                form.role === "provider" ? "bg-[#28364e] text-white" : "bg-white hover:bg-gray-50 text-[#28364e]"
              }`}
              aria-pressed={form.role === "provider"}
            >
              🧰 Servidor
            </button>
          </div>

          <p className="mt-2 text-sm text-gray-600">
            {form.role === "client"
              ? "Registrarás una cuenta para contratar servicios."
              : "Registrarás una cuenta para ofrecer tus servicios en Bizu."}
          </p>

          <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-orange-100 text-[#b8630b]">
            <span className="w-2 h-2 rounded-full bg-[#f4a261]"></span>
            Estás creando una cuenta: {form.role === "provider" ? "Servidor" : "Cliente"}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
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

          {/* Foto de perfil */}
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
                <option value="" disabled hidden>
                  Selecciona una ciudad
                </option>
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
                  required={form.role === "provider"}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#f4a261]"
                >
                  <option value="" disabled hidden>
                    Selecciona una categoría
                  </option>
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
                  required={form.role === "provider"}
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
                      required={form.role === "provider"}
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
                  required={form.role === "provider"}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#f4a261]"
                />
              </div>

              {/* Fotos de trabajos (máximo 6) */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Fotos de tus trabajos (hasta 6)
                </label>
                <input
                  type="file"
                  name="work_photos"
                  accept="image/*"
                  multiple
                  onChange={handleWorkPhotosChange}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Puedes seleccionar varias imágenes a la vez. Máximo 6.
                </p>

                {workPreviews.length > 0 && (
                  <>
                    <div className="mt-3 text-sm text-gray-600">
                      Seleccionadas: {workPreviews.length}/6
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-3">
                      {workPreviews.map((src, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={src}
                            alt={`Trabajo ${idx + 1}`}
                            className="w-full h-24 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removeWorkPhoto(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hidden group-hover:flex items-center justify-center"
                            title="Quitar"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
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
            {isSubmitting
              ? "Registrando..."
              : form.role === "provider"
              ? "Crear cuenta de Servidor"
              : "Crear cuenta de Cliente"}
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
