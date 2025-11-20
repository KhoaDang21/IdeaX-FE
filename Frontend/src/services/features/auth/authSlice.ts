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
      // Dùng `api.post` thay vì axios
      const response = await api.post(LOGIN_ENDPOINT, credentials);
      const data = response.data;
      if (data?.account?.status === "BANNED") {
        return rejectWithValue({ message: "Your account has been locked" });
      }
      return data;
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Login failed";
      return rejectWithValue({ message });
    }
  }
);

export const registerStartup = createAsyncThunk<
  any,
  FormData,
  { rejectValue: { message: string } }
>(
  "auth/registerStartup",
  async (
    data: FormData,
    {
      rejectWithValue,
    }: { rejectWithValue: (value: { message: string }) => any }
  ) => {
    try {
      const response = await api.post(REGISTER_STARTUP_ENDPOINT, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Startup registration failed";
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
        "Investor registration failed";
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
      "Failed to fetch profile information";
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
      "Failed to fetch investor information";
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
        "Investor profile update failed";
      return rejectWithValue({ message });
    }
  }
);

export const updateStartupProfile = createAsyncThunk<
  StartupProfileResponse,
  { accountId: string; profileData: FormData },
  { rejectValue: { message: string } }
>(
  "auth/updateStartupProfile",
  async ({ accountId, profileData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        STARTUP_PROFILE_UPDATE_ENDPOINT(accountId),
        profileData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
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
      message.success({ content: "Logged out successfully", key: "logout" });
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

          if (backendAccount.status === "BANNED") {
            return;
          }

          const startupProfile = action.payload.startupProfile;
          const investorProfile = action.payload.investorProfile;

          // Ép kiểu `any` để lấy các trường BE trả về (projectLimit/walletBalance)
          const backendAccountData = backendAccount as any;

          const normalizedUser: User = {
            id: String(backendAccount.id),
            email: backendAccount.email,
            fullName:
              startupProfile?.fullName || investorProfile?.fullName || "",
            role: normalizeRole(backendAccount.role as unknown as string),
            
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
            organization: investorProfile?.organization,
            investmentFocus: investorProfile?.investmentFocus,
            investmentRange: investorProfile?.investmentRange,
            investmentExperience: investorProfile?.investmentExperience,
            country: (investorProfile as any)?.country,
            phoneNumber:
              investorProfile?.phoneNumber || startupProfile?.phoneNumber,
            linkedInProfile:
              (investorProfile as any)?.linkedInUrl ||
              startupProfile?.linkedInProfile,
            twoFactorEnabled:
              (investorProfile as any)?.twoFactorEnabled ?? undefined,

            // [QUAN TRỌNG] Lấy projectLimit và walletBalance khi Login
            projectLimit: backendAccountData.projectLimit ?? 2,
            walletBalance: backendAccountData.walletBalance ?? 0,
          };

          state.user = normalizedUser;
          state.token = backendAccount.token || null;
          state.isAuthenticated = true;
          state.error = null;

          localStorage.setItem("user", JSON.stringify(normalizedUser));
          if (backendAccount.token) {
            localStorage.setItem("token", backendAccount.token);
          }

          message.success("Login successful");
        }
      )
      .addCase(
        loginUser.rejected,
        (state: AuthState, action: { payload?: { message: string } }) => {
          state.loading = false;
          state.isAuthenticated = false;
          state.error = action.payload?.message || "Login failed";
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
        message.success("Startup registration successful!");
      })
      .addCase(
        registerStartup.rejected,
        (state: AuthState, action: { payload?: { message: string } }) => {
          state.loading = false;
          state.error =
            action.payload?.message || "Startup registration failed";
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
        message.success("Investor registration successful!");
      })
      .addCase(
        registerInvestor.rejected,
        (state: AuthState, action: { payload?: { message: string } }) => {
          state.loading = false;
          state.error =
            action.payload?.message || "Investor registration failed";
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
            const profileData = action.payload as any;

            state.user = {
              ...state.user,
              fullName: profileData.fullName || state.user.fullName,
              phoneNumber: profileData.phoneNumber,
              linkedInProfile: profileData.linkedInProfile,
              companyWebsite: profileData.companyWebsite,
              profilePictureUrl: profileData.profilePictureUrl
                ? profileData.profilePictureUrl.startsWith("http")
                  ? profileData.profilePictureUrl
                  : `${BASE_URL}${profileData.profilePictureUrl}`
                : undefined,
              companyLogo: profileData.companyLogo,
              startupName: profileData.startupName,
              industryCategory: profileData.industryCategory,
              fundingStage: profileData.fundingStage,
              location: profileData.location,
              numberOfTeamMembers: profileData.numberOfTeamMembers,
              aboutUs: profileData.aboutUs,

              // [QUAN TRỌNG] Cập nhật projectLimit khi refresh profile
              projectLimit:
                profileData.projectLimit ?? state.user.projectLimit ?? 2,
              walletBalance:
                profileData.walletBalance ?? state.user.walletBalance ?? 0,
            };

            localStorage.setItem("user", JSON.stringify(state.user));
          }
          state.error = null;
        }
      )
      .addCase(
        getStartupProfile.rejected,
        (state: AuthState, action: { payload?: { message: string } }) => {
          state.loading = false;
          state.error =
            action.payload?.message || "Failed to fetch profile information";
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
            const profileData = action.payload as any;

            state.user = {
              ...state.user,
              fullName: profileData.fullName || state.user.fullName,
              phoneNumber: profileData.phoneNumber,
              linkedInProfile: profileData.linkedInProfile,
              companyWebsite: profileData.companyWebsite,
              profilePictureUrl: profileData.profilePictureUrl
                ? profileData.profilePictureUrl.startsWith("http")
                  ? profileData.profilePictureUrl
                  : `${BASE_URL}${profileData.profilePictureUrl}`
                : undefined,
              companyLogo: profileData.companyLogo,
              startupName: profileData.startupName,
              industryCategory: profileData.industryCategory,
              fundingStage: profileData.fundingStage,
              location: profileData.location,
              numberOfTeamMembers: profileData.numberOfTeamMembers,
              aboutUs: profileData.aboutUs,

              // [BẢO VỆ] Đảm bảo không bị mất Limit khi update profile
              projectLimit:
                profileData.projectLimit ?? state.user.projectLimit ?? 2,
              walletBalance:
                profileData.walletBalance ?? state.user.walletBalance ?? 0,
            };

            localStorage.setItem("user", JSON.stringify(state.user));
          }
          state.error = null;
          message.success("Profile updated successfully");
        }
      )
      .addCase(
        updateStartupProfile.rejected,
        (state: AuthState, action: { payload?: { message: string } }) => {
          state.loading = false;
          state.error = action.payload?.message || "Profile update failed";
          message.error(state.error);
        }
      )

      // Investor profile handlers
      .addCase(getInvestorProfile.pending, (state: AuthState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
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
              country: action.payload.country || state.user.country,
              linkedInProfile:
                action.payload.linkedInUrl || state.user.linkedInProfile,
              twoFactorEnabled:
                action.payload.twoFactorEnabled ?? state.user?.twoFactorEnabled,

              // [QUAN TRỌNG] Cập nhật cho Investor
              projectLimit:
                action.payload.projectLimit ?? state.user.projectLimit ?? 2,
              walletBalance:
                action.payload.walletBalance ?? state.user.walletBalance ?? 0,
            };

            localStorage.setItem("user", JSON.stringify(state.user));
          }
          state.error = null;
        }
      )
      .addCase(
        getInvestorProfile.rejected,
        (state: AuthState, action: { payload?: { message: string } }) => {
          state.loading = false;
          state.error =
            action.payload?.message || "Failed to fetch investor information";
          message.error(state.error);
        }
      )
      .addCase(updateInvestorProfile.pending, (state: AuthState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
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

              // [BẢO VỆ] Cập nhật cho Investor
              projectLimit:
                action.payload.projectLimit ?? state.user.projectLimit ?? 2,
              walletBalance:
                action.payload.walletBalance ?? state.user.walletBalance ?? 0,
            };

            localStorage.setItem("user", JSON.stringify(state.user));
          }
          state.error = null;
          message.success("Investor profile updated successfully");
        }
      )
      .addCase(
        updateInvestorProfile.rejected,
        (state: AuthState, action: { payload?: { message: string } }) => {
          state.loading = false;
          state.error =
            action.payload?.message || "Investor profile update failed";
          message.error(state.error);
        }
      );
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;