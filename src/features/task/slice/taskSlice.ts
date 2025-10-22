import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../../utils/axiosInstance';
import { addAsyncCases } from '../../../utils/asyncReducers';

// -------------------------
// Task Type
// -------------------------
export interface Task {
  name: string;
  owner: string;
  creation: string;
  modified: string;
  modified_by: string;
  docstatus: number;
  idx: number;
  subject: string;
  project?: string;
  status: string;
  priority: string;
  description?: string;
  task_weight: number;
  expected_time: number;
  start: number;
  progress: number;
  duration: number;
  is_milestone: number;
  depends_on_tasks: string;
  actual_time: number;
  total_costing_amount: number;
  total_billing_amount: number;
  company: string;
  lft: number;
  rgt: number;
  old_parent: string;
  doctype: 'Task';
  depends_on: any[];
  // Handle as string (comma-separated) instead of array
  custom_assigned_employees?: string;
  assigned_to?: string;
  assigned_employees?: string;
  _assign?: string;
}

// -------------------------
// Slice State
// -------------------------
interface TaskState {
  tasks: Task[];
  selectedTask?: Task;
  loading: boolean;
  error?: string;
}

const initialState: TaskState = {
  tasks: [],
  selectedTask: undefined,
  loading: false,
  error: undefined,
};

// -------------------------
// Helper to get assigned employees from task
// -------------------------
const getAssignedEmployees = (task: Task): string[] => {
  // Handle as comma-separated string
  const assignedString = task.custom_assigned_employees || 
                        task.assigned_to || 
                        task.assigned_employees || 
                        task._assign || 
                        '';
  
  if (!assignedString) return [];
  
  // Split by comma and trim each value
  return assignedString.split(',').map(emp => emp.trim()).filter(emp => emp.length > 0);
};

// -------------------------
// Helper to set assigned employees to task
// -------------------------
const setAssignedEmployees = (currentAssigned: string[], employeeName: string, action: 'add' | 'remove'): string => {
  let updatedAssigned: string[];
  
  if (action === 'add') {
    // Add employee if not already assigned
    if (!currentAssigned.includes(employeeName)) {
      updatedAssigned = [...currentAssigned, employeeName];
    } else {
      updatedAssigned = currentAssigned; // No change if already assigned
    }
  } else {
    // Remove employee
    updatedAssigned = currentAssigned.filter(emp => emp !== employeeName);
  }
  
  // Convert back to comma-separated string
  return updatedAssigned.join(', ');
};

// -------------------------
// Async Thunks
// -------------------------
export const fetchTasks = createAsyncThunk('task/fetchTasks', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get('/resource/Task', {
      params: {
        fields: JSON.stringify([
          'name',
          'subject',
          'project',
          'status',
          'priority',
          'description',
          'progress',
          'creation',
          'modified',
          'owner',
          'custom_assigned_employees'
        ])
      }
    });
    return data.data as Task[];
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch tasks');
  }
});

export const fetchTaskById = createAsyncThunk('task/fetchTaskById', async (id: string, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get(`/resource/Task/${id}`);
    console.log('Full task response:', data.data);
    return data.data as Task;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch task');
  }
});

