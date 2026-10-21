import axios from "axios";

/**
 * Shared axios client for the MessageX backend.
 *
 * Same-origin by default — no hardcoded host:
 *  - local dev:  relative /api/* goes through Vite's dev proxy → :4000
 *  - production: the backend serves this frontend itself (monolith build)
 * Set VITE_API_URL only if you host the frontend separately.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  withCredentials: true,
});

/** Bearer headers for routes protected by Clerk's authMiddleware. */
export function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default api;
