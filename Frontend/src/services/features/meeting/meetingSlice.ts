import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../constant/axiosInstance";

// ===== Types =====
export interface Meeting {
  id: number;
  roomCode: string;
  topic: string;
  startTime: string;
  endTime: string;
  createdById: number;
  createdByName?: string;
  recordUrl?: string;
}

interface MeetingState {
  meetings: Meeting[];
  currentMeeting?: Meeting;
  loading: boolean;
  error: string | null;
}

// ===== Initial State =====
const initialState: MeetingState = {
  meetings: [],
  currentMeeting: undefined,
  loading: false,
  error: null,
};

// ===== Async Thunks =====

// Lấy danh sách meetings
export const fetchMeetings = createAsyncThunk<Meeting[]>(
  "meetings/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/meetings");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Error fetching meetings");
    }
  }
);

// Tạo meeting mới
export const createMeeting = createAsyncThunk<Meeting, Omit<Meeting, "id">>(
  "meetings/create",
  async (meetingData, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/meetings", meetingData);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Error creating meeting");
    }
  }
);

// Ghi nhận record meeting
export const recordMeeting = createAsyncThunk<
  Meeting,
  { id: number; recordUrl: string }
>("meetings/record", async ({ id, recordUrl }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/api/meetings/${id}/record`, { recordUrl });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Error recording meeting");
  }
});

// ===== Slice =====
const meetingSlice = createSlice({
  name: "meetings",
  initialState,
  reducers: {
    clearCurrentMeeting(state) {
      state.currentMeeting = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchMeetings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMeetings.fulfilled, (state, action) => {
        state.loading = false;
        state.meetings = action.payload;
      })
      .addCase(fetchMeetings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create
      .addCase(createMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMeeting.fulfilled, (state, action) => {
        state.loading = false;
        state.meetings.push(action.payload);
        state.currentMeeting = action.payload;
      })
      .addCase(createMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Record
      .addCase(recordMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recordMeeting.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.meetings.findIndex((m) => m.id === updated.id);
        if (index !== -1) {
          state.meetings[index] = updated;
        }
        state.currentMeeting = updated;
      })
      .addCase(recordMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentMeeting } = meetingSlice.actions;
export default meetingSlice.reducer;
