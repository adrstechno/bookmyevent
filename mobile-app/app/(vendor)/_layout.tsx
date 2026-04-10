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

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="dashboard" />
			<Stack.Screen name="shifts" />
			<Stack.Screen name="bookings" />
			<Stack.Screen name="reservations" />
			<Stack.Screen name="events" />
			<Stack.Screen name="gallery" />
			<Stack.Screen name="packages" />
			<Stack.Screen name="settings" />
			<Stack.Screen name="profile-setup" />
		</Stack>
	);
}
