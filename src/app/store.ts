import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/slice/authSlice';
import taskReducer from '../features/task/slice/taskSlice';
import projectReducer from '../features/project/slice/projectSlice';
import dashboardReducer from '../features/dashboard/slice/dashboardSlice';
import employeeReducer from '../features/employee/slice/employeeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    task: taskReducer,
    project:projectReducer,
    dashboard: dashboardReducer,
    employee:employeeReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

