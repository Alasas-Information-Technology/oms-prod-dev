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





# OMS Security Settings - Test Cases

## Module

Security Administration → Security Settings

## Sprint

Sprint 1.5 – Security Policies & Administration

## Objective

Validate that all configurable security settings are correctly:

* Loaded from `auth.SecuritySettings`
* Updated through the Security Settings UI
* Persisted to the database
* Enforced throughout the authentication and session lifecycle

---

# 1. Authentication & Session Policies

## TC-SEC-001

### Verify Access Token Lifetime

**Preconditions**

* Access token lifetime configured to 15 minutes.

**Steps**

1. Login successfully.
2. Wait until token expiration.
3. Perform API request.

**Expected Result**

* Middleware returns `TOKEN_EXPIRED`.
* Refresh endpoint is invoked.
* New access token is issued.
* User remains logged in.

---

## TC-SEC-002

### Verify Refresh Token Lifetime

**Preconditions**

* Refresh token lifetime configured to 30 days.

**Steps**

1. Login.
2. Manually set refresh token expiry beyond configured period.
3. Invoke refresh endpoint.

**Expected Result**

* Refresh request fails.
* Session revoked.
* User redirected to Login.

---

## TC-SEC-003

### Disable Multiple Sessions

**Configuration**

```text
ALLOW_MULTIPLE_SESSIONS = false
```

**Steps**

1. Login on Browser A.
2. Attempt login on Browser B.

**Expected Result**

* Second login denied.

OR

* Oldest session revoked based on policy.

---

## TC-SEC-004

### Allow Multiple Sessions

**Configuration**

```text
ALLOW_MULTIPLE_SESSIONS = true
```

**Steps**

1. Login on Browser A.
2. Login on Browser B.

**Expected Result**

* Both sessions remain active.

---

## TC-SEC-005

### Max Concurrent Sessions Enforcement

**Configuration**

```text
MAX_CONCURRENT_SESSIONS = 3
```

**Steps**

1. Login on Device 1.
2. Login on Device 2.
3. Login on Device 3.
4. Attempt Device 4.

**Expected Result**

System enforces configured policy.

---

## TC-SEC-006

### Auto Revoke Oldest Session

**Configuration**

```text
AUTO_REVOKE_OLDEST_SESSION = true
```

**Steps**

1. Reach max session limit.
2. Login from new device.

**Expected Result**

* Oldest session revoked.
* New session created.
* Security event logged.

---

## TC-SEC-007

### Deny Login When Session Limit Reached

**Configuration**

```text
AUTO_REVOKE_OLDEST_SESSION = false
```

**Steps**

1. Reach max session limit.
2. Attempt new login.

**Expected Result**

* Login denied.
* Existing sessions remain active.

---

## TC-SEC-008

### Session Fingerprinting Enabled

**Configuration**

```text
REQUIRE_SESSION_FINGERPRINTING = true
```

**Steps**

1. Login normally.
2. Modify fingerprint cookie.
3. Access protected endpoint.

**Expected Result**

* Session invalidated.
* User redirected to Login.

---

# 2. Account Protection

## TC-SEC-009

### Failed Login Threshold

**Configuration**

```text
MAX_FAILED_LOGIN_ATTEMPTS = 5
```

**Steps**

1. Enter wrong password 5 times.

**Expected Result**

* Account locked.

---

## TC-SEC-010

### Account Lockout Duration

**Configuration**

```text
LOCKOUT_DURATION = 30
```

**Steps**

1. Trigger lockout.
2. Attempt login before 30 minutes.
3. Attempt login after 30 minutes.

**Expected Result**

* Login denied during lock period.
* Login allowed after expiration.

---

# 3. Replay Detection

## TC-SEC-011

### Replay Detection Enabled

**Configuration**

```text
ENABLE_REPLAY_DETECTION = true
```

**Steps**

1. Refresh access token.
2. Reuse old refresh token.

**Expected Result**

* Replay detected.
* Security event generated.

---

## TC-SEC-012

### Replay Action - Revoke Session

**Configuration**

```text
REPLAY_ACTION_REVOKE = true
```

**Steps**

1. Trigger refresh token replay.

**Expected Result**

* Current session revoked.

---

## TC-SEC-013

### Replay Action - Log Event

**Configuration**

```text
REPLAY_ACTION_LOG = true
```

**Steps**

1. Trigger replay attack.

**Expected Result**

Security Event:

```text
REFRESH_TOKEN_REPLAY
```

appears in dashboard.

---

## TC-SEC-014

### Replay Action - Logout User

**Configuration**

```text
REPLAY_ACTION_LOGOUT = true
```

**Steps**

1. Trigger replay attack.

**Expected Result**

* All user sessions revoked.
* User forced to login again.

---

# 4. Audit Retention Policies

## TC-SEC-015

### Security Event Retention

**Configuration**

```text
SECURITY_EVENTS_RETENTION = 365
```

**Steps**

1. Run retention cleanup job.

**Expected Result**

* Events older than 365 days removed.

---

## TC-SEC-016

### Login History Retention

**Configuration**

```text
LOGIN_HISTORY_RETENTION = 365
```

**Expected Result**

* Login records older than 365 days removed.

---

## TC-SEC-017

### Logout History Retention

**Configuration**

```text
LOGOUT_HISTORY_RETENTION = 365
```

**Expected Result**

* Logout records older than 365 days removed.

---

## TC-SEC-018

### Failed Login Retention

**Configuration**

```text
FAILED_LOGIN_RETENTION = 180
```

**Expected Result**

* Failed login records older than 180 days removed.

---

# 5. Security Dashboard Validation

## TC-SEC-019

### Dashboard Metrics Update

**Steps**

1. Generate failed logins.
2. Create new sessions.
3. Trigger replay event.

**Expected Result**

Dashboard cards update correctly.

---

## TC-SEC-020

### Real-Time Event Streaming

**Steps**

1. Open Security Dashboard.
2. Generate security event.

**Expected Result**

* Event appears without page refresh.

---

# 6. Permissions & Authorization

## TC-SEC-021

### SECURITY.ADMIN Access

**User Role**

```text
SYSTEM_ADMIN
```

**Expected Result**

Can access:

* Security Dashboard
* Security Settings
* Security APIs

---

## TC-SEC-022

### Non-Security User Access

**User Role**

```text
REQUESTOR
```

**Expected Result**

Access denied.

Response:

```json
{
  "message": "Forbidden"
}
```

---

## TC-SEC-023

### SECURITY.DASHBOARD.VIEW Permission

**Expected Result**

User can:

* View dashboard

Cannot:

* Modify settings

---

## TC-SEC-024

### SECURITY.SESSIONS.REVOKE Permission

**Expected Result**

User can:

* Revoke sessions

Cannot:

* Change security policies

---

# 7. Regression Tests

## TC-SEC-025

Login still functions after changing settings.

---

## TC-SEC-026

Refresh token rotation still functions.

---

## TC-SEC-027

Force logout still revokes all sessions.

---

## TC-SEC-028

Security dashboard APIs return valid data.

---

## TC-SEC-029

Security settings save successfully.

---

## TC-SEC-030

Security settings persist after application restart.

---

# Acceptance Criteria

All 30 test cases must pass before Sprint 1.5 is considered complete.
