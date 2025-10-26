import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../../utils/axiosInstance';
import { addAsyncCases } from '../../../utils/asyncReducers.ts';

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
    // Replace handleAsyncThunk with addAsyncCases for all async thunks
    addAsyncCases(builder, fetchProjects, (state, action) => {
      state.projects = action.payload;
    });

    addAsyncCases(builder, fetchProjectById, (state, action) => {
      state.selectedProject = action.payload;
    });

    addAsyncCases(builder, createProject, (state, action) => {
      state.projects.unshift(action.payload);
    });

    addAsyncCases(builder, updateProject, (state, action) => {
      const index = state.projects.findIndex(project => project.name === action.payload.name);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
      if (state.selectedProject?.name === action.payload.name) {
        state.selectedProject = action.payload;
      }
    });

    addAsyncCases(builder, deleteProject, (state, action) => {
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