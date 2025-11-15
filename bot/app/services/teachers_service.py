import aiohttp

from app.services.auth_service import auth_service
from app.utils.url_helper import get_service_url

BASE_URL = f"{get_service_url(8002)}/api/staff/teachers"


async def get_teachers(
    session: aiohttp.ClientSession,
    department: str | None = None,
    status: str | None = None,
    teacher_number: str | None = None,
):
    access_token = await auth_service.get_token()

    params = {}
    if department:
        params["department"] = department
    if status:
        params["status"] = status
    if teacher_number:
        params["teacher_number"] = teacher_number

    headers = {"Authorization": f"Bearer {access_token}"}

    async with session.get(BASE_URL, headers=headers, params=params) as resp:
        if resp.status != 200:
            text = await resp.text()
            print(f"Ошибка при получении преподавателей ({resp.status}): {text}")
            return None

        return await resp.json()

async def get_departments_from_teachers(session: aiohttp.ClientSession) -> list[str]:
    access_token = await auth_service.get_token()

    headers = {"Authorization": f"Bearer {access_token}"}

    async with session.get(BASE_URL, headers=headers) as resp:
        if resp.status != 200:
            print(f"Ошибка при получении кафедр: {resp.status}")
            print(await resp.text())
            return []

        teachers = await resp.json()
        departments = sorted({t.get("department") for t in teachers if t.get("department")})
        return departments