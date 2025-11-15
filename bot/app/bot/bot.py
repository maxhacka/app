import aiohttp
import aiomax
from aiomax.fsm import FSMCursor
from app.bot.auth import auth_router
from app.bot.fsm_model import AuthState
from app.bot.handlers import *
from app.bot.keyboards import applicant_kb, student_kb, teacher_kb
from app.config import settings
from app.services.user_check import get_user_by_max_id, update_max_user_id
from app.utils.access_control import access_control


BOT_TOKEN = settings.BOT_TOKEN

bot = aiomax.Bot(BOT_TOKEN)
bot.add_router(auth_router)
bot.add_router(timetable_router)
bot.add_router(staff_router)
bot.add_router(library_router)
bot.add_router(events_router)
bot.add_router(certificates_router)
bot.add_router(applicants_router)

@bot.on_bot_start()
async def bot_start_handler(bsp: aiomax.BotStartPayload, cursor: FSMCursor):
    async with aiohttp.ClientSession() as session:
        user_info = await get_user_by_max_id(session, bsp.user.user_id)

    if not user_info:
        text = (
            "👋 Добро пожаловать в MAX EDU!\n\n"
            "📚 Здесь вы сможете:\n"
            "   • Просматривать своё расписание занятий и важные события 🎓\n"
            "   • Узнавать обо всех мероприятиях и новостях вашего университета 🎉\n"
            "   • Изучать и брать книги из библиотеки 📖\n"
            "   • Заказывать и просматривать справки 📄\n\n"
            "🔑 Для начала работы с ботом, пожалуйста, введите ваш уникальный номер:\n"
            "   - студенческий билет 🏫\n"
            "   - преподавательский номер 👩‍🏫\n"
            "   - номер абитуриента 🎓"
        )
        await bsp.send(text)
        cursor.change_state(AuthState.waiting_for_number)
        return

    user_type = user_info["type"]
    data = user_info["data"]

    match user_type:
        case "student":
            kb = student_kb()
            await bsp.send(f"🎓 Привет, студент {data.get('name', 'Без имени')}!", keyboard=kb)
        case "teacher":
            kb = teacher_kb()
            await bsp.send(f"👨‍🏫 Добро пожаловать, преподаватель {data.get('name', 'Без имени')}!", keyboard=kb)
        case "applicant":
            kb = applicant_kb()
            await bsp.send(f"📄 Здравствуйте, абитуриент {data.get('name', 'Без имени')}!", keyboard=kb)

@bot.on_button_callback("menu")
async def menu_handler(cb: aiomax.Callback, cursor: FSMCursor):
    cursor.clear()

    async with aiohttp.ClientSession() as session:
        user_info = await get_user_by_max_id(session, cb.user.user_id)

    user_type = user_info["type"]
    data = user_info["data"]

    match user_type:
        case "student":
            kb = student_kb()
            await cb.message.edit(f"🎓 Привет, студент {data.get('name', 'Без имени')}!", keyboard=kb)
        case "teacher":
            kb = teacher_kb()
            await cb.message.edit(f"👨‍🏫 Добро пожаловать, преподаватель {data.get('name', 'Без имени')}!", keyboard=kb)
        case "applicant":
            kb = applicant_kb()
            await cb.message.edit(f"📄 Здравствуйте, абитуриент {data.get('name', 'Без имени')}!", keyboard=kb)

@bot.on_button_callback("logout")
@access_control()
async def logout_handler(cb: aiomax.Callback, user_info):
    user_type = user_info["type"]
    user_phone = user_info["data"]["phone"]

    async with aiohttp.ClientSession() as session:
        updated = await update_max_user_id(session, user_type, user_phone, None)

    await cb.message.delete()

    if updated:
        await cb.message.send("🚶 Вы успешно вышли из личного кабинета. Для повторной авторизации введите /start")
    else:
        await cb.message.send("❌ Не удалось выйти из личного кабинета.")