import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser, registerUser } from "@/services/api";
import { mapAuthError } from "@/services/auth/mapAuthError";
import { AuthErrorCode } from "@/services/auth/authErrors";
import { User } from "@/types/types";

interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  token: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  loading: false,
  error: null,
  token: null,
  initialized: false,
};

export const loginUserThunk = createAsyncThunk(
  "auth/loginUser",
  async (credentials: { email: string; password: string }) => {
    const response = await loginUser(credentials);
    return response.data;
  }
);
export const registerUserThunk = createAsyncThunk<
  User,
  {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
  },
  {
    rejectValue: AuthErrorCode;
  }
>(
  "auth/registerUser",
  async (data, { rejectWithValue }) => {
    try {
      const response = await registerUser(data);
      return response.data;
    } catch (error) {
      const code = mapAuthError(error);
      return rejectWithValue(code);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, action) {
      state.isAuthenticated = true;
      state.token = action.payload;
    },

    setInitialized(state) {
      state.initialized = true;
    },

    logout(state) {
      state.isAuthenticated = false;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;

        localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = mapAuthError(action.error);
      })
      .addCase(registerUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUserThunk.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "SERVER_ERROR";
      });
  },
});

export const { setAuth, setInitialized, logout } = authSlice.actions;
export default authSlice.reducer;