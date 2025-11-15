from database import SessionLocal, init_db
import models

def init_test_data():
    db = SessionLocal()
    
    try:
        # Создаем тестовые программы, если их еще нет
        if db.query(models.Program).count() == 0:
            programs_data = [
                {
                    "name": "Информатика",
                    "description": "Программа подготовки специалистов в области информационных технологий и программирования",
                    "total_places": 10,
                    "budget_places": 10,
                    "paid_places": 0,
                    "min_score": 0,
                    "is_active": 1
                },
                {
                    "name": "Прикладная математика",
                    "description": "Программа подготовки математиков-прикладников для работы в различных областях науки и техники",
                    "total_places": 7,
                    "budget_places": 7,
                    "paid_places": 0,
                    "min_score": 0,
                    "is_active": 1
                },
                {
                    "name": "Физика",
                    "description": "Программа подготовки физиков для научно-исследовательской и преподавательской деятельности",
                    "total_places": 5,
                    "budget_places": 5,
                    "paid_places": 0,
                    "min_score": 0,
                    "is_active": 1
                }
            ]
            
            programs_to_add = []
            for prog_data in programs_data:
                program = models.Program(**prog_data)
                programs_to_add.append(program)
            
            db.add_all(programs_to_add)
            db.commit()
            print(f"✅ Created {len(programs_data)} test programs")
        
        # Создаем тестовых абитуриентов, если их еще нет
        if db.query(models.Applicant).count() == 0:
            # Получаем все активные программы из базы
            programs = db.query(models.Program).filter(models.Program.is_active == 1).all()
            
            if not programs:
                print("⚠️ No programs found. Please create programs first.")
                return
            
            if len(programs) != 3:
                print(f"⚠️ Expected 3 programs, but found {len(programs)}")
                return
            
            applicants_to_add = []

            # Получаем программы по именам для удобства
            program_dict = {p.name: p for p in programs}
            cs_program = program_dict["Информатика"]
            math_program = program_dict["Прикладная математика"]
            physics_program = program_dict["Физика"]
            
            # Данные 10 абитуриентов (каждый подает на все 3 программы с приоритетами 1, 2, 3)
            applicants_data = [
                {
                    "name": "Анна Иванова",
                    "email": "anna.ivanova@example.com",
                    "phone": "+75011234567",
                    "snils": "123-456-789 01",
                    "status": "new",
                    "source": "university",
                    "exam_results": None,
                    "programs": [
                        {"program": cs_program, "priority": 1},
                        {"program": math_program, "priority": 2},
                        {"program": physics_program, "priority": 3}
                    ]
                },
                {
                    "name": "Сергей Кузнецов",
                    "email": "sergey.kuznetsov@example.com",
                    "phone": "+75011234568",
                    "snils": "234-567-890 12",
                    "status": "contacted",
                    "source": "university",
                    "exam_results": 250,
                    "programs": [
                        {"program": math_program, "priority": 1},
                        {"program": cs_program, "priority": 2},
                        {"program": physics_program, "priority": 3}
                    ]
                },
                {
                    "name": "Елена Смирнова",
                    "email": "elena.smirnova@example.com",
                    "phone": "+75011234569",
                    "snils": "345-678-901 23",
                    "status": "documents_pending",
                    "source": "university",
                    "exam_results": 280,
                    "programs": [
                        {"program": physics_program, "priority": 1},
                        {"program": cs_program, "priority": 2},
                        {"program": math_program, "priority": 3}
                    ]
                },
                {
                    "name": "Иван Петров",
                    "email": "ivan.petrov@example.com",
                    "phone": "+75011234570",
                    "snils": "456-789-012 34",
                    "status": "enrolled",
                    "source": "university",
                    "exam_results": 295,
                    "programs": [
                        {"program": cs_program, "priority": 1},
                        {"program": physics_program, "priority": 2},
                        {"program": math_program, "priority": 3}
                    ]
                },
                {
                    "name": "Ольга Васильева",
                    "email": "olga.vasilyeva@example.com",
                    "phone": "+75011234571",
                    "snils": "567-890-123 45",
                    "status": "new",
                    "source": "college",
                    "exam_results": 0,
                    "programs": [
                        {"program": math_program, "priority": 1},
                        {"program": physics_program, "priority": 2},
                        {"program": cs_program, "priority": 3}
                    ]
                },
                {
                    "name": "Дмитрий Михайлов",
                    "email": "dmitry.mikhailov@example.com",
                    "phone": "+75011234572",
                    "snils": "678-901-234 56",
                    "status": "contacted",
                    "source": "university",
                    "exam_results": 220,
                    "programs": [
                        {"program": physics_program, "priority": 1},
                        {"program": math_program, "priority": 2},
                        {"program": cs_program, "priority": 3}
                    ]
                },
                {
                    "name": "Мария Новикова",
                    "email": "maria.novikova@example.com",
                    "phone": "+75011234573",
                    "snils": "789-012-345 67",
                    "status": "documents_pending",
                    "source": "university",
                    "exam_results": 265,
                    "programs": [
                        {"program": cs_program, "priority": 1},
                        {"program": math_program, "priority": 2},
                        {"program": physics_program, "priority": 3}
                    ]
                },
                {
                    "name": "Алексей Федоров",
                    "email": "alexey.fedorov@example.com",
                    "phone": "+75011234574",
                    "snils": "890-123-456 78",
                    "status": "rejected",
                    "source": "university",
                    "exam_results": 150,
                    "programs": [
                        {"program": math_program, "priority": 1},
                        {"program": cs_program, "priority": 2},
                        {"program": physics_program, "priority": 3}
                    ]
                },
                {
                    "name": "Наталья Соколова",
                    "email": "natalia.sokolova@example.com",
                    "phone": "+75011234575",
                    "snils": "901-234-567 89",
                    "status": "enrolled",
                    "source": "university",
                    "exam_results": 290,
                    "programs": [
                        {"program": physics_program, "priority": 1},
                        {"program": cs_program, "priority": 2},
                        {"program": math_program, "priority": 3}
                    ]
                },
                {
                    "name": "Владимир Волков",
                    "email": "vladimir.volkov@example.com",
                    "phone": "+75011234576",
                    "snils": "012-345-678 90",
                    "status": "contacted",
                    "source": "college",
                    "exam_results": 0,
                    "programs": [
                        {"program": cs_program, "priority": 1},
                        {"program": physics_program, "priority": 2},
                        {"program": math_program, "priority": 3}
                    ]
                },
                {
                    "name": "Татьяна Морозова",
                    "email": "tatyana.morozova@example.com",
                    "phone": "+75011234577",
                    "snils": "111-222-333 11",
                    "status": "new",
                    "source": "university",
                    "exam_results": None,
                    "programs": [
                        {"program": math_program, "priority": 1},
                        {"program": cs_program, "priority": 2},
                        {"program": physics_program, "priority": 3}
                    ]
                },
                {
                    "name": "Павел Степанов",
                    "email": "pavel.stepanov@example.com",
                    "phone": "+75011234578",
                    "snils": "222-333-444 22",
                    "status": "documents_pending",
                    "source": "university",
                    "exam_results": 270,
                    "programs": [
                        {"program": physics_program, "priority": 1},
                        {"program": math_program, "priority": 2},
                        {"program": cs_program, "priority": 3}
                    ]
                },
                {
                    "name": "Юлия Орлова",
                    "email": "yulia.orlova@example.com",
                    "phone": "+75011234579",
                    "snils": "333-444-555 33",
                    "status": "enrolled",
                    "source": "university",
                    "exam_results": 285,
                    "programs": [
                        {"program": cs_program, "priority": 1},
                        {"program": physics_program, "priority": 2},
                        {"program": math_program, "priority": 3}
                    ]
                },
                {
                    "name": "Андрей Лебедев",
                    "email": "andrey.lebedev@example.com",
                    "phone": "+75011234580",
                    "snils": "444-555-666 44",
                    "status": "contacted",
                    "source": "college",
                    "exam_results": 0,
                    "programs": [
                        {"program": math_program, "priority": 1},
                        {"program": physics_program, "priority": 2},
                        {"program": cs_program, "priority": 3}
                    ]
                },
                {
                    "name": "Екатерина Зайцева",
                    "email": "ekaterina.zaytseva@example.com",
                    "phone": "+75011234581",
                    "snils": "555-666-777 55",
                    "status": "new",
                    "source": "university",
                    "exam_results": None,
                    "programs": [
                        {"program": physics_program, "priority": 1},
                        {"program": cs_program, "priority": 2},
                        {"program": math_program, "priority": 3}
                    ]
                },
                {
                    "name": "Максим Григорьев",
                    "email": "maxim.grigoriev@example.com",
                    "phone": "+75011234582",
                    "snils": "666-777-888 66",
                    "status": "documents_pending",
                    "source": "university",
                    "exam_results": 255,
                    "programs": [
                        {"program": cs_program, "priority": 1},
                        {"program": math_program, "priority": 2},
                        {"program": physics_program, "priority": 3}
                    ]
                },
                {
                    "name": "Анастасия Романова",
                    "email": "anastasia.romanova@example.com",
                    "phone": "+75011234583",
                    "snils": "777-888-999 77",
                    "status": "rejected",
                    "source": "university",
                    "exam_results": 140,
                    "programs": [
                        {"program": math_program, "priority": 1},
                        {"program": cs_program, "priority": 2},
                        {"program": physics_program, "priority": 3}
                    ]
                },
                {
                    "name": "Игорь Комаров",
                    "email": "igor.komarov@example.com",
                    "phone": "+75011234584",
                    "snils": "888-999-000 88",
                    "status": "enrolled",
                    "source": "university",
                    "exam_results": 300,
                    "programs": [
                        {"program": physics_program, "priority": 1},
                        {"program": cs_program, "priority": 2},
                        {"program": math_program, "priority": 3}
                    ]
                },
                {
                    "name": "Светлана Белова",
                    "email": "svetlana.belova@example.com",
                    "phone": "+75011234585",
                    "snils": "999-000-111 99",
                    "status": "contacted",
                    "source": "university",
                    "exam_results": 230,
                    "programs": [
                        {"program": cs_program, "priority": 1},
                        {"program": physics_program, "priority": 2},
                        {"program": math_program, "priority": 3}
                    ]
                },
                {
                    "name": "Роман Алексеев",
                    "email": "roman.alekseev@example.com",
                    "phone": "+75011234586",
                    "snils": "000-111-222 00",
                    "status": "new",
                    "source": "college",
                    "exam_results": 0,
                    "programs": [
                        {"program": math_program, "priority": 1},
                        {"program": cs_program, "priority": 2},
                        {"program": physics_program, "priority": 3}
                    ]
                },
                {
                    "name": "Оксана Данилова",
                    "email": "oksana.danilova@example.com",
                    "phone": "+75011234587",
                    "snils": "101-212-323 10",
                    "status": "contacted",
                    "source": "university",
                    "exam_results": 240,
                    "programs": [
                        {"program": cs_program, "priority": 1},
                        {"program": math_program, "priority": 2},
                        {"program": physics_program, "priority": 3}
                    ]
                },
                {
                    "name": "Артем Семенов",
                    "email": "artem.semenov@example.com",
                    "phone": "+75011234588",
                    "snils": "202-313-424 20",
                    "status": "documents_pending",
                    "source": "university",
                    "exam_results": 275,
                    "programs": [
                        {"program": physics_program, "priority": 1},
                        {"program": cs_program, "priority": 2},
                        {"program": math_program, "priority": 3}
                    ]
                },
                {
                    "name": "Виктория Петрова",
                    "email": "viktorija.petrova@example.com",
                    "phone": "+75011234589",
                    "snils": "303-414-525 30",
                    "status": "enrolled",
                    "source": "university",
                    "exam_results": 288,
                    "programs": [
                        {"program": math_program, "priority": 1},
                        {"program": physics_program, "priority": 2},
                        {"program": cs_program, "priority": 3}
                    ]
                },
                {
                    "name": "Константин Николаев",
                    "email": "konstantin.nikolaev@example.com",
                    "phone": "+75011234590",
                    "snils": "404-515-626 40",
                    "status": "new",
                    "source": "college",
                    "exam_results": 0,
                    "programs": [
                        {"program": cs_program, "priority": 1},
                        {"program": physics_program, "priority": 2},
                        {"program": math_program, "priority": 3}
                    ]
                },
                {
                    "name": "Дарья Соколова",
                    "email": "darya.sokolova@example.com",
                    "phone": "+75011234591",
                    "snils": "505-616-727 50",
                    "status": "contacted",
                    "source": "university",
                    "exam_results": 225,
                    "programs": [
                        {"program": physics_program, "priority": 1},
                        {"program": math_program, "priority": 2},
                        {"program": cs_program, "priority": 3}
                    ]
                },
                {
                    "name": "Никита Воробьев",
                    "email": "nikita.vorobev@example.com",
                    "phone": "+75011234592",
                    "snils": "606-717-828 60",
                    "status": "documents_pending",
                    "source": "university",
                    "exam_results": 260,
                    "programs": [
                        {"program": math_program, "priority": 1},
                        {"program": cs_program, "priority": 2},
                        {"program": physics_program, "priority": 3}
                    ]
                },
                {
                    "name": "Алина Кузнецова",
                    "email": "alina.kuznetsova@example.com",
                    "phone": "+75011234593",
                    "snils": "707-818-929 70",
                    "status": "rejected",
                    "source": "university",
                    "exam_results": 160,
                    "programs": [
                        {"program": cs_program, "priority": 1},
                        {"program": math_program, "priority": 2},
                        {"program": physics_program, "priority": 3}
                    ]
                },
                {
                    "name": "Станислав Попов",
                    "email": "stanislav.popov@example.com",
                    "phone": "+75011234594",
                    "snils": "808-919-020 80",
                    "status": "enrolled",
                    "source": "university",
                    "exam_results": 292,
                    "programs": [
                        {"program": physics_program, "priority": 1},
                        {"program": cs_program, "priority": 2},
                        {"program": math_program, "priority": 3}
                    ]
                },
                {
                    "name": "Кристина Новикова",
                    "email": "kristina.novikova@example.com",
                    "phone": "+75011234595",
                    "snils": "909-020-131 90",
                    "status": "new",
                    "source": "university",
                    "exam_results": None,
                    "programs": [
                        {"program": cs_program, "priority": 1},
                        {"program": physics_program, "priority": 2},
                        {"program": math_program, "priority": 3}
                    ]
                },
                {
                    "name": "Артур Медведев",
                    "email": "artur.medvedev@example.com",
                    "phone": "+75011234596",
                    "snils": "010-121-232 01",
                    "status": "contacted",
                    "source": "college",
                    "exam_results": 0,
                    "programs": [
                        {"program": math_program, "priority": 1},
                        {"program": physics_program, "priority": 2},
                        {"program": cs_program, "priority": 3}
                    ]
                },
                {
                    "name": "Евгения Титова",
                    "email": "evgeniya.titova@example.com",
                    "phone": "+75011234597",
                    "snils": "121-232-343 12",
                    "status": "new",
                    "source": "university",
                    "exam_results": None,
                    "programs": [
                        {"program": cs_program, "priority": 1},
                        {"program": math_program, "priority": 2},
                        {"program": physics_program, "priority": 3}
                    ]
                },
                {
                    "name": "Валерий Борисов",
                    "email": "valery.borisov@example.com",
                    "phone": "+75011234598",
                    "snils": "232-343-454 23",
                    "status": "documents_pending",
                    "source": "university",
                    "exam_results": 245,
                    "programs": [
                        {"program": math_program, "priority": 1},
                        {"program": cs_program, "priority": 2},
                        {"program": physics_program, "priority": 3}
                    ]
                },
                {
                    "name": "Людмила Егорова",
                    "email": "lyudmila.egorova@example.com",
                    "phone": "+75011234599",
                    "snils": "343-454-565 34",
                    "status": "enrolled",
                    "source": "university",
                    "exam_results": 298,
                    "programs": [
                        {"program": physics_program, "priority": 1},
                        {"program": cs_program, "priority": 2},
                        {"program": math_program, "priority": 3}
                    ]
                },
                {
                    "name": "Григорий Макаров",
                    "email": "grigory.makarov@example.com",
                    "phone": "+75011234600",
                    "snils": "454-565-676 45",
                    "status": "contacted",
                    "source": "university",
                    "exam_results": 235,
                    "programs": [
                        {"program": cs_program, "priority": 1},
                        {"program": physics_program, "priority": 2},
                        {"program": math_program, "priority": 3}
                    ]
                },
                {
                    "name": "Валентина Соловьева",
                    "email": "valentina.solovieva@example.com",
                    "phone": "+75011234601",
                    "snils": "565-676-787 56",
                    "status": "rejected",
                    "source": "university",
                    "exam_results": 130,
                    "programs": [
                        {"program": math_program, "priority": 1},
                        {"program": physics_program, "priority": 2},
                        {"program": cs_program, "priority": 3}
                    ]
                },
                {
                    "name": "Тимур Яковлев",
                    "email": "timur.yakovlev@example.com",
                    "phone": "+75011234602",
                    "snils": "676-787-898 67",
                    "status": "new",
                    "source": "college",
                    "exam_results": 0,
                    "programs": [
                        {"program": physics_program, "priority": 1},
                        {"program": math_program, "priority": 2},
                        {"program": cs_program, "priority": 3}
                    ]
                },
                {
                    "name": "Инна Павлова",
                    "email": "inna.pavlova@example.com",
                    "phone": "+75011234603",
                    "snils": "787-898-909 78",
                    "status": "documents_pending",
                    "source": "university",
                    "exam_results": 268,
                    "programs": [
                        {"program": cs_program, "priority": 1},
                        {"program": math_program, "priority": 2},
                        {"program": physics_program, "priority": 3}
                    ]
                },
                {
                    "name": "Руслан Тимофеев",
                    "email": "ruslan.timofeev@example.com",
                    "phone": "+75011234604",
                    "snils": "898-909-010 89",
                    "status": "enrolled",
                    "source": "university",
                    "exam_results": 294,
                    "programs": [
                        {"program": math_program, "priority": 1},
                        {"program": cs_program, "priority": 2},
                        {"program": physics_program, "priority": 3}
                    ]
                },
                {
                    "name": "Лариса Фомина",
                    "email": "larisa.fomina@example.com",
                    "phone": "+75011234605",
                    "snils": "909-010-121 90",
                    "status": "contacted",
                    "source": "university",
                    "exam_results": 242,
                    "programs": [
                        {"program": physics_program, "priority": 1},
                        {"program": cs_program, "priority": 2},
                        {"program": math_program, "priority": 3}
                    ]
                },
                {
                    "name": "Денис Сергеев",
                    "email": "denis.sergeev@example.com",
                    "phone": "+75011234606",
                    "snils": "020-131-242 02",
                    "status": "new",
                    "source": "university",
                    "exam_results": None,
                    "programs": [
                        {"program": cs_program, "priority": 1},
                        {"program": physics_program, "priority": 2},
                        {"program": math_program, "priority": 3}
                    ]
                },
                {
                    "name": "Галина Терентьева",
                    "email": "galina.terenteva@example.com",
                    "phone": "+75011234607",
                    "snils": "111-222-333 12",
                    "status": "documents_pending",
                    "source": "university",
                    "exam_results": 272,
                    "programs": [
                        {"program": math_program, "priority": 1},
                        {"program": physics_program, "priority": 2},
                        {"program": cs_program, "priority": 3}
                    ]
                },
                {
                    "name": "Эдуард Широков",
                    "email": "eduard.shirokov@example.com",
                    "phone": "+75011234608",
                    "snils": "212-323-434 21",
                    "status": "enrolled",
                    "source": "university",
                    "exam_results": 287,
                    "programs": [
                        {"program": physics_program, "priority": 1},
                        {"program": math_program, "priority": 2},
                        {"program": cs_program, "priority": 3}
                    ]
                },
                {
                    "name": "Жанна Блинова",
                    "email": "zhanna.blinova@example.com",
                    "phone": "+75011234609",
                    "snils": "313-424-535 31",
                    "status": "rejected",
                    "source": "university",
                    "exam_results": 145,
                    "programs": [
                        {"program": cs_program, "priority": 1},
                        {"program": math_program, "priority": 2},
                        {"program": physics_program, "priority": 3}
                    ]
                },
                {
                    "name": "Илья Кудрявцев",
                    "email": "ilya.kudryavtsev@example.com",
                    "phone": "+75011234610",
                    "snils": "414-525-636 41",
                    "status": "contacted",
                    "source": "college",
                    "exam_results": 0,
                    "programs": [
                        {"program": math_program, "priority": 1},
                        {"program": cs_program, "priority": 2},
                        {"program": physics_program, "priority": 3}
                    ]
                },
                {
                    "name": "Вера Анисимова",
                    "email": "vera.anisimova@example.com",
                    "phone": "+75011234611",
                    "snils": "515-626-737 51",
                    "status": "new",
                    "source": "university",
                    "exam_results": None,
                    "programs": [
                        {"program": physics_program, "priority": 1},
                        {"program": cs_program, "priority": 2},
                        {"program": math_program, "priority": 3}
                    ]
                }
            ]
            
            applicant_id_counter = 1
            
            # Создаем заявки для каждого абитуриента
            for applicant_data in applicants_data:
                base_applicant_id = f"APP{applicant_id_counter:03d}"
                
                for program_data in applicant_data["programs"]:
                    unique_applicant_id = f"{base_applicant_id}-P{program_data['priority']}"
                    
                    applicant = models.Applicant(
                        applicant_id=unique_applicant_id,
                        max_user_id=str(1000 + applicant_id_counter),
                        name=applicant_data["name"],
                        phone=applicant_data["phone"],
                        email=applicant_data["email"],
                        snils=applicant_data["snils"],
                        program=program_data["program"].name,
                        program_limit=program_data["program"].total_places,
                        status=applicant_data["status"],
                        priority=program_data["priority"],
                        source=applicant_data["source"],
                        exam_results=applicant_data["exam_results"]
                    )
                    applicants_to_add.append(applicant)
                
                applicant_id_counter += 1
            
            db.add_all(applicants_to_add)
            db.commit()
            total_applicants = len(applicants_data)
            print(f"✅ Created {len(applicants_to_add)} applications total ({total_applicants} applicants × 3 programs = {len(applicants_to_add)} applications)")
        
        print("✅ Test data initialized successfully.")
    except Exception as e:
        db.rollback()
        print(f"❌ Error initializing test data: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    init_test_data()
