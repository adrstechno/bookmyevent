import { Redirect, Stack } from 'expo-router';

import { useAppSelector } from '@/store';
import { getRoleHomeRoute } from '@/utils/authRole';

export default function AuthLayout() {
	const { isAuthenticated, isHydrated, role } = useAppSelector((state) => state.auth);

	if (isHydrated && isAuthenticated) {
		return <Redirect href={getRoleHomeRoute(role)} />;
	}

	return <Stack screenOptions={{ headerShown: false }} />;
}
