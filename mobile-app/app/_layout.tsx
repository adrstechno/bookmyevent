import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Provider } from 'react-redux';

import { useAuth } from '@/hooks/useAuth';
import { store } from '@/store';

function AuthBootstrap() {
	const router = useRouter();
	const segments = useSegments();
	const { isHydrated, isAuthenticated, initializeSession } = useAuth();

	useEffect(() => {
		initializeSession();
	}, [initializeSession]);

	useEffect(() => {
		if (!isHydrated) {
			return;
		}

		const isAuthRoute = segments[0] === '(auth)';

		if (isAuthenticated && isAuthRoute) {
			router.replace('/(tabs)');
		}

		if (!isAuthenticated && !isAuthRoute) {
			router.replace('/(auth)/login');
		}
	}, [isAuthenticated, isHydrated, router, segments]);

	if (!isHydrated) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return <Slot />;
}

export default function RootLayout() {
	return (
		<Provider store={store}>
			<AuthBootstrap />
		</Provider>
	);
}

