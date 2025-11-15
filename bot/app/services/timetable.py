from aiomax import aiohttp
from datetime import date as date_type

from app.services.auth_service import auth_service
from app.utils.url_helper import get_service_url

BASE_URL = f"{get_service_url(8003)}/api/timetable/schedule"

async def get_schedule(
    session: aiohttp.ClientSession,
    group_name: str | None = None,
    teacher_id: int | None = None,
    date: str | date_type | None = None,
):
    access_token = await auth_service.get_token()

    params = {}
    if group_name:
        params["group_name"] = group_name
    if teacher_id:
        params["teacher_id"] = teacher_id
    if date:
        if isinstance(date, date_type):
            params["date_created_on"] = date.strftime("%Y-%m-%d")
        else:
            params["date_created_on"] = date

    headers = {
        "Authorization": f"Bearer {access_token}",
    }

    async with session.get(BASE_URL, headers=headers, params=params) as resp:
        if resp.status != 200:
            text = await resp.text()
            print(f"Ошибка при получении расписания ({resp.status}): {text}")
            return None

        data = await resp.json()
        return data

async def get_schedule_for_group(session, group_name, date):
    return await get_schedule(session, group_name=group_name, date=date)


async def get_schedule_for_teacher(session, teacher_id, date):
    return await get_schedule(session, teacher_id=teacher_id, date=date)