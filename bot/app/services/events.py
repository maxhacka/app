import aiohttp

from datetime import date as date_type

from app.services.auth_service import auth_service
from app.utils.url_helper import get_service_url

BASE_URL = f"{get_service_url(8005)}/api/events/events"


async def get_events(
    session: aiohttp.ClientSession,
    category: str | None = None,
    status: str | None = None,
    date_from: str | date_type | None = None,
    date_to: str | date_type | None = None,
):
    access_token = await auth_service.get_token()

    params = {}
    if category:
        params["category"] = category
    if status:
        params["status"] = status
    if date_from:
        if isinstance(date_from, date_type):
            params["date_from"] = date_from.strftime("%Y-%m-%d")
        else:
            params["date_from"] = date_from
    if date_to:
        if isinstance(date_to, date_type):
            params["date_to"] = date_to.strftime("%Y-%m-%d")
        else:
            params["date_to"] = date_to

    headers = {
        "Authorization": f"Bearer {access_token}",
    }

    async with session.get(BASE_URL, headers=headers, params=params) as resp:
        if resp.status != 200:
            text = await resp.text()
            print(f"Ошибка при получении событий ({resp.status}): {text}")
            return None

        return await resp.json()

async def get_events_for_day(session, day: date_type, category: str | None = None):
    return await get_events(session, category=category, date_from=day, date_to=day)