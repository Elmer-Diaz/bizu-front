import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { Mail, Phone, MapPin, User, Camera, Loader2 } from "lucide-react";
import api from "../api";
import { AuthContext } from "../context/AuthContext"; // 👈 Importamos el contexto

export default function PublicProfile() {
  const { uuid } = useParams();
  const { user, setUser } = useContext(AuthContext); // 👈 Estado global del usuario
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const storedRole = localStorage.getItem("role");
  const myUuid = localStorage.getItem("uuid");

  useEffect(() => {
    if (storedRole === "admin") {
      setIsAdmin(true);
    }
  }, [storedRole]);

  // 📌 Cargar perfil público
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

  // 🔄 Activar/Desactivar cuenta
  const toggleAccountStatus = async () => {
    if (!data) return;
    try {
      setLoadingAction(true);
      await api.patch(`/toggle-account-status/${uuid}/`, {
        is_active: !data.is_active,
      });
      setData((prev) => ({
        ...prev,
        is_active: !prev.is_active,
      }));
    } catch (err) {
      alert(err.response?.data?.detail || "Error cambiando estado de la cuenta");
    } finally {
      setLoadingAction(false);
    }
  };

  // 📤 Cambiar foto de perfil
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);

    try {
      setUploadingPhoto(true);
      const { data: updated } = await api.patch(
        `/update-profile-photo/${uuid}/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // 🔹 Actualiza la foto en este perfil
      setData((prev) => ({
        ...prev,
        profile: { ...prev.profile, photo: updated.profile.photo },
      }));

      // 🔹 Si el usuario está editando su propio perfil, actualiza también en el Navbar
      if (myUuid === uuid) {
        setUser((prev) => ({
          ...prev,
          profile: { ...prev.profile, photo: updated.profile.photo },
        }));
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Error subiendo la foto de perfil");
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  if (!data) {
    return <div className="text-center mt-10 text-gray-500">Cargando perfil...</div>;
  }

  const {
    full_name,
    email,
    role,
    is_active,
    profile: { phone, city, bio, photo } = {},
    provider_profile,
  } = data;

  const headline = provider_profile?.headline || null;
  const services = provider_profile?.services || [];
  const canEditPhoto = isAdmin || myUuid === uuid;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* HEADER PERFIL */}
      <section className="bg-[#28364e] text-white py-10 text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold">{full_name}</h2>
          {headline ? <p className="mt-2">{headline}</p> : <p className="mt-2 capitalize">{role}</p>}
        </div>
      </section>

      {/* DETALLES PERFIL */}
      <section className="py-10">
        <div className="container mx-auto max-w-2xl">
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

            {/* 📷 Botón cambiar foto */}
            {canEditPhoto && (
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                <label
                  htmlFor="photoUpload"
                  className="flex items-center gap-2 bg-[#f4a261] hover:bg-[#e07b19] text-white px-4 py-2 rounded-full text-sm cursor-pointer shadow-md transition"
                >
                  {uploadingPhoto ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
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

            <h5 className="text-lg font-semibold mt-6">Ubicación</h5>
            <p className="flex items-center gap-2 mt-1">
              <MapPin className="w-5 h-5 text-[#28364e]" /> {city || "No especificado"}
            </p>

            <h5 className="text-lg font-semibold mt-6">Contacto</h5>
            <p className="flex items-center gap-2 mt-1">
              <Mail className="w-5 h-5 text-[#28364e]" /> {email}
            </p>
            <p className="flex items-center gap-2 mt-1">
              <Phone className="w-5 h-5 text-[#28364e]" /> {phone || "No disponible"}
            </p>

            {/* BOTÓN SOLO ADMIN */}
            {isAdmin && (
              <div className="text-center mt-6">
                <button
                  onClick={toggleAccountStatus}
                  disabled={loadingAction}
                  className={`px-6 py-3 rounded-lg text-lg font-medium transition ${
                    is_active
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {loadingAction
                    ? "Procesando..."
                    : is_active
                    ? "Desactivar cuenta"
                    : "Activar cuenta"}
                </button>
              </div>
            )}

            <div className="text-center mt-6">
              <a
                href={`mailto:${email}`}
                className="bg-[#f4a261] hover:bg-[#e07b19] text-white px-6 py-3 rounded-lg text-lg font-medium"
              >
                Contactar
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
