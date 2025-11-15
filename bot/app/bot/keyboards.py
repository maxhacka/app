from ast import Call
from datetime import date, timedelta
from typing import List, Literal
from aiomax import Callback
from aiomax.buttons import CallbackButton, KeyboardBuilder

menu_btn = CallbackButton("◀️ В меню", "menu")

def student_kb() -> KeyboardBuilder:
    kb = KeyboardBuilder()

    kb.row(
        CallbackButton("📅 Расписание", "timetable"),
        CallbackButton("🎉 События", "events"),
    )
    kb.row(
        CallbackButton("📋 Списки", "staff"),
        CallbackButton("📚 Библиотека", "library"),
    )
    kb.row(
        CallbackButton("📄 Справки", "certificates"),
    )
    kb.row(
        CallbackButton("🚪 Выйти из ЛК", "logout")
    )

    return kb

def teacher_kb() -> KeyboardBuilder:
    kb = KeyboardBuilder()

    kb.row(
        CallbackButton("📅 Расписание", "timetable"),
        CallbackButton("🎉 События", "events"),
    )
    kb.row(
        CallbackButton("📋 Списки", "staff"),
        CallbackButton("📚 Библиотека", "library"),
    )
    kb.row(
        CallbackButton("🚪 Выйти из ЛК", "logout")
    )

    return kb

def applicant_kb() -> KeyboardBuilder:
    kb = KeyboardBuilder()

    kb.row(
        CallbackButton("🎉 События", "events"),
    )
    kb.row(
        CallbackButton("🏆 Рейтинг абитуриентов", "applicants"),
    )
    kb.row(
        CallbackButton("🚪 Выйти из ЛК", "logout")
    )

    return kb



def pagination_keyboard(current_date: date, callback: Literal["timetable", "events"]) -> KeyboardBuilder:
    kb = KeyboardBuilder()
    prev_day = current_date - timedelta(days=1)
    next_day = current_date + timedelta(days=1)

    kb.row(
        CallbackButton("◀ Вчера", f"{callback}:{prev_day.isoformat()}"),
        CallbackButton("Сегодня", f"{callback}:{date.today().isoformat()}"),
        CallbackButton("Завтра ▶", f"{callback}:{next_day.isoformat()}")
        )
    kb.row(CallbackButton("📅 Выбрать дату", f"{callback}:pick"))
    kb.row(menu_btn)

    return kb


def students_staff_kb() -> KeyboardBuilder:
    kb = KeyboardBuilder()

    kb.row(
        CallbackButton("👩‍🏫 Преподаватели по кафедрам", "teachers"),
    )
    kb.row(
        CallbackButton("👨‍🎓 Моя группа", "my_group"),
    )
    kb.row(menu_btn)

    return kb

def teachers_staff_kb() -> KeyboardBuilder:
    kb = KeyboardBuilder()

    kb.row(
        CallbackButton("👩‍🏫 Преподаватели по кафедрам", "teachers"),
    )
    kb.row(
        CallbackButton("📚 Мои студенты", "my_students"),
    )
    kb.row(menu_btn)

    return kb

def departments_kb(departments: List[str]) -> KeyboardBuilder:
    kb = KeyboardBuilder()

    for dep in departments:
        kb.row(CallbackButton(dep, f"dep:{dep}"))

    kb.row(menu_btn)

    return kb

def groups_kb(groups: List[str]) -> KeyboardBuilder:
    kb = KeyboardBuilder()

    for g in groups:
        kb.row(CallbackButton(g, f"group:{g}"))

    kb.row(menu_btn)

    return kb

def books_kb(books: List[str]) -> KeyboardBuilder:
    kb = KeyboardBuilder()

    for b in books:
        kb.row(CallbackButton(f"{b['title']} — {b['author']}", f"book:{b['id']}"))

    kb.row(CallbackButton("❌ Новый поиск", "library"))

    return kb

def certificates_kb() -> KeyboardBuilder:
    kb = KeyboardBuilder()

    kb.row(
        CallbackButton("📑 Заказать справку", "cert_order"),
    )
    kb.row(
        CallbackButton("📂 Мои справки", "cert_list"),
    )
    kb.row(menu_btn)

    return kb

def certificates_order_kb(types_list: list) -> KeyboardBuilder:
    kb = KeyboardBuilder()

    for t in types_list:
        kb.row(CallbackButton(t["name"], f"cert_type:{t['id']}"))

    kb.row(CallbackButton("⬅️ Назад", "certificates"))

    return kb

def certificates_delivery_kb() -> KeyboardBuilder:
    kb = KeyboardBuilder()

    kb.row(CallbackButton("🏢 Самовывоз", "cert_delivery:pickup"))
    kb.row(CallbackButton("🚚 Доставка", "cert_delivery:delivery"))

    return kb



def go_to_menu_kb() -> KeyboardBuilder:
    return KeyboardBuilder().add(menu_btn)