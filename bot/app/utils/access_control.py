from functools import wraps
import aiohttp

from app.services.user_check import get_user_by_max_id


def access_control(*allowed_roles):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            if args:
                if hasattr(args[0], 'sender'):  # Message
                    user_id = args[0].sender.user_id
                elif hasattr(args[0], 'user'):  # Callback
                    user_id = args[0].user.user_id
                else:
                    print("Cannot determine user from arguments")
                    return
            
            async with aiohttp.ClientSession() as session:
                user_info = await get_user_by_max_id(session, user_id)

            if not user_info:
                await args[0].send("🚫 Вы не авторизованы. Используйте /start для входа.")
                return

            user_role = user_info["type"]

            if allowed_roles and user_role not in allowed_roles:
                await args[0].send("⛔ У вас нет доступа к этой команде.")
                return

            return await func(user_info=user_info, *args, **kwargs)
        return wrapper
    return decorator
