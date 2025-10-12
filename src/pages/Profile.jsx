import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  MapPin,
  User,
  Camera,
  Loader2,
  MessageCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Edit3,
  Trash2,
} from "lucide-react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

export default function PublicProfile() {
  const { uuid } = useParams();
  const location = useLocation();
  const { user, setUser } = useContext(AuthContext);

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Lightbox
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [myReview, setMyReview] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReviewUuid, setEditingReviewUuid] = useState(null);

  const storedRole = localStorage.getItem("role");
  const myUuid = localStorage.getItem("uuid");

  useEffect(() => {
    if (storedRole === "admin") setIsAdmin(true);
  }, [storedRole]);

  // Cargar perfil
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get(`/profile/${uuid}/`);
        setData(data);
      } catch (err) {
        setError(err.response?.data?.detail || "Perfil no encontrado");
      }
    };
    fetchProfile();
  }, [uuid]);

  // Activar/Desactivar (admin)
  const toggleAccountStatus = async () => {
    if (!data) return;
    try {
      setLoadingAction(true);
      await api.patch(`/toggle-account-status/${uuid}/`, {
        is_active: !data.is_active,
      });
      setData((prev) => ({ ...prev, is_active: !prev.is_active }));
    } catch (err) {
      alert(err.response?.data?.detail || "Error cambiando estado de la cuenta");
    } finally {
      setLoadingAction(false);
    }
  };

  // Cambiar foto
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("photo", file);
    try {
      setUploadingPhoto(true);
      const { data: updated } = await api.patch(`/update-profile-photo/${uuid}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setData((prev) => ({ ...prev, profile: { ...prev.profile, photo: updated.profile.photo } }));
      if (myUuid === uuid) {
        setUser((prev) => ({ ...prev, profile: { ...prev.profile, photo: updated.profile.photo } }));
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Error subiendo la foto de perfil");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Lightbox
  const openLightbox = (idx) => {
    setLightboxIndex(idx);
    setIsLightboxOpen(true);
  };
  const closeLightbox = () => setIsLightboxOpen(false);
  const prevImage = useCallback(() => {
    if (!data?.provider_profile?.work_images?.length) return;
    setLightboxIndex(
      (i) => (i - 1 + data.provider_profile.work_images.length) % data.provider_profile.work_images.length
    );
  }, [data]);
  const nextImage = useCallback(() => {
    if (!data?.provider_profile?.work_images?.length) return;
    setLightboxIndex((i) => (i + 1) % data.provider_profile.work_images.length);
  }, [data]);

  useEffect(() => {
    const onKey = (e) => {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isLightboxOpen, prevImage, nextImage]);

  // Datos base
  const {
    full_name,
    role,
    is_active,
    profile: { phone, city, bio, photo } = {},
    provider_profile,
  } = data || {};

  const headline = provider_profile?.headline || null;
  const services = provider_profile?.services || [];
  const schedule = provider_profile?.schedule || "";
  const workImages = provider_profile?.work_images || [];
  const category = provider_profile?.category || null;
  const canEditPhoto = isAdmin || myUuid === uuid;
  const isOwnProfile = myUuid === uuid;

  // WhatsApp
  const waNumber = (phone || "").replace(/\D/g, "");
  const waText = encodeURIComponent(`Hola ${full_name || ""}, te contacto desde Bizu.`);
  const waLink = `https://wa.me/${waNumber}?text=${waText}`;
  const showWhatsappButton = Boolean(user) && Boolean(waNumber) && !isOwnProfile;
  const loginUrl = `/login?next=${encodeURIComponent(location.pathname + location.search)}`;

  // ======== Reviews SOLO si es proveedor ========
  const providerUuid = provider_profile?.uuid || null;
  const canReview = Boolean(user) && user?.role === "client" && Boolean(providerUuid);

  // Cargar reviews si hay providerUuid
  const loadReviews = useCallback(
    async (page = 1) => {
      if (!providerUuid) return;
      try {
        setReviewsLoading(true);
        const { data: res } = await api.get(`/providers/${providerUuid}/reviews/?page=${page}`);
        const list = res.results || [];
        setReviews(list);
        setReviewsCount(res.count || list.length);

        // Detectar mi reseña
        const mine = list.find((r) => r.author?.uuid === myUuid) || null;
        setMyReview(mine);
        if (!mine) {
          setReviewText("");
          setReviewRating(0);
        }
      } catch (e) {
        console.error("Error cargando reseñas:", e?.response?.data || e.message);
      } finally {
        setReviewsLoading(false);
      }
    },
    [providerUuid, myUuid]
  );

  useEffect(() => {
    if (!providerUuid) return;
    loadReviews(reviewsPage);
  }, [loadReviews, reviewsPage, providerUuid]);

  const onSubmitReview = async (e) => {
    e.preventDefault();
    if (!providerUuid || !canReview) return;
    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      alert("Selecciona una calificación (1 a 5).");
      return;
    }
    try {
      setSubmittingReview(true);
      if (editingReviewUuid) {
        await api.patch(`/reviews/${editingReviewUuid}/`, {
          rating: reviewRating,
          comment: reviewText,
        });
      } else {
        await api.post(`/providers/${providerUuid}/reviews/create/`, {
          rating: reviewRating,
          comment: reviewText,
        });
      }
      setEditingReviewUuid(null);
      await loadReviews(1);
      alert("¡Reseña guardada!");
    } catch (err) {
      console.error("Error al publicar reseña:", err?.response?.data || err.message);
      alert(err?.response?.data?.detail || "No se pudo enviar la reseña.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const onEditMyReview = () => {
    if (!myReview) return;
    setEditingReviewUuid(myReview.uuid);
    setReviewText(myReview.comment || "");
    setReviewRating(myReview.rating || 0);
  };

  const onCancelEdit = () => {
    setEditingReviewUuid(null);
    // Volver a los valores actuales (pero sin mostrar el form)
    setReviewText("");
    setReviewRating(0);
  };

  const onDeleteReview = async (reviewUuid) => {
    const ok = window.confirm("¿Eliminar esta reseña?");
    if (!ok) return;
    try {
      await api.delete(`/reviews/${reviewUuid}/delete/`);
      if (myReview?.uuid === reviewUuid) {
        setMyReview(null);
        setReviewText("");
        setReviewRating(0);
        setEditingReviewUuid(null);
      }
      await loadReviews(1);
    } catch (err) {
      alert(err?.response?.data?.detail || "No se pudo eliminar.");
    }
  };

  const ratingAvg =
    reviewsCount > 0 && reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : null;

  // Ordenar: mi reseña primero
  const orderedReviews = myReview
    ? [myReview, ...reviews.filter((r) => r.uuid !== myReview.uuid)]
    : reviews;

  // Estrellas
  const StarInput = ({ value, onChange }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          onClick={() => onChange(n)}
          className="focus:outline-none"
          aria-label={`${n} estrellas`}
          title={`${n} estrellas`}
        >
          <Star className={`w-6 h-6 ${n <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        </button>
      ))}
    </div>
  );

  const StarReadOnly = ({ value = 0 }) => (
    <div className="flex gap-1" aria-label={`${value} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`w-5 h-5 ${n <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
      ))}
    </div>
  );

  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!data) return <div className="text-center mt-10 text-gray-500">Cargando perfil...</div>;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* HEADER PERFIL */}
      <section className="bg-[#28364e] text-white py-10 text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold">{full_name}</h2>
          {headline ? <p className="mt-2">{headline}</p> : <p className="mt-2 capitalize">{role}</p>}
          {category && (
            <span className="inline-block mt-3 px-3 py-1 text-sm bg-white/10 rounded-full">
              Categoría: <span className="font-semibold">{category}</span>
            </span>
          )}
        </div>
      </section>

      {/* DETALLES PERFIL */}
      <section className="py-10">
        <div className="container mx-auto max-w-3xl">
          <div className="flex justify-center relative">
            {photo ? (
              <img
                src={photo}
                alt={full_name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white -mt-16 shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center border-4 border-white -mt-16 shadow-lg">
                <User className="text-[#28364e] w-16 h-16" />
              </div>
            )}

            {(isAdmin || myUuid === uuid) && (
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                <label
                  htmlFor="photoUpload"
                  className="flex items-center gap-2 bg-[#f4a261] hover:bg-[#e07b19] text-white px-4 py-2 rounded-full text-sm cursor-pointer shadow-md transition"
                >
                  {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  {uploadingPhoto ? "Subiendo..." : "Cambiar foto"}
                </label>
                <input
                  type="file"
                  id="photoUpload"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={uploadingPhoto}
                />
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="bg-white rounded-xl shadow-md p-6 mt-10">
            <h5 className="text-lg font-semibold mb-3">Sobre mí</h5>
            <p>{bio || "Sin descripción disponible."}</p>

            {services.length > 0 && (
              <>
                <h5 className="text-lg font-semibold mt-6">Servicios ofrecidos</h5>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {services.map((service, i) => (
                    <li key={i}>{service}</li>
                  ))}
                </ul>
              </>
            )}

            {schedule && (
              <>
                <h5 className="text-lg font-semibold mt-6">Horario</h5>
                <p className="mt-1">{schedule}</p>
              </>
            )}

            <h5 className="text-lg font-semibold mt-6">Ubicación</h5>
            <p className="flex items-center gap-2 mt-1">
              <MapPin className="w-5 h-5 text-[#28364e]" /> {city || "No especificado"}
            </p>

            {/* Galería */}
            {workImages.length > 0 && (
              <>
                <h5 className="text-lg font-semibold mt-6">Trabajos</h5>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {workImages.map((img, idx) => (
                    <button
                      key={img.uuid}
                      onClick={() => openLightbox(idx)}
                      className="group rounded-lg overflow-hidden shadow-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#28364e]"
                      aria-label={`Ver imagen ${idx + 1}`}
                    >
                      <img
                        src={img.url}
                        alt={img.caption || "Trabajo"}
                        className="w-full h-40 object-cover transition-transform duration-200 group-hover:scale-105"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Admin: activar/desactivar */}
            {isAdmin && (
              <div className="text-center mt-6">
                <button
                  onClick={toggleAccountStatus}
                  disabled={loadingAction}
                  className={`px-6 py-3 rounded-lg text-lg font-medium transition ${is_active ? "bg-red-500 hover:bg-red-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                >
                  {loadingAction ? "Procesando..." : is_active ? "Desactivar cuenta" : "Activar cuenta"}
                </button>
              </div>
            )}

            {/* Contacto (oculto si es su propio perfil) */}
            {showWhatsappButton ? (
              <div className="text-center mt-6">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:brightness-95 text-white px-6 py-3 rounded-lg text-lg font-medium"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contactar por WhatsApp
                </a>
              </div>
            ) : !user ? (
              <div className="text-center mt-6">
                <a
                  href={`/login?next=${encodeURIComponent(location.pathname + location.search)}`}
                  className="inline-flex items-center gap-2 bg-[#28364e] hover:opacity-90 text-white px-6 py-3 rounded-lg text-lg font-medium"
                >
                  Inicia sesión para contactar
                </a>
                <p className="text-sm text-gray-500 mt-2">Necesitas una cuenta para enviar mensajes por WhatsApp.</p>
              </div>
            ) : (
              !isOwnProfile && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  Este proveedor aún no tiene un teléfono disponible para contacto.
                </p>
              )
            )}
          </div>

          {/* ===================== REVIEWS (solo si providerUuid) ===================== */}
          {providerUuid && (
            <div className="bg-white rounded-xl shadow-md p-6 mt-10">
              <div className="flex items-center justify-between">
                <h5 className="text-lg font-semibold">Reseñas</h5>
                {reviewsCount > 0 && (
                  <div className="text-sm text-gray-600">
                    Promedio: <span className="font-semibold">{ratingAvg || "-"}</span> / 5
                  </div>
                )}
              </div>

              {/* Formulario SOLO si: puede reseñar y (no tiene reseña) o está editando */}
              {canReview && (editingReviewUuid || !myReview) && (
                <form onSubmit={onSubmitReview} className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700">Tu calificación:</span>
                    <StarInput value={reviewRating} onChange={setReviewRating} />
                    {editingReviewUuid ? (
                      <span className="text-xs text-blue-600">Editando tu reseña</span>
                    ) : null}
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-[#28364e]"
                    placeholder="Escribe tu opinión (opcional)"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-[#28364e] hover:opacity-90 text-white px-4 py-2 rounded-md"
                    >
                      {submittingReview
                        ? "Enviando..."
                        : editingReviewUuid
                          ? "Guardar cambios"
                          : "Publicar reseña"}
                    </button>

                    {editingReviewUuid && (
                      <button type="button" onClick={onCancelEdit} className="px-3 py-2 rounded-md border">
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* Lista de reseñas (mi reseña primero si existe) */}
              <div className="mt-6 space-y-5">
                {reviewsLoading && <p className="text-gray-500">Cargando reseñas...</p>}
                {!reviewsLoading && orderedReviews.length === 0 && <p className="text-gray-500">Aún no hay reseñas.</p>}

                {orderedReviews.map((r) => {
                  const isMine = r.author?.uuid === myUuid;
                  return (
                    <div key={r.uuid} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold">
                            {isMine ? "Tu reseña" : r.author?.full_name || "Usuario"}
                          </div>
                          <StarReadOnly value={r.rating} />
                        </div>

                        {(isAdmin || isMine) && !editingReviewUuid && (
                          <div className="flex gap-2">
                            {isMine && (
                              <button
                                onClick={onEditMyReview}
                                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-md border text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#28364e]"
                                aria-label="Editar reseña"
                                title="Editar reseña"
                              >
                                <Edit3 className="w-4 h-4" />
                                <span className="hidden sm:inline">Editar</span>
                              </button>
                            )}
                            {(isMine || isAdmin) && (
                              <button
                                onClick={() => onDeleteReview(r.uuid)}
                                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-md border text-sm text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                aria-label="Borrar reseña"
                                title="Borrar reseña"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Borrar</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {r.comment && <p className="mt-2 text-gray-700">{r.comment}</p>}
                      {r.created_at && (
                        <p className="mt-1 text-xs text-gray-400">{new Date(r.created_at).toLocaleString()}</p>
                      )}
                    </div>
                  );
                })}
              </div>


              {/* Paginación simple */}
              {reviewsCount > reviews.length && (
                <div className="flex justify-center gap-3 mt-6">
                  <button onClick={() => setReviewsPage((p) => Math.max(1, p - 1))} className="px-3 py-2 rounded-md border">
                    Anterior
                  </button>
                  <button onClick={() => setReviewsPage((p) => p + 1)} className="px-3 py-2 rounded-md border">
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {isLightboxOpen && workImages.length > 0 && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
        >
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeLightbox}
              className="absolute -top-10 right-0 text-white/90 hover:text-white"
              aria-label="Cerrar"
              title="Cerrar (Esc)"
            >
              <X className="w-7 h-7" />
            </button>

            {workImages.length > 1 && (
              <button
                onClick={prevImage}
                className="absolute left-0 top-1/2 -translate-y-1/2 p-3 text-white/90 hover:text-white"
                aria-label="Anterior"
                title="Anterior (←)"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            {workImages.length > 1 && (
              <button
                onClick={nextImage}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-3 text-white/90 hover:text-white"
                aria-label="Siguiente"
                title="Siguiente (→)"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}

            <div className="rounded-lg overflow-hidden shadow-2xl bg-black">
              <img
                src={workImages[lightboxIndex]?.url}
                alt={workImages[lightboxIndex]?.caption || "Imagen"}
                className="w-full max-h-[80vh] object-contain select-none"
                draggable={false}
              />
              {workImages[lightboxIndex]?.caption && (
                <div className="p-3 text-sm text-white/90">{workImages[lightboxIndex].caption}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
