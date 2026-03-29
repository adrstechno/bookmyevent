import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '@/store';
import {
	bootstrapAuth,
	clearAuthError,
	registerUser,
	requestPasswordReset,
	resendVerification,
	resetPassword,
	signInWithCredentials,
	signOut,
	verifyEmail,
	verifyResetToken,
} from '@/store/slices/authSlice';
import { LoginRequest, RegisterRequest } from '@/types';

export const useAuth = () => {
	const dispatch = useAppDispatch();
	const auth = useAppSelector((state) => state.auth);

	const initializeSession = useCallback(async () => {
		await dispatch(bootstrapAuth());
	}, [dispatch]);

	const login = useCallback(
		async (payload: LoginRequest) => {
			return dispatch(signInWithCredentials(payload)).unwrap();
		},
		[dispatch]
	);

	const register = useCallback(
		async (payload: RegisterRequest) => {
			return dispatch(registerUser(payload)).unwrap();
		},
		[dispatch]
	);

	const forgotPassword = useCallback(
		async (email: string) => {
			return dispatch(requestPasswordReset(email)).unwrap();
		},
		[dispatch]
	);

	const checkResetToken = useCallback(
		async (token: string) => {
			return dispatch(verifyResetToken(token)).unwrap();
		},
		[dispatch]
	);

	const submitPasswordReset = useCallback(
		async (payload: { token: string; newPassword: string; confirmPassword: string }) => {
			return dispatch(resetPassword(payload)).unwrap();
		},
		[dispatch]
	);

	const confirmEmail = useCallback(
		async (token: string) => {
			return dispatch(verifyEmail(token)).unwrap();
		},
		[dispatch]
	);

	const resendEmailVerification = useCallback(
		async (email: string) => {
			return dispatch(resendVerification(email)).unwrap();
		},
		[dispatch]
	);

	const logout = useCallback(async () => {
		await dispatch(signOut());
	}, [dispatch]);

	const clearError = useCallback(() => {
		dispatch(clearAuthError());
	}, [dispatch]);

	return {
		...auth,
		initializeSession,
		login,
		register,
		forgotPassword,
		checkResetToken,
		submitPasswordReset,
		confirmEmail,
		resendEmailVerification,
		logout,
		clearError,
	};
};

