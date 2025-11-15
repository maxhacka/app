import React, { useState, useEffect } from "react";
import staffService from "../../../../services/staffService";

export default function Statistics() {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await staffService.getStatistics();
      setStatistics(data);
    } catch (err) {
      setError("Не удалось загрузить статистику");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto space-y-6 p-6">
      <h1 className="text-3xl font-bold text-slate-800">Статистика по управлению</h1>

      {/* Основная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Всего студентов</p>
              <p className="text-3xl font-bold text-primary mt-2">
                {statistics?.total_students || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👨‍🎓</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Активных студентов</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {statistics?.active_students || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Всего преподавателей</p>
              <p className="text-3xl font-bold text-primary mt-2">
                {statistics?.total_teachers || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👨‍🏫</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Активных преподавателей</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {statistics?.active_teachers || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Студенты по курсам */}
      {statistics?.students_by_course && Object.keys(statistics.students_by_course).length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Студенты по курсам</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(statistics.students_by_course).map(([course, count]) => (
              <div key={course} className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-600 text-sm">Курс {course}</p>
                <p className="text-2xl font-bold text-primary mt-1">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Студенты по факультетам */}
      {statistics?.students_by_faculty && Object.keys(statistics.students_by_faculty).length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Студенты по факультетам</h2>
          <div className="space-y-3">
            {Object.entries(statistics.students_by_faculty)
              .sort((a, b) => b[1] - a[1])
              .map(([faculty, count]) => (
                <div key={faculty} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-700 font-medium">{faculty || "Не указан"}</span>
                  <span className="text-primary font-bold text-lg">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </section>
  );
}
