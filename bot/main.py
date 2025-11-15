import asyncio

from app.bot.bot import bot
from app.services.auth_service import auth_service

async def refresh_token_periodically():
    while True:
        try:
            await auth_service.refresh_token()
        except Exception as e:
            print("Ошибка при обновлении токена:", e)
        await asyncio.sleep(24 * 3600)

async def main():
    asyncio.create_task(refresh_token_periodically())

    await bot.start_polling()

if __name__ == "__main__":
    asyncio.run(main())