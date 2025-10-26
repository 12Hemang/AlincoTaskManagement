// store/slices/employeeSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { addAsyncCases, AsyncState } from '../../../utils/asyncReducers';
import axiosInstance from '../../../utils/axiosInstance';
import { DocType } from '../../../utils/docType.ts';

export interface Employee {
  value: string; // email
  description: string; // display name
  name?: string;
  employee_name?: string;
  [key: string]: any;
}

export interface ToDoAssignment {
  name: string;
  description: string;
  allocated_to: string;
  priority: string;
  reference_type?: string;
  reference_name?: string;
  status: string;
}

export interface EmployeeState {
  list: AsyncState<Employee[]>;
  search: AsyncState<Employee[]>;
  selectedEmployee: Employee | null;
  assignedEmployees: Employee[];
  todos: AsyncState<ToDoAssignment[]>;
}

const initialState: EmployeeState = {
  list: { data: [], loading: false, error: null },
  search: { data: [], loading: false, error: null },
  selectedEmployee: null,
  assignedEmployees: [],
  todos: { data: [], loading: false, error: null },
};

// -------------------------
// Fetch all employees
// -------------------------
export const fetchEmployees = createAsyncThunk(
  'employee/fetchEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/method/frappe.desk.search.search_link', {
        params: {
          doctype: 'User',
          txt: '',
          filters: JSON.stringify({
            user_type: 'System User',
            enabled: 1
          }),
        },
      });

      return response.data?.message || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// -------------------------
// Search employees
// -------------------------
export const searchEmployees = createAsyncThunk(
  'employee/searchEmployees',
  async (searchText: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/method/frappe.desk.search.search_link', {
        params: {
          doctype: DocType.User,
          txt: searchText,
          filters: JSON.stringify({
            user_type: 'System User',
            enabled: 1
          }),
        },
      });

      return response.data?.message || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// -------------------------
