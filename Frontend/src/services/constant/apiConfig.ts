export const BASE_URL = "http://localhost:8081";
// export const BASE_URL = "https://ideax-backend.onrender.com";

// Auth endpoints
export const LOGIN_ENDPOINT = `${BASE_URL}/auth/login`;
export const REGISTER_STARTUP_ENDPOINT = `${BASE_URL}/auth/register/startup`;
export const REGISTER_INVESTOR_ENDPOINT = `${BASE_URL}/auth/register/investor`;

// Profile endpoints (sử dụng API hiện có với accountId)
export const STARTUP_PROFILE_GET_ENDPOINT = (accountId: string) =>
  `${BASE_URL}/startup/profile/${accountId}`;
export const STARTUP_PROFILE_UPDATE_ENDPOINT = (accountId: string) =>
  `${BASE_URL}/startup/profile/${accountId}`;
export const STARTUP_PROFILE_UPLOAD_ENDPOINT = (accountId: string) =>
  `${BASE_URL}/startup/profile/${accountId}/upload`;

// Investor profile endpoints
export const INVESTOR_PROFILE_GET_ENDPOINT = (accountId: string) =>
  `${BASE_URL}/investor/profile/${accountId}`;
export const INVESTOR_PROFILE_UPDATE_ENDPOINT = (accountId: string) =>
  `${BASE_URL}/investor/profile/${accountId}`;

// Account management endpoints (matching backend /accounts controller)
export const ACCOUNT_GET_BY_ID_ENDPOINT = (accountId: string) =>
  `${BASE_URL}/accounts/${accountId}`;
export const ACCOUNT_GET_BY_ROLE_ENDPOINT = (role: string) =>
  `${BASE_URL}/accounts/role/${role}`;
export const ACCOUNT_UPDATE_ENDPOINT = (accountId: string) =>
  `${BASE_URL}/accounts/${accountId}`;
export const ACCOUNT_SET_STATUS_ENDPOINT = (
  accountId: string,
  status: string
) => `${BASE_URL}/accounts/${accountId}/status?status=${status}`;
export const ACCOUNT_ADMIN_SET_STATUS_ENDPOINT = (
  adminId: string,
  targetId: string,
  status: string
) =>
  `${BASE_URL}/accounts/admin/${targetId}/status?status=${status}&adminId=${adminId}`;
export const ACCOUNT_SOFT_DELETE_ENDPOINT = (accountId: string) =>
  `${BASE_URL}/accounts/${accountId}/soft`;
export const ACCOUNT_HARD_DELETE_ENDPOINT = (accountId: string) =>
  `${BASE_URL}/accounts/${accountId}/hard`;
