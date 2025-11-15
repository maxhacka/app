import aiohttp

from app.services.auth_service import auth_service
from app.utils.url_helper import get_service_url

BASE_URL = f"{get_service_url(8006)}/api/books"


async def search_books(session: aiohttp.ClientSession, query: str):
    access_token = await auth_service.get_token()
    
    headers = {"Authorization": f"Bearer {access_token}"}
    params = {"search": query}

    async with session.get(BASE_URL, headers=headers, params=params) as resp:
        if resp.status != 200:
            print(await resp.text())
            return []
        return await resp.json()

async def get_book_by_id(session: aiohttp.ClientSession, book_id: int):
    access_token = await auth_service.get_token()

    headers = {"Authorization": f"Bearer {access_token}"}
    url = f"{BASE_URL}/{book_id}"

    async with session.get(url, headers=headers) as resp:
        if resp.status != 200:
            print(await resp.text())
            return None
        return await resp.json()

def format_book_list(books: list[dict]) -> str:
    text = "**Найденные книги:**\n\n"
    for b in books:
        text += f"📖 **{b['title']}**\n👤 {b['author']}\n\n"
    return text

def format_full_book(book: dict) -> str:
    category_map = {
        "programming": "💻 Программирование",
        "fiction": "📖 Художественная литература",
        "history": "🏰 История",
        "scientific": "🔬 Научная литература",
    }
    language_map = {
        "ru": "Русский"
    }
    text = (
        f"📖 **{book['title']}**\n"
        f"👤 Автор: {book['author']}\n"
        f"🏷 Издательство: {book['publisher']}\n"
        f"📅 Год: {book['year']}\n"
        f"📚 Категория: {category_map[book['category']]}\n"
        f"🌐 Язык: {language_map[book['language']]}\n"
        f"📄 Страниц: {book['pages']}\n"
        f"📦 Доступно: {book['available_copies']} / {book['total_copies']}\n"
        f"💾 Электронная: {'Да' if book['is_electronic'] else 'Нет'}\n\n"
        f"{book['description']}\n\n"
    )

    if book.get("pdf_url"):
        text += f"📥 [Скачать PDF]({book['pdf_url']})"

    return text