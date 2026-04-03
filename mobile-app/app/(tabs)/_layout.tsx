import { Redirect, Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppSelector } from '@/store';
import { useSettingsTheme } from '@/theme/settingsTheme';
import { getRoleHomeRoute } from '@/utils/authRole';

export default function TabsLayout() {
	const insets = useSafeAreaInsets();
	const { palette } = useSettingsTheme();
	const { isAuthenticated, isHydrated, role } = useAppSelector((state) => state.auth);

	if (isHydrated && !isAuthenticated) {
		return <Redirect href="/(auth)/login" />;
	}

	if (isHydrated && isAuthenticated && role && role !== 'user') {
		return <Redirect href={getRoleHomeRoute(role)} />;
	}

	return (
		<Tabs
			initialRouteName="home"
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: palette.primary,
				tabBarInactiveTintColor: palette.muted,
				tabBarStyle: {
					height: 62 + insets.bottom,
					paddingBottom: Math.max(insets.bottom, 6),
					paddingTop: 6,
					backgroundColor: palette.surfaceBg,
					borderTopColor: palette.border,
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
					title: 'Services',
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

