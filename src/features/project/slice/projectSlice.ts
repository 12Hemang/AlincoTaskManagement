import { createSlice, createAsyncThunk, PayloadAction, ActionReducerMapBuilder, AsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../utils/axiosInstance';

// -------------------------
// Project Type
// -------------------------
export interface Project {
  name: string;
  project_name: string;
  status: 'Open' | 'Completed' | 'Cancelled' | 'On Hold';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  project_type?: string;
  customer?: string;
  expected_start_date?: string;
  expected_end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  percent_complete?: number;
  creation: string;
  modified: string;
  owner: string;
  modified_by?: string;
}

// -------------------------
// Slice State
// -------------------------
interface ProjectState {
  projects: Project[];
  selectedProject?: Project;
  loading: boolean;
  error?: string;
}

const initialState: ProjectState = {
  projects: [],
  selectedProject: undefined,
  loading: false,
  error: undefined,
};

// -------------------------
// Async Thunks
// -------------------------
export const fetchProjects = createAsyncThunk('project/fetchProjects', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get('/resource/Project', {
      params: {
        fields: JSON.stringify([
          'name',
          'project_name', 
          'status',
          'priority',
          'project_type',
          'customer',
          'expected_start_date',
          'expected_end_date',
          'actual_start_date',
          'actual_end_date',
          'percent_complete',
          'creation',
          'modified',
          'owner'
        ])
      }
    });
    return data.data as Project[];
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch projects');
  }
});

export const fetchProjectById = createAsyncThunk('project/fetchProjectById', async (id: string, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get(`/resource/Project/${id}`);
    return data.data as Project;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch project');
  }
});

export const createProject = createAsyncThunk(
  'project/createProject',
  async (project: {
    project_name: string;
    status: string;
    priority: string;
    project_type?: string;
    customer?: string;
    expected_start_date?: string;
    expected_end_date?: string;
    percent_complete?: number;
  }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/resource/Project', project);
      return data.data as Project;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create project');
    }
  }
);

export const updateProject = createAsyncThunk(
  'project/updateProject',
  async ({ id, project }: { id: string; project: Partial<Project> }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/resource/Project/${id}`, project);
      return data.data as Project;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update project');
    }
  }
);

export const deleteProject = createAsyncThunk(
  'project/deleteProject',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/resource/Project/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete project');
    }
  }
);

// -------------------------
// Helper for async reducers
// -------------------------
function handleAsyncThunk<T, R>(
  builder: ActionReducerMapBuilder<T>,
  thunk: AsyncThunk<R, any, any>,
  onFulfilled?: (state: T, action: PayloadAction<R>) => void
) {
  builder
    .addCase(thunk.pending, (state: any) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(thunk.fulfilled, (state: any, action: PayloadAction<R>) => {
      state.loading = false;
      if (onFulfilled) onFulfilled(state, action);
    })
    .addCase(thunk.rejected, (state: any, action: any) => {
      state.loading = false;
      state.error = action.payload || action.error?.message || 'Something went wrong';
    });
}

// -------------------------
// Slice
// -------------------------
const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    clearSelectedProject: state => {
      state.selectedProject = undefined;
    },
    clearError: state => {
      state.error = undefined;
    },
    addTempProject: (state, action: PayloadAction<Project>) => {
      state.projects.unshift(action.payload);
    },
    updateProjectInList: (state, action: PayloadAction<Project>) => {
      const index = state.projects.findIndex(project => project.name === action.payload.name);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
    },
    removeProjectFromList: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter(project => project.name !== action.payload);
    },
  },
  extraReducers: builder => {
    handleAsyncThunk(builder, fetchProjects, (state, action) => {
      state.projects = action.payload;
    });

    handleAsyncThunk(builder, fetchProjectById, (state, action) => {
      state.selectedProject = action.payload;
    });

    handleAsyncThunk(builder, createProject, (state, action) => {
      state.projects.unshift(action.payload);
    });

    handleAsyncThunk(builder, updateProject, (state, action) => {
      const index = state.projects.findIndex(project => project.name === action.payload.name);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
      if (state.selectedProject?.name === action.payload.name) {
        state.selectedProject = action.payload;
      }
    });

    handleAsyncThunk(builder, deleteProject, (state, action) => {
      state.projects = state.projects.filter(project => project.name !== action.payload);
      if (state.selectedProject?.name === action.payload) {
        state.selectedProject = undefined;
      }
    });
  },
});

export const { 
  clearSelectedProject, 
  clearError, 
  addTempProject, 
  updateProjectInList, 
  removeProjectFromList 
} = projectSlice.actions;

export default projectSlice.reducer;