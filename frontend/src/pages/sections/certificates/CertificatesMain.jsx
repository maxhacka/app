import React, { useState, useEffect } from "react";
import certificatesService from "../../../services/certificatesService";
import staffService from "../../../services/staffService";

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

export default function CertificatesMain() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Фильтры
  const [filters, setFilters] = useState({
    certificate_type: "",
    status: "",
  });
  
  // Модальные окна
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  // Уведомления
  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    message: "",
  });

  // Типы справок
  const [certificateTypes, setCertificateTypes] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    loadCertificates();
    loadCertificateTypes();
    loadUsers();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await certificatesService.getCertificates({
        certificate_type: filters.certificate_type || undefined,
        status: filters.status || undefined,
        limit: 1000,
      });
      setCertificates(data);
    } catch (err) {
      setError("Не удалось загрузить справки");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCertificateTypes = async () => {
    try {
      const types = await certificatesService.getCertificateTypes({ is_active: 1, limit: 100 });
      setCertificateTypes(types);
    } catch (err) {
      console.error("Не удалось загрузить типы справок:", err);
    }
  };

  const loadUsers = async () => {
    try {
      const [studentsData, teachersData] = await Promise.all([
        staffService.getStudents({ limit: 1000 }),
        staffService.getTeachers({ limit: 1000 })
      ]);
      setStudents(studentsData);
      setTeachers(teachersData);
    } catch (err) {
      console.error("Не удалось загрузить пользователей:", err);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 4000);
  };

  const handleChangeStatus = (certificate) => {
    setSelectedCertificate(certificate);
    setShowStatusModal(true);
  };

  const handleDelete = (certificate) => {
    setSelectedCertificate(certificate);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await certificatesService.deleteCertificate(selectedCertificate.id);
      showNotification("success", "Заявка на справку удалена");
      setShowDeleteModal(false);
      setSelectedCertificate(null);
      loadCertificates();
    } catch (err) {
      showNotification("error", `Ошибка при удалении: ${err.message}`);
      setShowDeleteModal(false);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserName = (userId, userType) => {
    if (userType === "student") {
      const student = students.find(s => s.id === userId);
      return student ? `${student.name} (${student.group_name})` : `ID: ${userId}`;
    } else if (userType === "teacher") {
      const teacher = teachers.find(t => t.id === userId);
      return teacher ? `${teacher.name} (преп.)` : `ID: ${userId}`;
    }
    return `ID: ${userId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Загрузка справок...</p>
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
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 truncate min-w-0 flex-1">Справки</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto px-4 lg:px-6 py-3 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-purple-200/50 transition-all duration-300 shadow-lg relative overflow-hidden group text-sm lg:text-base"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <span className="relative z-10 flex items-center justify-center gap-2">
            <svg className="w-4 h-4 lg:w-5 lg:h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Создать заявку
          </span>
        </button>
      </div>

      {/* Фильтры */}
      <div className="bg-white p-4 lg:p-6 rounded-xl lg:rounded-2xl shadow-md border-2 border-slate-200 w-full max-w-full overflow-x-hidden">
        <h3 className="font-semibold text-base lg:text-lg mb-4 text-slate-800">Фильтры</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Тип справки</label>
            <select
              value={filters.certificate_type}
              onChange={(e) => setFilters(prev => ({ ...prev, certificate_type: e.target.value }))}
              className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Все типы</option>
              {certificateTypes.map(type => (
                <option key={type.id} value={type.name}>{type.name}</option>
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
              <option value="processing">В обработке</option>
              <option value="ready">Готова</option>
              <option value="issued">Выдана</option>
              <option value="cancelled">Отменена</option>
            </select>
          </div>
        </div>
        <button
          onClick={loadCertificates}
          className="mt-4 w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-full hover:bg-primaryHover transition-all font-medium"
        >
          Применить фильтры
        </button>
        <div className="mt-3 pt-3 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            Всего заявок: <strong>{certificates.length}</strong>
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Таблица справок - Десктоп */}
      {certificates.length > 0 ? (
        <>
          {/* Десктоп: таблица */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-md border-2 border-slate-200 overflow-hidden w-full max-w-full">
            <div className="overflow-x-auto overflow-y-auto custom-scrollbar w-full max-w-full" style={{ maxHeight: "calc(100vh - 450px)", minHeight: "400px" }}>
              <table className="w-full table-fixed min-w-0 max-w-full">
                <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-2 text-left font-semibold text-sm" style={{ width: "120px" }}>Пользователь</th>
                    <th className="p-2 text-left font-semibold text-sm" style={{ width: "130px" }}>Тип справки</th>
                    <th className="p-2 text-left font-semibold text-sm" style={{ width: "90px" }}>Статус</th>
                    <th className="p-2 text-left font-semibold text-sm" style={{ width: "110px" }}>Дата заявки</th>
                    <th className="p-2 text-left font-semibold text-sm" style={{ width: "110px" }}>Дата готовности</th>
                    <th className="p-2 text-left font-semibold text-sm" style={{ width: "100px" }}>Способ получения</th>
                    <th className="p-2 text-left font-semibold text-sm" style={{ width: "70px" }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((cert) => (
                    <tr
                      key={cert.id}
                      className="border-t border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-2 text-sm truncate" style={{ width: "120px" }} title={getUserName(cert.max_user_id, cert.user_type)}>
                        {getUserName(cert.max_user_id, cert.user_type)}
                      </td>
                      <td className="p-2 text-sm truncate" style={{ width: "130px" }} title={cert.certificate_type}>
                        {cert.certificate_type}
                      </td>
                      <td className="p-2" style={{ width: "90px" }}>
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium inline-block ${
                          cert.status === "processing" ? "bg-blue-100 text-blue-800" :
                          cert.status === "ready" ? "bg-green-100 text-green-800" :
                          cert.status === "issued" ? "bg-purple-100 text-purple-800" :
                          cert.status === "cancelled" ? "bg-red-100 text-red-800" :
                          "bg-slate-100 text-slate-800"
                        }`}>
                          {getStatusLabel(cert.status)}
                        </span>
                      </td>
                      <td className="p-2 text-xs" style={{ width: "110px" }}>
                        {formatDateTime(cert.request_date)}
                      </td>
                      <td className="p-2 text-xs" style={{ width: "110px" }}>
                        {formatDateTime(cert.ready_date)}
                      </td>
                      <td className="p-2 text-xs" style={{ width: "100px" }}>
                        {cert.delivery_method === "pickup" ? "Самовывоз" : "Доставка"}
                      </td>
                      <td className="p-2" style={{ width: "70px" }}>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleChangeStatus(cert)}
                            className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 group"
                            title="Изменить статус"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(cert)}
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
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-white rounded-xl shadow-md border-2 border-slate-200 p-4 space-y-3"
                  >
                {/* Заголовок карточки */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">{getUserName(cert.max_user_id, cert.user_type)}</h3>
                    <p className="text-sm text-slate-600">{cert.certificate_type}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    cert.status === "processing" ? "bg-blue-100 text-blue-800" :
                    cert.status === "ready" ? "bg-green-100 text-green-800" :
                    cert.status === "issued" ? "bg-purple-100 text-purple-800" :
                    cert.status === "cancelled" ? "bg-red-100 text-red-800" :
                    "bg-slate-100 text-slate-800"
                  }`}>
                    {getStatusLabel(cert.status)}
                  </span>
                </div>

                {/* Информация */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Дата заявки:</span>
                    <span className="text-sm font-medium text-slate-800">{formatDateTime(cert.request_date)}</span>
                  </div>
                  {cert.ready_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Дата готовности:</span>
                      <span className="text-sm font-medium text-slate-800">{formatDateTime(cert.ready_date)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Способ получения:</span>
                    <span className="text-sm font-medium text-slate-800">{cert.delivery_method === "pickup" ? "Самовывоз" : "Доставка"}</span>
                  </div>
                </div>

                {/* Кнопки действий */}
                <div className="flex gap-2 pt-3 border-t border-slate-200">
                  <button
                    onClick={() => handleChangeStatus(cert)}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <EditIcon />
                    <span>Изменить статус</span>
                  </button>
                  <button
                    onClick={() => handleDelete(cert)}
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
          <p className="text-slate-600 text-lg">Заявок на справки нет</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-primaryHover transition-all"
          >
            Создать первую заявку
          </button>
        </div>
      )}

      {/* Модальное окно создания заявки */}
      {showCreateModal && (
        <CreateCertificateModal
          onClose={() => setShowCreateModal(false)}
          onSave={() => {
            setShowCreateModal(false);
            loadCertificates();
          }}
          showNotification={showNotification}
          certificateTypes={certificateTypes}
          students={students}
          teachers={teachers}
        />
      )}

      {/* Модальное окно смены статуса */}
      {showStatusModal && selectedCertificate && (
        <StatusModal
          certificate={selectedCertificate}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedCertificate(null);
          }}
          onSave={() => {
            setShowStatusModal(false);
            setSelectedCertificate(null);
            loadCertificates();
          }}
          showNotification={showNotification}
        />
      )}

      {/* Модальное окно удаления */}
      {showDeleteModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">
              Подтверждение удаления
            </h2>
            <p className="text-slate-600 mb-6">
              Вы уверены, что хотите удалить заявку #{selectedCertificate.id}?
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
                  setSelectedCertificate(null);
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

// Вспомогательные функции
function getStatusLabel(status) {
  const labels = {
    processing: "В обработке",
    ready: "Готова",
    issued: "Выдана",
    cancelled: "Отменена",
  };
  return labels[status] || status;
}

// Модальное окно создания заявки
function CreateCertificateModal({ onClose, onSave, showNotification, certificateTypes, students, teachers }) {
  const [formData, setFormData] = useState({
    user_type: "student",
    max_user_id: "",
    certificate_type: "",
    purpose: "",
    delivery_method: "pickup",
    delivery_address: "",
    comments: "",
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "max_user_id" ? parseInt(value) || "" : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const dataToSend = {};
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        if (value !== "" && value !== null && value !== undefined) {
          dataToSend[key] = value;
        }
      });

      await certificatesService.createCertificate(dataToSend);
      showNotification("success", "Заявка на справку создана");
      onSave();
    } catch (err) {
      showNotification("error", `Ошибка: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const availableUsers = formData.user_type === "student" ? students : teachers;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
          <h2 className="text-2xl font-bold text-slate-800">Новая заявка на справку</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Тип пользователя *</label>
              <select
                name="user_type"
                value={formData.user_type}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="student">Студент</option>
                <option value="teacher">Преподаватель</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Пользователь *</label>
              <select
                name="max_user_id"
                value={formData.max_user_id}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Выберите пользователя</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} {user.group_name ? `(${user.group_name})` : user.department ? `(${user.department})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Тип справки *</label>
              <select
                name="certificate_type"
                value={formData.certificate_type}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Выберите тип справки</option>
                {certificateTypes.map(type => (
                  <option key={type.id} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Цель получения</label>
              <input
                type="text"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Например: для военкомата"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Способ получения</label>
              <select
                name="delivery_method"
                value={formData.delivery_method}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="pickup">Самовывоз</option>
                <option value="delivery">Доставка</option>
              </select>
            </div>

            {formData.delivery_method === "delivery" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Адрес доставки</label>
                <input
                  type="text"
                  name="delivery_address"
                  value={formData.delivery_address}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Введите адрес"
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
              {saving ? "Создание..." : "Создать заявку"}
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

// Модальное окно смены статуса
function StatusModal({ certificate, onClose, onSave, showNotification }) {
  const [newStatus, setNewStatus] = useState(certificate.status);
  const [readyDate, setReadyDate] = useState(
    certificate.ready_date ? new Date(certificate.ready_date).toISOString().slice(0, 16) : ""
  );
  const [issueDate, setIssueDate] = useState(
    certificate.issue_date ? new Date(certificate.issue_date).toISOString().slice(0, 16) : ""
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = {
        status: newStatus,
      };

      if (readyDate) {
        updateData.ready_date = new Date(readyDate).toISOString();
      }
      if (issueDate) {
        updateData.issue_date = new Date(issueDate).toISOString();
      }

      await certificatesService.updateCertificate(certificate.id, updateData);
      showNotification("success", "Статус справки обновлён");
      onSave();
    } catch (err) {
      showNotification("error", `Ошибка: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-800">
            Изменить статус справки #{certificate.id}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Статус *</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              required
              className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="processing">В обработке</option>
              <option value="ready">Готова</option>
              <option value="issued">Выдана</option>
              <option value="cancelled">Отменена</option>
            </select>
          </div>

          {(newStatus === "ready" || newStatus === "issued") && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Дата готовности</label>
              <input
                type="datetime-local"
                value={readyDate}
                onChange={(e) => setReadyDate(e.target.value)}
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {newStatus === "issued" && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Дата выдачи</label>
              <input
                type="datetime-local"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-full hover:bg-primaryHover transition-all font-semibold disabled:opacity-50"
            >
              {saving ? "Сохранение..." : "Сохранить"}
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
