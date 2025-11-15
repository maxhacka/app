import aiohttp
import aiomax
import dateparser

from datetime import date
from aiomax import Router, filters
from aiomax.fsm import FSMCursor

from app.bot.fsm_model import PickDateState
from app.bot.keyboards import pagination_keyboard
from app.config import settings
from app.services.timetable import get_schedule_for_group, get_schedule_for_teacher
from app.utils.access_control import access_control


timetable_router = Router()


@timetable_router.on_button_callback("timetable")
@access_control("student", "teacher")
async def timetable_handler(cb: aiomax.Callback, user_info):
    today = date.today()
    async with aiohttp.ClientSession() as session:
        timetable = await get_timetable(session, user_info, today)

    text = format_timetable(timetable, today)
    kb = pagination_keyboard(today, "timetable")

    await cb.message.edit(text, format="markdown", keyboard=kb)

@timetable_router.on_button_callback(lambda data: data.payload.startswith("timetable:"))
@access_control("student", "teacher")
async def timetable_pagination_handler(cb: aiomax.Callback, cursor: FSMCursor, user_info):
    _, payload = cb.payload.split(":", 1)

    if payload == "pick":
        await cb.send("📅 Введите дату (например: 'завтра', '15 ноября', 'понедельник').")
        cursor.change_state(PickDateState.waiting_for_timetable_date)
        return

    try:
        target_date = date.fromisoformat(payload)
    except ValueError:
        print("Неверный формат даты")
        return

    async with aiohttp.ClientSession() as session:
        timetable = await get_timetable(session, user_info, target_date)

    text = format_timetable(timetable, target_date)
    kb = pagination_keyboard(target_date, "timetable")

    await cb.message.edit(text=text, format='markdown', keyboard=kb)

@timetable_router.on_message(filters.state(PickDateState.waiting_for_timetable_date))
@access_control("student", "teacher")
async def timetable_date_input_handler(message: aiomax.Message, cursor: FSMCursor, user_info):
    text = message.body.text.strip().lower()
    parsed = dateparser.parse(text, languages=["ru"])
    if not parsed:
        await message.answer("❌ Не удалось распознать дату. Попробуйте, например: '15 ноября' или 'вчера'.")
        return

    target_date = parsed.date()
    async with aiohttp.ClientSession() as session:
        timetable = await get_timetable(session, user_info, target_date)

    text = format_timetable(timetable, target_date)
    kb = pagination_keyboard(target_date, "timetable")

    await message.send(text, format='markdown', keyboard=kb)
    cursor.clear_state()



async def get_timetable(session: aiohttp.ClientSession, user_info, day: date):
    user_type = user_info["type"]
    user_data = user_info["data"]

    async with aiohttp.ClientSession() as session:
        if user_type == "student":
            data = await get_schedule_for_group(session, user_data["group_name"], day)
        else:
            data = await get_schedule_for_teacher(session, user_data["id"], day)

    return data

def format_timetable(data, day: date):
    if not data:
        return f"📅 {day.strftime('%d.%m.%Y')} — занятий нет."
    lines = [f"📅 **{day.strftime('%A, %d.%m.%Y')}**\n"]
    for lesson in data:
        lines.append(
            f"🕒 {lesson['time_start']}–{lesson['time_end']}\n📘 **{lesson['subject']}**\n*{'Практическое занятие' if lesson['type'] == 'practice' else 'Лекция'}*\n{lesson['teacher']}\n{lesson['room']}\n"
            )
    return "\n".join(lines)