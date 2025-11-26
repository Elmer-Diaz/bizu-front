// src/pages/Search.jsx
import { useEffect, useState, useContext, useMemo } from "react";
import { MapPin, ChevronDown, X as CloseIcon, Star, MessageCircle } from "lucide-react";
import { categories } from "../constants/categories";
import { cities } from "../constants/cities";
import { useNavigate } from "react-router-dom";
import api from "../api"; // 🔹 API con tokens automáticos
import { useToast } from "../components/ToastProvider";
import { getErrorMessage } from "../utils/errors";
import { AuthContext } from "../context/AuthContext"; // ⬅️ para saber si hay sesión

const StarReadOnly = ({ value = 0 }) => {
  const filled = Math.round(Number(value) || 0); // redondeo simple
  return (
    <div className="flex items-center gap-1" aria-label={`${value} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-4 h-4 ${n <= filled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{Number(value || 0).toFixed(1)}</span>
    </div>
  );
};

const Search = () => {
  const [providers, setProviders] = useState([]);
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 9;

  const [inlineError, setInlineError] = useState("");

  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();
  const { user } = useContext(AuthContext); // ⬅️ saber si hay sesión

  const fetchProviders = async (page = 1) => {
    setLoading(true);
    setInlineError("");

    let url = `/providers/?page=${page}`;
    if (city) url += `&city=${city}`;
    if (category) url += `&category=${category}`;
    if (search) url += `&search=${encodeURIComponent(search.trim())}`;

    try {
      const res = await api.get(url);
      setProviders(res.data.results || []);
      setTotalPages(Math.ceil((res.data.count || 0) / pageSize));
      setCurrentPage(page);
    } catch (err) {
      const msg = getErrorMessage(err, "Error al cargar proveedores.");
      setProviders([]);
      setInlineError(msg);
      toastError(msg, { duration: 7000 });
      //console.error("Error al cargar proveedores", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = () => {
    if (!city) {
      const msg = "Por favor selecciona una ciudad antes de aplicar filtros.";
      setInlineError(msg);
      toastError(msg);
      return;
    }
    fetchProviders(1);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* FILTROS */}
      <section className="bg-white py-6 shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            {/* Buscar */}
            <input
              type="text"
              placeholder="Buscar servicio o trabajador..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleFilter();
              }}
            />

            {/* Categoría */}
            <div className="relative w-full md:w-1/4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                <ChevronDown size={16} />
              </div>
            </div>

            {/* Ciudad */}
            <div className="relative w-full md:w-1/4">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              >
                <option value="" disabled hidden>
                  Selecciona una ciudad
                </option>
                {cities.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                <ChevronDown size={16} />
              </div>
            </div>

            {/* Botón Filtrar */}
            <button
              onClick={handleFilter}
              className="bg-orange-400 hover:bg-orange-500 text-white font-semibold px-6 py-2 rounded-lg transition shadow-md"
            >
              Filtrar
            </button>
          </div>

          {/* Banner fijo de error */}
          {inlineError && (
            <div
              role="alert"
              aria-live="assertive"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2"
            >
              <div className="min-w-0">{inlineError}</div>
              <button
                type="button"
                onClick={() => setInlineError("")}
                className="ml-auto -mr-1 rounded p-1 text-red-500 hover:bg-red-100"
                aria-label="Cerrar mensaje de error"
                title="Cerrar"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* RESULTADOS */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Servicios disponibles
          </h2>

          {loading ? (
            <p className="text-center text-gray-500">Cargando...</p>
          ) : providers.length === 0 ? (
            <p className="text-center text-gray-500">
              No se encontraron resultados.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((p) => {
                  const ratingAvg = Number(p.rating_avg || 0);
                  const ratingCount = Number(p.rating_count || 0);
                  const waNumber = (p.phone || "").replace(/\D/g, ""); // ⬅️ requiere que backend envíe phone
                  const canWhatsApp = Boolean(user) && Boolean(waNumber);
                  const waText = encodeURIComponent(`Hola ${p.full_name || ""}, te contacto desde Bizu.`);
                  const waLink = `https://wa.me/${waNumber}?text=${waText}`;

                  return (
                    <div
                      key={p.uuid}
                      className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition"
                    >
                      <div className="text-center">
                        <img
                          src={p.photo || "https://placehold.co/100x100?text=👤"}
                          alt={p.full_name}
                          className="w-20 h-20 rounded-full mx-auto object-cover mb-3"
                        />
                        <h5 className="font-semibold">{p.full_name}</h5>

                        {/* Headline */}
                        {p.headline && (
                          <p className="text-gray-500 text-sm">{p.headline}</p>
                        )}

                        {/* Categoría */}
                        {p.category && (
                          <div className="mt-2 inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                            {p.category}
                          </div>
                        )}

                        {/* Rating */}
                        <div className="mt-2 flex items-center justify-center gap-2">
                          <StarReadOnly value={ratingAvg} />
                          {ratingCount > 0 && (
                            <span className="text-xs text-gray-500">({ratingCount})</span>
                          )}
                        </div>

                        {/* Ciudad */}
                        <p className="text-sm text-orange-500 mt-2 flex justify-center items-center gap-1">
                          <MapPin size={16} /> {p.city}
                        </p>

                        {/* Nota de precios */}
                        {p.pricing_note && (
                          <p className="mt-2 text-sm text-[#28364e] font-medium">
                            {p.pricing_note}
                          </p>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/profile/${p.uuid}`)}
                          className="inline-flex items-center justify-center bg-orange-400 hover:bg-orange-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                        >
                          Ver perfil
                        </button>

                        {canWhatsApp && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:brightness-95 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                            title="Contactar por WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PAGINACIÓN */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-10">
                  <div className="inline-flex items-center space-x-1">
                    {/* Anterior */}
                    <button
                      onClick={() => currentPage > 1 && fetchProviders(currentPage - 1)}
                      className="px-3 py-1 rounded-md bg-white border text-sm disabled:opacity-50"
                      disabled={currentPage === 1}
                    >
                      ←
                    </button>

                    {/* Páginas (compactas con puntos) */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (pageNum) =>
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          Math.abs(pageNum - currentPage) <= 1
                      )
                      .reduce((acc, pageNum, i, arr) => {
                        if (i > 0 && pageNum - arr[i - 1] > 1) acc.push(`dots-${i}`);
                        acc.push(pageNum);
                        return acc;
                      }, [])
                      .map((page) =>
                        typeof page === "string" && page.startsWith("dots") ? (
                          <span key={page} className="px-2 text-gray-400">
                            ...
                          </span>
                        ) : (
                          <button
                            key={`page-${page}`}
                            onClick={() => fetchProviders(page)}
                            className={`px-3 py-1 rounded-md border text-sm font-medium ${
                              currentPage === page
                                ? "bg-orange-400 text-white"
                                : "bg-white hover:bg-orange-100"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}

                    {/* Siguiente */}
                    <button
                      onClick={() => currentPage < totalPages && fetchProviders(currentPage + 1)}
                      className="px-3 py-1 rounded-md bg-white border text-sm disabled:opacity-50"
                      disabled={currentPage === totalPages}
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Search;
