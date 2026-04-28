import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FadeInView from '@/components/common/FadeInView';
import PageLoadingState from '@/components/common/PageLoadingState';
import AppMenuDrawer from '@/components/layout/AppMenuDrawer';
import { ThemedText } from '@/components/themed-text';
import { useAppToast } from '@/components/common/AppToastProvider';
import { roleScreenSpecs } from '@/constants/roleScreenSpecs';
import { useSettingsTheme } from '@/theme/settingsTheme';

type ModulePlaceholderProps = {
	title: string;
	description: string;
	role: 'admin' | 'vendor';
	screenKey?: string;
	nextActions?: string[];
};

export default function ModulePlaceholder({
	title,
	description,
	role,
	screenKey,
	nextActions = [],
}: ModulePlaceholderProps) {
	const { mode, palette } = useSettingsTheme();
	const { showSuccess } = useAppToast();
	const isDark = mode === 'dark';
	const [isLoading, setIsLoading] = useState(true);

	const spec = useMemo(() => {
		if (!screenKey) {
			return null;
		}

		return roleScreenSpecs[screenKey] ?? null;
	}, [screenKey]);

	useEffect(() => {
		setIsLoading(true);
		const timer = setTimeout(() => setIsLoading(false), 650);
		return () => clearTimeout(timer);
	}, [screenKey]);

	if (isLoading) {
		return (
			<SafeAreaView style={[styles.safeArea, { backgroundColor: palette.screenBg }]} edges={['top']}>
				<StatusBar style={isDark ? 'light' : 'dark'} />
				<View style={[styles.appBar, { backgroundColor: palette.surfaceBg, borderBottomColor: palette.border }]}>
					<AppMenuDrawer />
					<ThemedText style={[styles.appBarTitle, { color: palette.text }]} numberOfLines={1}>
						{title}
					</ThemedText>
				</View>
				<PageLoadingState text={spec?.loadingText ?? 'Loading...'} />
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: palette.screenBg }]} edges={['top']}>
			<StatusBar style={isDark ? 'light' : 'dark'} />
			<View style={[styles.appBar, { backgroundColor: palette.surfaceBg, borderBottomColor: palette.border }]}>
				<AppMenuDrawer />
				<ThemedText style={[styles.appBarTitle, { color: palette.text }]} numberOfLines={1}>
					{title}
				</ThemedText>
			</View>

			<ScrollView contentContainerStyle={styles.container}>
				<FadeInView>
					<View style={[styles.card, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
					<View style={[styles.iconWrap, { backgroundColor: palette.headerBtnBg, borderColor: palette.border }]}>
						<Ionicons name="construct-outline" size={20} color={palette.tint} />
					</View>
					<ThemedText style={[styles.title, { color: palette.text }]}>{title}</ThemedText>
					<ThemedText style={[styles.description, { color: palette.subtext }]}>{description}</ThemedText>
					<ThemedText style={[styles.roleText, { color: palette.tint }]}>Role: {role}</ThemedText>

					{spec?.buttons?.length ? (
						<View style={styles.actionsWrap}>
							{spec.buttons.map((label) => (
								<Pressable
									key={label}
									style={({ pressed }) => [
										styles.actionBtn,
										{ backgroundColor: pressed ? palette.pressedBg : palette.headerBtnBg, borderColor: palette.border },
									]}
									onPress={() => showSuccess(`${label} completed successfully.`)}
								>
									<ThemedText style={[styles.actionText, { color: palette.text }]}>{label}</ThemedText>
								</Pressable>
							))}
						</View>
					) : null}
					</View>
				</FadeInView>

				{spec?.sections?.map((section, index) => (
					<FadeInView key={section.title} delay={80 + index * 40}>
						<View style={[styles.card, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
						<ThemedText style={[styles.nextTitle, { color: palette.text }]}>{section.title}</ThemedText>
						{section.lines.map((line) => (
							<View key={line} style={styles.nextItemRow}>
								<Ionicons name="ellipse" size={8} color={palette.tint} style={styles.dotIcon} />
								<ThemedText style={[styles.nextItemText, { color: palette.subtext }]}>{line}</ThemedText>
							</View>
						))}
						</View>
					</FadeInView>
				))}

				{nextActions.length > 0 ? (
					<View style={[styles.card, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
						<ThemedText style={[styles.nextTitle, { color: palette.text }]}>Planned next actions</ThemedText>
						{nextActions.map((action) => (
							<View key={action} style={styles.nextItemRow}>
								<Ionicons name="checkmark-circle-outline" size={16} color={palette.tint} />
								<ThemedText style={[styles.nextItemText, { color: palette.subtext }]}>{action}</ThemedText>
							</View>
						))}
					</View>
				) : null}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	appBar: {
		height: 56,
		paddingHorizontal: 16,
		borderBottomWidth: 1,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	appBarTitle: {
		flex: 1,
		fontSize: 18,
		fontWeight: '800',
	},
	container: {
		padding: 16,
		gap: 12,
	},
	actionsWrap: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		marginTop: 4,
	},
	actionBtn: {
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 10,
		borderWidth: 1,
	},
	actionText: {
		fontSize: 12,
		fontWeight: '700',
	},
	card: {
		borderWidth: 1,
		borderRadius: 14,
		padding: 14,
		gap: 8,
	},
	iconWrap: {
		width: 34,
		height: 34,
		borderWidth: 1,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
	},
	title: {
		fontSize: 22,
		fontWeight: '800',
	},
	description: {
		fontSize: 14,
		lineHeight: 20,
	},
	roleText: {
		fontSize: 13,
		fontWeight: '700',
	},
	nextTitle: {
		fontSize: 16,
		fontWeight: '700',
		marginBottom: 2,
	},
	nextItemRow: {
		flexDirection: 'row',
		gap: 8,
		alignItems: 'flex-start',
	},
	dotIcon: {
		marginTop: 5,
	},
	nextItemText: {
		flex: 1,
		fontSize: 14,
		lineHeight: 19,
	},
});
