import { Redirect } from 'expo-router';

import { useAppSelector } from '@/store';

export default function IndexScreen() {
	const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);

	if (!isHydrated) {
		return null;
	}

	if (isAuthenticated) {
		return <Redirect href="/(tabs)/home" />;
	}

	return <Redirect href="/(auth)/login" />;
}

