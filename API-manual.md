# API Manual

This document provides a summary of all the API endpoints available in the application. The APIs are built using Next.js App Router and are located in the `app/api/` directory.

## 1. Authentication APIs (`/api/auth/*`)

These endpoints handle user authentication, session management, and token lifecycles.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/auth/login` | Authenticates a user with credentials. Establishes a secure session, logs security events, and sets `HttpOnly` cookies for access tokens, refresh tokens, and device fingerprinting. |
| **POST** | `/api/auth/logout` | Ends the current user session and clears authentication cookies. |
| **POST** | `/api/auth/refresh` | Refreshes an expired access token using a valid refresh token cookie. |
| **GET** | `/api/auth/sessions` | Retrieves a list of active sessions for the currently authenticated user. |
| **DELETE**| `/api/auth/sessions/[id]` | Revokes and terminates a specific session by its session ID. |
| **POST** | `/api/auth/sessions/revoke-all` | Revokes all active sessions for the currently authenticated user. |

---

## 2. Security & Dashboard APIs (`/api/internal/security/*`)

These endpoints provide data for the internal security dashboard, including event logs and real-time monitoring.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/internal/security/dashboard` | Provides an overall data payload for the main security dashboard view. |
| **GET** | `/api/internal/security/summary` | Returns a high-level summary of security metrics and system statistics. |
| **GET** | `/api/internal/security/user-summary` | Returns security data, activity, and statistics specific to individual users. |
| **GET** | `/api/internal/security/events` | Retrieves a detailed, paginated list of system security events and audit logs. |
| **GET** | `/api/internal/security/failed-logins` | Retrieves detailed records of failed login attempts for auditing purposes. |
| **GET** | `/api/internal/security/stream` | Establishes a real-time stream (e.g., Server-Sent Events) to push live security events to the client. |

---

## 3. Security Chart Data APIs (`/api/internal/security/charts/*`)

These endpoints provide time-series or aggregated data specifically formatted to be consumed by dashboard charts and graphs.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/internal/security/charts/failed-logins` | Aggregates data for failed login attempts over a specified time period. |
| **GET** | `/api/internal/security/charts/locked-accounts` | Provides data metrics regarding the number of locked accounts. |
| **GET** | `/api/internal/security/charts/login-trend` | Provides time-series data illustrating successful and failed login trends. |
| **GET** | `/api/internal/security/charts/replay-events` | Provides data on detected replay attacks or suspicious duplicate events. |
| **GET** | `/api/internal/security/charts/security-events-by-type` | Provides a breakdown of security events grouped by their event type classification. |
| **GET** | `/api/internal/security/charts/sessions-by-device` | Aggregates active session data grouped by device type or fingerprint (e.g., Mobile, Desktop). |
| **GET** | `/api/internal/security/charts/sessions-by-role` | Aggregates active session data grouped by assigned user roles. |
