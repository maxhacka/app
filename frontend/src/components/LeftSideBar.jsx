import React, { useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LeftSidebar({ currentPath, mobileMenuOpen, setMobileMenuOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Закрываем мобильное меню при изменении маршрута
  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [location.pathname]);

  // Закрываем меню при клике на ссылку
  const handleLinkClick = () => {
    if (setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  // Иконки для разделов
  const getSectionIcon = (id, isActive) => {
    const iconClass = `w-6 h-6 ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-primary'}`;
    
    switch (id) {
      case "management":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case "timetable":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "events":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
          </svg>
        );
      case "certificates":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "applicants":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case "library":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Разделы системы (бывшие microservices)
  const sections = [
    {
      id: "management",
      name: "Управление",
    },
    {
      id: "timetable",
      name: "Расписание занятий",
    },
    {
      id: "events",
      name: "Мероприятия",
    },
    {
      id: "certificates",
      name: "Справки",
    },
    {
      id: "applicants",
      name: "Абитуриентам",
    },
    {
      id: "library",
      name: "Библиотека",
    },
  ];

  // Определяем активный путь
  const isActiveRoot = location.pathname === `/`;

  return (
    <>
      {/* Мобильное меню - выдвижное */}
      <aside className={`
        fixed left-0 top-0 h-screen w-64 bg-white/95 backdrop-blur-sm border-r-2 border-slate-200 shadow-xl z-50
        flex flex-col
        transition-transform duration-300 ease-in-out
        lg:fixed lg:h-screen lg:translate-x-0 lg:z-auto
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      {/* Декоративный градиент */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
      
      {/* Верхняя часть с лого и меню */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {/* Лого */}
        <Link to="/" onClick={handleLinkClick} className="block group relative z-10">
          <div className="flex items-center pb-4 mb-6 space-x-2 lg:space-x-3 border-b-2 border-slate-200 rounded-lg px-2 py-2">
            <div className="relative">
              <img 
                src="/Logo.svg" 
                alt="Логотип" 
                className="w-10 h-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 relative z-10" 
              />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="text-lg lg:text-xl font-black bg-gradient-to-r from-slate-800 via-primary to-purple-600 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105">
              MAX EDU
            </div>
          </div>
        </Link>

        {/* Список разделов */}
        <div className="mt-3">
          <h3 className="mb-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">
            Меню
          </h3>
          <ul className="space-y-2">
            {sections.map((section, index) => {
              const isActive = location.pathname === `/section/${section.id}`;

              return (
                <li 
                  key={section.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <NavLink
                    to={`/section/${section.id}`}
                    onClick={handleLinkClick}
                    className={`
                      flex items-center px-3 lg:px-4 py-2.5 lg:py-3 text-sm lg:text-base font-medium rounded-xl
                      transition-all duration-300 ease-in-out
                      group relative overflow-hidden
                      ${
                        isActive
                          ? "bg-primary text-white shadow-md shadow-primary/30 scale-105"
                          : "bg-white text-slate-700 border-2 border-slate-200 hover:border-primary/50 hover:bg-slate-50 hover:shadow-md hover:scale-[1.02]"
                      }
                    `}
                  >
                    {/* Активный индикатор */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full animate-slide-in-left"></div>
                    )}
                    
                    {/* Иконка */}
                    <div className={`
                      flex items-center justify-center mr-3 rounded-lg p-1.5 relative
                      transition-all duration-300
                      ${isActive 
                        ? "bg-white/20 shadow-lg" 
                        : "bg-slate-100 group-hover:bg-gradient-to-br group-hover:from-primary/10 group-hover:to-purple-500/10"
                      }
                    `}>
                      <div className={`absolute inset-0 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm ${isActive ? "opacity-100" : ""}`}></div>
                      <div className={`transition-all duration-300 relative z-10 ${
                        isActive ? "scale-110" : "group-hover:scale-110 group-hover:rotate-3"
                      }`}>
                        {getSectionIcon(section.id, isActive)}
                      </div>
                    </div>
                    
                    {/* Название */}
                    <span className="flex-1 transition-all duration-300">
                      {section.name}
                    </span>
                    
                    {/* Стрелка для активного элемента */}
                    {isActive && (
                      <svg 
                        className="w-4 h-4 ml-2 transition-transform duration-300" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Блок пользователя - зафиксирован внизу */}
      <div className="flex-shrink-0 p-4 lg:p-6 pt-4 border-t-2 border-slate-200 bg-white/95 backdrop-blur-sm">
        <NavLink 
          to="/profile"
          onClick={handleLinkClick}
          className="flex items-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border-2 border-transparent hover:border-primary/30 transition-all duration-300 group"
        >
          {/* Фото профиля */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full ring-2 ring-slate-200 group-hover:ring-primary/50 transition-all duration-300 group-hover:scale-105 bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <svg 
                className="w-7 h-7 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                />
              </svg>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>

          {/* Имя и роль */}
          <div className="flex flex-col ml-3 flex-1 min-w-0">
            <span className="text-sm font-semibold text-slate-800 transition-colors duration-300 group-hover:text-primary truncate">
              {user?.username || "Пользователь"}
            </span>
            <span className="text-xs text-slate-500 truncate">
              {user?.role || "admin"}
            </span>
          </div>
          
          {/* Иконка настроек */}
          <svg 
            className="w-5 h-5 text-slate-400 group-hover:text-primary transition-all duration-300 group-hover:rotate-90 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </NavLink>
      </div>
    </aside>
    </>
  );
}
