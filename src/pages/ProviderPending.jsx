import { Link } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";

export default function ProviderPending() {
  const WHATSAPP_NUMBER = "573125156964";
  const msg = encodeURIComponent(
    "Hola, ya creé mi cuenta como Servidor. ¿Me confirmas el estado de la revisión?"
  );

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md border p-8">
        <p className="text-xs font-semibold text-orange-500 uppercase tracking-[0.2em] mb-2">
          Registro completado
        </p>

        <h1 className="text-2xl md:text-3xl font-extrabold text-[#28364e] mb-3">
          ¡Cuenta creada correctamente! ✅
        </h1>

        <p className="text-sm md:text-base text-gray-600 mb-4">
          Tu cuenta de <span className="font-semibold">Servidor</span> fue creada y ahora
          quedará <span className="font-semibold">pendiente de revisión</span>.
          Nuestro equipo de <span className="font-semibold">Bizu</span> la validará y la activará
          lo antes posible.
        </p>

        <div className="rounded-xl border border-orange-100 bg-orange-50 p-4 text-sm text-[#28364e] mb-6">
          Mientras tanto, si necesitas ayuda o quieres acelerar la validación, puedes escribirnos.
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-[#f4a261] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#e07b19] transition"
          >
            Ir al inicio
          </Link>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-white px-4 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-50 transition"
          >
            <FaWhatsapp className="h-4 w-4" />
            Hablar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
