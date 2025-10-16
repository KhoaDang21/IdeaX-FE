import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import { message } from "antd";
import { api } from "../../constant/axiosInstance";
import {
  LOGIN_ENDPOINT,
  REGISTER_STARTUP_ENDPOINT,
  REGISTER_INVESTOR_ENDPOINT,
  STARTUP_PROFILE_GET_ENDPOINT,
  STARTUP_PROFILE_UPDATE_ENDPOINT,
  BASE_URL,
  INVESTOR_PROFILE_GET_ENDPOINT,
  INVESTOR_PROFILE_UPDATE_ENDPOINT,
} from "../../constant/apiConfig";
import type {
  AuthState,
  LoginCredentials,
  LoginResponse,
  StartupRegisterCredentials,
  InvestorRegisterCredentials,
  User,
  StartupProfileResponse,
} from "../../../interfaces/auth";

function normalizeRole(
  role: string | undefined
): "startup" | "investor" | "admin" {
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

// Khôi phục user từ localStorage nếu có
const getInitialUser = (): User | null => {
  try {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
};
const getInitialToken = (): string | null => {
  return localStorage.getItem("token");
};

const initialState: AuthState = {
  user: getInitialUser(),
  token: getInitialToken(),
  isAuthenticated: !!getInitialToken(),
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
    {
      rejectWithValue,
    }: { rejectWithValue: (value: { message: string }) => any }
  ) => {
    try {
      const response = await api.post(LOGIN_ENDPOINT, credentials);
      const data = response.data;
      // If backend returns a banned account, treat as failure
      if (data?.account?.status === "BANNED") {
        return rejectWithValue({ message: "Tài khoản của bạn đã bị khóa" });
      }
      return data;
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Đăng nhập thất bại";
      return rejectWithValue({ message });
    }
  }
);

export const registerStartup = createAsyncThunk<
  any,
  StartupRegisterCredentials,
  { rejectValue: { message: string } }
>(
  "auth/registerStartup",
  async (
    data: StartupRegisterCredentials,
    {
      rejectWithValue,
    }: { rejectWithValue: (value: { message: string }) => any }
  ) => {
    try {
      const response = await api.post(REGISTER_STARTUP_ENDPOINT, data);
      return response.data;
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Đăng ký startup thất bại";
      return rejectWithValue({ message });
    }
  }
);

export const registerInvestor = createAsyncThunk<
  any,
  InvestorRegisterCredentials,
  { rejectValue: { message: string } }
>(
  "auth/registerInvestor",
  async (
    data: InvestorRegisterCredentials,
    {
      rejectWithValue,
    }: { rejectWithValue: (value: { message: string }) => any }
  ) => {
    try {
      const response = await api.post(REGISTER_INVESTOR_ENDPOINT, data);
      return response.data;
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Đăng ký investor thất bại";
      return rejectWithValue({ message });
    }
  }
);

export const getStartupProfile = createAsyncThunk<
  StartupProfileResponse,
  string, // accountId
  { rejectValue: { message: string } }
>("auth/getStartupProfile", async (accountId, { rejectWithValue }) => {
  try {
    const response = await api.get(STARTUP_PROFILE_GET_ENDPOINT(accountId));
    return response.data;
  } catch (err: any) {
    const message =
      err.response?.data?.message ||
      err.message ||
      "Lấy thông tin profile thất bại";
    return rejectWithValue({ message });
  }
});

export const getInvestorProfile = createAsyncThunk<
  any,
  string,
  { rejectValue: { message: string } }
>("auth/getInvestorProfile", async (accountId, { rejectWithValue }) => {
  try {
    const response = await api.get(INVESTOR_PROFILE_GET_ENDPOINT(accountId));
    return response.data;
  } catch (err: any) {
    const message =
      err.response?.data?.message ||
      err.message ||
      "Lấy thông tin investor thất bại";
    return rejectWithValue({ message });
  }
});

export const updateInvestorProfile = createAsyncThunk<
  any,
  { accountId: string; profileData: any },
  { rejectValue: { message: string } }
>(
  "auth/updateInvestorProfile",
  async ({ accountId, profileData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        INVESTOR_PROFILE_UPDATE_ENDPOINT(accountId),
        profileData
      );
      return response.data;
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Cập nhật investor thất bại";
      return rejectWithValue({ message });
    }
  }
);

export const updateStartupProfile = createAsyncThunk<
  StartupProfileResponse,
  { accountId: string; profileData: Partial<StartupProfileResponse> },
  { rejectValue: { message: string } }