// Create ToDo to assign employee
// -------------------------
export const assignEmployeeToTask = createAsyncThunk(
  'employee/assignToTask',
  async (
    {
      taskId,
      employeeEmail,
      description = '',
      priority = 'Medium'
    }: {
      taskId: string;
      employeeEmail: string;
      description?: string;
      priority?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const todoData = {
        description: description || `Work on task ${taskId}`,
        allocated_to: employeeEmail,
        priority: priority,
        reference_type: 'Task',
        reference_name: taskId,
        status: 'Open'
      };

      const response = await axiosInstance.post('/resource/ToDo', {
        data: todoData
      });

      return {
        taskId,
        employeeEmail,
        todo: response.data.data,
        response: response.data
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// -------------------------
// Remove employee assignment by closing ToDo
// -------------------------
export const removeEmployeeFromTask = createAsyncThunk(
  'employee/removeFromTask',
  async (
    {
      taskId,
      employeeEmail
    }: {
      taskId: string;
      employeeEmail: string;
    },
    { rejectWithValue }
  ) => {
    try {
      // First, find the ToDo for this assignment
      const todosResponse = await axiosInstance.get('/resource/ToDo', {
        params: {
          fields: JSON.stringify(['name', 'allocated_to', 'reference_name']),
          filters: JSON.stringify({
            reference_name: taskId,
            allocated_to: employeeEmail,
            status: 'Open'
          })
        }
      });

      const todos = todosResponse.data.data;

      if (todos && todos.length > 0) {
        // Close each ToDo for this assignment
        const closePromises = todos.map((todo: any) =>
          axiosInstance.put(`/resource/ToDo/${todo.name}`, {
            data: { status: 'Closed' }
          })
        );

        await Promise.all(closePromises);
      }

      return { taskId, employeeEmail };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// -------------------------
// Fetch assigned employees via ToDos
// -------------------------
export const fetchAssignedEmployees = createAsyncThunk(
  'employee/fetchAssignedEmployees',
  async (taskId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/resource/ToDo', {
        params: {
          fields: JSON.stringify(['allocated_to', 'description', 'priority', 'status']),
          filters: JSON.stringify({
            reference_name: taskId,
            reference_type: 'Task',
            status: 'Open'
          })
        }
      });

      const todos = response.data.data || [];

      // Extract unique employees from ToDos
      const employeeMap = new Map();
      todos.forEach((todo: any) => {
        if (todo.allocated_to && !employeeMap.has(todo.allocated_to)) {
          employeeMap.set(todo.allocated_to, {
            value: todo.allocated_to,
            description: todo.allocated_to.split('@')[0],
          });
        }
      });

      return Array.from(employeeMap.values());
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// -------------------------
// Fetch all ToDos for a task
// -------------------------
export const fetchTaskToDos = createAsyncThunk(
  'employee/fetchTaskToDos',
  async (taskId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/resource/ToDo', {
        params: {
          fields: JSON.stringify(['name', 'allocated_to', 'description', 'priority', 'status', 'creation']),
          filters: JSON.stringify({
            reference_name: taskId,
            reference_type: 'Task'
          }),
          order_by: 'creation desc'
        }
      });

      return response.data.data || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// -------------------------
// Slice
// -------------------------
const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.search.data = [];
      state.search.error = null;
    },
    setSelectedEmployee: (state, action: PayloadAction<Employee>) => {
      state.selectedEmployee = action.payload;
    },
    clearSelectedEmployee: (state) => {
      state.selectedEmployee = null;
    },
    setAssignedEmployees: (state, action: PayloadAction<Employee[]>) => {
      state.assignedEmployees = action.payload;
    },
    addAssignedEmployee: (state, action: PayloadAction<Employee>) => {
      const exists = state.assignedEmployees.find(emp => emp.value === action.payload.value);
      if (!exists) {
        state.assignedEmployees.push(action.payload);
      }
    },
    removeAssignedEmployee: (state, action: PayloadAction<string>) => {
      state.assignedEmployees = state.assignedEmployees.filter(
        emp => emp.value !== action.payload
      );
    },
    clearAssignedEmployees: (state) => {
      state.assignedEmployees = [];
    },
    resetEmployeeState: (state) => {
      state.list = { data: [], loading: false, error: null };
      state.search = { data: [], loading: false, error: null };
      state.selectedEmployee = null;
      state.assignedEmployees = [];
      state.todos = { data: [], loading: false, error: null };
    },
  },
  extraReducers: (builder) => {
    // Handle async reducers with consistent pattern
    addAsyncCases(builder, fetchEmployees, (state, action) => {
      transformEmployeeData(state.list, action.payload);
    });

    addAsyncCases(builder, searchEmployees, (state, action) => {
      transformEmployeeData(state.search, action.payload);
    });

    addAsyncCases(builder, fetchTaskToDos, (state, action) => {
      state.todos.data = action.payload;
    });

    // Assigned employees
    builder
      .addCase(fetchAssignedEmployees.pending, (state) => {
        state.todos.loading = true;
      })
      .addCase(fetchAssignedEmployees.fulfilled, (state, action) => {
        state.todos.loading = false;
        state.assignedEmployees = action.payload;
      })
      .addCase(fetchAssignedEmployees.rejected, (state, action) => {
        state.todos.loading = false;
        state.todos.error = action.error.message || 'Failed to fetch assigned employees';
      });

    // Assign employee
    builder
      .addCase(assignEmployeeToTask.fulfilled, (state, action) => {
        const { employeeEmail } = action.payload;
        const exists = state.assignedEmployees.find(emp => emp.value === employeeEmail);
        if (!exists) {
          state.assignedEmployees.push({
            value: employeeEmail,
            description: employeeEmail.split('@')[0],
          });
        }
      });

    // Remove employee
    builder
      .addCase(removeEmployeeFromTask.fulfilled, (state, action) => {
        const { employeeEmail } = action.payload;
        state.assignedEmployees = state.assignedEmployees.filter(
          emp => emp.value !== employeeEmail
        );
      });
  },
});

// -------------------------
// Helper to transform employee data
// -------------------------
const transformEmployeeData = (state: AsyncState<Employee[]>, payload: any) => {
  const results = Array.isArray(payload)
    ? payload
    : payload?.results || payload?.message || [];

  state.data = results.map((item: any) => ({
    value: item.value,
    description: item.description || item.value,
    name: item.value,
    ...item,
  }));
};

export const {
  clearSearchResults,
  setSelectedEmployee,
  clearSelectedEmployee,
  setAssignedEmployees,
  addAssignedEmployee,
  removeAssignedEmployee,
  clearAssignedEmployees,
  resetEmployeeState,
} = employeeSlice.actions;

export default employeeSlice.reducer;