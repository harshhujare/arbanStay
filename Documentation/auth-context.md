# UrbanStay Authentication Flow

## Overview

UrbanStay uses a **hybrid JWT + localStorage** authentication strategy with two supported login methods:

1. **Phone OTP Login** (primary) — via Twilio SMS
2. **Google OAuth Login** (secondary) — via Google Identity Services

Both methods are handled through a single modal component: `UnifiedAuthModal.jsx`, backed by `AuthContext.jsx` and `authService.js`.

---

## Token Storage Strategy

| Storage | What is stored | Purpose |
|---|---|---|
| **HTTP-only Cookie** | JWT access token | Sent automatically with every API request (XSS-safe) |
| **`localStorage` (`urbanstay_user`)** | User object (JSON) | Instant UI hydration on page load without a backend round-trip |

The JWT is never accessible from JavaScript — only the server can read it from the cookie. The localStorage cache is used purely for fast UI display.

---

## App Startup — Session Initialization

When the app first loads, `AuthProvider` calls `initializeAuth()`:

```
App Starts
    │
    ▼
localStorage has "urbanstay_user"?
    │
    ├── YES → setUser(cached), setIsAuthenticated(true), setLoading(false)
    │          └── validateTokenInBackground()  ← silent API call to GET /auth/me
    │                   ├── Success → update cache with fresh user data
    │                   └── Failure → clearAuthCache(), setUser(null), setIsAuthenticated(false)
    │
    └── NO  → loadUser() ← blocking call to GET /auth/me
                   ├── Success → setUser, setIsAuthenticated(true), updateAuthCache
                   └── Failure → clearAuthCache(), setUser(null)
```

**Key behaviour:** If localStorage has cached data, the user sees the UI instantly (no spinner). The token is validated silently in the background, and if it's expired the user is quietly logged out.

---

## Login Modal — `UnifiedAuthModal`

The modal has **4 internal stages** driven by a `stage` state variable:

```
"initial"  →  "otp-login"     (Phone-first login flow)
"initial"  →  "phone-verify"  (Post-Google phone linking)
           →  "otp-link"      (OTP for phone linking)
```

### Stage Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    "initial" stage                      │
│  ┌──────────────────────────────────┐                   │
│  │  PHONE NUMBER input (+91)        │                   │
│  │  [Continue] ──────────────────► "otp-login"         │
│  └──────────────────────────────────┘                   │
│               ──── or ────                              │
│  ┌──────────────────────────────────┐                   │
│  │  [Continue with Google]          │                   │
│  │      └── phoneVerified = true  ──► onSuccess() ✓    │
│  │      └── phoneVerified = false ──► "phone-verify"   │
│  └──────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────┘

"otp-login" stage
  ├── Enter 4-digit OTP
  ├── [Verify OTP] → verifyOtp() → onSuccess() ✓
  ├── [Resend OTP] → 60s cooldown timer
  └── [Change] → back to "initial"

"phone-verify" stage  (only reached after Google login)
  ├── Enter phone number
  ├── [Verify Now] → sendOtp() → "otp-link"
  └── [Skip for now] → onSuccess() ✓  (phone remains unverified)

"otp-link" stage
  ├── Enter 4-digit OTP
  ├── [Verify OTP] → linkPhone() → onSuccess() ✓
  ├── [Resend OTP] → 60s cooldown timer
  ├── [Change] → back to "phone-verify"
  └── [Skip for now] → onSuccess() ✓
```

---

## Flow 1: Phone OTP Login (Primary)

**Entry point:** User enters 10-digit phone number on the initial screen and clicks **Continue**.

```
User enters phone → handleSendOtpLogin()
    │
    ▼
POST /auth/send-otp { phoneNumber }
    │
    ├── Success → setStage("otp-login"), start 60s resend timer
    └── Error   → show error message

User enters 4-digit OTP → handleVerifyOtpLogin()
    │
    ▼
POST /auth/verify-otp { phoneNumber, otp }
    │
    ├── data.needsSignup = true  → return data (signup completion needed, not yet used in this modal)
    ├── data.user exists         → setUser, setIsAuthenticated(true), updateAuthCache → onSuccess() ✓
    └── Error                   → show "Invalid OTP"
```

**Context function:** `verifyOtp(phoneNumber, otp)`
**API endpoint:** `POST /auth/verify-otp`
**Result:** Sets user in context + localStorage, closes modal.

---

## Flow 2: Google OAuth Login (Secondary)

**Entry point:** User clicks **Continue with Google** on the initial screen.

```
Google button clicked → handleGoogleSuccess(credentialResponse)
    │
    ▼
POST /auth/google-login { credential: <Google ID token> }
    │
    ├── Success (always logs in / creates account)
    │       setUser(data.user), setIsAuthenticated(true), updateAuthCache
    │       │
    │       ├── data.user.phoneVerified = true  → onSuccess() ✓  (modal closes)
    │       └── data.user.phoneVerified = false → setStage("phone-verify")
    │
    └── Error → show "Google login failed"
