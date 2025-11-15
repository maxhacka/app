from ast import Call
import aiohttp
import aiomax

from aiomax import Router
from aiomax.buttons import CallbackButton, KeyboardBuilder

from app.bot.keyboards import go_to_menu_kb
from app.services.applicants_service import extract_programs, format_rating_list, get_applicants_by_program, get_applicants_by_user_id
from app.utils.access_control import access_control


applicants_router = Router()

@applicants_router.on_button_callback("applicants")
@access_control("applicant")
async def applicants_handler(cb: aiomax.Callback, user_info):
    user_id = cb.user.user_id

    async with aiohttp.ClientSession() as session:
        my_apps = await get_applicants_by_user_id(session, user_id)
    
    programs = extract_programs(my_apps)

    if not programs:
        return await cb.message.edit("❗ У вас нет поданных заявлений.", keyboard=go_to_menu_kb())

    # формируем кнопки направлений
    kb = KeyboardBuilder()
    for p in programs:
        kb.row(CallbackButton(p["program"], f'app_rating_prog:{p["program"]}:{p["app_id"]}'))

    kb.row(CallbackButton("◀️ В меню", "menu"))

    await cb.message.edit(
        "Выберите направление, для которого хотите увидеть рейтинг:",
        keyboard=kb
    )


    # program = user_info["data"]["program"]
    # user_id = cb.user.user_id

    # await cb.message.edit("🔄 Получаю рейтинговый список...")

    # async with aiohttp.ClientSession() as session:
    #     applicants = await get_applicants_by_program(session, program)

    # if not applicants:
    #     await cb.message.edit("❗ По этому направлению никто не найден.", keyboard=go_to_menu_kb())

    # text = format_raing_list(applicants, user_id)

    # await cb.message.edit(text, keyboard=go_to_menu_kb())


@applicants_router.on_button_callback(lambda data: data.payload.startswith("app_rating_prog:"))
@access_control("applicant")
async def certificates_raiting_handler(cb: aiomax.Callback, user_info):
    parts = cb.payload.split(":")
    program = parts[1]
    app_id = parts[2]
    user_id = cb.user.user_id

    await cb.message.edit("🔄 Получаю рейтинговый список...")

    async with aiohttp.ClientSession() as session:
        applicants = await get_applicants_by_program(session, program)

    if not applicants:
        kb = KeyboardBuilder().row(CallbackButton("⬅️ Назад", "applicants"))
        await cb.message.edit("❗ По этому направлению никто не найден.", keyboard=kb)

    kb = KeyboardBuilder().row(CallbackButton("⬅️ Назад", "applicants"))
    text = format_rating_list(applicants, app_id)

    await cb.message.edit(text, keyboard=kb)
    # async with aiohttp.ClientSession() as session:
    #     my_apps = await get_applicants_by_user_id(session, user_id)
    # user_app = get_user_application_for_program(my_apps, program)

    # if not user_app:
    #     kb = KeyboardBuilder().row(CallbackButton("⬅️ Назад", "applicants"))
    #     await cb.message.edit("❗ Заявка по этому направлению не найдена.", keyboard=kb)

    # async with aiohttp.ClientSession() as session:
    #     rating = await get_applicants_by_program(session, program)

    # rank = find_user_rank(rating, user_app["id"])

    # if not rank:
    #     kb = KeyboardBuilder().row(CallbackButton("⬅️ Назад", "applicants"))
    #     await cb.message.edit("❗ Вы есть в списке заявлений, но не найдены в рейтинге.", keyboard=kb)

    # section = format_rating_section(rating, rank)

    # text = (
    #     f"**🏆 Рейтинг по направлению:** {program}\n\n"
    #     f"{format_full_rating(section)}"
    # )
    # kb = KeyboardBuilder().row(CallbackButton("⬅️ Назад", "applicants"))

    # await cb.message.edit(text, format="markdown", keyboard=kb)