// dashboardSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../../utils/axiosInstance';

// -------------------------
// Dashboard Types
// -------------------------
export interface DashboardStats {
  total_projects: number;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
}

export interface DashboardState {
  stats: DashboardStats;
  loading: boolean;
  error?: string;
}

const initialState: DashboardState = {
  stats: {
    total_projects: 0,
    total_tasks: 0,
    completed_tasks: 0,
    pending_tasks: 0,
    in_progress_tasks: 0,
  },
  loading: false,
  error: undefined,
};

// -------------------------
// Async Thunks
// -------------------------
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async () => {
    // You can create a custom endpoint in Frappe for dashboard stats
    // or fetch separately and calculate
    const [projectsRes, tasksRes] = await Promise.all([
      axiosInstance.get('/resource/Project?fields=["name"]'),
      axiosInstance.get('/resource/Task?fields=["name","status"]'),
    ]);

    const projects = projectsRes.data.data;
    const tasks = tasksRes.data.data;

    const completedTasks = tasks.filter((task: any) => task.status === 'Completed').length;
    const pendingTasks = tasks.filter((task: any) => task.status === 'Open').length;
    const inProgressTasks = tasks.filter((task: any) => task.status === 'Working').length;

    return {
      total_projects: projects.length,
      total_tasks: tasks.length,
      completed_tasks: completedTasks,
      pending_tasks: pendingTasks,
      in_progress_tasks: inProgressTasks,
    } as DashboardStats;
  }
);

// -------------------------
// Slice
// -------------------------
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action: PayloadAction<DashboardStats>) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;