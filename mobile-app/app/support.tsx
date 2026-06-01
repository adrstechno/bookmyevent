import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Alert, BackHandler, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppSelector } from '@/store';
import { AppTopBar } from '@/components/layout/AppTopBar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSettingsTheme } from '@/theme/settingsTheme';

const DUMMY_FAQ = [
	'How to reschedule a booking?',
	'When will refund be processed?',
	'How to contact event manager?',
	'How can I update my profile details?',
	'Where can I check my booking status?',
	'Can I cancel my booking from the app?',
	'How do I download payment invoice?',
	'What if event venue is changed by vendor?',
	'How do I raise a complaint for service quality?',
	'Can I get support on weekends?',
];

const SUPPORT_OPTIONS = [
	{ key: 'call', label: 'Call Support', value: '+91 98765 00000', icon: 'call-outline' },
	{ key: 'mail', label: 'Email', value: 'support@goeventify.demo', icon: 'mail-outline' },
];

export default function SupportScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);
	const { mode, palette } = useSettingsTheme();
	const isDark = mode === 'dark';
	const screenBg = palette.screenBg;
	const surfaceBg = palette.surfaceBg;
	const border = palette.border;
	const supportEmail = 'support@goeventify.demo';
	const supportPhone = '+91 98765 00000';

	const goToProfile = useCallback(() => {
		router.replace('/(tabs)/profile');
	}, [router]);

	const handleSupportOptionPress = useCallback(async (key: 'call' | 'mail') => {
		try {
			if (key === 'call') {
				const callUrl = `tel:${supportPhone.replace(/\s+/g, '')}`;
				await Linking.openURL(callUrl);
				return;
			}

			const subject = encodeURIComponent('Support Request - GoEventify');
			const gmailUrl = `googlegmail://co?to=${supportEmail}&subject=${subject}`;
			const mailtoUrl = `mailto:${supportEmail}?subject=${subject}`;

			const canOpenGmail = await Linking.canOpenURL(gmailUrl);
			if (canOpenGmail) {
				await Linking.openURL(gmailUrl);
				return;
			}

			await Linking.openURL(mailtoUrl);
		} catch {
			Alert.alert('Unable to open', key === 'call' ? 'Calling is not available on this device.' : 'Email app is not available on this device.');
		}
	}, [supportEmail, supportPhone]);

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
			<AppTopBar title="Support" onBackPress={goToProfile} />

			<ScrollView
				style={styles.page}
				contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 20 }]}
				showsVerticalScrollIndicator={false}
			>
				<ThemedView style={[styles.heroCard, { backgroundColor: surfaceBg, borderColor: border }]}>
					<ThemedText style={[styles.heroTitle, { color: palette.text }]}>Need Help?</ThemedText>
					<ThemedText style={[styles.heroSubtext, { color: palette.subtext }]}>Our support team is here to help you with bookings and payments.</ThemedText>
					<Pressable
						style={({ pressed }) => [
							styles.primaryBtn,
							{ backgroundColor: palette.primary, borderColor: palette.primaryStrong, shadowColor: palette.shadow },
							pressed ? styles.primaryBtnPressed : null,
						]}
					>
						<ThemedText style={styles.primaryBtnText}>Create New Ticket</ThemedText>
					</Pressable>
				</ThemedView>

				<ThemedText style={[styles.sectionTitle, { color: palette.text }]}>Support Channels</ThemedText>
				{SUPPORT_OPTIONS.map((item) => (
					<Pressable key={item.key} style={[styles.optionRow, { backgroundColor: surfaceBg, borderColor: border }]} onPress={() => handleSupportOptionPress(item.key as 'call' | 'mail')}>
						<View style={styles.optionLeft}>
							<View style={[styles.optionIconWrap, { backgroundColor: palette.headerBtnBg }]}>
								<Ionicons name={item.icon as any} size={18} color={palette.tint} />
							</View>
							<View>
								<ThemedText style={[styles.optionLabel, { color: palette.text }]}>{item.label}</ThemedText>
								<ThemedText style={[styles.optionValue, { color: palette.subtext }]}>{item.value}</ThemedText>
							</View>
						</View>
						<Ionicons name="chevron-forward" size={17} color={palette.subtext} />
					</Pressable>
				))}

				<ThemedText style={[styles.sectionTitle, { color: palette.text }]}>Popular FAQs</ThemedText>
				{DUMMY_FAQ.map((faq) => (
					<ThemedView key={faq} style={[styles.faqRow, { backgroundColor: surfaceBg, borderColor: border }]}>
						<Ionicons name="help-circle-outline" size={18} color={palette.tint} />
						<ThemedText style={[styles.faqText, { color: palette.text }]}>{faq}</ThemedText>
					</ThemedView>
				))}

				<ThemedText style={[styles.footerNote, { color: palette.subtext }]}>Dummy support page for UI preview mode.</ThemedText>
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
	heroCard: {
		borderRadius: 14,
		padding: 14,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E2E8F0',
		gap: 8,
	},
	heroTitle: {
		fontSize: 21,
		fontWeight: '800',
		color: '#0F172A',
	},
	heroSubtext: {
		fontSize: 13,
		color: '#64748B',
	},
	primaryBtn: {
		marginTop: 4,
		backgroundColor: '#0F766E',
		paddingVertical: 11,
		borderRadius: 10,
		alignItems: 'center',
		borderWidth: 1,
		shadowOpacity: 0.2,
		shadowOffset: { width: 0, height: 6 },
		shadowRadius: 10,
		elevation: 4,
	},
	primaryBtnPressed: {
		opacity: 0.9,
		transform: [{ scale: 0.98 }],
	},
	primaryBtnText: {
		color: '#FFFFFF',
		fontSize: 14,
		fontWeight: '700',
	},
	sectionTitle: {
		fontSize: 17,
		fontWeight: '800',
		color: '#0F172A',
		marginTop: 2,
	},
	optionRow: {
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 11,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E2E8F0',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	optionLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	optionIconWrap: {
		width: 30,
		height: 30,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#ECFEFF',
	},
	optionLabel: {
		fontSize: 13,
		fontWeight: '700',
		color: '#1F2937',
	},
	optionValue: {
		fontSize: 12,
		color: '#64748B',
	},
	faqRow: {
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 11,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E2E8F0',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	faqText: {
		fontSize: 13,
		fontWeight: '600',
		color: '#334155',
	},
	footerNote: {
		textAlign: 'center',
		marginTop: 2,
		fontSize: 11,
		color: '#94A3B8',
	},
});
