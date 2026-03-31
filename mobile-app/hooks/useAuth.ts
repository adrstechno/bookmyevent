import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '@/store';
import {
	bootstrapAuth,
	loginWithCredentials,
	registerWithCredentials,
	signIn,
	signOut,
} from '@/store/slices/authSlice';
import type { DummyAuthSession } from '@/services/auth/authService';
import type { LoginRequest, RegisterRequest } from '@/types/auth';

export const useAuth = () => {
	const dispatch = useAppDispatch();
	const auth = useAppSelector((state) => state.auth);

	const initializeSession = useCallback(async () => {
		await dispatch(bootstrapAuth());
	}, [dispatch]);

	const loginWithToken = useCallback(
		async (session: DummyAuthSession) => {
			await dispatch(signIn(session));
		},
		[dispatch]
	);

	const login = useCallback(
		async (credentials: LoginRequest) => {
			await dispatch(loginWithCredentials(credentials));
		},
		[dispatch]
	);

	const register = useCallback(
		async (payload: RegisterRequest) => {
			await dispatch(registerWithCredentials(payload));
		},
		[dispatch]
	);

	const logout = useCallback(async () => {
		await dispatch(signOut());
	}, [dispatch]);

	return {
		...auth,
		initializeSession,
		login,
		register,
		loginWithToken,
		logout,
	};
};

