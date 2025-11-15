import React, { useState, useEffect } from "react";
import staffService from "../../../services/staffService";

// Компонент для отображения телефона с блюром
function PhoneCell({ phone }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [touchHandled, setTouchHandled] = useState(false);

  if (!phone) return <span className="text-slate-400">-</span>;

  const handleToggle = () => {
    setIsRevealed(!isRevealed);
  };

  const handleTouchEnd = (e) => {
    // Для мобильных устройств используем touch события
    e.preventDefault();
    e.stopPropagation();
    setTouchHandled(true);
    setIsRevealed(!isRevealed);
    // Сбрасываем флаг через небольшую задержку, чтобы предотвратить двойное срабатывание
    setTimeout(() => setTouchHandled(false), 300);
  };

  const handleClick = (e) => {
    // На мобильных устройствах игнорируем click, если уже обработали touch
    if (touchHandled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    handleToggle();
  };

  return (
    <button
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
      className="text-sm font-mono text-slate-600 hover:text-slate-800 transition-all touch-manipulation"
      style={{ 
        filter: isRevealed ? "none" : "blur(4px)",
        WebkitFilter: isRevealed ? "none" : "blur(4px)",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTapHighlightColor: "transparent"
      }}
      title={isRevealed ? "Нажмите, чтобы скрыть" : "Нажмите, чтобы показать"}
    >
      <span style={{ filter: isRevealed ? "none" : "blur(4px)", WebkitFilter: isRevealed ? "none" : "blur(4px)" }}>
        {phone}
      </span>
    </button>
  );
}

// Иконки
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

export default function ManagementMain() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Фильтры
  const [filter, setFilter] = useState({
    type: "all", // all, students, teachers
    searchName: "",
    searchNumber: "",
    searchEmail: "",
    searchPhone: "",
    searchGroupOrDept: "",
    status: "",
  });
  
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Модальные окна
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState("student"); // student or teacher
  const [selectedItem, setSelectedItem] = useState(null);

  // Форма для редактирования/создания
  const [formData, setFormData] = useState({});

  // Списки для выпадающих списков
  const [groups, setGroups] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Уведомления
  const [notification, setNotification] = useState({
    show: false,
    type: "success", // success, error, info
    message: "",
  });

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 4000);
  };

  useEffect(() => {
    loadData();
    loadGroups();
    loadDepartments();
  }, [filter.type]);

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

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      let students = [];
      let teachers = [];

      if (filter.type === "all" || filter.type === "students") {
        students = await staffService.getStudents({ limit: 1000 });
      }

      if (filter.type === "all" || filter.type === "teachers") {
        teachers = await staffService.getTeachers({ limit: 1000 });
      }

      // Объединяем и добавляем тип
      const combined = [
        ...students.map(s => ({ ...s, itemType: "student" })),
        ...teachers.map(t => ({ ...t, itemType: "teacher" }))
      ];

      setData(combined);
    } catch (err) {
      setError("Не удалось загрузить данные");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Расширенная фильтрация
  const filteredData = data.filter(item => {
    // Поиск по имени
    if (filter.searchName && !item.name.toLowerCase().includes(filter.searchName.toLowerCase())) {
      return false;
    }
    
    // Поиск по номеру
    if (filter.searchNumber) {
      const number = item.student_number || item.teacher_number || "";
      if (!number.toLowerCase().includes(filter.searchNumber.toLowerCase())) {
        return false;
      }
    }
    
    // Поиск по email
    if (filter.searchEmail) {
      const email = item.email || "";
      if (!email.toLowerCase().includes(filter.searchEmail.toLowerCase())) {
        return false;
      }
    }
    
    // Поиск по телефону
    if (filter.searchPhone) {
      const phone = item.phone || "";
      if (!phone.includes(filter.searchPhone)) {
        return false;
      }
    }
    
    // Поиск по группе/кафедре
    if (filter.searchGroupOrDept) {
      const groupOrDept = item.group_name || item.department || "";
      if (!groupOrDept.toLowerCase().includes(filter.searchGroupOrDept.toLowerCase())) {
        return false;
      }
    }
    
    // Фильтр по статусу
    if (filter.status && item.status !== filter.status) {
      return false;
    }
    
    return true;
  });

  const handleEdit = (item) => {
    setSelectedItem(item);
    if (item.itemType === "student") {
      setFormData({
        student_number: item.student_number || "",
        name: item.name || "",
        group_name: item.group_name || "",
        email: item.email || "",
        phone: item.phone || "",
        status: item.status || "active",
        enrollment_year: item.enrollment_year || new Date().getFullYear(),
        faculty: item.faculty || "",
        specialization: item.specialization || "",
        course: item.course || 1,
      });
    } else {
      setFormData({
        teacher_number: item.teacher_number || "",
        name: item.name || "",
        email: item.email || "",
        phone: item.phone || "",
        status: item.status || "active",
        department: item.department || "",
        position: item.position || "",
        academic_degree: item.academic_degree || "",
        subjects: item.subjects || "",
      });
    }
    setShowEditModal(true);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (selectedItem.itemType === "student") {
        await staffService.deleteStudent(selectedItem.id);
        showNotification("success", "Студент успешно удалён");
      } else {
        await staffService.deleteTeacher(selectedItem.id);
        showNotification("success", "Преподаватель успешно удалён");
      }
      setShowDeleteModal(false);
      setSelectedItem(null);
      loadData();
    } catch (err) {
      console.error(err);
      showNotification("error", `Ошибка при удалении: ${err.message || "Неизвестная ошибка"}`);
      setShowDeleteModal(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    
    // Валидация телефона перед отправкой
    if (formData.phone && !validatePhone(formData.phone)) {
      showNotification("error", "Телефон должен быть в формате +7XXXXXXXXXX (11 цифр после +7)");
      return;
    }
    
    try {
      if (selectedItem.itemType === "student") {
        await staffService.updateStudent(selectedItem.id, formData);
        showNotification("success", "Данные студента успешно обновлены");
      } else {
        await staffService.updateTeacher(selectedItem.id, formData);
        showNotification("success", "Данные преподавателя успешно обновлены");
      }
      setShowEditModal(false);
      setSelectedItem(null);
      loadData();
    } catch (err) {
      console.error(err);
      showNotification("error", `Ошибка при сохранении: ${err.message || "Неизвестная ошибка"}`);
    }
  };

  const handleCreateNew = (type) => {
    setCreateType(type);
    if (type === "student") {
      setFormData({
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
    } else {
      setFormData({
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
    }
    setShowCreateModal(true);
  };

  const handleCreateConfirm = async (e) => {
    e.preventDefault();
    
    // Валидация телефона перед отправкой
    if (formData.phone && !validatePhone(formData.phone)) {
      showNotification("error", "Телефон должен быть в формате +7XXXXXXXXXX (11 цифр после +7)");
      return;
    }
    
    try {
      if (createType === "student") {
        await staffService.createStudent(formData);
        showNotification("success", "Студент успешно добавлен");
      } else {
        await staffService.createTeacher(formData);
        showNotification("success", "Преподаватель успешно добавлен");
      }
      setShowCreateModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      showNotification("error", `Ошибка при создании: ${err.message || "Неизвестная ошибка"}`);
    }
  };

  const validatePhone = (phone) => {
    if (!phone || phone === "") return true; // Пустое значение допустимо
    // Формат: +7XXXXXXXXXX (11 цифр после +7)
    const phoneRegex = /^\+7\d{10}$/;
    return phoneRegex.test(phone);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === "course" || name === "enrollment_year") ? parseInt(value) || "" : value,
    }));
    
    // Валидация телефона при вводе
    if (name === "phone" && value && !validatePhone(value)) {
      // Можно добавить визуальную индикацию ошибки, но не блокируем ввод
    }
  };

  const handlePhoneBlur = (e) => {
    const phone = e.target.value;
    if (phone && !validatePhone(phone)) {
      showNotification("error", "Телефон должен быть в формате +7XXXXXXXXXX (11 цифр после +7)");
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
    <section className="w-full max-w-full mx-auto space-y-4 lg:space-y-6 px-2 sm:px-4 lg:px-6 py-4 lg:py-6 overflow-x-hidden">
      {/* Уведомления */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in max-w-[calc(100vw-2rem)]">
          <div className={`rounded-lg shadow-xl p-4 flex items-center gap-3 w-full max-w-md ${
            notification.type === "success" 
              ? "bg-green-500 text-white" 
              : notification.type === "error"
              ? "bg-red-500 text-white"
              : "bg-blue-500 text-white"
          }`}>
            <div className="flex-shrink-0">
              {notification.type === "success" && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {notification.type === "error" && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {notification.type === "info" && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <p className="flex-1 font-medium">{notification.message}</p>
            <button 
              onClick={() => setNotification({ show: false, type: "", message: "" })}
              className="flex-shrink-0 hover:opacity-80 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 lg:mb-6 w-full max-w-full overflow-x-hidden">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 truncate min-w-0 flex-1">Управление персоналом</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-shrink-0 min-w-0">
          <button
            onClick={() => handleCreateNew("student")}
            className="w-full sm:w-auto px-4 lg:px-6 py-3 bg-gradient-to-r from-primary via-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-300 shadow-lg relative overflow-hidden group text-sm lg:text-base"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              <svg className="w-4 h-4 lg:w-5 lg:h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Добавить студента
            </span>
          </button>
          <button
            onClick={() => handleCreateNew("teacher")}
            className="w-full sm:w-auto px-4 lg:px-6 py-3 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-purple-200/50 transition-all duration-300 shadow-lg relative overflow-hidden group text-sm lg:text-base"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-white/20 to-purple-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              <svg className="w-4 h-4 lg:w-5 lg:h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Добавить преподавателя
            </span>
          </button>
        </div>
      </div>

      {/* Фильтры */}
      <div className="bg-white p-4 lg:p-6 rounded-xl lg:rounded-2xl shadow-md border-2 border-slate-200 w-full max-w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h3 className="font-semibold text-base lg:text-lg text-slate-800">Поиск и фильтры</h3>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="w-full sm:w-auto px-4 py-2.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-all font-medium text-slate-700"
          >
            {showAdvancedFilters ? "Скрыть расширенные фильтры" : "Показать расширенные фильтры"}
          </button>
        </div>
        
        {/* Основные фильтры */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Тип</label>
            <select
              value={filter.type}
              onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
              className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Все</option>
              <option value="students">Только студенты</option>
              <option value="teachers">Только преподаватели</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Поиск по ФИО</label>
            <input
              type="text"
              value={filter.searchName}
              onChange={(e) => setFilter(prev => ({ ...prev, searchName: e.target.value }))}
              placeholder="Введите имя..."
              className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Статус</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
              className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Все статусы</option>
              <option value="active">Активен</option>
              <option value="inactive">Неактивен</option>
              <option value="graduated">Выпускник</option>
              <option value="expelled">Отчислен</option>
              <option value="retired">На пенсии</option>
            </select>
          </div>
        </div>

        {/* Расширенные фильтры */}
        {showAdvancedFilters && (
          <div className="pt-4 border-t border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Номер студента/преподавателя
                </label>
                <input
                  type="text"
                  value={filter.searchNumber}
                  onChange={(e) => setFilter(prev => ({ ...prev, searchNumber: e.target.value }))}
                  placeholder="20210001 или T-2021001"
                  className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="text"
                  value={filter.searchEmail}
                  onChange={(e) => setFilter(prev => ({ ...prev, searchEmail: e.target.value }))}
                  placeholder="email@example.com"
                  className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Телефон</label>
                <input
                  type="text"
                  value={filter.searchPhone}
                  onChange={(e) => setFilter(prev => ({ ...prev, searchPhone: e.target.value }))}
                  placeholder="+7 (999) 999-99-99"
                  className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Группа/Кафедра
                </label>
                <input
                  type="text"
                  value={filter.searchGroupOrDept}
                  onChange={(e) => setFilter(prev => ({ ...prev, searchGroupOrDept: e.target.value }))}
                  placeholder="ПИ-21 или Кафедра ИТ"
                  className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setFilter({
                  type: "all",
                  searchName: "",
                  searchNumber: "",
                  searchEmail: "",
                  searchPhone: "",
                  searchGroupOrDept: "",
                  status: "",
                })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all text-sm font-medium"
              >
                Сбросить все фильтры
              </button>
            </div>
          </div>
        )}

        {/* Счётчик результатов */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            Найдено результатов: <strong className="text-slate-800">{filteredData.length}</strong> из <strong className="text-slate-800">{data.length}</strong>
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Таблица - Десктоп */}
      {filteredData.length > 0 ? (
        <>
          {/* Десктоп: таблица */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-md border-2 border-slate-200 overflow-hidden w-full max-w-full">
            <div className="overflow-x-auto overflow-y-auto custom-scrollbar w-full max-w-full" style={{ maxHeight: "calc(100vh - 450px)", minHeight: "400px" }}>
              <table className="w-full table-fixed min-w-0 max-w-full">
                <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-2 text-left font-semibold whitespace-nowrap text-sm" style={{ width: "70px" }}>Тип</th>
                    <th className="p-2 text-left font-semibold whitespace-nowrap text-sm" style={{ width: "90px" }}>Номер</th>
                    <th className="p-2 text-left font-semibold whitespace-nowrap text-sm" style={{ width: "130px" }}>ФИО</th>
                    <th className="p-2 text-left font-semibold whitespace-nowrap text-sm" style={{ width: "120px" }}>Группа/Кафедра</th>
                    <th className="p-2 text-left font-semibold whitespace-nowrap text-sm" style={{ width: "130px" }}>Email</th>
                    <th className="p-2 text-left font-semibold whitespace-nowrap text-sm" style={{ width: "100px" }}>Телефон</th>
                    <th className="p-2 text-left font-semibold whitespace-nowrap text-sm" style={{ width: "80px" }}>Статус</th>
                    <th className="p-2 text-left font-semibold whitespace-nowrap text-sm" style={{ width: "70px" }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr
                      key={`${item.itemType}-${item.id}`}
                      className="border-t border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-2" style={{ width: "70px" }}>
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium inline-block ${
                          item.itemType === "student" 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-purple-100 text-purple-800"
                        }`}>
                          {item.itemType === "student" ? "Студ." : "Преп."}
                        </span>
                      </td>
                      <td className="p-2 font-mono text-xs truncate" style={{ width: "90px" }} title={item.student_number || item.teacher_number}>
                        {item.student_number || item.teacher_number}
                      </td>
                      <td className="p-2 font-medium text-sm truncate" style={{ width: "130px" }} title={item.name}>
                        {item.name}
                      </td>
                      <td className="p-2 text-sm truncate" style={{ width: "120px" }} title={item.group_name || item.department || "-"}>
                        {item.group_name || item.department || "-"}
                      </td>
                      <td className="p-2 text-xs truncate" style={{ width: "130px" }} title={item.email || "-"}>
                        {item.email || "-"}
                      </td>
                      <td className="p-2" style={{ width: "100px" }}>
                        <PhoneCell phone={item.phone} />
                      </td>
                      <td className="p-2" style={{ width: "80px" }}>
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium inline-block ${
                          item.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {item.status === "active" ? "Активен" : "Неактивен"}
                        </span>
                      </td>
                      <td className="p-2" style={{ width: "70px" }}>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 group"
                            title="Изменить"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 group"
                            title="Удалить"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Мобильные: карточки в прокручиваемом окне */}
          <div className="lg:hidden bg-white rounded-xl shadow-md border-2 border-slate-200 overflow-hidden">
            <div className="overflow-y-auto custom-scrollbar p-4" style={{ maxHeight: "calc(100vh - 400px)" }}>
              <div className="space-y-4">
                {filteredData.map((item) => (
                  <div
                    key={`${item.itemType}-${item.id}`}
                    className="bg-white rounded-xl shadow-md border-2 border-slate-200 p-4 space-y-3"
                  >
                    {/* Заголовок карточки */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">{item.name}</h3>
                        <p className="text-sm text-slate-600 font-mono">{item.student_number || item.teacher_number}</p>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.itemType === "student" 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-purple-100 text-purple-800"
                        }`}>
                          {item.itemType === "student" ? "Студент" : "Преподаватель"}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {item.status === "active" ? "Активен" : "Неактивен"}
                        </span>
                      </div>
                    </div>

                    {/* Информация */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Группа/Кафедра:</span>
                        <span className="text-sm font-medium text-slate-800">{item.group_name || item.department || "-"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Email:</span>
                        <span className="text-sm font-medium text-slate-800 truncate max-w-[60%]">{item.email || "-"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Телефон:</span>
                        <PhoneCell phone={item.phone} />
                      </div>
                    </div>

                    {/* Кнопки действий */}
                    <div className="flex gap-2 pt-3 border-t border-slate-200">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <EditIcon />
                        <span>Изменить</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <DeleteIcon />
                        <span>Удалить</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="p-8 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center">
          <p className="text-slate-600 text-lg">Данные не найдены</p>
        </div>
      )}

      {/* Модальное окно редактирования */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6">
              <h2 className="text-2xl font-bold text-slate-800">
                Редактировать {selectedItem.itemType === "student" ? "студента" : "преподавателя"}
              </h2>
            </div>
            
            <form onSubmit={handleSaveEdit} className="p-6 space-y-6">
              {selectedItem.itemType === "student" ? (
                <StudentForm formData={formData} handleChange={handleFormChange} handlePhoneBlur={handlePhoneBlur} groups={groups} loadingGroups={loadingGroups} />
              ) : (
                <TeacherForm formData={formData} handleChange={handleFormChange} handlePhoneBlur={handlePhoneBlur} departments={departments} loadingDepartments={loadingDepartments} />
              )}

              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-full hover:bg-primaryHover transition-all font-semibold"
                >
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedItem(null);
                  }}
                  className="px-6 py-3 bg-slate-200 text-slate-800 rounded-full hover:bg-slate-300 transition-all font-semibold"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно создания */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6">
              <h2 className="text-2xl font-bold text-slate-800">
                Создать {createType === "student" ? "студента" : "преподавателя"}
              </h2>
            </div>
            
            <form onSubmit={handleCreateConfirm} className="p-6 space-y-6">
              {createType === "student" ? (
                <StudentForm formData={formData} handleChange={handleFormChange} handlePhoneBlur={handlePhoneBlur} groups={groups} loadingGroups={loadingGroups} />
              ) : (
                <TeacherForm formData={formData} handleChange={handleFormChange} handlePhoneBlur={handlePhoneBlur} departments={departments} loadingDepartments={loadingDepartments} />
              )}

              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-full hover:bg-primaryHover transition-all font-semibold"
                >
                  Создать
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 bg-slate-200 text-slate-800 rounded-full hover:bg-slate-300 transition-all font-semibold"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно удаления */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">
              Подтверждение удаления
            </h2>
            <p className="text-slate-600 mb-6">
              Вы уверены, что хотите удалить <strong>{selectedItem.name}</strong>?
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
                  setSelectedItem(null);
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

// Компонент формы студента
function StudentForm({ formData, handleChange, handlePhoneBlur, groups = [], loadingGroups = false }) {
  return (
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
        <label className="block text-sm font-semibold text-slate-700 mb-2">ФИО *</label>
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
        <label className="block text-sm font-semibold text-slate-700 mb-2">Группа *</label>
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
        <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Телефон</label>
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
        <label className="block text-sm font-semibold text-slate-700 mb-2">Статус</label>
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
        <label className="block text-sm font-semibold text-slate-700 mb-2">Год поступления</label>
        <input
          type="number"
          name="enrollment_year"
          value={formData.enrollment_year}
          onChange={handleChange}
          className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Факультет</label>
        <input
          type="text"
          name="faculty"
          value={formData.faculty}
          onChange={handleChange}
          className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Специализация</label>
        <input
          type="text"
          name="specialization"
          value={formData.specialization}
          onChange={handleChange}
          className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Курс</label>
        <input
          type="number"
          name="course"
          value={formData.course}
          onChange={handleChange}
          min="1"
          max="6"
          className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );
}

// Компонент формы преподавателя
function TeacherForm({ formData, handleChange, handlePhoneBlur, departments = [], loadingDepartments = false }) {
  return (
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
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">ФИО *</label>
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
        <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Телефон</label>
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
        <label className="block text-sm font-semibold text-slate-700 mb-2">Статус</label>
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
        <label className="block text-sm font-semibold text-slate-700 mb-2">Кафедра</label>
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
        <label className="block text-sm font-semibold text-slate-700 mb-2">Должность</label>
        <input
          type="text"
          name="position"
          value={formData.position}
          onChange={handleChange}
          className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Учёная степень</label>
        <input
          type="text"
          name="academic_degree"
          value={formData.academic_degree}
          onChange={handleChange}
          className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Преподаваемые предметы
        </label>
        <textarea
          name="subjects"
          value={formData.subjects}
          onChange={handleChange}
          rows="3"
          className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );
}
