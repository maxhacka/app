import { API_ENDPOINTS, fetchWithAuth, getAuthToken } from '../config/api';

class LibraryService {
  // ============= КНИГИ =============
  
  async getBooks(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.author) queryParams.append('author', filters.author);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.is_electronic !== undefined) queryParams.append('is_electronic', filters.is_electronic);
      if (filters.skip) queryParams.append('skip', filters.skip);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const url = `${API_ENDPOINTS.library}/books${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }

      return await response.json();
    } catch (error) {
      console.error('Get books error:', error);
      throw error;
    }
  }

  async getBookById(bookId) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.library}/books/${bookId}`);

      if (!response.ok) {
        throw new Error('Book not found');
      }

      return await response.json();
    } catch (error) {
      console.error('Get book error:', error);
      throw error;
    }
  }

  async createBook(bookData) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.library}/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create book');
      }

      return await response.json();
    } catch (error) {
      console.error('Create book error:', error);
      throw error;
    }
  }

  async updateBook(bookId, bookData) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.library}/books/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update book');
      }

      return await response.json();
    } catch (error) {
      console.error('Update book error:', error);
      throw error;
    }
  }

  async deleteBook(bookId) {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.library}/books/${bookId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete book');
      }

      return await response.json();
    } catch (error) {
      console.error('Delete book error:', error);
      throw error;
    }
  }

  async uploadBookPDF(bookId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_ENDPOINTS.library}/books/${bookId}/upload-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          throw new Error('Unauthorized');
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload PDF');
      }

      return await response.json();
    } catch (error) {
      console.error('Upload PDF error:', error);
      throw error;
    }
  }

  async getStatistics() {
    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.library}/statistics`);

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

export default new LibraryService();

