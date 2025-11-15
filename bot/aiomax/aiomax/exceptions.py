class AiomaxException(Exception):
    """
    Default class for aiomax Exceptions
    """


class InvalidToken(AiomaxException):
    """
    Invalid token Exception
    """


class AttachmentNotReady(AiomaxException):
    """
    Attachment not ready Exception
    """


class ChatNotFound(AiomaxException):
    """
    Chat not found Exception
    """


class IncorrectTextLength(AiomaxException):
    """
    Incorrect text length Exception
    """


class InternalError(AiomaxException):
    """
    Internal error Exception
    """

    def __init__(self, id: "str | None" = None):
        self.id: str = id


class UnknownErrorException(AiomaxException):
    """
    Unknown error Exception
    """

    def __init__(self, text: str, description: "str | None" = None):
        self.text: str = text
        self.description: "str | None" = description


class AccessDeniedException(AiomaxException):
    """
    Access Denied Exception
    """

    def __init__(self, description: "str | None" = None):
        self.description: "str | None" = description


class NotFoundException(AiomaxException):
    """
    Something not found Exception
    """

    def __init__(self, description: "str | None" = None):
        self.description: "str | None" = description


class MessageNotFoundException(NotFoundException):
    """
    Child `NotFoundException` exception class that is raised
    in `Bot.get_message` function
    """


class FilenameNotProvided(AiomaxException):
    """
    Filename not provided exception
    """


class BotBlockedByUser(AiomaxException):
    """
    User blocked the bot
    """

    def __init__(self, user_id: "int | None" = None):
        self.user_id = user_id
        super().__init__(f"Bot was blocked by user {user_id}")


class RateLimitException(AiomaxException):
    """
    Rate limit exceeded exception
    """

    def __init__(self, retry_after: "int | None" = None):
        self.retry_after = retry_after
        super().__init__(
            f"Rate limit exceeded. Retry after {retry_after} seconds"
            if retry_after
            else "Rate limit exceeded"
        )


class InvalidRequestException(AiomaxException):
    """
    Invalid request exception
    """

    def __init__(self, message: str):
        self.message = message
        super().__init__(f"Invalid request: {message}")


class NetworkError(AiomaxException):
    """
    Network error exception
    """

    def __init__(self, message: str):
        self.message = message
        super().__init__(f"Network error: {message}")


class MessageTooLongException(AiomaxException):
    """
    Message text is too long (exceeds 4000 characters)
    """

    def __init__(self, length: int):
        self.length = length
        super().__init__(
            f"Message is too long ({length} characters). Maximum is 4000"
        )


class ChatAdminRequiredException(AccessDeniedException):
    """
    Bot needs admin rights to perform this action
    """

    def __init__(self, action: "str | None" = None):
        self.action = action
        super().__init__(
            f"Bot needs admin rights to perform action: {action}"
            if action
            else "Bot needs admin rights"
        )
