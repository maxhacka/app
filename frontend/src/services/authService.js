import { API_ENDPOINTS, setAuthToken, removeAuthToken } from '../config/api';

class AuthService {
  async login(username, password) {
    try {
      console.log('Attempting login for:', username);
      
      const response = await fetch(`${API_ENDPOINTS.auth}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login error response:', errorData);
        const errorMessage = typeof errorData.detail === 'string' 
          ? errorData.detail 
          : 'Неверное имя пользователя или пароль';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Login successful, token received');

      // Store token
      setAuthToken(data.access_token);
      
      // Get user data
      const userData = await this.getCurrentUser();
      console.log('User data retrieved:', userData);
      
      return {
        success: true,
        user: userData,
        token: data.access_token,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Ошибка входа',
      };
    }
  }

  async register(userData) {
    try {
      const response = await fetch(`${API_ENDPOINTS.auth}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          role: userData.role || 'student',
          is_active: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      return {
        success: true,
        user: data,
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getCurrentUser() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return null;
      }

      // Используем эндпоинт verify для проверки токена и получения данных пользователя
      const response = await fetch(`${API_ENDPOINTS.auth}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          removeAuthToken();
        }
        throw new Error('Failed to verify token');
      }

      const data = await response.json();
      
      // Если токен невалиден
      if (!data.valid) {
        removeAuthToken();
        return null;
      }

      // Возвращаем данные пользователя
      return {
        user_id: data.user_id,
        username: data.username,
        user_type: data.user_type,
        role: data.user_type,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      throw error; // Re-throw to let AuthContext handle it
    }
  }

  async verifyToken(token) {
    try {
      const response = await fetch(`${API_ENDPOINTS.auth}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      return data.valid === true;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }

  logout() {
    removeAuthToken();
    window.location.href = '/login';
  }
}

export default new AuthService();
