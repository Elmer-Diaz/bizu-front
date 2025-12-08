// src/pages/RegisterClient.jsx
import { Link } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";

export default function RegisterClient() {
  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hero para clientes */}
        <section className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold text-orange-500 uppercase tracking-[0.2em] mb-2">
            Clientes · Usuarios
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#28364e] leading-tight mb-3">
            Crea tu cuenta y encuentra servidores de confianza en Puerto Gaitán.
          </h1>
          <p className="text-sm md:text-base text-gray-600 mb-4">
            Compara perfiles, revisa reseñas y contrata servicios de forma rápida y segura.
          </p>
          <p className="text-xs text-gray-500">
            ¿Ofreces servicios?{" "}
            <Link to="/register/provider" className="text-[#f4a261] underline">
              Registra tu negocio como Servidor aquí
            </Link>
            .
          </p>
        </section>

        {/* Formulario de registro de cliente */}
        <RegisterForm role="client" />
      </div>
    </div>
  );
}
