import apiClient from "./config";

const BASE = "/admin"; // apiClient already prefixes with `/api`

// ── Dashboard ────────────────────────────────────────────
export const getAdminStats = () =>
  apiClient.get(`${BASE}/stats`).then((data) => data.data);

// ── Users ────────────────────────────────────────────────
export const getAdminUsers = (params = {}) => {
  const query = new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined)).toString();
  return apiClient.get(`${BASE}/users${query ? `?${query}` : ""}`);
};

export const getAdminUser = (id) =>
  apiClient.get(`${BASE}/users/${id}`).then((data) => data.data);

export const updateAdminUser = (id, updates) =>
  apiClient.request(`${BASE}/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  }).then((data) => data.data);

export const deleteAdminUser = (id) =>
  apiClient.delete(`${BASE}/users/${id}`);

// ── Properties ───────────────────────────────────────────
export const getAdminProperties = (params = {}) => {
  const query = new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined)).toString();
  return apiClient.get(`${BASE}/properties${query ? `?${query}` : ""}`);
};

export const updateAdminPropertyStatus = (id, adminStatus) =>
  apiClient.request(`${BASE}/properties/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ adminStatus }),
  }).then((data) => data.data);

export const deleteAdminProperty = (id) =>
  apiClient.delete(`${BASE}/properties/${id}`);

// ── Bookings ─────────────────────────────────────────────
export const getAdminBookings = (params = {}) => {
  const query = new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined)).toString();
  return apiClient.get(`${BASE}/bookings${query ? `?${query}` : ""}`);
};

export const updateAdminBookingStatus = (id, status) =>
  apiClient.request(`${BASE}/bookings/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  }).then((data) => data.data);

// ── Transactions ─────────────────────────────────────────
export const getAdminTransactions = (params = {}) => {
  const query = new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined)).toString();
  return apiClient.get(`${BASE}/transactions${query ? `?${query}` : ""}`);
};

// ── Reviews ──────────────────────────────────────────────
export const getAdminReviews = (params = {}) => {
  const query = new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined)).toString();
  return apiClient.get(`${BASE}/reviews${query ? `?${query}` : ""}`);
};

export const deleteAdminReview = (id) =>
  apiClient.delete(`${BASE}/reviews/${id}`);

// ── CSV Exports ───────────────────────────────────────────
export const downloadCSV = (entity) => {
  // Opens a new tab to trigger the browser's native file download
  const url = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}${BASE}/export/${entity}`;
  const a = document.createElement("a");
  a.href = url;
  a.download = `${entity}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
