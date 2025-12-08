// src/components/RegisterForm.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { categories } from "../constants/categories";
import { cities } from "../constants/cities";
import api from "../api"; // instancia con interceptores
import { useToast } from "../components/ToastProvider";
import { getErrorMessage } from "../utils/errors";

export default function RegisterForm({ role = "client" }) {
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  const isProvider = role === "provider";

  const nameLabel = isProvider
    ? "Nombre del negocio o emprendimiento *"
    : "Nombre completo *";

  const namePlaceholder = isProvider
    ? "Ej: Taller El Buen Servicio"
    : "Ej: Ana Pérez";

  // El rol se fija desde la prop
  const [form, setForm] = useState({
    email: "",
    full_name: "",
    password: "",
    role, // "client" o "provider"
    phone: "",
    city: "",
    bio: "",
    category: "",
    services: [""],
    schedule: "",
    pricing_note: "",
    photo: null,
  });

  // Aceptación de Términos
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState(""); // banner fijo dentro del card
  const [fieldErrors, setFieldErrors] = useState({}); // errores por campo

  const setFieldError = (name, message) =>
    setFieldErrors((fe) => ({ ...fe, [name]: message }));

  const clearFieldError = (name) =>
    setFieldErrors((fe) => {
      const next = { ...fe };
      delete next[name];
      return next;
    });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (fieldErrors[name]) clearFieldError(name);
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

  // Validación mínima en cliente (rápida)
  // 🔹 Ahora solo valida secciones 1 y 2 + Términos
  const validate = () => {
    const errs = {};
    const email = form.email.trim();

    if (!form.full_name.trim())
      errs.full_name = isProvider
        ? "Ingresa el nombre de tu negocio o emprendimiento."
        : "Ingresa tu nombre completo.";

    if (!email) errs.email = "Ingresa tu correo electrónico.";
    else if (!/^\S+@\S+\.\S+$/.test(email))
      errs.email = "El correo no tiene un formato válido.";

    if (!form.password) errs.password = "Ingresa una contraseña.";
    if (!form.phone.trim()) errs.phone = "Ingresa tu teléfono.";
    if (!form.city) errs.city = "Selecciona una ciudad.";

    // 🔹 Se elimina la validación de bio, category y services para proveedor
    // if (isProvider && !form.bio.trim()) { ... }
    // if (isProvider) { validar category y services }

    // Requerir aceptación de Términos
    if (!agreeTerms) {
      errs.agreeTerms =
        "Debes aceptar los Términos y Condiciones para continuar.";
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

    // 🔹 Campos comunes: solo lo necesario de las secciones 1 y 2
    ["email", "full_name", "password", "role", "phone", "city"].forEach((k) => {
      payload.append(k, form[k]);
    });

    // 🔹 Por ahora NO enviamos categoría, bio ni servicios
    // Se hará después desde "Editar perfil" de proveedor

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
    <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-2xl border mx-auto">
      {/* ENCABEZADO */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-[#f4a261] uppercase tracking-[0.2em] mb-2">
          {isProvider ? "Registro de servidor" : "Registro de cliente"}
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-[#28364e] mb-1">
          {isProvider
            ? "Crea tu perfil de Servidor"
            : "Crea tu cuenta de Cliente"}
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          {isProvider
            ? "Completa los datos básicos de tu negocio. Podrás mejorar tu perfil más adelante."
            : "Regístrate para encontrar servidores de confianza y contratar servicios en minutos."}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 text-[#b8630b] px-3 py-1 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#f4a261]" />
            Estás creando una cuenta de {isProvider ? "Servidor" : "Cliente"}
          </span>

          <span className="text-[11px] text-gray-500">
            {isProvider ? (
              <>
                ¿Solo quieres contratar servicios?{" "}
                <Link to="/register/client" className="text-[#f4a261] underline">
                  Crea una cuenta de Cliente
                </Link>
              </>
            ) : (
              <>
                ¿Ofreces servicios?{" "}
                <Link to="/register/provider" className="text-[#f4a261] underline">
                  Registra tu negocio como Servidor
                </Link>
              </>
            )}
          </span>
        </div>
      </div>

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

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        encType="multipart/form-data"
        noValidate
      >
        {/* SECCIÓN 1: Datos básicos */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-sm font-semibold text-[#28364e] mb-3">
            1. Datos básicos
          </h3>

          {/* Nombre / negocio */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">{nameLabel}</label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              required
              placeholder={namePlaceholder}
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                fieldErrors.full_name
                  ? "border-red-300 focus:ring-red-300"
                  : "border-gray-300 focus:ring-[#f4a261]"
              }`}
            />
            {fieldErrors.full_name && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.full_name}</p>
            )}
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">
              Correo electrónico *
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="tucorreo@ejemplo.com"
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                fieldErrors.email
                  ? "border-red-300 focus:ring-red-300"
                  : "border-gray-300 focus:ring-[#f4a261]"
              }`}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
            )}
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
              placeholder="Mínimo 8 caracteres recomendados"
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                fieldErrors.password
                  ? "border-red-300 focus:ring-red-300"
                  : "border-gray-300 focus:ring-[#f4a261]"
              }`}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
            )}
          </div>
        </div>

        {/* SECCIÓN 2: Contacto y ubicación */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-sm font-semibold text-[#28364e] mb-3">
            2. Contacto y ubicación
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Teléfono *</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="Ej: 300 123 4567"
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                  fieldErrors.phone
                    ? "border-red-300 focus:ring-red-300"
                    : "border-gray-300 focus:ring-[#f4a261]"
                }`}
              />
              {fieldErrors.phone && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ciudad *</label>
              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                  fieldErrors.city
                    ? "border-red-300 focus:ring-red-300"
                    : "border-gray-300 focus:ring-[#f4a261]"
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
              {fieldErrors.city && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.city}</p>
              )}
            </div>
          </div>
        </div>

        {/* 🔹 SECCIÓN 3: Información de tu negocio ELIMINADA por ahora
            {isProvider && (...)}  -> se quitaron esos campos
        */}

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
          disabled={isSubmitting}
          className={`w-full text-white font-semibold py-2.5 rounded-lg transition-colors ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#f4a261] hover:bg-[#e07b19]"
          }`}
        >
          {isSubmitting
            ? "Registrando..."
            : isProvider
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
  );
}
