import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppTopBar } from '@/components/layout/AppTopBar';
import { ThemedText } from '@/components/themed-text';
import { useAppSelector } from '@/store';
import { useSettingsTheme } from '@/theme/settingsTheme';

export default function FavoritesScreen() {
	const router = useRouter();
	const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);
	const { mode, palette } = useSettingsTheme();
	const isDark = mode === 'dark';
	const screenBg = palette.screenBg;

	const goToProfile = useCallback(() => {
		router.replace('/(tabs)/profile');
	}, [router]);

	useEffect(() => {
		const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
			goToProfile();
			return true;
		});

		return () => subscription.remove();
	}, [goToProfile]);

	if (isHydrated && !isAuthenticated) {
		return <Redirect href="/(auth)/login" />;
	}

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: screenBg }]} edges={['top', 'bottom']}>
			<StatusBar style={isDark ? 'light' : 'dark'} />
			<AppTopBar title="Favorites" onBackPress={goToProfile} />

			<View style={styles.contentWrap}>
				<ThemedText style={[styles.emptyText, { color: palette.subtext }]}>No faburates yet....</ThemedText>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#F4F7F9',
	},
	contentWrap: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 20,
	},
	emptyText: {
		fontSize: 16,
		fontWeight: '700',
		color: '#475569',
		textAlign: 'center',
	},
});