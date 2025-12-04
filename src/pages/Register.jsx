// src/pages/Register.jsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { categories } from "../constants/categories";
import { cities } from "../constants/cities";
import { UploadCloud } from "lucide-react";
import api from "../api"; // instancia con interceptores
import { useToast } from "../components/ToastProvider";
import { getErrorMessage } from "../utils/errors";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { success: toastSuccess, error: toastError } = useToast();

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
    pricing_note: "",
    photo: null,
  });

  // Aceptación de Términos
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Previews y manejo de fotos
  const [preview, setPreview] = useState(null);          // foto de perfil
  const [workPhotos, setWorkPhotos] = useState([]);      // File[]
  const [workPreviews, setWorkPreviews] = useState([]);  // string[]

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState("");   // banner fijo dentro del card
  const [fieldErrors, setFieldErrors] = useState({});   // errores por campo

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

  const setFieldError = (name, message) =>
    setFieldErrors((fe) => ({ ...fe, [name]: message }));

  const clearFieldError = (name) =>
    setFieldErrors((fe) => {
      const next = { ...fe };
      delete next[name];
      return next;
    });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      const file = files?.[0] || null;
      setForm((f) => ({ ...f, photo: file }));
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
      clearFieldError("photo");
    } else {
      setForm((f) => ({ ...f, [name]: value }));
      if (fieldErrors[name]) clearFieldError(name);
    }
    if (inlineError) setInlineError("");
  };

  const handleServiceChange = (index, value) => {
    const newServices = [...form.services];
    newServices[index] = value;
    setForm((f) => ({ ...f, services: newServices }));
    clearFieldError(`services_${index}`);
  };

  const addServiceField = () => {
    setForm((f) => ({ ...f, services: [...f.services, ""] }));
  };

  const removeServiceField = (index) => {
    const newServices = form.services.filter((_, i) => i !== index);
    setForm((f) => ({ ...f, services: newServices }));
  };

  // Manejo de fotos de trabajos (máximo 6)
  const handleWorkPhotosChange = (e) => {
    const files = Array.from(e.target.files || []);
    const merged = [...workPhotos, ...files].slice(0, 6);
    setWorkPhotos(merged);

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

  // Validación mínima en cliente (rápida)
  const validate = () => {
    const errs = {};
    const email = form.email.trim();

    if (!form.full_name.trim()) errs.full_name = "Ingresa tu nombre completo.";
    if (!email) errs.email = "Ingresa tu correo electrónico.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "El correo no tiene un formato válido.";
    if (!form.password) errs.password = "Ingresa una contraseña.";
    if (!form.phone.trim()) errs.phone = "Ingresa tu teléfono.";
    if (!form.city) errs.city = "Selecciona una ciudad.";
    if (form.role === "provider" && !form.bio.trim()) {
      errs.bio = "Escribe una breve descripción.";
    }

    if (form.pricing_note && form.pricing_note.length > 250) {
      errs.pricing_note = "Máximo 250 caracteres.";
    }

    if (form.role === "provider") {
      if (!form.category) errs.category = "Selecciona una categoría.";
      if (!form.headline.trim()) errs.headline = "Ingresa una frase corta.";
      if (!form.schedule.trim()) errs.schedule = "Indica tu horario.";
      form.services.forEach((s, i) => {
        if (!(s || "").trim()) errs[`services_${i}`] = "Completa el servicio o elimínalo.";
      });
    }

    // Requerir aceptación de Términos
    if (!agreeTerms) {
      errs.agreeTerms = "Debes aceptar los Términos y Condiciones para continuar.";
    }

    setFieldErrors(errs);
    if (Object.keys(errs).length) {
      setInlineError("Revisa los campos marcados e inténtalo de nuevo.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInlineError("");
    setFieldErrors({});
    setIsSubmitting(true);

    if (!validate()) {
      setIsSubmitting(false);
      return;
    }

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
      if (form.pricing_note) {
        payload.append("pricing_note", form.pricing_note);
      }
      form.services.forEach((s) => payload.append("services", (s || "").trim()));
      workPhotos.slice(0, 6).forEach((file) => payload.append("work_photos", file));
    }

    try {
      await api.post("/register/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toastSuccess("Registro exitoso. Serás redirigido al login.");
      setTimeout(() => navigate("/login"), 1400);
    } catch (err) {
      const data = err?.response?.data;
      let msg = getErrorMessage(err, "Error en el registro");

      if (data && typeof data === "object") {
        const perField = {};
        for (const [k, v] of Object.entries(data)) {
          const text = Array.isArray(v) ? v.join(", ") : String(v);
          perField[k] = text;
        }
        if (Object.keys(perField).length) {
          setFieldErrors((fe) => ({ ...fe, ...perField }));
        }
      }

      setInlineError(msg);
      toastError(msg, { duration: 8000 });
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

        {/* Banner fijo de error (validación/servidor) */}
        {inlineError && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {inlineError}
          </div>
        )}

        {/* Selector de rol visible y claro */}
        <div className="mb-6 flex flex-col items-center">
          <div className="inline-flex rounded-xl overflow-hidden border shadow-sm">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, role: "client" }))}
              className={`px-5 py-3 flex items-center gap-2 text-sm font-semibold transition ${
                form.role === "client" ? "bg-[#28364e] text-white" : "bg-white hover:bg-gray-50 text-[#28364e]"
              }`}
              aria-pressed={form.role === "client"}
            >
              👤 Cliente
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, role: "provider" }))}
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

        <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data" noValidate>
          {/* Nombre completo */}
          <div>
            <label className="block text-sm font-medium mb-1">Nombre completo *</label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                fieldErrors.full_name ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
              }`}
            />
            {fieldErrors.full_name && <p className="mt-1 text-xs text-red-600">{fieldErrors.full_name}</p>}
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
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                fieldErrors.email ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
              }`}
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
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
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                fieldErrors.password ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
              }`}
            />
            {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
          </div>

          {/* Foto de perfil */}
          <div>
            <label className="block text-sm font-medium mb-1">Foto de perfil</label>
            <label
              className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-orange-50 transition ${
                fieldErrors.photo ? "border-red-300" : "border-[#f4a261]"
              }`}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="h-full object-cover rounded" />
              ) : (
                <div className="flex flex-col items-center text-[#f4a261]">
                  <UploadCloud size={32} />
                  <span className="text-sm mt-1">Haz clic para subir una imagen</span>
                </div>
              )}
              <input type="file" name="photo" accept="image/*" onChange={handleChange} className="hidden" />
            </label>
            {fieldErrors.photo && <p className="mt-1 text-xs text-red-600">{fieldErrors.photo}</p>}
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
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                  fieldErrors.phone ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
                }`}
              />
              {fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ciudad *</label>
              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                  fieldErrors.city ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
                }`}
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
              {fieldErrors.city && <p className="mt-1 text-xs text-red-600">{fieldErrors.city}</p>}
            </div>
          </div>

          {/* Bio solo para servidor */}
          {form.role === "provider" && (
            <div>
              <label className="block text-sm font-medium mb-1">Sobre mí *</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                required
                rows={3}
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                  fieldErrors.bio ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
                }`}
              />
              {fieldErrors.bio && <p className="mt-1 text-xs text-red-600">{fieldErrors.bio}</p>}
            </div>
          )}

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
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                    fieldErrors.category ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
                  }`}
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
                {fieldErrors.category && <p className="mt-1 text-xs text-red-600">{fieldErrors.category}</p>}
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
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                    fieldErrors.headline ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
                  }`}
                />
                {fieldErrors.headline && <p className="mt-1 text-xs text-red-600">{fieldErrors.headline}</p>}
              </div>

              {/* Rango/nota de precios (opcional) */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Rango/nota de precios <span className="text-gray-400">(opcional)</span>
                </label>
                <input
                  type="text"
                  name="pricing_note"
                  value={form.pricing_note}
                  onChange={handleChange}
                  maxLength={120}
                  placeholder="Ej: Cortes desde 20.000"
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                    fieldErrors.pricing_note ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
                  }`}
                />
                <p className="mt-1 text-xs text-gray-500">Máximo 120 caracteres.</p>
                {fieldErrors.pricing_note && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.pricing_note}</p>
                )}
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
                      className={`flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                        fieldErrors[`services_${index}`]
                          ? "border-red-300 focus:ring-red-300"
                          : "border-gray-300 focus:ring-[#f4a261]"
                      }`}
                    />
                    {form.services.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeServiceField(index)}
                        className="text-red-500 hover:text-red-700"
                        title="Quitar servicio"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                {Object.keys(fieldErrors)
                  .filter((k) => k.startsWith("services_"))
                  .map((k) => (
                    <p key={k} className="mt-1 text-xs text-red-600">
                      {fieldErrors[k]}
                    </p>
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
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                    fieldErrors.schedule ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
                  }`}
                />
                {fieldErrors.schedule && <p className="mt-1 text-xs text-red-600">{fieldErrors.schedule}</p>}
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

          {/* Checkbox de Términos */}
          <div className="pt-2">
            <label className="inline-flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (fieldErrors.agreeTerms) {
                    clearFieldError("agreeTerms");
                    if (inlineError) setInlineError("");
                  }
                }}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#f4a261] focus:ring-[#f4a261]"
              />
              <span className="text-sm text-gray-700">
                Acepto los{" "}
                <Link to="/terms" target="_blank" className="text-[#f4a261] underline">
                  Términos y Condiciones
                </Link>
              </span>
            </label>
            {fieldErrors.agreeTerms && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.agreeTerms}</p>
            )}
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={isSubmitting /* || !agreeTerms */}
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
          <Link to="/login" className="text-[#f4a261] hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
