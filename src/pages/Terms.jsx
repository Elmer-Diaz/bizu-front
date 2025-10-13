// src/pages/Terms.jsx
export default function Terms() {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white border rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-[#28364e] mb-2">
          Términos y Condiciones de Uso
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Última actualización: 12 de Octubre de 2025
        </p>

        <p className="text-gray-700 mb-6">
          Bienvenido/a a Bizu Servicios, una plataforma que conecta a clientes con emprendedores y prestadores de servicios.
          Al usar nuestra app, aceptas los siguientes términos y condiciones:
        </p>

        <ol className="list-decimal pl-6 space-y-5 text-gray-800">
          <li>
            <p className="font-semibold">Naturaleza del servicio</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Bizu Servicios es una plataforma intermediaria que facilita el contacto entre usuarios y prestadores de servicios.
                No somos parte de las transacciones, acuerdos ni relaciones contractuales entre clientes y emprendedores.
              </li>
            </ul>
          </li>

          <li>
            <p className="font-semibold">Calificaciones y comentarios</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Los usuarios pueden dejar opiniones y calificaciones que ayuden a otros a tomar decisiones informadas.</li>
              <li>Bizu Servicios se reserva el derecho de eliminar comentarios ofensivos, falsos o que incumplan estas condiciones.</li>
            </ul>
          </li>

          <li>
            <p className="font-semibold">Prohibiciones</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Está prohibido ofrecer o solicitar servicios ilegales, violentos, fraudulentos o que violen la ley.</li>
              <li>También se prohíbe el uso de la plataforma con fines de acoso, extorsión o manipulación.</li>
            </ul>
          </li>

          <li>
            <p className="font-semibold">Suspensión o bloqueo de usuarios</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Bizu podrá suspender o bloquear temporal o permanentemente a usuarios que:</li>
              <li className="pl-4">a) Incumplan estos términos.</li>
              <li className="pl-4">b) Sean reportados por comportamiento inadecuado, fraude o mala fe.</li>
              <li className="pl-4">c) Manipulen el sistema de reputación o interfieran con el funcionamiento de la app.</li>
            </ul>
          </li>

          <li>
            <p className="font-semibold">Modificaciones</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Estos términos pueden actualizarse en cualquier momento. Te notificaremos por la app o correo electrónico.
                El uso continuado después de una modificación constituye aceptación de los nuevos términos.
              </li>
            </ul>
          </li>

          <li>
            <p className="font-semibold">Jurisdicción</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Cualquier disputa será resuelta bajo las leyes de Colombia.</li>
            </ul>
          </li>
        </ol>

        <p className="text-gray-700 mt-8">
          Si estás de acuerdo con estos términos, puedes continuar usando la plataforma.
        </p>
      </div>
    </div>
  );
}
