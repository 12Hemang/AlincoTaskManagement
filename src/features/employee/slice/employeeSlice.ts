import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../../utils/axiosInstance';
import { addAsyncCases } from '../../../utils/asyncReducers';
// -------------------------
// Employee Type
// -------------------------
export interface Employee {
  name: string;
  employee_name: string;
  designation: string;
  department: string;
  company: string;
  date_of_joining: string;
  creation: string;
  modified: string;
  user_id?: string;
  status: 'Active' | 'Inactive';
  email?: string;
  cell_number?: string;
}

// -------------------------
// Slice State
// -------------------------
interface EmployeeState {
  employees: Employee[];
  loading: boolean;
  error?: string;
}

const initialState: EmployeeState = {
  employees: [],
  loading: false,
  error: undefined,
};

// -------------------------
// Async Thunks
// -------------------------
export const fetchEmployees = createAsyncThunk('employee/fetchEmployees', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get('/resource/Employee', {
      params: {
        fields: JSON.stringify([
          'name',
          'employee_name',
          'designation',
          'department',
          'company',
          'date_of_joining',
          'status',
          //'email',
          //'cell_number',
          'creation'
        ])
      }
    });
    return data.data as Employee[];
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch employees');
  }
});

export const searchEmployees = createAsyncThunk('employee/searchEmployees', async (searchText: string, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get('/resource/Employee', {
      params: {
        fields: JSON.stringify([
          'name',
          'employee_name',
          'designation',
          'department',
          'company',
          'status',
          //'email'
        ]),
        filters: JSON.stringify([
          ['employee_name', 'like', `%${searchText}%`]
        ])
      }
    });
    return data.data as Employee[];
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Failed to search employees');
  }
});

// -------------------------
// Slice
// -------------------------
const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = undefined;
    },
    clearEmployees: (state) => {
      state.employees = [];
    },
  },
  extraReducers: (builder) => {
    addAsyncCases(builder, fetchEmployees, (state, action) => {
      state.employees = action.payload;
    });

    addAsyncCases(builder, searchEmployees, (state, action) => {
      state.employees = action.payload;
    });
  },
});

export const { clearError, clearEmployees } = employeeSlice.actions;
export default employeeSlice.reducer;