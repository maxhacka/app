from app.services.auth_service import auth_service
from app.utils.url_helper import get_service_url

BASE_URL = f"{get_service_url(8007)}/api"


async def get_certificate_types(session):
    access_token = await auth_service.get_token()

    url = f"{BASE_URL}/certificate-types"
    headers = {"Authorization": f"Bearer {access_token}"}

    async with session.get(url, headers=headers) as resp:
        if resp.status != 200:
            return []
        return await resp.json()

async def get_user_certificates(session, max_user_id):
    access_token = await auth_service.get_token()

    url = f"{BASE_URL}/certificates"
    headers = {"Authorization": f"Bearer {access_token}"}
    params = {"max_user_id": max_user_id}

    async with session.get(url, headers=headers, params=params) as resp:
        if resp.status != 200:
            return []
        return await resp.json()

async def create_certificate(session, data: dict):
    access_token = await auth_service.get_token()

    url = f"{BASE_URL}/certificates"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    async with session.post(url, headers=headers, json=data) as resp:
        if resp.status != 201 and resp.status != 200:
            print(await resp.text())
            return None
        return await resp.json()

def format_certificate_types(types):
    text = "**Доступные виды справок:**\n\n"
    for c in types:
        text += (
            f"📄 **{c['name']}**\n"
            f"{c['description']}\n"
            f"⏱ Срок изготовления: {c['processing_days']} дн.\n"
            # f"💰 Стоимость: {c['price']} руб.\n\n"
        )
    return text

def format_user_certificates(certs):
    if not certs:
        return "📁 У вас пока нет заказанных справок."

    text = "**Ваши заявки на справки:**\n\n"
    status_map = {
        "processing": "⏳ В обработке",
        "ready": "✅ Готово",
        "issued": "📤 Выдано",
        "rejected": "❌ Отклонено",
    }
    delivery_map = {
        "pickup": "🏢 Самовывоз",
        "delivery": "🚚 Доставка"
    }
    for c in certs:
        text += (
            f"📄 **{c['certificate_type']}**\n"
            f"🔹 Статус: {status_map.get(c['status'], c['status'])}\n"
            f"🎯 Цель: {c['purpose']}\n"
            f"📦 Способ получения: {delivery_map[c['delivery_method']]}\n"
        )

        if c["delivery_method"] == "delivery" and c.get("delivery_address"):
            text += f"🏠 Адрес: {c['delivery_address']}\n"

        if c.get("document_url"):
            text += f"[📥 Скачать документ]({c['document_url']})\n"

        text += "\n"

    return text