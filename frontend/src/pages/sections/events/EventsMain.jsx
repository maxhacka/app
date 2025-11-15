import React, { useState, useEffect } from "react";
import eventsService from "../../../services/eventsService";

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

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
  </svg>
);

export default function EventsMain() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Фильтры
  const [filters, setFilters] = useState({
    category: "",
    status: "",
    searchTitle: "",
    date_from: "",
    date_to: "",
  });
  
  // Сортировка
  const [sortBy, setSortBy] = useState("date_asc");
  
  // Показать расширенные фильтры
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Модальные окна
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Уведомления
  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventsService.getEvents({
        category: filters.category || undefined,
        status: filters.status || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
        limit: 1000,
      });
      setEvents(data);
    } catch (err) {
      setError("Не удалось загрузить мероприятия");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 4000);
  };

  // Фильтрация по названию на клиенте
  const filteredEvents = events.filter(event => {
    if (filters.searchTitle) {
      return event.title.toLowerCase().includes(filters.searchTitle.toLowerCase());
    }
    return true;
  });

  // Сортировка
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case "date_asc":
        return new Date(a.date) - new Date(b.date);
      case "date_desc":
        return new Date(b.date) - new Date(a.date);
      case "title_asc":
        return a.title.localeCompare(b.title);
      case "title_desc":
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const handleDelete = (event) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await eventsService.deleteEvent(selectedEvent.id);
      showNotification("success", "Мероприятие успешно удалено");
      setShowDeleteModal(false);
      setSelectedEvent(null);
      loadEvents();
    } catch (err) {
      showNotification("error", `Ошибка при удалении: ${err.message}`);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Загрузка мероприятий...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto space-y-4 lg:space-y-6 p-4 lg:p-6">
      {/* Уведомления */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`rounded-lg shadow-xl p-4 flex items-center gap-3 min-w-[300px] max-w-md ${
            notification.type === "success" 
              ? "bg-green-500 text-white" 
              : notification.type === "error"
              ? "bg-red-500 text-white"
              : "bg-blue-500 text-white"
          }`}>
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

      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 lg:mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Мероприятия</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto px-4 lg:px-6 py-3 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-purple-200/50 transition-all duration-300 shadow-lg relative overflow-hidden group text-sm lg:text-base"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <span className="relative z-10 flex items-center justify-center gap-2">
            <svg className="w-4 h-4 lg:w-5 lg:h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Создать мероприятие
          </span>
        </button>
      </div>

      {/* Фильтры */}
      <div className="bg-white p-4 lg:p-6 rounded-xl lg:rounded-2xl shadow-md border-2 border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h3 className="font-semibold text-base lg:text-lg text-slate-800">Поиск и фильтры</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="w-full sm:w-auto px-4 py-2.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-all font-medium text-slate-700"
            >
              {showAdvancedFilters ? "Скрыть даты" : "Показать фильтры по дате"}
            </button>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Сортировка:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="date_asc">Дата: сначала ранние</option>
                <option value="date_desc">Дата: сначала поздние</option>
                <option value="title_asc">Название: А-Я</option>
                <option value="title_desc">Название: Я-А</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Основные фильтры */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Поиск по названию</label>
            <input
              type="text"
              value={filters.searchTitle}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTitle: e.target.value }))}
              placeholder="Введите название..."
              className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Категория</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Все категории</option>
              <option value="conference">Конференция</option>
              <option value="workshop">Мастер-класс</option>
              <option value="seminar">Семинар</option>
              <option value="competition">Конкурс</option>
              <option value="exhibition">Выставка</option>
              <option value="other">Другое</option>
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
              <option value="published">Опубликовано</option>
              <option value="draft">Черновик</option>
              <option value="completed">Завершено</option>
              <option value="cancelled">Отменено</option>
            </select>
          </div>
        </div>

        {/* Расширенные фильтры - даты */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Дата от</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Дата до</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={loadEvents}
            className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primaryHover transition-all"
          >
            Применить фильтры
          </button>
          <button
            onClick={() => {
              setFilters({
                category: "",
                status: "",
                searchTitle: "",
                date_from: "",
                date_to: "",
              });
            }}
            className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-all"
          >
            Сбросить
          </button>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            Найдено: <strong>{sortedEvents.length}</strong> из <strong>{events.length}</strong>
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Сетка мероприятий с вертикальной прокруткой */}
      {sortedEvents.length > 0 ? (
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-md border-2 border-slate-200 overflow-hidden">
          <div className="overflow-y-auto custom-scrollbar p-4 lg:p-6" style={{ maxHeight: "calc(100vh - 400px)" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {sortedEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl lg:rounded-2xl shadow-md border-2 border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
                  style={{ minHeight: "400px", height: "auto" }}
                >
                  {/* Изображение */}
                  {event.image_url && (
                    <div className="h-40 bg-gradient-to-br from-primary to-primaryHover overflow-hidden flex-shrink-0">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  {!event.image_url && (
                    <div className="h-40 bg-gradient-to-br from-primary to-primaryHover flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-5xl">📅</span>
                    </div>
                  )}

                  {/* Контент */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col overflow-hidden">
                    {/* Заголовок */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-slate-800 line-clamp-2 flex-1">
                        {event.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                        event.status === "published" 
                          ? "bg-green-100 text-green-800"
                          : event.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : event.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {event.status === "published" && "Опубликовано"}
                        {event.status === "draft" && "Черновик"}
                        {event.status === "completed" && "Завершено"}
                        {event.status === "cancelled" && "Отменено"}
                      </span>
                    </div>

                    {/* Категория */}
                    <div>
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                        {getCategoryLabel(event.category)}
                      </span>
                    </div>

                    {/* Описание */}
                    <div className="flex-1 overflow-hidden">
                      {event.description && (
                        <p className="text-sm text-slate-600 line-clamp-3">
                          {event.description}
                        </p>
                      )}
                    </div>

                    {/* Информация */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <CalendarIcon />
                        <span className="text-xs">{formatDate(event.date)} в {event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <LocationIcon />
                        <span className="truncate text-xs">{event.location}</span>
                      </div>
                      {event.max_participants && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <UsersIcon />
                          <span className="text-xs">{event.participants_count || 0} / {event.max_participants}</span>
                        </div>
                      )}
                      {event.organizer && (
                        <div className="text-slate-500 text-xs truncate">
                          Организатор: {event.organizer}
                        </div>
                      )}
                    </div>

                    {/* Кнопки действий */}
                    <div className="flex gap-2 pt-3 border-t border-slate-200 mt-auto">
                      <button
                        onClick={() => handleEdit(event)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg group"
                      >
                        <EditIcon />
                        <span className="text-sm font-medium">Изменить</span>
                      </button>
                      <button
                        onClick={() => handleDelete(event)}
                        className="px-4 py-2 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg group"
                        title="Удалить"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center">
          <p className="text-slate-600 text-lg">Мероприятия не найдены</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-purple-200/50 transition-all duration-300 shadow-lg relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Создать первое мероприятие
            </span>
          </button>
        </div>
      )}

      {/* Модальное окно создания */}
      {showCreateModal && (
        <EventModal
          onClose={() => setShowCreateModal(false)}
          onSave={() => {
            setShowCreateModal(false);
            loadEvents();
          }}
          showNotification={showNotification}
        />
      )}

      {/* Модальное окно редактирования */}
      {showEditModal && selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEvent(null);
          }}
          onSave={() => {
            setShowEditModal(false);
            setSelectedEvent(null);
            loadEvents();
          }}
          showNotification={showNotification}
        />
      )}

      {/* Модальное окно удаления */}
      {showDeleteModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">
              Подтверждение удаления
            </h2>
            <p className="text-slate-600 mb-6">
              Вы уверены, что хотите удалить мероприятие{" "}
              <strong>{selectedEvent.title}</strong>?
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
                  setSelectedEvent(null);
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

// Вспомогательная функция для получения названия категории
function getCategoryLabel(category) {
  const labels = {
    conference: "Конференция",
    workshop: "Мастер-класс",
    seminar: "Семинар",
    competition: "Конкурс",
    exhibition: "Выставка",
    other: "Другое",
  };
  return labels[category] || category;
}

// Модальное окно для создания/редактирования мероприятия
function EventModal({ event, onClose, onSave, showNotification }) {
  const editMode = event && event.id;
  
  const initialData = {
    title: event?.title || "",
    description: event?.description || "",
    date: event?.date || new Date().toISOString().split('T')[0],
    time: event?.time || "10:00",
    location: event?.location || "",
    category: event?.category || "conference",
    image_url: event?.image_url || "",
    max_participants: event?.max_participants || null,
    registration_url: event?.registration_url || "",
    status: event?.status || "published",
    tags: event?.tags || "",
    organizer: event?.organizer || "",
  };
  
  const [formData, setFormData] = useState(initialData);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "max_participants" ? (value ? parseInt(value) : null) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let dataToSend = {};

      if (editMode) {
        // При редактировании отправляем всю форму
        Object.keys(formData).forEach(key => {
          const value = formData[key];
          if (value !== "" && value !== null && value !== undefined) {
            dataToSend[key] = value;
          }
        });
      } else {
        // При создании отправляем все непустые поля
        Object.keys(formData).forEach(key => {
          const value = formData[key];
          if (value !== "" && value !== null && value !== undefined) {
            dataToSend[key] = value;
          }
        });
        
        // Убираем participants_count при создании
        delete dataToSend.participants_count;
      }

      if (editMode) {
        await eventsService.updateEvent(event.id, dataToSend);
        showNotification("success", "Мероприятие обновлено");
      } else {
        await eventsService.createEvent(dataToSend);
        showNotification("success", "Мероприятие создано");
      }
      onSave();
    } catch (err) {
      console.error("Error details:", err);
      showNotification("error", `Ошибка: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
          <h2 className="text-2xl font-bold text-slate-800">
            {editMode ? "Редактировать мероприятие" : "Новое мероприятие"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Название мероприятия *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Введите название"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Описание
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Описание мероприятия"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Дата *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Время *</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Место проведения *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Адрес или аудитория"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Категория *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="conference">Конференция</option>
                <option value="workshop">Мастер-класс</option>
                <option value="seminar">Семинар</option>
                <option value="competition">Конкурс</option>
                <option value="exhibition">Выставка</option>
                <option value="other">Другое</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Статус</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="published">Опубликовано</option>
                <option value="draft">Черновик</option>
                <option value="completed">Завершено</option>
                <option value="cancelled">Отменено</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Максимум участников
              </label>
              <input
                type="number"
                name="max_participants"
                value={formData.max_participants || ""}
                onChange={handleChange}
                min="1"
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Не ограничено"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Организатор
              </label>
              <input
                type="text"
                name="organizer"
                value={formData.organizer}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Имя организатора"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                URL изображения
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Ссылка для регистрации
              </label>
              <input
                type="url"
                name="registration_url"
                value={formData.registration_url}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://example.com/register"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Теги (через запятую)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="наука, образование, технологии"
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
