import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '@/store';
import { bootstrapAuth, signIn, signOut } from '@/store/slices/authSlice';

export const useAuth = () => {
	const dispatch = useAppDispatch();
	const auth = useAppSelector((state) => state.auth);

	const initializeSession = useCallback(async () => {
		await dispatch(bootstrapAuth());
	}, [dispatch]);

	const loginWithToken = useCallback(
		async (token: string) => {
			await dispatch(signIn(token));
		},
		[dispatch]
	);

	const logout = useCallback(async () => {
		await dispatch(signOut());
	}, [dispatch]);

	return {
		...auth,
		initializeSession,
		loginWithToken,
		logout,
	};
};

