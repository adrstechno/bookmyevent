import { Redirect, Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppSelector } from '@/store';

export default function TabsLayout() {
	const insets = useSafeAreaInsets();
	const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);

	if (isHydrated && !isAuthenticated) {
		return <Redirect href="/(auth)/login" />;
	}

	return (
		<Tabs
			initialRouteName="home"
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: '#0A7EA4',
				tabBarInactiveTintColor: '#64748B',
				tabBarStyle: {
					height: 56 + insets.bottom,
					paddingBottom: Math.max(insets.bottom, 8),
					paddingTop: 6,
				},
			}}
		>
			<Tabs.Screen
				name="home"
				options={{
					title: 'Home',
					tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="categories"
				options={{
					title: 'Categories',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="grid-outline" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="bookings"
				options={{
					title: 'Bookings',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="calendar-outline" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: 'Profile',
					tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
				}}
			/>
		</Tabs>
	);
}

