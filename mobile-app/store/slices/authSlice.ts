/**
 * authSlice.ts
 * Real backend integration — no dummy credentials.
 * Server: localhost:3232 (configured in mobile-app/.env)
 */
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import * as authApi from "@/services/auth/authApi";
import {
  clearSession,
  type AuthSession,
  type UserRole,
  persistSession,
  restoreSession,
} from "@/services/auth/authService";
import {
  login as apiLogin,
  register as apiRegister,
} from "@/services/auth/authApi";
import type { LoginRequest, RegisterRequest } from "@/types/auth";
import { isTokenExpired } from "@/utils/jwt";

// ─── State ───────────────────────────────────────────────────

type AuthState = {
  token: string | null;
  role: UserRole | null;
  name: string | null;
  email: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  /** true when backend says email not verified yet */
  requiresVerification: boolean;
  /** email to show in "check your inbox" message */
  pendingVerificationEmail: string | null;
};

export type LoginErrorPayload = {
  message: string;
  requiresVerification?: boolean;
  email?: string;
};

const initialState: AuthState = {
  token: null,
  role: null,
  name: null,
  email: null,
  userId: null,
  isAuthenticated: false,
  isHydrated: false,
  isLoading: false,
  error: null,
  requiresVerification: false,
  pendingVerificationEmail: null,
};

const toNameFromEmail = (email: string) => {
  const prefix = email.split("@")[0] ?? "Guest";
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
};

const toErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const e = error as Record<string, unknown>;
    if (typeof e["message"] === "string" && e["message"].trim())
      return e["message"];
  }
  return fallback;
};

const toLoginErrorPayload = (
  error: unknown,
  fallback: string,
): LoginErrorPayload => {
  const message = toErrorMessage(error, fallback);

  if (error && typeof error === "object" && "details" in error) {
    const details = (error as { details?: unknown }).details;
    if (details && typeof details === "object") {
      const requiresVerification = Boolean(
        (details as { requiresVerification?: unknown }).requiresVerification,
      );
      const email =
        typeof (details as { email?: unknown }).email === "string"
          ? (details as { email: string }).email
          : undefined;

      return {
        message,
        requiresVerification,
        email,
      };
    }
  }

  return { message };
};

export const bootstrapAuth = createAsyncThunk("auth/bootstrap", async () => {
  const session = await restoreSession();

  if (session?.token && isTokenExpired(session.token)) {
    await clearSession();
    return null;
  }

  return session;
});

/** Sign out — clear token from store + SecureStore */
export const signOut = createAsyncThunk("auth/signOut", async () => {
  await clearSession();
});

export const handleSessionExpired = createAsyncThunk(
  "auth/handleSessionExpired",
  async () => {
    await clearSession();
  },
);

export const loginWithCredentials = createAsyncThunk(
  "auth/loginWithCredentials",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const email = credentials.email?.trim().toLowerCase();
      const password = credentials.password?.trim();

      if (!email || !password) {
        return rejectWithValue("Email and password are required.");
      }

      // Call real backend login API
      const loginResponse = await authApi.login({
        email,
        password,
      });

      const session: AuthSession = {
        token: loginResponse.token,
        role: loginResponse.role,
        name: loginResponse.name,
        email: loginResponse.email,
      };

      await persistSession(session);
      return {
        session,
        userId: loginResponse.userId || null,
      };
    } catch (error) {
      return rejectWithValue(
        toLoginErrorPayload(
          error,
          "Login failed. Please verify your credentials.",
        ),
      );
    }
  },
);

/** Register with real backend — does NOT auto-login (email verification required) */
export const registerWithCredentials = createAsyncThunk(
  "auth/registerWithCredentials",
  async (payload: RegisterRequest, { rejectWithValue }) => {
    try {
      const email = payload.email?.trim().toLowerCase();
      const password = payload.password?.trim();
      const firstName = payload.firstName?.trim();
      const lastName = payload.lastName?.trim();
      const phone = payload.phone?.trim();
      const role = payload.userType || "user";

      if (!email || !password || !phone) {
        return rejectWithValue("Email, password, and phone are required.");
      }

      if (password.length < 4) {
        return rejectWithValue("Password must be at least 4 characters.");
      }

      const fallbackName = toNameFromEmail(email ?? "guest@example.com");
      const normalizedFirstName = firstName || fallbackName;
      const normalizedLastName = lastName || "";

      // Call real backend register API
      const registerResponse = await authApi.register({
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        email,
        password,
        phone,
        userType: role,
      });

      // Do not auto-login after registration; backend may require email verification first.
      return {
        token: null,
        role,
        name: `${normalizedFirstName} ${normalizedLastName}`.trim(),
        email,
        message: registerResponse.message,
        requiresVerification: registerResponse.requiresVerification ?? true,
      };
    } catch (error) {
      const message = toErrorMessage(
        error,
        "Registration failed. Please try again.",
      );
      return rejectWithValue(message);
    }
  },
);

