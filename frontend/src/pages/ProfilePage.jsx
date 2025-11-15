import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import staffService from "../services/staffService";
import applicantsService from "../services/applicantsService";
import eventsService from "../services/eventsService";
import certificatesService from "../services/certificatesService";
import libraryService from "../services/libraryService";

export default function ProfilePage() {
  const { user } = useAuth();
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

    // Загружаем статистику из всех микросервисов параллельно
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

  const getRoleLabel = (role) => {
    const labels = {
      admin: "Администратор",
      teacher: "Преподаватель",
      student: "Студент",
      staff: "Сотрудник",
    };
    return labels[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: "bg-purple-100 text-purple-800",
      teacher: "bg-blue-100 text-blue-800",
      student: "bg-green-100 text-green-800",
      staff: "bg-orange-100 text-orange-800",
    };
    return colors[role] || "bg-slate-100 text-slate-800";
  };

  if (loading) {
    return (
      <section className="max-w-5xl mx-auto space-y-6 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-slate-600">Загрузка статистики...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto space-y-4 lg:space-y-6 p-4 lg:p-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between animate-slide-up">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text text-transparent">Профиль администратора</h1>
      </div>

      {/* Информация о пользователе */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl lg:rounded-2xl shadow-xl border-2 border-slate-200 p-4 sm:p-6 lg:p-8 animate-slide-up relative overflow-hidden group">
        {/* Декоративный градиент - скрыт на мобильных */}
        <div className="hidden lg:block absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6 relative z-10">
          {/* Аватар */}
          <div className="relative group/avatar">
            <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden ring-4 ring-slate-200 shadow-xl bg-gradient-to-br from-primary via-purple-600 to-indigo-600 flex items-center justify-center group-hover/avatar:ring-primary/50 group-hover/avatar:scale-105 transition-all duration-500 animate-scale-in">
              <svg 
                className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-white group-hover/avatar:scale-110 transition-transform duration-300" 
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
            <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white animate-pulse shadow-lg"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 blur-xl opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500"></div>
          </div>

          {/* Информация */}
          <div className="flex-1 w-full text-center md:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">{user?.username || "Пользователь"}</h2>
            <span className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getRoleColor(user?.role || "admin")}`}>
              {getRoleLabel(user?.role || "admin")}
            </span>
            {user?.email && (
              <p className="mt-3 text-sm sm:text-base text-slate-600">{user.email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Статистика по микросервисам */}
      <div className="space-y-4 lg:space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Статистика системы</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Управление персоналом */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl lg:rounded-2xl shadow-md border-2 border-blue-200/50 p-4 sm:p-5 lg:p-6 animate-scale-in hover:shadow-xl hover:shadow-blue-200/50 hover:border-blue-400 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden" style={{ animationDelay: "100ms" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 relative z-10">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg sm:rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 group-hover:text-blue-700 transition-colors duration-300">Управление</h3>
            </div>
            {errors.staff ? (
              <p className="text-sm text-red-500 relative z-10">{errors.staff}</p>
            ) : statistics.staff ? (
              <div className="space-y-2 relative z-10">
                <div className="flex justify-between group-hover:translate-x-1 transition-transform duration-300">
                  <span className="text-slate-600">Студентов:</span>
                  <span className="font-semibold text-slate-800 animate-count-up">{statistics.staff.total_students || 0}</span>
                </div>
                <div className="flex justify-between group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: "50ms" }}>
                  <span className="text-slate-600">Преподавателей:</span>
                  <span className="font-semibold text-slate-800 animate-count-up">{statistics.staff.total_teachers || 0}</span>
                </div>
                <div className="flex justify-between group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: "100ms" }}>
                  <span className="text-slate-600">Активных студентов:</span>
                  <span className="font-semibold text-green-600 animate-pulse">{statistics.staff.active_students || 0}</span>
                </div>
                <div className="flex justify-between group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: "150ms" }}>
                  <span className="text-slate-600">Активных преподавателей:</span>
                  <span className="font-semibold text-green-600 animate-pulse">{statistics.staff.active_teachers || 0}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 relative z-10">Нет данных</p>
            )}
          </div>

          {/* Абитуриенты */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl lg:rounded-2xl shadow-md border-2 border-green-200/50 p-4 sm:p-5 lg:p-6 animate-scale-in hover:shadow-xl hover:shadow-green-200/50 hover:border-green-400 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden" style={{ animationDelay: "200ms" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 relative z-10">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-green-100 to-emerald-200 rounded-lg sm:rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 group-hover:text-green-700 transition-colors duration-300">Абитуриенты</h3>
            </div>
            {errors.applicants ? (
              <p className="text-sm text-red-500 relative z-10">{errors.applicants}</p>
            ) : statistics.applicants ? (
              <div className="space-y-2 relative z-10">
                <div className="flex justify-between group-hover:translate-x-1 transition-transform duration-300">
                  <span className="text-slate-600">Всего:</span>
                  <span className="font-semibold text-slate-800 animate-count-up">{statistics.applicants.total_applicants || 0}</span>
                </div>
                <div className="flex justify-between group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: "50ms" }}>
                  <span className="text-slate-600">Новых:</span>
                  <span className="font-semibold text-yellow-600 animate-pulse">{statistics.applicants.new_applicants || 0}</span>
                </div>
                <div className="flex justify-between group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: "100ms" }}>
                  <span className="text-slate-600">В ожидании:</span>
                  <span className="font-semibold text-purple-600 animate-pulse">{statistics.applicants.contacted_applicants || 0}</span>
                </div>
                <div className="flex justify-between group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: "150ms" }}>
                  <span className="text-slate-600">В конкурсе:</span>
                  <span className="font-semibold text-green-600 animate-pulse">{statistics.applicants.enrolled_applicants || 0}</span>
                </div>
                <div className="flex justify-between group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: "200ms" }}>
                  <span className="text-slate-600">Отклоненных:</span>
                  <span className="font-semibold text-red-600 animate-pulse">{statistics.applicants.rejected_applicants || 0}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 relative z-10">Нет данных</p>
            )}
          </div>

          {/* Мероприятия */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl lg:rounded-2xl shadow-md border-2 border-purple-200/50 p-4 sm:p-5 lg:p-6 animate-scale-in hover:shadow-xl hover:shadow-purple-200/50 hover:border-purple-400 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden" style={{ animationDelay: "300ms" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 relative z-10">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-lg sm:rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 group-hover:text-purple-700 transition-colors duration-300">Мероприятия</h3>
            </div>
            {errors.events ? (
              <p className="text-sm text-red-500 relative z-10">{errors.events}</p>
            ) : statistics.events ? (
              <div className="space-y-2 relative z-10">
                <div className="flex justify-between group-hover:translate-x-1 transition-transform duration-300">
                  <span className="text-slate-600">Всего:</span>
                  <span className="font-semibold text-slate-800 animate-count-up">{statistics.events.total_events || 0}</span>
                </div>
                <div className="flex justify-between group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: "50ms" }}>
                  <span className="text-slate-600">Опубликовано:</span>
                  <span className="font-semibold text-blue-600 animate-pulse">{statistics.events.published_events || 0}</span>
                </div>
                <div className="flex justify-between group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: "100ms" }}>
                  <span className="text-slate-600">Завершено:</span>
                  <span className="font-semibold text-green-600 animate-pulse">{statistics.events.completed_events || 0}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 relative z-10">Нет данных</p>
            )}
          </div>

          {/* Справки */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl lg:rounded-2xl shadow-md border-2 border-orange-200/50 p-4 sm:p-5 lg:p-6 animate-scale-in hover:shadow-xl hover:shadow-orange-200/50 hover:border-orange-400 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden" style={{ animationDelay: "400ms" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 relative z-10">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-100 to-amber-200 rounded-lg sm:rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 group-hover:text-orange-700 transition-colors duration-300">Справки</h3>
            </div>
            {errors.certificates ? (
              <p className="text-sm text-red-500 relative z-10">{errors.certificates}</p>
            ) : statistics.certificates ? (
              <div className="space-y-2 relative z-10">
                <div className="flex justify-between group-hover:translate-x-1 transition-transform duration-300">
                  <span className="text-slate-600">Всего:</span>
                  <span className="font-semibold text-slate-800 animate-count-up">{statistics.certificates.total_certificates || 0}</span>
                </div>
                <div className="flex justify-between group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: "50ms" }}>
                  <span className="text-slate-600">В ожидании:</span>
                  <span className="font-semibold text-yellow-600 animate-pulse">{statistics.certificates.pending_certificates || 0}</span>
                </div>
                <div className="flex justify-between group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: "100ms" }}>
                  <span className="text-slate-600">В обработке:</span>
                  <span className="font-semibold text-blue-600 animate-pulse">{statistics.certificates.processing_certificates || 0}</span>
                </div>
                <div className="flex justify-between group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: "150ms" }}>
                  <span className="text-slate-600">Готово:</span>
                  <span className="font-semibold text-green-600 animate-pulse">{statistics.certificates.ready_certificates || 0}</span>
                </div>
                <div className="flex justify-between group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: "200ms" }}>
                  <span className="text-slate-600">Выдано:</span>
                  <span className="font-semibold text-emerald-600 animate-pulse">{statistics.certificates.issued_certificates || 0}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 relative z-10">Нет данных</p>
            )}
          </div>

          {/* Библиотека */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl lg:rounded-2xl shadow-md border-2 border-indigo-200/50 p-4 sm:p-5 lg:p-6 animate-scale-in hover:shadow-xl hover:shadow-indigo-200/50 hover:border-indigo-400 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden" style={{ animationDelay: "500ms" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 relative z-10">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-indigo-100 to-blue-200 rounded-lg sm:rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors duration-300">Библиотека</h3>
            </div>
            {errors.library ? (
              <p className="text-sm text-red-500 relative z-10">{errors.library}</p>
            ) : statistics.library ? (
              <div className="space-y-2 relative z-10">
                <div className="flex justify-between group-hover:translate-x-1 transition-transform duration-300">
                  <span className="text-slate-600">Всего книг:</span>
                  <span className="font-semibold text-slate-800 animate-count-up">{statistics.library.total_books || 0}</span>
                </div>
                <div className="flex justify-between group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: "50ms" }}>
                  <span className="text-slate-600">Всего экземпляров:</span>
                  <span className="font-semibold text-slate-800 animate-count-up">{statistics.library.total_copies || 0}</span>
                </div>
                <div className="flex justify-between group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: "100ms" }}>
                  <span className="text-slate-600">Доступно:</span>
                  <span className="font-semibold text-green-600 animate-pulse">{statistics.library.available_copies || 0}</span>
                </div>
                <div className="flex justify-between group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: "150ms" }}>
                  <span className="text-slate-600">Выдано:</span>
                  <span className="font-semibold text-orange-600 animate-pulse">
                    {(statistics.library.total_copies || 0) - (statistics.library.available_copies || 0)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 relative z-10">Нет данных</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
