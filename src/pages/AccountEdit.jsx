// src/pages/AccountEdit.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useToast } from "../components/ToastProvider";
import { getErrorMessage } from "../utils/errors";
import { UploadCloud, Trash2 } from "lucide-react";
import { categories } from "../constants/categories";
import { cities } from "../constants/cities";

export default function AccountEdit() {
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Banner fijo de error + errores por campo
  const [inlineError, setInlineError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Datos del usuario / formulario
  const [role, setRole] = useState("client");
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    city: "",
    bio: "",
    // provider-only
    category: "",
    headline: "",
    schedule: "",
    pricing_note: "",
    services: [""],
  });

  // Foto de perfil
  const [photoUrl, setPhotoUrl] = useState(null); // url actual (servidor)
  const [photoFile, setPhotoFile] = useState(null); // archivo nuevo
  const [photoPreview, setPhotoPreview] = useState(null);

  // Galería de trabajos (provider)
  const [workImages, setWorkImages] = useState([]); // [{uuid, url, ...}]
  const [addingGallery, setAddingGallery] = useState(false);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]); // files seleccionados para subir

  // =============== CARGAR PERFIL ===============
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/me/");
        setRole(data.role);

        // Perfil básico
        setForm((f) => ({
          ...f,
          full_name: data.full_name || "",
          phone: data.profile?.phone || "",
          city: data.profile?.city || "",
          bio: data.profile?.bio || "",
          // provider por defecto, pero lo sobreescribimos si viene
          category: data.provider_profile?.category || "",
          headline: data.provider_profile?.headline || "",
          schedule: data.provider_profile?.schedule || "",
          pricing_note: data.provider_profile?.pricing_note || "",
          services:
            (Array.isArray(data.provider_profile?.services) &&
              data.provider_profile.services.length > 0
              ? data.provider_profile.services
              : [""]) || [""],
        }));

        setPhotoUrl(data.profile?.photo || null);
        setPhotoFile(null);
        setPhotoPreview(null);

        // Galería
        setWorkImages(data.provider_profile?.work_images || []);
      } catch (err) {
        const msg = getErrorMessage(err, "No se pudo cargar tu perfil.");
        setInlineError(msg);
        toastError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toastError]);

  // =============== HANDLERS ===============
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
    setForm((f) => {
      const next = [...f.services];
      next[index] = value;
      return { ...f, services: next };
    });
    clearFieldError(`services_${index}`);
  };

  const addServiceField = () => {
    setForm((f) => ({ ...f, services: [...f.services, ""] }));
  };

  const removeServiceField = (idx) => {
    setForm((f) => ({ ...f, services: f.services.filter((_, i) => i !== idx) }));
  };

  // Foto de perfil nueva
  const onPickPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
    clearFieldError("photo");
    if (inlineError) setInlineError("");
  };

  // Galería: seleccionar nuevas imágenes (no subidas aún)
  const onPickGallery = (e) => {
    const files = Array.from(e.target.files || []);
    setNewGalleryFiles(files);
  };

  // Validaciones rápidas
  const validate = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = "Ingresa tu nombre.";
    if (!form.phone.trim()) errs.phone = "Ingresa tu teléfono.";
    if (!form.city) errs.city = "Selecciona una ciudad.";
    if (!form.bio.trim()) errs.bio = "Escribe una breve descripción.";

    if (role === "provider") {
      if (!form.category) errs.category = "Selecciona una categoría.";
      if (!form.headline.trim()) errs.headline = "Ingresa una frase corta.";
      if (!form.schedule.trim()) errs.schedule = "Indica tu horario.";
      if (form.pricing_note && form.pricing_note.length > 250) {
        errs.pricing_note = "Máximo 250 caracteres.";
      }
      form.services.forEach((s, i) => {
        if (!(s || "").trim()) errs[`services_${i}`] = "Completa el servicio o elimínalo.";
      });
      // Validar total de imágenes a subir no rompa el máximo 6 (sumando existentes)
      if (newGalleryFiles.length > 0) {
        const total = (workImages?.length || 0) + newGalleryFiles.length;
        if (total > 6) {
          errs.work_photos = `Máximo 6 imágenes. Ya tienes ${workImages.length}.`;
        }
      }
    }

    setFieldErrors(errs);
    if (Object.keys(errs).length) {
      setInlineError("Revisa los campos marcados e inténtalo de nuevo.");
      return false;
    }
    return true;
  };

  // =============== GUARDAR PERFIL ===============
  const onSave = async (e) => {
    e.preventDefault();
    setInlineError("");
    setFieldErrors({});
    if (!validate()) return;

    const payload = new FormData();
    // Campos base
    payload.append("full_name", form.full_name);
    payload.append("phone", form.phone);
    payload.append("city", form.city);
    payload.append("bio", form.bio);

    // Foto (solo si el usuario seleccionó una nueva)
    if (photoFile) payload.append("photo", photoFile);

    // Provider
    if (role === "provider") {
      payload.append("category", form.category);
      payload.append("headline", form.headline);
      payload.append("schedule", form.schedule);
      if (form.pricing_note) payload.append("pricing_note", form.pricing_note);
      form.services.forEach((s) => payload.append("services", (s || "").trim()));
    }

    try {
      setSaving(true);
      const { data: updated } = await api.patch("/me/update/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Refrescar estados UI
      setPhotoUrl(updated?.profile?.photo || photoUrl);
      setPhotoFile(null);
      setPhotoPreview(null);
      setWorkImages(updated?.provider_profile?.work_images || workImages);

      toastSuccess("Cambios guardados.");
    } catch (err) {
      const data = err?.response?.data;
      const msg = getErrorMessage(err, "No se pudo guardar.");

      if (data && typeof data === "object") {
        const perField = {};
        for (const [k, v] of Object.entries(data)) {
          perField[k] = Array.isArray(v) ? v.join(", ") : String(v);
        }
        if (Object.keys(perField).length) setFieldErrors((fe) => ({ ...fe, ...perField }));
      }

      setInlineError(msg);
      toastError(msg);
    } finally {
      setSaving(false);
    }
  };

  // =============== SUBIR NUEVAS FOTOS (GALERÍA) ===============
  const onUploadGallery = async () => {
    if (newGalleryFiles.length === 0) return;
    setAddingGallery(true);
    try {
      const fd = new FormData();
      newGalleryFiles.forEach((f) => fd.append("work_photos", f));
      await api.post("/me/provider/work-images/add/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toastSuccess("Imágenes agregadas.");

      // Refrescar /me para ver la lista final
      const { data } = await api.get("/me/");
      setWorkImages(data.provider_profile?.work_images || []);
      setNewGalleryFiles([]);
    } catch (err) {
      const msg = getErrorMessage(err, "No se pudieron subir las imágenes.");
      toastError(msg);
      setInlineError(msg);
    } finally {
      setAddingGallery(false);
    }
  };

  // =============== ELIMINAR FOTO GALERÍA ===============
  const onDeleteWorkImage = async (uuid) => {
    const ok = window.confirm("¿Eliminar esta imagen?");
    if (!ok) return;
    try {
      await api.delete(`/me/provider/work-images/${uuid}/`);
      setWorkImages((imgs) => imgs.filter((i) => i.uuid !== uuid));
      toastSuccess("Imagen eliminada.");
    } catch (err) {
      toastError(getErrorMessage(err, "No se pudo eliminar la imagen."));
    }
  };

  if (loading) {
    return <div className="text-center mt-10 text-gray-500">Cargando tu perfil...</div>;
  }

  return (
    <div className="bg-gray-100 py-10 px-4 min-h-screen">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md w-full max-w-3xl mx-auto border">
        <h2 className="text-2xl font-bold text-[#28364e] mb-2">Editar mi cuenta</h2>
        <p className="text-gray-600 mb-4">Actualiza tu información básica y, si eres servidor, tu perfil profesional.</p>

        {inlineError && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {inlineError}
          </div>
        )}

        <form onSubmit={onSave} noValidate encType="multipart/form-data" className="space-y-6">
          {/* Foto de perfil */}
          <div>
            <label className="block text-sm font-medium mb-1">Foto de perfil</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border bg-gray-50">
                {photoPreview ? (
                  <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                ) : photoUrl ? (
                  <img src={photoUrl} alt="perfil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">👤</div>
                )}
              </div>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer hover:bg-gray-50">
                <UploadCloud className="w-4 h-4" />
                Cambiar foto
                <input type="file" className="hidden" accept="image/*" onChange={onPickPhoto} />
              </label>
            </div>
            {fieldErrors.photo && <p className="mt-1 text-xs text-red-600">{fieldErrors.photo}</p>}
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-1">Nombre completo *</label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                fieldErrors.full_name ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
              }`}
              required
            />
            {fieldErrors.full_name && <p className="mt-1 text-xs text-red-600">{fieldErrors.full_name}</p>}
          </div>

          {/* Teléfono / Ciudad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Teléfono *</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                  fieldErrors.phone ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
                }`}
                required
              />
              {fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ciudad *</label>
              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                  fieldErrors.city ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
                }`}
                required
              >
                <option value="" disabled hidden>
                  Selecciona una ciudad
                </option>
                {cities.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              {fieldErrors.city && <p className="mt-1 text-xs text-red-600">{fieldErrors.city}</p>}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-1">Sobre mí *</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                fieldErrors.bio ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
              }`}
              required
            />
            {fieldErrors.bio && <p className="mt-1 text-xs text-red-600">{fieldErrors.bio}</p>}
          </div>

          {/* ---- SOLO PROVIDER ---- */}
          {role === "provider" && (
            <div className="pt-2 border-t">
              <h4 className="text-lg font-semibold text-[#28364e] mb-3">Perfil de servidor</h4>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium mb-1">Categoría *</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                    fieldErrors.category ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
                  }`}
                  required
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

              {/* Headline */}
              <div>
                <label className="block text-sm font-medium mb-1">Frase corta destacada *</label>
                <input
                  type="text"
                  name="headline"
                  value={form.headline}
                  onChange={handleChange}
                  maxLength={120}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                    fieldErrors.headline ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
                  }`}
                  required
                />
                {fieldErrors.headline && <p className="mt-1 text-xs text-red-600">{fieldErrors.headline}</p>}
              </div>

              {/* Pricing note */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Rango/nota de precios <span className="text-gray-400">(opcional)</span>
                </label>
                <input
                  type="text"
                  name="pricing_note"
                  value={form.pricing_note}
                  onChange={handleChange}
                  maxLength={250}
                  placeholder="Ej: Cortes desde 20.000"
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                    fieldErrors.pricing_note ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
                  }`}
                />
                <p className="mt-1 text-xs text-gray-500">Máximo 250 caracteres.</p>
                {fieldErrors.pricing_note && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.pricing_note}</p>
                )}
              </div>

              {/* Servicios */}
              <div>
                <label className="block text-sm font-medium mb-1">Servicios *</label>
                {form.services.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={s}
                      onChange={(e) => handleServiceChange(i, e.target.value)}
                      className={`flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                        fieldErrors[`services_${i}`]
                          ? "border-red-300 focus:ring-red-300"
                          : "border-gray-300 focus:ring-[#f4a261]"
                      }`}
                      required
                    />
                    {form.services.length > 1 && (
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeServiceField(i)}
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
                <button type="button" className="text-sm text-[#f4a261] hover:underline" onClick={addServiceField}>
                  + Agregar otro servicio
                </button>
              </div>

              {/* Horario */}
              <div>
                <label className="block text-sm font-medium mb-1">Horario disponible *</label>
                <input
                  type="text"
                  name="schedule"
                  value={form.schedule}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                    fieldErrors.schedule ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
                  }`}
                  required
                />
                {fieldErrors.schedule && <p className="mt-1 text-xs text-red-600">{fieldErrors.schedule}</p>}
              </div>

              {/* Galería de trabajos */}
              <div className="pt-2">
                <label className="block text-sm font-medium mb-1">Galería de trabajos (máx. 6)</label>

                {/* existentes */}
                {workImages?.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                    {workImages.map((img) => (
                      <div key={img.uuid} className="relative group rounded overflow-hidden border">
                        <img src={img.url} alt="trabajo" className="w-full h-32 object-cover" />
                        <button
                          type="button"
                          onClick={() => onDeleteWorkImage(img.uuid)}
                          className="absolute top-1 right-1 bg-white/90 hover:bg-white text-red-600 rounded-full p-1 shadow hidden group-hover:block"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-3">Aún no has subido imágenes.</p>
                )}

                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer hover:bg-gray-50">
                    <UploadCloud className="w-4 h-4" />
                    Seleccionar imágenes
                    <input type="file" accept="image/*" multiple className="hidden" onChange={onPickGallery} />
                  </label>
                  {newGalleryFiles.length > 0 && (
                    <span className="text-sm text-gray-600">
                      Seleccionadas: {newGalleryFiles.length} archivo(s)
                    </span>
                  )}
                </div>
                {fieldErrors.work_photos && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.work_photos}</p>
                )}

                <div className="mt-2">
                  <button
                    type="button"
                    disabled={addingGallery || newGalleryFiles.length === 0}
                    onClick={onUploadGallery}
                    className={`px-4 py-2 rounded-lg text-white ${
                      addingGallery || newGalleryFiles.length === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#28364e] hover:opacity-90"
                    }`}
                  >
                    {addingGallery ? "Subiendo..." : "Subir imágenes seleccionadas"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2 rounded-lg text-white ${
                saving ? "bg-gray-400 cursor-not-allowed" : "bg-[#f4a261] hover:bg-[#e07b19]"
              }`}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/profile/${localStorage.getItem("uuid")}`)}
              className="px-6 py-2 rounded-lg border hover:bg-gray-50"
            >
              Ver perfil público
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
