from inspect import signature
from typing import Callable, Literal

import aiohttp

from aiomax.types import Attachment

from . import buttons, exceptions


def get_message_body(
    text: "str | None" = None,
    format: "Literal['markdown', 'html'] | None" = None,
    reply_to: "int | None" = None,
    notify: bool = True,
    keyboard: """list[list[buttons.Button]] \
        | buttons.KeyboardBuilder \
        | None""" = None,
    attachments: "list[Attachment] | Attachment | None" = None,
) -> dict:
    """
    Returns the body of the message as json.
    """
    body = {"text": text, "format": format, "notify": notify}

    # replying
    if reply_to:
        body["link"] = {"type": "reply", "mid": reply_to}

    # keyboard
    if keyboard:
        if isinstance(keyboard, buttons.KeyboardBuilder):
            keyboard = keyboard.to_list()

        body["attachments"] = [
            {
                "type": "inline_keyboard",
                "payload": {
                    "buttons": [
                        [
                            i.to_json() if isinstance(i, buttons.Button) else i
                            for i in row
                        ]
                        for row in keyboard
                    ]
                },
            }
        ]

    if attachments:
        if "attachments" not in body:
            body["attachments"] = []

        if not isinstance(attachments, list):
            attachments = [attachments]

        for at in attachments or []:
            if not hasattr(at, "as_dict"):
                raise exceptions.AiomaxException(
                    "This attachmentcannot be sent"
                )
            body["attachments"].append(at.as_dict())

    if attachments == [] and "attachments" not in body:
        body["attachments"] = []

    return body


def context_kwargs(func: Callable, **kwargs):
    """
    Returns only those kwargs, that callable accepts
    """
    params = list(signature(func).parameters.keys())

    kwargs = {kw: arg for kw, arg in kwargs.items() if kw in params}

    return kwargs


async def get_exception(response: aiohttp.ClientResponse):
    if response.status in range(200, 300):
        return None

    # HTTP status code based exceptions
    if response.status == 429:
        retry_after = response.headers.get("Retry-After")
        return exceptions.RateLimitException(
            int(retry_after) if retry_after else None
        )

    if response.status == 401:
        return exceptions.InvalidToken()

    if response.status == 403:
        return exceptions.AccessDeniedException("Access denied")

    if response.status == 404:
        return exceptions.NotFoundException("Resource not found")

    if response.content_type == "text/plain":
        text = await response.text()
        description = None

    elif response.content_type == "application/json":
        resp_json = await response.json()
        text = resp_json.get("code", "")
        description = resp_json.get("message", "")

    else:
        return exceptions.NetworkError(f"Unknown error: {await response.read()}")

    # Error code based exceptions
    if text.startswith("Invalid access_token") or text == "verify.token":
        return exceptions.InvalidToken()

    if (
        text == "attachment.not.ready"
        or description == "Key: errors.process.attachment.video.not.processed"
    ):
        return exceptions.AttachmentNotReady()

    if text == "chat.not.found":
        return exceptions.ChatNotFound(description)

    if (
        description == "text: size must be between 0 and 4000"
        or "text" in description
        and "4000" in description
    ):
        return exceptions.IncorrectTextLength()

    if text == "internal.error":
        if description:
            return exceptions.InternalError(description.split()[-1])
        return exceptions.InternalError()

    if text == "access.denied":
        # Check if it's admin required
        if "admin" in description.lower():
            return exceptions.ChatAdminRequiredException()
        return exceptions.AccessDeniedException(description)

    if text == "not.found":
        return exceptions.NotFoundException(description)

    # Check for bot blocked by user
    if "bot" in text.lower() and "block" in text.lower():
        return exceptions.BotBlockedByUser()

    if response.status == 400:
        return exceptions.InvalidRequestException(description or text)

    return exceptions.UnknownErrorException(text, description)
