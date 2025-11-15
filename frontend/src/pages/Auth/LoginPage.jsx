import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        navigate("/");
      } else {
        setError(result.error || "Неверное имя пользователя или пароль");
      }
    } catch (err) {
      setError("Произошла ошибка при входе");
    } finally {
      setLoading(false);
    }
  };

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
            {/* Заголовок */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Вход в систему
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">Введите данные для доступа</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl animate-slide-up">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Имя пользователя
                </label>
                <div className="relative">
                  <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Введите имя пользователя"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-base rounded-xl bg-white border-2 border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Пароль
                </label>
                <div className="relative">
                  <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-base rounded-xl bg-white border-2 border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group text-base"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Вход...</span>
                    </>
                  ) : (
                    <>
                      <span>Войти</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
