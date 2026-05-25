import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API = 'http://localhost:5000/api/auth';

const loadUser = () => {
  try {
    const token = localStorage.getItem('carmart_token');
    const user  = localStorage.getItem('carmart_user');
    if (token && user) return { token, user: JSON.parse(user) };
  } catch {}
  return { token: null, user: null };
};

const saved = loadUser();

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message || 'Login failed');
    localStorage.setItem('carmart_token', data.token);
    localStorage.setItem('carmart_user',  JSON.stringify(data.user));
    return data;
  } catch {
    return rejectWithValue('Network error — is the server running?');
  }
});

export const register = createAsyncThunk('auth/register', async ({ name, email, password, phone, role }, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone, role }),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message || 'Registration failed');
    localStorage.setItem('carmart_token', data.token);
    localStorage.setItem('carmart_user',  JSON.stringify(data.user));
    return data;
  } catch {
    return rejectWithValue('Network error — is the server running?');
  }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { getState, rejectWithValue }) => {
  const token = getState().auth.token;
  if (!token) return rejectWithValue('No token');
  try {
    const res = await fetch(`${API}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message);
    return data;
  } catch {
    return rejectWithValue('Network error');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:    saved.user,
    token:   saved.token,
    loading: false,
    error:   null,
  },
  reducers: {
    logout(state) {
      state.user  = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('carmart_token');
      localStorage.removeItem('carmart_user');
    },
    clearError(state) {
      state.error = null;
    },
    setCredentials(state, action) {
      state.user    = action.payload.user;
      state.token   = action.payload.token;
      state.loading = false;
      state.error   = null;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    const pending   = (state)         => { state.loading = true;  state.error = null; };
    const rejected  = (state, action) => { state.loading = false; state.error = action.payload; };
    const fulfilled = (state, action) => {
      state.loading = false;
      state.user    = action.payload.user;
      state.token   = action.payload.token;
      state.error   = null;
    };

    builder
      .addCase(login.pending,    pending)
      .addCase(login.fulfilled,  fulfilled)
      .addCase(login.rejected,   rejected)
      .addCase(register.pending,   pending)
      .addCase(register.fulfilled, fulfilled)
      .addCase(register.rejected,  rejected)
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
      });
  },
});

export const { logout, clearError, setCredentials, setUser } = authSlice.actions;
export const selectUser       = state => state.auth.user;
export const selectToken      = state => state.auth.token;
export const selectAuthError  = state => state.auth.error;
export const selectAuthLoading = state => state.auth.loading;
export default authSlice.reducer;
