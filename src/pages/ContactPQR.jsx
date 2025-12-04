// src/pages/ContactPQR.jsx
import { useState } from "react";
import { useToast } from "../components/ToastProvider";
import api from "../api";
import { getErrorMessage } from "../utils/errors";
import { Mail, Phone, MapPin, Building2 } from "lucide-react";

const PQR_TYPES = [
  { value: "peticion", label: "Petición" },
  { value: "queja", label: "Queja" },
  { value: "reclamo", label: "Reclamo" },
];

export default function ContactPQR() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [tab, setTab] = useState("contact"); // 'contact' | 'pqr'

  // Contacto
  const [cForm, setCForm] = useState({
    full_name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [cErrors, setCErrors] = useState({});
  const [cSending, setCSending] = useState(false);

  // PQR
  const [pForm, setPForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    type: "peticion",
    subject: "",
    description: "",
  });
  const [pErrors, setPErrors] = useState({});
  const [pSending, setPSending] = useState(false);

  const validateContact = () => {
    const e = {};
    if (!cForm.full_name.trim()) e.full_name = "Tu nombre es obligatorio.";
    if (!cForm.email.trim()) e.email = "Tu correo es obligatorio.";
    else if (!/^\S+@\S+\.\S+$/.test(cForm.email)) e.email = "Correo inválido.";
    if (!cForm.subject.trim()) e.subject = "Asunto obligatorio.";
    if (!cForm.message.trim()) e.message = "Escribe un mensaje.";
    setCErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePQR = () => {
    const e = {};
    if (!pForm.full_name.trim()) e.full_name = "Tu nombre es obligatorio.";
    if (!pForm.email.trim()) e.email = "Tu correo es obligatorio.";
    else if (!/^\S+@\S+\.\S+$/.test(pForm.email)) e.email = "Correo inválido.";
    if (!pForm.phone.trim()) e.phone = "Tu teléfono es obligatorio.";
    if (!pForm.type) e.type = "Selecciona un tipo.";
    if (!pForm.subject.trim()) e.subject = "Asunto obligatorio.";
    if (!pForm.description.trim()) e.description = "Describe tu caso.";
    setPErrors(e);
    return Object.keys(e).length === 0;
  };

  const sendContact = async (e) => {
    e.preventDefault();
    if (!validateContact()) return;
    try {
      setCSending(true);
      await api.post("/contact/", cForm);
      toastSuccess("¡Gracias! Recibimos tu mensaje.");
      setCForm({ full_name: "", email: "", subject: "", message: "" });
      setCErrors({});
    } catch (err) {
      toastError(getErrorMessage(err, "No se pudo enviar el mensaje."));
    } finally {
      setCSending(false);
    }
  };

  const sendPQR = async (e) => {
    e.preventDefault();
    if (!validatePQR()) return;
    try {
      setPSending(true);
      await api.post("/pqr/", pForm);
      toastSuccess("¡Tu PQR fue radicada! Te escribiremos al correo.");
      setPForm({
        full_name: "",
        email: "",
        phone: "",
        type: "peticion",
        subject: "",
        description: "",
      });
      setPErrors({});
    } catch (err) {
      toastError(getErrorMessage(err, "No se pudo radicar la PQR."));
    } finally {
      setPSending(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-[#28364e] mb-1">Contáctanos & PQR</h1>
        <p className="text-sm text-gray-600 mb-6">
          Escríbenos si tienes dudas sobre Bizu. Para Peticiones, Quejas o Reclamos (PQR), usa el formulario dedicado.
        </p>

        {/* Info de la empresa */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          
          <div className="flex items-start gap-3 p-4 rounded-lg border">
            <Mail className="w-5 h-5 text-[#28364e] mt-1" />
            <div>
              <div className="font-semibold">Email</div>
              <a href="mailto:hola@bizu.co" className="text-sm text-[#28364e] underline">
                bizuservicios@gmail.com
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg border">
            <Phone className="w-5 h-5 text-[#28364e] mt-1" />
            <div>
              <div className="font-semibold">WhatsApp</div>
              <a
                href="https://wa.me/573125156964"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-[#28364e] underline"
              >
                +57 3125156964
              </a>
            </div>
          </div>
         <div className="flex items-start gap-3 p-4 rounded-lg border">
            <MapPin className="w-5 h-5 text-[#28364e] mt-1" />
            <div>
              <div className="font-semibold">Dirección</div>
              <div className="text-sm text-gray-600">Puerto Gaitán</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="inline-flex rounded-xl overflow-hidden border mb-6">
          <button
            onClick={() => setTab("contact")}
            className={`px-4 py-2 text-sm font-semibold ${tab === "contact" ? "bg-[#28364e] text-white" : "bg-white text-[#28364e]"}`}
          >
            Contáctanos
          </button>
          <button
            onClick={() => setTab("pqr")}
            className={`px-4 py-2 text-sm font-semibold border-l ${tab === "pqr" ? "bg-[#28364e] text-white" : "bg-white text-[#28364e]"}`}
          >
            PQR
          </button>
        </div>

        {tab === "contact" ? (
          <form onSubmit={sendContact} className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tu nombre *</label>
              <input
                type="text"
                value={cForm.full_name}
                onChange={(e) => setCForm((f) => ({ ...f, full_name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                  cErrors.full_name ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
                }`}
              />
              {cErrors.full_name && <p className="text-xs text-red-600 mt-1">{cErrors.full_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Correo electrónico *</label>
              <input
                type="email"
                value={cForm.email}
                onChange={(e) => setCForm((f) => ({ ...f, email: e.target.value }))}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                  cErrors.email ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
                }`}
              />
              {cErrors.email && <p className="text-xs text-red-600 mt-1">{cErrors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Asunto *</label>
              <input
                type="text"
                value={cForm.subject}
                onChange={(e) => setCForm((f) => ({ ...f, subject: e.target.value }))}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                  cErrors.subject ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
                }`}
              />
              {cErrors.subject && <p className="text-xs text-red-600 mt-1">{cErrors.subject}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mensaje *</label>
              <textarea
                rows={4}
                value={cForm.message}
                onChange={(e) => setCForm((f) => ({ ...f, message: e.target.value }))}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                  cErrors.message ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
                }`}
              />
              {cErrors.message && <p className="text-xs text-red-600 mt-1">{cErrors.message}</p>}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={cSending}
                className={`px-5 py-2 rounded-md text-white font-semibold ${
                  cSending ? "bg-gray-400" : "bg-[#28364e] hover:opacity-90"
                }`}
              >
                {cSending ? "Enviando..." : "Enviar mensaje"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={sendPQR} className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre completo *</label>
                <input
                  type="text"
                  value={pForm.full_name}
                  onChange={(e) => setPForm((f) => ({ ...f, full_name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                    pErrors.full_name ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
                  }`}
                />
                {pErrors.full_name && <p className="text-xs text-red-600 mt-1">{pErrors.full_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Correo electrónico *</label>
                <input
                  type="email"
                  value={pForm.email}
                  onChange={(e) => setPForm((f) => ({ ...f, email: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                    pErrors.email ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
                  }`}
                />
                {pErrors.email && <p className="text-xs text-red-600 mt-1">{pErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono *</label>
                <input
                  type="text"
                  value={pForm.phone}
                  onChange={(e) => setPForm((f) => ({ ...f, phone: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                    pErrors.phone ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
                  }`}
                />
                {pErrors.phone && <p className="text-xs text-red-600 mt-1">{pErrors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo *</label>
                <select
                  value={pForm.type}
                  onChange={(e) => setPForm((f) => ({ ...f, type: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                    pErrors.type ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
                  }`}
                >
                  {PQR_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {pErrors.type && <p className="text-xs text-red-600 mt-1">{pErrors.type}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Asunto *</label>
              <input
                type="text"
                value={pForm.subject}
                onChange={(e) => setPForm((f) => ({ ...f, subject: e.target.value }))}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                  pErrors.subject ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
                }`}
              />
              {pErrors.subject && <p className="text-xs text-red-600 mt-1">{pErrors.subject}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripción *</label>
              <textarea
                rows={5}
                value={pForm.description}
                onChange={(e) => setPForm((f) => ({ ...f, description: e.target.value }))}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                  pErrors.description ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:ring-[#f4a261]"
                }`}
              />
              {pErrors.description && <p className="text-xs text-red-600 mt-1">{pErrors.description}</p>}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={pSending}
                className={`px-5 py-2 rounded-md text-white font-semibold ${
                  pSending ? "bg-gray-400" : "bg-[#28364e] hover:opacity-90"
                }`}
              >
                {pSending ? "Enviando..." : "Radicar PQR"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
