import React, { useState } from "react";
import { Outlet, useLocation, NavLink } from "react-router-dom";
import LeftSidebar from "./LeftSideBar";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const location = useLocation();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen text-slate-900 bg-slate-50">
      {/* Мобильный backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Левая панель */}
      <LeftSidebar 
        currentPath={location.pathname} 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Центральная часть */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header с градиентом */}
        <header className="flex items-center justify-between p-4 h-16 mb-0 border-b bg-gradient-to-r from-primary/10 via-purple-500/15 to-indigo-500/10 z-30 relative overflow-hidden">
          {/* Декоративный эффект */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none"></div>
          
          {/* Кнопка гамбургера для мобильных */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-lg bg-white hover:bg-slate-100 border-2 border-slate-200 flex items-center justify-center transition-all duration-300 relative z-10 shadow-md"
            aria-label="Открыть меню"
          >
            <svg
              className={`w-6 h-6 text-slate-700 transition-transform duration-300 ${mobileMenuOpen ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <div className="relative z-10 flex items-center gap-4 lg:gap-6 w-full justify-end">
            <button
              onClick={logout}
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white hover:bg-red-500 border-2 border-slate-200 hover:border-red-500 flex items-center justify-center transition-all duration-300 group relative overflow-hidden shadow-md hover:shadow-lg hover:shadow-red-200"
              title="Выйти"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-400/0 via-red-400/10 to-red-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              <img
                src="/LogoutIcon.svg"
                alt="Выход"
                className="w-5 h-5 lg:w-7 lg:h-7 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 relative z-10 group-hover:brightness-0 group-hover:invert"
              />
            </button>
          </div>
        </header>

        {/* Контент (всё, что под хедером, с градиентом) */}
        <main className="flex-1 overflow-y-auto relative">
          {/* Анимированный градиентный фон */}
          <div className="absolute inset-0 bg-gradient-to-tl from-[rgba(98,90,228,0.15)] via-[rgba(139,92,246,0.1)] to-[rgba(255,255,255,1)] animate-gradient pointer-events-none"></div>
          
          {/* Декоративные элементы - скрыты на мобильных */}
          <div className="hidden lg:block absolute top-20 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float pointer-events-none"></div>
          <div className="hidden lg:block absolute bottom-20 left-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float pointer-events-none" style={{ animationDelay: "2s" }}></div>
          <div className="hidden lg:block absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float pointer-events-none" style={{ animationDelay: "4s" }}></div>
          
          <div className="relative z-10 px-0 py-4 lg:py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
