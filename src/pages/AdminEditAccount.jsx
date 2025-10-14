// src/pages/AdminEditAccount.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { UploadCloud, ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import api from "../api";
import { useToast } from "../components/ToastProvider";
import { getErrorMessage } from "../utils/errors";
import { cities } from "../constants/cities";
import { categories } from "../constants/categories";

export default function AdminEditAccount() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [inlineError, setInlineError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [account, setAccount] = useState(null); // payload que llega de /profile/:uuid/
  const [form, setForm] = useState({
    // Account/Profile
    full_name: "",
    email: "",
    role: "",
    is_active: false,
    phone: "",
    city: "",
    bio: "",
    photo: null, // File
    // ProviderProfile
    category: "",
    headline: "",
    services: [""],
    schedule: "",
    pricing_note: "",
    provider_uuid: null,
  });
  const [photoPreview, setPhotoPreview] = useState(null);

  const isProvider = useMemo(() => form.role === "provider", [form.role]);

  // Cargar datos
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/profile/${uuid}/`);
        setAccount(data);

        // Mapear a form
        setForm({
          full_name: data.full_name || "",
          email: data.email || "",
          role: data.role || "",
          is_active: !!data.is_active,
          phone: data.profile?.phone || "",
          city: data.profile?.city || "",
          bio: data.profile?.bio || "",
          photo: null,
          // Provider
          category: data.provider_profile?.category || "",
          headline: data.provider_profile?.headline || "",
          services: data.provider_profile?.services?.length
            ? data.provider_profile.services
            : [""],
          schedule: data.provider_profile?.schedule || "",
          pricing_note: data.provider_profile?.pricing_note || "",
          provider_uuid: data.provider_profile?.uuid || null,
        });
        setPhotoPreview(data.profile?.photo || null);
      } catch (err) {
        const msg = getErrorMessage(err, "No se pudo cargar la cuenta");
        setInlineError(msg);
        toastError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [uuid, toastError]);

  const setFieldError = (name, message) =>
    setFieldErrors((fe) => ({ ...fe, [name]: message }));

  const clearFieldError = (name) =>
    setFieldErrors((fe) => {
      const next = { ...fe };
      delete next[name];
      return next;
    });

  const onChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (name === "photo") {
      const file = files?.[0] || null;
      setForm((f) => ({ ...f, photo: file }));
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setPhotoPreview(account?.profile?.photo || null);
      }
      clearFieldError("photo");
      if (inlineError) setInlineError("");
      return;
    }
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
    clearFieldError(name);
    if (inlineError) setInlineError("");
  };

  const handleServiceChange = (idx, val) => {
    const services = [...form.services];
    services[idx] = val;
    setForm((f) => ({ ...f, services }));
    clearFieldError(`services_${idx}`);
  };

  const addService = () => {
    setForm((f) => ({ ...f, services: [...f.services, ""] }));
  };

  const removeService = (idx) => {
    const services = form.services.filter((_, i) => i !== idx);
    setForm((f) => ({ ...f, services: services.length ? services : [""] }));
  };

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = "Nombre requerido.";
    if (!form.email.trim()) errs.email = "Email requerido.";
    if (!form.city) errs.city = "Ciudad requerida.";
    if (!form.phone.trim()) errs.phone = "Teléfono requerido.";

    if (isProvider) {
      if (!form.category) errs.category = "Categoría requerida.";
      if (!form.headline.trim()) errs.headline = "Headline requerido.";
      if (!form.schedule.trim()) errs.schedule = "Horario requerido.";
      form.services.forEach((s, i) => {
        if (!(s || "").trim())
          errs[`services_${i}`] = "Completa el servicio o elimínalo.";
      });
      if (form.pricing_note && form.pricing_note.length > 250) {
        errs.pricing_note = "Máximo 250 caracteres.";
      }
    }

    setFieldErrors(errs);
    if (Object.keys(errs).length) {
      setInlineError("Revisa los campos marcados e inténtalo de nuevo.");
      return false;
    }
    return true;
  };

  // 👉 Guardar todo (usa /admin/accounts/:uuid/update/ con multipart/form-data)
  const saveAll = async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      setInlineError("");

      const fd = new FormData();
      fd.append("full_name", form.full_name);
      fd.append("email", form.email);
      fd.append("is_active", form.is_active ? "true" : "false");
      fd.append("phone", form.phone);
      fd.append("city", form.city);
      fd.append("bio", form.bio);
      if (form.photo) {
        fd.append("photo", form.photo);
      }

      if (isProvider) {
        fd.append("category", form.category);
        fd.append("headline", form.headline);
        fd.append("schedule", form.schedule);
        fd.append("pricing_note", form.pricing_note || "");
        form.services
          .map((x) => (x || "").trim())
          .filter(Boolean)
          .forEach((s) => fd.append("services", s));
      }

      await api.patch(`/admin/accounts/${uuid}/update/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toastSuccess("Cambios guardados.");
      navigate(`/profile/${uuid}`);
    } catch (err) {
      const data = err?.response?.data;
      const msg = getErrorMessage(err, "No se pudieron guardar los cambios");
      setInlineError(msg);

      if (data && typeof data === "object") {
        const perField = {};
        for (const [k, v] of Object.entries(data)) {
          perField[k] = Array.isArray(v) ? v.join(", ") : String(v);
        }
        if (Object.keys(perField).length) {
          setFieldErrors((fe) => ({ ...fe, ...perField }));
        }
      }

      toastError(msg, { duration: 8000 });
    } finally {
      setSaving(false);
    }
  };

  // ====== Admin: galería ======
  const handleAddWorkPhotos = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const fd = new FormData();
    files.forEach((f) => fd.append("work_photos", f));

    try {
      await api.post(`/admin/accounts/${uuid}/work-images/add/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // refrescar datos
      const { data } = await api.get(`/profile/${uuid}/`);
      setAccount(data);
      toastSuccess("Imágenes agregadas.");
    } catch (err) {
      toastError(getErrorMessage(err, "No se pudieron agregar las imágenes."));
    } finally {
      e.target.value = null;
    }
  };

  const handleDeleteWorkImage = async (imageUuid) => {
    const ok = window.confirm("¿Eliminar esta imagen?");
    if (!ok) return;

    try {
      await api.delete(`/admin/accounts/${uuid}/work-images/${imageUuid}/delete/`);
      // actualizar en memoria
      setAccount((prev) => {
        const next = { ...prev };
        const imgs = next?.provider_profile?.work_images || [];
        next.provider_profile = next.provider_profile || {};
        next.provider_profile.work_images = imgs.filter((w) => w.uuid !== imageUuid);
        return next;
      });
      toastSuccess("Imagen eliminada.");
    } catch (err) {
      toastError(getErrorMessage(err, "No se pudo eliminar la imagen."));
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-500">
        Cargando...
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-red-500">
        No se encontró la cuenta.
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[#28364e]">Editar cuenta (admin)</h1>
          <Link
            to={`/profile/${uuid}`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#28364e]"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al perfil
          </Link>
        </div>

        {inlineError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {inlineError}
          </div>
        )}

        {/* FOTO */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border">
            {photoPreview ? (
              <img src={photoPreview} alt="Foto" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full grid place-content-center text-gray-400">Sin foto</div>
            )}
          </div>
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer hover:bg-gray-50">
            {uploadingPhoto ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
            <span className="text-sm">Cambiar foto</span>
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={(e) => {
                setUploadingPhoto(true);
                onChange(e);
                setUploadingPhoto(false);
              }}
              className="hidden"
            />
          </label>
          {fieldErrors.photo && (
            <p className="text-xs text-red-600">{fieldErrors.photo}</p>
          )}
        </div>

        {/* ACCOUNT + PROFILE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre completo *</label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={onChange}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                fieldErrors.full_name ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
              }`}
            />
            {fieldErrors.full_name && <p className="mt-1 text-xs text-red-600">{fieldErrors.full_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                fieldErrors.email ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
              }`}
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Rol</label>
            <input
              type="text"
              value={form.role}
              readOnly
              className="w-full px-3 py-2 border rounded bg-gray-50 text-gray-600"
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              id="is_active"
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={onChange}
              className="h-4 w-4 rounded border-gray-300 text-[#f4a261] focus:ring-[#f4a261]"
            />
            <label htmlFor="is_active" className="text-sm">Cuenta activa</label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Teléfono *</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={onChange}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
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
              onChange={onChange}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                fieldErrors.city ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
              }`}
            >
              <option value="" disabled hidden>Selecciona una ciudad</option>
              {cities.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            {fieldErrors.city && <p className="mt-1 text-xs text-red-600">{fieldErrors.city}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Sobre mí *</label>
            <textarea
              name="bio"
              rows={3}
              value={form.bio}
              onChange={onChange}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                fieldErrors.bio ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
              }`}
            />
            {fieldErrors.bio && <p className="mt-1 text-xs text-red-600">{fieldErrors.bio}</p>}
          </div>
        </div>

        {/* PROVIDER PROFILE */}
        {isProvider && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold text-[#28364e] mb-4">Perfil de proveedor</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Categoría *</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={onChange}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                    fieldErrors.category ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
                  }`}
                >
                  <option value="" disabled hidden>Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                {fieldErrors.category && <p className="mt-1 text-xs text-red-600">{fieldErrors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Horario *</label>
                <input
                  type="text"
                  name="schedule"
                  value={form.schedule}
                  onChange={onChange}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                    fieldErrors.schedule ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
                  }`}
                />
                {fieldErrors.schedule && <p className="mt-1 text-xs text-red-600">{fieldErrors.schedule}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Frase corta *</label>
                <input
                  type="text"
                  name="headline"
                  value={form.headline}
                  onChange={onChange}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                    fieldErrors.headline ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
                  }`}
                />
                {fieldErrors.headline && <p className="mt-1 text-xs text-red-600">{fieldErrors.headline}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Rango/nota de precios <span className="text-gray-400">(opcional)</span>
                </label>
                <input
                  type="text"
                  name="pricing_note"
                  value={form.pricing_note}
                  onChange={onChange}
                  maxLength={250}
                  placeholder="Ej: Cortes desde 20.000"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                    fieldErrors.pricing_note ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
                  }`}
                />
                {fieldErrors.pricing_note && <p className="mt-1 text-xs text-red-600">{fieldErrors.pricing_note}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-2">Servicios *</label>
                <div className="space-y-2">
                  {form.services.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={s}
                        onChange={(e) => handleServiceChange(i, e.target.value)}
                        className={`flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                          fieldErrors[`services_${i}`]
                            ? "border-red-300 focus:ring-red-300"
                            : "border-gray-300 focus:ring-[#f4a261]"
                        }`}
                      />
                      {form.services.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeService(i)}
                          className="p-2 rounded-md border text-red-600 hover:bg-red-50"
                          title="Quitar servicio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addService}
                  className="mt-2 inline-flex items-center gap-2 text-sm text-[#f4a261] hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  Agregar servicio
                </button>
              </div>
            </div>

            {/* ===== Galería del proveedor (Admin) ===== */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-semibold text-[#28364e] mb-3">Galería de trabajos</h3>

              <div className="flex items-center gap-3 mb-4">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer hover:bg-gray-50">
                  <UploadCloud className="w-4 h-4" />
                  <span className="text-sm">Agregar fotos (máx. 6)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAddWorkPhotos}
                    className="hidden"
                  />
                </label>
                <span className="text-sm text-gray-500">
                  Se permiten hasta 6 fotos en total (incluyendo las existentes).
                </span>
              </div>

              {(account?.provider_profile?.work_images?.length || 0) > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {account.provider_profile.work_images.map((img) => (
                    <div key={img.uuid} className="relative group rounded overflow-hidden border">
                      <img
                        src={img.url}
                        alt={img.caption || "Trabajo"}
                        className="w-full h-28 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteWorkImage(img.uuid)}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition"
                        title="Eliminar"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Aún no hay fotos en la galería.</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-end gap-3">
          <Link
            to={`/profile/${uuid}`}
            className="px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Link>
          <button
            type="button"
            onClick={saveAll}
            disabled={saving}
            className={`px-5 py-2 rounded-md text-white font-semibold ${
              saving ? "bg-gray-400" : "bg-[#28364e] hover:opacity-90"
            }`}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
