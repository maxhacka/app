FROM python:3.11-slim

WORKDIR /app

COPY aiomax ./aiomax

# Установка зависимостей
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Запуск приложения с задержкой в 10 секунд для инициализации других сервисов
CMD ["sh", "-c", "sleep 10 && python main.py"]

