import { API_ENDPOINTS, fetchWithAuth } from '../config/api';

class TimetableService {
  // ============= РАСПИСАНИЕ =============
  
  async getSchedules(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.group_name) queryParams.append('group_name', filters.group_name);
      if (filters.day_of_week) queryParams.append('day_of_week', filters.day_of_week);
      if (filters.teacher_id) queryParams.append('teacher_id', filters.teacher_id);
      if (filters.date_created_on) queryParams.append('date_created_on', filters.date_created_on);
      if (filters.skip) queryParams.append('skip', filters.skip);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const url = `${API_ENDPOINTS.timetable}/timetable/schedule${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error('Failed to fetch schedules');
      }

      return await response.json();
    } catch (error) {
      console.error('Get schedules error:', error);
      throw error;
    }
  }

  async getScheduleById(scheduleId) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.timetable}/timetable/schedule/${scheduleId}`);

      if (!response.ok) {
        throw new Error('Schedule not found');
      }

      return await response.json();
    } catch (error) {
      console.error('Get schedule error:', error);
      throw error;
    }
  }

  async createSchedule(scheduleData) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.timetable}/timetable/schedule`, {
        method: 'POST',
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create schedule');
      }

      return await response.json();
    } catch (error) {
      console.error('Create schedule error:', error);
      throw error;
    }
  }

  async updateSchedule(scheduleId, scheduleData) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.timetable}/timetable/schedule/${scheduleId}`, {
        method: 'PUT',
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update schedule');
      }

      return await response.json();
    } catch (error) {
      console.error('Update schedule error:', error);
      throw error;
    }
  }

  async deleteSchedule(scheduleId) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.timetable}/timetable/schedule/${scheduleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete schedule');
      }

      return await response.json();
    } catch (error) {
      console.error('Delete schedule error:', error);
      throw error;
    }
  }

  // ============= ШАБЛОНЫ =============

  async getTemplates(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active);
      if (filters.skip) queryParams.append('skip', filters.skip);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const url = `${API_ENDPOINTS.timetable}/timetable/templates${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      return await response.json();
    } catch (error) {
      console.error('Get templates error:', error);
      throw error;
    }
  }

  // ============= ИЗМЕНЕНИЯ =============

  async getChanges(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.schedule_id) queryParams.append('schedule_id', filters.schedule_id);
      if (filters.date_from) queryParams.append('date_from', filters.date_from);
      if (filters.skip) queryParams.append('skip', filters.skip);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const url = `${API_ENDPOINTS.timetable}/timetable/changes${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error('Failed to fetch changes');
      }

      return await response.json();
    } catch (error) {
      console.error('Get changes error:', error);
      throw error;
    }
  }

  // ============= ГРУППЫ =============

  async getGroups(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active);
      if (filters.skip) queryParams.append('skip', filters.skip);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const url = `${API_ENDPOINTS.timetable}/timetable/groups${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }

      const groups = await response.json();
      // Возвращаем только названия групп для совместимости
      return groups.map(group => group.name);
    } catch (error) {
      console.error('Get groups error:', error);
      throw error;
    }
  }

  // ============= ПРЕДМЕТЫ =============

  async getSubjects(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active);
      if (filters.skip) queryParams.append('skip', filters.skip);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const url = `${API_ENDPOINTS.timetable}/timetable/subjects${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error('Failed to fetch subjects');
      }

      return await response.json();
    } catch (error) {
      console.error('Get subjects error:', error);
      throw error;
    }
  }
}

export default new TimetableService();

