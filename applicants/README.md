# Сервис "Applicants"

Сервис "Applicants" предоставляет API для управления заявлениями, документами и экзаменами абитуриентов, а также статистикой, программами обучения и расчетом зачисления.

## API Эндпоинты

### Заявления (Applicants)

- `GET /api/applicants/applicants`:
  - Получить список всех заявлений.
  - Параметры запроса: 
    - `status` (опционально) - статус заявления
    - `program` (опционально) - название программы
    - `source` (опционально) - источник заявления
    - `program_limit` (опционально) - лимит программы
    - `sort_by_exam_results` (опционально, bool) - сортировка по результатам экзаменов
    - `max_user_id` (опционально) - фильтр по max_user_id
    - `skip` (по умолчанию: 0) - количество пропускаемых записей
    - `limit` (по умолчанию: 100) - лимит записей
  - Возвращает список объектов `Applicant`.

- `GET /api/applicants/applicants-grouped`:
  - Получить абитуриентов, сгруппированных по телефону и СНИЛС.
  - Каждый абитуриент возвращается один раз со списком всех его программ.
  - Параметры запроса:
    - `status` (опционально) - статус заявления
    - `program` (опционально) - название программы
    - `source` (опционально) - источник заявления
    - `skip` (по умолчанию: 0) - количество пропускаемых записей
    - `limit` (по умолчанию: 1000) - лимит записей
  - Возвращает список объектов `GroupedApplicant`.

- `PUT /api/applicants/applicants-programs`:
  - Обновить программы и приоритеты абитуриента.
  - Принимает объект `UpdateApplicantPrograms` с полями:
    - `phone` - номер телефона абитуриента
    - `programs` - список программ вида `[{"id": 1, "program": "Программа 1", "priority": 1}, ...]`
  - Возвращает список обновленных объектов `Applicant`.

- `GET /api/applicants/applicants/{applicant_id}`:
  - Получить заявление по его ID.
  - Возвращает объект `Applicant`.

- `POST /api/applicants/applicants`:
  - Создать новое заявление.
  - Принимает объект `ApplicantCreate`.
  - Возвращает созданный объект `Applicant`.

- `PUT /api/applicants/applicants/{applicant_id}`:
  - Обновить существующее заявление по его ID.
  - Принимает объект `ApplicantUpdate`.
  - Возвращает обновленный объект `Applicant`.

- `DELETE /api/applicants/applicants/{applicant_id}`:
  - Удалить заявление по его ID.
  - Возвращает сообщение об успешном удалении.

- `POST /api/applicants/applicants/update-max-id`:
  - Обновить max_user_id для всех записей с указанным номером телефона (для интеграции с ботом).
  - Принимает объект `UpdateMaxIdByPhone` с полями:
    - `phone` - номер телефона
    - `max_user_id` (опционально) - новое значение max_user_id (если None, значение очищается)
  - Возвращает список всех обновленных объектов `Applicant`.

### Документы (Documents)

- `GET /api/applicants/documents`:
  - Получить список всех документов, опционально фильтруя по `applicant_id`.
  - Параметры запроса: 
    - `applicant_id` (опционально) - ID абитуриента
    - `skip` (по умолчанию: 0) - количество пропускаемых записей
    - `limit` (по умолчанию: 100) - лимит записей
  - Возвращает список объектов `ApplicantDocument`.

- `GET /api/applicants/documents/{document_id}`:
  - Получить документ по его ID.
  - Возвращает объект `ApplicantDocument`.

- `POST /api/applicants/documents/upload`:
  - Загрузить файл документа на сервер.
  - Принимает multipart/form-data с полями:
    - `file` - файл для загрузки
    - `applicant_id` (int) - ID абитуриента
    - `document_type` (str) - тип документа
    - `document_name` (str) - название документа
  - Возвращает созданный объект `ApplicantDocument` с URL загруженного файла.

- `POST /api/applicants/documents`:
  - Создать новый документ (без загрузки файла).
  - Принимает объект `ApplicantDocumentCreate`.
  - Возвращает созданный объект `ApplicantDocument`.

- `PUT /api/applicants/documents/{document_id}`:
  - Обновить существующий документ по его ID.
  - Принимает объект `ApplicantDocumentUpdate`.
  - Возвращает обновленный объект `ApplicantDocument`.

- `DELETE /api/applicants/documents/{document_id}`:
  - Удалить документ по его ID (также удаляет файл с диска, если он существует).
  - Возвращает сообщение об успешном удалении.

