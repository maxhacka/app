import aiohttp
from app.services.auth_service import auth_service
from app.utils.url_helper import get_service_url

BASE_URL = f"{get_service_url(8004)}/api/applicants/applicants"


async def get_applicants_by_program(session: aiohttp.ClientSession, program: str):
    access_token = await auth_service.get_token()

    headers = {"Authorization": f"Bearer {access_token}"}
    params = {"program": program, "sort_by_exam_results": "true"}

    async with session.get(BASE_URL, headers=headers, params=params) as resp:
        if resp.status != 200:
            return []
        return await resp.json()

async def get_applicants_by_user_id(session: aiohttp.ClientSession, max_user_id: int):
    access_token = await auth_service.get_token()

    headers = {"Authorization": f"Bearer {access_token}"}
    params = {"max_user_id": max_user_id}

    async with session.get(BASE_URL, headers=headers, params=params) as resp:
        if resp.status != 200:
            return []
        return await resp.json()

def extract_programs(my_applications):
    programs = []

    for app in my_applications:
        p = app["program"]
        if p not in programs:
            programs.append({"program": p, "app_id": app["applicant_id"]})

    return programs

def format_rating_list(applicants: list, app_id: str) -> str:
    applicants_sorted = sorted(
        applicants,
        key=lambda a: a["exam_results"] or 0,
        reverse=True
    )

    n = len(applicants_sorted)

    my_index = next(
        (i for i, a in enumerate(applicants_sorted)
         if a.get("applicant_id") == app_id),
        None
    )

    def line(i, a):
        score = a["exam_results"] if a["exam_results"] is not None else 0
        name = "🟦 Вы" if a.get("applicant_id") == app_id else a["name"]
        limit = a.get("program_limit") or 0

        status = " — проходит" if i <= limit else ""

        return f"{i}. {name} — {score}"

    segments = []

    top_end = min(3, n)
    top = list(range(0, top_end))
    segments.append(top)

    around = []
    if my_index is not None:
        if my_index >= top_end:
            start = max(0, my_index - 1)
            end = min(n, my_index + 2)
            around = list(range(start, end))
            segments.append(around)

    bottom_raw = list(range(max(0, n - 3), n))

    used = set()
    cleaned_segments = []

    for seg in segments:
        clean = [i for i in seg if i not in used]
        if clean:
            cleaned_segments.append(clean)
            used.update(clean)

    if cleaned_segments:
        last_used = max(max(seg) for seg in cleaned_segments)
    else:
        last_used = -1

    bottom = [i for i in bottom_raw if i > last_used]

    if bottom:
        cleaned_segments.append(bottom)

    result_lines = []
    for idx, seg in enumerate(cleaned_segments):
        if idx > 0:
            result_lines.append("...")

        for i in seg:
            result_lines.append(line(i + 1, applicants_sorted[i]))

    return "\n".join(result_lines)
