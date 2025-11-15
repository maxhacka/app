from datetime import datetime
from database import SessionLocal, init_db
import models

def init_test_data():
    db = SessionLocal()
    
    try:
        if db.query(models.Book).count() == 0:
            books_to_add = []
            
            # 20 реально существующих книг
            books_data = [
                {
                    "isbn": "978-5-4461-1234-5",
                    "title": "Чистый код. Создание, анализ и рефакторинг",
                    "author": "Роберт Мартин",
                    "publisher": "Питер",
                    "year": 2020,
                    "category": "programming",
                    "language": "ru",
                    "pages": 464,
                    "description": "Практическое руководство по написанию чистого кода. Автор рассказывает о принципах, паттернах и приемах написания чистого кода.",
                    "total_copies": 5,
                    "available_copies": 3,
                    "has_pdf": True,
                    "has_paper": True
                },
                {
                    "isbn": "978-5-4461-0987-8",
                    "title": "Грокаем алгоритмы. Иллюстрированное пособие для программистов и любопытствующих",
                    "author": "Адитья Бхаргава",
                    "publisher": "Питер",
                    "year": 2019,
                    "category": "programming",
                    "language": "ru",
                    "pages": 288,
                    "description": "Простое и понятное введение в алгоритмы и структуры данных. Книга поможет понять основы алгоритмов через визуальные примеры.",
                    "total_copies": 4,
                    "available_copies": 2,
                    "has_pdf": True,
                    "has_paper": True
                },
                {
                    "isbn": "978-5-4461-1456-8",
                    "title": "Паттерны проектирования",
                    "author": "Эрих Гамма, Ричард Хелм, Ральф Джонсон, Джон Влиссидес",
                    "publisher": "Питер",
                    "year": 2021,
                    "category": "programming",
                    "language": "ru",
                    "pages": 368,
                    "description": "Классическая книга о паттернах проектирования. Описывает 23 паттерна для решения типичных задач проектирования.",
                    "total_copies": 6,
                    "available_copies": 4,
                    "has_pdf": True,
                    "has_paper": True
                },
                {
                    "isbn": "978-5-4461-1233-8",
                    "title": "Искусство программирования",
                    "author": "Дональд Кнут",
                    "publisher": "Вильямс",
                    "year": 2019,
                    "category": "programming",
                    "language": "ru",
                    "pages": 720,
                    "description": "Фундаментальный труд по программированию. Первый том серии, посвященный базовым алгоритмам.",
                    "total_copies": 3,
                    "available_copies": 1,
                    "has_pdf": False,
                    "has_paper": True
                },
                {
                    "isbn": "978-5-4461-1457-5",
                    "title": "Совершенный код. Мастер-класс",
                    "author": "Стив Макконнелл",
                    "publisher": "Питер",
                    "year": 2020,
                    "category": "programming",
                    "language": "ru",
                    "pages": 896,
                    "description": "Практическое руководство по разработке программного обеспечения. Содержит сотни практических советов.",
                    "total_copies": 5,
                    "available_copies": 3,
                    "has_pdf": True,
                    "has_paper": True
                },
                {
                    "isbn": "978-5-17-123456-7",
                    "title": "Мастер и Маргарита",
                    "author": "Михаил Булгаков",
                    "publisher": "АСТ",
                    "year": 2018,
                    "category": "fiction",
                    "language": "ru",
                    "pages": 672,
                    "description": "Один из самых известных романов русской литературы XX века. Философская сатира о добре и зле.",
                    "total_copies": 8,
                    "available_copies": 5,
                    "has_pdf": True,
                    "has_paper": True
                },
                {
                    "isbn": "978-5-17-123457-4",
                    "title": "Преступление и наказание",
                    "author": "Федор Достоевский",
                    "publisher": "АСТ",
                    "year": 2019,
                    "category": "fiction",
                    "language": "ru",
                    "pages": 672,
                    "description": "Философский роман о студенте Раскольникове, который решает убить старуху-процентщицу.",
                    "total_copies": 7,
                    "available_copies": 4,
                    "has_pdf": True,
                    "has_paper": True
                },
                {
                    "isbn": "978-5-17-123458-1",
                    "title": "Война и мир",
                    "author": "Лев Толстой",
                    "publisher": "АСТ",
                    "year": 2020,
                    "category": "fiction",
                    "language": "ru",
                    "pages": 1504,
                    "description": "Эпический роман-эпопея о русском обществе в эпоху наполеоновских войн.",
                    "total_copies": 6,
                    "available_copies": 3,
                    "has_pdf": False,
                    "has_paper": True
                },
                {
                    "isbn": "978-5-17-123459-8",
                    "title": "Тихий Дон",
                    "author": "Михаил Шолохов",
                    "publisher": "АСТ",
                    "year": 2019,
                    "category": "fiction",
                    "language": "ru",
                    "pages": 1504,
                    "description": "Эпопея о жизни донского казачества в период Первой мировой войны и Гражданской войны.",
                    "total_copies": 5,
                    "available_copies": 2,
                    "has_pdf": True,
                    "has_paper": True
                },
                {
                    "isbn": "978-5-17-123460-4",
                    "title": "Евгений Онегин",
                    "author": "Александр Пушкин",
                    "publisher": "АСТ",
                    "year": 2018,
                    "category": "fiction",
                    "language": "ru",
                    "pages": 320,
                    "description": "Роман в стихах, одно из самых значительных произведений русской словесности.",
                    "total_copies": 10,
                    "available_copies": 7,
                    "has_pdf": True,
                    "has_paper": True
                },
                {
                    "isbn": "978-5-17-123461-1",
                    "title": "Sapiens: Краткая история человечества",
                    "author": "Юваль Ной Харари",
                    "publisher": "Синдбад",
                    "year": 2019,
                    "category": "history",
                    "language": "ru",
                    "pages": 512,
                    "description": "Увлекательное путешествие по истории человечества от каменного века до наших дней.",
                    "total_copies": 4,
                    "available_copies": 2,
                    "has_pdf": True,
                    "has_paper": True
                },
                {
                    "isbn": "978-5-17-123462-8",
                    "title": "Краткая история времени. От Большого взрыва до черных дыр",
                    "author": "Стивен Хокинг",
                    "publisher": "АСТ",
                    "year": 2020,
                    "category": "scientific",
                    "language": "ru",
                    "pages": 256,
                    "description": "Популярное изложение современных представлений о происхождении и эволюции Вселенной.",
                    "total_copies": 5,
                    "available_copies": 3,
                    "has_pdf": True,
                    "has_paper": True
                },
                {
                    "isbn": "978-5-17-123463-5",
                    "title": "Капитал в XXI веке",
                    "author": "Тома Пикетти",
                    "publisher": "Ад Маргинем Пресс",
                    "year": 2015,
                    "category": "scientific",
                    "language": "ru",
                    "pages": 592,
                    "description": "Масштабное исследование экономического неравенства в развитых странах за последние 250 лет.",
                    "total_copies": 3,
                    "available_copies": 1,
                    "has_pdf": False,
                    "has_paper": True
                },
                {
                    "isbn": "978-5-17-123464-2",
                    "title": "1984",
                    "author": "Джордж Оруэлл",
                    "publisher": "АСТ",
                    "year": 2019,
                    "category": "fiction",
                    "language": "ru",
                    "pages": 320,
                    "description": "Антиутопический роман о тоталитарном обществе, где правит Большой Брат.",
                    "total_copies": 6,
                    "available_copies": 4,
                    "has_pdf": True,
                    "has_paper": True
                },
                {
                    "isbn": "978-5-17-123465-9",
                    "title": "Скотный двор",
                    "author": "Джордж Оруэлл",
                    "publisher": "АСТ",
                    "year": 2018,
                    "category": "fiction",
                    "language": "ru",
                    "pages": 144,
                    "description": "Аллегорическая повесть-сатира на сталинский режим в СССР.",
                    "total_copies": 5,
                    "available_copies": 3,
                    "has_pdf": True,
                    "has_paper": True
                },
                {
                    "isbn": "978-5-17-123466-6",
                    "title": "Убить пересмешника",
                    "author": "Харпер Ли",
                    "publisher": "АСТ",
                    "year": 2019,
                    "category": "fiction",
                    "language": "ru",
                    "pages": 416,
                    "description": "Роман о расовой несправедливости и потере невинности в американском южном городе 1930-х годов.",
                    "total_copies": 4,
                    "available_copies": 2,
                    "has_pdf": True,
                    "has_paper": True
                },
                {
                    "isbn": "978-5-17-123467-3",
                    "title": "Великий Гэтсби",
                    "author": "Фрэнсис Скотт Фицджеральд",
                    "publisher": "АСТ",
                    "year": 2018,
                    "category": "fiction",
                    "language": "ru",
                    "pages": 256,
                    "description": "Роман о периоде американской истории, известном как 'эпоха джаза'.",
                    "total_copies": 5,
                    "available_copies": 3,
                    "has_pdf": True,
                    "has_paper": True
                },
                {
                    "isbn": "978-5-17-123468-0",
                    "title": "Алгоритмы: построение и анализ",
                    "author": "Томас Кормен, Чарльз Лейзерсон, Рональд Ривест, Клиффорд Штайн",
                    "publisher": "Вильямс",
                    "year": 2020,
                    "category": "programming",
                    "language": "ru",
                    "pages": 1328,
                    "description": "Фундаментальный учебник по алгоритмам и структурам данных. Содержит подробный анализ алгоритмов.",
                    "total_copies": 4,
                    "available_copies": 2,
                    "has_pdf": False,
                    "has_paper": True
                },
                {
                    "isbn": "978-5-17-123469-7",
                    "title": "Рефакторинг. Улучшение существующего кода",
                    "author": "Мартин Фаулер",
                    "publisher": "Вильямс",
                    "year": 2019,
                    "category": "programming",
                    "language": "ru",
                    "pages": 448,
                    "description": "Руководство по рефакторингу кода. Описывает техники улучшения структуры существующего кода.",
                    "total_copies": 5,
                    "available_copies": 3,
                    "has_pdf": True,
                    "has_paper": True
                },
                {
                    "isbn": "978-5-17-123470-3",
                    "title": "Docker и Kubernetes для разработчиков",
                    "author": "Джефф Никлофф, Стивен Тернбулл",
                    "publisher": "Питер",
                    "year": 2021,
                    "category": "programming",
                    "language": "ru",
                    "pages": 384,
                    "description": "Практическое руководство по использованию Docker и Kubernetes для разработки и развертывания приложений.",
                    "total_copies": 4,
                    "available_copies": 2,
                    "has_pdf": True,
                    "has_paper": True
                }
            ]
            
            for i, book_data in enumerate(books_data):
                # Определяем доступность форматов
                pdf_url = f"/uploads/books/book_{i+1}.pdf" if book_data["has_pdf"] else None
                # Если есть PDF, но нет бумажных экземпляров - это только электронная книга
                # Если есть и PDF, и бумажные экземпляры - книга доступна в обоих форматах
                is_electronic_only = book_data["has_pdf"] and book_data["total_copies"] == 0
                
                books_to_add.append(models.Book(
                    isbn=book_data["isbn"],
                    title=book_data["title"],
                    author=book_data["author"],
                    publisher=book_data["publisher"],
                    year=book_data["year"],
                    category=book_data["category"],
                    language=book_data["language"],
                    pages=book_data["pages"],
                    description=book_data["description"],
                    cover_url=f"/uploads/books/covers/book_{i+1}.jpg",
                    pdf_url=pdf_url,
                    total_copies=book_data["total_copies"],
                    available_copies=book_data["available_copies"],
                    is_electronic=is_electronic_only  # True только если ТОЛЬКО электронная (без бумажных экземпляров)
                ))
            
            db.add_all(books_to_add)
        
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
