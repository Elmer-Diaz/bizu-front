// src/components/Navbar.jsx
import { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, User, MessageCircle } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const dropdownRef = useRef();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userLinks = (
    <>
      <Link
        to={`/profile/${user?.uuid}`}
        onClick={() => { setDropdownOpen(false); setIsOpen(false); }}
        className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
      >
        Ver perfil
      </Link>

      <Link
        to="/account/edit"
        onClick={() => { setDropdownOpen(false); setIsOpen(false); }}
        className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
      >
        Editar cuenta
      </Link>

      <Link
        to="/change-password"
        onClick={() => { setDropdownOpen(false); setIsOpen(false); }}
        className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
      >
        Cambiar contraseña
      </Link>

      {/* Mis chats: cliente y proveedor pueden entrar */}
      <Link
        to="/chats"
        onClick={() => { setDropdownOpen(false); setIsOpen(false); }}
        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
      >
        <MessageCircle className="w-4 h-4 text-[#28364e]" />
        <span>Mis chats</span>
      </Link>

      {user?.role === "admin" && (
        <>
          <div className="px-4 py-2 text-xs uppercase tracking-wide text-gray-400">
            Admin
          </div>

          <Link
            to="/accounts-list"
            onClick={() => { setDropdownOpen(false); setIsOpen(false); }}
            className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
          >
            Cuentas
          </Link>

          {/* NUEVOS: enlaces admin */}
          <Link
            to="/admin/pqr"
            onClick={() => { setDropdownOpen(false); setIsOpen(false); }}
            className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
          >
            PQR
          </Link>
          <Link
            to="/admin/contact-messages"
            onClick={() => { setDropdownOpen(false); setIsOpen(false); }}
            className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
          >
            Mensajes de contacto
          </Link>
        </>
      )}

      <button
        onClick={() => { handleLogout(); setDropdownOpen(false); setIsOpen(false); }}
        className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
      >
        <svg
          className="w-4 h-4 mr-2 text-red-500"
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" />
        </svg>
        Cerrar sesión
      </button>
    </>
  );

  return (
    <nav className="bg-[#28364e] text-white w-full shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-white">
            <img src="/logo.png" alt="Bizu Logo" className="w-8 h-8 object-contain" />
            Bizu
          </Link>

          {/* Desktop menu */}
          <ul className="hidden md:flex gap-6 items-center text-base">
            <li>
              <Link to="/" className="hover:text-[#f4a261]">Inicio</Link>
            </li>
            <li>
              <Link to="/search" className="hover:text-[#f4a261]">Buscar</Link>
            </li>
            <li>
              <Link to="/quienes-somos" className="hover:text-[#f4a261]">
                Quiénes somos
              </Link>
            </li>
            <li>
              <Link to="/contacto" className="hover:text-[#f4a261]">Contáctanos</Link>
            </li>

            {user ? (
              <li className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  {user.profile?.photo ? (
                    <img
                      src={user.profile.photo}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full border object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full border bg-white flex items-center justify-center">
                      <User className="text-[#28364e] w-5 h-5" />
                    </div>
                  )}
                  <ChevronDown size={18} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white text-gray-800 rounded-xl shadow-lg z-50 border border-gray-200">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold">{user.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    {userLinks}
                  </div>
                )}
              </li>
            ) : (
              <li>
                <Link to="/login" className="hover:text-[#f4a261]">Iniciar sesión</Link>
              </li>
            )}
          </ul>

          {/* Mobile toggle */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <ul className="md:hidden flex flex-col bg-[#28364e] text-white rounded-lg shadow-lg pb-4">
            <li>
              <Link to="/" className="block px-4 py-2 hover:bg-[#f4a261] hover:text-white">Inicio</Link>
            </li>
            <li>
              <Link
                to="/search"
                className="block px-4 py-2 hover:bg-[#f4a261] hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                Buscar
              </Link>
            </li>
            <li>
              <Link
                to="/quienes-somos"
                className="block px-4 py-2 hover:bg-[#f4a261] hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                Quiénes somos
              </Link>
            </li>

            <li>
              <Link
                to="/contacto"
                className="block px-4 py-2 hover:bg-[#f4a261] hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                Contáctanos
              </Link>
            </li>

            {user ? (
              <>
                <li>
                  <Link
                    to={`/profile/${user?.uuid}`}
                    className="block px-4 py-2 hover:bg-[#f4a261]"
                    onClick={() => setIsOpen(false)}
                  >
                    Ver perfil
                  </Link>
                </li>
                <li>
                  <Link
                    to="/account/edit"
                    className="block px-4 py-2 hover:bg-[#f4a261]"
                    onClick={() => setIsOpen(false)}
                  >
                    Editar cuenta
                  </Link>
                </li>
                <li>
                  <Link
                    to="/change-password"
                    className="block px-4 py-2 hover:bg-[#f4a261]"
                    onClick={() => setIsOpen(false)}
                  >
                    Cambiar contraseña
                  </Link>
                </li>

                {/* Mis chats: cliente y proveedor pueden entrar */}
                <li>
                  <Link
                    to="/chats"
                    className="block px-4 py-2 hover:bg-[#f4a261]"
                    onClick={() => setIsOpen(false)}
                  >
                    Mis chats
                  </Link>
                </li>

            {user?.role === "admin" && (
              <>
                <li className="px-4 pt-2 text-xs uppercase tracking-wide text-white/70">
                  Admin
                </li>
                <li>
                  <Link
                    to="/accounts-list"
                    className="block px-4 py-2 hover:bg-[#f4a261]"
                    onClick={() => setIsOpen(false)}
                  >
                    Cuentas
                  </Link>
                </li>
                {/* NUEVOS: enlaces admin */}
                <li>
                  <Link
                    to="/admin/pqr"
                    className="block px-4 py-2 hover:bg-[#f4a261]"
                    onClick={() => setIsOpen(false)}
                  >
                    PQR
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/contact-messages"
                    className="block px-4 py-2 hover:bg-[#f4a261]"
                    onClick={() => setIsOpen(false)}
                  >
                    Mensajes de contacto
                  </Link>
                </li>
              </>
            )}

            <li>
              <button
                onClick={() => { handleLogout(); setIsOpen(false); }}
                className="w-full text-left px-4 py-2 hover:bg-[#f4a261]"
              >
                Cerrar sesión
              </button>
            </li>
          </>
        ) : (
        <li>
          <Link
            to="/login"
            className="block px-4 py-2 hover:bg-[#f4a261] hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            Iniciar sesión
          </Link>
        </li>
            )}
      </ul>
        )}
    </div>
    </nav >
  );
}
