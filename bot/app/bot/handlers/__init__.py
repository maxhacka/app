from .applicants import applicants_router
from .certificates import certificates_router
from .events import events_router
from .library import library_router
from .staff import staff_router
from .timetable import timetable_router

__all__ = [
    "applicants_router",
    "certificates_router",
    "events_router",
    "library_router",
    "staff_router",
    "timetable_router"
]