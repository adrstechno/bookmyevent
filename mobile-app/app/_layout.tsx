import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';

import { useAppDispatch, useAppSelector, store } from '@/store';
import { bootstrapAuth } from '@/store/slices/authSlice';

function RootNavigator() {
	const dispatch = useAppDispatch();
	const isHydrated = useAppSelector((state) => state.auth.isHydrated);

	useEffect(() => {
		dispatch(bootstrapAuth());
	}, [dispatch]);

	if (!isHydrated) {
		return (
			<View style={styles.loaderWrap}>
				<ActivityIndicator size="large" color="#0F766E" />
			</View>
		);
	}

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="(auth)" options={{ headerShown: false }} />
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			<Stack.Screen name="profile-edit" options={{ headerShown: false }} />
			<Stack.Screen name="support" options={{ headerShown: false }} />
		</Stack>
	);
}

export default function RootLayout() {
	return (
		<Provider store={store}>
			<RootNavigator />
		</Provider>
	);
}

const styles = StyleSheet.create({
	loaderWrap: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#F3F7F6',
	},
});

