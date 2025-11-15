from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

class Settings(BaseSettings):
    BOT_TOKEN: str

    BASE_URL: str
    AUTH_USERNAME: str
    AUTH_PASSWORD: str
    
    @field_validator('BASE_URL')
    @classmethod
    def normalize_base_url(cls, v: str) -> str:
        """Добавляет протокол http:// если его нет"""
        v = v.strip()
        # Добавляем протокол если его нет
        if not v.startswith(('http://', 'https://')):
            return f'http://{v}'
        return v
    
    model_config = SettingsConfigDict(
        env_file='.env',
        case_sensitive=False,
        extra='ignore',
    )

settings = Settings()