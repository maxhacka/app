import aiohttp
import asyncio
import time
from app.config import settings
from app.utils.url_helper import get_service_url

AUTH_USERNAME = settings.AUTH_USERNAME
AUTH_PASSWORD = settings.AUTH_PASSWORD

class AuthService:
    def __init__(self):
        self.token = None
        self.token_expiry = 0

    async def get_token(self):
        if not self.token or time.time() >= self.token_expiry:
            await self.refresh_token()
        return self.token

    async def refresh_token(self):
        async with aiohttp.ClientSession() as session:
            auth_url = get_service_url(8001)
            async with session.post(
                f"{auth_url}/api/auth/login",
                json={"username": AUTH_USERNAME, "password": AUTH_PASSWORD},
            ) as resp:
                if resp.status != 200:
                    raise Exception(f"Ошибка авторизации: {resp.status}")
                data = await resp.json()
                self.token = data["access_token"]
                expires_in = data.get("expires_in", 86400)
                self.token_expiry = time.time() + expires_in - 60
                print("[AuthService] Токен обновлён ✅")

auth_service = AuthService()