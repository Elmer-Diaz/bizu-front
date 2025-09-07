// src/pages/Search.jsx
import { useEffect, useState } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import { categories } from "../constants/categories";
import { cities } from "../constants/cities";
import { useNavigate } from "react-router-dom";
import api from "../api"; // 🔹 API con tokens automáticos
import AlertModal from "../components/AlertModal";

const Search = () => {
  const [providers, setProviders] = useState([]);
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 9;

  // Estado para manejar el modal de alerta
  const [alertData, setAlertData] = useState(null);

  const navigate = useNavigate();

  // Mostrar alerta
  const showAlert = ({ type, title, message }) => {
    setAlertData({ type, title, message });
  };

  // Obtener proveedores
  const fetchProviders = async (page = 1) => {
    setLoading(true);

    let url = `/providers/?page=${page}`;
    if (city) url += `&city=${city}`;
    if (category) url += `&category=${category}`;
    if (search) url += `&search=${search.trim()}`;

    try {
      const res = await api.get(url);
      setProviders(res.data.results || []);
      setTotalPages(Math.ceil(res.data.count / pageSize));
      setCurrentPage(page);
    } catch (err) {
      console.error("Error al cargar proveedores", err);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  // Aplicar filtros
  const handleFilter = () => {
    if (!city) {
      showAlert({
        type: "warning",
        title: "Falta la ciudad",
        message: "Por favor selecciona una ciudad antes de aplicar filtros.",
      });
      return;
    }
    fetchProviders();
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Modal de alerta */}
      {alertData && (
        <AlertModal
          type={alertData.type}
          title={alertData.title}
          message={alertData.message}
          onClose={() => setAlertData(null)}
        />
      )}

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
                {providers.map((user) => (
                  <div
                    key={user.uuid}
                    className="bg-white rounded-xl shadow-md p-5 text-center hover:shadow-lg transition"
                  >
                    <img
                      src={user.photo || "https://placehold.co/100x100?text=👤"}
                      alt={user.full_name}
                      className="w-20 h-20 rounded-full mx-auto object-cover mb-3"
                    />
                    <h5 className="font-semibold">{user.full_name}</h5>
                    <p className="text-gray-500 text-sm">{user.headline}</p>
                    <p className="text-sm text-orange-500 mt-1 flex justify-center items-center gap-1">
                      <MapPin size={16} /> {user.city}
                    </p>
                    <button
                      onClick={() => navigate(`/profile/${user.uuid}`)}
                      className="inline-block mt-3 bg-orange-400 hover:bg-orange-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                    >
                      Ver perfil
                    </button>
                  </div>
                ))}
              </div>

              {/* PAGINACIÓN */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-10">
                  <div className="inline-flex items-center space-x-1">
                    {/* Anterior */}
                    <button
                      onClick={() =>
                        currentPage > 1 && fetchProviders(currentPage - 1)
                      }
                      className="px-3 py-1 rounded-md bg-white border text-sm disabled:opacity-50"
                      disabled={currentPage === 1}
                    >
                      ←
                    </button>

                    {/* Páginas */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (pageNum) =>
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          Math.abs(pageNum - currentPage) <= 1
                      )
                      .reduce((acc, pageNum, i, arr) => {
                        if (i > 0 && pageNum - arr[i - 1] > 1)
                          acc.push(`dots-${i}`);
                        acc.push(pageNum);
                        return acc;
                      }, [])
                      .map((page, idx) =>
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
                      onClick={() =>
                        currentPage < totalPages &&
                        fetchProviders(currentPage + 1)
                      }
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
