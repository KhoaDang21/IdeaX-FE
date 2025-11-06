import {
  createSlice,
  createAsyncThunk,
  isPending,
  isRejected,
} from "@reduxjs/toolkit";
import { api } from "../../constant/axiosInstance";
import type {
  WalletResponse,
  DepositRequest,
  DepositResponse,
  WithdrawRequest,
  CreatePaymentRequest,
  PaymentResponse,
  RefundRequest,
  TransactionResponse,
  Page,
  WithdrawRequestDetail,
  ApproveWithdraw,
  RejectWithdraw,
} from "../../../interfaces/payment";

interface PaymentState {
  wallet?: WalletResponse | null;
  depositResult?: DepositResponse | null;
  withdrawMessage?: string | null;
  payment?: PaymentResponse | null;
  transactions: TransactionResponse[];
  transactionsPage?: Page<TransactionResponse> | null;
  pendingWithdrawals?: WithdrawRequestDetail[];
  pendingWithdrawalsPage?: Page<WithdrawRequestDetail> | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: PaymentState = {
  wallet: null,
  depositResult: null,
  withdrawMessage: null,
  payment: null,
  transactions: [],
  transactionsPage: null,
  pendingWithdrawals: [],
  pendingWithdrawalsPage: null,
  status: "idle",
  error: null,
};

const BASE = "/api/payments";

const ADMIN_WITHDRAW_BASE = "/api/admin/withdrawals";

export const getPendingWithdrawals = createAsyncThunk<
  Page<WithdrawRequestDetail>,
  { page?: number; size?: number } | void,
  { rejectValue: string }
>("payment/getPendingWithdrawals", async (params, { rejectWithValue }) => {
  try {
    const page = params?.page ?? 0;
    const size = params?.size ?? 10;
    const res = await api.get<Page<WithdrawRequestDetail>>(
      `${ADMIN_WITHDRAW_BASE}/pending?page=${page}&size=${size}`
    );
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch pending withdrawals"
    );
  }
});

export const approveWithdraw = createAsyncThunk<
  string,
  { transactionId: number; payload: ApproveWithdraw },
  { rejectValue: string }
>(
  "payment/approveWithdraw",
  async ({ transactionId, payload }, { rejectWithValue }) => {
    try {
      const res = await api.post<string>(
        `${ADMIN_WITHDRAW_BASE}/${transactionId}/approve`,
        payload
      );
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to approve withdraw"
      );
    }
  }
);

export const rejectWithdrawAdmin = createAsyncThunk<
  string,
  { transactionId: number; payload: RejectWithdraw },
  { rejectValue: string }
>(
  "payment/rejectWithdrawAdmin",
  async ({ transactionId, payload }, { rejectWithValue }) => {
    try {
      const res = await api.post<string>(
        `${ADMIN_WITHDRAW_BASE}/${transactionId}/reject`,
        payload
      );
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to reject withdraw"
      );
    }
  }
);

export const getMyWallet = createAsyncThunk<
  WalletResponse,
  void,
  { rejectValue: string }
>("payment/getMyWallet", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<WalletResponse>(`${BASE}/wallet/me`);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch wallet"
    );
  }
});

export const createDeposit = createAsyncThunk<
  DepositResponse,
  DepositRequest,
  { rejectValue: string }
>("payment/createDeposit", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post<DepositResponse>(`${BASE}/wallet/deposit`, {
      ...payload,
      amount: Number(payload.amount),
    });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to create deposit"
    );
  }
});

export const createWithdraw = createAsyncThunk<
  string,
  WithdrawRequest,
  { rejectValue: string }
>("payment/createWithdraw", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post<string>(`${BASE}/wallet/withdraw`, {
      ...payload,
      amount: Number(payload.amount),
    });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to create withdraw request"
    );
  }
});

export const createPayment = createAsyncThunk<
  PaymentResponse,
  CreatePaymentRequest,
  { rejectValue: string }
