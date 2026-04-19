import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

// Don't hard-code Content-Type here: axios auto-picks the right one per request
// (application/json for plain objects, multipart/form-data for FormData uploads, etc.)
const api = axios.create({
  baseURL: '/api',
});

function getAuthToken(): string | null {
  const fromStore = useAuthStore.getState().token;
  if (fromStore) return fromStore;
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem('trace-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string | null } };
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

// Inject auth token (store + persisted Zustand) on every request
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Standardize error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth on unauthorized
      localStorage.removeItem('trace-auth');
      // Optionally redirect to login
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/admin')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
