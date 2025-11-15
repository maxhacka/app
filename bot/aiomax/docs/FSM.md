Фреймворк aiomax имеет встроенные конечные автоматы.

Конечные автоматы помогают создавать формы (опросы) и передавать данные пользователей между функциями

Пример бота, использующего FSM, можете посмотреть на странице [Примеры](Примеры)

FSM имеет 2 понятия:

- `State` - состояние пользователя. Например, что должно содержать сообщение, которое от него ожидается

- `Data` - данные пользователя, передающиеся между функциями

Для работы с FSM используются классы: `State`, `StatesGroup`, `FSMStorage` и `FSMCursor`

## ✨ НОВОЕ: Декларативные состояния (как в aiogram)

### `State()`

Класс для представления одного состояния в FSM.

```python
from aiomax.fsm import State

# Создание отдельного состояния
waiting_for_name = State()
```

### `StatesGroup`

Базовый класс для создания группы состояний (как в aiogram).

```python
from aiomax.fsm import StatesGroup, State

class RegistrationStates(StatesGroup):
    name = State()
    age = State()
    city = State()

# Использование
cursor.set_state(RegistrationStates.name)
```

**Преимущества:**
- Лучшая организация кода
- Автозаполнение в IDE
- Четкая структура состояний
- Меньше ошибок с опечатками

## `FSMStorage()`

Хранилище данных. Создается своё для каждого бота

### `FSMStorage.get_state(user_id) -> Any`

Возвращает текущее состояние пользователя. `None`, если пользователя нет в хранилище

### `FSMStorage.get_data(user_id) -> Any`

Возвращает текущие данные пользователя. `None`, если пользователя нет в хранилище

### `FSMStorage.change_state(user_id, new)`

Изменяет состояние пользователя

### `FSMStorage.change_data(user_id, new)`

Изменяет данные пользователя

### `FSMStorage.clear_state(user_id) -> Any`

Очищает состояние пользователя и возвращает старое значение

### `FSMStorage.clear_data(user_id) -> Any`

Очищает данные пользователя и возвращает старое значение

### `FSMStorage.clear(user_id) -> None`

Очищает состояние и данные пользователя

## `FSMCursor(user_id)`

Имеет все те же функции, что и `FSMStorage`, но не имеет параметра `user_id` в них. Оперирует только над одним пользователем

Передается во всех [декораторах](Декораторы), кроме `on_button_chat_create()`, как именованный аргумент `cursor` с идентификатором пользователя, совершившего действие

### ✨ Новые методы FSMCursor

#### `FSMCursor.set_state(state: State | str | None)`

Устанавливает состояние пользователя. Работает с объектами `State` и строками.

```python
cursor.set_state(RegistrationStates.name)
# или
cursor.set_state("waiting_for_name")
```

#### `FSMCursor.update_data(**kwargs)`

Обновляет данные пользователя (добавляет к существующим).

```python
cursor.update_data(name="Иван", age=25)
# Эквивалентно старому способу:
# data = cursor.get_data() or {}
# data.update({"name": "Иван", "age": 25})
# cursor.set_data(data)
```

#### `FSMCursor.get_value(key: str, default=None) -> Any`

Получает конкретное значение из данных пользователя.

```python
name = cursor.get_value("name", default="Неизвестно")
```

#### `FSMCursor.set_value(key: str, value: Any)`

Устанавливает конкретное значение в данных пользователя.

```python
cursor.set_value("city", "Москва")
```

#### `FSMCursor.finish()`

Завершает FSM - очищает состояние и данные пользователя.

```python
await cursor.finish()
```

### Совместимость со старыми методами

Старые методы остались работать:
- `change_state()` - теперь алиас для `set_state()`
- `change_data()` - теперь алиас для `set_data()`

## Пример с новым синтаксисом

```python
from aiomax import Bot
from aiomax.fsm import StatesGroup, State
from aiomax import filters

bot = Bot(access_token="TOKEN")

class UserRegistration(StatesGroup):
    name = State()
    age = State()
    city = State()

@bot.on_command("register")
async def start_registration(ctx, cursor):
    await ctx.send("Как вас зовут?")
    cursor.set_state(UserRegistration.name)

@bot.on_message(filters.state(UserRegistration.name))
async def process_name(message, cursor):
    cursor.update_data(name=message.body.text)
    await message.reply("Сколько вам лет?")
    cursor.set_state(UserRegistration.age)

@bot.on_message(filters.state(UserRegistration.age))
async def process_age(message, cursor):
    if not message.body.text.isdigit():
        await message.reply("Пожалуйста, введите число!")
        return
    
    cursor.update_data(age=int(message.body.text))
    await message.reply("В каком городе вы живёте?")
    cursor.set_state(UserRegistration.city)

@bot.on_message(filters.state(UserRegistration.city))
async def process_city(message, cursor):
    cursor.update_data(city=message.body.text)
    
    data = cursor.get_data()
    
    await message.reply(
        f"Регистрация завершена!\n"
        f"Имя: {data['name']}\n"
        f"Возраст: {data['age']}\n"
        f"Город: {data['city']}"
    )
    
    await cursor.finish()

bot.run()
```
