# UrbanStay Admin Panel — 2-Phase Implementation Plan

This plan adds a fully embedded admin panel to the existing React + Express codebase. It reuses the current auth system (`protect` + [authorize](file:///c:/Documents/sold_projects/UrbanStay-1/backend/middleware/auth.js#49-71) middleware), TailwindCSS design system, Recharts, and Lucide icons — no new dependencies needed.

> [!IMPORTANT]
> **One prerequisite before starting either phase:** The `role` enum in [User.js](file:///c:/Documents/sold_projects/UrbanStay-1/backend/Models/User.js) only has `"guest"` and `"host"`. We must add `"admin"` to it first. After doing so, one user's role in MongoDB must be manually set to `"admin"` to get access to the panel.

---

## Phase 1 — Foundation: Auth + Dashboard + User Management

**Goal:** Get the admin panel skeleton running with real stats and full user control.

---

### Backend — Foundation

#### [MODIFY] [User.js](file:///c:/Documents/sold_projects/UrbanStay-1/backend/Models/User.js)
- Add `"admin"` to the `role` enum: `["guest", "host", "admin"]`
- No other schema changes needed

#### [NEW] [adminRoutes.js](file:///c:/Documents/sold_projects/UrbanStay-1/backend/Routes/adminRoutes.js)
All routes use `protect, authorize("admin")` middleware chain (reusing existing [auth.js](file:///c:/Documents/sold_projects/UrbanStay-1/backend/test-auth.js)).
```
GET  /api/admin/stats           → platform-wide counts + booking totals
GET  /api/admin/users           → paginated list, filterable by role/accountType/city
GET  /api/admin/users/:id       → single user detail with their properties + bookings
PATCH /api/admin/users/:id      → update role, accountType, or suspend
DELETE /api/admin/users/:id     → hard delete user
```

#### [NEW] [adminController.js](file:///c:/Documents/sold_projects/UrbanStay-1/backend/Controllers/adminController.js)
- `getStats`: MongoDB aggregations for total users, hosts, properties, bookings, revenue
- `getUsers`: Paginated query with role/accountType/city filters + search by name/phone
- `getUserById`: Populate user with their listed properties and recent bookings
- `updateUser`: Partial update (role, accountType)
- `deleteUser`: Remove user + cascade-delete their properties and bookings

#### [MODIFY] [index.js](file:///c:/Documents/sold_projects/UrbanStay-1/backend/index.js)
- Mount admin routes: `app.use("/api/admin", adminRoutes)`

---

### Frontend — Foundation

#### [MODIFY] [AuthContext.jsx](file:///c:/Documents/sold_projects/UrbanStay-1/frontend/src/context/AuthContext.jsx)
- Add `isAdmin` computed boolean: `user?.role === "admin"`
- Expose it from context so any component can use it

#### [NEW] [AdminRoute.jsx](file:///c:/Documents/sold_projects/UrbanStay-1/frontend/src/components/Auth/AdminRoute.jsx)
- Extends `ProtectedRoute` — redirects to `/` if `isAdmin` is false

#### [NEW] [AdminLayout.jsx](file:///c:/Documents/sold_projects/UrbanStay-1/frontend/src/components/Admin/AdminLayout.jsx)
- Sidebar with navigation links (Dashboard, Users, Properties, Bookings)
- Collapses to icon-only on mobile
- Separate from the main `Navbar` — admin pages hide the regular navbar

#### [NEW] [AdminDashboard.jsx](file:///c:/Documents/sold_projects/UrbanStay-1/frontend/src/pages/Admin/AdminDashboard.jsx)
- Stat cards: Total Users, Total Properties, Total Bookings, Total Revenue
- Bar chart (Recharts): Bookings by month
- Pie chart (Recharts): Booking status breakdown (pending/confirmed/rejected/cancelled)
- Recent signups list

#### [NEW] [AdminUsersPage.jsx](file:///c:/Documents/sold_projects/UrbanStay-1/frontend/src/pages/Admin/AdminUsersPage.jsx)
- Searchable, filterable table (role, accountType)
- Actions per row: View details, Change role, Upgrade/downgrade account, Delete
- User detail modal: shows profile + their properties + last 5 bookings

#### [NEW] [adminApi.js](file:///c:/Documents/sold_projects/UrbanStay-1/frontend/src/api/adminApi.js)
- Axios functions for all admin API calls

#### [MODIFY] [App.jsx](file:///c:/Documents/sold_projects/UrbanStay-1/frontend/src/App.jsx)
- Add `/admin` routes wrapped in `AdminRoute`:
  ```
  /admin            → AdminDashboard
  /admin/users      → AdminUsersPage
  ```
- Hide main `Navbar` on `/admin/*` paths

---

## Phase 2 — Property & Booking Management

**Goal:** Give admin full oversight and moderation control over listings and bookings.

---

### Backend — Phase 2

#### [MODIFY] [Property.js](file:///c:/Documents/sold_projects/UrbanStay-1/backend/Models/Property.js)
- Add `adminStatus` field:
  ```js
  adminStatus: {
    type: String,
    enum: ["active", "suspended", "pending_review"],
    default: "active"
  }
  ```

#### [MODIFY] [adminRoutes.js](file:///c:/Documents/sold_projects/UrbanStay-1/backend/Routes/adminRoutes.js)
Add property + booking routes:
```
GET   /api/admin/properties          → paginated, filterable by city/status/host
PATCH /api/admin/properties/:id      → set adminStatus (active/suspended)
DELETE /api/admin/properties/:id     → hard delete listing
GET   /api/admin/bookings            → all bookings, filterable by status/date range
PATCH /api/admin/bookings/:id        → override booking status
```

#### [MODIFY] [adminController.js](file:///c:/Documents/sold_projects/UrbanStay-1/backend/Controllers/adminController.js)
- `getProperties`: Paginated + filtered query with host populate
- `updatePropertyStatus`: Set `adminStatus`
- `deleteProperty`: Remove property + cancel its pending bookings
- `getBookings`: Paginated query with status/date filters, populate guest + host + property
- `updateBookingStatus`: Override status with admin reason

---

### Frontend — Phase 2

#### [NEW] [AdminPropertiesPage.jsx](file:///c:/Documents/sold_projects/UrbanStay-1/frontend/src/pages/Admin/AdminPropertiesPage.jsx)
- Filterable table (city, status, rent type)
- Property card preview on row click (images, amenities, host info)
- Actions: Suspend, Restore, Delete

#### [NEW] [AdminBookingsPage.jsx](file:///c:/Documents/sold_projects/UrbanStay-1/frontend/src/pages/Admin/AdminBookingsPage.jsx)
- Filterable table (status, date range)
- Shows guest name, property name, host name, dates, total price, status badge
- Actions: Override status (confirm / cancel)

#### [MODIFY] [App.jsx](file:///c:/Documents/sold_projects/UrbanStay-1/frontend/src/App.jsx)
- Add routes:
  ```
  /admin/properties → AdminPropertiesPage
  /admin/bookings   → AdminBookingsPage
  ```

---

## Verification Plan

### Phase 1 Verification

**Backend manual tests (using browser or API tool like Thunder Client):**

1. Login with a non-admin user → call `GET /api/admin/stats` → expect `403 Forbidden`
2. Set a test user's role to `"admin"` in MongoDB → login → call `GET /api/admin/stats` → expect stats JSON
3. Call `GET /api/admin/users` → confirm paginated user list returns
4. Call `PATCH /api/admin/users/:id` with `{ "role": "host" }` → confirm role updates in DB

**Frontend browser tests:**

5. Navigate to `/admin` as a non-admin user → should redirect to `/`
6. Navigate to `/admin` as an admin user → Dashboard page loads with stat cards and charts
7. Navigate to `/admin/users` → user table loads, search + filter works, role change action works

### Phase 2 Verification

**Backend manual tests:**

8. Call `PATCH /api/admin/properties/:id` with `{ "adminStatus": "suspended" }` → confirm field updates
9. Call `GET /api/admin/bookings?status=pending` → returns only pending bookings
10. Call `PATCH /api/admin/bookings/:id` with `{ "status": "cancelled" }` → status overrides correctly

**Frontend browser tests:**

11. Navigate to `/admin/properties` → table loads with suspend/restore/delete actions
12. Suspend a property → `adminStatus` changes to `"suspended"`, badge updates in UI
13. Navigate to `/admin/bookings` → filter by `confirmed` → only confirmed bookings show
14. Override a booking status from the UI → confirm the change reflects immediately
