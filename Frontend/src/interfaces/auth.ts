export type UserRole = "startup" | "investor" | "admin";

// Backend enum values come as uppercase like START_UP, INVESTOR, ADMIN
export type BackendRole = "START_UP" | "INVESTOR" | "ADMIN";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  // Startup fields
  phoneNumber?: string;
  linkedInProfile?: string;
  companyWebsite?: string;
  country?: string;
  profilePictureUrl?: string;
  companyLogo?: string;
  startupName?: string;
  industryCategory?: string;
  fundingStage?: string;
  location?: string;
  numberOfTeamMembers?: number;
  aboutUs?: string;
  // Investor fields
  organization?: string;
  investmentFocus?: string;
  investmentRange?: string;
  investmentExperience?: string;
  twoFactorEnabled?: boolean;
  projectLimit: number;
  walletBalance: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface StartupRegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  startupName: string;
  companyWebsite?: string;
  companyLogo?: File | string;
  aboutUs?: string;
}

export interface InvestorRegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  organization?: string;
  investmentFocus?: string;
  customInvestmentFocus?: string;
  investmentRange?: string;
  investmentExperience?: string;
}

export interface StartupProfileResponse {
  id?: number;
  fullName: string;
  phoneNumber?: string;
  linkedInProfile?: string;
  companyWebsite?: string;
  profilePictureUrl?: string;
  companyLogo?: string;
  startupName?: string;
  industryCategory?: string;
  fundingStage?: string;
  location?: string;
  numberOfTeamMembers?: number;
  aboutUs?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvestorProfileResponse {
  fullName: string;
  organization?: string;
  investmentFocus?: string;
  investmentRange?: string;
  investmentExperience?: string;
  // new fields returned by backend
  country?: string;
  phoneNumber?: string;
  linkedInUrl?: string;
  twoFactorEnabled?: boolean;
}

export interface LoginResponse {
  account: {
    id: number;
    email: string;
    role: BackendRole;
    status: string;
    token: string;
  };
  startupProfile?: StartupProfileResponse;
  investorProfile?: InvestorProfileResponse;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Account DTOs / responses matching backend
export type Role = "ADMIN" | "START_UP" | "INVESTOR";
export type Status = "ACTIVE" | "INACTIVE" | "DELETED";

export interface AccountResponse {
  id: number | string;
  email: string;
  role: Role;
  status: Status;
  token?: string | null;
  createdAt?: string;
}

export interface AccountCreateDTO {
  email: string;
  password: string;
  role: Role;
  status: Status;
}

export interface AccountUpdateDTO {
  email?: string;
  password?: string;
  status?: Status;
  role?: Role;
}
