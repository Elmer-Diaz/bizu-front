import { Wrench, Laptop, Paintbrush, Users, UserPlus, Briefcase, MessageSquare } from 'lucide-react';



export default function Home() {
  return (
    <div className="bg-gray-100 text-[#28364e] font-sans">
      
      {/* HERO */}
      <section className="bg-[#28364e] text-white text-center py-24 px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Conecta con profesionales en Bizu
        </h1>
        <p className="text-lg md:text-xl mb-6">
          Publica tus servicios o encuentra quien te ayude en minutos.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a href="/register" className="bg-[#f4a261] hover:bg-[#e07b19] text-white py-3 px-6 rounded text-lg font-semibold">
            Publicar servicio
          </a>
          <a href="/search" className="border border-white py-3 px-6 rounded text-lg font-semibold">
            Ver servicios
          </a>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="py-20 text-center px-4 bg-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">Explora por categoría</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 max-w-5xl mx-auto">
          <div className="flex flex-col items-center">
            <Wrench className="w-14 h-14 text-blue-600" />
            <p className="mt-3 text-lg">Plomería</p>
          </div>
          <div className="flex flex-col items-center">
            <Laptop className="w-14 h-14 text-blue-600" />
            <p className="mt-3 text-lg">Tecnología</p>
          </div>
          <div className="flex flex-col items-center">
            <Paintbrush className="w-14 h-14 text-blue-600" />
            <p className="mt-3 text-lg">Diseño</p>
          </div>
          <div className="flex flex-col items-center">
            <Users className="w-14 h-14 text-blue-600" />
            <p className="mt-3 text-lg">Clases</p>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="py-20 text-center bg-gray-50 px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">¿Cómo funciona Bizu?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          <div>
            <UserPlus className="w-12 h-12 mx-auto text-blue-600" />
            <h5 className="text-xl font-semibold mt-4">1. Crea tu cuenta</h5>
            <p className="text-base mt-1">Registrarse es gratis y solo toma un minuto.</p>
          </div>
          <div>
            <Briefcase className="w-12 h-12 mx-auto text-blue-600" />
            <h5 className="text-xl font-semibold mt-4">2. Publica o busca un servicio</h5>
            <p className="text-base mt-1">Publica lo que ofreces o encuentra profesionales cerca.</p>
          </div>
          <div>
            <MessageSquare className="w-12 h-12 mx-auto text-blue-600" />
            <h5 className="text-xl font-semibold mt-4">3. Conecta y trabaja</h5>
            <p className="text-base mt-1">Habla directo con el trabajador o cliente y concreta.</p>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="py-20 text-center bg-white px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">Lo que dicen nuestros usuarios</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <blockquote className="bg-gray-100 p-6 rounded-lg shadow-sm">
            <p className="italic">"Encontré un técnico en minutos y me solucionó el problema. ¡Excelente plataforma!"</p>
            <footer className="mt-4 text-sm text-gray-600">— Carolina R.</footer>
          </blockquote>
          <blockquote className="bg-gray-100 p-6 rounded-lg shadow-sm">
            <p className="italic">"Publicar mi servicio fue muy fácil. Ya tengo 5 clientes gracias a Bizu."</p>
            <footer className="mt-4 text-sm text-gray-600">— Julián M.</footer>
          </blockquote>
          <blockquote className="bg-gray-100 p-6 rounded-lg shadow-sm">
            <p className="italic">"Me encanta lo simple y rápido que es todo. Muy recomendado."</p>
            <footer className="mt-4 text-sm text-gray-600">— Lorena T.</footer>
          </blockquote>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 text-center bg-[#28364e] text-white px-6">
        <h2 className="text-3xl md:text-4xl mb-4 font-bold">¿Listo para comenzar?</h2>
        <p className="text-lg mb-6">Publica tu servicio o encuentra el profesional ideal en segundos.</p>
        <a href="/register" className="bg-[#f4a261] hover:bg-[#e07b19] text-white py-3 px-6 rounded text-lg font-semibold">
          Unirme a Bizu
        </a>
      </section>
    </div>
  );
}