### Экзамены (Exams)

- `GET /api/applicants/exams`:
  - Получить список всех экзаменов, опционально фильтруя по `applicant_id`.
  - Параметры запроса: 
    - `applicant_id` (опционально) - ID абитуриента
    - `skip` (по умолчанию: 0) - количество пропускаемых записей
    - `limit` (по умолчанию: 100) - лимит записей
  - Возвращает список объектов `ApplicantExam`.

- `GET /api/applicants/exams/{exam_id}`:
  - Получить экзамен по его ID.
  - Возвращает объект `ApplicantExam`.

- `POST /api/applicants/exams`:
  - Создать новый экзамен.
  - Принимает объект `ApplicantExamCreate`.
  - Возвращает созданный объект `ApplicantExam`.

- `PUT /api/applicants/exams/{exam_id}`:
  - Обновить существующий экзамен по его ID.
  - Принимает объект `ApplicantExamUpdate`.
  - Возвращает обновленный объект `ApplicantExam`.

- `DELETE /api/applicants/exams/{exam_id}`:
  - Удалить экзамен по его ID.
  - Возвращает сообщение об успешном удалении.

### Программы (Programs)

- `GET /api/applicants/programs`:
  - Получить список всех программ обучения.
  - Параметры запроса:
    - `is_active` (опционально, int) - фильтр по активности программы (1 - активная, 0 - неактивная)
    - `skip` (по умолчанию: 0) - количество пропускаемых записей
    - `limit` (по умолчанию: 100) - лимит записей
  - Возвращает список объектов `Program`, отсортированных по названию.

- `GET /api/applicants/programs/{program_id}`:
  - Получить программу по ее ID.
  - Возвращает объект `Program`.

- `POST /api/applicants/programs`:
  - Создать новую программу обучения.
  - Принимает объект `ProgramCreate`.
  - Возвращает созданный объект `Program`.
  - Выдает ошибку 400, если программа с таким названием уже существует.

- `PUT /api/applicants/programs/{program_id}`:
  - Обновить существующую программу по ее ID.
  - Принимает объект `ProgramUpdate`.
  - Возвращает обновленный объект `Program`.

- `DELETE /api/applicants/programs/{program_id}`:
  - Удалить программу по ее ID.
  - Возвращает сообщение об успешном удалении.

### Расчет зачисления (Enrollment)

- `POST /api/applicants/enrollment/calculate`:
  - Запустить расчет зачисления по алгоритму высшего приоритета.
  - Расчет выполняется асинхронно в фоновом режиме.
  - Возвращает объект с полями:
    - `task_id` - уникальный идентификатор задачи
    - `status` - статус задачи ("pending")
    - `message` - сообщение о начале расчета
  - Используйте `task_id` для проверки статуса через эндпоинт `/api/applicants/enrollment/status/{task_id}`.

- `GET /api/applicants/enrollment/status/{task_id}`:
  - Получить статус расчета зачисления.
  - Возвращает объект с полями:
    - `status` - статус задачи ("pending", "processing", "completed", "error")
    - `progress` - прогресс выполнения (0-100)
    - `message` - текстовое сообщение о текущем состоянии
    - `file_path` - путь к файлу Excel (если расчет завершен)
    - `error` - описание ошибки (если статус "error")
    - `created_at` - время создания задачи
    - `completed_at` - время завершения задачи (если завершена)

- `GET /api/applicants/enrollment/download/{filename}`:
  - Скачать Excel файл с результатами зачисления.
  - Возвращает файл Excel с результатами расчета зачисления.

### Статистика (Statistics)

- `GET /api/applicants/statistics`:
  - Получить статистику по заявлениям.
  - Возвращает объект `ApplicantStatistics` с полями:
    - `total_applicants` - общее количество абитуриентов
    - `new_applicants` - количество абитуриентов со статусом "new"
    - `contacted_applicants` - количество абитуриентов со статусом "contacted"
    - `enrolled_applicants` - количество абитуриентов со статусом "enrolled"
    - `rejected_applicants` - количество абитуриентов со статусом "rejected"
    - `applicants_by_program` - словарь с количеством абитуриентов по программам
    - `applicants_by_source` - словарь с количеством абитуриентов по источникам

### Служебные эндпоинты

- `GET /`:
  - Информация о сервисе.
  - Возвращает объект с полями: `service`, `version`, `status`.

- `GET /health`:
  - Проверка здоровья сервиса.
  - Возвращает объект с полем `status: "healthy"`.
