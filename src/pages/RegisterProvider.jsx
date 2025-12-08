// src/pages/RegisterProvider.jsx
import { Link } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";

export default function RegisterProvider() {
  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hero / texto de marketing */}
        <section className="mb-8 grid gap-6 md:grid-cols-[1.4fr,1fr] items-center">
          <div>
            <p className="text-xs font-semibold text-orange-500 uppercase tracking-[0.2em] mb-2">
              Servidores · Negocios locales
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#28364e] leading-tight mb-3">
              Registra tu negocio <span className="text-[#f4a261]">GRATIS</span> en el directorio
              de servicios más grande de Puerto Gaitán.
            </h1>
            <p className="text-sm md:text-base text-gray-600 mb-4">
              Consigue más clientes, más visibilidad y más oportunidades, todo en un solo lugar.
              Crea tu perfil profesional en minutos y muestra tu trabajo a cientos de personas.
            </p>

            <ul className="text-sm text-gray-700 space-y-1 mb-4">
              <li>• Muestra fotos de tus mejores trabajos.</li>
              <li>• Recibe reseñas y construye tu reputación.</li>
              <li>• Destaca en tu categoría y en tu ciudad.</li>
            </ul>

            <p className="text-xs text-gray-500">
              ¿Solo quieres contratar servicios?{" "}
              <Link to="/register/client" className="text-[#f4a261] underline">
                Crea una cuenta de Cliente aquí
              </Link>
              .
            </p>
          </div>

          {/* Lado derecho: mini-card resumen (solo en pantallas medianas en adelante) */}
          <div className="hidden md:block">
            <div className="bg-white rounded-xl shadow p-4 border border-orange-100">
              <h2 className="text-sm font-semibold text-[#28364e] mb-2">
                ¿Qué incluye tu perfil?
              </h2>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>✓ Nombre del negocio y foto de perfil</li>
                <li>✓ Categoría, servicios y ciudad</li>
                <li>✓ Horario de atención y rango de precios</li>
                <li>✓ Galería de fotos de tus trabajos</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Formulario de registro de proveedor */}
        <RegisterForm role="provider" />
      </div>
    </div>
  );
}
