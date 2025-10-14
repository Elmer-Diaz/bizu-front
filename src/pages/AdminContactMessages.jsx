// src/pages/AdminContactMessages.jsx
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Eye, Trash2, Loader2, ArrowLeft, Mail } from "lucide-react";
import api from "../api";
import { useToast } from "../components/ToastProvider";
import { getErrorMessage } from "../utils/errors";

export default function AdminContactMessages() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));

  const [viewing, setViewing] = useState(null); // msg seleccionado para modal
  const [deleting, setDeleting] = useState(null); // uuid eliminando

  const load = async (pageNum = 1, query = "") => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/contact-messages/", {
        params: { page: pageNum, q: query || undefined },
      });
      setItems(data.results || []);
      setCount(data.count || 0);
      setNext(data.next || null);
      setPrevious(data.previous || null);
    } catch (err) {
      toastError(getErrorMessage(err, "No se pudieron cargar los mensajes."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page, q);
    // sincroniza URL
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (page && page > 1) sp.set("page", String(page));
    setSearchParams(sp, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q]);

  const onSubmitSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(1, q);
  };

  const gotoPrev = () => {
    if (!previous) return;
    setPage((p) => Math.max(1, p - 1));
  };

  const gotoNext = () => {
    if (!next) return;
    setPage((p) => p + 1);
  };

  const onDelete = async (uuid) => {
    if (!window.confirm("¿Eliminar este mensaje?")) return;
    try {
      setDeleting(uuid);
      await api.delete(`/admin/contact-messages/${uuid}/delete/`);
      toastSuccess("Mensaje eliminado.");
      // recargar la página actual
      load(page, q);
    } catch (err) {
      toastError(getErrorMessage(err, "No se pudo eliminar el mensaje."));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[#28364e]">Mensajes de contacto</h1>
          <Link
            to="/contacto"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#28364e]"
          >
            <ArrowLeft className="w-4 h-4" />
            Ir a Contáctanos
          </Link>
        </div>

        {/* Buscador */}
        <form onSubmit={onSubmitSearch} className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, email, asunto o mensaje..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#f4a261]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-[#28364e] text-white font-semibold hover:opacity-90"
          >
            Buscar
          </button>
        </form>

        {/* Tabla */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Asunto</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                    <Loader2 className="w-5 h-5 inline animate-spin mr-2" />
                    Cargando...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                    No hay mensajes.
                  </td>
                </tr>
              ) : (
                items.map((m) => (
                  <tr key={m.uuid} className="border-t">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(m.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{m.full_name}</td>
                    <td className="px-4 py-3">
                      <a className="text-[#28364e] underline" href={`mailto:${m.email}`}>
                        {m.email}
                      </a>
                    </td>
                    <td className="px-4 py-3">{m.subject}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewing(m)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded border hover:bg-gray-50"
                          title="Ver"
                        >
                          <Eye className="w-4 h-4" /> Ver
                        </button>
                        <button
                          onClick={() => onDelete(m.uuid)}
                          disabled={deleting === m.uuid}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded border text-red-600 hover:bg-red-50"
                          title="Eliminar"
                        >
                          {deleting === m.uuid ? (
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
              className={`px-3 py-2 rounded border ${previous ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"}`}
            >
              Anterior
            </button>
            <button
              onClick={gotoNext}
              disabled={!next}
              className={`px-3 py-2 rounded border ${next ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"}`}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Modal ver mensaje */}
      {viewing && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4" onClick={() => setViewing(null)}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[#28364e] mb-2">Mensaje de contacto</h3>
            <p className="text-xs text-gray-500 mb-4">
              {new Date(viewing.created_at).toLocaleString()}
            </p>

            <div className="space-y-2 text-sm">
              <div><span className="font-semibold">Nombre:</span> {viewing.full_name}</div>
              <div className="flex items-center gap-1">
                <span className="font-semibold">Email:</span>
                <a className="text-[#28364e] underline inline-flex items-center gap-1" href={`mailto:${viewing.email}`}>
                  <Mail className="w-3 h-3" /> {viewing.email}
                </a>
              </div>
              <div><span className="font-semibold">Asunto:</span> {viewing.subject}</div>
              <div className="mt-3">
                <span className="font-semibold">Mensaje:</span>
                <p className="mt-1 whitespace-pre-wrap">{viewing.message}</p>
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
                onClick={() => { setViewing(null); onDelete(viewing.uuid); }}
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