```

**Context function:** `googleLogin(credential)`
**API endpoint:** `POST /auth/google-login`
**Note:** Google login **always** creates or logs in the account immediately. Phone verification is an optional follow-up step.

---

## Flow 3: Post-Google Phone Linking (Optional)

Triggered only when a Google-authenticated user does not have a verified phone (`phoneVerified = false`).

```
setStage("phone-verify")

User enters phone → handleSendOtpLink()
    │
    ▼
POST /auth/send-otp { phoneNumber }
    │
    └── Success → setStage("otp-link"), start 60s resend timer

User enters OTP → handleVerifyOtpLink()
    │
    ▼
POST /auth/link-phone { phoneNumber, otp }
    │
    ├── Success → setUser(data.user), updateAuthCache → onSuccess() ✓
    └── Error   → show "Invalid OTP"

OR user clicks [Skip for now] → onSuccess() ✓  (user stays logged in, phone unverified)
```

**Context function:** `linkPhone(phoneNumber, otp)`
**API endpoint:** `POST /auth/link-phone`
**Note:** This flow is skippable. Skipping leaves `phoneVerified = false` on the user object.

---

## Logout

```
User clicks Logout → logout()
    │
    ▼
POST /auth/logout          ← clears HTTP-only JWT cookie on backend
clearAuthCache()           ← removes "urbanstay_user" from localStorage
setUser(null)
setIsAuthenticated(false)
```

---

## AuthContext API Reference

All values and functions are available via the `useAuth()` hook in any component inside `<AuthProvider>`.

### State Values

| Property | Type | Description |
|---|---|---|
| `user` | `Object \| null` | Current logged-in user object |
| `loading` | `boolean` | `true` while initial auth check is in progress |
| `isAuthenticated` | `boolean` | `true` if user is logged in |
| `isAdmin` | `boolean` | `true` if `user.role === "admin"` |
| `isPhoneVerified` | `boolean` | `true` if `user.phoneVerified === true` |

### Functions

| Function | Signature | Description |
|---|---|---|
| `sendOtp` | `(phoneNumber: string) => Promise` | Sends a 4-digit OTP via SMS to the given 10-digit number |
| `verifyOtp` | `(phoneNumber, otp) => Promise` | Verifies OTP for phone-first login. Sets user in context if valid. Returns `{needsSignup: true}` if new user needs profile completion |
| `googleLogin` | `(credential: string) => Promise` | Authenticates via Google ID token. Always logs in or creates account |
| `linkPhone` | `(phoneNumber, otp) => Promise` | Links a verified phone to an already logged-in Google user. Updates user in context |
| `completeSignup` | `(signupData: Object) => Promise` | Completes user profile after initial sign-up. `signupData`: `{ phone, name, city, googleId?, email?, profilePhoto? }` |
| `logout` | `() => Promise` | Logs out user, clears cookie and localStorage |
| `loadUser` | `() => Promise` | Re-fetches current user from backend (`GET /auth/me`) |
| `updateUser` | `(userData: Object) => void` | Updates user in context and syncs localStorage cache |

---

## API Endpoints (authService.js)

| Method | Endpoint | Payload | Description |
|---|---|---|---|
| `POST` | `/auth/send-otp` | `{ phoneNumber }` | Send OTP via Twilio |
| `POST` | `/auth/verify-otp` | `{ phoneNumber, otp }` | Verify OTP, login existing user |
| `POST` | `/auth/google-login` | `{ credential }` | Google OAuth, login/register |
| `POST` | `/auth/link-phone` | `{ phoneNumber, otp }` | Link phone to existing Google account |
| `POST` | `/auth/complete-signup` | `{ phone, name, city, ... }` | Complete profile after signup |
| `GET` | `/auth/me` | — | Get current authenticated user |
| `PUT` | `/auth/me` | `{ name, email, phone, profilePhoto }` | Update user profile |
| `POST` | `/auth/logout` | — | Invalidate session / clear cookie |

---

## Phone Verification Gating

Certain app features require `isPhoneVerified === true`. These are **not enforced by the router** but by individual UI components that check the auth context and open the `UnifiedAuthModal` (or a `PhoneVerifyModal`) if the condition isn't met.

Features that require a verified phone number:
- Contacting property owners
- Getting property directions
- Listing a property as a host

Users can still browse and save properties without a verified phone.

---

## Key Files

| File | Role |
|---|---|
| `frontend/src/context/AuthContext.jsx` | Global auth state, all auth functions, localStorage cache management |
| `frontend/src/api/authService.js` | Raw API calls for all auth endpoints |
| `frontend/src/components/Auth/UnifiedAuthModal.jsx` | Login modal UI: handles all 4 stages of both login flows |
| `frontend/src/components/Auth/PhoneAuthForm.jsx` | Standalone phone OTP form (used in `LoginForm.jsx` tab view) |
| `frontend/src/components/Auth/LoginForm.jsx` | Older tab-based login form (Email tab deprecated; Phone tab uses `PhoneAuthForm`) |
