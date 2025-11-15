import React, { useState, useEffect } from "react";
import applicantsService from "../../../services/applicantsService";

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

const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
  </svg>
);

const ExamIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

export default function ApplicantsMain() {
  const [applicants, setApplicants] = useState([]);
  const [allApplicants, setAllApplicants] = useState([]); // Все загруженные данные для фильтрации
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Фильтры
  const [filters, setFilters] = useState({
    program: "",
    status: "",
    source: "",
  });

  // Поиск
  const [searchQuery, setSearchQuery] = useState("");

  // Сортировка
  const [sortBy, setSortBy] = useState("exam_results"); // "exam_results" или "none"
  const [sortOrder, setSortOrder] = useState("desc"); // "asc" или "desc"
  
  // Модальные окна
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExamsModal, setShowExamsModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [showProgramsModal, setShowProgramsModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  
  // Расчет зачисления
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [enrollmentTaskId, setEnrollmentTaskId] = useState(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [enrollmentInterval, setEnrollmentInterval] = useState(null);

  // Уведомления
  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    message: "",
  });

  // Доступные программы
  const [availablePrograms, setAvailablePrograms] = useState([]);
  const [showProgramsManager, setShowProgramsManager] = useState(false);
  
  // Расширенные фильтры
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    loadApplicants();
    loadPrograms();
  }, []);

  const loadApplicants = async () => {
    try {
      setLoading(true);
      setError(null);
      // Используем новый эндпоинт для получения сгруппированных данных
      const data = await applicantsService.getGroupedApplicants({
        program: filters.program || undefined,
        status: filters.status || undefined,
        source: filters.source || undefined,
        limit: 100000, // Увеличен лимит для загрузки всех абитуриентов
      });
      
      // Сохраняем все загруженные данные
      setAllApplicants(data);
      
      // Применяем фильтрацию и сортировку
      applyFiltersAndSort(data);
    } catch (err) {
      setError("Не удалось загрузить абитуриентов");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = (data = allApplicants) => {
    // Применяем клиентскую фильтрацию по поисковому запросу
    let filteredData = data;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredData = data.filter(applicant => 
        applicant.name.toLowerCase().includes(query) ||
        applicant.phone?.toLowerCase().includes(query) ||
        applicant.snils?.toLowerCase().includes(query) ||
        applicant.programs?.some(p => p.program.toLowerCase().includes(query))
      );
    }
    
    // Применяем клиентскую сортировку
    const sortedData = sortApplicants(filteredData);
    setApplicants(sortedData);
  };

  // Применяем фильтрацию при изменении поискового запроса или сортировки
  useEffect(() => {
    if (allApplicants.length > 0) {
      applyFiltersAndSort(allApplicants);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, sortBy, sortOrder, allApplicants.length]);

  const sortApplicants = (data, sortField = sortBy, order = sortOrder) => {
    if (sortField === "none") {
      return data;
    }

    const sorted = [...data].sort((a, b) => {
      // Для сгруппированных данных берем максимальный балл из всех программ
      let aValue = 0;
      let bValue = 0;
      
      if (a.programs && a.programs.length > 0) {
        aValue = Math.max(...a.programs.map(p => p.exam_results || 0));
      }
      if (b.programs && b.programs.length > 0) {
        bValue = Math.max(...b.programs.map(p => p.exam_results || 0));
      }

      if (order === "asc") {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return sorted;
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      // Если уже сортируем по этому полю, меняем порядок
      const newOrder = sortOrder === "asc" ? "desc" : "asc";
      setSortOrder(newOrder);
    } else {
      // Если новое поле, устанавливаем сортировку по убыванию
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
    // Фильтрация и сортировка применятся через useEffect
  };

  const handleSortOrderChange = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);
    // Фильтрация и сортировка применятся через useEffect
  };

  const loadPrograms = async () => {
    try {
      const programs = await applicantsService.getPrograms({ is_active: 1, limit: 100 });
      setAvailablePrograms(programs);
    } catch (err) {
      console.error("Не удалось загрузить программы:", err);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 4000);
  };

  const handleStartEnrollmentCalculation = async () => {
    try {
      const result = await applicantsService.startEnrollmentCalculation();
      setEnrollmentTaskId(result.task_id);
      setEnrollmentStatus({
        status: "pending",
        progress: 0,
        message: "Ожидание начала расчета...",
      });
      setShowEnrollmentModal(true);
      
      // Начинаем опрос статуса
      const interval = setInterval(async () => {
        try {
          const status = await applicantsService.getEnrollmentStatus(result.task_id);
          setEnrollmentStatus(status);
          
          if (status.status === "completed" || status.status === "error") {
            clearInterval(interval);
            setEnrollmentInterval(null);
            
            if (status.status === "completed") {
              showNotification("success", "Расчет завершен успешно!");
            } else {
              showNotification("error", `Ошибка: ${status.error || "Неизвестная ошибка"}`);
            }
          }
        } catch (err) {
          console.error("Ошибка проверки статуса:", err);
        }
      }, 1000); // Проверяем каждую секунду
      
      setEnrollmentInterval(interval);
    } catch (err) {
      showNotification("error", `Ошибка запуска расчета: ${err.message}`);
    }
  };

  const handleDownloadEnrollmentFile = async (filename) => {
    try {
      await applicantsService.downloadEnrollmentFile(filename);
      showNotification("success", "Файл скачан успешно!");
    } catch (err) {
      showNotification("error", `Ошибка скачивания файла: ${err.message}`);
    }
  };

  const handleCloseEnrollmentModal = () => {
    if (enrollmentInterval) {
      clearInterval(enrollmentInterval);
      setEnrollmentInterval(null);
    }
    setShowEnrollmentModal(false);
    setEnrollmentTaskId(null);
    setEnrollmentStatus(null);
  };

  // Очистка интервала при размонтировании
  useEffect(() => {
    return () => {
      if (enrollmentInterval) {
        clearInterval(enrollmentInterval);
      }
    };
  }, [enrollmentInterval]);

  const handleEdit = (applicant) => {
    setSelectedApplicant(applicant);
    setShowEditModal(true);
  };

  const handleEditPrograms = (applicant) => {
    setSelectedApplicant(applicant);
    setShowProgramsModal(true);
  };

  const handleDelete = (applicant) => {
    setSelectedApplicant(applicant);
    setShowDeleteModal(true);
  };

  const handleManageExams = (applicant) => {
    setSelectedApplicant(applicant);
    setShowExamsModal(true);
  };

  const handleManageDocuments = (applicant) => {
    setSelectedApplicant(applicant);
    setShowDocumentsModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await applicantsService.deleteApplicant(selectedApplicant.id);
      showNotification("success", "Абитуриент удалён");
      setShowDeleteModal(false);
      setSelectedApplicant(null);
      loadApplicants();
    } catch (err) {
      showNotification("error", `Ошибка при удалении: ${err.message}`);
      setShowDeleteModal(false);
    }
  };

  const exportToExcel = () => {
    // Подготовка данных для экспорта
    const exportData = applicants.map(a => ({
      "СНИЛС": a.snils || "-",
      "ФИО": a.name,
      "Программа": a.program,
      "Статус": getStatusLabel(a.status),
      "Общий балл": a.exam_results || 0,
      "Телефон": a.phone,
      "Приоритет": a.priority,
    }));

    // Создаем CSV
    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(","),
      ...exportData.map(row => 
        headers.map(header => {
          const value = row[header];
          // Экранируем значения с запятыми
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(",")
      )
    ].join("\n");

    // Создаем и скачиваем файл
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `applicants_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification("success", "Файл экспортирован");
  };

  if (loading) {
  return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Загрузка абитуриентов...</p>
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
            notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}>
            <p className="flex-1 font-medium">{notification.message}</p>
            <button 
              onClick={() => setNotification({ show: false, type: "", message: "" })}
              className="hover:opacity-80"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 lg:mb-6 w-full max-w-full overflow-x-hidden">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 truncate min-w-0 flex-1">Абитуриенты</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto min-w-0 flex-wrap">
          <button
            onClick={() => setShowProgramsManager(true)}
            className="w-full sm:w-auto px-4 lg:px-6 py-3 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-purple-200/50 transition-all duration-300 shadow-lg relative overflow-hidden group text-sm lg:text-base"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-white/20 to-purple-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              <svg className="w-4 h-4 lg:w-5 lg:h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Программы
            </span>
          </button>
          <button
            onClick={exportToExcel}
            className="w-full sm:w-auto px-4 lg:px-6 py-3 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-green-200/50 transition-all duration-300 shadow-lg relative overflow-hidden group text-sm lg:text-base"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/0 via-white/20 to-green-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              <svg className="w-4 h-4 lg:w-5 lg:h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Экспорт в Excel
            </span>
          </button>
          <button
            onClick={handleStartEnrollmentCalculation}
            className="w-full sm:w-auto px-4 lg:px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-300 shadow-lg relative overflow-hidden group text-sm lg:text-base"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-white/20 to-blue-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              <svg className="w-4 h-4 lg:w-5 lg:h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Расчет зачисления
            </span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto px-4 lg:px-6 py-3 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-purple-200/50 transition-all duration-300 shadow-lg relative overflow-hidden group text-sm lg:text-base"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              <svg className="w-4 h-4 lg:w-5 lg:h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Добавить абитуриента
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
            {showAdvancedFilters ? "Скрыть фильтры" : "Показать фильтры"}
          </button>
        </div>
        
        {/* Поиск по ФИО - всегда видимый */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Поиск по ФИО</label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Введите ФИО для поиска..."
              className="w-full p-3 pl-10 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Расширенные фильтры */}
        {showAdvancedFilters && (
          <div className="pt-4 border-t border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Направление (программа)</label>
                <select
                  value={filters.program}
                  onChange={(e) => setFilters(prev => ({ ...prev, program: e.target.value }))}
                  className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Все направления</option>
                  {availablePrograms.map(program => (
                    <option key={program.id} value={program.name}>
                      {program.name} (мест: {program.total_places})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Статус</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Все статусы</option>
                  <option value="new">Новый</option>
                  <option value="contacted">Связались</option>
                  <option value="documents_pending">Ожидание</option>
                  <option value="enrolled">В конкурсе</option>
                  <option value="rejected">Отклонён</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Сортировка по баллам</label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      if (e.target.value === "none") {
                        setSortBy("none");
                      } else {
                        handleSortChange(e.target.value);
                      }
                    }}
                    className="flex-1 p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="none">Без сортировки</option>
                    <option value="exam_results">По баллам</option>
                  </select>
                  {sortBy !== "none" && (
                    <button
                      onClick={handleSortOrderChange}
                      className="px-4 py-3 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-all font-semibold"
                      title={sortOrder === "asc" ? "По возрастанию" : "По убыванию"}
                    >
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </button>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={loadApplicants}
              className="mt-4 w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-full hover:bg-primaryHover transition-all font-medium"
            >
              Применить фильтры
            </button>
          </div>
        )}
        
        {/* Счётчик результатов */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            {searchQuery.trim() ? (
              <>
                Найдено: <strong>{applicants.length}</strong> из <strong>{allApplicants.length}</strong>
              </>
            ) : (
              <>
                Всего заявлений: <strong>{applicants.length}</strong>
              </>
            )}
            {sortBy !== "none" && (
              <span className="ml-4">
                Сортировка: по баллам ({sortOrder === "asc" ? "по возрастанию" : "по убыванию"})
              </span>
            )}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Таблица абитуриентов - Десктоп */}
      {applicants.length > 0 ? (
        <>
          {/* Десктоп: таблица */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-md border-2 border-slate-200 overflow-hidden w-full max-w-full">
            <div className="overflow-x-auto overflow-y-auto custom-scrollbar w-full max-w-full" style={{ maxHeight: "calc(100vh - 450px)", minHeight: "400px" }}>
              <table className="w-full table-fixed min-w-0 max-w-full">
                <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-2 text-left font-semibold text-sm" style={{ width: "100px" }}>ID</th>
                    <th className="p-2 text-left font-semibold text-sm" style={{ width: "120px" }}>СНИЛС</th>
                    <th className="p-2 text-left font-semibold text-sm" style={{ width: "140px" }}>ФИО</th>
                    <th className="p-2 text-left font-semibold text-sm" style={{ width: "300px" }}>Программы</th>
                    <th className="p-2 text-left font-semibold text-sm" style={{ width: "100px" }}>Телефон</th>
                    <th className="p-2 text-left font-semibold text-sm" style={{ width: "70px" }}>
                      <button
                        onClick={() => handleSortChange("exam_results")}
                        className="flex items-center gap-1 hover:text-primary transition-colors text-sm"
                      >
                        Балл
                        {sortBy === "exam_results" && (
                          <span className="text-primary">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="p-2 text-left font-semibold text-sm" style={{ width: "200px" }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map((applicant) => (
                    <tr
                      key={`${applicant.phone}_${applicant.snils}`}
                      className="border-t border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-2 font-mono text-xs font-semibold text-slate-600" style={{ width: "100px" }} title={applicant.applicant_id || "-"}>
                        {applicant.applicant_id || "-"}
                      </td>
                      <td className="p-2 font-mono text-xs" style={{ width: "120px" }} title={applicant.snils || "-"}>
                        {applicant.snils || "-"}
                      </td>
                      <td className="p-2 font-medium text-sm" style={{ width: "140px" }} title={applicant.name}>
                        {applicant.name}
                      </td>
                      <td className="p-2" style={{ width: "300px" }}>
                        <div className="flex flex-col gap-1.5">
                          {applicant.programs && applicant.programs.length > 0 ? (
                            applicant.programs
                              .sort((a, b) => a.priority - b.priority)
                              .map((prog) => (
                                <div key={prog.id} className="flex items-center gap-2 bg-slate-50 rounded-lg p-1.5">
                                  <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${getPriorityColorClass(prog.priority)}`}>
                                    {prog.priority}
                                  </span>
                                  <span className="text-xs font-medium text-slate-700 flex-1 truncate" title={prog.program}>
                                    {prog.program}
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                    prog.status === "new" ? "bg-yellow-100 text-yellow-800" :
                                    prog.status === "contacted" ? "bg-blue-100 text-blue-800" :
                                    prog.status === "documents_pending" ? "bg-purple-100 text-purple-800" :
                                    prog.status === "enrolled" ? "bg-green-100 text-green-800" :
                                    "bg-red-100 text-red-800"
                                  }`}>
                                    {getStatusLabel(prog.status)}
                                  </span>
                                </div>
                              ))
                          ) : (
                            <span className="text-xs text-slate-400">Нет программ</span>
                          )}
                        </div>
                      </td>
                      <td className="p-2" style={{ width: "100px" }}>
                        <PhoneCell phone={applicant.phone} />
                      </td>
                      <td className="p-2 text-center font-bold text-primary text-sm" style={{ width: "70px" }}>
                        {applicant.programs && applicant.programs.length > 0 
                          ? Math.max(...applicant.programs.map(p => p.exam_results || 0))
                          : 0}
                      </td>
                      <td className="p-2" style={{ width: "200px" }}>
                        <div className="flex gap-1 flex-wrap">
                          <button
                            onClick={() => handleEdit(applicant)}
                            className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 group"
                            title="Редактировать данные"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEditPrograms(applicant)}
                            className="p-1.5 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 group"
                            title="Редактировать программы"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3.707 9.707a1 1 0 001.414-1.414L8.586 10l1.414-1.414a1 1 0 00-1.414-1.414L7.172 8.586a1 1 0 000 1.414l1.414 1.414zm4 0a1 1 0 001.414-1.414L12.586 10l1.414-1.414a1 1 0 00-1.414-1.414L11.172 8.586a1 1 0 000 1.414l1.414 1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleManageExams(applicant.programs?.[0] || applicant)}
                            className="p-1.5 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 group"
                            title="Экзамены"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleManageDocuments(applicant.programs?.[0] || applicant)}
                            className="p-1.5 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 group"
                            title="Документы"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(applicant.programs?.[0] || applicant)}
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
                {applicants.map((applicant) => (
                  <div
                    key={`${applicant.phone}_${applicant.snils}`}
                    className="bg-white rounded-xl shadow-md border-2 border-slate-200 p-4 space-y-3"
                  >
                    {/* Заголовок карточки */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">{applicant.name}</h3>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="font-mono font-semibold text-slate-600">ID: {applicant.applicant_id || "-"}</span>
                          <span className="font-mono text-slate-600">СНИЛС: {applicant.snils || "-"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <span className="text-lg font-bold text-primary">
                          {applicant.programs && applicant.programs.length > 0 
                            ? Math.max(...applicant.programs.map(p => p.exam_results || 0))
                            : 0}
                        </span>
                      </div>
                    </div>

                    {/* Программы */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="mb-2">
                        <span className="text-sm font-semibold text-slate-700">Программы:</span>
                      </div>
                      <div className="space-y-2">
                        {applicant.programs && applicant.programs.length > 0 ? (
                          applicant.programs
                            .sort((a, b) => a.priority - b.priority)
                            .map((prog) => (
                              <div key={prog.id} className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
                                <div className="flex items-center justify-between mb-1.5">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold border shrink-0 ${getPriorityColorClass(prog.priority)}`}>
                                      {prog.priority}
                                    </span>
                                    <span className="text-sm font-medium text-slate-800 truncate flex-1" title={prog.program}>
                                      {prog.program}
                                    </span>
                                  </div>
                                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                                    prog.status === "new" ? "bg-yellow-100 text-yellow-800" :
                                    prog.status === "contacted" ? "bg-blue-100 text-blue-800" :
                                    prog.status === "documents_pending" ? "bg-purple-100 text-purple-800" :
                                    prog.status === "enrolled" ? "bg-green-100 text-green-800" :
                                    "bg-red-100 text-red-800"
                                  }`}>
                                    {getStatusLabel(prog.status)}
                                  </span>
                                </div>
                              </div>
                            ))
                        ) : (
                          <p className="text-sm text-slate-400">Нет программ</p>
                        )}
                      </div>
                    </div>

                    {/* Информация */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Телефон:</span>
                        <PhoneCell phone={applicant.phone} />
                      </div>
                      {applicant.email && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Email:</span>
                          <span className="text-sm font-medium text-slate-800">{applicant.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Кнопки действий */}
                    <div className="flex gap-2 pt-3 border-t border-slate-200">
                      <button
                        onClick={() => handleEdit(applicant)}
                        className="flex-1 px-3 py-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg text-xs font-medium flex items-center justify-center gap-1"
                      >
                        <EditIcon />
                        <span>Данные</span>
                      </button>
                      <button
                        onClick={() => handleEditPrograms(applicant)}
                        className="flex-1 px-3 py-2 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg text-xs font-medium flex items-center justify-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3.707 9.707a1 1 0 001.414-1.414L8.586 10l1.414-1.414a1 1 0 00-1.414-1.414L7.172 8.586a1 1 0 000 1.414l1.414 1.414zm4 0a1 1 0 001.414-1.414L12.586 10l1.414-1.414a1 1 0 00-1.414-1.414L11.172 8.586a1 1 0 000 1.414l1.414 1.414z" clipRule="evenodd" />
                        </svg>
                        <span>Программы</span>
                      </button>
                      <button
                        onClick={() => handleManageExams(applicant.programs?.[0] || applicant)}
                        className="flex-1 px-3 py-2 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg text-xs font-medium flex items-center justify-center gap-1"
                      >
                        <ExamIcon />
                        <span>Экзамены</span>
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleManageDocuments(applicant.programs?.[0] || applicant)}
                        className="flex-1 px-3 py-2 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg text-xs font-medium flex items-center justify-center gap-1"
                      >
                        <DocumentIcon />
                        <span>Документы</span>
                      </button>
                      <button
                        onClick={() => handleDelete(applicant.programs?.[0] || applicant)}
                        className="flex-1 px-3 py-2 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg text-xs font-medium flex items-center justify-center gap-1"
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
          <p className="text-slate-600 text-lg">Абитуриентов не найдено</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-primaryHover transition-all"
          >
            Добавить первого абитуриента
          </button>
        </div>
      )}

      {/* Модальное окно создания/редактирования */}
      {(showCreateModal || showEditModal) && (
        <ApplicantModal
          applicant={showEditModal ? selectedApplicant : null}
          programs={availablePrograms}
          onClose={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setSelectedApplicant(null);
          }}
          onSave={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setSelectedApplicant(null);
            loadApplicants();
          }}
          showNotification={showNotification}
        />
      )}

      {/* Модальное окно управления экзаменами */}
      {showExamsModal && selectedApplicant && (
        <ExamsModal
          applicant={selectedApplicant}
          onClose={() => {
            setShowExamsModal(false);
            setSelectedApplicant(null);
          }}
          onSave={() => {
            loadApplicants();
          }}
          showNotification={showNotification}
        />
      )}

      {/* Модальное окно управления документами */}
      {showDocumentsModal && selectedApplicant && (
        <DocumentsModal
          applicant={selectedApplicant}
          onClose={() => {
            setShowDocumentsModal(false);
            setSelectedApplicant(null);
          }}
          showNotification={showNotification}
        />
      )}

      {/* Модальное окно редактирования программ */}
      {showProgramsModal && selectedApplicant && (
        <ProgramsEditModal
          applicant={selectedApplicant}
          programs={availablePrograms}
          onClose={() => {
            setShowProgramsModal(false);
            setSelectedApplicant(null);
          }}
          onSave={() => {
            setShowProgramsModal(false);
            setSelectedApplicant(null);
            loadApplicants();
          }}
          showNotification={showNotification}
        />
      )}

      {/* Модальное окно удаления */}
      {showDeleteModal && selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-backdrop">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4 modal-content">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">
              Подтверждение удаления
            </h2>
            <p className="text-slate-600 mb-6">
              Вы уверены, что хотите удалить абитуриента{" "}
              <strong>{selectedApplicant.name}</strong>?
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
                  setSelectedApplicant(null);
                }}
                className="flex-1 px-4 py-3 bg-slate-200 text-slate-800 rounded-full hover:bg-slate-300 transition-all font-semibold"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Менеджер программ */}
      {showProgramsManager && (
        <ProgramsManager
          onClose={() => setShowProgramsManager(false)}
          onUpdate={() => {
            loadPrograms();
            loadApplicants();
          }}
          showNotification={showNotification}
          programs={availablePrograms}
        />
      )}

      {/* Модальное окно расчета зачисления */}
      {showEnrollmentModal && (
        <EnrollmentCalculationModal
          status={enrollmentStatus}
          onClose={handleCloseEnrollmentModal}
          onDownload={handleDownloadEnrollmentFile}
        />
      )}
    </section>
  );
}

// Модальное окно расчета зачисления
function EnrollmentCalculationModal({ status, onClose, onDownload }) {
  if (!status) return null;

  const isProcessing = status.status === "processing" || status.status === "pending";
  const isCompleted = status.status === "completed";
  const isError = status.status === "error";

  // Извлекаем имя файла из пути
  const getFilename = (filePath) => {
    if (!filePath) return null;
    return filePath.split("/").pop();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-backdrop">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 modal-content">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Расчет зачисления по алгоритму высшего приоритета
          </h2>

          {/* Описание алгоритма */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800 leading-relaxed">
              <strong>Алгоритм:</strong> Абитуриенты сортируются по убыванию баллов. Для каждого находится заявление 
              с наивысшим приоритетом (1 - высший) на программу с доступными местами. При зачислении остальные 
              заявления удаляются. Процесс повторяется до заполнения всех мест.
            </p>
            <p className="text-xs text-blue-600 mt-2 italic">
              По Приказу Минобрнауки России от 26.08.2022 № 814
            </p>
          </div>

          {/* Статус-бар */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">
                {status.message || "Обработка..."}
              </span>
              <span className="text-sm font-semibold text-slate-600">
                {status.progress || 0}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isError
                    ? "bg-red-500"
                    : isCompleted
                    ? "bg-green-500"
                    : "bg-blue-500"
                }`}
                style={{ width: `${status.progress || 0}%` }}
              />
            </div>
          </div>

          {/* Сообщение об ошибке */}
          {isError && status.error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{status.error}</p>
            </div>
          )}

          {/* Информация о завершении */}
          {isCompleted && status.file_path && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 mb-2">
                Расчет завершен успешно! Файл готов к скачиванию.
              </p>
              <button
                onClick={() => onDownload(getFilename(status.file_path))}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium"
              >
                Скачать Excel файл
              </button>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex gap-4 justify-end">
            {isCompleted && (
              <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-all font-medium"
              >
                Закрыть
              </button>
            )}
            {isError && (
              <button
                onClick={onClose}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium"
              >
                Закрыть
              </button>
            )}
            {isProcessing && (
              <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-all font-medium"
                disabled
              >
                Расчет выполняется...
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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

// Вспомогательные функции
function getSourceLabel(source) {
  const labels = {
    university: "ЕГЭ",
    college: "Колледж",
  };
  return labels[source] || source;
}

function getStatusLabel(status) {
  const labels = {
    new: "Новый",
    contacted: "Связались",
    documents_pending: "Ожидание",
    enrolled: "В конкурсе",
    rejected: "Отклонён",
  };
  return labels[status] || status;
}

function getPriorityColorClass(priority) {
  const priorityNum = parseInt(priority) || 3;
  if (priorityNum === 1) {
    return "bg-red-100 text-red-800 border-red-300";
  } else if (priorityNum === 2) {
    return "bg-orange-100 text-orange-800 border-orange-300";
  } else if (priorityNum === 3) {
    return "bg-yellow-100 text-yellow-800 border-yellow-300";
  } else if (priorityNum === 4) {
    return "bg-blue-100 text-blue-800 border-blue-300";
  } else {
    return "bg-gray-100 text-gray-800 border-gray-300";
  }
}

// Модальное окно создания/редактирования абитуриента
function ApplicantModal({ applicant, programs = [], onClose, onSave, showNotification }) {
  // Для группированных данных берем первую программу или используем данные напрямую
  const isGrouped = applicant && applicant.programs;
  const firstProgram = isGrouped && applicant.programs.length > 0 ? applicant.programs[0] : null;
  
  const editMode = applicant && (applicant.id || (isGrouped && firstProgram?.id));
  
  const [formData, setFormData] = useState({
    applicant_id: applicant?.applicant_id || "",
    name: applicant?.name || "",
    phone: applicant?.phone || "",
    snils: applicant?.snils || "",
    email: applicant?.email || "",
    program: firstProgram?.program || applicant?.program || "",
    source: firstProgram?.source || applicant?.source || "university",
    status: firstProgram?.status || applicant?.status || "new",
    priority: firstProgram?.priority || applicant?.priority || 3,
    comments: firstProgram?.comments || applicant?.comments || "",
    exam_results: firstProgram?.exam_results || applicant?.exam_results || "",
  });

  const [saving, setSaving] = useState(false);

  const validatePhone = (phone) => {
    if (!phone || phone === "") return false; // Телефон обязателен для абитуриентов
    // Формат: +7XXXXXXXXXX (11 цифр после +7)
    const phoneRegex = /^\+7\d{10}$/;
    return phoneRegex.test(phone);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "priority" ? parseInt(value) || 1 : 
              name === "exam_results" ? (value === "" ? "" : parseInt(value) || 0) :
              value,
    }));
  };

  const handlePhoneBlur = (e) => {
    const phone = e.target.value;
    if (!validatePhone(phone)) {
      showNotification("error", "Телефон должен быть в формате +7XXXXXXXXXX (11 цифр после +7)");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация телефона перед отправкой
    if (!validatePhone(formData.phone)) {
      showNotification("error", "Телефон должен быть в формате +7XXXXXXXXXX (11 цифр после +7)");
      return;
    }
    
    setSaving(true);

    try {
      const dataToSend = {};
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        // Для студентов из ЕГЭ отправляем exam_results, для колледжа - устанавливаем 0
        if (key === "exam_results") {
          if (formData.source === "university" && value !== "" && value !== null && value !== undefined) {
            dataToSend[key] = value;
          } else if (formData.source === "college") {
            // Для студентов из колледжа всегда устанавливаем 0
            dataToSend[key] = 0;
          }
        } else if (value !== "" && value !== null && value !== undefined) {
          dataToSend[key] = value;
        }
      });

      if (editMode) {
        // Для группированных данных обновляем все записи с этим телефоном
        if (isGrouped && applicant.programs && applicant.programs.length > 0) {
          // Обновляем только основные данные (имя, телефон, СНИЛС, email) для всех записей
          const basicData = {
            name: dataToSend.name,
            phone: dataToSend.phone,
            snils: dataToSend.snils,
            email: dataToSend.email || null,
          };
          
          // Обновляем каждую программу отдельно
          for (const prog of applicant.programs) {
            await applicantsService.updateApplicant(prog.id, basicData);
          }
          showNotification("success", "Данные абитуриента обновлены");
        } else {
          await applicantsService.updateApplicant(applicant.id, dataToSend);
          showNotification("success", "Абитуриент обновлён");
        }
      } else {
        await applicantsService.createApplicant(dataToSend);
        showNotification("success", "Абитуриент добавлен");
      }
      onSave();
    } catch (err) {
      showNotification("error", `Ошибка: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar modal-content">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
          <h2 className="text-2xl font-bold text-slate-800">
            {editMode ? (isGrouped ? "Редактировать данные абитуриента" : "Редактировать абитуриента") : "Новый абитуриент"}
          </h2>
          {isGrouped && (
            <p className="text-sm text-slate-600 mt-1">
              Редактирование основных данных (имя, телефон, СНИЛС, email)
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">ФИО *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Иванов Иван Иванович"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Телефон *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handlePhoneBlur}
                required
                pattern="\+7\d{10}"
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+79991234567"
              />
              <p className="mt-1 text-xs text-slate-500">Формат: +7XXXXXXXXXX (11 цифр после +7)</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">СНИЛС *</label>
              <input
                type="text"
                name="snils"
                value={formData.snils}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                placeholder="XXX-XXX-XXX XX"
                pattern="[0-9]{3}-[0-9]{3}-[0-9]{3} [0-9]{2}"
                title="Формат: XXX-XXX-XXX XX"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="email@example.com"
              />
            </div>

            {!isGrouped && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Программа *</label>
                  <select
                    name="program"
                    value={formData.program}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Выберите программу</option>
                    {programs.map(program => (
                      <option key={program.id} value={program.name}>
                        {program.name} (мест: {program.total_places})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {!isGrouped && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Источник</label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="university">ЕГЭ</option>
                    <option value="college">Колледж</option>
                  </select>
                </div>

                {formData.source === "university" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Общий балл *</label>
                    <input
                      type="number"
                      name="exam_results"
                      value={formData.exam_results}
                      onChange={(e) => setFormData(prev => ({ ...prev, exam_results: e.target.value ? parseInt(e.target.value) : "" }))}
                      required={formData.source === "university"}
                      min="0"
                      className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Введите общий балл"
                    />
                    <p className="text-xs text-slate-500 mt-1">Для студентов из ЕГЭ необходимо указать общий балл</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Статус</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="new">Новый</option>
                    <option value="contacted">Связались</option>
                    <option value="documents_pending">Ожидание документов</option>
                    <option value="enrolled">В конкурсе</option>
                    <option value="rejected">Отклонён</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Приоритет (1-5)</label>
                  <input
                    type="number"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    min="1"
                    max="5"
                    className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </>
            )}

            {isGrouped && (
              <div className="col-span-2">
                <p className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg">
                  <strong>Примечание:</strong> Для редактирования программ и приоритетов используйте кнопку "Редактировать программы" в таблице.
                </p>
              </div>
            )}

            {!editMode && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">ID абитуриента</label>
                <input
                  type="text"
                  name="applicant_id"
                  value={formData.applicant_id}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Генерируется автоматически"
                />
              </div>
            )}

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Комментарии</label>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                rows="3"
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Дополнительная информация"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-full hover:bg-primaryHover transition-all font-semibold disabled:opacity-50"
            >
              {saving ? "Сохранение..." : editMode ? "Сохранить" : "Создать"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-200 text-slate-800 rounded-full hover:bg-slate-300 transition-all font-semibold"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Модальное окно управления экзаменами
function ExamsModal({ applicant, onClose, onSave, showNotification }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddExam, setShowAddExam] = useState(false);
  const [newExam, setNewExam] = useState({
    subject: "",
    score: "",
    max_score: "100",
  });

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      const data = await applicantsService.getExams({ applicant_id: applicant.id, limit: 100 });
      setExams(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateTotalScore = async () => {
    // Для студентов из ЕГЭ не обновляем общий балл - он задан при создании
    const isFromUniversity = applicant.source === "university";
    if (isFromUniversity) {
      return;
    }

    // Подсчитываем общий балл из экзаменов
    const totalScore = exams.reduce((sum, exam) => sum + exam.score, 0);
    
    // Обновляем общий балл абитуриента только если он изменился
    if (totalScore !== applicant.exam_results) {
      try {
        await applicantsService.updateApplicant(applicant.id, { exam_results: totalScore });
      } catch (err) {
        console.error("Ошибка обновления общего балла:", err);
      }
    }
  };

  const handleAddExam = async (e) => {
    e.preventDefault();
    try {
      await applicantsService.createExam({
        applicant_id: applicant.id,
        subject: newExam.subject,
        score: parseFloat(newExam.score),
        max_score: parseFloat(newExam.max_score),
      });
      showNotification("success", "Экзамен добавлен");
      setNewExam({ subject: "", score: "", max_score: "100" });
      setShowAddExam(false);
      await loadExams();
      await updateTotalScore();
      onSave(); // Обновляем список абитуриентов
    } catch (err) {
      showNotification("error", `Ошибка: ${err.message}`);
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm("Удалить результат экзамена?")) return;
    try {
      await applicantsService.deleteExam(examId);
      showNotification("success", "Экзамен удалён");
      await loadExams();
      await updateTotalScore();
      onSave(); // Обновляем список абитуриентов
    } catch (err) {
      showNotification("error", `Ошибка: ${err.message}`);
    }
  };

  // Для студентов из ЕГЭ используем общий балл из applicant.exam_results
  // Для студентов из колледжа - подсчитываем из экзаменов (если экзаменов нет, то 0)
  const isFromUniversity = applicant.source === "university";
  const isFromCollege = applicant.source === "college";
  const totalScore = isFromUniversity 
    ? (applicant.exam_results || 0) 
    : (exams.length > 0 ? exams.reduce((sum, exam) => sum + exam.score, 0) : 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar modal-content">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
          <h2 className="text-2xl font-bold text-slate-800">
            Экзамены: {applicant.name}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {isFromUniversity 
              ? "Из ЕГЭ - общий балл указан при создании, редактирование недоступно" 
              : isFromCollege
              ? "Из колледжа - назначаем и выставляем баллы (баллы начисляются только через экзамены)"
              : ""}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Общий балл */}
          <div className={`p-4 rounded-xl text-center ${isFromUniversity ? "bg-blue-50 border-2 border-blue-200" : "bg-primary bg-opacity-10"}`}>
            <p className="text-sm text-slate-600">Общий балл</p>
            <p className={`text-4xl font-bold mt-2 ${isFromUniversity ? "text-blue-600" : "text-primary"}`}>
              {totalScore}
            </p>
            {isFromUniversity && (
              <p className="text-xs text-slate-500 mt-2">(Балл из ЕГЭ, редактирование недоступно)</p>
            )}
            {isFromCollege && exams.length === 0 && (
              <p className="text-xs text-slate-500 mt-2">(Баллы начисляются только через экзамены)</p>
            )}
          </div>

          {/* Список экзаменов */}
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : exams.length > 0 ? (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-800">Результаты экзаменов:</h3>
              {exams.map(exam => (
                <div key={exam.id} className={`flex items-center justify-between p-3 bg-slate-50 rounded-lg ${isFromUniversity ? "opacity-75" : ""}`}>
                  <div>
                    <p className="font-medium text-slate-800">{exam.subject}</p>
                    <p className="text-sm text-slate-600">
                      {exam.score} из {exam.max_score} баллов
                    </p>
                  </div>
                  {!isFromUniversity && (
                <button
                      onClick={() => handleDeleteExam(exam.id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                      title="Удалить экзамен"
                    >
                      <DeleteIcon />
                </button>
                  )}
                  {isFromUniversity && (
                    <span className="text-xs text-slate-400 px-2 py-1 bg-slate-200 rounded">
                      Только просмотр
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-4">
              {isFromUniversity ? "Экзамены не отображаются для студентов из ЕГЭ" : "Экзаменов пока нет"}
            </p>
          )}

          {/* Форма добавления экзамена - только для не-ЕГЭ студентов */}
          {!isFromUniversity && (
            <>
              {!showAddExam ? (
                <button
                  onClick={() => setShowAddExam(true)}
                  className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold"
                >
                  + Добавить экзамен
                </button>
              ) : (
            <form onSubmit={handleAddExam} className="p-4 bg-slate-50 rounded-lg space-y-3">
              <h4 className="font-semibold text-slate-800">Новый экзамен</h4>
              <input
                type="text"
                placeholder="Предмет (например: Математика)"
                value={newExam.subject}
                onChange={(e) => setNewExam(prev => ({ ...prev, subject: e.target.value }))}
                required
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Балл"
                  value={newExam.score}
                  onChange={(e) => setNewExam(prev => ({ ...prev, score: e.target.value }))}
                  required
                  min="0"
                  step="0.01"
                  className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="number"
                  placeholder="Макс. балл"
                  value={newExam.max_score}
                  onChange={(e) => setNewExam(prev => ({ ...prev, max_score: e.target.value }))}
                  required
                  min="1"
                  className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                  Добавить
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddExam(false);
                    setNewExam({ subject: "", score: "", max_score: "100" });
                  }}
                  className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
                >
                  Отмена
                </button>
              </div>
            </form>
              )}
            </>
          )}

          <div className="flex gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-200 text-slate-800 rounded-full hover:bg-slate-300 transition-all font-semibold"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Модальное окно управления документами
function DocumentsModal({ applicant, onClose, showNotification }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [newDocument, setNewDocument] = useState({
    document_type: "",
    document_name: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await applicantsService.getDocuments({ applicant_id: applicant.id, limit: 100 });
      setDocuments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      showNotification("error", "Пожалуйста, выберите файл для загрузки");
      return;
    }

    try {
      setUploading(true);
      await applicantsService.uploadDocument(
        selectedFile,
        applicant.id,
        newDocument.document_type,
        newDocument.document_name
      );
      showNotification("success", "Документ загружен");
      setNewDocument({ document_type: "", document_name: "" });
      setSelectedFile(null);
      setShowAddDocument(false);
      loadDocuments();
    } catch (err) {
      showNotification("error", `Ошибка: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Автоматически устанавливаем название документа из имени файла, если не указано
      if (!newDocument.document_name) {
        setNewDocument(prev => ({ ...prev, document_name: file.name }));
      }
    }
  };

  const handleVerifyDocument = async (docId) => {
    try {
      await applicantsService.updateDocument(docId, {
        status: "verified",
        verified_at: new Date().toISOString(),
      });
      showNotification("success", "Документ подтверждён");
      loadDocuments();
    } catch (err) {
      showNotification("error", `Ошибка: ${err.message}`);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm("Удалить документ?")) return;
    try {
      await applicantsService.deleteDocument(docId);
      showNotification("success", "Документ удалён");
      loadDocuments();
    } catch (err) {
      showNotification("error", `Ошибка: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar modal-content">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
          <h2 className="text-2xl font-bold text-slate-800">
            Документы: {applicant.name}
          </h2>
        </div>

        <div className="p-6 space-y-4">
          {/* Список документов */}
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : documents.length > 0 ? (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-800">Загруженные документы:</h3>
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{doc.document_name}</p>
                    <p className="text-sm text-slate-600">{doc.document_type}</p>
                    {doc.file_url && (
                      <a 
                        href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost'}:8004${doc.file_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 inline-block"
                      >
                        📄 Скачать файл
                      </a>
                    )}
                    <span className={`inline-block px-2 py-1 mt-1 rounded-full text-xs font-medium ${
                      doc.status === "verified" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {doc.status === "verified" ? "Подтверждён" : "На проверке"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {doc.status !== "verified" && (
                      <button
                        onClick={() => handleVerifyDocument(doc.id)}
                        className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xs"
                      >
                        Подтвердить
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <DeleteIcon />
                    </button>
            </div>
          </div>
        ))}
      </div>
          ) : (
            <p className="text-center text-slate-500 py-4">Документов пока нет</p>
          )}

          {/* Форма добавления документа */}
          {!showAddDocument ? (
            <button
              onClick={() => setShowAddDocument(true)}
              className="w-full py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all font-semibold"
            >
              + Добавить документ
            </button>
          ) : (
            <form onSubmit={handleAddDocument} className="p-4 bg-slate-50 rounded-lg space-y-3">
              <h4 className="font-semibold text-slate-800">Новый документ</h4>
              <select
                value={newDocument.document_type}
                onChange={(e) => setNewDocument(prev => ({ ...prev, document_type: e.target.value }))}
                required
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Выберите тип документа</option>
                <option value="passport">Паспорт</option>
                <option value="certificate">Аттестат</option>
                <option value="diploma">Диплом</option>
                <option value="photo">Фотография</option>
                <option value="other">Другое</option>
              </select>
              <input
                type="text"
                placeholder="Название документа"
                value={newDocument.document_name}
                onChange={(e) => setNewDocument(prev => ({ ...prev, document_name: e.target.value }))}
                required
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Файл документа *</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  required
                  className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                />
                {selectedFile && (
                  <p className="text-xs text-slate-500 mt-1">
                    Выбран файл: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                  disabled={uploading}
                >
                  {uploading ? "Загрузка..." : "Загрузить"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddDocument(false);
                    setNewDocument({ document_type: "", document_name: "" });
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
                  disabled={uploading}
                >
                  Отмена
                </button>
              </div>
            </form>
          )}

          <div className="flex gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-200 text-slate-800 rounded-full hover:bg-slate-300 transition-all font-semibold"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Менеджер программ
function ProgramsManager({ onClose, onUpdate, showNotification, programs: initialPrograms }) {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const data = await applicantsService.getPrograms({ limit: 1000 });
      setPrograms(data);
    } catch (err) {
      showNotification("error", "Не удалось загрузить программы");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (program) => {
    setSelectedProgram(program);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await applicantsService.deleteProgram(selectedProgram.id);
      showNotification("success", "Программа удалена");
      loadPrograms();
      onUpdate();
      setShowDeleteModal(false);
      setSelectedProgram(null);
    } catch (err) {
      showNotification("error", `Ошибка: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col modal-content">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">Управление программами</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primaryHover transition-all font-semibold"
              >
                + Добавить программу
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-600 hover:text-slate-800 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-600">Загрузка...</p>
            </div>
          ) : programs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 mb-4">Программ не найдено</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primaryHover transition-all"
              >
                Добавить первую программу
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {programs.map(program => (
                <div
                  key={program.id}
                  className={`p-6 rounded-xl border-2 ${
                    program.is_active === 1
                      ? "border-green-200 bg-green-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-800 mb-1">{program.name}</h3>
                      {program.description && (
                        <p className="text-sm text-slate-600 mb-3">{program.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedProgram(program);
                          setShowEditModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                        title="Редактировать"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => handleDelete(program)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                        title="Удалить"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-600">Всего мест:</span>
                      <span className="ml-2 font-semibold text-slate-800">{program.total_places}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Бюджет:</span>
                      <span className="ml-2 font-semibold text-green-600">{program.budget_places}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Платно:</span>
                      <span className="ml-2 font-semibold text-blue-600">{program.paid_places}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Мин. балл:</span>
                      <span className="ml-2 font-semibold text-slate-800">
                        {program.min_score || "—"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        program.is_active === 1
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {program.is_active === 1 ? "Активна" : "Неактивна"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно создания программы */}
      {showCreateModal && (
        <ProgramModal
          program={null}
          onClose={() => setShowCreateModal(false)}
          onSave={() => {
            setShowCreateModal(false);
            loadPrograms();
            onUpdate();
          }}
          showNotification={showNotification}
        />
      )}

      {/* Модальное окно редактирования программы */}
      {showEditModal && selectedProgram && (
        <ProgramModal
          program={selectedProgram}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProgram(null);
          }}
          onSave={() => {
            setShowEditModal(false);
            setSelectedProgram(null);
            loadPrograms();
            onUpdate();
          }}
          showNotification={showNotification}
        />
      )}

      {/* Модальное окно удаления */}
      {showDeleteModal && selectedProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Подтверждение удаления</h2>
            <p className="text-slate-600 mb-6">
              Вы уверены, что хотите удалить программу <strong>{selectedProgram.name}</strong>?
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
                  setSelectedProgram(null);
                }}
                className="flex-1 px-4 py-3 bg-slate-200 text-slate-800 rounded-full hover:bg-slate-300 transition-all font-semibold"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Модальное окно создания/редактирования программы
function ProgramModal({ program, onClose, onSave, showNotification }) {
  const editMode = program && program.id;

  const [formData, setFormData] = useState({
    name: program?.name || "",
    description: program?.description || "",
    total_places: program?.total_places || 0,
    budget_places: program?.budget_places || 0,
    paid_places: program?.paid_places || 0,
    is_active: program?.is_active !== undefined ? program.is_active : 1,
    min_score: program?.min_score || "",
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "is_active" || name.includes("places") || name === "min_score"
        ? (value === "" ? (name === "is_active" ? 1 : 0) : parseInt(value) || 0)
        : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const dataToSend = {
        ...formData,
        min_score: formData.min_score === "" ? null : formData.min_score,
      };

      if (editMode) {
        await applicantsService.updateProgram(program.id, dataToSend);
        showNotification("success", "Программа обновлена");
      } else {
        await applicantsService.createProgram(dataToSend);
        showNotification("success", "Программа добавлена");
      }
      onSave();
    } catch (err) {
      showNotification("error", `Ошибка: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
          <h2 className="text-2xl font-bold text-slate-800">
            {editMode ? "Редактировать программу" : "Новая программа"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Название программы *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Программная инженерия"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Описание</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Описание программы..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Всего мест *</label>
              <input
                type="number"
                name="total_places"
                value={formData.total_places}
                onChange={handleChange}
                required
                min="0"
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Бюджетных мест</label>
              <input
                type="number"
                name="budget_places"
                value={formData.budget_places}
                onChange={handleChange}
                min="0"
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Платных мест</label>
              <input
                type="number"
                name="paid_places"
                value={formData.paid_places}
                onChange={handleChange}
                min="0"
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Минимальный балл</label>
              <input
                type="number"
                name="min_score"
                value={formData.min_score}
                onChange={handleChange}
                min="0"
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Не указан"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Статус</label>
              <select
                name="is_active"
                value={formData.is_active}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={1}>Активна</option>
                <option value={0}>Неактивна</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-200 text-slate-800 rounded-full hover:bg-slate-300 transition-all font-semibold"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-full hover:bg-primaryHover transition-all font-semibold disabled:opacity-50"
            >
              {saving ? "Сохранение..." : editMode ? "Сохранить" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Модальное окно редактирования программ абитуриента
function ProgramsEditModal({ applicant, programs = [], onClose, onSave, showNotification }) {
  const [editingPrograms, setEditingPrograms] = useState(
    applicant.programs ? [...applicant.programs].sort((a, b) => a.priority - b.priority) : []
  );
  const [saving, setSaving] = useState(false);

  const handleProgramChange = (index, field, value) => {
    const updated = [...editingPrograms];
    const newValue = field === "priority" ? (value === "" ? null : parseInt(value) || 1) : value;
    
    updated[index] = {
      ...updated[index],
      [field]: newValue
    };
    
    setEditingPrograms(updated);
  };

  const handleAddProgram = () => {
    if (programs.length === 0) {
      showNotification("error", "Нет доступных программ");
      return;
    }
    
    // Находим следующий доступный приоритет
    const existingPriorities = editingPrograms.map(p => p.priority).filter(p => p !== null && p !== undefined);
    let nextPriority = 1;
    while (existingPriorities.includes(nextPriority)) {
      nextPriority++;
    }
    
    // Находим первую доступную программу, которая еще не выбрана
    const existingPrograms = editingPrograms.map(p => p.program).filter(Boolean);
    const availableProgram = programs.find(p => !existingPrograms.includes(p.name));
    
    if (!availableProgram) {
      showNotification("error", "Все доступные программы уже добавлены");
      return;
    }
    
    const newProgram = {
      id: null,
      program: availableProgram.name,
      priority: nextPriority,
      status: "new",
      exam_results: null,
      program_limit: null,
      source: "bot",
      comments: null,
      created_at: new Date(),
      updated_at: new Date()
    };
    setEditingPrograms([...editingPrograms, newProgram]);
  };

  const handleRemoveProgram = (index) => {
    const updated = editingPrograms.filter((_, i) => i !== index);
    setEditingPrograms(updated);
  };

  const validatePrograms = () => {
    // Проверка уникальности программ
    const programNames = editingPrograms.map(p => p.program).filter(Boolean);
    const uniquePrograms = new Set(programNames);
    if (programNames.length !== uniquePrograms.size) {
      showNotification("error", "Программы должны быть уникальными для каждого абитуриента");
      return false;
    }

    // Проверка уникальности приоритетов
    const priorities = editingPrograms.map(p => p.priority).filter(p => p !== null && p !== undefined);
    const uniquePriorities = new Set(priorities);
    if (priorities.length !== uniquePriorities.size) {
      showNotification("error", "Приоритеты должны быть уникальными для каждого абитуриента");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация перед отправкой
    if (!validatePrograms()) {
      return;
    }
    
    setSaving(true);

    try {
      const programsToUpdate = editingPrograms.map(prog => ({
        id: prog.id,
        program: prog.program,
        priority: prog.priority,
        status: prog.status
      }));

      await applicantsService.updateApplicantPrograms(applicant.phone, programsToUpdate);
      showNotification("success", "Программы успешно обновлены");
      onSave();
    } catch (err) {
      showNotification("error", `Ошибка: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 modal-backdrop">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto custom-scrollbar modal-content">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 sm:p-6 z-10">
          <h2 className="text-lg sm:text-2xl font-bold text-slate-800">
            Редактировать программы
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">{applicant.name}</p>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Телефон: {applicant.phone}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="space-y-2 sm:space-y-3">
            {editingPrograms.map((prog, index) => (
              <div key={index} className="bg-slate-50 rounded-lg p-3 sm:p-4 border-2 border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">Программа</label>
                    <select
                      value={prog.program}
                      onChange={(e) => handleProgramChange(index, "program", e.target.value)}
                      className={`w-full p-2 text-sm sm:text-base rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                        editingPrograms.filter((p, i) => i !== index && p.program === prog.program && p.program !== "").length > 0
                          ? "border-red-300 bg-red-50"
                          : "border-slate-200"
                      }`}
                      required
                    >
                      {programs.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    {editingPrograms.filter((p, i) => i !== index && p.program === prog.program && p.program !== "").length > 0 && (
                      <p className="text-xs text-red-600 mt-1">Программа уже выбрана</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">Приоритет</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={prog.priority || ""}
                      onChange={(e) => handleProgramChange(index, "priority", e.target.value)}
                      className={`w-full p-2 text-sm sm:text-base rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                        editingPrograms.filter((p, i) => i !== index && p.priority === prog.priority && p.priority !== null).length > 0
                          ? "border-red-300 bg-red-50"
                          : "border-slate-200"
                      }`}
                      required
                    />
                    {editingPrograms.filter((p, i) => i !== index && p.priority === prog.priority && p.priority !== null).length > 0 && (
                      <p className="text-xs text-red-600 mt-1">Приоритет уже используется</p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                  <div className="w-full sm:w-auto">
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">Статус</label>
                    <select
                      value={prog.status}
                      onChange={(e) => handleProgramChange(index, "status", e.target.value)}
                      className="w-full sm:w-auto p-2 text-sm sm:text-base rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="new">Новый</option>
                      <option value="contacted">Связались</option>
                      <option value="documents_pending">Ожидание</option>
                      <option value="enrolled">В конкурсе</option>
                      <option value="rejected">Отклонён</option>
                    </select>
                  </div>
                  {editingPrograms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProgram(index)}
                      className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all mt-2 sm:mt-0"
                    >
                      Удалить
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddProgram}
            className="w-full px-4 py-2.5 sm:py-2 text-sm sm:text-base bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-all font-medium"
          >
            + Добавить программу
          </button>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-sm sm:text-base bg-slate-200 text-slate-800 rounded-full hover:bg-slate-300 transition-all font-semibold"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving || editingPrograms.length === 0}
              className="flex-1 px-6 py-3 text-sm sm:text-base bg-primary text-white rounded-full hover:bg-primaryHover transition-all font-semibold disabled:opacity-50"
            >
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
