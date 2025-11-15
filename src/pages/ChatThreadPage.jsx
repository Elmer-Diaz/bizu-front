import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import api from "../api";
import { useToast } from "../components/ToastProvider";
import { getErrorMessage } from "../utils/errors";
import { AuthContext } from "../context/AuthContext";

export default function ChatThreadPage() {
  const { threadUuid } = useParams(); // /chat/:threadUuid
  const navigate = useNavigate();
  const { error: toastError } = useToast();
  const { user } = useContext(AuthContext);

  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");

  // 📸 Imagen del mensaje
  const [messageImage, setMessageImage] = useState(null);
  const [messageImagePreview, setMessageImagePreview] = useState(null);

  // Modal para ver imagen de mensaje ampliada
  const [imageModalUrl, setImageModalUrl] = useState(null);

  const bottomRef = useRef(null);
  const pollingRef = useRef(null);

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  // Cargar info del thread (cliente/proveedor)
  const fetchThread = async () => {
    try {
      const { data } = await api.get(`/chat/threads/${threadUuid}/`);
      setThread(data);
    } catch (err) {
      toastError(getErrorMessage(err, "No se pudo cargar el chat."));
    }
  };

  // Cargar mensajes
  const fetchMessages = async ({ scroll } = { scroll: false }) => {
    try {
      const { data } = await api.get(`/chat/threads/${threadUuid}/messages/`);
      const list = data.results || data || [];
      setMessages(list);
      if (scroll) scrollToBottom();
    } catch (err) {
      console.error("Error cargando mensajes:", err);
      toastError(getErrorMessage(err, "No se pudieron cargar los mensajes."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchThread();
    fetchMessages({ scroll: true });

    // Polling cada 4 segundos
    pollingRef.current = setInterval(() => {
      fetchMessages();
    }, 4000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadUuid]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // 📸 cambiar imagen del mensaje
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

    // ahora permitimos enviar solo imagen, solo texto o ambos
    if (!text.trim() && !messageImage) return;

    try {
      setSending(true);
      const fd = new FormData();
      fd.append("text", text.trim());
      if (messageImage) {
        fd.append("image", messageImage);
      }

      await api.post(`/chat/threads/${threadUuid}/messages/`, fd);
      setText("");
      clearMessageImage();
      await fetchMessages({ scroll: true });
    } catch (err) {
      console.error("Error enviando mensaje:", err);
      toastError(getErrorMessage(err, "No se pudo enviar el mensaje."));
    } finally {
      setSending(false);
    }
  };

  if (loading && !thread) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Cargando chat...
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">
        <p>No se encontró este chat.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 rounded bg-[#28364e] text-white"
        >
          Volver
        </button>
      </div>
    );
  }

  // Nombre del otro según mi rol
  let otherName = "Chat";
  if (user?.role === "client") {
    otherName = thread.provider_full_name || thread.client_full_name;
  } else if (user?.role === "provider") {
    otherName = thread.client_full_name || thread.provider_full_name;
  } else {
    otherName = thread.provider_full_name || thread.client_full_name;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-[#28364e] text-white px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1 rounded-full hover:bg-white/10"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="font-semibold text-lg">Chat con {otherName}</div>
          <div className="text-xs text-white/70">Bizu</div>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((m) => {
          // 👉 Si mi rol y el sender_role coinciden, el mensaje es mío
          const isMine = user && m.sender_role === user.role;

          // Alineación horizontal
          const alignment = isMine ? "justify-end" : "justify-start";

          // Colores de burbuja
          const bubbleClasses = isMine
            ? "bg-[#DCF8C6] text-gray-900 rounded-2xl rounded-br-none" // mis mensajes (derecha, verde claro)
            : "bg-white text-gray-800 rounded-2xl rounded-bl-none"; // recibidos (izquierda, blanco)

          const timeColor = isMine ? "text-gray-500" : "text-gray-400";

          // Inicial para avatar del otro
          const initial = (m.sender_full_name || "?").charAt(0).toUpperCase();

          return (
            <div key={m.uuid} className={`flex w-full ${alignment}`}>
              {/* Avatar solo del OTRO */}
              {!isMine && (
                <div className="flex-shrink-0 mr-2">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
                    {initial}
                  </div>
                </div>
              )}

              <div className={`max-w-[80%] px-3 py-2 shadow-sm ${bubbleClasses}`}>
                {/* Nombre del otro arriba */}
                {!isMine && (
                  <p className="text-xs font-semibold mb-1 text-gray-600">
                    {m.sender_full_name}
                  </p>
                )}

                {/* Imagen del mensaje (si tiene) */}
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

                {/* Texto del mensaje (si hay) */}
                {m.text && (
                  <p className="text-sm whitespace-pre-wrap">{m.text}</p>
                )}

                <div className={`mt-1 text-[10px] ${timeColor} text-right`}>
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
        {/* Preview de imagen si existe */}
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
          {/* Botón para elegir imagen */}
          <label className="px-3 py-2 rounded-full border border-gray-300 text-sm cursor-pointer bg-gray-50 hover:bg-gray-100">
            Adjuntar imagen
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleMessageImageChange}
            />
          </label>

          {/* Input de texto */}
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-3 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#28364e]"
          />

          {/* Botón enviar */}
          <button
            type="submit"
            disabled={sending || (!text.trim() && !messageImage)}
            className="p-2 rounded-full bg-[#28364e] text-white disabled:opacity-50 flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Modal para ver imagen ampliada */}
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
  );
}
