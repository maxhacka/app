import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import staffService from "../../../../services/staffService";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    group_name: "",
    faculty: "",
    course: "",
    status: "active",
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await staffService.getStudents(filters);
      setStudents(data);
    } catch (err) {
      setError("Не удалось загрузить список студентов");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    loadStudents();
  };

  const handleDeleteClick = (student) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await staffService.deleteStudent(selectedStudent.id);
      setShowDeleteModal(false);
      setSelectedStudent(null);
      loadStudents();
    } catch (err) {
      alert("Ошибка при удалении студента");
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

  return (
    <section className="max-w-7xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Список студентов</h1>
        <Link
          to="/section/management/students/create"
          className="px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primaryHover transition-all duration-300 shadow-md hover:shadow-lg"
        >
          + Добавить студента
        </Link>
      </div>

      {/* Фильтры */}
      <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-slate-200">
        <h3 className="font-semibold text-lg mb-4 text-slate-800">Фильтры</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            name="group_name"
            value={filters.group_name}
            onChange={handleFilterChange}
            placeholder="Группа"
            className="p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="text"
            name="faculty"
            value={filters.faculty}
            onChange={handleFilterChange}
            placeholder="Факультет"
            className="p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="number"
            name="course"
            value={filters.course}
            onChange={handleFilterChange}
            placeholder="Курс"
            className="p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Все статусы</option>
            <option value="active">Активен</option>
            <option value="inactive">Неактивен</option>
            <option value="graduated">Выпускник</option>
            <option value="expelled">Отчислен</option>
          </select>
        </div>
        <button
          onClick={handleApplyFilters}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-primaryHover transition-all"
        >
          Применить фильтры
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Таблица студентов */}
      {students.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-md border-2 border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 text-left font-semibold">№ студента</th>
                <th className="p-4 text-left font-semibold">ФИО</th>
                <th className="p-4 text-left font-semibold">Группа</th>
                <th className="p-4 text-left font-semibold">Факультет</th>
                <th className="p-4 text-left font-semibold">Курс</th>
                <th className="p-4 text-left font-semibold">Статус</th>
                <th className="p-4 text-left font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr
                  key={student.id}
                  className="border-t border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4">{student.student_number}</td>
                  <td className="p-4 font-medium">{student.name}</td>
                  <td className="p-4">{student.group_name}</td>
                  <td className="p-4">{student.faculty || "-"}</td>
                  <td className="p-4">{student.course || "-"}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        student.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {student.status === "active" ? "Активен" : "Неактивен"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link
                        to={`/section/management/students/update?id=${student.id}`}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm"
                      >
                        Изменить
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(student)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm"
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center">
          <p className="text-slate-600 text-lg">Студенты не найдены</p>
          <Link
            to="/section/management/students/create"
            className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-primaryHover transition-all"
          >
            Добавить первого студента
          </Link>
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">
              Подтверждение удаления
            </h2>
            <p className="text-slate-600 mb-6">
              Вы уверены, что хотите удалить студента{" "}
              <strong>{selectedStudent?.name}</strong>?
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all font-semibold"
              >
                Удалить
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedStudent(null);
                }}
                className="flex-1 px-4 py-3 bg-slate-200 text-slate-800 rounded-full hover:bg-slate-300 transition-all font-semibold"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
