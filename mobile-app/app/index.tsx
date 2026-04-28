import { Redirect } from 'expo-router';

import { useAppSelector } from '@/store';
import { getRoleHomeRoute } from '@/utils/authRole';

export default function IndexScreen() {
	const { isAuthenticated, isHydrated, role } = useAppSelector((state) => state.auth);

	if (!isHydrated) {
		return null;
	}

	if (isAuthenticated) {
		return <Redirect href={getRoleHomeRoute(role)} />;
	}

	return <Redirect href="/(auth)/login" />;
}

