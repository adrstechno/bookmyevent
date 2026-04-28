import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { AppTopBar } from '@/components/layout/AppTopBar';
import { ThemedText } from '@/components/themed-text';
import { favoritesService, type FavoriteEvent } from '@/services/favorites/favoritesService';
import { useAppSelector } from '@/store';
import { useSettingsTheme } from '@/theme/settingsTheme';

export default function FavoritesScreen() {
	const router = useRouter();
	const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);
	const { mode, palette } = useSettingsTheme();
	const isDark = mode === 'dark';
	const screenBg = palette.screenBg;
	const [items, setItems] = useState<FavoriteEvent[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const loadFavorites = useCallback(async () => {
		setIsLoading(true);
		const nextItems = await favoritesService.getAll();
		setItems(nextItems);
		setIsLoading(false);
	}, []);

	const goToProfile = useCallback(() => {
		router.replace('/(tabs)/profile');
	}, [router]);

	const onOpenCategories = useCallback(() => {
		router.push('/(tabs)/categories');
	}, [router]);

	const onRemove = useCallback(async (item: FavoriteEvent) => {
		const nextItems = await favoritesService.setFavorite(item, false);
		setItems(nextItems);
	}, []);

	useFocusEffect(
		useCallback(() => {
			void loadFavorites();
		}, [loadFavorites])
	);

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

			<ScrollView style={styles.contentWrap} contentContainerStyle={styles.contentContainer}>
				{isLoading ? (
					<ThemedText style={[styles.emptyText, { color: palette.subtext }]}>Loading favorites...</ThemedText>
				) : items.length === 0 ? (
					<View style={styles.emptyWrap}>
						<ThemedText style={[styles.emptyText, { color: palette.subtext }]}>No favorites yet.</ThemedText>
						<Pressable style={[styles.exploreBtn, { backgroundColor: palette.primary }]} onPress={onOpenCategories}>
							<ThemedText style={styles.exploreBtnText}>Explore Services</ThemedText>
						</Pressable>
					</View>
				) : (
					items.map((item) => (
						<View key={item.id} style={[styles.card, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}> 
							<ThemedText style={[styles.cardTitle, { color: palette.text }]}>{item.title}</ThemedText>
							<ThemedText style={[styles.cardDescription, { color: palette.subtext }]}>{item.description}</ThemedText>
							<Pressable style={[styles.removeBtn, { borderColor: palette.primaryStrong }]} onPress={() => void onRemove(item)}>
								<ThemedText style={[styles.removeBtnText, { color: palette.primaryStrong }]}>Remove</ThemedText>
							</Pressable>
						</View>
					))
				)}
			</ScrollView>
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
	},
	contentContainer: {
		paddingHorizontal: 16,
		paddingVertical: 14,
		gap: 12,
	},
	emptyWrap: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 20,
		paddingTop: 40,
		gap: 12,
	},
	emptyText: {
		fontSize: 16,
		fontWeight: '700',
		color: '#475569',
		textAlign: 'center',
	},
	card: {
		borderWidth: 1,
		borderRadius: 14,
		padding: 14,
		gap: 8,
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: '800',
	},
	cardDescription: {
		fontSize: 13,
		lineHeight: 19,
	},
	removeBtn: {
		alignSelf: 'flex-start',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 999,
		borderWidth: 1,
	},
	removeBtnText: {
		fontSize: 12,
		fontWeight: '700',
	},
	exploreBtn: {
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 12,
	},
	exploreBtnText: {
		color: '#FFFFFF',
		fontWeight: '700',
	},
});