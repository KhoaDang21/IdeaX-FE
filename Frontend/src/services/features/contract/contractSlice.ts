import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../constant/axiosInstance";
import type {
  MeetingContract,
  ContractSignPayload,
} from "../../../types/contract";

interface ContractState {
  current?: MeetingContract | null;
  preview?: MeetingContract | null;
  loading: boolean;
  error: string | null;
}

const initialState: ContractState = {
  current: null,
  preview: null,
  loading: false,
  error: null,
};

export const fetchContractByMeeting = createAsyncThunk<
  MeetingContract,
  { meetingId: number; userId?: number }
>(
  "contract/fetchByMeeting",
  async ({ meetingId, userId }, { rejectWithValue }) => {
    try {
      const params = userId ? `?userId=${userId}` : "";
      const res = await api.get(`/api/contracts/meeting/${meetingId}${params}`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Không thể tải hợp đồng");
    }
  }
);

export const signMeetingContract = createAsyncThunk<
  MeetingContract,
  { meetingId: number; userId: number; payload: ContractSignPayload }
>("contract/sign", async ({ meetingId, userId, payload }, { rejectWithValue }) => {
  try {
    const res = await api.post(
      `/api/contracts/meeting/${meetingId}/sign/${userId}`,
      payload
    );
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Không thể ký hợp đồng");
  }
});

export const previewContract = createAsyncThunk<
  MeetingContract,
  { meetingId: number; userId: number; payload: ContractSignPayload }
>("contract/preview", async ({ meetingId, userId, payload }, { rejectWithValue }) => {
  try {
    const res = await api.post(
      `/api/contracts/meeting/${meetingId}/preview/${userId}`,
      payload
    );
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Không thể tạo bản nháp hợp đồng");
  }
});

const contractSlice = createSlice({
  name: "contract",
  initialState,
  reducers: {
    clearContract(state) {
      state.current = null;
      state.preview = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContractByMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContractByMeeting.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchContractByMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(signMeetingContract.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signMeetingContract.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
        state.preview = null;
      })
      .addCase(signMeetingContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(previewContract.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(previewContract.fulfilled, (state, action) => {
        state.loading = false;
        state.preview = action.payload;
      })
      .addCase(previewContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearContract } = contractSlice.actions;
export default contractSlice.reducer;

