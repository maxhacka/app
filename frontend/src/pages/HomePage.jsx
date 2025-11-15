import React, { useState, useEffect } from "react";
import staffService from "../services/staffService";
import applicantsService from "../services/applicantsService";
import eventsService from "../services/eventsService";
import certificatesService from "../services/certificatesService";
import libraryService from "../services/libraryService";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    staff: null,
    applicants: null,
    events: null,
    certificates: null,
    library: null,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadAllStatistics();
  }, []);

  const loadAllStatistics = async () => {
    setLoading(true);
    const stats = {};
    const errs = {};

    const promises = [
      staffService.getStatistics().then(data => ({ service: 'staff', data })).catch(err => ({ service: 'staff', error: err.message })),
      applicantsService.getStatistics().then(data => ({ service: 'applicants', data })).catch(err => ({ service: 'applicants', error: err.message })),
      eventsService.getStatistics().then(data => ({ service: 'events', data })).catch(err => ({ service: 'events', error: err.message })),
      certificatesService.getStatistics().then(data => ({ service: 'certificates', data })).catch(err => ({ service: 'certificates', error: err.message })),
      libraryService.getStatistics().then(data => ({ service: 'library', data })).catch(err => ({ service: 'library', error: err.message })),
    ];

    const results = await Promise.all(promises);
    
    results.forEach(result => {
      if (result.error) {
        errs[result.service] = result.error;
        stats[result.service] = null;
      } else {
        stats[result.service] = result.data;
      }
    });

    setStatistics(stats);
    setErrors(errs);
    setLoading(false);
  };

  if (loading) {
    return (
      <section className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Загрузка статистики...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto space-y-6 lg:space-y-8 p-4 lg:p-6">
      {/* Приветствие */}
      <div className="text-center mb-6 lg:mb-8 animate-slide-up">
        <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3 lg:mb-4 animate-fade-in">
          Добро пожаловать в MAX EDU
      </h1>
        <div className="w-16 lg:w-24 h-1 bg-gradient-to-r from-primary to-purple-600 mx-auto mb-3 lg:mb-4 rounded-full animate-scale-in"></div>
        <p className="text-base lg:text-lg text-slate-600 max-w-2xl mx-auto px-2 animate-slide-up" style={{ animationDelay: "200ms" }}>
          Система управления образовательными процессами. Здесь вы можете управлять расписанием занятий, мероприятиями, библиотекой и многое другое.
        </p>
      </div>

      {/* Преимущества системы */}
      <div className="mb-8 lg:mb-12 animate-fade-in" style={{ animationDelay: "100ms" }}>
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 text-center mb-6 lg:mb-8">
          Преимущества MAX EDU
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 rounded-2xl p-4 lg:p-6 border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-500 group relative overflow-hidden animate-slide-up">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/10 to-blue-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 lg:mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 animate-glow">
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg lg:text-xl font-semibold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors duration-300">Быстро и удобно</h3>
            <p className="text-slate-600 text-xs lg:text-sm relative z-10">
              Единая платформа для управления всеми образовательными процессами
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 via-green-100 to-teal-50 rounded-2xl p-4 lg:p-6 border-2 border-green-200 hover:border-green-400 hover:shadow-xl hover:shadow-green-200/50 transition-all duration-500 group relative overflow-hidden animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/10 to-green-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3 lg:mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 animate-glow">
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg lg:text-xl font-semibold text-slate-800 mb-2 group-hover:text-green-700 transition-colors duration-300">Безопасность</h3>
            <p className="text-slate-600 text-xs lg:text-sm relative z-10">
              Защита данных и контроль доступа на всех уровнях системы
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 via-purple-100 to-indigo-50 rounded-2xl p-4 lg:p-6 border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-200/50 transition-all duration-500 group relative overflow-hidden animate-slide-up" style={{ animationDelay: "200ms" }}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/10 to-purple-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-3 lg:mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 animate-glow">
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg lg:text-xl font-semibold text-slate-800 mb-2 group-hover:text-purple-700 transition-colors duration-300">Аналитика</h3>
            <p className="text-slate-600 text-xs lg:text-sm relative z-10">
              Детальная статистика и отчетность для принятия решений
            </p>
          </div>
        </div>
      </div>

      {/* Основные метрики */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30 rounded-2xl lg:rounded-3xl shadow-xl border-2 border-slate-200 p-4 lg:p-8 animate-slide-up relative overflow-hidden" style={{ animationDelay: "300ms" }}>
        {/* Декоративный градиент - скрыт на мобильных */}
        <div className="hidden lg:block absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="hidden lg:block absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4 lg:mb-6 text-center relative z-10">
          Статистика системы
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 relative z-10">
        {/* Студенты и преподаватели */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl lg:rounded-2xl shadow-md border-2 border-blue-200/50 p-4 lg:p-6 hover:shadow-xl hover:shadow-blue-200/50 hover:border-blue-400 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden animate-scale-in">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="flex items-center justify-between mb-3 lg:mb-4 relative z-10">
            <div className="p-2 lg:p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg lg:rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-xs lg:text-sm text-slate-500 font-medium">Персонал</span>
          </div>
          {errors.staff ? (
            <p className="text-xs lg:text-sm text-red-500 relative z-10">{errors.staff}</p>
          ) : statistics.staff ? (
            <>
              <h3 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 animate-count-up relative z-10">
                {statistics.staff.total_students + statistics.staff.total_teachers || 0}
              </h3>
              <p className="text-xs lg:text-sm text-slate-600 relative z-10">
                {statistics.staff.total_students || 0} студентов, {statistics.staff.total_teachers || 0} преподавателей
              </p>
              <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-slate-200 relative z-10">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Активных:</span>
                  <span className="font-semibold text-green-600 animate-pulse">
                    {statistics.staff.active_students + statistics.staff.active_teachers || 0}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs lg:text-sm text-slate-400 relative z-10">Нет данных</p>
          )}
        </div>

        {/* Абитуриенты */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl lg:rounded-2xl shadow-md border-2 border-green-200/50 p-4 lg:p-6 hover:shadow-xl hover:shadow-green-200/50 hover:border-green-400 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden animate-scale-in" style={{ animationDelay: "100ms" }}>
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="flex items-center justify-between mb-3 lg:mb-4 relative z-10">
            <div className="p-2 lg:p-3 bg-gradient-to-br from-green-100 to-emerald-200 rounded-lg lg:rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-xs lg:text-sm text-slate-500 font-medium">Абитуриенты</span>
          </div>
          {errors.applicants ? (
            <p className="text-xs lg:text-sm text-red-500 relative z-10">{errors.applicants}</p>
          ) : statistics.applicants ? (
            <>
              <h3 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2 animate-count-up relative z-10">
                {statistics.applicants.total_applicants || 0}
              </h3>
              <p className="text-xs lg:text-sm text-slate-600 relative z-10">
                {statistics.applicants.enrolled_applicants || 0} в конкурсе
              </p>
              <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-slate-200 relative z-10">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Новых:</span>
                  <span className="font-semibold text-yellow-600 animate-pulse">
                    {statistics.applicants.new_applicants || 0}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs lg:text-sm text-slate-400 relative z-10">Нет данных</p>
          )}
        </div>

        {/* Мероприятия */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl lg:rounded-2xl shadow-md border-2 border-purple-200/50 p-4 lg:p-6 hover:shadow-xl hover:shadow-purple-200/50 hover:border-purple-400 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden animate-scale-in" style={{ animationDelay: "200ms" }}>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="flex items-center justify-between mb-3 lg:mb-4 relative z-10">
            <div className="p-2 lg:p-3 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-lg lg:rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs lg:text-sm text-slate-500 font-medium">Мероприятия</span>
          </div>
          {errors.events ? (
            <p className="text-xs lg:text-sm text-red-500 relative z-10">{errors.events}</p>
          ) : statistics.events ? (
            <>
              <h3 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2 animate-count-up relative z-10">
                {statistics.events.total_events || 0}
              </h3>
              <p className="text-xs lg:text-sm text-slate-600 relative z-10">
                {statistics.events.published_events || 0} опубликовано
              </p>
              <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-slate-200 relative z-10">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Завершено:</span>
                  <span className="font-semibold text-green-600 animate-pulse">
                    {statistics.events.completed_events || 0}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs lg:text-sm text-slate-400 relative z-10">Нет данных</p>
          )}
        </div>

        {/* Библиотека */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl lg:rounded-2xl shadow-md border-2 border-indigo-200/50 p-4 lg:p-6 hover:shadow-xl hover:shadow-indigo-200/50 hover:border-indigo-400 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden animate-scale-in" style={{ animationDelay: "300ms" }}>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="flex items-center justify-between mb-3 lg:mb-4 relative z-10">
            <div className="p-2 lg:p-3 bg-gradient-to-br from-indigo-100 to-blue-200 rounded-lg lg:rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-xs lg:text-sm text-slate-500 font-medium">Библиотека</span>
          </div>
          {errors.library ? (
            <p className="text-xs lg:text-sm text-red-500 relative z-10">{errors.library}</p>
          ) : statistics.library ? (
            <>
              <h3 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-2 animate-count-up relative z-10">
                {statistics.library.total_books || 0}
              </h3>
              <p className="text-xs lg:text-sm text-slate-600 relative z-10">
                {statistics.library.total_copies || 0} экземпляров
              </p>
              <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-slate-200 relative z-10">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Доступно:</span>
                  <span className="font-semibold text-green-600 animate-pulse">
                    {statistics.library.available_copies || 0}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs lg:text-sm text-slate-400 relative z-10">Нет данных</p>
          )}
        </div>
        </div>
      </div>
    </section>
  );
}
