import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true, // Send HttpOnly cookies automatically
});

/**
 * Refresh Token Queue Manager
 *
 * Prevents refresh storms: when multiple requests receive 401 simultaneously,
 * only ONE refresh request is made. All other requests queue up and retry
 * after the refresh completes.
 */
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });

    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only intercept 401 errors
        if (error.response?.status !== 401) {
            return Promise.reject(error);
        }

        // Prevent infinite loops: never retry the refresh endpoint itself
        if (originalRequest.url === '/auth/refresh') {
            return Promise.reject(error);
        }

        // Prevent infinite retry loops: max 1 retry per request
        if (originalRequest._retryCount && originalRequest._retryCount >= 1) {
            return Promise.reject(error);
        }

        // If a refresh is already in progress, queue this request
        if (isRefreshing) {
            return new Promise(function (resolve, reject) {
                failedQueue.push({ resolve, reject });
            }).then(() => {
                return api(originalRequest);
            }).catch((err) => {
                return Promise.reject(err);
            });
        }

        // Mark this request as retried
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
        isRefreshing = true;

        try {
            // Call refresh endpoint
            // HttpOnly cookies are sent automatically by the browser.
            // The response will set new HttpOnly cookies automatically.
            await axios.post('/api/auth/refresh', {}, { withCredentials: true });

            processQueue(null);
            return api(originalRequest);
        } catch (refreshError: any) {
            processQueue(refreshError);

            // If refresh returns 403, it means replay detection triggered
            // If refresh returns 401, the refresh token is invalid/expired
            // In both cases, redirect to login
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;
