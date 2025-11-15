import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import staffService from "../../../../services/staffService";

export default function TeacherCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [formData, setFormData] = useState({
    teacher_number: "",
    name: "",
    email: "",
    phone: "",
    status: "active",
    department: "",
    position: "",
    academic_degree: "",
    subjects: "",
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const departmentsList = await staffService.getDepartments();
      setDepartments(departmentsList);
    } catch (err) {
      console.error("Ошибка загрузки кафедр:", err);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const validatePhone = (phone) => {
    if (!phone || phone === "") return true; // Пустое значение допустимо для преподавателей
    // Формат: +7XXXXXXXXXX (11 цифр после +7)
    const phoneRegex = /^\+7\d{10}$/;
    return phoneRegex.test(phone);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneBlur = (e) => {
    const phone = e.target.value;
    if (phone && !validatePhone(phone)) {
      setError("Телефон должен быть в формате +7XXXXXXXXXX (11 цифр после +7)");
    } else {
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация телефона перед отправкой
    if (formData.phone && !validatePhone(formData.phone)) {
      setError("Телефон должен быть в формате +7XXXXXXXXXX (11 цифр после +7)");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      await staffService.createTeacher(formData);
      navigate("/section/management/teachers/list");
    } catch (err) {
      setError(err.message || "Ошибка при создании преподавателя");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">
          Создать нового преподавателя
        </h1>
        <button
          onClick={() => navigate("/section/management/teachers/list")}
          className="px-4 py-2 bg-slate-200 text-slate-800 rounded-full hover:bg-slate-300 transition-all"
        >
          ← Назад к списку
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md border-2 border-slate-200 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Номер преподавателя *
            </label>
            <input
              type="text"
              name="teacher_number"
              value={formData.teacher_number}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Например: T-2021001"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              ФИО *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Петров Пётр Петрович"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="teacher@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Телефон
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handlePhoneBlur}
              pattern="\+7\d{10}"
              className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="+79991234567"
            />
            <p className="mt-1 text-xs text-slate-500">Формат: +7XXXXXXXXXX (11 цифр после +7)</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Статус
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="active">Активен</option>
              <option value="inactive">Неактивен</option>
              <option value="retired">На пенсии</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Кафедра
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              disabled={loadingDepartments}
              className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="">Выберите кафедру</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
            {loadingDepartments && (
              <p className="mt-1 text-xs text-slate-500">Загрузка кафедр...</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Должность
            </label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Доцент"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Учёная степень
            </label>
            <input
              type="text"
              name="academic_degree"
              value={formData.academic_degree}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Кандидат наук"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Преподаваемые предметы
          </label>
          <textarea
            name="subjects"
            value={formData.subjects}
            onChange={handleChange}
            rows="3"
            className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Программирование, Базы данных, Алгоритмы"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-full hover:bg-primaryHover transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? "Создание..." : "Создать преподавателя"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/section/management/teachers/list")}
            className="px-6 py-3 bg-slate-200 text-slate-800 rounded-full hover:bg-slate-300 transition-all font-semibold"
          >
            Отмена
          </button>
        </div>
      </form>
    </section>
  );
}
