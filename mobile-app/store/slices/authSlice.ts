import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { clearSession, persistSessionToken, restoreSession } from '@/services/auth/authService';

type AuthState = {
	token: string | null;
	isAuthenticated: boolean;
	isHydrated: boolean;
};

const initialState: AuthState = {
	token: null,
	isAuthenticated: false,
	isHydrated: false,
};

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async () => {
	const token = await restoreSession();
	return token;
});

export const signOut = createAsyncThunk('auth/signOut', async () => {
	await clearSession();
});

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setSignedIn(state, action: PayloadAction<string>) {
			state.token = action.payload;
			state.isAuthenticated = true;
			state.isHydrated = true;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(bootstrapAuth.fulfilled, (state, action) => {
				state.token = action.payload ?? null;
				state.isAuthenticated = Boolean(action.payload);
				state.isHydrated = true;
			})
			.addCase(bootstrapAuth.rejected, (state) => {
				state.token = null;
				state.isAuthenticated = false;
				state.isHydrated = true;
			})
			.addCase(signOut.fulfilled, (state) => {
				state.token = null;
				state.isAuthenticated = false;
			});
	},
});

export const signIn = createAsyncThunk('auth/signIn', async (token: string, { dispatch }) => {
	await persistSessionToken(token);
	dispatch(setSignedIn(token));
});

export const { setSignedIn } = authSlice.actions;
export default authSlice.reducer;

