import axios from 'axios';
import { AUTH_MESSAGES, HTTP_STATUS, LOCAL_STORAGE_KEYS, LOGIN_PAGE } from "@/app/libs/constants/auth";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
});

let isRefreshing = false;
let failedQueue: any[] = [];// Queue to hold failed requests while token is being refreshed

// Funtion to procees the failed requests after token is refreshed
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor (Attach Token)
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (Handle 401 & Refresh)
api.interceptors.response.use(

  (response) => response,
  
  async (error: any) => {
    const originalRequest = error.config;
    const { response } = error;

    if (response) {
      const { status } = response;

      // Global Error Handling based on Status
      if (status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
        // Handle Token Refresh logic
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }

        isRefreshing = true;
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
          if (!refreshToken) throw new Error(AUTH_MESSAGES.NO_REFRESH_TOKEN);

          const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
          const res = await axios.post(`${base}/auth/refresh`, { refresh_token: refreshToken });
          const newAccessToken = res?.data?.access_token;

          if (!newAccessToken) throw new Error(AUTH_MESSAGES.INVALID_ACCESS_TOKEN);

          localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, newAccessToken);
          if (res.data.refresh_token) localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, res.data.refresh_token);
          
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return api(originalRequest);
        } catch (err) {
          console.error(`[auth] ${AUTH_MESSAGES.TOKEN_REFRESH_FAIL}:`, err);
          processQueue(err, null);
          localStorage.clear();
          window.location.href = LOGIN_PAGE;
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      // 403 Forbidden: User is authenticated but doesn't have permission
      if (status === HTTP_STATUS.FORBIDDEN) {
        console.error(`[error] ${AUTH_MESSAGES.ACCESS_FORBIDDEN}`);
        // window.location.href = "/unauthorized"; // Optional: Redirect to an unauthorized page
      }

      // 500+ Server Errors
      if (status >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
        console.error(`[error] ${AUTH_MESSAGES.SERVER_ERROR}`);
        // You could trigger a toast notification here
      }
    } else {
      // Network issues or timeout (no response from server)
      console.error(`[error] ${AUTH_MESSAGES.NETWORK_ERROR}`);
    }

    return Promise.reject(error);
  }
);

export default api;