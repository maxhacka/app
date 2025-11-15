"""
Модуль для отслеживания статуса расчета зачисления.
"""
from enum import Enum
from typing import Optional, Dict
from datetime import datetime
import threading


class EnrollmentStatus(str, Enum):
    """Статусы расчета зачисления"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    ERROR = "error"


class EnrollmentStatusManager:
    """Менеджер для отслеживания статуса расчета зачисления"""
    
    def __init__(self):
        self._status: Dict[str, Dict] = {}
        self._lock = threading.Lock()
    
    def create_task(self, task_id: str) -> None:
        """Создать новую задачу"""
        with self._lock:
            self._status[task_id] = {
                "status": EnrollmentStatus.PENDING,
                "progress": 0,
                "message": "Ожидание начала расчета...",
                "file_path": None,
                "error": None,
                "created_at": datetime.now().isoformat(),
                "completed_at": None
            }
    
    def update_status(
        self,
        task_id: str,
        status: EnrollmentStatus,
        progress: Optional[int] = None,
        message: Optional[str] = None,
        file_path: Optional[str] = None,
        error: Optional[str] = None
    ) -> None:
        """Обновить статус задачи"""
        with self._lock:
            if task_id not in self._status:
                return
            
            if status:
                self._status[task_id]["status"] = status
            
            if progress is not None:
                self._status[task_id]["progress"] = progress
            
            if message is not None:
                self._status[task_id]["message"] = message
            
            if file_path is not None:
                self._status[task_id]["file_path"] = file_path
            
            if error is not None:
                self._status[task_id]["error"] = error
            
            if status == EnrollmentStatus.COMPLETED:
                self._status[task_id]["completed_at"] = datetime.now().isoformat()
    
    def get_status(self, task_id: str) -> Optional[Dict]:
        """Получить статус задачи"""
        with self._lock:
            return self._status.get(task_id)
    
    def delete_task(self, task_id: str) -> None:
        """Удалить задачу"""
        with self._lock:
            if task_id in self._status:
                del self._status[task_id]

status_manager = EnrollmentStatusManager()

