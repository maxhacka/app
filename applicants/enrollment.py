"""
Модуль для расчета зачисления абитуриентов по алгоритму высшего приоритета.

Алгоритм основан на требованиях Приказа Минобрнауки России от 26.08.2022 № 814.
Высший приоритет - наиболее высокий приоритет зачисления, по которому абитуриент 
проходит по конкурсу в пределах установленного количества мест.
"""
from typing import Dict, List, Set
from collections import defaultdict
from sqlalchemy.orm import Session
import models


class EnrollmentResult:
    """Результат зачисления для одной программы"""
    def __init__(self, program_name: str, total_places: int):
        self.program_name = program_name
        self.total_places = total_places
        self.enrolled: List[models.Applicant] = []
        self.rejected: List[models.Applicant] = []
    
    def add_enrolled(self, applicant: models.Applicant):
        """Добавить зачисленного абитуриента"""
        self.enrolled.append(applicant)
    
    def add_rejected(self, applicant: models.Applicant):
        """Добавить не зачисленного абитуриента"""
        self.rejected.append(applicant)


def calculate_enrollment(db: Session) -> Dict[str, EnrollmentResult]:
    """
    Рассчитывает зачисление абитуриентов по алгоритму высшего приоритета.
    
    Алгоритм (на основе Приказа Минобрнауки России от 26.08.2022 № 814):
    
    1. Группируем абитуриентов по SNILS (один человек может иметь несколько заявлений)
    2. Для каждого абитуриента формируем список заявлений, отсортированный по приоритету (1 - высший)
    3. Все абитуриенты отсортированы в порядке убывания суммы конкурсных баллов
    4. Обрабатываем абитуриентов по порядку (от больших баллов к меньшим):
       - Для каждого абитуриента находим его заявление с наивысшим приоритетом, 
         на программу которой еще есть свободные места
       - Если такое заявление найдено, зачисляем абитуриента на эту программу
       - Удаляем этого абитуриента из всех других программ
    5. Повторяем до тех пор, пока все бюджетные места не будут заняты или 
       не останется абитуриентов для зачисления
    
    Высший приоритет определяется динамически: любое изменение в конкурсных списках 
    приводит к перераспределению высшего приоритета у всех участвующих абитуриентов.
    
    Args:
        db: Сессия базы данных
        
    Returns:
        Словарь с результатами зачисления по программам
    """
    programs = db.query(models.Program).filter(models.Program.is_active == 1).all()
    program_dict = {p.name: p for p in programs}
    
    all_applicants = db.query(models.Applicant).filter(
        models.Applicant.status != "rejected"
    ).all()
    
    applicants_by_snils: Dict[str, List[models.Applicant]] = defaultdict(list)
    for applicant in all_applicants:
        if applicant.program in program_dict:
            applicants_by_snils[applicant.snils].append(applicant)
    
    for snils in applicants_by_snils:
        applicants_by_snils[snils].sort(key=lambda x: x.priority)

    unique_applicants = []
    seen_snils = set()
    
    for applicant in all_applicants:
        if applicant.snils not in seen_snils:
            max_score_app = max(
                [app for app in applicants_by_snils[applicant.snils]],
                key=lambda x: (x.exam_results if x.exam_results is not None else 0)
            )
            unique_applicants.append((applicant.snils, max_score_app))
            seen_snils.add(applicant.snils)
    

    unique_applicants.sort(
        key=lambda x: (x[1].exam_results if x[1].exam_results is not None else 0),
        reverse=True
    )
    
    results: Dict[str, EnrollmentResult] = {}
    budget_places = {}
    for program_name, program in program_dict.items():
        results[program_name] = EnrollmentResult(program_name, program.total_places)
        budget_places[program_name] = program.total_places
    
    enrolled_snils: Set[str] = set()

    applicants_by_program: Dict[str, List[models.Applicant]] = defaultdict(list)
    for applicant in all_applicants:
        if applicant.program in program_dict:
            applicants_by_program[applicant.program].append(applicant)
    
    for snils, _ in unique_applicants:
        if snils in enrolled_snils:
            continue

        applicant_applications = applicants_by_snils[snils]

        enrolled = False
        for application in applicant_applications:
            program_name = application.program
            if program_name not in program_dict:
                continue
            
            if budget_places[program_name] > 0:
                results[program_name].add_enrolled(application)
                enrolled_snils.add(snils)
                budget_places[program_name] -= 1
                enrolled = True

                for other_program_name in applicants_by_program:
                    if other_program_name != program_name:
                        applicants_by_program[other_program_name] = [
                            app for app in applicants_by_program[other_program_name]
                            if app.snils != snils
                        ]
                
                break

        if not enrolled:
            for application in applicant_applications:
                program_name = application.program
                if program_name in results:
                    if application not in results[program_name].rejected:
                        results[program_name].add_rejected(application)
    
    for program_name, applicants in applicants_by_program.items():
        for applicant in applicants:
            if applicant.snils not in enrolled_snils:
                if applicant not in results[program_name].enrolled:
                    if applicant not in results[program_name].rejected:
                        results[program_name].add_rejected(applicant)
    
    return results

