import { useEffect, useState } from "react";
import { MapPin, ChevronDown, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api"; // ⬅️ nuestro Axios configurado
import { useToast } from "../components/ToastProvider";

const AccountsList = () => {
  const [accounts, setAccounts] = useState([]);
  const [role, setRole] = useState("provider");
  const [isActive, setIsActive] = useState("false");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 9;
  

  const navigate = useNavigate();

  const { success: toastSuccess, error: toastError } = useToast();

  const fetchAccounts = async (page = 1) => {
    setLoading(true);

    try {
      const res = await api.get("/accounts-list/", {
        params: {
          page,
          role,
          is_active: isActive,
          search: searchTerm.trim() || undefined
        }
      });

      setAccounts(res.data.results || []);
      setTotalPages(Math.ceil(res.data.count / pageSize));
      setCurrentPage(page);
    } catch (err) {
      if (err.response?.status === 403) {
        window.location.href = "/";
      } else {
        //console.error("Error al cargar cuentas", err);
        toastError(getErrorMessage(err, "Error al cargar cuentas."));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleFilter = () => {
    fetchAccounts(1);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* FILTROS */}
      <section className="bg-white py-6 shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            {/* BUSCADOR */}
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>

            {/* SELECT ROL */}
            <div className="relative w-full md:w-1/4">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              >
                <option value="admin">Admin</option>
                <option value="client">Cliente</option>
                <option value="provider">Proveedor</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                <ChevronDown size={16} />
              </div>
            </div>

            {/* SELECT ESTADO */}
            <div className="relative w-full md:w-1/4">
              <select
                value={isActive}
                onChange={(e) => setIsActive(e.target.value)}
                className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                <ChevronDown size={16} />
              </div>
            </div>

            {/* BOTÓN */}
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
            Listado de Cuentas
          </h2>

          {loading ? (
            <p className="text-center text-gray-500">Cargando...</p>
          ) : accounts.length === 0 ? (
            <p className="text-center text-gray-500">
              No se encontraron resultados.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map((user) => (
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
                    <p className="text-gray-500 text-sm">{user.email}</p>
                    <p className="text-xs mt-1">
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                        {user.role}
                      </span>
                    </p>
                    <p className="text-sm text-orange-500 mt-1 flex justify-center items-center gap-1">
                      <MapPin size={16} /> {user.city || "Sin ciudad"}
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
                    <button
                      onClick={() =>
                        currentPage > 1 && fetchAccounts(currentPage - 1)
                      }
                      className="px-3 py-1 rounded-md bg-white border text-sm disabled:opacity-50"
                      disabled={currentPage === 1}
                    >
                      ←
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (pageNum) =>
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          Math.abs(pageNum - currentPage) <= 1
                      )
                      .reduce((acc, pageNum, i, arr) => {
                        if (i > 0 && pageNum - arr[i - 1] > 1) acc.push("dots");
                        acc.push(pageNum);
                        return acc;
                      }, [])
                      .map((page, idx) =>
                        page === "dots" ? (
                          <span key={idx} className="px-2 text-gray-400">
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => fetchAccounts(page)}
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

                    <button
                      onClick={() =>
                        currentPage < totalPages &&
                        fetchAccounts(currentPage + 1)
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

export default AccountsList;
