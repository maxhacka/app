// API Configuration
// Автоматически определяем базовый URL на основе текущего хоста
// Если переменная окружения не задана, используем текущий хост (без порта фронтенда)
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Определяем базовый URL из текущего location
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  
  // Если это localhost, используем localhost для API
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost';
  }
  
  // Иначе используем тот же хост (внешний IP)
  return `${protocol}//${hostname}`;
};

const API_BASE_URL = getApiBaseUrl();

// Microservices ports (matching docker-compose.yml)
const PORTS = {
  auth: 8001,
  staff: 8002,
  timetable: 8003,
  applicants: 8004,
  events: 8005,
  library: 8006,
  certificates: 8007,
};

// API Endpoints
export const API_ENDPOINTS = {
  auth: `${API_BASE_URL}:${PORTS.auth}/api/auth`,
  applicants: `${API_BASE_URL}:${PORTS.applicants}/api`,
  certificates: `${API_BASE_URL}:${PORTS.certificates}/api`,
  events: `${API_BASE_URL}:${PORTS.events}/api`,
  library: `${API_BASE_URL}:${PORTS.library}/api`,
  staff: `${API_BASE_URL}:${PORTS.staff}/api`,
  timetable: `${API_BASE_URL}:${PORTS.timetable}/api`,
};

// Token management
export const TOKEN_KEY = 'authToken';

export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// Helper function for authenticated requests
export const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If unauthorized, clear token and redirect to login
  if (response.status === 401) {
    removeAuthToken();
    window.location.href = '/login';
  }

  return response;
};

export default API_ENDPOINTS;

