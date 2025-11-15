import aiohttp
from app.services.auth_service import auth_service
from app.utils.url_helper import get_service_url

async def fetch_with_auth(session: aiohttp.ClientSession, url: str):
    token = await auth_service.get_token()
    headers = {"Authorization": f"Bearer {token}"}
    async with session.get(url, headers=headers, params={"limit": 200}) as resp:
        if resp.status == 200:
            return await resp.json()
        elif resp.status == 404:
            return None
        else:
            print(f"Ошибка {resp.status} при запросе {url}")
            return None


async def find_user_by_number(session: aiohttp.ClientSession, number: str):
    endpoints = {
        "applicant": f"{get_service_url(8004)}/api/applicants/applicants/",
        "teacher": f"{get_service_url(8002)}/api/staff/teachers/",
        "student": f"{get_service_url(8002)}/api/staff/students/",
    }

    for key, url in endpoints.items():
        data = await fetch_with_auth(session, url)

        if not isinstance(data, list):
            print(f"[{key}] Некорректный ответ: {data}")
            continue

        for item in data:
            field = None
            match key:
                case "applicant":
                    field = item.get("applicant_id")
                case "teacher":
                    field = item.get("teacher_number")
                case "student":
                    field = item.get("student_number")

            if field and str(field).strip() == number.strip():
                return {"type": key, "data": item}
    return None


async def verify_user_phone(session: aiohttp.ClientSession, phone: str, known_type: str | None = None):
    endpoints = {
        "applicant": f"{get_service_url(8004)}/api/applicants/applicants/",
        "teacher": f"{get_service_url(8002)}/api/staff/teachers/",
        "student": f"{get_service_url(8002)}/api/staff/students/",
    }

    types_to_check = [known_type] if known_type else ["applicant", "teacher", "student"]

    for key in types_to_check:
        url = endpoints[key]
        data = await fetch_with_auth(session, url)

        if not isinstance(data, list):
            continue

        for item in data:
            phone_field = item.get("phone")

            if not phone_field:
                continue

            if str(phone_field).replace("+", "").strip() == phone.replace("+", "").strip():
                return True

    return False

async def update_max_user_id(session: aiohttp.ClientSession, entity_type: str, phone: str, max_user_id: int):
    token = await auth_service.get_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    match entity_type:
        case "student":
            url = f"{get_service_url(8002)}/api/staff/students/update-max-id"
        case "teacher":
            url = f"{get_service_url(8002)}/api/staff/teachers/update-max-id"
        case "applicant":
            url = f"{get_service_url(8004)}/api/applicants/applicants/update-max-id"
        case _:
            print(f"[update_max_user_id] Неизвестный тип: {entity_type}")
            return False

    payload = {"phone": phone, "max_user_id": max_user_id}

    async with session.post(url, headers=headers, json=payload) as resp:
        if resp.status in (200, 204):
            print(f"[update_max_user_id] {entity_type} #{phone} успешно обновлён ✅")
            return True
        else:
            err = await resp.text()
            print(f"[update_max_user_id] Ошибка {resp.status}: {err}")
            return False

async def get_user_by_max_id(session: aiohttp.ClientSession, max_user_id: int):
    token = await auth_service.get_token()
    headers = {"Authorization": f"Bearer {token}"}

    endpoints = {
        "student": f"{get_service_url(8002)}/api/staff/students?max_user_id={max_user_id}",
        "teacher": f"{get_service_url(8002)}/api/staff/teachers?max_user_id={max_user_id}",
        "applicant": f"{get_service_url(8004)}/api/applicants/applicants?max_user_id={max_user_id}"
    }

    for user_type, url in endpoints.items():
        async with session.get(url, headers=headers, params={"limit": 200}) as resp:
            if resp.status == 200:
                data = await resp.json()
                if isinstance(data, list) and len(data) > 0:
                    return {"type": user_type, "data": data[0]}
            else:
                print(f"[get_user_by_max_id] Ошибка {resp.status} при запросе {url}")

    return None