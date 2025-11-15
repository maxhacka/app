import aiohttp

from app.services.auth_service import auth_service
from app.utils.url_helper import get_service_url

BASE_URL = f"{get_service_url(8002)}/api/staff/students"


async def get_students(
    session: aiohttp.ClientSession,
    group_name: str | None = None,
    status: str | None = None,
    faculty: str | None = None,
    course: int | None = None,
    student_number: str | None = None,
):
    access_token = await auth_service.get_token()

    params = {}
    if group_name:
        params["group_name"] = group_name
    if status:
        params["status"] = status
    if faculty:
        params["faculty"] = faculty
    if course:
        params["course"] = course
    if student_number:
        params["student_number"] = student_number

    headers = {"Authorization": f"Bearer {access_token}"}

    async with session.get(BASE_URL, headers=headers, params=params) as resp:
        if resp.status != 200:
            text = await resp.text()
            print(f"Ошибка при получении студентов ({resp.status}): {text}")
            return None

        return await resp.json()

async def get_students_by_group(session: aiohttp.ClientSession, group_name: str):
    return await get_students(session=session, group_name=group_name)

async def get_all_groups(session: aiohttp.ClientSession) -> list[str]:
    students = await get_students(session)
    groups = sorted({st.get("group_name") for st in students if st.get("group_name")})
    return groups

def format_students(students: list[dict], group_name: str) -> str:
    if not students:
        if group_name:
            return f"👨‍🎓 В группе «{group_name}» пока нет активных студентов."
        return "👨‍🎓 Студенты не найдены."

    text = f"🎓 Студенты{f' группы «{group_name}»' if group_name else ''}:\n\n"

    for s in students:
        name = s.get("name", "Без имени")
        group = s.get("group_name", "")
        course = s.get("course", "")
        faculty = s.get("faculty", "")
        specialization = s.get("specialization", "")
        email = s.get("email", "")
        phone = s.get("phone", "")

        text += (
            f"👤 **{name}**\n"
            f"🏫 {faculty} ({specialization})\n"
            f"📘 Группа: {group}, курс: {course}\n"
            f"📧 {email}\n"
            f"📞 {phone}\n\n"
        )

    return text