"""
Утилита для преобразования BASE_URL в правильные имена сервисов Docker
"""
from app.config import settings

# Маппинг портов к именам сервисов в docker-compose
PORT_TO_SERVICE = {
    8001: "auth",
    8002: "staff",
    8003: "timetable",
    8004: "applicants",
    8005: "events",
    8006: "library",
    8007: "certificates",
}

def get_service_url(port: int) -> str:
    """
    Возвращает правильный URL для сервиса в Docker окружении
    
    Args:
        port: Порт сервиса
        
    Returns:
        URL вида http://service_name:port
    """
    base_url = settings.BASE_URL
    
    # Извлекаем протокол и хост из BASE_URL
    if base_url.startswith('http://'):
        protocol = 'http://'
        host = base_url[7:]
    elif base_url.startswith('https://'):
        protocol = 'https://'
        host = base_url[8:]
    else:
        protocol = 'http://'
        host = base_url
    
    # Определяем имя сервиса по порту
    # Всегда используем маппинг портов для правильной работы в Docker окружении
    # Если порт есть в маппинге, используем имя сервиса из маппинга
    # Иначе используем исходный хост (для случаев, когда порт не в маппинге)
    if port in PORT_TO_SERVICE:
        service_name = PORT_TO_SERVICE[port]
    else:
        # Если порт не в маппинге, используем исходный хост
        # Но если хост localhost/127.0.0.1, заменяем на 'auth' по умолчанию
        host_lower = host.lower()
        if 'localhost' in host_lower or '127.0.0.1' in host:
            service_name = 'auth'
        else:
            service_name = host.split(':')[0] if ':' in host else host
    
    return f"{protocol}{service_name}:{port}"

