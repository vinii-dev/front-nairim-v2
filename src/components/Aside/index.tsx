"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Menu, 
  X, 
  Home, 
  Moon, 
  Sun, 
  PlusCircle,
  Settings,
  LogOut,
  Key,
  UserPlus,
  ChevronDown,
  House,
  Building2,
  UserCheck,
  UserCircle,
  Tag
} from "lucide-react";
import Logo from "../Logo";
import { useAuth } from "@/contexts/AuthContext";

export default function Aside() {
  const [openAside, setOpenAside] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isDarkModeAnimating, setIsDarkModeAnimating] = useState(false);
  const [activeItem, setActiveItem] = useState("/dashboard");
  const submenuRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<HTMLUListElement>(null);

  const { logout } = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (submenuRef.current && !submenuRef.current.contains(event.target as Node)) {
        setOpenSubmenu(false);
      }
    }

    if (openSubmenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openSubmenu]);

  useEffect(() => {
    const currentPath = window.location.pathname;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveItem(currentPath);
  }, []);

  const handleItemClick = (href: string) => {
    setActiveItem(href);
    if (href !== "#") {
      setOpenAside(false);
      setOpenSubmenu(false);
    }
  };

  const handleCadastroClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o clique se propague
    setOpenSubmenu(!openSubmenu);
  };

  const handleDarkModeToggle = () => {
    setIsDarkModeAnimating(true);
    setDarkMode(!darkMode);
    
    setTimeout(() => {
      setIsDarkModeAnimating(false);
    }, 300);
  };

  const menuItems = [
    { href: "/dashboard", icon: Home, label: "Resumo" },
    { 
      href: "#",
      icon: PlusCircle, 
      label: "Cadastrar",
      submenu: [
        { href: "/dashboard/administradores", icon: UserPlus, label: "Administrador" },
        { href: "/dashboard/imoveis", icon: House, label: "Imóvel" },
        { href: "/dashboard/imobiliarias", icon: Building2, label: "Imobiliária" },
        { href: "/dashboard/inquilinos", icon: UserCheck, label: "Inquilinos" },
        { href: "/dashboard/proprietarios", icon: UserCircle, label: "Proprietários" },
        { href: "/dashboard/tipo-imovel", icon: Tag, label: "Tipo Imóvel" },
      ]
    },
    { href: "/dashboard/locacoes", icon: Key, label: "Locações" },
    { href: "/dashboard/configuracoes", icon: Settings, label: "Configurações" },
  ];

  const handleLogout = async () => {
    logout();

    setOpenAside(false);
  };

  return (
    <>
      <button
        className={`fixed top-[8px] left-[10px] z-[1100] bg-white p-2 rounded-md shadow-md transition-all duration-300 hover:opacity-100 ${
          darkMode ? "bg-gray-800 text-white" : "text-[#111]"
        } ${openAside ? "left-[14.25rem]" : "left-[10px]"}`}
        onClick={() => setOpenAside(!openAside)}
      >
        {openAside ? (
          <X size={25} className={darkMode ? "text-black" : ""} />
        ) : (
          <Menu size={25} className={darkMode ? "text-black" : ""} />
        )}
      </button>

      {/* Overlay */}
      {openAside && (
        <div
          className="fixed inset-0 bg-black/50 z-[999] transition-opacity duration-300"
          onClick={() => {
            setOpenAside(false);
            setOpenSubmenu(false);
          }}
        />
      )}

      {/* Aside */}
      <aside
        className={`fixed top-0 left-0 h-full w-[300px] z-[1000] shadow-lg transform transition-transform duration-300 ease-in-out ${
          darkMode ? "bg-[#12101D]" : "bg-white"
        } ${openAside ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full pt-5 px-5 pb-3 items-start">
          <div className="mb-4">
            <Link href="/dashboard">
              <Logo darkMode={darkMode} />
            </Link>
          </div>

          <div className="flex-1 w-full overflow-hidden">
            <nav className="h-full" ref={submenuRef}>
              <ul 
                ref={menuItemsRef}
                className="space-y-2 h-full overflow-y-auto pr-2 custom-scrollbar"
                style={{ maxHeight: "calc(100vh - 200px)" }}
              >
                {menuItems.map((item) => (
                  <li key={item.label} className="relative">
                    {item.submenu ? (
                      <>
                        <button
                          onClick={handleCadastroClick}
                          className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 ${
                            openSubmenu
                              ? darkMode 
                                ? "bg-purple-600 text-white" 
                                : "bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white"
                              : darkMode
                              ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                              : "text-[#666666] hover:bg-gradient-to-r hover:from-[#8B5CF6] hover:to-[#6D28D9] hover:text-white"
                          }`}
                        >
                          <item.icon size={22} className="min-w-[25px]" />
                          {openAside && (
                            <>
                              <span className="ml-3 flex-1 text-left">{item.label}</span>
                              <ChevronDown 
                                size={16} 
                                className={`transition-transform duration-200 ${openSubmenu ? "rotate-180" : ""}`}
                              />
                            </>
                          )}
                        </button>

                        {openSubmenu && openAside && (
                          <div className={`mt-1 ${
                            darkMode ? "bg-gray-800" : "bg-[#e8e8e8]"
                          } rounded-lg shadow-lg overflow-hidden`}>
                            <ul className="space-y-1">
                              {item.submenu.map((subItem) => (
                                <li key={subItem.label}>
                                  <Link
                                    href={subItem.href}
                                    onClick={() => {
                                      setActiveItem(subItem.href);
                                      setOpenAside(false);
                                      setOpenSubmenu(false);
                                    }}
                                    className={`flex items-center p-3 rounded text-sm transition-colors ${
                                      activeItem === subItem.href
                                        ? darkMode
                                          ? "bg-gray-700 text-white"
                                          : "bg-gray-100 text-gray-900"
                                        : darkMode
                                        ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                                  >
                                    <subItem.icon size={18} className="mr-3" />
                                    {subItem.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => handleItemClick(item.href)}
                        className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 ${
                          activeItem === item.href
                            ? darkMode 
                              ? "bg-purple-600 text-white" 
                              : "bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white"
                            : darkMode
                            ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                            : "text-[#666666] hover:bg-gradient-to-r hover:from-[#8B5CF6] hover:to-[#6D28D9] hover:text-white"
                        }`}
                      >
                        <item.icon size={22} className="min-w-[25px]" />
                        {openAside && <span className="ml-3">{item.label}</span>}
                      </Link>
                    )}
                  </li>
                ))}

                {/* Logout */}
                <li>
                  <button
                    onClick={handleLogout}
                    className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 ${
                      darkMode
                        ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                        : "text-[#666666] hover:bg-gradient-to-r hover:from-[#8B5CF6] hover:to-[#6D28D9] hover:text-white"
                    }`}
                  >
                    <LogOut size={22} className="min-w-[25px]" />
                    {openAside && <span className="ml-3">Sair</span>}
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Dark Mode Toggle - Fixo na parte inferior */}
          <div className="w-full pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
            <div className="flex items-center justify-between">
              {openAside && (
                <>
                  <div className="flex items-center gap-3">
                    {darkMode ? (
                      <Moon size={20} className="text-white" />
                    ) : (
                      <Sun size={20} className="text-gray-700" />
                    )}
                    <span className={darkMode ? "text-white" : "text-gray-700"}>
                      {darkMode ? "Dark Mode" : "Light Mode"}
                    </span>
                  </div>
                  <button
                    onClick={handleDarkModeToggle}
                    className="relative w-12 h-6 rounded-full bg-[#37373B] transition-all duration-300 hover:opacity-80"
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 flex items-center justify-center ${
                        darkMode ? "left-7" : "left-1"
                      } ${
                        isDarkModeAnimating ? "scale-110" : "scale-100"
                      }`}
                    >
                      {darkMode ? (
                        <Moon size={10} className="text-gray-800 transition-all duration-300" />
                      ) : (
                        <Sun size={10} className="text-yellow-500 transition-all duration-300" />
                      )}
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Estilos para o scrollbar */}
        <style jsx>{`
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: ${darkMode ? '#4B5563 #1F2937' : '#D1D5DB #F3F4F6'};
          }
          
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: ${darkMode ? '#1F2937' : '#F3F4F6'};
            border-radius: 3px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: ${darkMode ? '#4B5563' : '#D1D5DB'};
            border-radius: 3px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: ${darkMode ? '#6B7280' : '#9CA3AF'};
          }
        `}</style>
      </aside>
    </>
  );
}