>(
  "auth/updateStartupProfile",
  async ({ accountId, profileData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        STARTUP_PROFILE_UPDATE_ENDPOINT(accountId),
        profileData
      );
      return response.data;
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Cập nhật profile thất bại";
      return rejectWithValue({ message });
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state: AuthState) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      message.success({ content: "Đăng xuất thành công", key: "logout" });
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
      .addCase(
        loginUser.fulfilled,
        (state: AuthState, action: { payload: LoginResponse }) => {
          state.loading = false;
          const backendAccount = action.payload.account;
          // If backend returns a banned account (extra safety), do not accept login
          if (backendAccount.status === "BANNED") {
            state.isAuthenticated = false;
            state.token = null;
            state.user = null;
            state.error = "Account is banned";
            // ensure localStorage is cleared
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // notify user via UI message immediately
            message.error("Tài khoản của bạn đã bị khóa (Banned)");
            return;
          }
          const startupProfile = action.payload.startupProfile;
          const investorProfile = action.payload.investorProfile;

          const normalizedUser: User = {
            id: String(backendAccount.id),
            email: backendAccount.email,
            fullName:
              startupProfile?.fullName || investorProfile?.fullName || "",
            role: normalizeRole(backendAccount.role as unknown as string),
            // Startup fields
            companyWebsite: startupProfile?.companyWebsite,
            profilePictureUrl: startupProfile?.profilePictureUrl
              ? startupProfile.profilePictureUrl.startsWith("http")
                ? startupProfile.profilePictureUrl
                : `${BASE_URL}${startupProfile.profilePictureUrl}`
              : undefined,
            companyLogo: startupProfile?.companyLogo,
            startupName: startupProfile?.startupName,
            industryCategory: startupProfile?.industryCategory,
            fundingStage: startupProfile?.fundingStage,
            location: startupProfile?.location,
            numberOfTeamMembers: startupProfile?.numberOfTeamMembers,
            aboutUs: startupProfile?.aboutUs,
            // Investor fields
            organization: investorProfile?.organization,
            investmentFocus: investorProfile?.investmentFocus,
            investmentRange: investorProfile?.investmentRange,
            investmentExperience: investorProfile?.investmentExperience,
            // map new investor fields; prefer investor values but allow startup-sourced phone/linkedIn
            country: (investorProfile as any)?.country,
            phoneNumber:
              investorProfile?.phoneNumber || startupProfile?.phoneNumber,
            linkedInProfile:
              (investorProfile as any)?.linkedInUrl ||
              startupProfile?.linkedInProfile,
            twoFactorEnabled:
              (investorProfile as any)?.twoFactorEnabled ?? undefined,
          };
          // no client-only country merge anymore; backend is authoritative

          state.user = normalizedUser;
          state.token = backendAccount.token || null;
          state.isAuthenticated = true;
          state.error = null;

          // Lưu vào localStorage để khôi phục khi F5
          localStorage.setItem("user", JSON.stringify(normalizedUser));
          if (backendAccount.token) {
            localStorage.setItem("token", backendAccount.token);
          }

          message.success("Đăng nhập thành công");
        }
      )
      .addCase(
        loginUser.rejected,
        (state: AuthState, action: { payload?: { message: string } }) => {
          state.loading = false;
          state.isAuthenticated = false;
          state.error = action.payload?.message || "Đăng nhập thất bại";
          message.error(state.error);
        }
      )
      .addCase(registerStartup.pending, (state: AuthState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerStartup.fulfilled, (state: AuthState) => {
        state.loading = false;
        state.error = null;
        message.success("Đăng ký startup thành công!");
      })
      .addCase(
        registerStartup.rejected,
        (state: AuthState, action: { payload?: { message: string } }) => {
          state.loading = false;
          state.error = action.payload?.message || "Đăng ký startup thất bại";
          message.error(state.error);
        }
      )
      .addCase(registerInvestor.pending, (state: AuthState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerInvestor.fulfilled, (state: AuthState) => {
        state.loading = false;
        state.error = null;
        message.success("Đăng ký investor thành công!");
      })
      .addCase(
        registerInvestor.rejected,
        (state: AuthState, action: { payload?: { message: string } }) => {
          state.loading = false;
          state.error = action.payload?.message || "Đăng ký investor thất bại";
          message.error(state.error);
        }
      )
      .addCase(getStartupProfile.pending, (state: AuthState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getStartupProfile.fulfilled,
        (state: AuthState, action: { payload: StartupProfileResponse }) => {
          state.loading = false;
          if (state.user) {
            // Cập nhật user với thông tin profile mới
            state.user = {
              ...state.user,
              fullName: action.payload.fullName || state.user.fullName,
              phoneNumber: action.payload.phoneNumber,
              linkedInProfile: action.payload.linkedInProfile,
              companyWebsite: action.payload.companyWebsite,
              profilePictureUrl: action.payload.profilePictureUrl
                ? action.payload.profilePictureUrl.startsWith("http")
                  ? action.payload.profilePictureUrl
                  : `${BASE_URL}${action.payload.profilePictureUrl}`
                : undefined,
              companyLogo: action.payload.companyLogo,
              startupName: action.payload.startupName,
              industryCategory: action.payload.industryCategory,
              fundingStage: action.payload.fundingStage,
              location: action.payload.location,
              numberOfTeamMembers: action.payload.numberOfTeamMembers,
              aboutUs: action.payload.aboutUs,
            };
          }
          state.error = null;
        }
      )
      .addCase(
        getStartupProfile.rejected,
        (state: AuthState, action: { payload?: { message: string } }) => {
          state.loading = false;
          state.error =
            action.payload?.message || "Lấy thông tin profile thất bại";
          message.error(state.error);
        }
      )
      .addCase(updateStartupProfile.pending, (state: AuthState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateStartupProfile.fulfilled,
        (state: AuthState, action: { payload: StartupProfileResponse }) => {
          state.loading = false;
          if (state.user) {
            // Cập nhật user với thông tin profile mới
            state.user = {
              ...state.user,
              fullName: action.payload.fullName || state.user.fullName,
              phoneNumber: action.payload.phoneNumber,
              linkedInProfile: action.payload.linkedInProfile,
              companyWebsite: action.payload.companyWebsite,
              profilePictureUrl: action.payload.profilePictureUrl
                ? action.payload.profilePictureUrl.startsWith("http")
                  ? action.payload.profilePictureUrl
                  : `${BASE_URL}${action.payload.profilePictureUrl}`
                : undefined,
              companyLogo: action.payload.companyLogo,
              startupName: action.payload.startupName,
              industryCategory: action.payload.industryCategory,
              fundingStage: action.payload.fundingStage,
              location: action.payload.location,
              numberOfTeamMembers: action.payload.numberOfTeamMembers,
              aboutUs: action.payload.aboutUs,
            };
          }
          state.error = null;
          message.success("Cập nhật profile thành công");
        }
      )
      .addCase(
        updateStartupProfile.rejected,
        (state: AuthState, action: { payload?: { message: string } }) => {
          state.loading = false;
          state.error = action.payload?.message || "Cập nhật profile thất bại";
          message.error(state.error);
        }
      );

    // Investor profile handlers
    builder.addCase(getInvestorProfile.pending, (state: AuthState) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(
      getInvestorProfile.fulfilled,
      (state: AuthState, action: { payload: any }) => {
        state.loading = false;
        if (state.user) {
          state.user = {
            ...state.user,
            fullName: action.payload.fullName || state.user.fullName,
            phoneNumber: action.payload.phoneNumber || state.user.phoneNumber,
            organization:
              action.payload.organization || state.user.organization,
            investmentFocus:
              action.payload.investmentFocus || state.user.investmentFocus,
            investmentRange:
              action.payload.investmentRange || state.user.investmentRange,
            investmentExperience:
              action.payload.investmentExperience ||
              state.user.investmentExperience,
            profilePictureUrl: action.payload.profilePictureUrl
              ? action.payload.profilePictureUrl.startsWith("http")
                ? action.payload.profilePictureUrl
                : `${BASE_URL}${action.payload.profilePictureUrl}`
              : state.user.profilePictureUrl,
            // include country and linkedInUrl returned by server
            country: action.payload.country || state.user.country,
            linkedInProfile:
              action.payload.linkedInUrl || state.user.linkedInProfile,
            twoFactorEnabled:
              action.payload.twoFactorEnabled ?? state.user?.twoFactorEnabled,
          };
          localStorage.setItem("user", JSON.stringify(state.user));
        }
        state.error = null;
      }
    );

    builder.addCase(
      getInvestorProfile.rejected,
      (state: AuthState, action: { payload?: { message: string } }) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Lấy thông tin investor thất bại";
        message.error(state.error);
      }
    );

    builder.addCase(updateInvestorProfile.pending, (state: AuthState) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(
      updateInvestorProfile.fulfilled,
      (state: AuthState, action: { payload: any }) => {
        state.loading = false;
        if (state.user) {
          state.user = {
            ...state.user,
            fullName: action.payload.fullName || state.user.fullName,
            phoneNumber: action.payload.phoneNumber || state.user.phoneNumber,
            organization:
              action.payload.organization || state.user.organization,
            investmentFocus:
              action.payload.investmentFocus || state.user.investmentFocus,
            investmentRange:
              action.payload.investmentRange || state.user.investmentRange,
            investmentExperience:
              action.payload.investmentExperience ||
              state.user.investmentExperience,
            country: action.payload.country || state.user.country,
            linkedInProfile:
              action.payload.linkedInUrl || state.user.linkedInProfile,
            twoFactorEnabled:
              action.payload.twoFactorEnabled ?? state.user?.twoFactorEnabled,
          };
          localStorage.setItem("user", JSON.stringify(state.user));
        }
        state.error = null;
        message.success("Cập nhật profile investor thành công");
      }
    );

    builder.addCase(
      updateInvestorProfile.rejected,
      (state: AuthState, action: { payload?: { message: string } }) => {
        state.loading = false;
        state.error = action.payload?.message || "Cập nhật investor thất bại";
        message.error(state.error);
      }
    );
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
