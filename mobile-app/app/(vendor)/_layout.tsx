import { Redirect, Stack } from 'expo-router';

import { useAppSelector } from '@/store';

export default function VendorLayout() {
	const { isAuthenticated, isHydrated, role } = useAppSelector((state) => state.auth);

	if (isHydrated && !isAuthenticated) {
		return <Redirect href="/(auth)/login" />;
	}

	if (isHydrated && isAuthenticated && role !== 'vendor') {
		return <Redirect href="/" />;
	}

	return <Stack screenOptions={{ headerShown: false }} />;
}
