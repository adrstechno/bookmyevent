import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { authEndpoints } from '@/services/api/endpoints';
import { clearSession, persistSessionToken, restoreSession } from '@/services/auth/authService';
import { AuthUser, LoginRequest, RegisterRequest } from '@/types';

type AuthState = {
	token: string | null;
	isAuthenticated: boolean;
	isHydrated: boolean;
	user: AuthUser | null;
	errorMessage: string | null;
	isLoading: boolean;
};

const initialState: AuthState = {
	token: null,
	isAuthenticated: false,
	isHydrated: false,
	user: null,
	errorMessage: null,
	isLoading: false,
};

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async () => {
	const token = await restoreSession();

	if (!token) {
		return { token: null, user: null };
	}

	try {
		const response = await authEndpoints.validateToken();
		return {
			token,
			user: response.user,
		};
	} catch {
		await clearSession();
		return { token: null, user: null };
	}
});

export const signInWithCredentials = createAsyncThunk(
	'auth/signInWithCredentials',
	async (payload: LoginRequest, { rejectWithValue }) => {
		try {
			const response = await authEndpoints.login(payload);
			await persistSessionToken(response.token);

			const user: AuthUser = {
				uuid: response.user_id,
				email: response.email,
				first_name: response.first_name,
				last_name: response.last_name,
				user_type: response.role,
			};

			return { token: response.token, user };
		} catch (error) {
			const message =
				typeof error === 'object' &&
				error !== null &&
				'message' in error &&
				typeof (error as { message?: string }).message === 'string'
					? (error as { message: string }).message
					: 'Login failed. Please try again.';

			return rejectWithValue(message);
		}
	}
);

export const registerUser = createAsyncThunk(
	'auth/registerUser',
	async (payload: RegisterRequest, { rejectWithValue }) => {
		try {
			const response = await authEndpoints.register(payload);
			return response;
		} catch (error) {
			const message =
				typeof error === 'object' &&
				error !== null &&
				'message' in error &&
				typeof (error as { message?: string }).message === 'string'
					? (error as { message: string }).message
					: 'Registration failed. Please try again.';

			return rejectWithValue(message);
		}
	}
);

export const requestPasswordReset = createAsyncThunk(
	'auth/requestPasswordReset',
	async (email: string, { rejectWithValue }) => {
		try {
			return await authEndpoints.forgotPassword({ email });
		} catch (error) {
			const message =
				typeof error === 'object' &&
				error !== null &&
				'message' in error &&
				typeof (error as { message?: string }).message === 'string'
					? (error as { message: string }).message
					: 'Failed to send reset email.';
			return rejectWithValue(message);
		}
	}
);

export const verifyResetToken = createAsyncThunk(
	'auth/verifyResetToken',
	async (token: string, { rejectWithValue }) => {
		try {
			return await authEndpoints.verifyResetToken(token);
		} catch (error) {
			const message =
				typeof error === 'object' &&
				error !== null &&
				'message' in error &&
				typeof (error as { message?: string }).message === 'string'
					? (error as { message: string }).message
					: 'Reset token is invalid or expired.';
			return rejectWithValue(message);
		}
	}
);

export const resetPassword = createAsyncThunk(
	'auth/resetPassword',
	async (
		payload: {
			token: string;
			newPassword: string;
			confirmPassword: string;
		},
		{ rejectWithValue }
	) => {
		try {
			return await authEndpoints.resetPassword(payload);
		} catch (error) {
			const message =
				typeof error === 'object' &&
				error !== null &&
				'message' in error &&
				typeof (error as { message?: string }).message === 'string'
					? (error as { message: string }).message
					: 'Failed to reset password.';
			return rejectWithValue(message);
		}
	}
);

export const verifyEmail = createAsyncThunk(
	'auth/verifyEmail',
	async (token: string, { rejectWithValue }) => {
		try {
			return await authEndpoints.verifyEmail(token);
		} catch (error) {
			const message =
				typeof error === 'object' &&
				error !== null &&
				'message' in error &&
				typeof (error as { message?: string }).message === 'string'
					? (error as { message: string }).message
					: 'Email verification failed.';
			return rejectWithValue(message);
		}
	}
);

export const resendVerification = createAsyncThunk(
	'auth/resendVerification',
	async (email: string, { rejectWithValue }) => {
		try {
			return await authEndpoints.resendVerification({ email });
		} catch (error) {
			const message =
				typeof error === 'object' &&
				error !== null &&
				'message' in error &&
				typeof (error as { message?: string }).message === 'string'
					? (error as { message: string }).message
					: 'Failed to resend verification email.';
			return rejectWithValue(message);
		}
	}
);

export const signOut = createAsyncThunk('auth/signOut', async () => {
	try {
		await authEndpoints.logout();
	} catch {
		// Clearing local session must still succeed even if API logout fails.
	}
	await clearSession();
});

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setSignedIn(state, action: PayloadAction<{ token: string; user: AuthUser }>) {
			state.token = action.payload.token;
			state.user = action.payload.user;
			state.isAuthenticated = true;
			state.isHydrated = true;
			state.errorMessage = null;
		},
		clearAuthError(state) {
			state.errorMessage = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(bootstrapAuth.pending, (state) => {
				state.isLoading = true;
				state.errorMessage = null;
			})
			.addCase(bootstrapAuth.fulfilled, (state, action) => {
				state.token = action.payload.token;
				state.user = action.payload.user;
				state.isAuthenticated = Boolean(action.payload.token);
				state.isHydrated = true;
				state.isLoading = false;
			})
			.addCase(bootstrapAuth.rejected, (state) => {
				state.token = null;
				state.user = null;
				state.isAuthenticated = false;
				state.isHydrated = true;
				state.isLoading = false;
			})
			.addCase(signInWithCredentials.pending, (state) => {
				state.isLoading = true;
				state.errorMessage = null;
			})
			.addCase(signInWithCredentials.fulfilled, (state, action) => {
				state.token = action.payload.token;
				state.user = action.payload.user;
				state.isAuthenticated = true;
				state.isHydrated = true;
				state.isLoading = false;
			})
			.addCase(signInWithCredentials.rejected, (state, action) => {
				state.isLoading = false;
				state.errorMessage = (action.payload as string) ?? 'Login failed.';
			})
			.addCase(registerUser.pending, (state) => {
				state.isLoading = true;
				state.errorMessage = null;
			})
			.addCase(registerUser.fulfilled, (state) => {
				state.isLoading = false;
			})
			.addCase(registerUser.rejected, (state, action) => {
				state.isLoading = false;
				state.errorMessage = (action.payload as string) ?? 'Registration failed.';
			})
			.addCase(signOut.fulfilled, (state) => {
				state.token = null;
				state.user = null;
				state.isAuthenticated = false;
				state.errorMessage = null;
				state.isLoading = false;
			});
	},
});

export const { setSignedIn, clearAuthError } = authSlice.actions;
export default authSlice.reducer;

