import type { AxiosError } from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser, registerUser, forgotPassword } from "@/services/api";
import { mapAuthError } from "@/services/auth/mapAuthError";
import { AuthErrorCode } from "@/services/auth/authErrors";
import { User } from "@/types/types";

type AuthErrorState = {
  code: AuthErrorCode;
  retryAt?: string;
} | null;

interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  error: AuthErrorState;
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

 type AuthRejectValue = {
  code: AuthErrorCode;
  message?: string;
  retryAt?: string;
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
    avatarUrl?: string;
  },
  {
    rejectValue: AuthRejectValue;
  }
>(
  "auth/registerUser",
  async (data, { rejectWithValue }) => {
    try {
      const response = await registerUser(data);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{
        code?: string;
        retryAt?: string;
      }>;

      if (
        err.response?.status === 403 &&
        err.response?.data?.retryAt
      ) {
        return rejectWithValue({
          code: AuthErrorCode.REGISTRATION_BLOCKED,
          retryAt: err.response.data.retryAt,
        });
      }

      return rejectWithValue({
        code: mapAuthError(error),
      });
    }
  }
);

export const forgotPasswordThunk = createAsyncThunk<
  void,
  string,
  {
    rejectValue: AuthRejectValue;
  }
>(
  "auth/forgot-password",
  async (email, { rejectWithValue }) => {
    try {
      await forgotPassword(email);

    } catch (error) {
      const err = error as AxiosError<{
        message?: string;
        code?: AuthErrorCode;
        retryAt?: string;
      }>;

      if (
        err.response?.status === 403 &&
        err.response.data?.retryAt
      ) {
        return rejectWithValue({
          code: AuthErrorCode.PASSWORD_RESET_BLOCKED,
          retryAt: err.response.data.retryAt,
        });
      }

      return rejectWithValue({
        code: mapAuthError(error),
      });
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
        state.error = {
          code: mapAuthError(action.error),
        };
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
        state.error = action.payload ?? {
          code: AuthErrorCode.SERVER_ERROR,
        };
      })
      .addCase(forgotPasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(forgotPasswordThunk.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })

      .addCase(forgotPasswordThunk.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload ?? {
            code: AuthErrorCode.SERVER_ERROR,
          };
      });
  },
});

export const { setAuth, setInitialized, logout } = authSlice.actions;
export default authSlice.reducer;