>("payment/createPayment", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post<PaymentResponse>(`${BASE}/create`, {
      ...payload,
      // backend expects amount as BigDecimal; make sure it's numeric
      amount: Number(payload.amount),
    });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to create payment"
    );
  }
});

export const releasePayment = createAsyncThunk<
  PaymentResponse,
  number,
  { rejectValue: string }
>("payment/releasePayment", async (paymentId, { rejectWithValue }) => {
  try {
    const res = await api.post<PaymentResponse>(`${BASE}/${paymentId}/release`);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to release payment"
    );
  }
});

export const refundPayment = createAsyncThunk<
  PaymentResponse,
  { paymentId: number; payload: RefundRequest },
  { rejectValue: string }
>(
  "payment/refundPayment",
  async ({ paymentId, payload }, { rejectWithValue }) => {
    try {
      const res = await api.post<PaymentResponse>(
        `${BASE}/${paymentId}/refund`,
        payload
      );
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to refund payment"
      );
    }
  }
);

export const getTransactionHistory = createAsyncThunk<
  Page<TransactionResponse>,
  { page?: number; size?: number } | void,
  { rejectValue: string }
>("payment/getTransactionHistory", async (params, { rejectWithValue }) => {
  try {
    const page = params?.page ?? 0;
    const size = params?.size ?? 10;
    const res = await api.get<Page<TransactionResponse>>(
      `${BASE}/transactions/history?page=${page}&size=${size}`
    );
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch transaction history"
    );
  }
});

export const getTransactionHistoryByUser = createAsyncThunk<
  Page<TransactionResponse>,
  { userId: number; page?: number; size?: number },
  { rejectValue: string }
>(
  "payment/getTransactionHistoryByUser",
  async ({ userId, page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const res = await api.get<Page<TransactionResponse>>(
        `${BASE}/transactions/history/user/${userId}?page=${page}&size=${size}`
      );
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ||
          "Failed to fetch user transaction history"
      );
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
    resetPaymentStatus: (state) => {
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMyWallet.fulfilled, (state, action) => {
        state.wallet = action.payload;
        state.status = "succeeded";
      })
      .addCase(createDeposit.fulfilled, (state, action) => {
        state.depositResult = action.payload;
        state.status = "succeeded";
      })
      .addCase(getPendingWithdrawals.fulfilled, (state, action) => {
        state.pendingWithdrawalsPage = action.payload;
        state.pendingWithdrawals = action.payload.content || [];
        state.status = "succeeded";
      })
      .addCase(createWithdraw.fulfilled, (state, action) => {
        state.withdrawMessage = action.payload;
        state.status = "succeeded";
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.payment = action.payload;
        state.status = "succeeded";
      })
      .addCase(releasePayment.fulfilled, (state, action) => {
        state.payment = action.payload;
        state.status = "succeeded";
      })
      .addCase(refundPayment.fulfilled, (state, action) => {
        state.payment = action.payload;
        state.status = "succeeded";
      })
      .addCase(getTransactionHistory.fulfilled, (state, action) => {
        state.transactionsPage = action.payload;
        state.transactions = action.payload.content || [];
        state.status = "succeeded";
      })
      .addCase(getTransactionHistoryByUser.fulfilled, (state, action) => {
        state.transactionsPage = action.payload;
        state.transactions = action.payload.content || [];
        state.status = "succeeded";
      })
      .addCase(approveWithdraw.fulfilled, (state) => {
        // approval returns message; we can set status but keep data refreshed by caller
        state.status = "succeeded";
      })
      .addCase(rejectWithdrawAdmin.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addMatcher(isPending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addMatcher(isRejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action as any).payload ||
          (action as any).error?.message ||
          "Something went wrong";
      });
  },
});

export const { clearPaymentError, resetPaymentStatus } = paymentSlice.actions;
export default paymentSlice.reducer;
