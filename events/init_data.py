from datetime import date, timedelta
from database import SessionLocal, init_db
import models

def init_test_data():
    db = SessionLocal()
    
    try:
        if db.query(models.Event).count() == 0:
            events_to_add = []
            
            today = date.today()
            
            events_data = [
                {
                    "title": "Студенческая Спартакиада",
                    "description": "Ежегодные спортивные соревнования между факультетами. Футбол, баскетбол, волейбол, легкая атлетика и многое другое.",
                    "date": today + timedelta(days=25),
                    "time": "09:00",
                    "location": "Спортивный комплекс",
                    "category": "sport",
                    "max_participants": 200,
                    "status": "published",
                    "tags": "Sport, Competition",
                    "organizer": "Спортивный клуб",
                    "image_url": "https://xn--80addc7a9c.xn--p1ai/upload/iblock/c06/txqq1x5496bc9ztlus3eugagkglgrzsm/photo_2025-10-06_17-44-54.jpg"
                },
                {
                    "title": "Вечер поэзии и музыки",
                    "description": "Погрузитесь в мир поэзии и искусства. Выступления студентов, чтение стихов и живая музыка.",
                    "date": today + timedelta(days=8),
                    "time": "18:00",
                    "location": "Актовый зал",
                    "category": "culture",
                    "max_participants": 100,
                    "status": "published",
                    "tags": "Art, Poetry, Music",
                    "organizer": "Студенческий совет",
                    "image_url": "https://jourcsu.ru/wp-content/uploads/2020/07/muzyka-i-poezija-e1594744848939.jpg"
                },
                {
                    "title": "Хакатон инноваций",
                    "description": "48-часовой марафон программирования. Решите актуальные проблемы с помощью IT-технологий. Призы и возможность стажировки.",
                    "date": today + timedelta(days=50),
                    "time": "10:00",
                    "location": "Коворкинг-центр",
                    "category": "innovation",
                    "max_participants": 80,
                    "status": "published",
                    "tags": "IT, Programming, Hackathon",
                    "organizer": "IT-клуб",
                    "image_url": "https://iubp.sfu-kras.ru/sites/default/files/news_icons/imgonline-com-ua-resize-roujdt37ts3k.jpg"
                },
                {
                    "title": "Ярмарка вакансий",
                    "description": "Встретьтесь с ведущими работодателями региона, узнайте о вакансиях и возможностях стажировки. Принесите резюме!",
                    "date": today + timedelta(days=30),
                    "time": "11:00",
                    "location": "Выставочный зал",
                    "category": "career",
                    "max_participants": 500,
                    "status": "published",
                    "tags": "Career, Jobs",
                    "organizer": "Центр карьеры",
                    "image_url": "https://kbrria.ru/upload/iblock/c40/1ty7o865f3t77qsvbf3b6h42fcwz68dx.jpg"
                },
                {
                    "title": "Фестиваль культур",
                    "description": "Познакомьтесь с традициями и обычаями разных стран. Национальная кухня, танцы, музыка и выставки.",
                    "date": today + timedelta(days=20),
                    "time": "15:00",
                    "location": "Центральная площадь",
                    "category": "culture",
                    "max_participants": None,
                    "status": "published",
                    "tags": "Culture, International",
                    "organizer": "Международный отдел",
                    "image_url": "https://www.tatar-inform.ru/resize/shd/images/uploads/news/2021/9/11/599c4b9824cbd8aec4dcd61de8fafc20.jpeg"
                },
                {
                    "title": "Выставка студенческих проектов",
                    "description": "Демонстрация лучших студенческих проектов и разработок. Возможность получить обратную связь от экспертов.",
                    "date": today + timedelta(days=18),
                    "time": "13:00",
                    "location": "Выставочный зал",
                    "category": "innovation",
                    "max_participants": 200,
                    "status": "published",
                    "tags": "Projects, Innovation",
                    "organizer": "Студенческое научное общество",
                    "image_url": "https://www.newsmarhi.ru/wp-content/uploads/2025/03/%D1%88%D0%B0%D0%B1%D0%BB%D0%BE%D0%BD-%D0%B7%D0%B0%D1%81%D1%82%D0%B0%D0%B2%D0%BA%D0%B8-%D0%BD%D0%BE%D0%B2%D0%BE%D1%81%D1%82%D0%B8-%D0%BD%D0%B0-%D1%81%D0%B0%D0%B9%D1%82-%D0%92%D1%8B%D1%81%D1%82%D0%B0%D0%B2%D0%BA%D0%B0-%D0%92%D0%93%D0%98%D0%9A-250325_.jpg"
                },
                {
                    "title": "Лекция приглашенного эксперта",
                    "description": "Встреча с известным специалистом в области искусственного интеллекта. Обсуждение трендов и перспектив развития AI.",
                    "date": today + timedelta(days=22),
                    "time": "15:30",
                    "location": "Аудитория 201",
                    "category": "academic",
                    "max_participants": 120,
                    "status": "published",
                    "tags": "AI, Lecture",
                    "organizer": "Кафедра информационных технологий",
                    "image_url": "https://habrastorage.org/r/w1560/getpro/habr/upload_files/0c2/43a/04c/0c243a04ca17e08f24b4652f27754762.jpg"
                },
                {
                    "title": "Благотворительный концерт",
                    "description": "Музыкальный вечер в поддержку благотворительных проектов. Выступления студенческих коллективов и приглашенных артистов.",
                    "date": today + timedelta(days=28),
                    "time": "19:00",
                    "location": "Актовый зал",
                    "category": "culture",
                    "max_participants": 400,
                    "status": "published",
                    "tags": "Charity, Music",
                    "organizer": "Студенческий совет",
                    "image_url": "https://www.uralskweek.kz/wp-content/uploads/2018/05/maxresdefault.jpg"
                },
                {
                    "title": "Экологическая акция",
                    "description": "Совместная уборка территории университета и посадка деревьев. Вклад в сохранение окружающей среды.",
                    "date": today + timedelta(days=10),
                    "time": "10:00",
                    "location": "Территория университета",
                    "category": "culture",
                    "max_participants": 100,
                    "status": "published",
                    "tags": "Ecology, Environment",
                    "organizer": "Экологический клуб",
                    "image_url": "https://tlum.ru/uploads/b3112be326831d0652ecbcdbfcf532941b816bfc9eb3587d15169b6622ce9e41.jpeg"
                },
                {
                    "title": "День карьеры в IT",
                    "description": "Специализированное мероприятие для студентов IT-направлений. Встречи с представителями ведущих IT-компаний, мастер-классы и собеседования.",
                    "date": today + timedelta(days=45),
                    "time": "11:00",
                    "location": "IT-центр",
                    "category": "career",
                    "max_participants": 150,
                    "status": "published",
                    "tags": "IT, Career, Jobs",
                    "organizer": "IT-клуб и Центр карьеры",
                    "image_url": "https://journal.ib-bank.ru/files/images/posts/08a83b9c1e454f529d98b665671f47bd.jpg"
                }
            ]
            
            for event_data in events_data:
                events_to_add.append(models.Event(
                    title=event_data["title"],
                    description=event_data["description"],
                    date=event_data["date"],
                    time=event_data["time"],
                    location=event_data["location"],
                    category=event_data["category"],
                    image_url=event_data.get("image_url"),
                    max_participants=event_data["max_participants"],
                    registration_url=f"https://university.edu/events/register/{event_data['title'].lower().replace(' ', '-')}" if event_data["max_participants"] else None,
                    status=event_data["status"],
                    tags=event_data["tags"],
                    participants_count=0,
                    organizer=event_data["organizer"]
                ))
            
            db.add_all(events_to_add)
            db.commit()
            print("✅ Events initialized successfully - 15 events created")
    except Exception as e:
        db.rollback()
        print(f"Error initializing test data: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    init_test_data()
