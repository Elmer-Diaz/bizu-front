export function getErrorMessage(err, fallback = "Ocurrió un error inesperado") {
  // Axios
  if (err?.response) {
    const data = err.response.data;
    if (typeof data === "string") return data;
    if (data?.detail) return data.detail;
    if (data?.message) return data.message;
    // Errores de validación comunes
    const firstField = data && typeof data === "object" ? Object.values(data)[0] : null;
    if (Array.isArray(firstField) && firstField.length) return String(firstField[0]);
    if (typeof firstField === "string") return firstField;
    return `${fallback} (HTTP ${err.response.status})`;
  }
  // Sin respuesta del server
  if (err?.request) return "No hay respuesta del servidor. Verifica tu conexión.";
  // Error generado en el cliente
  return err?.message || fallback;
}
