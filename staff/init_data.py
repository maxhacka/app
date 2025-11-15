from database import SessionLocal, init_db
import models
import schemas
import random
from datetime import datetime

def init_test_data():
    db = SessionLocal()
    
    try:
        if db.query(models.Student).count() == 0:
            students_to_add = []

            groups_data = [
                {"name": "ИТ-101", "faculty": "Информационные технологии", "specialization": "Программная инженерия"},
                {"name": "ИТ-102", "faculty": "Информационные технологии", "specialization": "Искусственный интеллект"},
                {"name": "ИТ-201", "faculty": "Информационные технологии", "specialization": "Кибербезопасность"},
                {"name": "ЭК-201", "faculty": "Экономика и Управление", "specialization": "Бухгалтерский учет и аудит"},
                {"name": "ЭК-202", "faculty": "Экономика и Управление", "specialization": "Менеджмент"},
                {"name": "ЮР-301", "faculty": "Юридический", "specialization": "Уголовное право"},
                {"name": "ЮР-302", "faculty": "Юридический", "specialization": "Гражданское право"},
            ]

            # Список студентов с русскими ФИО и английскими email
            students_list = [
                {"name": "Иванов Иван Иванович", "email": "ivan.ivanov@university.edu"},
                {"name": "Петрова Мария Сергеевна", "email": "maria.petrova@university.edu"},
                {"name": "Сидоров Дмитрий Александрович", "email": "dmitry.sidorov@university.edu"},
                {"name": "Смирнова Анна Владимировна", "email": "anna.smirnova@university.edu"},
                {"name": "Кузнецов Сергей Петрович", "email": "sergey.kuznetsov@university.edu"},
                {"name": "Васильева Елена Николаевна", "email": "elena.vasilyeva@university.edu"},
                {"name": "Михайлов Андрей Игоревич", "email": "andrey.mikhailov@university.edu"},
                {"name": "Новикова Ольга Дмитриевна", "email": "olga.novikova@university.edu"},
                {"name": "Федоров Павел Сергеевич", "email": "pavel.fedorov@university.edu"},
                {"name": "Морозова Татьяна Викторовна", "email": "tatyana.morozova@university.edu"},
                {"name": "Волков Роман Алексеевич", "email": "roman.volkov@university.edu"},
                {"name": "Алексеева Юлия Павловна", "email": "yulia.alekseeva@university.edu"},
                {"name": "Лебедев Игорь Владимирович", "email": "igor.lebedev@university.edu"},
                {"name": "Семенова Кристина Андреевна", "email": "kristina.semenova@university.edu"},
                {"name": "Егоров Максим Олегович", "email": "maxim.egorov@university.edu"},
                {"name": "Павлова Виктория Игоревна", "email": "viktorija.pavlova@university.edu"},
                {"name": "Козлов Артем Денисович", "email": "artem.kozlov@university.edu"},
                {"name": "Степанова Анастасия Романовна", "email": "anastasia.stepanova@university.edu"},
                {"name": "Николаев Денис Сергеевич", "email": "denis.nikolaev@university.edu"},
                {"name": "Орлова Дарья Александровна", "email": "darya.orlova@university.edu"},
                {"name": "Зайцев Никита Владимирович", "email": "nikita.zaytsev@university.edu"},
                {"name": "Макарова Екатерина Павловна", "email": "ekaterina.makarova@university.edu"},
                {"name": "Андреев Владислав Игоревич", "email": "vladislav.andreev@university.edu"},
                {"name": "Антонова Алина Дмитриевна", "email": "alina.antonova@university.edu"},
                {"name": "Тихонов Станислав Олегович", "email": "stanislav.tikhonov@university.edu"},
                {"name": "Ильина Валерия Сергеевна", "email": "valeriya.ilina@university.edu"},
                {"name": "Соколов Артур Романович", "email": "artur.sokolov@university.edu"},
                {"name": "Борисова Полина Андреевна", "email": "polina.borisova@university.edu"},
                {"name": "Яковлев Тимур Владимирович", "email": "timur.yakovlev@university.edu"},
                {"name": "Григорьева София Николаевна", "email": "sofia.grigorieva@university.edu"},
            ]

            student_id_counter = 1
            for student_data in students_list:
                group_info = groups_data[student_id_counter % len(groups_data)]
                enrollment_year = 2021 + (student_id_counter % 4)  # Годы поступления: 2021-2024
                course = datetime.now().year - enrollment_year + 1
                if course > 4:
                    course = 4
                
                student_number = f"202{enrollment_year % 10}{student_id_counter:04d}"
                phone = f"+7501{random.randint(1000000, 9999999)}"

                students_to_add.append(models.Student(
                    max_user_id=1000 + student_id_counter,
                    student_number=student_number,
                    name=student_data["name"],
                    group_name=group_info["name"],
                    email=student_data["email"],
                    phone=phone,
                    status="active" if random.random() > 0.1 else "inactive",
                    enrollment_year=enrollment_year,
                    faculty=group_info["faculty"],
                    specialization=group_info["specialization"],
                    course=course
                ))
                student_id_counter += 1

            db.add_all(students_to_add)

        if db.query(models.Teacher).count() == 0:
            teachers_to_add = []

            teachers_list = [
                {
                    "name": "Иванов Александр Петрович",
                    "email": "alexander.ivanov@university.edu",
                    "department": "Кафедра программной инженерии",
                    "position": "Профессор",
                    "academic_degree": "Д.т.н.",
                    "subjects": "Программирование, Базы данных, Архитектура ПО"
                },
                {
                    "name": "Петрова Екатерина Сергеевна",
                    "email": "ekaterina.petrova@university.edu",
                    "department": "Кафедра искусственного интеллекта",
                    "position": "Доцент",
                    "academic_degree": "К.т.н.",
                    "subjects": "Искусственный интеллект, Машинное обучение, Нейронные сети"
                },
                {
                    "name": "Сидоров Михаил Владимирович",
                    "email": "mikhail.sidorov@university.edu",
                    "department": "Кафедра программной инженерии",
                    "position": "Доцент",
                    "academic_degree": "К.т.н.",
                    "subjects": "Веб-разработка, Мобильные приложения, DevOps"
                },
                {
                    "name": "Смирнова София Александровна",
                    "email": "sofia.smirnova@university.edu",
                    "department": "Кафедра экономики и управления",
                    "position": "Профессор",
                    "academic_degree": "Д.э.н.",
                    "subjects": "Микроэкономика, Макроэкономика, Эконометрика"
                },
                {
                    "name": "Кузнецов Владимир Николаевич",
                    "email": "vladimir.kuznetsov@university.edu",
                    "department": "Кафедра экономики и управления",
                    "position": "Доцент",
                    "academic_degree": "К.э.н.",
                    "subjects": "Менеджмент, Маркетинг, Управление проектами"
                },
                {
                    "name": "Васильева Анастасия Игоревна",
                    "email": "anastasia.vasilyeva@university.edu",
                    "department": "Кафедра уголовного права",
                    "position": "Доцент",
                    "academic_degree": "К.ю.н.",
                    "subjects": "Уголовное право, Криминология, Уголовный процесс"
                },
                {
                    "name": "Михайлов Дмитрий Олегович",
                    "email": "dmitry.mikhailov@university.edu",
                    "department": "Кафедра гражданского права",
                    "position": "Профессор",
                    "academic_degree": "Д.ю.н.",
                    "subjects": "Гражданское право, Семейное право, Трудовое право"
                },
                {
                    "name": "Новикова Ольга Павловна",
                    "email": "olga.novikova@university.edu",
                    "department": "Кафедра математики",
                    "position": "Доцент",
                    "academic_degree": "К.ф.-м.н.",
                    "subjects": "Математический анализ, Линейная алгебра, Дискретная математика"
                },
                {
                    "name": "Федоров Сергей Романович",
                    "email": "sergey.fedorov@university.edu",
                    "department": "Кафедра программной инженерии",
                    "position": "Старший преподаватель",
                    "academic_degree": "Магистр",
                    "subjects": "Алгоритмы и структуры данных, Операционные системы"
                },
                {
                    "name": "Морозова Татьяна Андреевна",
                    "email": "tatyana.morozova@university.edu",
                    "department": "Кафедра искусственного интеллекта",
                    "position": "Старший преподаватель",
                    "academic_degree": "Магистр",
                    "subjects": "Обработка естественного языка, Компьютерное зрение"
                },
                {
                    "name": "Волков Роман Денисович",
                    "email": "roman.volkov@university.edu",
                    "department": "Кафедра кибербезопасности",
                    "position": "Доцент",
                    "academic_degree": "К.т.н.",
                    "subjects": "Кибербезопасность, Криптография, Защита информации"
                },
                {
                    "name": "Алексеева Юлия Викторовна",
                    "email": "yulia.alekseeva@university.edu",
                    "department": "Кафедра экономики и управления",
                    "position": "Старший преподаватель",
                    "academic_degree": "Магистр",
                    "subjects": "Бухгалтерский учет, Финансовый менеджмент"
                },
                {
                    "name": "Лебедев Игорь Сергеевич",
                    "email": "igor.lebedev@university.edu",
                    "department": "Кафедра математики",
                    "position": "Профессор",
                    "academic_degree": "Д.ф.-м.н.",
                    "subjects": "Теория вероятностей, Математическая статистика, Теория игр"
                },
                {
                    "name": "Семенова Кристина Николаевна",
                    "email": "kristina.semenova@university.edu",
                    "department": "Кафедра программной инженерии",
                    "position": "Преподаватель",
                    "academic_degree": "Магистр",
                    "subjects": "Тестирование ПО, Проектирование интерфейсов"
                },
                {
                    "name": "Козлов Артем Игоревич",
                    "email": "artem.kozlov@university.edu",
                    "department": "Кафедра искусственного интеллекта",
                    "position": "Доцент",
                    "academic_degree": "К.т.н.",
                    "subjects": "Большие данные, Распределенные системы, Облачные вычисления"
                },
            ]

            teacher_id_counter = 1
            for teacher_data in teachers_list:
                teacher_number = f"T-{2020 + (teacher_id_counter % 5)}{teacher_id_counter:03d}"
                phone = f"+7501{random.randint(1000000, 9999999)}"

                teachers_to_add.append(models.Teacher(
                    max_user_id=2000 + teacher_id_counter,
                    teacher_number=teacher_number,
                    name=teacher_data["name"],
                    email=teacher_data["email"],
                    phone=phone,
                    status="active" if random.random() > 0.05 else "inactive",
                    department=teacher_data["department"],
                    position=teacher_data["position"],
                    academic_degree=teacher_data["academic_degree"],
                    subjects=teacher_data["subjects"]
                ))
                teacher_id_counter += 1

            db.add_all(teachers_to_add)

        db.commit()
        print("Test data initialized successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error initializing test data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    init_test_data()
