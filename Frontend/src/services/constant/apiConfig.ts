export const BASE_URL = "http://localhost:8081";

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
