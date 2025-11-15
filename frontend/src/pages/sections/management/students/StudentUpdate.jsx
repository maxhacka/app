import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import staffService from "../../../../services/staffService";

export default function StudentUpdate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get("id");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [formData, setFormData] = useState({
    student_number: "",
    name: "",
    group_name: "",
    email: "",
    phone: "",
    status: "active",
    enrollment_year: new Date().getFullYear(),
    faculty: "",
    specialization: "",
    course: 1,
  });

  useEffect(() => {
    loadGroups();
    if (studentId) {
      loadStudent();
    } else {
      navigate("/section/management/students/list");
    }
  }, [studentId]);

  const loadGroups = async () => {
    try {
      setLoadingGroups(true);
      const groupsList = await staffService.getGroups();
      setGroups(groupsList);
    } catch (err) {
      console.error("Ошибка загрузки групп:", err);
    } finally {
      setLoadingGroups(false);
    }
  };

  const loadStudent = async () => {
    try {
      setLoading(true);
      const data = await staffService.getStudentById(studentId);
      setFormData({
        student_number: data.student_number || "",
        name: data.name || "",
        group_name: data.group_name || "",
        email: data.email || "",
        phone: data.phone || "",
        status: data.status || "active",
        enrollment_year: data.enrollment_year || new Date().getFullYear(),
        faculty: data.faculty || "",
        specialization: data.specialization || "",
        course: data.course || 1,
      });
    } catch (err) {
      setError("Не удалось загрузить данные студента");
    } finally {
      setLoading(false);
    }
  };

  const validatePhone = (phone) => {
    if (!phone || phone === "") return true; // Пустое значение допустимо для студентов
    // Формат: +7XXXXXXXXXX (11 цифр после +7)
    const phoneRegex = /^\+7\d{10}$/;
    return phoneRegex.test(phone);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "course" || name === "enrollment_year" ? parseInt(value) || "" : value,
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
    
    setSaving(true);
    setError(null);

    try {
      await staffService.updateStudent(studentId, formData);
      navigate("/section/management/students/list");
    } catch (err) {
      setError(err.message || "Ошибка при обновлении студента");
    } finally {
      setSaving(false);
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
    <section className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">
          Редактировать студента
        </h1>
        <button
          onClick={() => navigate("/section/management/students/list")}
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
              Номер студенческого билета *
            </label>
            <input
              type="text"
              name="student_number"
              value={formData.student_number}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
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
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Группа *
            </label>
            <select
              name="group_name"
              value={formData.group_name}
              onChange={handleChange}
              required
              disabled={loadingGroups}
              className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="">Выберите группу</option>
              {groups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
            {loadingGroups && (
              <p className="mt-1 text-xs text-slate-500">Загрузка групп...</p>
            )}
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
              <option value="graduated">Выпускник</option>
              <option value="expelled">Отчислен</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Год поступления
            </label>
            <input
              type="number"
              name="enrollment_year"
              value={formData.enrollment_year}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              min="1900"
              max={new Date().getFullYear() + 1}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Факультет
            </label>
            <input
              type="text"
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Специализация
            </label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Курс
            </label>
            <input
              type="number"
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              min="1"
              max="6"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-full hover:bg-primaryHover transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {saving ? "Сохранение..." : "Сохранить изменения"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/section/management/students/list")}
            className="px-6 py-3 bg-slate-200 text-slate-800 rounded-full hover:bg-slate-300 transition-all font-semibold"
          >
            Отмена
          </button>
        </div>
      </form>
    </section>
  );
}
