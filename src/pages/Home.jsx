// src/pages/Home.jsx
import { Link } from "react-router-dom";
import {
  Hammer,
  Scissors,
  Truck,
  Wrench,
  Cpu,
  Layers,
  Palette,
  UserPlus,
  Briefcase,
  MessageSquare,
  Flower2,
  Gift,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { categories } from "../constants/categories";

function iconForCategory(label) {
  const key = label.toLowerCase();

  if (key.includes("construcción") || key.includes("obra")) return Hammer;
  if (key.includes("belleza") || key.includes("cuidado")) return Scissors;
  if (key.includes("domicilios") || key.includes("transporte")) return Truck;
  if (key.includes("reparaciones") || key.includes("hogar")) return Wrench;
  if (key.includes("tecnología") || key.includes("soporte")) return Cpu;

  if (key.includes("artesanías")) return Palette;
  if (key.includes("arreglos") || key.includes("florales")) return Flower2;
  if (key.includes("detalles") || key.includes("regalos")) return Gift;
  if (key.includes("decoración")) return Sparkles;
  if (key.includes("comidas")) return UtensilsCrossed;

  if (key.includes("servicios") || key.includes("varios")) return Layers;

  return Layers;
}

export default function Home() {
  return (
    <div className="bg-gray-100 text-[#28364e] font-sans">
      {/* HERO */}
      <section className="bg-[#28364e] text-white text-center py-18 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#f4a261] mb-3">
            Puerto Gaitán · Servicios locales
          </p>

          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Registra tu negocio o servicio personal <span className="text-[#f4a261]">GRATIS</span> y llega a más
            clientes con Bizu.
          </h1>

          <p className="text-lg md:text-xl mb-2 text-gray-100">
            El directorio de servicios donde los clientes te encuentran en minutos.
            No necesitas tener empresa; si trabajas por tu cuenta, Bizu también es para ti.
          </p>
          <p className="text-sm md:text-base mb-8 text-gray-300">
            Consigue más visibilidad, más contactos y más oportunidades, todo en un solo lugar.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {/* Registrarse como servidor */}
            <Link
              to="/register/provider"
              className="bg-[#f4a261] hover:bg-[#e07b19] text-white py-3 px-6 rounded text-lg font-semibold shadow-md"
            >
              Registrar mi negocio o servicio GRATIS
            </Link>

            {/* Registrarse como cliente */}
            <Link
              to="/register/client"
              className="border border-white py-3 px-6 rounded text-lg font-semibold hover:bg-white hover:text-[#28364e] transition"
            >
              Quiero contratar servicios
            </Link>

            {/* 🔎 Botón para ir directo a buscar */}
            <Link
              to="/search"
              className="bg-white/10 hover:bg-white/20 border border-white/30 py-3 px-6 rounded text-lg font-semibold backdrop-blur-sm"
            >
              Buscar ahora
            </Link>
          </div>

          <p className="mt-4 text-xs text-gray-300">
            Sin costo por registro · Perfil público de tu negocio · Reseñas de clientes reales
          </p>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="py-20 text-center px-4 bg-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">Explora por categoría</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
          {categories.map((cat) => {
            const Icon = iconForCategory(cat.label);
            return (
              <Link
                key={cat.value}
                to={`/search`}
                className="group rounded-xl border hover:shadow-md transition bg-white p-5 flex flex-col items-center"
              >
                <div className="rounded-full p-4 bg-gray-50 group-hover:bg-gray-100 transition">
                  <Icon className="w-8 h-8 text-[#28364e]" />
                </div>
                <p className="mt-3 text-sm font-semibold">{cat.label}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="py-20 text-center bg-gray-50 px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">¿Cómo funciona Bizu?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          <div>
            <UserPlus className="w-12 h-12 mx-auto text-blue-600" />
            <h5 className="text-xl font-semibold mt-4">1. Crea tu cuenta</h5>
            <p className="text-base mt-1">
              Registrarse es gratis y solo toma un minuto.
            </p>
          </div>
          <div>
            <Briefcase className="w-12 h-12 mx-auto text-blue-600" />
            <h5 className="text-xl font-semibold mt-4">
              2. Publica o busca un servicio
            </h5>
            <p className="text-base mt-1">
              Publica lo que ofreces o encuentra profesionales cerca.
            </p>
          </div>
          <div>
            <MessageSquare className="w-12 h-12 mx-auto text-blue-600" />
            <h5 className="text-xl font-semibold mt-4">3. Conecta y trabaja</h5>
            <p className="text-base mt-1">
              Habla directo con el trabajador o cliente y concreta.
            </p>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="py-20 text-center bg-white px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">
          Lo que dicen nuestros usuarios
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <blockquote className="bg-gray-100 p-6 rounded-lg shadow-sm">
            <p className="italic">
              "Encontré un técnico en minutos y me solucionó el problema. ¡Excelente plataforma!"
            </p>
            <footer className="mt-4 text-sm text-gray-600">— Carolina R.</footer>
          </blockquote>
          <blockquote className="bg-gray-100 p-6 rounded-lg shadow-sm">
            <p className="italic">
              "Publicar mi servicio fue muy fácil. Ya tengo 5 clientes gracias a Bizu."
            </p>
            <footer className="mt-4 text-sm text-gray-600">— Julián M.</footer>
          </blockquote>
          <blockquote className="bg-gray-100 p-6 rounded-lg shadow-sm">
            <p className="italic">
              "Me encanta lo simple y rápido que es todo. Muy recomendado."
            </p>
            <footer className="mt-4 text-sm text-gray-600">— Lorena T.</footer>
          </blockquote>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 text-center bg-[#28364e] text-white px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl mb-4 font-bold">
            ¿Listo para conseguir más clientes?
          </h2>
          <p className="text-lg mb-2">
            Registra tu negocio completamente GRATIS y empieza a aparecer donde te están buscando.
          </p>
          <p className="text-sm mb-8 text-gray-200">
            También puedes crear una cuenta como cliente para encontrar profesionales de confianza.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register/provider"
              className="bg-[#f4a261] hover:bg-[#e07b19] text-white py-3 px-6 rounded text-lg font-semibold shadow-md"
            >
              Soy Servidor · Quiero aparecer en Bizu
            </Link>
            <Link
              to="/register/client"
              className="border border-white py-3 px-6 rounded text-lg font-semibold hover:bg-white hover:text-[#28364e] transition"
            >
              Soy Cliente · Quiero contratar
            </Link>
            <Link
              to="/search"
              className="bg-white/10 hover:bg-white/20 border border-white/30 py-3 px-6 rounded text-lg font-semibold backdrop-blur-sm"
            >
              Ver servidores ahora
            </Link>
          </div>

          <p className="mt-4 text-xs text-gray-300">
            Registro sin costo · Puedes editar tu perfil cuando quieras
          </p>
        </div>
      </section>
    </div>
  );
}
