// store/utils/asyncReducers.ts
import { ActionReducerMapBuilder, AsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface AsyncState<T> {
  data: T;
  loading: boolean;
  error?: string | null;
}

/**
 * Utility to attach pending, fulfilled, rejected reducers for an async thunk.
 * @param builder - slice builder
 * @param thunk - createAsyncThunk instance
 * @param onFulfilled - callback when fulfilled (state, action)
 */
export const addAsyncCases = <T, Returned, Arg>(
  builder: ActionReducerMapBuilder<T>,
  thunk: AsyncThunk<Returned, Arg, any>,
  onFulfilled?: (state: T, action: PayloadAction<Returned>) => void
) => {
  builder
    .addCase(thunk.pending, (state: any) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(thunk.fulfilled, (state: any, action: PayloadAction<Returned>) => {
      state.loading = false;
      state.error = null;
      if (onFulfilled) onFulfilled(state, action);
    })
    .addCase(thunk.rejected, (state: any, action) => {
      state.loading = false;
      
      // Extract error message - this will handle both string payloads and Frappe errors
      state.error = getErrorMessage(action.payload, action.error);
    });
};

/**
 * Universal error message extractor
 */
function getErrorMessage(payload: any, error: any): string {
  // If payload is a string, use it directly
  if (typeof payload === 'string') {
    return payload;
  }
  
  // If payload is an object with message
  if (payload?.message) {
    return payload.message;
  }
  
  // If payload is Frappe error with _server_messages
  if (payload?._server_messages) {
    try {
      const serverMessages = JSON.parse(payload._server_messages);
      if (Array.isArray(serverMessages) && serverMessages.length > 0) {
        const firstMessage = JSON.parse(serverMessages[0]);
        return firstMessage.message || payload.exception || 'Operation failed';
      }
    } catch (e) {
      // Fall through to other options
    }
  }
  
  // Use Frappe exception if available
  if (payload?.exception) {
    return payload.exception;
  }
  
  // Use error message if available
  if (error?.message) {
    return error.message;
  }
  
  // Default fallback
  return 'Something went wrong';
}