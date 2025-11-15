"""Authentication router and handlers for bot."""
import aiohttp
import aiomax
from aiomax import Router, filters
from aiomax.fsm import FSMCursor
from aiomax.types import Message
from aiomax.buttons import ContactButton, KeyboardBuilder
from app.bot.fsm_model import AuthState
from app.bot.keyboards import applicant_kb, student_kb, teacher_kb
from app.services.user_check import find_user_by_number, get_user_by_max_id, update_max_user_id, verify_user_phone

auth_router = Router()

@auth_router.on_command("start")
async def handle_start(ctx: aiomax.CommandContext, cursor: FSMCursor):
    async with aiohttp.ClientSession() as session:
        user_info = await get_user_by_max_id(session, ctx.message.sender.user_id)

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
        await ctx.message.send(text)
        cursor.change_state(AuthState.waiting_for_number)
        return

    user_type = user_info["type"]
    data = user_info["data"]

    match user_type:
        case "student":
            kb = student_kb()
            await ctx.message.send(f"🎓 Привет, студент {data.get('name', 'Без имени')}!", keyboard=kb)
        case "teacher":
            kb = teacher_kb()
            await ctx.message.send(f"👨‍🏫 Добро пожаловать, преподаватель {data.get('name', 'Без имени')}!", keyboard=kb)
        case "applicant":
            kb = applicant_kb()
            await ctx.message.send(f"📄 Здравствуйте, абитуриент {data.get('name', 'Без имени')}!", keyboard=kb)

@auth_router.on_message(filters.state(AuthState.waiting_for_number))
async def handle_student_number(message: aiomax.Message, cursor: FSMCursor):
    number = message.body.text
    
    async with aiohttp.ClientSession() as session:
        found = await find_user_by_number(session, number)

    if not found:
        await message.send("❌ Номер не найден. Попробуйте еще раз.")
        return
    
    cursor.change_data({"user_type": found["type"], "user_data": found["data"]})

    keyboard = KeyboardBuilder().add(ContactButton("Поделиться номером"))
    await message.send("👤 Пожалуйста, поделитесь вашим номером телефона.", keyboard=keyboard)

    cursor.change_state(AuthState.waiting_for_phone)


@auth_router.on_message(filters.state(AuthState.waiting_for_phone))
async def handle_phone(message: Message, cursor: FSMCursor):
    data = cursor.get_data()
    user_type = data["user_type"]
    user_data = data["user_data"]
    user_phone = user_data["phone"]
    user_id = user_data.get("id")
    max_user_id = message.sender.user_id

    phone = None
    contact_found = False

    for attachment in message.body.attachments:
        if attachment.type == "contact":
            phone = "+"
            phone += attachment.vcf_phone
            # phone = "+75015452665" # 20220001
            # phone = "+75013446286" # T-2021001
            # phone = "+75011234592" # APP026-P1
            contact_found = True
            break

    if not contact_found:
        keyboard = KeyboardBuilder().add(ContactButton("Поделиться номером"))

        await message.send("Пожалуйста, поделитесь вашим номером телефона.", keyboard=keyboard)
        return
    
    async with aiohttp.ClientSession() as session:
        # verified = await verify_user_phone(session, phone, user_type)
        verified = True if phone == user_phone else False

        if verified:
            updated = await update_max_user_id(session, user_type, phone, max_user_id)
            if updated:
                await message.send("✅ Авторизация успешна.")
                user_info = await get_user_by_max_id(session, message.sender.user_id)

                user_type = user_info["type"]
                data = user_info["data"]

                match user_type:
                    case "student":
                        kb = student_kb()
                        await message.send(f"🎓 Привет, студент {data.get('name', 'Без имени')}!", keyboard=kb)
                    case "teacher":
                        kb = teacher_kb()
                        await message.send(f"👨‍🏫 Добро пожаловать, преподаватель {data.get('name', 'Без имени')}!", keyboard=kb)
                    case "applicant":
                        kb = applicant_kb()
                        await message.send(f"📄 Здравствуйте, абитуриент {data.get('name', 'Без имени')}!", keyboard=kb)
            else:
                await message.send("✅ Авторизация успешна, но не удалось сохранить Max user_id")
        else:
            await message.send("❌ Телефон не найден. Попробуйте еще раз через /start.")
    
    cursor.clear()