export const createTask = createAsyncThunk(
  'task/createTask',
  async (task: {
    subject: string;
    project?: string;
    status: string;
    priority: string;
    description?: string;
  }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/resource/Task', task);
      return data.data as Task;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'task/updateTask',
  async ({ id, task }: { id: string; task: Partial<Task> }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/resource/Task/${id}`, task);
      return data.data as Task;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'task/deleteTask',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/resource/Task/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete task');
    }
  }
);

// -------------------------
// Assignment Thunks
// -------------------------
export const assignEmployeeToTask = createAsyncThunk(
  'task/assignEmployee',
  async ({ taskId, employeeName }: { taskId: string; employeeName: string }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const currentTask = state.task.selectedTask as Task;
      
      if (!currentTask) {
        throw new Error('Task not found');
      }
      
      // Get current assigned employees as array
      const currentAssigned = getAssignedEmployees(currentTask);
      
      console.log('Current assigned employees:', currentAssigned);
      console.log('Adding employee:', employeeName);
      
      // Convert to comma-separated string with new employee
      const updatedAssignedString = setAssignedEmployees(currentAssigned, employeeName, 'add');
      
      console.log('Updated assigned string:', updatedAssignedString);
      
      // Update task with new assignment as string
      const updateData: any = {
        custom_assigned_employees: updatedAssignedString
      };
      
      const { data } = await axiosInstance.put(`/resource/Task/${taskId}`, updateData);
      
      console.log('Task updated successfully:', data.data);
      return data.data as Task;
    } catch (error: any) {
      console.error('Error assigning employee:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to assign employee');
    }
  }
);

export const removeEmployeeFromTask = createAsyncThunk(
  'task/removeEmployee',
  async ({ taskId, employeeName }: { taskId: string; employeeName: string }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const currentTask = state.task.selectedTask as Task;
      
      if (!currentTask) {
        throw new Error('Task not found');
      }
      
      // Get current assigned employees as array
      const currentAssigned = getAssignedEmployees(currentTask);
      
      console.log('Current assigned employees:', currentAssigned);
      console.log('Removing employee:', employeeName);
      
      // Convert to comma-separated string without the employee
      const updatedAssignedString = setAssignedEmployees(currentAssigned, employeeName, 'remove');
      
      console.log('Updated assigned string after removal:', updatedAssignedString);
      
      const updateData: any = {
        custom_assigned_employees: updatedAssignedString
      };
      
      const { data } = await axiosInstance.put(`/resource/Task/${taskId}`, updateData);
      
      console.log('Employee removed successfully:', data.data);
      return data.data as Task;
    } catch (error: any) {
      console.error('Error removing employee:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to remove employee');
    }
  }
);

// -------------------------
// Slice
// -------------------------
const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    clearSelectedTask: state => {
      state.selectedTask = undefined;
    },
    clearError: state => {
      state.error = undefined;
    },
    addTempTask: (state, action: PayloadAction<Task>) => {
      state.tasks.unshift(action.payload);
    },
    updateTaskInList: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(task => task.name === action.payload.name);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    removeTaskFromList: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task.name !== action.payload);
    },
  },
  extraReducers: builder => {
    addAsyncCases(builder, fetchTasks, (state, action) => {
      state.tasks = action.payload;
    });

    addAsyncCases(builder, fetchTaskById, (state, action) => {
      state.selectedTask = action.payload;
      console.log('Task stored in state:', action.payload);
    });

    addAsyncCases(builder, createTask, (state, action) => {
      state.tasks.unshift(action.payload);
    });

    addAsyncCases(builder, updateTask, (state, action) => {
      const index = state.tasks.findIndex(task => task.name === action.payload.name);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
      if (state.selectedTask?.name === action.payload.name) {
        state.selectedTask = action.payload;
      }
    });

    addAsyncCases(builder, deleteTask, (state, action) => {
      state.tasks = state.tasks.filter(task => task.name !== action.payload);
      if (state.selectedTask?.name === action.payload) {
        state.selectedTask = undefined;
      }
    });

    addAsyncCases(builder, assignEmployeeToTask, (state, action) => {
      // Update selected task
      if (state.selectedTask?.name === action.payload.name) {
        state.selectedTask = action.payload;
      }
      
      // Update task in list
      const index = state.tasks.findIndex(task => task.name === action.payload.name);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    });

    addAsyncCases(builder, removeEmployeeFromTask, (state, action) => {
      // Update selected task
      if (state.selectedTask?.name === action.payload.name) {
        state.selectedTask = action.payload;
      }
      
      // Update task in list
      const index = state.tasks.findIndex(task => task.name === action.payload.name);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    });
  },
});

export const { 
  clearSelectedTask, 
  clearError,
  addTempTask,
  updateTaskInList,
  removeTaskFromList
} = taskSlice.actions;

// Export helper functions for use in components
export { getAssignedEmployees };
export default taskSlice.reducer;