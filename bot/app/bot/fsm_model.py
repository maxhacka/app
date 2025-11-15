class AuthState:
    waiting_for_number = "waiting_for_number"
    waiting_for_phone = "waiting_for_phone"

class PickDateState:
    waiting_for_timetable_date = "waiting_for_timetable_date"
    waiting_for_events_date = "waiting_for_events_date"

class SearchBookState:
    waiting_for_query = "waiting_for_query"
    browsing_results = "browsing_results"

class CertificateOrderState:
    choosing_type = "choosing_type"
    entering_purpose = "entering_purpose"
    choosing_delivery = "choosing_delivery"
    entering_address = "entering_address"