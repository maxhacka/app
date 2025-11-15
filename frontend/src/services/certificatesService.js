import { API_ENDPOINTS, fetchWithAuth } from '../config/api';

class CertificatesService {
  // ============= СПРАВКИ =============
  
  async getCertificates(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.user_id) queryParams.append('user_id', filters.user_id);
      if (filters.certificate_type) queryParams.append('certificate_type', filters.certificate_type);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.skip) queryParams.append('skip', filters.skip);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const url = `${API_ENDPOINTS.certificates}/certificates${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error('Failed to fetch certificates');
      }

      return await response.json();
    } catch (error) {
      console.error('Get certificates error:', error);
      throw error;
    }
  }

  async getCertificateById(certificateId) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.certificates}/certificates/${certificateId}`);

      if (!response.ok) {
        throw new Error('Certificate not found');
      }

      return await response.json();
    } catch (error) {
      console.error('Get certificate error:', error);
      throw error;
    }
  }

  async createCertificate(certificateData) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.certificates}/certificates`, {
        method: 'POST',
        body: JSON.stringify(certificateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create certificate');
      }

      return await response.json();
    } catch (error) {
      console.error('Create certificate error:', error);
      throw error;
    }
  }

  async updateCertificate(certificateId, certificateData) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.certificates}/certificates/${certificateId}`, {
        method: 'PUT',
        body: JSON.stringify(certificateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update certificate');
      }

      return await response.json();
    } catch (error) {
      console.error('Update certificate error:', error);
      throw error;
    }
  }

  async deleteCertificate(certificateId) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.certificates}/certificates/${certificateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete certificate');
      }

      return await response.json();
    } catch (error) {
      console.error('Delete certificate error:', error);
      throw error;
    }
  }

  // ============= ТИПЫ СПРАВОК =============

  async getCertificateTypes(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active);
      if (filters.skip) queryParams.append('skip', filters.skip);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const url = `${API_ENDPOINTS.certificates}/certificate-types${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error('Failed to fetch certificate types');
      }

      return await response.json();
    } catch (error) {
      console.error('Get certificate types error:', error);
      throw error;
    }
  }

  // ============= СТАТИСТИКА =============

  async getStatistics() {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.certificates}/statistics`);

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      return await response.json();
    } catch (error) {
      console.error('Get statistics error:', error);
      throw error;
    }
  }
}

export default new CertificatesService();

