import { createSlice, createAsyncThunk, isPending, isRejected, type UnknownAction } from "@reduxjs/toolkit";
import { api } from "../../constant/axiosInstance";
import type { RootState } from "../../../store";
import type { Project } from "../../../interfaces/project";
import type { Milestone } from "../../../interfaces/milestone";

/* ------------------ 🔑 Helper lấy token ------------------ */
const getToken = (getState: any) => {
  const state = getState();
  const token = state.auth?.token;
  return (
    token ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("authToken")
  );
};

/* ------------------ PROJECT CONTROLLER ------------------ */

// POST /projects
export const createProject = createAsyncThunk<
  Project,
  FormData,
  { rejectValue: string; state: RootState }
>("projects/createProject", async (formData, { rejectWithValue, getState }) => {
  try {
    const token = getToken(getState);
    if (!token) return rejectWithValue("Authentication required.");

    // Ensure default values if not provided
    if (!formData.has("status")) formData.append("status", "DRAFT");
    if (!formData.has("fundingStage")) formData.append("fundingStage", "SEED");

    const response = await api.post("/projects", formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to create project");
  }
});

// GET /projects/{id}
export const getProjectById = createAsyncThunk<Project, number, { rejectValue: string; state: RootState }>(
  "projects/getById",
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const res = await api.get(`/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to get project");
    }
  }
);

// PUT /projects/{id}
export const updateProject = createAsyncThunk<
  Project,
  { id: number; data: Partial<Project> },
  { rejectValue: string; state: RootState }
>("projects/update", async ({ id, data }, { rejectWithValue, getState }) => {
  try {
    const token = getToken(getState);
    const res = await api.put(`/projects/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to update project");
  }
});

// DELETE /projects/{id}
export const deleteProject = createAsyncThunk<number, number, { rejectValue: string; state: RootState }>(
  "projects/delete",
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      await api.delete(`/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete project");
    }
  }
);

// PUT /projects/{id}/approve
export const approveProject = createAsyncThunk<
  Project,
  number,
  { rejectValue: string; state: RootState }
>("projects/approve", async (id, { rejectWithValue, getState }) => {
  try {
    const token = getToken(getState);
    const res = await api.put(`/projects/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to approve project");
  }
});

// PUT /projects/{id}/reject
export const rejectProject = createAsyncThunk<
  Project,
  number,
  { rejectValue: string; state: RootState }
>("projects/reject", async (id, { rejectWithValue, getState }) => {
  try {
    const token = getToken(getState);
    const res = await api.put(`/projects/${id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to reject project");
  }
});

// GET /projects/my
export const getMyProjects = createAsyncThunk<
  Project[],
  void,
  { rejectValue: string; state: RootState }
>("projects/getMy", async (_, { rejectWithValue, getState }) => {
  try {
    const token = getToken(getState);
    const res = await api.get("/projects/my", { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to get my projects");
  }
});

/* ------------------ MILESTONE CONTROLLER ------------------ */

// GET /api/milestones/{id}
export const getMilestoneById = createAsyncThunk<Milestone, number, { rejectValue: string; state: RootState }>(
  "milestones/getById",
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      const res = await api.get(`/api/milestones/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to get milestone");
    }
  }
);

// PUT /api/milestones/{id}
export const updateMilestone = createAsyncThunk<
  Milestone,
  { id: number; data: Partial<Milestone> },
  { rejectValue: string; state: RootState }
>("milestones/update", async ({ id, data }, { rejectWithValue, getState }) => {
  try {
    const token = getToken(getState);
    const res = await api.put(`/api/milestones/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to update milestone");
  }
});

// DELETE /api/milestones/{id}
export const deleteMilestone = createAsyncThunk<number, number, { rejectValue: string; state: RootState }>(
  "milestones/delete",
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      await api.delete(`/api/milestones/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete milestone");
    }
  }
);

// GET /api/milestones/project/{projectId}
export const getMilestonesByProject = createAsyncThunk<
  Milestone[],
  number,
  { rejectValue: string; state: RootState }
>("milestones/getByProject", async (projectId, { rejectWithValue, getState }) => {
  try {
    const token = getToken(getState);
    const res = await api.get(`/api/milestones/project/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to get milestones");
  }
});

// POST /api/milestones/project/{projectId}
export const createMilestone = createAsyncThunk<
  Milestone,
  { projectId: number; data: Omit<Milestone, "id" | "createdAt" | "updatedAt"> },
  { rejectValue: string; state: RootState }
>("milestones/create", async ({ projectId, data }, { rejectWithValue, getState }) => {
  try {
    const token = getToken(getState);
    const res = await api.post(`/api/milestones/project/${projectId}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to create milestone");
  }
});

// Định nghĩa kiểu cho rejected action với UnknownAction
interface RejectedAction extends UnknownAction {
  payload?: string;
  error?: { message: string };
}

/* ------------------ SLICE ------------------ */
const projectSlice = createSlice({
  name: "projects",
  initialState: {
    projects: [] as Project[],
    milestones: [] as Milestone[],
    status: "idle",
    error: null as string | null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetStatus: (state) => {
      state.status = "idle";
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
      .addCase(updateProject.fulfilled, (state, action) => {
        const i = state.projects.findIndex((p) => p.id === action.payload.id);
        if (i !== -1) state.projects[i] = action.payload;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter((p) => p.id !== action.payload);
      })
      /* MILESTONES CRUD */
      .addCase(getMilestonesByProject.fulfilled, (state, action) => {
        state.milestones = action.payload;
      })
      .addCase(createMilestone.fulfilled, (state, action) => {
        state.milestones.push(action.payload);
      })
      .addCase(updateMilestone.fulfilled, (state, action) => {
        const i = state.milestones.findIndex((m) => m.id === action.payload.id);
        if (i !== -1) state.milestones[i] = action.payload;
      })
      .addCase(deleteMilestone.fulfilled, (state, action) => {
        state.milestones = state.milestones.filter((m) => m.id !== action.payload);
      })
      /* ERROR + STATUS */
      .addMatcher(isPending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addMatcher(isRejected, (state, action) => {
        state.status = "failed";
        // Type assertion với UnknownAction
        const rejectedAction = action as RejectedAction;
        state.error = rejectedAction.payload || rejectedAction.error?.message || "Something went wrong";
      });
  },
});

export const { clearError, resetStatus } = projectSlice.actions;
export default projectSlice.reducer;