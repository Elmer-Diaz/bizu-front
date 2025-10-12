import { useState, useRef } from "react";
import api from "../api";
import { useToast } from "../components/ToastProvider";
import { getErrorMessage } from "../utils/errors";
import { X as CloseIcon } from "lucide-react";

export default function ChangePassword() {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);

  // Banner fijo para errores de validación/servidor
  const [inlineError, setInlineError] = useState("");

  // Errores por campo (pintan inputs en rojo)
  const [fieldErrors, setFieldErrors] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const { success: toastSuccess, error: toastError } = useToast();
  const newPassRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    // limpia error de campo al escribir
    if (fieldErrors[name]) {
      setFieldErrors((fe) => ({ ...fe, [name]: "" }));
    }
    // si el usuario vuelve a escribir, podemos limpiar banner genérico
    if (inlineError) setInlineError("");
  };

  const validate = () => {
    const errs = { current_password: "", new_password: "", confirm_password: "" };
    let ok = true;

    if (!form.current_password) {
      errs.current_password = "Ingresa tu contraseña actual.";
      ok = false;
    }
    if (!form.new_password) {
      errs.new_password = "Ingresa la nueva contraseña.";
      ok = false;
    }
    if (!form.confirm_password) {
      errs.confirm_password = "Confirma la nueva contraseña.";
      ok = false;
    }
    if (form.new_password && form.confirm_password && form.new_password !== form.confirm_password) {
      errs.new_password = "Las contraseñas no coinciden.";
      errs.confirm_password = "Las contraseñas no coinciden.";
      ok = false;
    }

    setFieldErrors(errs);
    return ok;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInlineError("");

    const ok = validate();
    if (!ok) {
      // Banner fijo para indicar al usuario que revise los campos
      setInlineError("Revisa los campos marcados e inténtalo de nuevo.");
      // focus en nueva contraseña si no coincide
      if (form.new_password !== form.confirm_password) {
        newPassRef.current?.focus();
      }
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/change-password/", {
        current_password: form.current_password,
        new_password: form.new_password,
      });

      // Éxito: toast bonito
      toastSuccess(res?.data?.detail || "Contraseña actualizada correctamente 🎉", { duration: 3500 });

      // limpia el formulario
      setForm({ current_password: "", new_password: "", confirm_password: "" });
      setFieldErrors({ current_password: "", new_password: "", confirm_password: "" });
      setInlineError("");
    } catch (err) {
      // Intenta mapear errores por campo si el backend los envía así
      const data = err?.response?.data;
      let msg = getErrorMessage(err, "Error al cambiar la contraseña.");

      // Si el backend trae validaciones por campo (dict con arrays)
      const nextFieldErrors = { current_password: "", new_password: "", confirm_password: "" };
      if (data && typeof data === "object") {
        for (const key of Object.keys(nextFieldErrors)) {
          const val = data[key];
          if (Array.isArray(val) && val.length) nextFieldErrors[key] = String(val[0]);
          if (typeof val === "string" && val) nextFieldErrors[key] = val;
        }
      }

      // Si llegaron errores por campo, muéstralos y además el banner fijo
      if (
        nextFieldErrors.current_password ||
        nextFieldErrors.new_password ||
        nextFieldErrors.confirm_password
      ) {
        setFieldErrors(nextFieldErrors);
        setInlineError(msg);
      } else {
        // Si no hay errores por campo, muestra banner y toast para visibilidad
        setInlineError(msg);
        toastError(msg, { duration: 7000 });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md border">
        <h2 className="text-2xl font-bold text-[#28364e] mb-2 text-center">
          Cambiar contraseña
        </h2>
        <p className="text-center text-sm text-gray-500">
          Ingresa tu contraseña actual y define una nueva
        </p>

        {/* Banner fijo de error (validaciones/servidor) */}
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

        <form onSubmit={handleSubmit} className="space-y-4 mt-6" noValidate>
          {/* Contraseña actual */}
          <div>
            <input
              type="password"
              name="current_password"
              value={form.current_password}
              onChange={handleChange}
              placeholder="Contraseña actual"
              required
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                fieldErrors.current_password
                  ? "border-red-300 focus:ring-red-300"
                  : "border-gray-300 focus:ring-[#f4a261]"
              }`}
              aria-invalid={!!fieldErrors.current_password}
              aria-describedby={fieldErrors.current_password ? "current-password-error" : undefined}
            />
            {fieldErrors.current_password && (
              <p id="current-password-error" className="mt-1 text-xs text-red-600">
                {fieldErrors.current_password}
              </p>
            )}
          </div>

          {/* Nueva contraseña */}
          <div>
            <input
              ref={newPassRef}
              type="password"
              name="new_password"
              value={form.new_password}
              onChange={handleChange}
              placeholder="Nueva contraseña"
              required
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                fieldErrors.new_password
                  ? "border-red-300 focus:ring-red-300"
                  : "border-gray-300 focus:ring-[#f4a261]"
              }`}
              aria-invalid={!!fieldErrors.new_password}
              aria-describedby={fieldErrors.new_password ? "new-password-error" : undefined}
            />
            {fieldErrors.new_password && (
              <p id="new-password-error" className="mt-1 text-xs text-red-600">
                {fieldErrors.new_password}
              </p>
            )}
          </div>

          {/* Confirmar nueva contraseña */}
          <div>
            <input
              type="password"
              name="confirm_password"
              value={form.confirm_password}
              onChange={handleChange}
              placeholder="Confirmar nueva contraseña"
              required
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                fieldErrors.confirm_password
                  ? "border-red-300 focus:ring-red-300"
                  : "border-gray-300 focus:ring-[#f4a261]"
              }`}
              aria-invalid={!!fieldErrors.confirm_password}
              aria-describedby={fieldErrors.confirm_password ? "confirm-password-error" : undefined}
            />
            {fieldErrors.confirm_password && (
              <p id="confirm-password-error" className="mt-1 text-xs text-red-600">
                {fieldErrors.confirm_password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f4a261] hover:bg-[#e07b19] disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-2 rounded transition"
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </div>
    </div>
  );
}
