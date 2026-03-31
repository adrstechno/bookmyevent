import { Redirect, Stack } from 'expo-router';

import { useAppSelector } from '@/store';

export default function AuthLayout() {
	const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);

	if (isHydrated && isAuthenticated) {
		return <Redirect href="/(tabs)/home" />;
	}

	return <Stack screenOptions={{ headerShown: false }} />;
}