// ─── Slice ───────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSignedIn(
      state,
      action: PayloadAction<AuthSession & { userId?: string }>,
    ) {
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.userId = action.payload.userId ?? null;
      state.isAuthenticated = true;
      state.isHydrated = true;
      state.error = null;
      state.requiresVerification = false;
      state.pendingVerificationEmail = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
    clearVerificationState(state) {
      state.requiresVerification = false;
      state.pendingVerificationEmail = null;
      state.error = null;
    },
    sessionExpired(state) {
      state.token = null;
      state.role = null;
      state.name = null;
      state.email = null;
      state.isAuthenticated = false;
      state.error = "Session expired. Please log in again.";
    },
  },
  extraReducers: (builder) => {
    // ── Bootstrap ──
    builder
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        const s = action.payload;
        state.token = s?.token ?? null;
        state.role = s?.role ?? null;
        state.name = s?.name ?? null;
        state.email = s?.email ?? null;
        state.isAuthenticated = Boolean(s?.token);
        state.isHydrated = true;
        state.error = null;
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.isAuthenticated = false;
        state.isHydrated = true;
      });

    // ── Login ──
    builder
      .addCase(loginWithCredentials.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.requiresVerification = false;
        state.pendingVerificationEmail = null;
      })
      .addCase(loginWithCredentials.fulfilled, (state, action) => {
        const { session, userId } = action.payload;
        state.token = session.token;
        state.role = session.role;
        state.name = session.name;
        state.email = session.email;
        state.userId = userId ?? null;
        state.isAuthenticated = true;
        state.isHydrated = true;
        state.isLoading = false;
        state.error = null;
        state.requiresVerification = false;
        state.pendingVerificationEmail = null;
      })
      .addCase(loginWithCredentials.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : typeof action.payload === "object" &&
                action.payload &&
                "message" in action.payload
              ? String(
                  (action.payload as { message?: unknown }).message ??
                    "Login failed. Please verify your credentials.",
                )
              : "Login failed. Please verify your credentials.";
      })
      .addCase(registerWithCredentials.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerWithCredentials.fulfilled, (state, action) => {
        state.token = null;
        state.role = null;
        state.name = null;
        state.email = action.payload.email;
        state.isAuthenticated = false;
        state.isHydrated = true;
        state.isLoading = false;
        state.error = null;
        // Registration does NOT log in — user must verify email first
        state.requiresVerification = action.payload.requiresVerification;
        state.pendingVerificationEmail = action.payload.email;
      })
      .addCase(registerWithCredentials.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Registration failed. Please try again.";
      })
      .addCase(signOut.fulfilled, (state) => {
        state.token = null;
        state.role = null;
        state.name = null;
        state.email = null;
        state.userId = null;
        state.isAuthenticated = false;
        state.isHydrated = true;
        state.isLoading = false;
        state.error = null;
        state.requiresVerification = false;
        state.pendingVerificationEmail = null;
      })
      .addCase(handleSessionExpired.fulfilled, (state) => {
        state.token = null;
        state.role = null;
        state.name = null;
        state.email = null;
        state.isAuthenticated = false;
        state.isHydrated = true;
        state.isLoading = false;
        state.error = "Session expired. Please log in again.";
      });
  },
});

export const signIn = createAsyncThunk(
  "auth/signIn",
  async (session: AuthSession, { dispatch }) => {
    await persistSession(session);
    dispatch(setSignedIn(session));
  },
);

export const { setSignedIn, clearAuthError, clearVerificationState, sessionExpired } =
  authSlice.actions;
export default authSlice.reducer;
