import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown, token: unknown = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
}

/* Public API routes that guests are allowed to call — never redirect these */
const PUBLIC_ROUTES = [
  '/api/v1/trips',
  '/api/v1/auth/',
  '/api/v1/notifications/unread-count', // silently fails for guests
];

const isPublicRoute = (url: string = '') =>
  PUBLIC_ROUTES.some((r) => url.includes(r));

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url: string = originalRequest?.url ?? '';

    // For public routes or auth routes — never retry or redirect, just reject
    if (status === 401 && isPublicRoute(url)) {
      return Promise.reject(error);
    }

    // For authenticated routes — try to refresh, then redirect if needed
    if (status === 401 && !originalRequest._retry && !url.includes('/api/v1/auth/')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post('/api/v1/auth/refresh');
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Only redirect if we're currently on a protected page
        if (typeof window !== 'undefined') {
          const protectedPaths = ['/checkout', '/bookings', '/notifications', '/profile', '/admin'];
          const isOnProtectedPage = protectedPaths.some((p) =>
            window.location.pathname.startsWith(p)
          );
          if (isOnProtectedPage) {
            window.location.href = `/auth/login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
          }
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
