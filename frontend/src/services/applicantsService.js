import { API_ENDPOINTS, fetchWithAuth, getAuthToken } from '../config/api';

class ApplicantsService {
  // ============= АБИТУРИЕНТЫ =============
  
  async getApplicants(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.program) queryParams.append('program', filters.program);
      if (filters.source) queryParams.append('source', filters.source);
      if (filters.program_limit) queryParams.append('program_limit', filters.program_limit);
      if (filters.sort_by_exam_results) queryParams.append('sort_by_exam_results', filters.sort_by_exam_results);
      if (filters.skip) queryParams.append('skip', filters.skip);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const url = `${API_ENDPOINTS.applicants}/applicants/applicants${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error('Failed to fetch applicants');
      }

      return await response.json();
    } catch (error) {
      console.error('Get applicants error:', error);
      throw error;
    }
  }

  async getGroupedApplicants(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.program) queryParams.append('program', filters.program);
      if (filters.source) queryParams.append('source', filters.source);
      if (filters.skip) queryParams.append('skip', filters.skip);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const url = `${API_ENDPOINTS.applicants}/applicants/applicants-grouped${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error('Failed to fetch grouped applicants');
      }

      return await response.json();
    } catch (error) {
      console.error('Get grouped applicants error:', error);
      throw error;
    }
  }

  async updateApplicantPrograms(phone, programs) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.applicants}/applicants/applicants-programs`, {
        method: 'PUT',
        body: JSON.stringify({ phone, programs }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update applicant programs');
      }

      return await response.json();
    } catch (error) {
      console.error('Update applicant programs error:', error);
      throw error;
    }
  }

  async getApplicantById(applicantId) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.applicants}/applicants/applicants/${applicantId}`);

      if (!response.ok) {
        throw new Error('Applicant not found');
      }

      return await response.json();
    } catch (error) {
      console.error('Get applicant error:', error);
      throw error;
    }
  }

  async createApplicant(applicantData) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.applicants}/applicants/applicants`, {
        method: 'POST',
        body: JSON.stringify(applicantData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create applicant');
      }

      return await response.json();
    } catch (error) {
      console.error('Create applicant error:', error);
      throw error;
    }
  }

  async updateApplicant(applicantId, applicantData) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.applicants}/applicants/applicants/${applicantId}`, {
        method: 'PUT',
        body: JSON.stringify(applicantData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update applicant');
      }

      return await response.json();
    } catch (error) {
      console.error('Update applicant error:', error);
      throw error;
    }
  }

  async deleteApplicant(applicantId) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.applicants}/applicants/applicants/${applicantId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete applicant');
      }

      return await response.json();
    } catch (error) {
      console.error('Delete applicant error:', error);
      throw error;
    }
  }

  // ============= ДОКУМЕНТЫ =============

  async getDocuments(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.applicant_id) queryParams.append('applicant_id', filters.applicant_id);
      if (filters.skip) queryParams.append('skip', filters.skip);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const url = `${API_ENDPOINTS.applicants}/applicants/documents${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      return await response.json();
    } catch (error) {
      console.error('Get documents error:', error);
      throw error;
    }
  }

  async uploadDocument(file, applicantId, documentType, documentName) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('applicant_id', applicantId);
      formData.append('document_type', documentType);
      formData.append('document_name', documentName);

      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_ENDPOINTS.applicants}/applicants/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        // Если 401, обрабатываем как в fetchWithAuth
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          throw new Error('Unauthorized');
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload document');
      }

      return await response.json();
    } catch (error) {
      console.error('Upload document error:', error);
      throw error;
    }
  }

  async createDocument(documentData) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.applicants}/applicants/documents`, {
        method: 'POST',
        body: JSON.stringify(documentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create document');
      }

      return await response.json();
    } catch (error) {
      console.error('Create document error:', error);
      throw error;
    }
  }

  async updateDocument(documentId, documentData) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.applicants}/applicants/documents/${documentId}`, {
        method: 'PUT',
        body: JSON.stringify(documentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update document');
      }

      return await response.json();
    } catch (error) {
      console.error('Update document error:', error);
      throw error;
    }
  }

  async deleteDocument(documentId) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.applicants}/applicants/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      return await response.json();
    } catch (error) {
      console.error('Delete document error:', error);
      throw error;
    }
  }

  // ============= ЭКЗАМЕНЫ =============

  async getExams(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.applicant_id) queryParams.append('applicant_id', filters.applicant_id);
      if (filters.skip) queryParams.append('skip', filters.skip);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const url = `${API_ENDPOINTS.applicants}/applicants/exams${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error('Failed to fetch exams');
      }

      return await response.json();
    } catch (error) {
      console.error('Get exams error:', error);
      throw error;
    }
  }

  async createExam(examData) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.applicants}/applicants/exams`, {
        method: 'POST',
        body: JSON.stringify(examData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create exam');
      }

      return await response.json();
    } catch (error) {
      console.error('Create exam error:', error);
      throw error;
    }
  }

  async updateExam(examId, examData) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.applicants}/applicants/exams/${examId}`, {
        method: 'PUT',
        body: JSON.stringify(examData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update exam');
      }

      return await response.json();
    } catch (error) {
      console.error('Update exam error:', error);
      throw error;
    }
  }

  async deleteExam(examId) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.applicants}/applicants/exams/${examId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete exam');
      }

      return await response.json();
    } catch (error) {
      console.error('Delete exam error:', error);
      throw error;
    }
  }

  // ============= СТАТИСТИКА =============

  async getStatistics() {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.applicants}/applicants/statistics`);

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      return await response.json();
    } catch (error) {
      console.error('Get statistics error:', error);
      throw error;
    }
  }

  // ============= ПРОГРАММЫ =============

  async getPrograms(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active);
      if (filters.skip) queryParams.append('skip', filters.skip);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const url = `${API_ENDPOINTS.applicants}/applicants/programs${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error('Failed to fetch programs');
      }

      return await response.json();
    } catch (error) {
      console.error('Get programs error:', error);
      throw error;
    }
  }

  async createProgram(programData) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.applicants}/applicants/programs`, {
        method: 'POST',
        body: JSON.stringify(programData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create program');
      }

      return await response.json();
    } catch (error) {
      console.error('Create program error:', error);
      throw error;
    }
  }

  async updateProgram(programId, programData) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.applicants}/applicants/programs/${programId}`, {
        method: 'PUT',
        body: JSON.stringify(programData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update program');
      }

      return await response.json();
    } catch (error) {
      console.error('Update program error:', error);
      throw error;
    }
  }

  async deleteProgram(programId) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.applicants}/applicants/programs/${programId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete program');
      }

      return await response.json();
    } catch (error) {
      console.error('Delete program error:', error);
      throw error;
    }
  }

  // ============= РАСЧЕТ ЗАЧИСЛЕНИЯ =============

  async startEnrollmentCalculation() {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.applicants}/applicants/enrollment/calculate`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to start enrollment calculation');
      }

      return await response.json();
    } catch (error) {
      console.error('Start enrollment calculation error:', error);
      throw error;
    }
  }

  async getEnrollmentStatus(taskId) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.applicants}/applicants/enrollment/status/${taskId}`);

      if (!response.ok) {
        throw new Error('Failed to get enrollment status');
      }

      return await response.json();
    } catch (error) {
      console.error('Get enrollment status error:', error);
      throw error;
    }
  }

  async downloadEnrollmentFile(filename) {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_ENDPOINTS.applicants}/applicants/enrollment/download/${filename}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download enrollment file error:', error);
      throw error;
    }
  }
}

export default new ApplicantsService();

