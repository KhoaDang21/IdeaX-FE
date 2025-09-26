export type UserRole = "startup" | "investor" | "admin";

// Backend enum values come as uppercase like START_UP, INVESTOR, ADMIN
export type BackendRole = "START_UP" | "INVESTOR" | "ADMIN";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  startupName?: string;
  companyWebsite?: string;
  companyLogo?: string;
  aboutUs?: string;
  organization?: string;
  investmentFocus?: string;
  investmentRange?: string;
  investmentExperience?: string;
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
  companyLogo?: string;
  aboutUs?: string;
}

export interface InvestorRegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  organization?: string;
  investmentFocus?: string;
  investmentRange?: string;
  investmentExperience?: string;
}

export interface LoginResponse {
  account: {
    id: number;
    email: string;
    role: BackendRole;
    status: string;
    token: string;
  };
  startupProfile?: any;
  investorProfile?: any;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
