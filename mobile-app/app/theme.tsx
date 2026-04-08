import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppTopBar } from '@/components/layout/AppTopBar';
import { ThemedText } from '@/components/themed-text';
import { useAppSelector } from '@/store';
import { useSettingsTheme, type SettingsThemeMode } from '@/theme/settingsTheme';

const THEME_OPTIONS: Array<{
	key: SettingsThemeMode;
	label: string;
	description: string;
}> = [
	{ key: 'light', label: 'Light', description: 'Use a bright interface for daytime usage.' },
	{ key: 'dark', label: 'Dark', description: 'Use a low-glare interface for night usage.' },
];

const THEME_PREFERENCE_LABEL: Record<SettingsThemeMode, string> = {
	light: 'Light',
	dark: 'Dark',
};

export default function ThemeScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { mode, palette, setMode } = useSettingsTheme();
	const isDark = mode === 'dark';

	const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);

	const goToSettings = useCallback(() => {
		router.replace('/settings');
	}, [router]);

	useEffect(() => {
		const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
			goToSettings();
			return true;
		});

		return () => subscription.remove();
	}, [goToSettings]);

	const onSelectTheme = (preference: SettingsThemeMode) => {
		setMode(preference);
	};

	if (isHydrated && !isAuthenticated) {
		return <Redirect href="/(auth)/login" />;
	}

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: palette.screenBg }]} edges={['top', 'bottom']}>
			<StatusBar style={isDark ? 'light' : 'dark'} />
			<AppTopBar title="Theme" onBackPress={goToSettings} />

			<ScrollView
				style={[styles.page, { backgroundColor: palette.screenBg }]}
				contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}
				showsVerticalScrollIndicator={false}
			>
				<View style={[styles.card, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
					<ThemedText style={[styles.cardTitle, { color: palette.text }]}>Theme Mode</ThemedText>
					<ThemedText style={[styles.helperText, { color: palette.subtext }]}>Choose app theme mode for your mobile experience.</ThemedText>

					{THEME_OPTIONS.map((option) => {
						const isSelected = option.key === mode;
						return (
							<Pressable
								key={option.key}
								style={[
									styles.optionRow,
									{ borderColor: palette.border, backgroundColor: palette.surfaceBg },
									isSelected ? [styles.optionRowActive, { borderColor: palette.tint, backgroundColor: palette.pressedBg }] : null,
								]}
								onPress={() => onSelectTheme(option.key)}
							>
								<View style={styles.optionLeft}>
									<View style={[styles.radioOuter, { borderColor: isSelected ? palette.tint : palette.subtext }]}>
										{isSelected ? <View style={[styles.radioInner, { backgroundColor: palette.tint }]} /> : null}
									</View>
									<View style={styles.optionLabelWrap}>
										<ThemedText style={[styles.optionLabel, { color: palette.text }]}>{option.label}</ThemedText>
										<ThemedText style={[styles.optionDesc, { color: palette.subtext }]}>{option.description}</ThemedText>
									</View>
								</View>
							</Pressable>
						);
					})}
				</View>

				<View style={[styles.card, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
					<ThemedText style={[styles.cardTitle, { color: palette.text }]}>Stored Theme Details</ThemedText>
					<View style={styles.detailRow}>
						<ThemedText style={[styles.detailLabel, { color: palette.subtext }]}>Selected Preference</ThemedText>
						<ThemedText style={[styles.detailValue, { color: palette.text }]}>{THEME_PREFERENCE_LABEL[mode]}</ThemedText>
					</View>
					<View style={styles.detailRow}>
						<ThemedText style={[styles.detailLabel, { color: palette.subtext }]}>Status Bar</ThemedText>
						<ThemedText style={[styles.detailValue, { color: palette.text }]}>{isDark ? 'Light Content' : 'Dark Content'}</ThemedText>
					</View>
					<View style={styles.detailRow}>
						<ThemedText style={[styles.detailLabel, { color: palette.subtext }]}>Effective Preview</ThemedText>
						<ThemedText style={[styles.detailValue, { color: palette.text }]}>{isDark ? 'Dark' : 'Light'}</ThemedText>
					</View>
					<View style={styles.detailRow}>
						<ThemedText style={[styles.detailLabel, { color: palette.subtext }]}>Persistence</ThemedText>
						<ThemedText style={[styles.detailValue, { color: palette.text }]}>Secure Storage</ThemedText>
					</View>
				</View>

				<View style={[styles.noticeCard, { borderColor: palette.border, backgroundColor: palette.headerBtnBg }]}>
					<Ionicons name="information-circle-outline" size={18} color={palette.tint} />
					<ThemedText style={[styles.noticeText, { color: palette.subtext }]}>
						Theme preference is saved and applied on themed screens.
					</ThemedText>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#F4F7F9',
	},
	page: {
		flex: 1,
	},
	container: {
		padding: 16,
		gap: 10,
	},
	card: {
		borderRadius: 14,
		padding: 12,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E2E8F0',
		gap: 10,
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: '800',
		color: '#0F172A',
	},
	helperText: {
		fontSize: 12,
		color: '#64748B',
		fontWeight: '600',
	},
	optionRow: {
		borderWidth: 1,
		borderColor: '#E2E8F0',
		borderRadius: 12,
		paddingHorizontal: 10,
		paddingVertical: 10,
	},
	optionRowActive: {
		borderColor: '#0F766E',
		backgroundColor: '#F0FDFA',
	},
	optionLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	radioOuter: {
		width: 18,
		height: 18,
		borderRadius: 9,
		borderWidth: 2,
		borderColor: '#94A3B8',
		alignItems: 'center',
		justifyContent: 'center',
	},
	radioInner: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: '#0F766E',
	},
	optionLabelWrap: {
		flex: 1,
	},
	optionLabel: {
		fontSize: 14,
		fontWeight: '700',
		color: '#0F172A',
	},
	optionDesc: {
		marginTop: 2,
		fontSize: 12,
		color: '#64748B',
		fontWeight: '600',
	},
	detailRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 2,
	},
	detailLabel: {
		fontSize: 13,
		fontWeight: '600',
		color: '#334155',
	},
	detailValue: {
		fontSize: 13,
		fontWeight: '700',
		color: '#0F172A',
	},
	noticeCard: {
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#CCFBF1',
		backgroundColor: '#F0FDFA',
		paddingHorizontal: 12,
		paddingVertical: 10,
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 8,
	},
	noticeText: {
		flex: 1,
		fontSize: 12,
		lineHeight: 18,
		color: '#0F766E',
		fontWeight: '600',
	},
});
