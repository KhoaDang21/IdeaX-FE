// src/services/features/project/projectSlice.ts
import {
  createSlice,
  createAsyncThunk,
  isPending,
  isRejected,
  type UnknownAction,
} from "@reduxjs/toolkit";
import { api } from "../../constant/axiosInstance";
import type { RootState } from "../../../store";
import type { Project } from "../../../interfaces/project";
import type { Milestone } from "../../../interfaces/milestone";

// NOTE: Authorization header is handled by `axiosInstance` interceptor.
// Do NOT read or write localStorage in this slice; rely on `api` for auth headers.

// Define the state interface
interface ProjectState {
  projects: Project[];
  milestones: Milestone[];
  project: Project | null; // Add field for single project
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Initial state
const initialState: ProjectState = {
  projects: [],
  milestones: [],
  project: null, // Initialize as null
  status: "idle",
  error: null,
};

/* ------------------ PROJECT CONTROLLER ------------------ */

// POST /projects (unchanged)
export const createProject = createAsyncThunk<
  Project,
  FormData,
  { rejectValue: string; state: RootState }
>("projects/createProject", async (formData, { rejectWithValue }) => {
  try {
    // Don't manage auth here; axios interceptor will attach Authorization header if present.
    if (!formData.has("status")) formData.append("status", "DRAFT");
    if (!formData.has("fundingStage")) formData.append("fundingStage", "SEED");

    const response = await api.upload("/projects", formData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to create project"
    );
  }
});

// GET /projects/{id}
export const getProjectById = createAsyncThunk<
  Project,
  number,
  { rejectValue: string; state: RootState }
>("projects/getById", async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to get project"
    );
  }
});

// PUT /projects/{id} (unchanged)
export const updateProject = createAsyncThunk<
  Project,
  { id: number; data: Partial<Project> },
  { rejectValue: string; state: RootState }
>("projects/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/projects/${id}`, data);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to update project"
    );
  }
});

// DELETE /projects/{id} (unchanged)
export const deleteProject = createAsyncThunk<
  number,
  number,
  { rejectValue: string; state: RootState }
>("projects/delete", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/projects/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to delete project"
    );
  }
});

// PUT /projects/{id}/approve (unchanged)
export const approveProject = createAsyncThunk<
  Project,
  number,
  { rejectValue: string; state: RootState }
>("projects/approve", async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`/projects/${id}/approve`, {});
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to approve project"
    );
  }
});

// PUT /projects/{id}/reject (unchanged)
export const rejectProject = createAsyncThunk<
  Project,
  number,
  { rejectValue: string; state: RootState }
>("projects/reject", async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`/projects/${id}/reject`, {});
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to reject project"
    );
  }
});

// GET /projects/my (unchanged)
export const getMyProjects = createAsyncThunk<
  Project[],
  void,
  { rejectValue: string; state: RootState }
>("projects/getMy", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/projects/my");
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to get my projects"
    );
  }
});

// GET /projects/public (get public projects for investors)
export const getAllProjects = createAsyncThunk<
  Project[],
  void,
  { rejectValue: string; state: RootState }
>("projects/getAll", async (_, { rejectWithValue }) => {
  try {
    // Backend exposes `/projects/all` (admin) and `/projects/my` for owner.
    // Historically FE called `/projects/public` which does not exist -> 404.
    // Use `/projects/all` to retrieve projects list from BE. Note: backend may restrict to ADMIN,
    // but this matches available backend routes. Handle failures gracefully in UI.
    const res = await api.get("/projects/all");
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to get all projects"
    );
  }
});

/* ------------------ MILESTONE CONTROLLER ------------------ */

// GET /api/milestones/{id} (unchanged)
export const getMilestoneById = createAsyncThunk<
  Milestone,
  number,
  { rejectValue: string; state: RootState }
>("milestones/getById", async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/api/milestones/${id}`);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to get milestone"
    );
  }
});

// PUT /api/milestones/{id} (unchanged)
export const updateMilestone = createAsyncThunk<
  Milestone,
  { id: number; data: Partial<Milestone> },
  { rejectValue: string; state: RootState }
>("milestones/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/api/milestones/${id}`, data);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to update milestone"
    );
  }
});

// DELETE /api/milestones/{id} (unchanged)
export const deleteMilestone = createAsyncThunk<
  number,
  number,
  { rejectValue: string; state: RootState }
>("milestones/delete", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/api/milestones/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to delete milestone"
    );
  }
});

