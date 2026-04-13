/**
 * authSlice.ts
 * Real backend integration — no dummy credentials.
 * Server: localhost:3232 (configured in mobile-app/.env)
 */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
	clearSession,
	type AuthSession,
	type UserRole,
	persistSession,
	restoreSession,
} from '@/services/auth/authService';
import { login as apiLogin, register as apiRegister } from '@/services/auth/authApi';
import type { LoginRequest, RegisterRequest } from '@/types/auth';

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

// ─── Helper ──────────────────────────────────────────────────

const extractMessage = (error: unknown, fallback: string): string => {
	if (error instanceof Error) return error.message;
	if (error && typeof error === 'object') {
		const e = error as Record<string, unknown>;
		if (typeof e['message'] === 'string' && e['message'].trim()) return e['message'];
	}
	return fallback;
};

// ─── Thunks ──────────────────────────────────────────────────

/** Restore session from SecureStore on app launch */
export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async () => {
	return await restoreSession();
});

/** Sign out — clear token from store + SecureStore */
export const signOut = createAsyncThunk('auth/signOut', async () => {
	await clearSession();
});

/** Login with real backend */
export const loginWithCredentials = createAsyncThunk(
	'auth/loginWithCredentials',
	async (credentials: LoginRequest, { rejectWithValue }) => {
		try {
			const response = await apiLogin({
				email: credentials.email.trim().toLowerCase(),
				password: credentials.password.trim(),
			});

			const session: AuthSession = {
				token: response.token,
				role: response.role as UserRole,
				name: response.name,
				email: response.email,
			};

			await persistSession(session);

			return {
				session,
				userId: response.user_id,
			};
		} catch (error: unknown) {
			// Backend sends 403 when email not verified
			const apiErr = error as {
				status?: number;
				message?: string;
				details?: { requiresVerification?: boolean; email?: string };
			};

			if (apiErr?.status === 403) {
				return rejectWithValue({
					message: apiErr.message ?? 'Please verify your email before logging in.',
					requiresVerification: true,
					email: credentials.email,
				});
			}

			return rejectWithValue({
				message: extractMessage(error, 'Login failed. Please check your credentials.'),
				requiresVerification: false,
			});
		}
	}
);

/** Register with real backend — does NOT auto-login (email verification required) */
export const registerWithCredentials = createAsyncThunk(
	'auth/registerWithCredentials',
	async (payload: RegisterRequest, { rejectWithValue }) => {
		try {
			const response = await apiRegister({
				firstName: payload.firstName.trim(),
				lastName: payload.lastName.trim(),
				email: payload.email.trim().toLowerCase(),
				password: payload.password.trim(),
				phone: payload.phone.trim(),
				userType: payload.userType,
			});

			return {
				message: response.message,
				requiresVerification: response.requiresVerification ?? true,
				email: payload.email.trim().toLowerCase(),
			};
		} catch (error: unknown) {
			return rejectWithValue({
				message: extractMessage(error, 'Registration failed. Please try again.'),
			});
		}
	}
);

// ─── Slice ───────────────────────────────────────────────────

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setSignedIn(state, action: PayloadAction<AuthSession & { userId?: string }>) {
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
				const payload = action.payload as {
					message?: string;
					requiresVerification?: boolean;
					email?: string;
				} | undefined;
				state.error = payload?.message ?? 'Login failed.';
				state.requiresVerification = payload?.requiresVerification ?? false;
				state.pendingVerificationEmail = payload?.email ?? null;
			});

		// ── Register ──
		builder
			.addCase(registerWithCredentials.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(registerWithCredentials.fulfilled, (state, action) => {
				state.isLoading = false;
				state.error = null;
				// Registration does NOT log in — user must verify email first
				state.requiresVerification = action.payload.requiresVerification;
				state.pendingVerificationEmail = action.payload.email;
			})
			.addCase(registerWithCredentials.rejected, (state, action) => {
				state.isLoading = false;
				const payload = action.payload as { message?: string } | undefined;
				state.error = payload?.message ?? 'Registration failed.';
			});

		// ── Sign Out ──
		builder.addCase(signOut.fulfilled, (state) => {
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
		});
	},
});

export const signIn = createAsyncThunk(
	'auth/signIn',
	async (session: AuthSession, { dispatch }) => {
		await persistSession(session);
		dispatch(setSignedIn(session));
	}
);

export const { setSignedIn, clearAuthError, clearVerificationState } = authSlice.actions;
export default authSlice.reducer;
