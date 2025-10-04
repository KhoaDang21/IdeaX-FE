import { api } from "../../constant/axiosInstance";
import {
  ACCOUNT_GET_BY_ID_ENDPOINT,
  ACCOUNT_GET_BY_ROLE_ENDPOINT,
  ACCOUNT_UPDATE_ENDPOINT,
  ACCOUNT_SET_STATUS_ENDPOINT,
  ACCOUNT_ADMIN_SET_STATUS_ENDPOINT,
  ACCOUNT_SOFT_DELETE_ENDPOINT,
  ACCOUNT_HARD_DELETE_ENDPOINT,
} from "../../constant/apiConfig";
import type {
  AccountResponse,
  AccountUpdateDTO,
} from "../../../interfaces/auth";

export const getAccountById = async (accountId: string) => {
  return (await api.get<AccountResponse>(ACCOUNT_GET_BY_ID_ENDPOINT(accountId)))
    .data;
};

export const getAccountsByRole = async (role: string) => {
  return (await api.get<AccountResponse[]>(ACCOUNT_GET_BY_ROLE_ENDPOINT(role)))
    .data;
};

export const updateAccount = async (
  accountId: string,
  payload: AccountUpdateDTO
) => {
  return (await api.put<string>(ACCOUNT_UPDATE_ENDPOINT(accountId), payload))
    .data;
};

// User sets their own status (status passed as query param)
export const setSelfStatus = async (accountId: string, status: string) => {
  return (await api.put<string>(ACCOUNT_SET_STATUS_ENDPOINT(accountId, status)))
    .data;
};

// Admin sets another user's status (requires adminId query param)
export const adminSetStatus = async (
  adminId: string,
  targetId: string,
  status: string
) => {
  return (
    await api.put<string>(
      ACCOUNT_ADMIN_SET_STATUS_ENDPOINT(
        String(adminId),
        String(targetId),
        status
      )
    )
  ).data;
};

export const softDeleteAccount = async (accountId: string) => {
  return (await api.delete<string>(ACCOUNT_SOFT_DELETE_ENDPOINT(accountId)))
    .data;
};

export const hardDeleteAccount = async (accountId: string) => {
  return (await api.delete<string>(ACCOUNT_HARD_DELETE_ENDPOINT(accountId)))
    .data;
};
