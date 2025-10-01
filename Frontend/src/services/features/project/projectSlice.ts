// src/services/features/project/projectSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../constant/axiosInstance";
import type { RootState } from "../../../store";

// Thunk tạo Project
export const createProject = createAsyncThunk<
  unknown,
  FormData,
  { rejectValue: string; state: RootState }
>(
  "projects/createProject",
  async (formData, { rejectWithValue, getState }) => {
    try {
      console.log("🔄 createProject thunk started");
      
      // Cách 1: Lấy token từ Redux state
      const state = getState();
      const token = state.auth?.token;
      
      // Cách 2: Fallback - lấy token từ localStorage
      const tokenFromStorage = localStorage.getItem('authToken') || 
                              localStorage.getItem('token') || 
                              sessionStorage.getItem('authToken');
      
      const finalToken = token || tokenFromStorage;
      
      console.log("🔐 Token status:", finalToken ? "PRESENT" : "MISSING");
      
      if (!finalToken) {
        console.log("❌ No authentication token found");
        return rejectWithValue("Authentication required. Please log in again.");
      }

      // Debug: log form data contents
      console.log("📦 FormData contents:");
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}:`, value.name, `(${value.size} bytes)`);
        } else {
          console.log(`  ${key}:`, value);
        }
      }

      console.log("🌐 Making API call to /projects...");
      
      // --- API call ---
      const response = await api.post("/projects", formData, {
        headers: {
          Authorization: `Bearer ${finalToken}`,
          // KHÔNG set Content-Type, axios tự handle boundary
        },
      });

      console.log("✅ API Response received:", response.status, response.statusText);
      console.log("📄 Response data:", response.data);
      
      return response.data;
    } catch (error: any) {
      console.error("❌ API Error in createProject:");
      console.error("  Error message:", error.message);
      console.error("  Response status:", error.response?.status);
      console.error("  Response data:", error.response?.data);
      console.error("  Response headers:", error.response?.headers);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Failed to create project";
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
const projectSlice = createSlice({
  name: "projects",
  initialState: {
    projects: [] as unknown[],
    status: "idle",
    error: null as string | null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetStatus: (state) => {
      state.status = "idle";
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProject.pending, (state) => {
        console.log("⏳ createProject pending...");
        state.status = "loading";
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        console.log("🎉 createProject fulfilled:", action.payload);
        state.status = "succeeded";
        state.projects.push(action.payload);
        state.error = null;
      })
      .addCase(createProject.rejected, (state, action) => {
        console.log("💥 createProject rejected:", action.payload);
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetStatus } = projectSlice.actions;
export default projectSlice.reducer;