import { API_ENDPOINTS, fetchWithAuth } from '../config/api';

class StaffService {
  // ============= СТУДЕНТЫ =============
  
  async getStudents(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.group_name) queryParams.append('group_name', filters.group_name);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.faculty) queryParams.append('faculty', filters.faculty);
      if (filters.course) queryParams.append('course', filters.course);
      if (filters.student_number) queryParams.append('student_number', filters.student_number);
      if (filters.skip) queryParams.append('skip', filters.skip);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const url = `${API_ENDPOINTS.staff}/staff/students${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      return await response.json();
    } catch (error) {
      console.error('Get students error:', error);
      throw error;
    }
  }

  async getStudentById(studentId) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.staff}/staff/students/${studentId}`);

      if (!response.ok) {
        throw new Error('Student not found');
      }

      return await response.json();
    } catch (error) {
      console.error('Get student error:', error);
      throw error;
    }
  }

  async createStudent(studentData) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.staff}/staff/students`, {
        method: 'POST',
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create student');
      }

      return await response.json();
    } catch (error) {
      console.error('Create student error:', error);
      throw error;
    }
  }

  async updateStudent(studentId, studentData) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.staff}/staff/students/${studentId}`, {
        method: 'PUT',
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update student');
      }

      return await response.json();
    } catch (error) {
      console.error('Update student error:', error);
      throw error;
    }
  }

  async deleteStudent(studentId) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.staff}/staff/students/${studentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete student');
      }

      return await response.json();
    } catch (error) {
      console.error('Delete student error:', error);
      throw error;
    }
  }

  // ============= ПРЕПОДАВАТЕЛИ =============

  async getTeachers(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.department) queryParams.append('department', filters.department);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.teacher_number) queryParams.append('teacher_number', filters.teacher_number);
      if (filters.skip) queryParams.append('skip', filters.skip);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const url = `${API_ENDPOINTS.staff}/staff/teachers${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error('Failed to fetch teachers');
      }

      return await response.json();
    } catch (error) {
      console.error('Get teachers error:', error);
      throw error;
    }
  }

  async getTeacherById(teacherId) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.staff}/staff/teachers/${teacherId}`);

      if (!response.ok) {
        throw new Error('Teacher not found');
      }

      return await response.json();
    } catch (error) {
      console.error('Get teacher error:', error);
      throw error;
    }
  }

  async createTeacher(teacherData) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.staff}/staff/teachers`, {
        method: 'POST',
        body: JSON.stringify(teacherData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create teacher');
      }

      return await response.json();
    } catch (error) {
      console.error('Create teacher error:', error);
      throw error;
    }
  }

  async updateTeacher(teacherId, teacherData) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.staff}/staff/teachers/${teacherId}`, {
        method: 'PUT',
        body: JSON.stringify(teacherData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update teacher');
      }

      return await response.json();
    } catch (error) {
      console.error('Update teacher error:', error);
      throw error;
    }
  }

  async deleteTeacher(teacherId) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.staff}/staff/teachers/${teacherId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete teacher');
      }

      return await response.json();
    } catch (error) {
      console.error('Delete teacher error:', error);
      throw error;
    }
  }

  // ============= СТАТИСТИКА =============

  async getStatistics() {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.staff}/staff/statistics`);

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      return await response.json();
    } catch (error) {
      console.error('Get statistics error:', error);
      throw error;
    }
  }

  // ============= ГРУППЫ =============

  async getGroups() {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.staff}/staff/groups`);

      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }

      const data = await response.json();
      return data.groups || [];
    } catch (error) {
      console.error('Get groups error:', error);
      throw error;
    }
  }

  // ============= КАФЕДРЫ =============

  async getDepartments() {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.staff}/staff/departments`);

      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }

      const data = await response.json();
      return data.departments || [];
    } catch (error) {
      console.error('Get departments error:', error);
      throw error;
    }
  }
}

export default new StaffService();

