import { Link } from "react-router-dom";
import { Sparkles, ShieldCheck, Users, Star } from "lucide-react";

export default function WhoWeAre() {
  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50 via-white to-white" />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-200/20 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-20">
          <p className="text-xs font-semibold text-orange-500 uppercase tracking-[0.2em] mb-3">
            Quiénes somos
          </p>

          <h1 className="text-3xl md:text-5xl font-extrabold text-[#28364e] leading-tight mb-4">
            Somos Bizu: un espacio seguro donde clientes y talentos locales se encuentran.
          </h1>

          <p className="max-w-3xl text-gray-600 text-base md:text-lg leading-relaxed">
            Bizu nació con una idea simple pero poderosa: hacer más fácil y confiable la búsqueda
            de servicios en Puerto Gaitán y otros municipios de Colombia. Sabemos que aquí todo
            funciona por recomendación, por “quién conoce a quién”, y a veces eso deja por fuera
            a personas talentosas que trabajan por su cuenta o a negocios que quieren crecer.
          </p>

          {/* chips */}
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 border px-3 py-1 text-xs font-semibold text-[#28364e] shadow-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Confianza y seguridad
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 border px-3 py-1 text-xs font-semibold text-[#28364e] shadow-sm">
              <Users className="h-4 w-4 text-orange-500" />
              Talento local
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 border px-3 py-1 text-xs font-semibold text-[#28364e] shadow-sm">
              <Star className="h-4 w-4 text-yellow-500" />
              Reseñas reales
            </span>
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to="/search"
              className="inline-flex items-center justify-center rounded-xl bg-[#f4a261] px-5 py-3 text-sm font-semibold text-white shadow hover:bg-[#e07b19] transition"
            >
              Buscar servicios
            </Link>

            <Link
              to="/register/provider"
              className="inline-flex items-center justify-center rounded-xl border border-orange-200 bg-white px-5 py-3 text-sm font-semibold text-[#28364e] shadow-sm hover:bg-orange-50 transition"
            >
              Registrar mi negocio
            </Link>
          </div>
        </div>
      </section>

      {/* MISIÓN / VISIÓN */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-6xl mx-auto px-4 grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-2xl bg-orange-100 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-[#28364e]">Nuestra misión</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Conectar a las personas con los servicios que necesitan de forma rápida, segura y
              confiable, mientras damos visibilidad real a quienes trabajan por su cuenta.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-[#28364e]">Nuestra visión</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Convertirnos en la plataforma de servicios locales más grande y confiable de la región,
              apoyando el crecimiento de miles de emprendedores, negocios e independientes.
            </p>
          </div>
        </div>
      </section>

      {/* QUÉ HACEMOS */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#28364e]">
              Qué hacemos en Bizu
            </h2>
            <p className="text-sm text-gray-600 mt-2 max-w-2xl">
              Un directorio moderno y accesible para negocios, emprendimientos y personas con un
              oficio o servicio para ofrecer.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "Más visibilidad",
              text: "Ayudamos a que más personas conozcan tu negocio o servicio personal.",
              icon: <Users className="h-5 w-5 text-orange-500" />,
              bg: "bg-orange-50",
            },
            {
              title: "Información clara",
              text: "Permitimos que los clientes vean tu información de forma clara y confiable.",
              icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />,
              bg: "bg-emerald-50",
            },
            {
              title: "Reputación transparente",
              text: "Creamos un espacio donde la reputación es transparente mediante reseñas reales.",
              icon: <Star className="h-5 w-5 text-yellow-600" />,
              bg: "bg-yellow-50",
            },
            {
              title: "Búsqueda rápida",
              text: "Hacemos que encontrar un servicio sea rápido, fácil y seguro.",
              icon: <Sparkles className="h-5 w-5 text-orange-500" />,
              bg: "bg-orange-50",
            },
          ].map((i) => (
            <div
              key={i.title}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-2xl ${i.bg} flex items-center justify-center`}>
                  {i.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#28364e]">{i.title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed mt-1">{i.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* POR QUÉ EXISTIMOS */}
      <section className="py-16 bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#28364e] mb-4">
            Por qué existimos
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            Porque en nuestro municipio hay muchísimo talento, pero poca visibilidad. Porque miles
            de personas no encuentran clientes simplemente porque nadie las recomienda. Porque los
            clientes buscan confianza, y los trabajadores necesitan oportunidades.
            <br /><br />
            <span className="font-semibold">Bizu une estos dos mundos.</span>
          </p>
        </div>
      </section>

      {/* COMPROMISO + CTA */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="rounded-3xl border border-gray-100 bg-white p-8 md:p-10 shadow-sm">
          <div className="grid gap-8 md:grid-cols-[1.3fr,1fr] items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#28364e] mb-3">
                Nuestro compromiso
              </h2>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Aportar al desarrollo local, impulsar el talento, y construir una red de servicios
                donde todos puedan crecer: negocios establecidos, nuevos emprendedores y personas
                que trabajan con sus manos y su corazón.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                to="/register/provider"
                className="inline-flex items-center justify-center rounded-2xl bg-[#28364e] px-5 py-3 text-sm font-semibold text-white shadow hover:opacity-95 transition"
              >
                Crear perfil de Servidor
              </Link>
              <Link
                to="/register/client"
                className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#28364e] hover:bg-gray-50 transition"
              >
                Crear cuenta de Cliente
              </Link>
              <Link
                to="/contacto"
                className="inline-flex items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 px-5 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-100 transition"
              >
                Contáctanos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
