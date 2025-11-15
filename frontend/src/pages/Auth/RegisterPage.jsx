import React from "react";
import { Link } from "react-router-dom";

export default function RegisterPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Градиентный фон */}
      <div className="absolute inset-0 bg-gradient-to-tl from-[rgba(98,90,228,0.15)] via-[rgba(139,92,246,0.1)] to-[rgba(255,255,255,1)] animate-gradient pointer-events-none"></div>
      
      {/* Декоративные элементы - скрыты на мобильных */}
      <div className="hidden lg:block absolute top-20 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float pointer-events-none"></div>
      <div className="hidden lg:block absolute bottom-20 left-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float pointer-events-none" style={{ animationDelay: "2s" }}></div>
      <div className="hidden lg:block absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float pointer-events-none" style={{ animationDelay: "4s" }}></div>

      {/* Header */}
      <header className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 border-b border-slate-200/50 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <img
              src="/Logo.svg"
              alt="Логотип"
              className="w-8 h-8 sm:w-10 sm:h-10 object-cover"
            />
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-slate-800 via-primary to-purple-600 bg-clip-text text-transparent">
            MAX EDU
          </span>
        </div>

        <span className="hidden sm:inline text-2xl font-medium text-slate-400">-</span>
        <span className="text-sm sm:text-lg font-medium text-slate-600 text-center sm:text-left">
          Система управления образовательными процессами
        </span>
      </header>

      {/* Центрированная форма */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] sm:min-h-[calc(100vh-80px)] px-4 py-8 sm:py-12">
        <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 lg:p-10 rounded-2xl lg:rounded-3xl shadow-xl w-full max-w-md border-2 border-slate-200/50 relative overflow-hidden animate-scale-in group">
          {/* Декоративный градиент - скрыт на мобильных */}
          <div className="hidden lg:block absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="hidden lg:block absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Регистрация
            </h1>

            <form className="flex flex-col space-y-4 sm:space-y-5">
              <input
                type="text"
                placeholder="Имя"
                className="w-full px-4 py-3 sm:py-3.5 text-base rounded-xl bg-white border-2 border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm hover:shadow-md"
              />
              <input
                type="text"
                placeholder="Фамилия"
                className="w-full px-4 py-3 sm:py-3.5 text-base rounded-xl bg-white border-2 border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm hover:shadow-md"
              />
              <input
                type="text"
                placeholder="Учебная группа"
                className="w-full px-4 py-3 sm:py-3.5 text-base rounded-xl bg-white border-2 border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm hover:shadow-md"
              />
              <input
                type="email"
                placeholder="E-mail"
                className="w-full px-4 py-3 sm:py-3.5 text-base rounded-xl bg-white border-2 border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm hover:shadow-md"
              />
              <input
                type="password"
                placeholder="Пароль"
                className="w-full px-4 py-3 sm:py-3.5 text-base rounded-xl bg-white border-2 border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm hover:shadow-md"
              />

              <Link to="/" className="w-full block">
                <button
                  type="submit"
                  className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] relative overflow-hidden group text-base"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <span className="relative z-10">Зарегистрироваться</span>
                </button>
              </Link>
            </form>

            <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-center text-slate-400">
              Уже есть аккаунт?{" "}
              <Link
                to="/login"
                className="text-primary hover:underline transition-all"
              >
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
