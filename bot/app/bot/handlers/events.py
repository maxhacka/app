import aiohttp
import aiomax

from datetime import date
from aiomax import Router, filters
from aiomax.fsm import FSMCursor
import dateparser

from app.bot.fsm_model import PickDateState
from app.bot.keyboards import pagination_keyboard
from app.services.events import get_events_for_day
from app.utils.access_control import access_control


events_router = Router()

@events_router.on_button_callback("events")
@access_control()
async def events_handler(cb: aiomax.Callback, user_info):
    today = date.today()

    async with aiohttp.ClientSession() as session:
        events = await get_events_for_day(session, today)

    text = format_events(events, today)
    kb = pagination_keyboard(today, "events")

    await cb.message.edit(text, format="markdown", keyboard=kb)

@events_router.on_button_callback(lambda data: data.payload.startswith("events:"))
@access_control()
async def events_pagination_handler(cb: aiomax.Callback, cursor: FSMCursor, user_info):
    _, payload = cb.payload.split(":", 1)

    if payload == "pick":
        await cb.send("📅 Введите дату (например: 'завтра', '15 ноября', 'понедельник').")
        cursor.change_state(PickDateState.waiting_for_events_date)
        return

    try:
        target_date = date.fromisoformat(payload)
    except ValueError:
        print("Неверный формат даты")
        return

    async with aiohttp.ClientSession() as session:
        events = await get_events_for_day(session, target_date)

    text = format_events(events, target_date)
    kb = pagination_keyboard(target_date, "events")

    await cb.message.edit(text, format="markdown", keyboard=kb)

@events_router.on_message(filters.state(PickDateState.waiting_for_events_date))
@access_control()
async def events_date_input_handler(message: aiomax.Message, cursor: FSMCursor, user_info):
    text = message.body.text.strip().lower()
    parsed = dateparser.parse(text, languages=["ru"])
    if not parsed:
        await message.answer("❌ Не удалось распознать дату. Попробуйте, например: '15 ноября' или 'вчера'.")
        return

    target_date = parsed.date()
    async with aiohttp.ClientSession() as session:
        events = await get_events_for_day(session, target_date)

    text = format_events(events, target_date)
    kb = pagination_keyboard(target_date, "events")

    await message.send(text, format='markdown', keyboard=kb)
    cursor.clear_state()



def format_events(events: list[dict], day: date) -> str:
    if not events:
        return f"📅 На {day.strftime('%d.%m.%Y')} событий нет."

    text = f"🎉 События на {day.strftime('%d.%m.%Y')}:\n\n"
    category_map = {
        "culture": "🎭 Культура",
        "innovation": "💡 Инновации",
        "academic": "🎓 Академическое",
        "sport": "🏅 Спорт",
        "career": "💼 Карьера"
    }
    for e in events:
        title = e.get("title", "Без названия")
        description = e.get("description") or ""
        time = e.get("time", "—")
        location = e.get("location", "—")
        category = e.get("category", "—")
        participants = e.get("participants_count", 0)
        max_participants = e.get("max_participants", 0)
        registration = e.get("registration_url")
        organizer = e.get("organizer", "—")

        text += (
            f"📌 **{title}**\n"
            f"🕒 {time}\n"
            f"📍 {location}\n"
            f"🏷 Категория: {category_map[category]}\n"
        )
        text += (
            f"👥 Участников: {participants}/{max_participants}\n" if participants and max_participants else ""
            f"👤 Организатор: {organizer}\n"
        )

        if registration:
            text += f"🔗 [Регистрация]({registration})\n"

        if description:
            text += f"\n📝 {description}\n"

        text += "\n"

    return text