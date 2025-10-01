import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../constant/axiosInstance";

// ===== Types =====
export interface NdaTemplate {
  id: number;
  name: string;
  contentUrl: string;
}

export interface SignedNda {
  id: number;
  signed: boolean;
  signedAt: string;
  userId: number;
  ndaTemplateId: number;
}

interface NdaState {
  templates: NdaTemplate[];
  signedNda?: SignedNda;
  loading: boolean;
  error: string | null;
}

// ===== Initial State =====
const initialState: NdaState = {
  templates: [],
  signedNda: undefined,
  loading: false,
  error: null,
};

// ===== Async Thunks =====

// Lấy danh sách templates
export const fetchNdaTemplates = createAsyncThunk<NdaTemplate[]>(
  "nda/fetchTemplates",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/nda/templates");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Error fetching NDA templates");
    }
  }
);

// Upload NDA file
export const uploadNda = createAsyncThunk<SignedNda, FormData>(
  "nda/upload",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/nda/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Error uploading NDA");
    }
  }
);

// User ký NDA
export const signNda = createAsyncThunk<
  SignedNda,
  { userId: number; ndaTemplateId: number }
>("nda/sign", async ({ userId, ndaTemplateId }, { rejectWithValue }) => {
  try {
    const res = await api.post(
      `/api/nda/sign?userId=${userId}&ndaTemplateId=${ndaTemplateId}`
    );
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Error signing NDA");
  }
});

// Check NDA đã ký chưa
export const checkNda = createAsyncThunk<
  SignedNda,
  { userId: number; ndaTemplateId: number }
>("nda/check", async ({ userId, ndaTemplateId }, { rejectWithValue }) => {
  try {
    const res = await api.get(
      `/api/nda/check?userId=${userId}&ndaTemplateId=${ndaTemplateId}`
    );
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Error checking NDA");
  }
});

// ===== Slice =====
const ndaSlice = createSlice({
  name: "nda",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Templates
      .addCase(fetchNdaTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNdaTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload;
      })
      .addCase(fetchNdaTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Upload NDA
      .addCase(uploadNda.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadNda.fulfilled, (state, action) => {
        state.loading = false;
        state.signedNda = action.payload;
      })
      .addCase(uploadNda.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Sign NDA
      .addCase(signNda.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signNda.fulfilled, (state, action) => {
        state.loading = false;
        state.signedNda = action.payload;
      })
      .addCase(signNda.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Check NDA
      .addCase(checkNda.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkNda.fulfilled, (state, action) => {
        state.loading = false;
        state.signedNda = action.payload;
      })
      .addCase(checkNda.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default ndaSlice.reducer;
