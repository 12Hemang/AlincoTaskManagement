import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';

interface AuthState {
  user: UserProfile | null;
  sid: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  sid: null,
  loading: false,
  error: null,
};

// Login / fetch SID and store
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload: { usr: string; pwd: string }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post('/method/login', payload);
      const sid = response.headers['set-cookie']?.[0]?.split(';')[0]?.split('=')[1];
      if (!sid) throw new Error('SID not returned');

      await AsyncStorage.setItem('sid', sid);

      // Fetch profile immediately for login result
      const profileRes = await axiosInstance.get(`/resource/User/${payload.usr}`, {
        params: { fields: '["full_name","email","user_image","roles","username","first_name","language","desk_theme","last_login"]' },
        headers: { Cookie: `sid=${sid}` },
      });

      const profile: UserProfile = profileRes.data.data;

      // Save to storage
      await AsyncStorage.setItem('user_profile', JSON.stringify(profile));

      // Fetch in background (update storage if newer)
      dispatch(fetchProfile());

      return { sid, user: profile };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Login failed');
    }
  }
);

// Fetch profile by existing SID (used on app load or refresh)
export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const sid = await AsyncStorage.getItem('sid');
      if (!sid) throw new Error('No SID found');

      const response = await axiosInstance.get('/resource/User/hemang.api@alnicoelectric.com', {
        params: { fields: '["full_name","email","user_image","roles","username","first_name","language","desk_theme","last_login"]' },
        headers: { Cookie: `sid=${sid}` },
      });

      const profile: UserProfile = response.data.data;

      // Save latest profile to storage
      await AsyncStorage.setItem('user_profile', JSON.stringify(profile));

      return profile;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch profile');
    }
  }
);

// Logout user
export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  await axiosInstance.get('/method/logout');
  await AsyncStorage.removeItem('sid');
  await AsyncStorage.removeItem('user_profile');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuth: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ sid: string; user: UserProfile }>) => {
        state.loading = false;
        state.sid = action.payload.sid;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutUser.fulfilled, () => initialState);
  },
});

export const { resetAuth } = authSlice.actions;
export default authSlice.reducer;
