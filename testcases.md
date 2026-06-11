# Outsource Management System (OMS) - Test Cases

This document outlines the test scenarios for the security, authentication, and session management logic implemented in the OMS platform.

## 1. Authentication & Login

| Test Case ID | Scenario | Pre-conditions | Steps | Expected Result |
|---|---|---|---|---|
| AUTH-001 | Successful Login | User has valid credentials | 1. Enter valid username & password<br>2. Submit form | User logs in successfully. `SESSION_CREATED` and `LOGIN_SUCCESS` events are logged. `oms_access_token` and `oms_refresh_token` cookies are set. Axios default headers (`x-user-id`, `x-login-session-id`, `x-user-session`) are populated. |
| AUTH-002 | Failed Login - Invalid Credentials | User enters wrong password | 1. Enter invalid password<br>2. Submit form | Login fails. `LOGIN_FAILURE` event is logged in `auth.SecurityEvents` and `auth.FailedLoginAttempts`. |
| AUTH-003 | Initial Page Load - Active Session | User has valid unexpired tokens | 1. Open new tab<br>2. Navigate to OMS dashboard | User is granted access immediately without seeing login screen. `AuthContext` restores Axios headers. |
| AUTH-004 | Logout | User is logged in | 1. Click Logout button | `LOGOUT` event is logged. Session is revoked in DB (`RevokedAt` set). Refresh token is revoked. Cookies are cleared. User is redirected to `/login`. |

## 2. Token Rotation & Refresh

| Test Case ID | Scenario | Pre-conditions | Steps | Expected Result |
|---|---|---|---|---|
| REFRESH-001 | Background Silent Refresh | User is active on dashboard | 1. Wait for 10-minute interval to trigger | `/api/auth/refresh` is called. `REFRESH_TOKEN_REVOKED` (for old token) and `REFRESH_TOKEN_ROTATED` (for new token) are logged. New tokens are set in cookies. |
| REFRESH-002 | Tab Focus Refresh | Tab inactive > 15 mins (Access Token expired) | 1. Leave tab inactive until access token expires<br>2. Switch back to tab | `handleFocus` detects expired token (`REFRESH_REQUIRED`). Triggers silent refresh. Resolves cleanly without redirecting to login. |
| REFRESH-003 | Axios Interceptor Refresh | API call returns 401 | 1. Access token naturally expires<br>2. Perform an action (e.g., click a button to fetch data) | Axios intercepts 401, pauses the request, calls `/auth/refresh`, gets new tokens, and transparently retries the original request. |
| REFRESH-004 | Failed Refresh - Refresh Token Expired | User inactive > 7 days | 1. Leave session inactive for > 7 days<br>2. Open OMS | `/auth/refresh` fails. `TOKEN_EXPIRED` is logged. User is redirected to `/login`. |
| REFRESH-005 | Next.js Soft Navigation (RSC) | Access Token is expired | 1. Let Access Token expire<br>2. Click a `<Link>` to another page | Server component checks token, returns "Access Denied" or kicks user to login because RSC cannot dynamically refresh cookies. |

## 3. Security & Replay Attack Prevention

| Test Case ID | Scenario | Pre-conditions | Steps | Expected Result |
|---|---|---|---|---|
| SEC-001 | Refresh Token Replay Attack | Attacker has stolen an *old* (revoked) refresh token | 1. Legitimate user rotates token (Token A -> Token B)<br>2. Attacker waits > 30 seconds<br>3. Attacker sends Token B | Replay attack detected! `REFRESH_TOKEN_REPLAY` is logged. The **entire** session is revoked (`RevokedAt` set). Legitimate user is logged out. |
| SEC-002 | Concurrent Refresh Grace Period | React StrictMode or multiple tabs trigger simultaneous refresh | 1. Two network requests send Token A within milliseconds of each other | Request 1 rotates token and returns 200.<br>Request 2 sees token was revoked < 30 seconds ago, catches `CONCURRENT_REFRESH` exception, and returns 200 OK without failing. Session is **not** revoked. |
| SEC-003 | Race Condition Prevention (Frontend) | User returns to tab after a long time | 1. Wait until Access Token expires<br>2. Switch back to tab (fires `visibilitychange` & `focus` simultaneously) | `refreshSession` Promise ensures both events await the **same** exact network request. User is not erroneously logged out due to local state race conditions. |
| SEC-004 | Forged / Unknown Token | Request sent with completely invalid token | 1. Send `/auth/refresh` with fake token | Backend returns 401 "Invalid refresh token". No DB lookup match. No session revoked. |

## 4. API Client & Headers

| Test Case ID | Scenario | Pre-conditions | Steps | Expected Result |
|---|---|---|---|---|
| HDR-001 | Headers Injection | User logs in | 1. Login<br>2. Check Axios requests | `x-user-id`, `x-login-session-id`, and `x-user-session` are correctly populated on every outgoing API request. |
| HDR-002 | Header Removal | User logs out | 1. Logout<br>2. Check Axios state | All user-specific headers are successfully cleared from the global Axios defaults. |
