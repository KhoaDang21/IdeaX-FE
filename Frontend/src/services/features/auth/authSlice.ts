import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import { message } from "antd";
import { api } from "../../constant/axiosInstance";
import {
  LOGIN_ENDPOINT,
  REGISTER_STARTUP_ENDPOINT,
  REGISTER_INVESTOR_ENDPOINT,
} from "../../constant/apiConfig";
import type {
  AuthState,
  LoginCredentials,
  LoginResponse,
  StartupRegisterCredentials,
  InvestorRegisterCredentials,
  User,
} from "../../../interfaces/auth";

function normalizeRole(role: string | undefined): "startup" | "investor" | "admin" {
  switch (role) {
    case "START_UP":
      return "startup";
    case "INVESTOR":
      return "investor";
    case "ADMIN":
      return "admin";
    default:
      return "startup";
  }
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginCredentials,
  { rejectValue: { message: string } }
>(
  "auth/loginUser",
  async (
    credentials: LoginCredentials,
    { rejectWithValue }: { rejectWithValue: (value: { message: string }) => any }
  ) => {
  try {
    const response = await api.post(LOGIN_ENDPOINT, credentials);
    return response.data;
  } catch (err: any) {
    const message =
      err.response?.data?.message || err.message || "Đăng nhập thất bại";
    return rejectWithValue({ message });
  }
});

export const registerStartup = createAsyncThunk<
  any,
  StartupRegisterCredentials,
  { rejectValue: { message: string } }
>(
  "auth/registerStartup",
  async (
    data: StartupRegisterCredentials,
    { rejectWithValue }: { rejectWithValue: (value: { message: string }) => any }
  ) => {
  try {
    const response = await api.post(REGISTER_STARTUP_ENDPOINT, data);
    return response.data;
  } catch (err: any) {
    const message =
      err.response?.data?.message || err.message || "Đăng ký startup thất bại";
    return rejectWithValue({ message });
  }
});

export const registerInvestor = createAsyncThunk<
  any,
  InvestorRegisterCredentials,
  { rejectValue: { message: string } }
>(
  "auth/registerInvestor",
  async (
    data: InvestorRegisterCredentials,
    { rejectWithValue }: { rejectWithValue: (value: { message: string }) => any }
  ) => {
  try {
    const response = await api.post(REGISTER_INVESTOR_ENDPOINT, data);
    return response.data;
  } catch (err: any) {
    const message =
      err.response?.data?.message || err.message || "Đăng ký investor thất bại";
    return rejectWithValue({ message });
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state: AuthState) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      message.success("Đăng xuất thành công");
    },
    clearError: (state: AuthState) => {
      state.error = null;
    },
    setUser: (state: AuthState, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<AuthState>) => {
    builder
      .addCase(loginUser.pending, (state: AuthState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state: AuthState, action: { payload: LoginResponse }) => {
        state.loading = false;
        const backendAccount = action.payload.account;
        const normalizedUser: User = {
          id: String(backendAccount.id),
          email: backendAccount.email,
          fullName: "",
          role: normalizeRole(backendAccount.role as unknown as string),
        };
        state.user = normalizedUser;
        state.token = backendAccount.token || null;
        state.isAuthenticated = true;
        state.error = null;
        localStorage.setItem("user", JSON.stringify(normalizedUser));
        if (backendAccount.token) {
          localStorage.setItem("token", backendAccount.token);
        }
        message.success("Đăng nhập thành công");
      })
      .addCase(loginUser.rejected, (state: AuthState, action: { payload?: { message: string } }) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload?.message || "Đăng nhập thất bại";
        message.error(state.error);
      })
      .addCase(registerStartup.pending, (state: AuthState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerStartup.fulfilled, (state: AuthState) => {
        state.loading = false;
        state.error = null;
        message.success("Đăng ký startup thành công!");
      })
      .addCase(registerStartup.rejected, (state: AuthState, action: { payload?: { message: string } }) => {
        state.loading = false;
        state.error = action.payload?.message || "Đăng ký startup thất bại";
        message.error(state.error);
      })
      .addCase(registerInvestor.pending, (state: AuthState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerInvestor.fulfilled, (state: AuthState) => {
        state.loading = false;
        state.error = null;
        message.success("Đăng ký investor thành công!");
      })
      .addCase(registerInvestor.rejected, (state: AuthState, action: { payload?: { message: string } }) => {
        state.loading = false;
        state.error = action.payload?.message || "Đăng ký investor thất bại";
        message.error(state.error);
      });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
