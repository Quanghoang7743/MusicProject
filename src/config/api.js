import axios from 'axios';

const BASE_URL = 'http://localhost:3005/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR - Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');

    console.log('🔍 Request Interceptor:');
    console.log('  URL:', config.url);
    console.log('  Token exists:', !!token);
    console.log('  Token preview:', token ? token.substring(0, 20) + '...' : 'none');

    if (token) {
      // ✅ CRITICAL: Add Authorization header with Bearer prefix
      config.headers.Authorization = `Bearer ${token}`;
      console.log('  ✅ Authorization header set');
    } else {
      console.log('  ⚠️ No token found in localStorage');
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR - Handle responses and errors
api.interceptors.response.use(
  (response) => {
    // Return nested data if exists, otherwise return response.data
    return response.data?.data || response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // --- REFRESH TOKEN LOGIC ---
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error("No refresh token available");

        // Call refresh token endpoint (Use raw axios to avoid loop)
        const response = await axios.post(`${BASE_URL}/v1/auth/refresh-token`, {
          refreshToken: refreshToken
        });

        const newAccessToken = response.data?.data?.accessToken || response.data?.accessToken;

        if (newAccessToken) {
          localStorage.setItem('authToken', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          throw new Error("No access token in refresh response");
        }

      } catch (refreshError) {
        console.error("Session expired:", refreshError);
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
          const savedUser = localStorage.getItem('currentUser');
          // Always redirect to home instead of using /login route
          let redirectTo = '/';
          // Clear currentUser. Only perform a navigation if we're not already on the same path
          localStorage.removeItem('currentUser');
          try {
            const currentPath = window.location.pathname || '/';
            if (currentPath !== redirectTo) {
              window.location.href = redirectTo;
            } else {
              // Already at target path - avoid forcing a reload which can cause a loop
              console.warn('Already at redirect target, skipping forced reload to avoid loop:', redirectTo);
            }
          } catch (e) {
            // In non-browser environments, just ignore
          }
        return Promise.reject(refreshError);
      }
    }

    // --- LOG ERROR ---
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: errorMessage,
      detail: error.response?.data
    });

    return Promise.reject(error);
  }
);

export default api;