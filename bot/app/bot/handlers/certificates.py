import aiohttp
import aiomax

from aiomax import Router, filters
from aiomax.buttons import CallbackButton, KeyboardBuilder
from aiomax.fsm import FSMCursor

from app.bot import keyboards
from app.bot.fsm_model import CertificateOrderState
from app.bot.keyboards import certificates_delivery_kb, certificates_order_kb, certificates_kb, go_to_menu_kb
from app.services.certificates_service import create_certificate, format_certificate_types, format_user_certificates, get_certificate_types, get_user_certificates
from app.utils.access_control import access_control


certificates_router = Router()

@certificates_router.on_button_callback("certificates")
@access_control("student")
async def certificates_handler(cb: aiomax.Callback, user_info):
    text = "**Справки**\nВыберите действие:"
    kb = certificates_kb()
    await cb.message.edit(text, format="markdown", keyboard=kb)

@certificates_router.on_button_callback("cert_order")
@access_control("student")
async def certificates_order_handler(cb: aiomax.Callback, cursor: FSMCursor, user_info):
    async with aiohttp.ClientSession() as session:
        types_list = await get_certificate_types(session)

    cursor.change_state(CertificateOrderState.choosing_type)
    cursor.change_data({"types": types_list})

    text = format_certificate_types(types_list)
    kb = certificates_order_kb(types_list)

    await cb.message.edit(text, format="markdown", keyboard=kb)

@certificates_router.on_button_callback(lambda data: data.payload.startswith("cert_type:"))
@access_control("student")
async def certificates_choose_type_handler(cb: aiomax.Callback, cursor: FSMCursor, user_info):
    type_id = int(cb.payload.split(":")[1])

    data = cursor.get_data()
    data["type_id"] = type_id
    cursor.change_data(data)
    cursor.change_state(CertificateOrderState.entering_purpose)

    text = "✍️ Введите цель получения справки:"

    await cb.message.delete()
    await cb.message.send(text, format="markdown")

@certificates_router.on_message(filters.state(CertificateOrderState.entering_purpose))
@access_control("student")
async def certificates_purpose_handler(message: aiomax.Message, cursor: FSMCursor, user_info):
    data = cursor.get_data()
    data["purpose"] = message.body.text.strip()
    cursor.change_data(data)

    cursor.change_state(CertificateOrderState.choosing_delivery)

    text = "📦 Выберите способ получения:"
    kb = certificates_delivery_kb()

    await message.send(text, keyboard=kb)

@certificates_router.on_button_callback(lambda data: data.payload.startswith("cert_delivery:"))
@access_control("student")
async def certificates_choose_delivery_handler(cb: aiomax.Callback, cursor: FSMCursor, user_info):
    method = cb.payload.split(":")[1]
    data = cursor.get_data()
    data["delivery_method"] = method
    cursor.change_data(data)

    if method == "pickup":
        await finalize_certificate(cb, cursor, user_info)
    else:
        cursor.change_state(CertificateOrderState.entering_address)
        text = "🏠 Введите адрес доставки:"
        await cb.message.delete()
        await cb.message.send(text)

@certificates_router.on_message(filters.state(CertificateOrderState.entering_address))
@access_control("student")
async def certificates_delivery_address_handler(message: aiomax.Message, cursor: FSMCursor, user_info):
    data = cursor.get_data()
    data["delivery_address"] = message.body.text.strip()
    cursor.change_data(data)
    await finalize_certificate(message, cursor, user_info)

async def finalize_certificate(event: aiomax.Callback | aiomax.Message, cursor: FSMCursor, user_info):
    data = cursor.get_data()

    types_list = data["types"]
    type_obj = next(t for t in types_list if t["id"] == data["type_id"])

    post_data = {
        "max_user_id": event.user.user_id if isinstance(event, aiomax.Callback) else event.sender.user_id,
        "user_type": "student",
        "certificate_type": type_obj["name"],
        "purpose": data["purpose"],
        "delivery_method": data["delivery_method"],
        "delivery_address": data.get("delivery_address"),
        "comments": None
    }

    async with aiohttp.ClientSession() as session:
        result = await create_certificate(session, post_data)

    cursor.clear()

    if result:
        await event.send("✅ Заявка успешно создана!")
    else:
        await event.send("❌ Ошибка при создании заявки.", keyboard=go_to_menu_kb())
        return

    await event.send("📄 Ваша заявка принята!", keyboard=go_to_menu_kb())

@certificates_router.on_button_callback("cert_list")
@access_control("student")
async def certificates_list_handler(cb: aiomax.Callback, user_info):
    async with aiohttp.ClientSession() as session:
        certs = await get_user_certificates(session, cb.user.user_id)

    text = format_user_certificates(certs)
    kb = KeyboardBuilder().row(CallbackButton("⬅️ Назад", "certificates"))

    await cb.message.edit(text, format="markdown", keyboard=kb)