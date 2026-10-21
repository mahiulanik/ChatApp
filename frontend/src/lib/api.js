import axios from "axios";

/** Shared axios client for the MessageX backend. */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
  withCredentials: true,
});

/** Bearer headers for routes protected by Clerk's authMiddleware. */
export function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default api;
