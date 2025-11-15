import React, { useState, useEffect } from "react";
import libraryService from "../../../services/libraryService";

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

const PDFIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
  </svg>
);

export default function LibraryMain() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Фильтры
  const [filters, setFilters] = useState({
    category: "",
    author: "",
    search: "",
    is_electronic: "",
  });

  // Модальные окна
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Уведомления
  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await libraryService.getBooks({
        category: filters.category || undefined,
        author: filters.author || undefined,
        search: filters.search || undefined,
        is_electronic: filters.is_electronic === "" ? undefined : filters.is_electronic === "true",
        limit: 1000,
      });
      setBooks(data);
    } catch (err) {
      setError("Не удалось загрузить книги");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedBook(null);
    setShowCreateModal(true);
  };

  const handleEdit = (book) => {
    setSelectedBook(book);
    setShowEditModal(true);
  };

  const handleDelete = (book) => {
    setSelectedBook(book);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await libraryService.deleteBook(selectedBook.id);
      showNotification("success", "Книга удалена");
      setShowDeleteModal(false);
      setSelectedBook(null);
      loadBooks();
    } catch (err) {
      showNotification("error", `Ошибка при удалении: ${err.message}`);
      setShowDeleteModal(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
  };

  const getCategoryLabel = (category) => {
    const labels = {
      programming: "Программирование",
      scientific: "Научная литература",
      history: "История",
      fiction: "Художественная",
      textbook: "Учебник",
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Загрузка книг...</p>
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
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 truncate min-w-0 flex-1">Библиотека</h1>
        <button
          onClick={handleCreate}
          className="w-full sm:w-auto px-4 lg:px-6 py-3 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-purple-200/50 transition-all duration-300 shadow-lg relative overflow-hidden group text-sm lg:text-base flex-shrink-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <span className="relative z-10 flex items-center justify-center gap-2">
            <svg className="w-4 h-4 lg:w-5 lg:h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Добавить книгу
          </span>
        </button>
      </div>

      {/* Фильтры */}
      <div className="bg-white p-4 lg:p-6 rounded-xl lg:rounded-2xl shadow-md border-2 border-slate-200 w-full max-w-full overflow-x-hidden">
        <h3 className="font-semibold text-base lg:text-lg mb-4 text-slate-800">Фильтры</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Категория</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Все категории</option>
              <option value="programming">Программирование</option>
              <option value="scientific">Научная литература</option>
              <option value="history">История</option>
              <option value="fiction">Художественная</option>
              <option value="textbook">Учебник</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Автор</label>
            <input
              type="text"
              value={filters.author}
              onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value }))}
              placeholder="Поиск по автору..."
              className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Поиск</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Название, описание..."
              className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Формат</label>
            <select
              value={filters.is_electronic}
              onChange={(e) => setFilters(prev => ({ ...prev, is_electronic: e.target.value }))}
              className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Все форматы</option>
              <option value="true">Только электронные</option>
              <option value="false">Только бумажные</option>
            </select>
          </div>
        </div>
        <button
          onClick={loadBooks}
          className="mt-4 w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-full hover:bg-primaryHover transition-all font-medium"
        >
          Применить фильтры
        </button>
        <div className="mt-3 pt-3 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            Всего книг: <strong>{books.length}</strong>
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Список книг - Десктоп */}
      {books.length > 0 ? (
        <>
          {/* Десктоп: таблица */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-md border-2 border-slate-200 overflow-hidden w-full max-w-full">
            <div className="overflow-x-auto overflow-y-auto custom-scrollbar w-full max-w-full" style={{ maxHeight: "calc(100vh - 450px)", minHeight: "400px" }}>
              <table className="w-full table-fixed min-w-0 max-w-full">
                <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-2 text-left font-semibold text-sm" style={{ width: "200px" }}>Название</th>
                    <th className="p-2 text-left font-semibold text-sm" style={{ width: "130px" }}>Автор</th>
                    <th className="p-2 text-left font-semibold text-sm" style={{ width: "70px" }}>Год</th>
                    <th className="p-2 text-left font-semibold text-sm" style={{ width: "70px" }}>Страниц</th>
                    <th className="p-2 text-left font-semibold text-sm" style={{ width: "90px" }}>Экземпляры</th>
                    <th className="p-2 text-left font-semibold text-sm" style={{ width: "100px" }}>Формат</th>
                    <th className="p-2 text-left font-semibold text-sm" style={{ width: "120px" }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr
                      key={book.id}
                      className="border-t border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-2 font-medium text-sm truncate" style={{ width: "200px" }} title={book.title}>
                        {book.title}
                      </td>
                      <td className="p-2 text-sm truncate" style={{ width: "130px" }} title={book.author}>
                        {book.author}
                      </td>
                      <td className="p-2 text-sm" style={{ width: "70px" }}>
                        {book.year || "-"}
                      </td>
                      <td className="p-2 text-sm" style={{ width: "70px" }}>
                        {book.pages || "-"}
                      </td>
                      <td className="p-2 text-sm" style={{ width: "90px" }}>
                        {book.available_copies} / {book.total_copies}
                      </td>
                      <td className="p-2" style={{ width: "100px" }}>
                        <div className="flex flex-col gap-1">
                          {book.pdf_url && (
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-medium w-fit">
                              PDF
                            </span>
                          )}
                          {book.total_copies > 0 && (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full font-medium w-fit">
                              Бумажная
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2" style={{ width: "120px" }}>
                        <div className="flex gap-1 flex-wrap">
                          <button
                            onClick={() => handleEdit(book)}
                            className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 group"
                            title="Редактировать"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                        <button
                          onClick={() => handleDelete(book)}
                          className="p-1.5 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 group"
                          title="Удалить"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                          {book.pdf_url && (
                            <a
                              href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost'}:8006${book.pdf_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 group"
                              title="Открыть PDF"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                            </a>
                          )}
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
                {books.map((book) => (
                  <div
                    key={book.id}
                    className="bg-white rounded-xl shadow-md border-2 border-slate-200 p-4 space-y-3"
                  >
                {/* Заголовок карточки */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">{book.title}</h3>
                    <p className="text-sm text-slate-600">{book.author}</p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    {book.pdf_url && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                        PDF
                      </span>
                    )}
                    {book.total_copies > 0 && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                        Бумажная
                      </span>
                    )}
                  </div>
                </div>

                {/* Информация */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Год:</span>
                    <span className="text-sm font-medium text-slate-800">{book.year || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Страниц:</span>
                    <span className="text-sm font-medium text-slate-800">{book.pages || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Экземпляры:</span>
                    <span className="text-sm font-medium text-slate-800">{book.available_copies} / {book.total_copies}</span>
                  </div>
                </div>

                {/* Кнопки действий */}
                <div className="flex gap-2 pt-3 border-t border-slate-200">
                  <button
                    onClick={() => handleEdit(book)}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <EditIcon />
                    <span>Редактировать</span>
                  </button>
                  {book.pdf_url && (
                    <a
                      href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost'}:8006${book.pdf_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <PDFIcon />
                      <span>PDF</span>
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(book)}
                    className="px-4 py-2.5 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <DeleteIcon />
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
          <p className="text-slate-600 text-lg">Книг не найдено</p>
          <button
            onClick={handleCreate}
            className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-primaryHover transition-all"
          >
            Добавить первую книгу
          </button>
        </div>
      )}

      {/* Модальное окно создания/редактирования книги */}
      {(showCreateModal || showEditModal) && (
        <BookModal
          book={selectedBook}
          onClose={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setSelectedBook(null);
          }}
          onSave={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setSelectedBook(null);
            loadBooks();
          }}
          showNotification={showNotification}
        />
      )}

      {/* Модальное окно удаления */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Удалить книгу?</h2>
            <p className="text-slate-600 mb-6">
              Вы уверены, что хотите удалить книгу "{selectedBook?.title}"?
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
              >
                Удалить
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedBook(null);
                }}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-all"
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

// Модальное окно создания/редактирования книги
function BookModal({ book, onClose, onSave, showNotification }) {
  const editMode = book && book.id;
  
  const [formData, setFormData] = useState({
    title: book?.title || "",
    author: book?.author || "",
    publisher: book?.publisher || "",
    year: book?.year || "",
    category: book?.category || "programming",
    language: book?.language || "ru",
    pages: book?.pages || "",
    description: book?.description || "",
    cover_url: book?.cover_url || "",
    total_copies: book?.total_copies || 1,
    available_copies: book?.available_copies || 1,
    is_electronic: book?.is_electronic || false,
  });

  const [saving, setSaving] = useState(false);
  const [uploadingPDF, setUploadingPDF] = useState(false);
  const [selectedPDFFile, setSelectedPDFFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              (name === 'year' || name === 'pages' || name === 'total_copies' || name === 'available_copies') 
                ? (value === "" ? "" : parseInt(value) || 0) 
                : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        showNotification("error", "Файл должен быть в формате PDF");
        return;
      }
      setSelectedPDFFile(file);
    }
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
      
      // Правильно устанавливаем is_electronic: True только если ТОЛЬКО электронная (без бумажных экземпляров)
      if (dataToSend.hasOwnProperty('total_copies')) {
        dataToSend.is_electronic = dataToSend.total_copies === 0 && (dataToSend.pdf_url || selectedPDFFile);
      } else if (formData.total_copies === 0) {
        dataToSend.is_electronic = true;
      } else {
        dataToSend.is_electronic = false;
      }

      let savedBook;
      if (editMode) {
        savedBook = await libraryService.updateBook(book.id, dataToSend);
        showNotification("success", "Книга обновлена");
      } else {
        savedBook = await libraryService.createBook(dataToSend);
        showNotification("success", "Книга добавлена");
        
        // Если есть PDF файл, загружаем его
        if (selectedPDFFile && savedBook.id) {
          setUploadingPDF(true);
          try {
            await libraryService.uploadBookPDF(savedBook.id, selectedPDFFile);
            showNotification("success", "PDF файл загружен");
          } catch (err) {
            showNotification("error", `Ошибка загрузки PDF: ${err.message}`);
          } finally {
            setUploadingPDF(false);
          }
        }
      }

      // Если редактируем и есть новый PDF файл
      if (editMode && selectedPDFFile) {
        setUploadingPDF(true);
        try {
          await libraryService.uploadBookPDF(book.id, selectedPDFFile);
          showNotification("success", "PDF файл загружен");
        } catch (err) {
          showNotification("error", `Ошибка загрузки PDF: ${err.message}`);
        } finally {
          setUploadingPDF(false);
        }
      }

      onSave();
    } catch (err) {
      showNotification("error", `Ошибка: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
          <h2 className="text-2xl font-bold text-slate-800">
            {editMode ? "Редактировать книгу" : "Новая книга"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Название *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Название книги"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Автор *</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Автор"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Издательство</label>
              <input
                type="text"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Издательство"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Год</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Год издания"
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
                <option value="programming">Программирование</option>
                <option value="scientific">Научная литература</option>
                <option value="history">История</option>
                <option value="fiction">Художественная</option>
                <option value="textbook">Учебник</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Язык</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Страниц</label>
              <input
                type="number"
                name="pages"
                value={formData.pages}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Количество страниц"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Всего экземпляров</label>
              <input
                type="number"
                name="total_copies"
                value={formData.total_copies}
                onChange={handleChange}
                min="1"
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Доступно экземпляров</label>
              <input
                type="number"
                name="available_copies"
                value={formData.available_copies}
                onChange={handleChange}
                min="0"
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_electronic"
                  checked={formData.is_electronic}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData(prev => ({
                      ...prev,
                      is_electronic: checked,
                      // Если только электронная, то бумажных экземпляров быть не должно
                      total_copies: checked ? 0 : (prev.total_copies || 1),
                      available_copies: checked ? 0 : (prev.available_copies || 1)
                    }));
                  }}
                  className="w-5 h-5 rounded border-2 border-slate-300"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-700">Только электронная книга</span>
                  <span className="text-xs text-slate-500">(без бумажных экземпляров)</span>
                </div>
              </label>
              <p className="text-xs text-slate-500 mt-1">
                Примечание: Книга может быть доступна одновременно в PDF и бумажном виде. 
                Для этого загрузите PDF и укажите количество бумажных экземпляров.
              </p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Описание</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Описание книги"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {editMode ? "Загрузить новый PDF файл" : "PDF файл (электронная версия)"}
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {selectedPDFFile && (
                <p className="text-xs text-slate-500 mt-1">
                  Выбран файл: <strong>{selectedPDFFile.name}</strong> ({(selectedPDFFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
              {book?.pdf_url && (
                <a
                  href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost'}:8006${book.pdf_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 inline-block"
                >
                  📄 Текущий PDF файл
                </a>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={saving || uploadingPDF}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primaryHover disabled:opacity-50 transition-all"
            >
              {saving ? "Сохранение..." : uploadingPDF ? "Загрузка PDF..." : editMode ? "Сохранить" : "Создать"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving || uploadingPDF}
              className="px-6 py-3 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 disabled:opacity-50 transition-all"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
