import React, { useState, useEffect } from "react";
import timetableService from "../../../services/timetableService";
import staffService from "../../../services/staffService";

// Дни недели
const DAYS = [
  { key: "monday", label: "Понедельник", short: "ПН", offset: 0 },
  { key: "tuesday", label: "Вторник", short: "ВТ", offset: 1 },
  { key: "wednesday", label: "Среда", short: "СР", offset: 2 },
  { key: "thursday", label: "Четверг", short: "ЧТ", offset: 3 },
  { key: "friday", label: "Пятница", short: "ПТ", offset: 4 },
  { key: "saturday", label: "Суббота", short: "СБ", offset: 5 },
];

// Вспомогательные функции для работы с датами
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Корректировка для воскресенья
  return new Date(d.setDate(diff));
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}`;
}

function formatDateFull(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function isSameDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

function isToday(date) {
  return isSameDay(date, new Date());
}

// Временные слоты (с 8:00 до 20:00)
const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

export default function TimetableMain() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [availableGroups, setAvailableGroups] = useState([]);
  
  // Навигация по неделям
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));
  
  // Модальные окна
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  
  // Drag and drop
  const [draggedLesson, setDraggedLesson] = useState(null);
  
  // Мобильная навигация по дням
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Уведомления
  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadSchedules();
    }
  }, [selectedGroup, currentWeekStart]);

  const loadGroups = async () => {
    try {
      // Загружаем группы из таблицы групп (только активные)
      const groups = await timetableService.getGroups({ is_active: 1, limit: 100 });
      
      setAvailableGroups(groups);
      
      if (groups.length > 0 && !selectedGroup) {
        setSelectedGroup(groups[0]);
      }
    } catch (err) {
      console.error("Не удалось загрузить группы:", err);
      showNotification("error", "Не удалось загрузить список групп");
    }
  };

  const loadSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Загружаем расписание для каждого дня недели
      const weekDates = getWeekDates();
      const allSchedules = [];
      
      for (const date of weekDates) {
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        try {
          const data = await timetableService.getSchedules({
            group_name: selectedGroup,
            date_created_on: dateStr,
            limit: 100
          });
          allSchedules.push(...data);
        } catch (err) {
          console.error(`Ошибка загрузки расписания для ${dateStr}:`, err);
        }
      }
      
      setSchedules(allSchedules);
    } catch (err) {
      setError("Не удалось загрузить расписание");
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

  // Навигация по неделям
  const goToPreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(getMonday(new Date()));
  };

  // Получить даты для текущей недели
  const getWeekDates = () => {
    return DAYS.map(day => addDays(currentWeekStart, day.offset));
  };

  // Получить занятия для конкретного дня и времени
  const getLessonsForSlot = (dayKey, time) => {
    return schedules.filter(lesson => {
      if (lesson.day_of_week.toLowerCase() !== dayKey) return false;
      const lessonStart = lesson.time_start.substring(0, 5);
      return lessonStart === time;
    });
  };

  // Drag and Drop handlers (только для десктопа)
  const handleDragStart = (e, lesson) => {
    // Отключаем drag and drop на мобильных
    if (window.innerWidth < 1024) {
      e.preventDefault();
      return;
    }
    setDraggedLesson(lesson);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    // Отключаем drag and drop на мобильных
    if (window.innerWidth < 1024) {
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, dayKey, timeSlot, dayDate) => {
    // Отключаем drag and drop на мобильных
    if (window.innerWidth < 1024) {
      return;
    }
    e.preventDefault();
    
    if (!draggedLesson) return;

    try {
      // Вычисляем новое время окончания на основе продолжительности
      const [oldStartHour, oldStartMin] = draggedLesson.time_start.split(':').map(Number);
      const [oldEndHour, oldEndMin] = draggedLesson.time_end.split(':').map(Number);
      const durationMinutes = (oldEndHour * 60 + oldEndMin) - (oldStartHour * 60 + oldStartMin);
      
      const [newStartHour, newStartMin] = timeSlot.split(':').map(Number);
      const newEndMinutes = (newStartHour * 60 + newStartMin) + durationMinutes;
      const newEndHour = Math.floor(newEndMinutes / 60);
      const newEndMin = newEndMinutes % 60;
      const newTimeEnd = `${String(newEndHour).padStart(2, '0')}:${String(newEndMin).padStart(2, '0')}`;

      // Обновляем занятие с новым временем, днём и датой
      const updatedData = {
        day_of_week: dayKey,
        time_start: timeSlot,
        time_end: newTimeEnd,
        date_created_on: dayDate.toISOString().split('T')[0],
      };

      await timetableService.updateSchedule(draggedLesson.id, updatedData);
      showNotification("success", "Занятие перемещено");
      loadSchedules();
    } catch (err) {
      showNotification("error", `Ошибка при перемещении: ${err.message}`);
    } finally {
      setDraggedLesson(null);
    }
  };
  
  // Навигация по дням для мобильных
  const goToPreviousDay = () => {
    setSelectedDayIndex(prev => Math.max(0, prev - 1));
  };

  const goToNextDay = () => {
    setSelectedDayIndex(prev => Math.min(DAYS.length - 1, prev + 1));
  };

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson);
    setShowEditModal(true);
  };

  const handleCellClick = (dayKey, timeSlot, dayDate) => {
    // Открываем модальное окно создания с предзаполненными данными
    setSelectedLesson({
      group_name: selectedGroup,
      day_of_week: dayKey,
      time_start: timeSlot,
      time_end: calculateEndTime(timeSlot, 90), // По умолчанию 1.5 часа (90 минут)
      date_created_on: dayDate.toISOString().split('T')[0],
    });
    setShowCreateModal(true);
  };

  const calculateEndTime = (startTime, durationMinutes) => {
    const [hour, min] = startTime.split(':').map(Number);
    const totalMinutes = hour * 60 + min + durationMinutes;
    const endHour = Math.floor(totalMinutes / 60);
    const endMin = totalMinutes % 60;
    return `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("Вы уверены, что хотите удалить это занятие?")) return;
    
    try {
      await timetableService.deleteSchedule(lessonId);
      showNotification("success", "Занятие удалено");
      loadSchedules();
      setShowEditModal(false);
    } catch (err) {
      showNotification("error", `Ошибка при удалении: ${err.message}`);
    }
  };

  // Вычислить высоту занятия в пикселях
  const calculateLessonHeight = (startTime, endTime) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    return (duration / 60) * 60; // 60px = 1 час
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Загрузка расписания...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-full mx-auto p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* Уведомления */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`rounded-lg shadow-xl p-4 flex items-center gap-3 min-w-[300px] ${
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

      {/* Заголовок и фильтры */}
      <div className="bg-white rounded-xl lg:rounded-2xl shadow-md border-2 border-slate-200 p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Расписание занятий</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto px-4 lg:px-6 py-3 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-purple-200/50 transition-all duration-300 shadow-lg relative overflow-hidden group text-sm lg:text-base"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              <svg className="w-4 h-4 lg:w-5 lg:h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Добавить занятие
            </span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Фильтр по группам */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            <label className="font-medium text-slate-700 whitespace-nowrap">Группа:</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm lg:text-base"
            >
              {availableGroups.length === 0 ? (
                <option value="">Загрузка групп...</option>
              ) : (
                availableGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))
              )}
            </select>
          </div>

          {/* Навигация по неделям */}
          <div className="flex items-center gap-2 lg:gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <button
              onClick={goToPreviousWeek}
              className="p-2 hover:bg-slate-100 rounded-lg transition-all"
              title="Предыдущая неделя"
            >
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="text-center px-2 lg:px-4 flex-1">
              <div className="font-semibold text-slate-800 text-sm lg:text-base">
                <span className="hidden sm:inline">{formatDateFull(currentWeekStart)} - {formatDateFull(addDays(currentWeekStart, 5))}</span>
                <span className="sm:hidden">{formatDate(currentWeekStart)} - {formatDate(addDays(currentWeekStart, 5))}</span>
              </div>
              <button
                onClick={goToCurrentWeek}
                className="text-xs lg:text-sm text-primary hover:underline"
              >
                Текущая неделя
              </button>
            </div>

            <button
              onClick={goToNextWeek}
              className="p-2 hover:bg-slate-100 rounded-lg transition-all"
              title="Следующая неделя"
            >
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Десктоп: Календарь в стиле Apple */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-md border-2 border-slate-200 overflow-hidden">
        <div className="overflow-auto custom-scrollbar" style={{ maxHeight: "calc(100vh - 350px)" }}>
          <div className="min-w-[1200px]">
            {/* Заголовки дней */}
            <div className="grid grid-cols-7 border-b-2 border-slate-200 bg-slate-50 sticky top-0 z-20">
              <div className="p-4 border-r border-slate-200 font-semibold text-slate-500 text-sm">
                Время
              </div>
              {DAYS.map((day, index) => {
                const dayDate = addDays(currentWeekStart, day.offset);
                const todayHighlight = isToday(dayDate);
                
                return (
                  <div 
                    key={day.key} 
                    className={`p-4 border-r border-slate-200 text-center ${
                      todayHighlight ? 'bg-primary bg-opacity-10' : ''
                    }`}
                  >
                    <div className={`font-bold ${todayHighlight ? 'text-primary' : 'text-slate-800'}`}>
                      {day.short}
                    </div>
                    <div className={`text-sm ${todayHighlight ? 'text-primary font-semibold' : 'text-slate-500'}`}>
                      {formatDate(dayDate)}
                    </div>
                    <div className="text-xs text-slate-400">{day.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Временные слоты */}
            {TIME_SLOTS.map((time, index) => (
              <div key={time} className="grid grid-cols-7 border-b border-slate-100 relative" style={{ minHeight: "60px" }}>
                {/* Колонка времени */}
                <div className="p-2 border-r border-slate-200 flex items-start justify-end pr-4 text-sm text-slate-500 font-medium bg-slate-50">
                  {time}
                </div>

                {/* Колонки дней */}
                {DAYS.map(day => {
                  const lessons = getLessonsForSlot(day.key, time);
                  const dayDate = addDays(currentWeekStart, day.offset);
                  const todayHighlight = isToday(dayDate);
                  
                  return (
                    <div
                      key={`${day.key}-${time}`}
                      className={`border-r border-slate-100 p-1 relative hover:bg-slate-50 transition-colors cursor-pointer ${
                        todayHighlight ? 'bg-primary bg-opacity-5' : ''
                      }`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, day.key, time, dayDate)}
                      onClick={(e) => {
                        // Если клик не на занятие, создаём новое
                        if (e.target === e.currentTarget || e.target.closest('.lesson-card') === null) {
                          handleCellClick(day.key, time, dayDate);
                        }
                      }}
                    >
                      {lessons.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-xs text-slate-400">+ Добавить</span>
                        </div>
                      )}
                      {lessons.map(lesson => {
                        const height = calculateLessonHeight(lesson.time_start, lesson.time_end);
                        return (
                          <div
                            key={lesson.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, lesson)}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLessonClick(lesson);
                            }}
                            className="lesson-card absolute left-1 right-1 rounded-lg p-2 cursor-move shadow-sm hover:shadow-md transition-all border-l-4"
                            style={{
                              height: `${height}px`,
                              backgroundColor: getColorForType(lesson.type),
                              borderLeftColor: getBorderColorForType(lesson.type),
                            }}
                          >
                            <div className="text-xs font-bold text-slate-800 truncate">
                              {lesson.subject}
                            </div>
                            <div className="text-xs text-slate-600 truncate">
                              {lesson.time_start} - {lesson.time_end}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              {lesson.room}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              {lesson.teacher}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Мобильная версия: слайдер дней */}
      <div className="lg:hidden bg-white rounded-xl shadow-md border-2 border-slate-200 overflow-hidden">
        {/* Навигация по дням */}
        <div className="bg-slate-50 border-b-2 border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={goToPreviousDay}
              disabled={selectedDayIndex === 0}
              className="p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200"
            >
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex-1 text-center px-4">
              {DAYS.map((day, index) => {
                if (index !== selectedDayIndex) return null;
                const dayDate = addDays(currentWeekStart, day.offset);
                const todayHighlight = isToday(dayDate);
                return (
                  <div key={day.key}>
                    <div className={`font-bold text-lg ${todayHighlight ? 'text-primary' : 'text-slate-800'}`}>
                      {day.label}
                    </div>
                    <div className={`text-sm ${todayHighlight ? 'text-primary font-semibold' : 'text-slate-500'}`}>
                      {formatDate(dayDate)}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={goToNextDay}
              disabled={selectedDayIndex === DAYS.length - 1}
              className="p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200"
            >
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Индикаторы дней */}
          <div className="flex justify-center gap-2">
            {DAYS.map((day, index) => {
              const dayDate = addDays(currentWeekStart, day.offset);
              const todayHighlight = isToday(dayDate);
              return (
                <button
                  key={day.key}
                  onClick={() => setSelectedDayIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === selectedDayIndex
                      ? todayHighlight
                        ? 'bg-primary w-8'
                        : 'bg-slate-600 w-8'
                      : todayHighlight
                        ? 'bg-primary/30 w-2'
                        : 'bg-slate-300 w-2'
                  }`}
                  aria-label={day.label}
                />
              );
            })}
          </div>
        </div>

        {/* Расписание для выбранного дня */}
        <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: "calc(100vh - 300px)" }}>
          <div className="p-4">
            {TIME_SLOTS.map((time) => {
              const selectedDay = DAYS[selectedDayIndex];
              const lessons = getLessonsForSlot(selectedDay.key, time);
              const dayDate = addDays(currentWeekStart, selectedDay.offset);
              const todayHighlight = isToday(dayDate);
              
              return (
                <div
                  key={time}
                  className={`mb-2 p-3 rounded-lg border-2 transition-colors ${
                    todayHighlight ? 'border-primary/30 bg-primary/5' : 'border-slate-200 bg-slate-50'
                  }`}
                  onClick={(e) => {
                    if (e.target === e.currentTarget || e.target.closest('.lesson-item') === null) {
                      handleCellClick(selectedDay.key, time, dayDate);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`font-semibold text-sm min-w-[60px] ${
                      todayHighlight ? 'text-primary' : 'text-slate-600'
                    }`}>
                      {time}
                    </div>
                    <div className="flex-1">
                      {lessons.length === 0 ? (
                        <div className="text-xs text-slate-400 py-2">
                          Нет занятий
                        </div>
                      ) : (
                        lessons.map(lesson => (
                          <div
                            key={lesson.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLessonClick(lesson);
                            }}
                            className="lesson-item mb-2 last:mb-0 p-3 rounded-lg shadow-sm border-l-4 cursor-pointer hover:shadow-md transition-all"
                            style={{
                              backgroundColor: getColorForType(lesson.type),
                              borderLeftColor: getBorderColorForType(lesson.type),
                            }}
                          >
                            <div className="font-bold text-sm text-slate-800 mb-1">
                              {lesson.subject}
                            </div>
                            <div className="text-xs text-slate-600 mb-1">
                              {lesson.time_start} - {lesson.time_end}
                            </div>
                            <div className="text-xs text-slate-500">
                              {lesson.room} • {lesson.teacher}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Модальное окно создания занятия */}
      {showCreateModal && (
        <LessonModal
          prefilledData={selectedLesson}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedLesson(null);
          }}
          onSave={loadSchedules}
          showNotification={showNotification}
          selectedGroup={selectedGroup}
        />
      )}

      {/* Модальное окно редактирования занятия */}
      {showEditModal && selectedLesson && (
        <LessonModal
          lesson={selectedLesson}
          onClose={() => {
            setShowEditModal(false);
            setSelectedLesson(null);
          }}
          onSave={loadSchedules}
          onDelete={() => handleDeleteLesson(selectedLesson.id)}
          showNotification={showNotification}
          selectedGroup={selectedGroup}
        />
      )}
    </section>
  );
}

// Вспомогательные функции для цветов
function getColorForType(type) {
  const colors = {
    lecture: "#DBEAFE",      // blue-100
    practice: "#D1FAE5",     // green-100
    lab: "#FEF3C7",          // yellow-100
    seminar: "#FCE7F3",      // pink-100
  };
  return colors[type] || "#F3F4F6"; // gray-100
}

function getBorderColorForType(type) {
  const colors = {
    lecture: "#3B82F6",      // blue-500
    practice: "#10B981",     // green-500
    lab: "#F59E0B",          // yellow-500
    seminar: "#EC4899",      // pink-500
  };
  return colors[type] || "#6B7280"; // gray-500
}

// Модальное окно для создания/редактирования занятия
function LessonModal({ lesson, prefilledData, onClose, onSave, onDelete, showNotification, selectedGroup }) {
  // lesson - существующее занятие для редактирования (с id)
  // prefilledData - предзаполненные данные для создания (без id)
  const editMode = lesson && lesson.id;
  const initialData = lesson || prefilledData || {};
  
  const [formData, setFormData] = useState({
    group_name: initialData.group_name || selectedGroup || "",
    day_of_week: initialData.day_of_week || "monday",
    time_start: initialData.time_start || "08:00",
    time_end: initialData.time_end || "09:30",
    subject: initialData.subject || "",
    teacher: initialData.teacher || "",
    teacher_id: initialData.teacher_id || null,
    room: initialData.room || "",
    type: initialData.type || "lecture",
    week_type: initialData.week_type || null,
    date_created_on: initialData.date_created_on || new Date().toISOString().split('T')[0],
  });

  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState("");
  
  // Списки для выбора
  const [availableGroups, setAvailableGroups] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setLoadingData(true);
      const [groups, subjects, teachers] = await Promise.all([
        timetableService.getGroups({ is_active: 1, limit: 100 }),
        timetableService.getSubjects({ is_active: 1, limit: 100 }),
        staffService.getTeachers({ limit: 1000 })
      ]);
      setAvailableGroups(groups);
      setAvailableSubjects(subjects);
      setAvailableTeachers(teachers);
    } catch (err) {
      console.error("Ошибка загрузки данных формы:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { [name]: value };
    
    // При выборе преподавателя, обновляем и teacher_id и teacher
    if (name === "teacher_id") {
      const selectedTeacher = availableTeachers.find(t => t.id === parseInt(value));
      if (selectedTeacher) {
        updatedData.teacher = selectedTeacher.name;
      }
    }
    
    // При изменении даты, автоматически определяем день недели
    if (name === "date_created_on") {
      const date = new Date(value);
      const dayOfWeek = date.getDay();
      const dayKeys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      updatedData.day_of_week = dayKeys[dayOfWeek];
    }
    
    setFormData(prev => ({ ...prev, ...updatedData }));
    
    // Очистить ошибку валидации при изменении
    if (validationError) {
      setValidationError("");
    }
  };

  const validateTimes = () => {
    const [startHour, startMin] = formData.time_start.split(':').map(Number);
    const [endHour, endMin] = formData.time_end.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (endMinutes <= startMinutes) {
      setValidationError("Время окончания должно быть позже времени начала");
      return false;
    }
    
    setValidationError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация времени
    if (!validateTimes()) {
      return;
    }
    
    setSaving(true);

    try {
      if (editMode) {
        await timetableService.updateSchedule(lesson.id, formData);
        showNotification("success", "Занятие обновлено");
      } else {
        await timetableService.createSchedule(formData);
        showNotification("success", "Занятие создано");
      }
      onSave();
      onClose();
    } catch (err) {
      showNotification("error", `Ошибка: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-800">
            {editMode ? "Редактировать занятие" : "Новое занятие"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {validationError && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {validationError}
            </div>
          )}
          
          {loadingData && (
            <div className="text-center py-4 text-slate-600">
              Загрузка данных формы...
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Группа *</label>
              <select
                name="group_name"
                value={formData.group_name}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Выберите группу</option>
                {availableGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Дата занятия *</label>
              <input
                type="date"
                name="date_created_on"
                value={formData.date_created_on}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {formData.date_created_on && (
                <p className="text-xs text-primary font-medium mt-1">
                  День недели: {DAYS.find(d => d.key === formData.day_of_week)?.label || formData.day_of_week}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Время начала *</label>
              <input
                type="time"
                name="time_start"
                value={formData.time_start}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Время окончания *</label>
              <input
                type="time"
                name="time_end"
                value={formData.time_end}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Предмет *</label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Выберите предмет</option>
                {availableSubjects.map(subject => (
                  <option key={subject.id} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Преподаватель *</label>
              <select
                name="teacher_id"
                value={formData.teacher_id || ""}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Выберите преподавателя</option>
                {availableTeachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} {teacher.department ? `(${teacher.department})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Аудитория *</label>
              <input
                type="text"
                name="room"
                value={formData.room}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Тип занятия</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="lecture">Лекция</option>
                <option value="practice">Практика</option>
                <option value="lab">Лабораторная</option>
                <option value="seminar">Семинар</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            {editMode && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all font-semibold"
              >
                Удалить
              </button>
            )}
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
