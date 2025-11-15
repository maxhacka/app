from datetime import date, timedelta
from database import SessionLocal, init_db
import models

def init_test_data():
    db = SessionLocal()
    
    try:
        # Создаем группы, если их еще нет
        if db.query(models.Group).count() == 0:
            groups_data = [
                {"name": "ИТ-101", "description": "Информационные технологии, группа 101", "is_active": 1},
                {"name": "ИТ-102", "description": "Информационные технологии, группа 102", "is_active": 1},
                {"name": "ЭК-201", "description": "Экономика, группа 201", "is_active": 1},
            ]
            for group_data in groups_data:
                db_group = models.Group(**group_data)
                db.add(db_group)
            db.commit()
            print("✅ Groups created")
        
        # Создаем предметы, если их еще нет
        if db.query(models.Subject).count() == 0:
            subjects_data = [
                {"name": "Математика", "description": "Математический анализ и линейная алгебра", "is_active": 1},
                {"name": "Программирование", "description": "Основы программирования", "is_active": 1},
                {"name": "Базы данных", "description": "Проектирование и управление базами данных", "is_active": 1},
                {"name": "Английский", "description": "Английский язык", "is_active": 1},
                {"name": "Физика", "description": "Общая физика", "is_active": 1},
                {"name": "Дискретная математика", "description": "Дискретная математика и математическая логика", "is_active": 1},
                {"name": "Алгоритмы", "description": "Алгоритмы и структуры данных", "is_active": 1},
                {"name": "Web-разработка", "description": "Веб-разработка и веб-дизайн", "is_active": 1},
                {"name": "Микроэкономика", "description": "Микроэкономика", "is_active": 1},
                {"name": "Макроэкономика", "description": "Макроэкономика", "is_active": 1},
                {"name": "Статистика", "description": "Статистика и эконометрика", "is_active": 1},
                {"name": "Бухгалтерский учет", "description": "Основы бухгалтерского учета", "is_active": 1},
            ]
            for subject_data in subjects_data:
                db_subject = models.Subject(**subject_data)
                db.add(db_subject)
            db.commit()
            print("✅ Subjects created")
        
        # Проверяем, есть ли уже данные расписания
        if db.query(models.Schedule).count() > 0:
            db.close()
            return
        
        # Определяем дату следующего понедельника
        today = date.today()
        days_until_monday = (7 - today.weekday()) % 7
        if days_until_monday == 0:
            days_until_monday = 7
        next_monday = today + timedelta(days=days_until_monday)
        
        # Жестко закодированные данные преподавателей из сервиса staff
        # Данные скопированы из staff/init_data.py
        teachers_data = [
            {"id": 1, "name": "Иванов Александр Петрович", "subjects": "Программирование, Базы данных, Архитектура ПО"},
            {"id": 2, "name": "Петрова Екатерина Сергеевна", "subjects": "Искусственный интеллект, Машинное обучение, Нейронные сети"},
            {"id": 3, "name": "Сидоров Михаил Владимирович", "subjects": "Веб-разработка, Мобильные приложения, DevOps"},
            {"id": 4, "name": "Смирнова София Александровна", "subjects": "Микроэкономика, Макроэкономика, Эконометрика"},
            {"id": 5, "name": "Кузнецов Владимир Николаевич", "subjects": "Менеджмент, Маркетинг, Управление проектами"},
            {"id": 6, "name": "Васильева Анастасия Игоревна", "subjects": "Уголовное право, Криминология, Уголовный процесс"},
            {"id": 7, "name": "Михайлов Дмитрий Олегович", "subjects": "Гражданское право, Семейное право, Трудовое право"},
            {"id": 8, "name": "Новикова Ольга Павловна", "subjects": "Математический анализ, Линейная алгебра, Дискретная математика"},
            {"id": 9, "name": "Федоров Сергей Романович", "subjects": "Алгоритмы и структуры данных, Операционные системы"},
            {"id": 10, "name": "Морозова Татьяна Андреевна", "subjects": "Обработка естественного языка, Компьютерное зрение"},
            {"id": 11, "name": "Волков Роман Денисович", "subjects": "Кибербезопасность, Криптография, Защита информации"},
            {"id": 12, "name": "Алексеева Юлия Викторовна", "subjects": "Бухгалтерский учет, Финансовый менеджмент"},
            {"id": 13, "name": "Лебедев Игорь Сергеевич", "subjects": "Теория вероятностей, Математическая статистика, Теория игр"},
            {"id": 14, "name": "Семенова Кристина Николаевна", "subjects": "Тестирование ПО, Проектирование интерфейсов"},
            {"id": 15, "name": "Козлов Артем Игоревич", "subjects": "Большие данные, Распределенные системы, Облачные вычисления"},
        ]
        
        # Функция для поиска преподавателя по предмету
        def find_teacher_for_subject(subject_name):
            """Находит преподавателя для предмета на основе его subjects"""
            # Маппинг предметов к ключевым словам в subjects преподавателей
            subject_keywords = {
                "Математика": ["математический анализ", "линейная алгебра", "математика"],
                "Программирование": ["программирование"],
                "Базы данных": ["базы данных"],
                "Английский": [],  # Нет преподавателя английского в staff
                "Физика": [],  # Нет преподавателя физики в staff
                "Дискретная математика": ["дискретная математика"],
                "Алгоритмы": ["алгоритмы"],
                "Web-разработка": ["веб-разработка", "web-разработка"],
                "Микроэкономика": ["микроэкономика"],
                "Макроэкономика": ["макроэкономика"],
                "Статистика": ["статистика", "эконометрика"],
                "Бухгалтерский учет": ["бухгалтерский учет"]
            }
            
            keywords = subject_keywords.get(subject_name, [])
            
            for teacher in teachers_data:
                if teacher["subjects"]:
                    teacher_subjects_lower = teacher["subjects"].lower()
                    for keyword in keywords:
                        if keyword in teacher_subjects_lower:
                            return teacher
            
            # Если не нашли по ключевым словам, возвращаем первого доступного
            if teachers_data:
                return teachers_data[0]
            return None
        
        # Создаем словарь преподавателей для каждого предмета
        teachers = {}
        subject_names = ["Математика", "Программирование", "Базы данных", "Английский", 
                         "Физика", "Дискретная математика", "Алгоритмы", "Web-разработка",
                         "Микроэкономика", "Макроэкономика", "Статистика", "Бухгалтерский учет"]
        
        for subject_name in subject_names:
            teacher = find_teacher_for_subject(subject_name)
            if teacher:
                teachers[subject_name] = (teacher["name"], teacher["id"])
            else:
                # Если не нашли преподавателя, используем первого доступного
                if teachers_data:
                    teachers[subject_name] = (teachers_data[0]["name"], teachers_data[0]["id"])
                else:
                    teachers[subject_name] = ("Не назначен", None)
        
        schedules_to_add = []
            
        # Группа ИТ-101 - Первая неделя
        # Понедельник
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-101",
            day_of_week="monday",
            time_start="09:00",
            time_end="10:30",
            subject="Математика",
            teacher=teachers["Математика"][0],
            teacher_id=teachers["Математика"][1],
            room="А-201",
            type="lecture",
            week_type=None,
            date_created_on=next_monday
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-101",
            day_of_week="monday",
            time_start="11:00",
            time_end="12:30",
            subject="Программирование",
            teacher=teachers["Программирование"][0],
            teacher_id=teachers["Программирование"][1],
            room="Б-305",
            type="practice",
            week_type=None,
            date_created_on=next_monday
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-101",
            day_of_week="monday",
            time_start="13:00",
            time_end="14:30",
            subject="Базы данных",
            teacher=teachers["Базы данных"][0],
            teacher_id=teachers["Базы данных"][1],
            room="В-110",
            type="lecture",
            week_type=None,
            date_created_on=next_monday
        ))
        
        # Вторник
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-101",
            day_of_week="tuesday",
            time_start="09:00",
            time_end="10:30",
            subject="Английский",
            teacher=teachers["Английский"][0],
            teacher_id=teachers["Английский"][1],
            room="Г-005",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=1)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-101",
            day_of_week="tuesday",
            time_start="11:00",
            time_end="12:30",
            subject="Математика",
            teacher=teachers["Математика"][0],
            teacher_id=teachers["Математика"][1],
            room="А-201",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=1)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-101",
            day_of_week="tuesday",
            time_start="15:00",
            time_end="16:30",
            subject="Программирование",
            teacher=teachers["Программирование"][0],
            teacher_id=teachers["Программирование"][1],
            room="Б-305",
            type="lecture",
            week_type=None,
            date_created_on=next_monday + timedelta(days=1)
        ))
        
        # Среда
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-101",
            day_of_week="wednesday",
            time_start="09:00",
            time_end="10:30",
            subject="Базы данных",
            teacher=teachers["Базы данных"][0],
            teacher_id=teachers["Базы данных"][1],
            room="В-110",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=2)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-101",
            day_of_week="wednesday",
            time_start="13:00",
            time_end="14:30",
            subject="Математика",
            teacher=teachers["Математика"][0],
            teacher_id=teachers["Математика"][1],
            room="А-201",
            type="lecture",
            week_type=None,
            date_created_on=next_monday + timedelta(days=2)
        ))
        
        # Четверг
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-101",
            day_of_week="thursday",
            time_start="11:00",
            time_end="12:30",
            subject="Программирование",
            teacher=teachers["Программирование"][0],
            teacher_id=teachers["Программирование"][1],
            room="Б-305",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=3)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-101",
            day_of_week="thursday",
            time_start="13:00",
            time_end="14:30",
            subject="Английский",
            teacher=teachers["Английский"][0],
            teacher_id=teachers["Английский"][1],
            room="Г-005",
            type="lecture",
            week_type=None,
            date_created_on=next_monday + timedelta(days=3)
        ))
        
        # Пятница
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-101",
            day_of_week="friday",
            time_start="09:00",
            time_end="10:30",
            subject="Базы данных",
            teacher=teachers["Базы данных"][0],
            teacher_id=teachers["Базы данных"][1],
            room="В-110",
            type="lecture",
            week_type=None,
            date_created_on=next_monday + timedelta(days=4)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-101",
            day_of_week="friday",
            time_start="11:00",
            time_end="12:30",
            subject="Программирование",
            teacher=teachers["Программирование"][0],
            teacher_id=teachers["Программирование"][1],
            room="Б-305",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=4)
        ))
        
        # Группа ИТ-101 - Вторая неделя
        # Понедельник (вторая неделя)
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-101",
            day_of_week="monday",
            time_start="09:00",
            time_end="10:30",
            subject="Математика",
            teacher=teachers["Математика"][0],
            teacher_id=teachers["Математика"][1],
            room="А-201",
            type="lecture",
            week_type=None,
            date_created_on=next_monday + timedelta(days=7)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-101",
            day_of_week="monday",
            time_start="11:00",
            time_end="12:30",
            subject="Программирование",
            teacher=teachers["Программирование"][0],
            teacher_id=teachers["Программирование"][1],
            room="Б-305",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=7)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-101",
            day_of_week="monday",
            time_start="15:00",
            time_end="16:30",
            subject="Базы данных",
            teacher=teachers["Базы данных"][0],
            teacher_id=teachers["Базы данных"][1],
            room="В-110",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=7)
        ))
        
        # Вторник (вторая неделя)
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-101",
            day_of_week="tuesday",
            time_start="09:00",
            time_end="10:30",
            subject="Английский",
            teacher=teachers["Английский"][0],
            teacher_id=teachers["Английский"][1],
            room="Г-005",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=8)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-101",
            day_of_week="tuesday",
            time_start="13:00",
            time_end="14:30",
            subject="Математика",
            teacher=teachers["Математика"][0],
            teacher_id=teachers["Математика"][1],
            room="А-201",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=8)
        ))
        
        # Среда (вторая неделя)
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-101",
            day_of_week="wednesday",
            time_start="11:00",
            time_end="12:30",
            subject="Программирование",
            teacher=teachers["Программирование"][0],
            teacher_id=teachers["Программирование"][1],
            room="Б-305",
            type="lecture",
            week_type=None,
            date_created_on=next_monday + timedelta(days=9)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-101",
            day_of_week="wednesday",
            time_start="13:00",
            time_end="14:30",
            subject="Базы данных",
            teacher=teachers["Базы данных"][0],
            teacher_id=teachers["Базы данных"][1],
            room="В-110",
            type="lecture",
            week_type=None,
            date_created_on=next_monday + timedelta(days=9)
        ))
        
        # Четверг (вторая неделя)
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-101",
            day_of_week="thursday",
            time_start="09:00",
            time_end="10:30",
            subject="Английский",
            teacher=teachers["Английский"][0],
            teacher_id=teachers["Английский"][1],
            room="Г-005",
            type="lecture",
            week_type=None,
            date_created_on=next_monday + timedelta(days=10)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-101",
            day_of_week="thursday",
            time_start="15:00",
            time_end="16:30",
            subject="Математика",
            teacher=teachers["Математика"][0],
            teacher_id=teachers["Математика"][1],
            room="А-201",
            type="lecture",
            week_type=None,
            date_created_on=next_monday + timedelta(days=10)
        ))
        
        # Пятница (вторая неделя)
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-101",
            day_of_week="friday",
            time_start="11:00",
            time_end="12:30",
            subject="Программирование",
            teacher=teachers["Программирование"][0],
            teacher_id=teachers["Программирование"][1],
            room="Б-305",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=11)
        ))
        
        # Группа ИТ-102 - Первая неделя
        # Понедельник
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-102",
            day_of_week="monday",
            time_start="09:00",
            time_end="10:30",
            subject="Физика",
            teacher=teachers["Физика"][0],
            teacher_id=teachers["Физика"][1],
            room="А-201",
            type="lecture",
            week_type=None,
            date_created_on=next_monday
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-102",
            day_of_week="monday",
            time_start="13:00",
            time_end="14:30",
            subject="Дискретная математика",
            teacher=teachers["Дискретная математика"][0],
            teacher_id=teachers["Дискретная математика"][1],
            room="Б-305",
            type="practice",
            week_type=None,
            date_created_on=next_monday
        ))
        
        # Вторник
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-102",
            day_of_week="tuesday",
            time_start="09:00",
            time_end="10:30",
            subject="Алгоритмы",
            teacher=teachers["Алгоритмы"][0],
            teacher_id=teachers["Алгоритмы"][1],
            room="В-110",
            type="lecture",
            week_type=None,
            date_created_on=next_monday + timedelta(days=1)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-102",
            day_of_week="tuesday",
            time_start="11:00",
            time_end="12:30",
            subject="Web-разработка",
            teacher=teachers["Web-разработка"][0],
            teacher_id=teachers["Web-разработка"][1],
            room="Г-005",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=1)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-102",
            day_of_week="tuesday",
            time_start="15:00",
            time_end="16:30",
            subject="Физика",
            teacher=teachers["Физика"][0],
            teacher_id=teachers["Физика"][1],
            room="А-201",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=1)
        ))
        
        # Среда
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-102",
            day_of_week="wednesday",
            time_start="09:00",
            time_end="10:30",
            subject="Дискретная математика",
            teacher=teachers["Дискретная математика"][0],
            teacher_id=teachers["Дискретная математика"][1],
            room="Б-305",
            type="lecture",
            week_type=None,
            date_created_on=next_monday + timedelta(days=2)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-102",
            day_of_week="wednesday",
            time_start="13:00",
            time_end="14:30",
            subject="Алгоритмы",
            teacher=teachers["Алгоритмы"][0],
            teacher_id=teachers["Алгоритмы"][1],
            room="В-110",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=2)
        ))
        
        # Четверг
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-102",
            day_of_week="thursday",
            time_start="11:00",
            time_end="12:30",
            subject="Web-разработка",
            teacher=teachers["Web-разработка"][0],
            teacher_id=teachers["Web-разработка"][1],
            room="Г-005",
            type="lecture",
            week_type=None,
            date_created_on=next_monday + timedelta(days=3)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-102",
            day_of_week="thursday",
            time_start="15:00",
            time_end="16:30",
            subject="Физика",
            teacher=teachers["Физика"][0],
            teacher_id=teachers["Физика"][1],
            room="А-201",
            type="lecture",
            week_type=None,
            date_created_on=next_monday + timedelta(days=3)
        ))
        
        # Пятница
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-102",
            day_of_week="friday",
            time_start="09:00",
            time_end="10:30",
            subject="Дискретная математика",
            teacher=teachers["Дискретная математика"][0],
            teacher_id=teachers["Дискретная математика"][1],
            room="Б-305",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=4)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-102",
            day_of_week="friday",
            time_start="13:00",
            time_end="14:30",
            subject="Алгоритмы",
            teacher=teachers["Алгоритмы"][0],
            teacher_id=teachers["Алгоритмы"][1],
            room="В-110",
            type="lecture",
            week_type=None,
            date_created_on=next_monday + timedelta(days=4)
        ))
        
        # Группа ИТ-102 - Вторая неделя
        # Понедельник (вторая неделя)
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-102",
            day_of_week="monday",
            time_start="09:00",
            time_end="10:30",
            subject="Физика",
            teacher=teachers["Физика"][0],
            teacher_id=teachers["Физика"][1],
            room="А-201",
            type="lecture",
            week_type=None,
            date_created_on=next_monday + timedelta(days=7)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-102",
            day_of_week="monday",
            time_start="11:00",
            time_end="12:30",
            subject="Web-разработка",
            teacher=teachers["Web-разработка"][0],
            teacher_id=teachers["Web-разработка"][1],
            room="Г-005",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=7)
        ))
        
        # Вторник (вторая неделя)
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-102",
            day_of_week="tuesday",
            time_start="13:00",
            time_end="14:30",
            subject="Дискретная математика",
            teacher=teachers["Дискретная математика"][0],
            teacher_id=teachers["Дискретная математика"][1],
            room="Б-305",
            type="lecture",
            week_type=None,
            date_created_on=next_monday + timedelta(days=8)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-102",
            day_of_week="tuesday",
            time_start="15:00",
            time_end="16:30",
            subject="Алгоритмы",
            teacher=teachers["Алгоритмы"][0],
            teacher_id=teachers["Алгоритмы"][1],
            room="В-110",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=8)
        ))
        
        # Среда (вторая неделя)
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-102",
            day_of_week="wednesday",
            time_start="09:00",
            time_end="10:30",
            subject="Web-разработка",
            teacher=teachers["Web-разработка"][0],
            teacher_id=teachers["Web-разработка"][1],
            room="Г-005",
            type="lecture",
            week_type=None,
            date_created_on=next_monday + timedelta(days=9)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-102",
            day_of_week="wednesday",
            time_start="11:00",
            time_end="12:30",
            subject="Физика",
            teacher=teachers["Физика"][0],
            teacher_id=teachers["Физика"][1],
            room="А-201",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=9)
        ))
        
        # Четверг (вторая неделя)
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-102",
            day_of_week="thursday",
            time_start="13:00",
            time_end="14:30",
            subject="Дискретная математика",
            teacher=teachers["Дискретная математика"][0],
            teacher_id=teachers["Дискретная математика"][1],
            room="Б-305",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=10)
        ))
        
        # Пятница (вторая неделя)
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-102",
            day_of_week="friday",
            time_start="09:00",
            time_end="10:30",
            subject="Алгоритмы",
            teacher=teachers["Алгоритмы"][0],
            teacher_id=teachers["Алгоритмы"][1],
            room="В-110",
            type="lecture",
            week_type=None,
            date_created_on=next_monday + timedelta(days=11)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ИТ-102",
            day_of_week="friday",
            time_start="11:00",
            time_end="12:30",
            subject="Web-разработка",
            teacher=teachers["Web-разработка"][0],
            teacher_id=teachers["Web-разработка"][1],
            room="Г-005",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=11)
        ))
        
        # Группа ЭК-201 - Первая неделя
        # Понедельник
        schedules_to_add.append(models.Schedule(
            group_name="ЭК-201",
            day_of_week="monday",
            time_start="09:00",
            time_end="10:30",
            subject="Микроэкономика",
            teacher=teachers["Микроэкономика"][0],
            teacher_id=teachers["Микроэкономика"][1],
            room="А-201",
            type="lecture",
            week_type=None,
            date_created_on=next_monday
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ЭК-201",
            day_of_week="monday",
            time_start="11:00",
            time_end="12:30",
            subject="Макроэкономика",
            teacher=teachers["Макроэкономика"][0],
            teacher_id=teachers["Макроэкономика"][1],
            room="Б-305",
            type="practice",
            week_type=None,
            date_created_on=next_monday
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ЭК-201",
            day_of_week="monday",
            time_start="15:00",
            time_end="16:30",
            subject="Статистика",
            teacher=teachers["Статистика"][0],
            teacher_id=teachers["Статистика"][1],
            room="В-110",
            type="lecture",
            week_type=None,
            date_created_on=next_monday
        ))
        
        # Вторник
        schedules_to_add.append(models.Schedule(
            group_name="ЭК-201",
            day_of_week="tuesday",
            time_start="09:00",
            time_end="10:30",
            subject="Бухгалтерский учет",
            teacher=teachers["Бухгалтерский учет"][0],
            teacher_id=teachers["Бухгалтерский учет"][1],
            room="Г-005",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=1)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ЭК-201",
            day_of_week="tuesday",
            time_start="13:00",
            time_end="14:30",
            subject="Микроэкономика",
            teacher=teachers["Микроэкономика"][0],
            teacher_id=teachers["Микроэкономика"][1],
            room="А-201",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=1)
        ))
        
        # Среда
        schedules_to_add.append(models.Schedule(
            group_name="ЭК-201",
            day_of_week="wednesday",
            time_start="11:00",
            time_end="12:30",
            subject="Макроэкономика",
            teacher=teachers["Макроэкономика"][0],
            teacher_id=teachers["Макроэкономика"][1],
            room="Б-305",
            type="lecture",
            week_type=None,
            date_created_on=next_monday + timedelta(days=2)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ЭК-201",
            day_of_week="wednesday",
            time_start="13:00",
            time_end="14:30",
            subject="Статистика",
            teacher=teachers["Статистика"][0],
            teacher_id=teachers["Статистика"][1],
            room="В-110",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=2)
        ))
        
        # Четверг
        schedules_to_add.append(models.Schedule(
            group_name="ЭК-201",
            day_of_week="thursday",
            time_start="09:00",
            time_end="10:30",
            subject="Бухгалтерский учет",
            teacher=teachers["Бухгалтерский учет"][0],
            teacher_id=teachers["Бухгалтерский учет"][1],
            room="Г-005",
            type="lecture",
            week_type=None,
            date_created_on=next_monday + timedelta(days=3)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ЭК-201",
            day_of_week="thursday",
            time_start="11:00",
            time_end="12:30",
            subject="Микроэкономика",
            teacher=teachers["Микроэкономика"][0],
            teacher_id=teachers["Микроэкономика"][1],
            room="А-201",
            type="lecture",
            week_type=None,
            date_created_on=next_monday + timedelta(days=3)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ЭК-201",
            day_of_week="thursday",
            time_start="15:00",
            time_end="16:30",
            subject="Макроэкономика",
            teacher=teachers["Макроэкономика"][0],
            teacher_id=teachers["Макроэкономика"][1],
            room="Б-305",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=3)
        ))
        
        # Пятница
        schedules_to_add.append(models.Schedule(
            group_name="ЭК-201",
            day_of_week="friday",
            time_start="09:00",
            time_end="10:30",
            subject="Статистика",
            teacher=teachers["Статистика"][0],
            teacher_id=teachers["Статистика"][1],
            room="В-110",
            type="lecture",
            week_type=None,
            date_created_on=next_monday + timedelta(days=4)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ЭК-201",
            day_of_week="friday",
            time_start="13:00",
            time_end="14:30",
            subject="Бухгалтерский учет",
            teacher=teachers["Бухгалтерский учет"][0],
            teacher_id=teachers["Бухгалтерский учет"][1],
            room="Г-005",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=4)
        ))
        
        # Группа ЭК-201 - Вторая неделя
        # Понедельник (вторая неделя)
        schedules_to_add.append(models.Schedule(
            group_name="ЭК-201",
            day_of_week="monday",
            time_start="09:00",
            time_end="10:30",
            subject="Микроэкономика",
            teacher=teachers["Микроэкономика"][0],
            teacher_id=teachers["Микроэкономика"][1],
            room="А-201",
            type="lecture",
            week_type=None,
            date_created_on=next_monday + timedelta(days=7)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ЭК-201",
            day_of_week="monday",
            time_start="13:00",
            time_end="14:30",
            subject="Макроэкономика",
            teacher=teachers["Макроэкономика"][0],
            teacher_id=teachers["Макроэкономика"][1],
            room="Б-305",
            type="lecture",
            week_type=None,
            date_created_on=next_monday + timedelta(days=7)
        ))
        
        # Вторник (вторая неделя)
        schedules_to_add.append(models.Schedule(
            group_name="ЭК-201",
            day_of_week="tuesday",
            time_start="09:00",
            time_end="10:30",
            subject="Бухгалтерский учет",
            teacher=teachers["Бухгалтерский учет"][0],
            teacher_id=teachers["Бухгалтерский учет"][1],
            room="Г-005",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=8)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ЭК-201",
            day_of_week="tuesday",
            time_start="11:00",
            time_end="12:30",
            subject="Статистика",
            teacher=teachers["Статистика"][0],
            teacher_id=teachers["Статистика"][1],
            room="В-110",
            type="lecture",
            week_type=None,
            date_created_on=next_monday + timedelta(days=8)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ЭК-201",
            day_of_week="tuesday",
            time_start="15:00",
            time_end="16:30",
            subject="Микроэкономика",
            teacher=teachers["Микроэкономика"][0],
            teacher_id=teachers["Микроэкономика"][1],
            room="А-201",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=8)
        ))
        
        # Среда (вторая неделя)
        schedules_to_add.append(models.Schedule(
            group_name="ЭК-201",
            day_of_week="wednesday",
            time_start="09:00",
            time_end="10:30",
            subject="Макроэкономика",
            teacher=teachers["Макроэкономика"][0],
            teacher_id=teachers["Макроэкономика"][1],
            room="Б-305",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=9)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ЭК-201",
            day_of_week="wednesday",
            time_start="13:00",
            time_end="14:30",
            subject="Бухгалтерский учет",
            teacher=teachers["Бухгалтерский учет"][0],
            teacher_id=teachers["Бухгалтерский учет"][1],
            room="Г-005",
            type="lecture",
            week_type=None,
            date_created_on=next_monday + timedelta(days=9)
        ))
        
        # Четверг (вторая неделя)
        schedules_to_add.append(models.Schedule(
            group_name="ЭК-201",
            day_of_week="thursday",
            time_start="11:00",
            time_end="12:30",
            subject="Статистика",
            teacher=teachers["Статистика"][0],
            teacher_id=teachers["Статистика"][1],
            room="В-110",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=10)
        ))
        
        # Пятница (вторая неделя)
        schedules_to_add.append(models.Schedule(
            group_name="ЭК-201",
            day_of_week="friday",
            time_start="09:00",
            time_end="10:30",
            subject="Микроэкономика",
            teacher=teachers["Микроэкономика"][0],
            teacher_id=teachers["Микроэкономика"][1],
            room="А-201",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=11)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ЭК-201",
            day_of_week="friday",
            time_start="11:00",
            time_end="12:30",
            subject="Макроэкономика",
            teacher=teachers["Макроэкономика"][0],
            teacher_id=teachers["Макроэкономика"][1],
            room="Б-305",
            type="lecture",
            week_type=None,
            date_created_on=next_monday + timedelta(days=11)
        ))
        schedules_to_add.append(models.Schedule(
            group_name="ЭК-201",
            day_of_week="friday",
            time_start="15:00",
            time_end="16:30",
            subject="Статистика",
            teacher=teachers["Статистика"][0],
            teacher_id=teachers["Статистика"][1],
            room="В-110",
            type="practice",
            week_type=None,
            date_created_on=next_monday + timedelta(days=11)
                        ))
            
        db.add_all(schedules_to_add)
        db.commit()
        print(f"✅ Timetable Service: Created {len(schedules_to_add)} schedule entries for 2 weeks")
        
    except Exception as e:
        db.rollback()
        print(f"Error initializing test data: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    init_test_data()
