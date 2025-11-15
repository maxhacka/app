import aiohttp
import aiomax

from aiomax import Router, filters
from aiomax.buttons import CallbackButton, KeyboardBuilder
from aiomax.fsm import FSMCursor

from app.bot.fsm_model import SearchBookState
from app.bot.keyboards import books_kb, go_to_menu_kb
from app.services.books_service import format_book_list, format_full_book, get_book_by_id, search_books
from app.utils.access_control import access_control


PAGE_SIZE = 5
library_router = Router()



@library_router.on_button_callback("library")
@access_control("student", "teacher")
async def library_handler(cb: aiomax.Callback, cursor: FSMCursor, user_info):
    cursor.clear_state()
    await cb.message.edit("📚 **Библиотека**\n\nВведите название книги или автора:\n Например: \"Чистый код. Создание, анализ и рефакторинг\" или \"Джордж Оруэлл\"", format="markdown", keyboard=go_to_menu_kb())
    cursor.change_state(SearchBookState.waiting_for_query)

@library_router.on_message(filters.state(SearchBookState.waiting_for_query))
@access_control("student", "teacher")
async def library_search_handler(message: aiomax.Message, cursor: FSMCursor, user_info):
    query = message.body.text.strip()

    if len(query) < 2:
        await message.send("❗ Запрос должен содержать минимум 2 символа.")
        return

    await message.send("🔄 Ищу книги...")

    async with aiohttp.ClientSession() as session:
        books = await search_books(session, query)

    if not books:
        await message.send("❗ Ничего не найдено. Попробуйте другой запрос.")
        return

    if len(books) == 1:
        book = books[0]

        text = format_full_book(book)
        kb = KeyboardBuilder().add(CallbackButton("⬅️ Назад", "library"))

        await message.send(text, format="markdown", keyboard=kb)
        cursor.clear_state()
        return

    cursor.change_data({"books": books, "page": 0})
    cursor.change_state(SearchBookState.browsing_results)

    await show_books_page(message, books, 0)


    # text = format_book_list(books)
    # kb = books_kb(books)

    # await message.send(text, format="markdown", keyboard=kb)
    # cursor.clear_state()

@library_router.on_button_callback(lambda data: data.payload.startswith("book:"))
@access_control("student", "teacher")
async def library_show_book_handler(cb: aiomax.Callback, user_info):
    book_id = int(cb.payload.split(":")[1])

    await cb.message.edit("🔄 Загружаю книгу...")

    async with aiohttp.ClientSession() as session:
        book = await get_book_by_id(session, book_id)

    if not book:
        kb = KeyboardBuilder().add(CallbackButton("⬅️ Назад", "library"))
        await cb.message.edit("❗ Не удалось получить данные о книге.", keyboard=kb)

    text = format_full_book(book)
    kb = KeyboardBuilder().add(CallbackButton("⬅️ Назад", "library"))

    await cb.message.edit(text, format="markdown", keyboard=kb)



async def show_books_page(message: aiomax.Message, books: list, page: int):
    start = page * PAGE_SIZE
    end = start + PAGE_SIZE
    slice_books = books[start:end]

    text = "**Найденные книги:**\n\n"
    for b in slice_books:
        text += f"📖 **{b['title']}**\n👤 {b['author']}\n\n"

    kb = KeyboardBuilder()

    # кнопки книг
    for b in slice_books:
        kb.row(CallbackButton(f"{b['title']}", f"book:{b['id']}"))

    # пагинация
    if page > 0:
        kb.row(CallbackButton("◀️ Назад", "lib:prev"))

    if end < len(books):
        kb.row(CallbackButton("▶️ Далее", "lib:next"))

    kb.row(CallbackButton("❌ Новый поиск", "library"))

    await message.send(text, format="markdown", keyboard=kb)

@library_router.on_button_callback("lib:next")
@access_control("student", "teacher")
async def library_page_next_handler(cb: aiomax.Callback, cursor: FSMCursor, user_info):
    data = cursor.get_data()
    books = data["books"]
    page = data["page"] + 1

    data = cursor.get_data()
    data["page"] = page
    cursor.change_data(data)

    await show_books_page(cb.message, books, page)

@library_router.on_button_callback("lib:prev")
@access_control("student", "teacher")
async def library_page_prev_handler(cb: aiomax.Callback, cursor: FSMCursor, user_info):
    data = cursor.get_data()
    books = data["books"]
    page = data["page"] - 1

    data = cursor.get_data()
    data["page"] = page
    cursor.change_data(data)

    await show_books_page(cb.message, books, page)