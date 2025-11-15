import aiohttp
import aiomax

from aiomax import Router
from aiomax.buttons import CallbackButton, KeyboardBuilder

from app.bot.keyboards import departments_kb, go_to_menu_kb, groups_kb, students_staff_kb, teachers_staff_kb
from app.services.students_service import format_students, get_all_groups, get_students_by_group
from app.services.teachers_service import get_departments_from_teachers, get_teachers
from app.utils.access_control import access_control


staff_router = Router()

@staff_router.on_button_callback("staff")
@access_control("student", "teacher")
async def staff_handler(cb: aiomax.Callback, user_info):
    type = user_info["type"]

    if type == "student":
        kb = students_staff_kb()
    elif type == "teacher":
        kb = teachers_staff_kb()

    await cb.message.edit("📋 Выберите, что хотите посмотреть:", keyboard=kb)

@staff_router.on_button_callback("teachers")
@access_control("student", "teacher")
async def teachers_staff_handler(cb: aiomax.Callback, user_info):
    await cb.message.edit("🔄 Загружаю список кафедр...")

    async with aiohttp.ClientSession() as session:
        departments = await get_departments_from_teachers(session)

    if not departments:
        await cb.message.edit("❗ Не удалось получить список кафедр.", keyboard=go_to_menu_kb())
        return

    kb = departments_kb(departments)

    await cb.message.edit(
        "🏛 Выберите кафедру, чтобы посмотреть преподавателей:",
        keyboard=kb,
    )

@staff_router.on_button_callback(lambda data: data.payload.startswith("dep:"))
@access_control("student", "teacher")
async def show_teachers_staff_handler(cb: aiomax.Callback, user_info):
    department = cb.payload.split(":", 1)[1]
    await cb.message.edit(f"🔄 Загружаю преподавателей кафедры «{department}»...")

    async with aiohttp.ClientSession() as session:
        teachers = await get_teachers(session, department, "active")

    text = format_teachers(teachers, department)
    kb = KeyboardBuilder().add(CallbackButton("⬅️ Назад", "teachers"))

    await cb.message.edit(text, format="markdown", keyboard=kb)

@staff_router.on_button_callback("my_group")
@access_control("student")
async def show_my_group_handler(cb: aiomax.Callback, user_info):
    group_name = user_info["data"]["group_name"]
    if not group_name:
        kb = KeyboardBuilder().add(CallbackButton("⬅️ Назад", "staff"))
        await cb.message.edit("❗ Не удалось определить вашу группу.", keyboard=kb)
        return

    async with aiohttp.ClientSession() as session:
        students = await get_students_by_group(session, group_name)

    text = format_students(students, group_name)
    kb = KeyboardBuilder().add(CallbackButton("⬅️ Назад", "staff"))

    await cb.message.edit(text, format="markdown", keyboard=kb)

@staff_router.on_button_callback("my_students")
@access_control("teacher")
async def show_my_students_handler(cb: aiomax.Callback, user_info):
    await cb.message.edit(f"🔄 Загружаю список групп...")
    
    async with aiohttp.ClientSession() as session:
        groups = await get_all_groups(session)

    if not groups:
        await cb.message.edit("❗ Не удалось получить список групп.", keyboard=go_to_menu_kb())

    text = "📚 Выберите группу:"
    kb = groups_kb(groups)

    await cb.message.edit(text, format="markdown", keyboard=kb)

@staff_router.on_button_callback(lambda data: data.payload.startswith("group:"))
@access_control("teacher")
async def show_students_staff_handler(cb: aiomax.Callback, user_info):
    group_name = cb.payload.split(":", 1)[1]
    await cb.message.edit(f"🔄 Загружаю студентов группы «{group_name}»...")

    async with aiohttp.ClientSession() as session:
        students = await get_students_by_group(session, group_name)

    text = format_students(students, group_name)
    kb = KeyboardBuilder().add(CallbackButton("⬅️ Назад", "my_students"))

    await cb.message.edit(text, format="markdown", keyboard=kb)



def format_teachers(teachers: list[dict], department: str | None = None) -> str:
    if not teachers:
        if department:
            return f"👩‍🏫 На кафедре «{department}» пока нет активных преподавателей."
        return "👩‍🏫 Преподаватели не найдены."

    text = f"👨‍🏫 Преподаватели{f' кафедры «{department}»' if department else ''}:\n\n"

    for t in teachers:
        name = t.get("name", "Без имени")
        position = t.get("position", "")
        degree = t.get("academic_degree", "")
        subjects = t.get("subjects", "").strip("[]").replace("'", "")
        email = t.get("email", "")
        phone = t.get("phone", "")

        text += (
            f"📚 **{name}**\n"
            f"🎓 {position} {degree}\n"
            f"🏛 {t.get('department', '')}\n"
            f"📖 Предметы: {subjects}\n"
            f"📧 {email}\n"
            f"📞 {phone}\n\n"
        )

    return text