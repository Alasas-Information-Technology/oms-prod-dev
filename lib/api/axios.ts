import axios from "axios";

const api = axios.create({
    baseURL: "/api",
    withCredentials: true,
});

let isRefreshing = false;

let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any) => {

    failedQueue.forEach(
        promise => {

            if (error) {
                promise.reject(error);
            } else {
                promise.resolve();
            }
        }
    );

    failedQueue = [];
};

api.interceptors.response.use(
    response => response,

    async error => {

        const originalRequest =
            error.config;

        const status =
            error.response?.status;

        const code =
            error.response?.data?.code;

        /**
         * Not an auth error
         */
        if (status !== 401) {
            return Promise.reject(error);
        }

        /**
         * Never retry refresh endpoint
         */
        if (
            originalRequest.url ===
            "/auth/refresh"
        ) {

            return Promise.reject(
                error
            );
        }

        /**
         * Only refresh expired tokens
         */
        if (
            code !== "TOKEN_EXPIRED"
        ) {

            if (
                typeof window !==
                "undefined" &&
                window.location.pathname !==
                "/login" &&
                window.location.pathname !==
                "/"
            ) {

                window.location.href =
                    "/login";
            }

            return Promise.reject(
                error
            );
        }



        /**
         * Prevent infinite loops
         */
        if (
            originalRequest._retryCount &&
            originalRequest._retryCount >= 1
        ) {

            return Promise.reject(
                error
            );
        }

        /**
         * Refresh already running
         */
        if (isRefreshing) {

            return new Promise(
                (
                    resolve,
                    reject
                ) => {

                    failedQueue.push({
                        resolve,
                        reject,
                    });
                }
            )
                .then(() => {
                    return api(
                        originalRequest
                    );
                })
                .catch(err => {
                    return Promise.reject(
                        err
                    );
                });
        }

        originalRequest._retryCount =
            (
                originalRequest
                    ._retryCount || 0
            ) + 1;

        isRefreshing = true;

        try {

            await axios.post(
                "/api/auth/refresh",
                {},
                {
                    withCredentials:
                        true,
                }
            );

            processQueue(null);

            return api(
                originalRequest
            );

        } catch (refreshError) {

            processQueue(
                refreshError
            );

            /**
             * Refresh failed
             *
             * 401
             * Refresh token expired
             *
             * 403
             * Replay detection
             *
             * 409
             * Session revoked
             */

            if (
                typeof window !==
                "undefined" &&
                window.location.pathname !==
                "/login" &&
                window.location.pathname !==
                "/"
            ) {

                window.location.href =
                    "/login";
            }

            return Promise.reject(
                refreshError
            );

        } finally {

            isRefreshing = false;
        }
    }
);

export default api;