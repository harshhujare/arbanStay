# UrbanStay — Auth & Session Test Cases

Production URL: https://arbanstay.vercel.app

---

## 🔐 TC-01: Phone OTP Login — Happy Path

**Goal:** A registered user can log in via phone OTP and stay logged in.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open site (not logged in) | Navbar shows "Login / Sign up" |
| 2 | Click menu → "Log in or sign up" | Auth modal opens |
| 3 | Enter valid 10-digit phone number | Continue button enabled |
| 4 | Click Continue | OTP sent. Stage changes to OTP input |
| 5 | Enter correct 4-digit OTP | Modal closes. Navbar shows user name |
| 6 | Check `localStorage.getItem('urbanstay_user')` in console | Returns user JSON with correct data |
| 7 | Refresh page | User remains logged in (no flash of logged-out state) |

---

## 🔐 TC-02: Phone OTP Login — Wrong OTP

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter valid phone, click Continue | OTP stage shown |
| 2 | Enter wrong 4-digit OTP | Error: "Invalid OTP" displayed. User NOT logged in. |
| 3 | Try again with correct OTP | Login succeeds |

---

## 🔐 TC-03: Google OAuth Login — New User (No Phone)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open auth modal | Initial stage shown |
| 2 | Click "Continue with Google" | Google popup opens |
| 3 | Select a Google account | Account created/logged in. Stage changes to "Verify your phone number" |
| 4 | Click "Skip for now" | Modal closes. User IS logged in |
| 5 | Check navbar | Shows user's Google name |
| 6 | Refresh page | Still logged in |

---

## 🔐 TC-04: Google OAuth Login — Existing User with Phone

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open auth modal | Initial stage shown |
| 2 | Click "Continue with Google" | Google popup opens |
| 3 | Select account (already has phone verified) | Modal closes immediately. User logged in. |

---

## 🚪 TC-05: Logout — Immediate UI Update ✅ (Fixed)

**This was a bug — logout didn't update UI immediately.**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open site as a logged-in user | Navbar shows user name, logged-in menu items |
| 2 | Click menu → "Log out" | Dropdown closes instantly |
| 3 | Observe navbar | Immediately shows "Log in or sign up" — NO delay |
| 4 | Check current URL | Redirected to `/` (home page) |
| 5 | Check `localStorage.getItem('urbanstay_user')` | Returns `null` |
| 6 | Try navigating to `/account` or `/host/dashboard` | Redirected to `/` — access denied |

---

## 🔄 TC-06: Session Persistence on Page Refresh ✅ (Fixed)

**This was a bug — transient network errors caused logout.**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in successfully | User logged in |
| 2 | Hard refresh the page (Ctrl+Shift+R) | User still logged in |
| 3 | Open DevTools → Network → set throttle to "Slow 3G" | |
| 4 | Refresh page | User still logged in even if `/auth/me` is slow |
| 5 | Set network to "Offline" | Refresh: user still logged in (using cached state) |
| 6 | Set network back Online and refresh | User still logged in |

---

## 🛡️ TC-07: Admin Route Protection

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open site as a non-admin user | Logged in as regular user |
| 2 | Navigate to `/admin` | Redirected to `/` (home page) |
| 3 | Log in as admin account | Logged in |
| 4 | Navigate to `/admin` | Admin dashboard loads |
| 5 | Navigate to `/admin/users` | Users page loads |
| 6 | Log out | Redirected to `/`. Session cleared. |
| 7 | Navigate to `/admin` | Redirected to `/` |

---

## 🍪 TC-08: Cross-Origin Cookie (Production) ✅ (Fixed)

**This was a bug — missing Secure/SameSite attributes broke cookies on Render.**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in on https://arbanstay.vercel.app | Login succeeds |
| 2 | Open DevTools → Application → Cookies | Token cookie present with `Secure=true`, `SameSite=None` |
| 3 | Refresh page | Session persists (not logged out) |
| 4 | Open in a Private / Incognito window | Cookie set correctly, login works |

---

## 🔗 TC-09: Google + Phone Linking Flow

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in via Google (no phone) | Stage: "Verify your phone number" |
| 2 | Enter 10-digit phone, click "Verify Now" | OTP sent. Stage: OTP for linking |
| 3 | Enter 4-digit OTP | Phone linked. Modal closes. |
| 4 | Check `user.phoneVerified` in localStorage | `true` |

---

## ⏱️ TC-10: OTP Resend Timer

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter phone and click Continue | "Resend in 60s" timer shown |
| 2 | Observe timer | Counts down every second |
| 3 | At 0, click "Resend OTP" | New OTP sent. Timer resets to 60s |
| 4 | Click "Resend OTP" while timer is running | Button is disabled — no action |

---

## 🔒 TC-11: Protected Routes Without Login

| Route | Expected Behavior |
|-------|------------------|
| `/account` | Redirect to `/` |
| `/host/dashboard` | Redirect to `/` |
| `/host/dashboard/add-property` | Redirect to `/` |
| `/pricing` | Redirect to `/` |
| `/admin` | Redirect to `/` |
| `/admin/users` | Redirect to `/` |
| `/` | Loads normally |
| `/search` | Loads normally |
| `/property/:id` | Loads normally |

---

## 📱 TC-12: Mobile Bottom Nav — Auth Gating

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open site on mobile (or DevTools mobile view) | Bottom nav visible |
| 2 | Tap "Dashboard" (not logged in) | Auth modal pops up |
| 3 | Tap "Account" (not logged in) | Auth modal pops up |
| 4 | Tap "Explore" (not logged in) | Navigates to `/` |
| 5 | Log in | All nav items work correctly |

---

## ✅ Quick Smoke Test (Run Before Each Deploy)

```
1. Open https://arbanstay.vercel.app in fresh incognito window
2. ✅ Home page loads without errors
3. ✅ Login with phone OTP works
4. ✅ Refresh keeps session
5. ✅ Logout updates UI instantly and redirects to /
6. ✅ /admin is guarded (redirects if not admin)
7. ✅ Admin login works and dashboard loads
8. ✅ Property detail page loads without login required
```
