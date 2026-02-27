import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';

const user = JSON.parse(localStorage.getItem('user') || 'null');
const token = localStorage.getItem('token');

export const sendRegistrationOtp = createAsyncThunk('auth/sendRegistrationOtp', async (email, { rejectWithValue }) => {
  try {
    const res = await authAPI.sendRegistrationOtp(email);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: 'Something went wrong' });
  }
});

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.verifyOtpAndRegister(data);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: 'Registration failed' });
  }
});

export const sendLoginOtp = createAsyncThunk('auth/sendLoginOtp', async (email, { rejectWithValue }) => {
  try {
    const res = await authAPI.sendLoginOtp(email);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: 'Something went wrong' });
  }
});

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.login(data);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: 'Login failed' });
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authAPI.logout();
  } catch (err) {}
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: user,
    token: token,
    isAuthenticated: !!token,
    loading: false,
    error: null,
    otpSent: false,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearOtpSent: (state) => { state.otpSent = false; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendRegistrationOtp.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(sendRegistrationOtp.fulfilled, (state) => { state.loading = false; state.otpSent = true; })
      .addCase(sendRegistrationOtp.rejected, (state, action) => { state.loading = false; state.error = action.payload?.message; })
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.user; state.token = action.payload.token; state.isAuthenticated = true; })
      .addCase(register.rejected, (state, action) => { state.loading = false; state.error = action.payload?.message; })
      .addCase(sendLoginOtp.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(sendLoginOtp.fulfilled, (state) => { state.loading = false; state.otpSent = true; })
      .addCase(sendLoginOtp.rejected, (state, action) => { state.loading = false; state.error = action.payload?.message; })
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.user; state.token = action.payload.token; state.isAuthenticated = true; state.otpSent = false; })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload?.message; })
      .addCase(logout.fulfilled, (state) => { state.user = null; state.token = null; state.isAuthenticated = false; });
  },
});

export const { clearError, clearOtpSent } = authSlice.actions;
export default authSlice.reducer;
