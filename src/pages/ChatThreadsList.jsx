// src/pages/ChatThreadsList.jsx
import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { MessageCircle, ArrowRight, Loader2 } from "lucide-react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../components/ToastProvider";
import { getErrorMessage } from "../utils/errors";

export default function ChatThreadsList() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { error: toastError } = useToast();

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);

  // Si no está logueado, redirige a login
  useEffect(() => {
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
    }
  }, [user, navigate, location]);

  const fetchThreads = async (url = "/chat/threads/") => {
    try {
      setLoading(true);
      const { data } = await api.get(url);

      // DRF paginado: {count, next, previous, results}
      const list = data.results || data || [];
      setThreads(list);
      setNextUrl(data.next || null);
      setPrevUrl(data.previous || null);
    } catch (err) {
      toastError(getErrorMessage(err, "No se pudieron cargar tus chats."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleOpenChat = (threadUuid) => {
    navigate(`/chat/${threadUuid}`);
  };

  if (!user) {
    // mientras redirige
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#28364e] flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Mis chats
          </h1>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Cargando chats...</span>
          </div>
        )}

        {!loading && threads.length === 0 && (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
            Aún no tienes chats.
          </div>
        )}

        {!loading && threads.length > 0 && (
          <div className="space-y-3">
            {threads.map((t) => {
              const isClient = user.role === "client";
              const otherName = isClient ? t.provider_full_name : t.client_full_name;
              const lastMsg = t.last_message;
              const lastText = lastMsg?.text || "(Sin mensajes aún)";
              const lastTime = t.last_message_at || lastMsg?.created_at || null;

              return (
                <button
                  key={t.uuid}
                  onClick={() => handleOpenChat(t.uuid)}
                  className="w-full text-left bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="font-semibold text-[#28364e] truncate">
                        {otherName || "Chat"}
                      </h2>
                      {lastTime && (
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {new Date(lastTime).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600 truncate">
                      {lastText}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        )}

        {/* Paginación simple si el backend devuelve next/previous */}
        {!loading && (nextUrl || prevUrl) && (
          <div className="flex justify-center gap-3 mt-6">
            <button
              disabled={!prevUrl}
              onClick={() => fetchThreads(prevUrl)}
              className="px-3 py-2 rounded-md border text-sm disabled:opacity-50 bg-white hover:bg-gray-50"
            >
              Anterior
            </button>
            <button
              disabled={!nextUrl}
              onClick={() => fetchThreads(nextUrl)}
              className="px-3 py-2 rounded-md border text-sm disabled:opacity-50 bg-white hover:bg-gray-50"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
