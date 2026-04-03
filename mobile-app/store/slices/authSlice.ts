import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
	clearSession,
	type AuthSession,
	type UserRole,
	persistSession,
	restoreSession,
} from '@/services/auth/authService';
import type { LoginRequest, RegisterRequest } from '@/types/auth';

type AuthState = {
	token: string | null;
	role: UserRole | null;
	name: string | null;
	email: string | null;
	isAuthenticated: boolean;
	isHydrated: boolean;
	isLoading: boolean;
	error: string | null;
};

const initialState: AuthState = {
	token: null,
	role: null,
	name: null,
	email: null,
	isAuthenticated: false,
	isHydrated: false,
	isLoading: false,
	error: null,
};

const DUMMY_AUTH_ENABLED = true;

const DUMMY_CREDENTIALS: Record<UserRole, { email: string; password: string; name: string }> = {
	user: {
		email: 'user@test.com',
		password: '123456',
		name: 'Demo User',
	},
	vendor: {
		email: 'vendor@test.com',
		password: '123456',
		name: 'Demo Vendor',
	},
	admin: {
		email: 'admin@test.com',
		password: '123456',
		name: 'Demo Admin',
	},
};

const toNameFromEmail = (email: string) => {
	const prefix = email.split('@')[0] ?? 'Guest';
	return prefix.charAt(0).toUpperCase() + prefix.slice(1);
};

const toErrorMessage = (error: unknown, fallback: string) => {
	if (error instanceof Error) {
		return error.message;
	}

	if (error && typeof error === 'object' && 'message' in error) {
		const message = (error as { message?: unknown }).message;
		if (typeof message === 'string' && message.trim().length > 0) {
			return message;
		}
	}

	return fallback;
};

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async () => {
	const session = await restoreSession();
	return session;
});

export const signOut = createAsyncThunk('auth/signOut', async () => {
	await clearSession();
});

export const loginWithCredentials = createAsyncThunk(
	'auth/loginWithCredentials',
	async (credentials: LoginRequest, { rejectWithValue }) => {
		try {
			const email = credentials.email?.trim().toLowerCase();
			const password = credentials.password?.trim();
			const role = credentials.userType;

			if (!email || !password || !role) {
				return rejectWithValue('Please enter email, password, and role.');
			}

			if (DUMMY_AUTH_ENABLED) {
				const expected = DUMMY_CREDENTIALS[role];
				if (email !== expected.email || password !== expected.password) {
					return rejectWithValue(
						`Use demo credentials for ${role}: ${expected.email} / ${expected.password}`
					);
				}

				const session: AuthSession = {
					token: `dummy-token-${role}`,
					role,
					name: expected.name,
					email: expected.email,
				};

				await persistSession(session);
				return session;
			}

			const session: AuthSession = {
				token: 'disabled-in-dummy-mode',
				role,
				name: toNameFromEmail(email),
				email,
			};

			await persistSession(session);
			return session;
		} catch (error) {
			const message = toErrorMessage(error, 'Unable to login. Please try again.');
			return rejectWithValue(message);
		}
	}
);

export const registerWithCredentials = createAsyncThunk(
	'auth/registerWithCredentials',
	async (payload: RegisterRequest, { rejectWithValue }) => {
		try {
			const email = payload.email?.trim().toLowerCase();
			const password = payload.password?.trim();
			const firstName = payload.firstName?.trim();
			const lastName = payload.lastName?.trim();
			const role = payload.userType || 'user';

			if (!firstName || !lastName || !email || !password || !role) {
				return rejectWithValue('Please fill all required fields.');
			}

			if (password.length < 4) {
				return rejectWithValue('Password must be at least 4 characters.');
			}

			if (DUMMY_AUTH_ENABLED) {
				const session: AuthSession = {
					token: `dummy-token-${role}-${Date.now()}`,
					role,
					name: `${firstName} ${lastName}`,
					email,
				};

				await persistSession(session);
				return session;
			}

			const session: AuthSession = {
				token: 'disabled-in-dummy-mode',
				role,
				name: `${firstName} ${lastName}`,
				email,
			};

			await persistSession(session);
			return session;
		} catch (error) {
			const message = toErrorMessage(error, 'Unable to register. Please try again.');
			return rejectWithValue(message);
		}
	}
);

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setSignedIn(state, action: PayloadAction<AuthSession>) {
			state.token = action.payload.token;
			state.role = action.payload.role;
			state.name = action.payload.name;
			state.email = action.payload.email;
			state.isAuthenticated = true;
			state.isHydrated = true;
			state.error = null;
		},
		clearAuthError(state) {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(loginWithCredentials.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(loginWithCredentials.fulfilled, (state, action) => {
				state.token = action.payload.token;
				state.role = action.payload.role;
				state.name = action.payload.name;
				state.email = action.payload.email;
				state.isAuthenticated = true;
				state.isHydrated = true;
				state.isLoading = false;
				state.error = null;
			})
			.addCase(loginWithCredentials.rejected, (state, action) => {
				state.isLoading = false;
				state.error =
					typeof action.payload === 'string'
						? action.payload
						: 'Login failed. Please verify your credentials.';
			})
			.addCase(registerWithCredentials.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(registerWithCredentials.fulfilled, (state, action) => {
				state.token = action.payload.token;
				state.role = action.payload.role;
				state.name = action.payload.name;
				state.email = action.payload.email;
				state.isAuthenticated = true;
				state.isHydrated = true;
				state.isLoading = false;
				state.error = null;
			})
			.addCase(registerWithCredentials.rejected, (state, action) => {
				state.isLoading = false;
				state.error =
					typeof action.payload === 'string'
						? action.payload
						: 'Registration failed. Please try again.';
			})
			.addCase(bootstrapAuth.fulfilled, (state, action) => {
				state.token = action.payload?.token ?? null;
				state.role = action.payload?.role ?? null;
				state.name = action.payload?.name ?? null;
				state.email = action.payload?.email ?? null;
				state.isAuthenticated = Boolean(action.payload?.token);
				state.isHydrated = true;
				state.error = null;
			})
			.addCase(bootstrapAuth.rejected, (state) => {
				state.token = null;
				state.role = null;
				state.name = null;
				state.email = null;
				state.isAuthenticated = false;
				state.isHydrated = true;
				state.error = null;
			})
			.addCase(signOut.fulfilled, (state) => {
				state.token = null;
				state.role = null;
				state.name = null;
				state.email = null;
				state.isAuthenticated = false;
				state.isHydrated = true;
				state.isLoading = false;
				state.error = null;
			});
	},
});

export const signIn = createAsyncThunk('auth/signIn', async (session: AuthSession, { dispatch }) => {
	await persistSession(session);
	dispatch(setSignedIn(session));
});

export const { setSignedIn, clearAuthError } = authSlice.actions;
export default authSlice.reducer;

