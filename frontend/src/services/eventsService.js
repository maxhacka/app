import { API_ENDPOINTS, fetchWithAuth } from '../config/api';

class EventsService {
  // ============= СОБЫТИЯ =============
  
  async getEvents(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.date_from) queryParams.append('date_from', filters.date_from);
      if (filters.date_to) queryParams.append('date_to', filters.date_to);
      if (filters.skip) queryParams.append('skip', filters.skip);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const url = `${API_ENDPOINTS.events}/events/events${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      return await response.json();
    } catch (error) {
      console.error('Get events error:', error);
      throw error;
    }
  }

  async getEventById(eventId) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.events}/events/events/${eventId}`);

      if (!response.ok) {
        throw new Error('Event not found');
      }

      return await response.json();
    } catch (error) {
      console.error('Get event error:', error);
      throw error;
    }
  }

  async createEvent(eventData) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.events}/events/events`, {
        method: 'POST',
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create event');
      }

      return await response.json();
    } catch (error) {
      console.error('Create event error:', error);
      throw error;
    }
  }

  async updateEvent(eventId, eventData) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.events}/events/events/${eventId}`, {
        method: 'PUT',
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update event');
      }

      return await response.json();
    } catch (error) {
      console.error('Update event error:', error);
      throw error;
    }
  }

  async deleteEvent(eventId) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.events}/events/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      return await response.json();
    } catch (error) {
      console.error('Delete event error:', error);
      throw error;
    }
  }

  // ============= СТАТИСТИКА =============

  async getStatistics() {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.events}/events/statistics`);

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      return await response.json();
    } catch (error) {
      console.error('Get statistics error:', error);
      throw error;
    }
  }

  // ============= РЕГИСТРАЦИИ =============

  async getRegistrations(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.event_id) queryParams.append('event_id', filters.event_id);
      if (filters.user_id) queryParams.append('user_id', filters.user_id);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.skip) queryParams.append('skip', filters.skip);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const url = `${API_ENDPOINTS.events}/events/registrations${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error('Failed to fetch registrations');
      }

      return await response.json();
    } catch (error) {
      console.error('Get registrations error:', error);
      throw error;
    }
  }

  // ============= ОТЗЫВЫ =============

  async getFeedbacks(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.event_id) queryParams.append('event_id', filters.event_id);
      if (filters.user_id) queryParams.append('user_id', filters.user_id);
      if (filters.skip) queryParams.append('skip', filters.skip);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const url = `${API_ENDPOINTS.events}/events/feedbacks${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error('Failed to fetch feedbacks');
      }

      return await response.json();
    } catch (error) {
      console.error('Get feedbacks error:', error);
      throw error;
    }
  }
}

export default new EventsService();