// GET /api/milestones/project/{projectId} (unchanged)
export const getMilestonesByProject = createAsyncThunk<
  Milestone[],
  number,
  { rejectValue: string; state: RootState }
>(
  "milestones/getByProject",
  async (projectId, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const res = await api.get(`/api/milestones/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Lấy mảng milestones từ API
      const milestones: Milestone[] = res.data;

      // DÙNG .map ĐỂ TRẢ VỀ MỘT MẢNG MỚI,
      // MỖI MILESTONE ĐỀU ĐƯỢC GẮN THÊM projectId
      return milestones.map(milestone => ({
        ...milestone,
        projectId: projectId // <-- Thêm ID của project vào đây
      }));
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to get milestones"
      );
    }
  }
});

// POST /api/milestones/project/{projectId} (unchanged)
export const createMilestone = createAsyncThunk<
  Milestone,
  {
    projectId: number;
    data: Omit<Milestone, "id" | "createdAt" | "updatedAt">;
  },
  { rejectValue: string; state: RootState }
>("milestones/create", async ({ projectId, data }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/api/milestones/project/${projectId}`, data);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to create milestone"
    );
  }
});

// Define type for rejected action
interface RejectedAction extends UnknownAction {
  payload?: string;
  error?: { message: string };
}

/* ------------------ SLICE ------------------ */
const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetStatus: (state) => {
      state.status = "idle";
    },
    clearProject: (state) => {
      state.project = null; // Clear single project
    },
  },
  extraReducers: (builder) => {
    builder
      /* PROJECT CRUD */
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.push(action.payload);
        state.status = "succeeded";
      })
      .addCase(getMyProjects.fulfilled, (state, action) => {
        state.projects = action.payload;
        state.status = "succeeded";
      })
      .addCase(getAllProjects.fulfilled, (state, action) => {
        state.projects = action.payload;
        state.status = "succeeded";
      })
      .addCase(getProjectById.fulfilled, (state, action) => {
        state.project = action.payload; // Store single project
        state.status = "succeeded";
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const i = state.projects.findIndex((p) => p.id === action.payload.id);
        if (i !== -1) state.projects[i] = action.payload;
        if (state.project && state.project.id === action.payload.id) {
          state.project = action.payload; // Update single project if it matches
        }
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter((p) => p.id !== action.payload);
        if (state.project && state.project.id === action.payload) {
          state.project = null; // Clear single project if deleted
        }
      })
      .addCase(approveProject.fulfilled, (state, action) => {
        const i = state.projects.findIndex((p) => p.id === action.payload.id);
        if (i !== -1) state.projects[i] = action.payload;
        if (state.project && state.project.id === action.payload.id) {
          state.project = action.payload;
        }
      })
      .addCase(rejectProject.fulfilled, (state, action) => {
        const i = state.projects.findIndex((p) => p.id === action.payload.id);
        if (i !== -1) state.projects[i] = action.payload;
        if (state.project && state.project.id === action.payload.id) {
          state.project = action.payload;
        }
      })
      /* MILESTONES CRUD */
      .addCase(getMilestonesByProject.fulfilled, (state, action) => {
        // Tạo 1 Set chứa các ID milestones đã có
  const existingIds = new Set(state.milestones.map(m => m.id));
  // Lọc ra các milestones mới chưa có trong state
  const newMilestones = action.payload.filter(m => !existingIds.has(m.id));
  // Nối các milestones mới vào state
  state.milestones.push(...newMilestones);
      })
      .addCase(createMilestone.fulfilled, (state, action) => {
        state.milestones.push(action.payload);
      })
      .addCase(updateMilestone.fulfilled, (state, action) => {
        const i = state.milestones.findIndex((m) => m.id === action.payload.id);
        if (i !== -1) state.milestones[i] = action.payload;
      })
      .addCase(deleteMilestone.fulfilled, (state, action) => {
        state.milestones = state.milestones.filter(
          (m) => m.id !== action.payload
        );
      })
      /* ERROR + STATUS */
      .addMatcher(isPending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addMatcher(isRejected, (state, action) => {
        state.status = "failed";
        const rejectedAction = action as RejectedAction;
        state.error =
          rejectedAction.payload ||
          rejectedAction.error?.message ||
          "Something went wrong";
      });
  },
});

export const { clearError, resetStatus, clearProject } = projectSlice.actions;
export default projectSlice.reducer;
