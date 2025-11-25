// src/pages/ChatInboxPage.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageCircle, Loader2, Search, Send } from "lucide-react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../components/ToastProvider";
import { getErrorMessage } from "../utils/errors";

export default function ChatInboxPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialThreadParam = searchParams.get("thread") || null;
  const { error: toastError } = useToast();

  const [threads, setThreads] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [threadsSearch, setThreadsSearch] = useState("");

  const [selectedThread, setSelectedThread] = useState(null);

  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");

  const [messageImage, setMessageImage] = useState(null);
  const [messageImagePreview, setMessageImagePreview] = useState(null);
  const [imageModalUrl, setImageModalUrl] = useState(null);

  const bottomRef = useRef(null);
  const pollingRef = useRef(null);
  const threadsPollingRef = useRef(null);

  // último visto por thread: { [threadUuid]: ISOString }
  const [threadLastSeen, setThreadLastSeen] = useState({});

  // Si no está logueado, redirige a login
  useEffect(() => {
    if (!user) {
      navigate(
        `/login?next=${encodeURIComponent(
          location.pathname + location.search
        )}`
      );
    }
  }, [user, navigate, location]);

  const fetchThreads = async (url = "/chat/threads/") => {
    try {
      setThreadsLoading(true);
      const { data } = await api.get(url);

      const list = data.results || data || [];
      setThreads(list);
      setNextUrl(data.next || null);
      setPrevUrl(data.previous || null);

      // Seleccionar thread:
      // 1) Si viene ?thread=<uuid> en la URL, intentamos ese
      // 2) Si no hay seleccionado aún, usamos el primero
      setSelectedThread((prev) => {
        if (prev && !initialThreadParam) return prev;

        if (initialThreadParam) {
          const found = list.find((t) => t.uuid === initialThreadParam);
          if (found) return found;
        }

        if (!prev && list.length > 0) {
          return list[0];
        }

        return prev;
      });
    } catch (err) {
      toastError(getErrorMessage(err, "No se pudieron cargar tus chats."));
    } finally {
      setThreadsLoading(false);
    }
  };

  // Cargar threads + polling de lista
  useEffect(() => {
    if (!user) return;

    fetchThreads();

    if (threadsPollingRef.current) {
      clearInterval(threadsPollingRef.current);
    }
    threadsPollingRef.current = setInterval(() => {
      fetchThreads();
    }, 8000);

    return () => {
      if (threadsPollingRef.current) {
        clearInterval(threadsPollingRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  const fetchMessages = async ({ scroll = false } = {}) => {
    if (!selectedThread) return;

    try {
      setMessagesLoading(true);
      const { data } = await api.get(
        `/chat/threads/${selectedThread.uuid}/messages/`
      );

      // data ahora es un array completo ya ordenado
      setMessages(data);

      if (scroll) scrollToBottom();
    } catch (err) {
      console.error("Error cargando mensajes:", err);
      toastError(getErrorMessage(err, "No se pudieron cargar los mensajes."));
    } finally {
      setMessagesLoading(false);
    }
  };

  // Cargar mensajes y hacer polling cada vez que cambia el thread seleccionado
  useEffect(() => {
    if (!selectedThread) return;

    fetchMessages({ scroll: true });

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
    pollingRef.current = setInterval(() => {
      fetchMessages();
    }, 4000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedThread?.uuid]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // Marcar como leído cuando ya tenemos mensajes del thread abierto
  useEffect(() => {
    if (!selectedThread || messages.length === 0) return;

    const last = messages[messages.length - 1];
    const lastTime = last.created_at || new Date().toISOString();

    setThreadLastSeen((prev) => ({
      ...prev,
      [selectedThread.uuid]: lastTime,
    }));
  }, [messages.length, selectedThread?.uuid]);

  // Imagen del mensaje
  const handleMessageImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = /^image\//.test(file.type);
    const maxMB = 8;

    if (!isImage) {
      toastError("El archivo debe ser una imagen.");
      return;
    }
    if (file.size > maxMB * 1024 * 1024) {
      toastError(`La imagen debe pesar máximo ${maxMB}MB.`);
      return;
    }

    setMessageImage(file);
    const url = URL.createObjectURL(file);
    setMessageImagePreview(url);
  };

  const clearMessageImage = () => {
    setMessageImage(null);
    setMessageImagePreview(null);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedThread) return;
    if (!text.trim() && !messageImage) return;

    try {
      setSending(true);
      const fd = new FormData();
      fd.append("text", text.trim());
      if (messageImage) {
        fd.append("image", messageImage);
      }

      // IMPORTANTE: usamos la respuesta del POST
      const { data: newMessage } = await api.post(
        `/chat/threads/${selectedThread.uuid}/messages/`,
        fd
      );

      setText("");
      clearMessageImage();

      // si la API devuelve el mensaje creado, lo agregamos al estado local
      if (newMessage && newMessage.uuid) {
        setMessages((prev) => [...prev, newMessage]);
        scrollToBottom();
      } else {
        // fallback: recargar mensajes si no vino el objeto
        await fetchMessages({ scroll: true });
      }

      // refrescamos la lista de threads para actualizar último mensaje/hora
      fetchThreads();
    } catch (err) {
      console.error("Error enviando mensaje:", err);
      toastError(getErrorMessage(err, "No se pudo enviar el mensaje."));
    } finally {
      setSending(false);
    }
  };

  const handleSelectThread = (thread) => {
    setSelectedThread(thread);

    const lastTime =
      thread.last_message_at ||
      thread.last_message?.created_at ||
      new Date().toISOString();

    setThreadLastSeen((prev) => ({
      ...prev,
      [thread.uuid]: lastTime,
    }));
  };

  if (!user) {
    return null;
  }

  // Nombre del otro según mi rol, para el thread seleccionado
  let otherName = "Chat";
  if (selectedThread) {
    if (user.role === "client") {
      otherName =
        selectedThread.provider_full_name || selectedThread.client_full_name;
    } else if (user.role === "provider") {
      otherName =
        selectedThread.client_full_name || selectedThread.provider_full_name;
    } else {
      otherName =
        selectedThread.provider_full_name || selectedThread.client_full_name;
    }
  }

  // Filtro simple por nombre en la lista de threads + orden por último mensaje
  const filteredThreads = [...threads]
    .filter((t) => {
      const isClient = user.role === "client";
      const name = isClient ? t.provider_full_name : t.client_full_name;
      if (!threadsSearch.trim()) return true;
      return (name || "")
        .toLowerCase()
        .includes(threadsSearch.trim().toLowerCase());
    })
    .sort((a, b) => {
      const getTime = (thread) => {
        const lastMsg = thread.last_message;
        const raw = thread.last_message_at || lastMsg?.created_at || 0;
        return raw ? new Date(raw).getTime() : 0;
      };
      return getTime(b) - getTime(a);
    });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-2 md:px-4 py-4">
        <div className="bg-white rounded-2xl shadow-xl flex flex-col md:flex-row h-[calc(100vh-5rem)] overflow-hidden">
          {/* PANE IZQUIERDO: lista de chats */}
          <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col">
            {/* Header lista */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-[#28364e]" />
                <div>
                  <h1 className="text-base font-semibold text-[#28364e]">
                    Mis chats
                  </h1>
                  <p className="text-xs text-gray-400">
                    {threads.length} conversación(es)
                  </p>
                </div>
              </div>
            </div>

            {/* Buscador */}
            <div className="px-3 pt-3 pb-2 border-b border-gray-200">
              <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5 border border-gray-200">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={threadsSearch}
                  onChange={(e) => setThreadsSearch(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>
            </div>

            {/* Lista de threads */}
            <div className="flex-1 overflow-y-auto">
              {threadsLoading && (
                <div className="flex items-center justify-center py-8 text-gray-500 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Cargando chats...</span>
                </div>
              )}

              {!threadsLoading && filteredThreads.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  {threads.length === 0
                    ? "Aún no tienes chats."
                    : "No se encontraron chats para ese nombre."}
                </div>
              )}

              {!threadsLoading && filteredThreads.length > 0 && (
                <div className="py-2">
                  {filteredThreads.map((t) => {
                    const isClient = user.role === "client";
                    const name = isClient
                      ? t.provider_full_name
                      : t.client_full_name;
                    const lastMsg = t.last_message;
                    const lastText =
                      lastMsg?.text ||
                      (lastMsg?.image ? "📷 Imagen" : "(Sin mensajes aún)");
                    const lastTime =
                      t.last_message_at || lastMsg?.created_at;

                    const isActive =
                      selectedThread && selectedThread.uuid === t.uuid;

                    const lastSeen = threadLastSeen[t.uuid];
                    const lastMessageDate = lastTime
                      ? new Date(lastTime)
                      : null;

                    const hasUnread =
                      lastMessageDate &&
                      (!lastSeen ||
                        lastMessageDate > new Date(lastSeen)) &&
                      lastMsg?.sender_role !== user.role;

                    return (
                      <button
                        key={t.uuid}
                        onClick={() => handleSelectThread(t)}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition border-l-4 ${
                          isActive
                            ? "bg-gray-50 border-l-[#28364e]"
                            : "border-l-transparent"
                        }`}
                      >
                        {/* Avatar con inicial */}
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-[#28364e] flex-shrink-0 relative">
                          {(name || "C").charAt(0).toUpperCase()}
                          {hasUnread && (
                            <span className="absolute -top-1 -right-1 inline-block w-2.5 h-2.5 rounded-full bg-[#28364e]" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <p className="text-sm font-semibold text-[#28364e] truncate">
                                {name || "Chat"}
                              </p>
                              {hasUnread && (
                                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] bg-[#28364e] text-white">
                                  Nuevo
                                </span>
                              )}
                            </div>
                            {lastTime && (
                              <span className="text-[11px] text-gray-400 whitespace-nowrap">
                                {new Date(lastTime).toLocaleString()}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-gray-500 truncate">
                            {lastText}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Paginación */}
            {!threadsLoading && (nextUrl || prevUrl) && (
              <div className="flex justify-center gap-3 py-3 border-t border-gray-200">
                <button
                  disabled={!prevUrl}
                  onClick={() => fetchThreads(prevUrl)}
                  className="px-3 py-1.5 rounded-full border text-xs disabled:opacity-50 bg-white hover:bg-gray-50"
                >
                  Anterior
                </button>
                <button
                  disabled={!nextUrl}
                  onClick={() => fetchThreads(nextUrl)}
                  className="px-3 py-1.5 rounded-full border text-xs disabled:opacity-50 bg-white hover:bg-gray-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>

          {/* PANE DERECHO: mensajes del chat */}
          <div className="flex-1 flex flex-col bg-gray-50">
            {/* Si no hay chat seleccionado */}
            {!selectedThread && (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <MessageCircle className="w-10 h-10 mb-3" />
                <p className="text-sm">
                  Selecciona un chat en la lista para empezar a conversar.
                </p>
              </div>
            )}

            {selectedThread && (
              <>
                {/* Header chat */}
                <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#28364e]">
                      Chat con {otherName}
                    </p>
                    <p className="text-xs text-gray-400">Bizu</p>
                  </div>
                </div>

                {/* Mensajes */}
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                  {messagesLoading && messages.length === 0 && (
                    <div className="flex items-center justify-center py-8 text-gray-400 gap-2 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Cargando mensajes...</span>
                    </div>
                  )}

                  {messages.map((m) => {
                    const isMine = user && m.sender_role === user.role;
                    const alignment = isMine
                      ? "justify-end"
                      : "justify-start";
                    const bubbleClasses = isMine
                      ? "bg-[#DCF8C6] text-gray-900 rounded-2xl rounded-br-none"
                      : "bg-white text-gray-800 rounded-2xl rounded-bl-none";
                    const timeColor = isMine
                      ? "text-gray-500"
                      : "text-gray-400";
                    const initial = (m.sender_full_name || "?")
                      .charAt(0)
                      .toUpperCase();

                    return (
                      <div key={m.uuid} className={`flex w-full ${alignment}`}>
                        {!isMine && (
                          <div className="flex-shrink-0 mr-2">
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
                              {initial}
                            </div>
                          </div>
                        )}

                        <div
                          className={`max-w-[80%] px-3 py-2 shadow-sm ${bubbleClasses}`}
                        >
                          {!isMine && (
                            <p className="text-xs font-semibold mb-1 text-gray-600">
                              {m.sender_full_name}
                            </p>
                          )}

                          {m.image && (
                            <div className="mb-2">
                              <button
                                type="button"
                                onClick={() => setImageModalUrl(m.image)}
                                className="block rounded-lg overflow-hidden border focus:outline-none focus:ring-2 focus:ring-[#28364e]"
                              >
                                <img
                                  src={m.image}
                                  alt="Imagen del mensaje"
                                  className="max-h-64 w-full object-cover"
                                  loading="lazy"
                                />
                              </button>
                            </div>
                          )}

                          {m.text && (
                            <p className="text-sm whitespace-pre-wrap">
                              {m.text}
                            </p>
                          )}

                          <div
                            className={`mt-1 text-[10px] ${timeColor} text-right`}
                          >
                            {m.created_at &&
                              new Date(m.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Input + imagen */}
                <form
                  onSubmit={handleSend}
                  className="border-t bg-white px-3 py-2 flex flex-col gap-2"
                >
                  {messageImagePreview && (
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-md overflow-hidden border">
                        <img
                          src={messageImagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={clearMessageImage}
                        className="text-sm text-red-600 underline"
                      >
                        Quitar imagen
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <label className="px-3 py-2 rounded-full border border-gray-300 text-xs md:text-sm cursor-pointer bg-gray-50 hover:bg-gray-100">
                      Adjuntar imagen
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleMessageImageChange}
                      />
                    </label>

                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Escribe un mensaje..."
                      className="flex-1 px-3 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#28364e] text-sm"
                    />

                    <button
                      type="submit"
                      disabled={sending || (!text.trim() && !messageImage)}
                      className="p-2 rounded-full bg-[#28364e] text-white disabled:opacity-50 flex items-center justify-center"
                    >
                      {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Modal imagen grande */}
            {imageModalUrl && (
              <div
                className="fixed inset-0 z-[120] bg-black/80 flex items-center justify-center px-4"
                role="dialog"
                aria-modal="true"
                onClick={() => setImageModalUrl(null)}
              >
                <div
                  className="relative max-w-3xl w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setImageModalUrl(null)}
                    className="absolute -top-10 right-0 text-white/90 hover:text-white"
                    aria-label="Cerrar"
                  >
                    ✕
                  </button>
                  <div className="rounded-lg overflow-hidden shadow-2xl bg-black">
                    <img
                      src={imageModalUrl}
                      alt="Imagen del mensaje"
                      className="w-full max-h-[80vh] object-contain select-none"
                      draggable={false}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
