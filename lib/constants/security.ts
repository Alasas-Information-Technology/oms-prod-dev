export const SECURITY = {

    MAX_FAILED_ATTEMPTS: 5,

    LOCKOUT_MINUTES: 15,

    /** JWT access token lifetime (jose / jsonwebtoken format) */
    ACCESS_TOKEN_EXPIRY: '15m',

    /** Refresh token lifetime in days */
    REFRESH_TOKEN_DAYS: 7,

    /** Login session lifetime in days (aligned with refresh token) */
    SESSION_EXPIRY_DAYS: 7,

    /** Access token cookie max-age in seconds (15 minutes) */
    ACCESS_TOKEN_COOKIE_MAX_AGE: 60 * 15,

    /** Refresh token cookie max-age in seconds (7 days) */
    REFRESH_TOKEN_COOKIE_MAX_AGE: 60 * 60 * 24 * 7,

    /** device_id cookie max-age in seconds (30 days) */
    DEVICE_ID_COOKIE_MAX_AGE: 60 * 60 * 24 * 30,
};