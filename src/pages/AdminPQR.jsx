// src/pages/AdminPQR.jsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api";
import { useToast } from "../components/ToastProvider";
import { getErrorMessage } from "../utils/errors";
import { Search, Eye, Trash2, Loader2 } from "lucide-react";

const STATUS = [
  { value: "", label: "Todos" },
  { value: "abierto", label: "Abierto" },
  { value: "en_proceso", label: "En proceso" },
  { value: "resuelto", label: "Resuelto" },
  { value: "cerrado", label: "Cerrado" },
];

export default function AdminPQR() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));

  const [viewing, setViewing] = useState(null); // pqr en modal
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(null); // uuid que se elimina

  const load = async (p = 1, query = "", stat = "") => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/pqr/", {
        params: {
          page: p,
          q: query || undefined,
          status: stat || undefined,
        },
      });
      setItems(data.results || []);
      setCount(data.count || 0);
      setNext(data.next || null);
      setPrevious(data.previous || null);
    } catch (e) {
      toastError(getErrorMessage(e, "No se pudo cargar la lista de PQR."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page, q, status);
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (status) sp.set("status", status);
    if (page && page > 1) sp.set("page", String(page));
    setSearchParams(sp, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q, status]);

  const submitFilters = (e) => {
    e.preventDefault();
    setPage(1);
    load(1, q, status);
  };

  const gotoPrev = () => previous && setPage((p) => Math.max(1, p - 1));
  const gotoNext = () => next && setPage((p) => p + 1);

  const updateStatus = async (uuid, newStatus) => {
    try {
      setUpdating(true);
      await api.patch(`/admin/pqr/${uuid}/status/`, { status: newStatus });
      toastSuccess("Estado actualizado.");
      load(page, q, status);
    } catch (e) {
      toastError(getErrorMessage(e, "No se pudo actualizar el estado."));
    } finally {
      setUpdating(false);
    }
  };

  const onDelete = async (uuid) => {
    if (!window.confirm("¿Eliminar esta PQR?")) return;
    try {
      setDeleting(uuid);
      await api.delete(`/admin/pqr/${uuid}/delete/`);
      toastSuccess("PQR eliminada.");
      load(page, q, status);
    } catch (e) {
      toastError(getErrorMessage(e, "No se pudo eliminar la PQR."));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-[#28364e]">Gestión de PQR</h1>

        {/* Filtros */}
        <form onSubmit={submitFilters} className="mt-4 flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Buscar (nombre, email, teléfono, texto...)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#f4a261]"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#f4a261]"
          >
            {STATUS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-[#28364e] text-white font-semibold hover:opacity-90"
          >
            Filtrar
          </button>
        </form>

        {/* Tabla */}
        <div className="mt-6 overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="p-3">Fecha</th>
                <th className="p-3">Nombre</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Email</th>
                <th className="p-3">Teléfono</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-gray-500">
                    <Loader2 className="w-5 h-5 inline animate-spin mr-2" />
                    Cargando...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-gray-500">
                    No hay PQR.
                  </td>
                </tr>
              ) : (
                items.map((it) => (
                  <tr key={it.uuid} className="border-t">
                    <td className="p-3 whitespace-nowrap">
                      {new Date(it.created_at).toLocaleString()}
                    </td>
                    <td className="p-3">{it.full_name}</td>
                    <td className="p-3 capitalize">{it.type}</td>
                    <td className="p-3">
                      <select
                        value={it.status}
                        onChange={(e) => updateStatus(it.uuid, e.target.value)}
                        disabled={updating}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        {STATUS.filter((s) => s.value).map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">{it.email}</td>
                    <td className="p-3">{it.phone}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewing(it)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded border hover:bg-gray-50"
                          title="Ver"
                        >
                          <Eye className="w-4 h-4" /> Ver
                        </button>
                        <button
                          onClick={() => onDelete(it.uuid)}
                          disabled={deleting === it.uuid}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded border text-red-600 hover:bg-red-50"
                          title="Eliminar"
                        >
                          {deleting === it.uuid ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {count > items.length && (
          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={gotoPrev}
              disabled={!previous}
              className={`px-3 py-2 rounded border ${
                previous ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"
              }`}
            >
              Anterior
            </button>
            <button
              onClick={gotoNext}
              disabled={!next}
              className={`px-3 py-2 rounded border ${
                next ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"
              }`}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Modal ver PQR */}
      {viewing && (
        <div
          className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4"
          onClick={() => setViewing(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[#28364e] mb-2">Detalle de PQR</h3>
            <p className="text-xs text-gray-500 mb-4">
              {new Date(viewing.created_at).toLocaleString()}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div><span className="font-semibold">Nombre:</span> {viewing.full_name}</div>
              <div><span className="font-semibold">Email:</span> {viewing.email}</div>
              <div><span className="font-semibold">Teléfono:</span> {viewing.phone}</div>
              <div className="capitalize">
                <span className="font-semibold">Tipo:</span> {viewing.type}
              </div>
              <div className="md:col-span-2">
                <span className="font-semibold">Asunto:</span> {viewing.subject || "—"}
              </div>
              <div className="md:col-span-2 mt-2">
                <span className="font-semibold">Descripción:</span>
                <p className="mt-1 whitespace-pre-wrap">{viewing.description}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setViewing(null)}
                className="px-4 py-2 rounded border hover:bg-gray-50"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setViewing(null);
                  onDelete(viewing.uuid);
                }}
                className="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
