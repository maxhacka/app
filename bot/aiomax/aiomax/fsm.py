import logging
from typing import Any, Optional


class State:
    """
    Represents a single state in FSM (like in aiogram)
    """

    def __init__(self, state: str = None, group: str = None):
        self._state = state
        self._group = group

    def __str__(self):
        if self._group:
            return f"{self._group}:{self._state}"
        return self._state or ""

    def __repr__(self):
        return f"State({self})"

    def __eq__(self, other):
        if isinstance(other, State):
            return str(self) == str(other)
        if isinstance(other, str):
            return str(self) == other
        return False

    def __hash__(self):
        return hash(str(self))


class StatesGroupMeta(type):
    """
    Metaclass for StatesGroup
    """

    def __new__(mcs, name, bases, attrs):
        states = {}
        group_name = attrs.get("__group_name__", name)

        for key, value in list(attrs.items()):
            if isinstance(value, State):
                value._state = key
                value._group = group_name
                states[key] = value

        attrs["__states__"] = states
        return super().__new__(mcs, name, bases, attrs)


class StatesGroup(metaclass=StatesGroupMeta):
    """
    Base class for group of states (like in aiogram)

    Example:
        class UserStates(StatesGroup):
            name = State()
            age = State()
            city = State()
    """

    __group_name__ = None
    __states__ = {}


class FSMStorage:
    def __init__(self):
        self.states: dict[int, Any] = {}
        self.data: dict[int, dict] = {}

    def get_state(self, user_id: int) -> Optional[State]:
        """
        Gets user's state
        """
        state = self.states.get(user_id)
        if state and not isinstance(state, State):
            # Convert string to State for backward compatibility
            return State(str(state))
        return state

    def get_data(self, user_id: int) -> dict:
        """
        Gets user's data
        """
        return self.data.get(user_id, {})

    def change_state(self, user_id: int, new: "State | str | None"):
        """
        Changes user's state
        """
        if isinstance(new, str):
            new = State(new)
        self.states[user_id] = new

    def change_data(self, user_id: int, new: dict):
        """
        Changes user's data
        """
        self.data[user_id] = new

    def update_data(self, user_id: int, **kwargs):
        """
        Updates user's data (merges with existing)
        """
        if user_id not in self.data:
            self.data[user_id] = {}
        self.data[user_id].update(kwargs)

    def get_value(self, user_id: int, key: str, default=None):
        """
        Gets a specific value from user's data
        """
        return self.data.get(user_id, {}).get(key, default)

    def set_value(self, user_id: int, key: str, value: Any):
        """
        Sets a specific value in user's data
        """
        if user_id not in self.data:
            self.data[user_id] = {}
        self.data[user_id][key] = value

    def clear_state(self, user_id: int) -> Optional[State]:
        """
        Clears user's state and returns it
        """
        return self.states.pop(user_id, None)

    def clear_data(self, user_id: int) -> dict:
        """
        Clears user's data and returns it
        """
        return self.data.pop(user_id, {})

    def clear(self, user_id: int):
        """
        Clears user's state and data
        """
        self.states.pop(user_id, None)
        self.data.pop(user_id, None)


class FSMCursor:
    def __init__(self, storage: FSMStorage, user_id: int):
        self.storage: FSMStorage = storage
        self.user_id: int = user_id

        # Добавляем логирование FSM событий
        self._logger = logging.getLogger("aiomax.fsm")

    def get_state(self) -> Optional[State]:
        """
        Gets user's state
        """
        return self.storage.get_state(self.user_id)

    def get_data(self) -> dict:
        """
        Gets user's data
        """
        return self.storage.get_data(self.user_id)

    def set_state(self, new: "State | str | None"):
        """
        Sets user's state
        """
        old_state = self.storage.get_state(self.user_id)
        self.storage.change_state(self.user_id, new)

        if old_state != new:
            self._logger.info(f"🔄 {self.user_id} - fsm_state_change")

    def change_state(self, new: "State | str | None"):
        """
        Changes user's state (alias for set_state)
        """
        self.storage.change_state(self.user_id, new)

    def set_data(self, new: dict):
        """
        Sets user's data
        """
        self.storage.change_data(self.user_id, new)

    def change_data(self, new: dict):
        """
        Changes user's data (alias for set_data)
        """
        self.storage.change_data(self.user_id, new)

    def update_data(self, **kwargs):
        """
        Updates user's data (merges with existing)
        """
        self.storage.update_data(self.user_id, **kwargs)

        self._logger.debug(f" {self.user_id} - fsm_data_update")

    def get_value(self, key: str, default=None):
        """
        Gets a specific value from user's data
        """
        return self.storage.get_value(self.user_id, key, default)

    def set_value(self, key: str, value: Any):
        """
        Sets a specific value in user's data
        """
        self.storage.set_value(self.user_id, key, value)

    def clear_state(self) -> Optional[State]:
        """
        Deletes user's state and returns it
        """
        old_state = self.storage.get_state(self.user_id)
        result = self.storage.clear_state(self.user_id)

        if result:
            self._logger.info(f"🗑️ {self.user_id} - fsm_state_clear")

        return result

    def clear_data(self) -> dict:
        """
        Deletes user's data and returns it
        """
        return self.storage.clear_data(self.user_id)

    def clear(self):
        """
        Clears user's state and data
        """
        self._logger.info(f"🧹 {self.user_id} - fsm_clear")
        self.storage.clear(self.user_id)

    async def finish(self):
        """
        Finishes FSM (clears state and data)
        """
        self._logger.info(f"🏁 {self.user_id} - fsm_finish")
        self.clear()
