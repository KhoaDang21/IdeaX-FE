export type BigDecimalString = string;

export interface DepositRequest {
  amount: number;
  paymentMethod?: string;
}

export interface DepositResponse {
  transactionId: number;
  paymentUrl: string;
  // New fields from backend for multi-gateway support
  redirectUrl?: string;
  transactionReference?: string;
  amount?: BigDecimalString;
  gateway?: string;
}

export interface WithdrawRequest {
  amount: number;
  bankName: string;
  bankAccountNumber: string;
  accountHolderName: string;
}

export interface WalletResponse {
  accountId: number;
  email: string;
  balance: BigDecimalString;
  totalDeposits?: BigDecimalString;
  totalInvested?: BigDecimalString;
  availableForWithdrawal?: BigDecimalString;
}

export interface CreatePaymentRequest {
  projectId: number;
  amount: number;
}

export type PaymentStatus =
  | "PENDING"
  | "COMPLETED"
  | "RELEASED"
  | "REFUNDED"
  | string;

export interface PaymentResponse {
  id: number;
  projectId?: number;
  projectName?: string;
  payerId?: number;
  payerName?: string;
  recipientId?: number;
  recipientName?: string;
  amount?: BigDecimalString;
  status?: PaymentStatus;
  createdAt?: string;
}

export interface RefundRequest {
  reason: string;
}

export type TransactionType = string;
export type TransactionStatus = string;

export interface TransactionResponse {
  id: number;
  amount: BigDecimalString;
  type: TransactionType;
  status: TransactionStatus;
  paymentId?: number;
  createdAt?: string;
  // optional fields for UI convenience
  projectName?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // current page (zero-based)
}

// Admin / Withdraw details
export interface WithdrawRequestDetail {
  transactionId: number;
  userId: number;
  userEmail: string;
  userName: string;
  amount: BigDecimalString;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  status: TransactionStatus;
  createdAt?: string;
  note?: string;
}

export interface ApproveWithdraw {
  adminNote?: string;
  transactionRef?: string;
}

export interface RejectWithdraw {
  reason: string;
}

export interface PurchaseUpgradePackageRequestDTO {
  packageId: number;
}