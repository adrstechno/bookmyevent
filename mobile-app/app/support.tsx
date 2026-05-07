import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, BackHandler, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppSelector } from '@/store';
import { AppTopBar } from '@/components/layout/AppTopBar';
import { ThemedText } from '@/components/themed-text';
import { useSettingsTheme } from '@/theme/settingsTheme';

// ─── Data ────────────────────────────────────────────────────

const SUPPORT_CHANNELS = [
	{
		key: 'call' as const,
		icon: 'call-outline' as const,
		label: 'Call Support',
		value: '+91 98765 00000',
	},
	{
		key: 'mail' as const,
		icon: 'mail-outline' as const,
		label: 'Email',
		value: 'goeventify@adrstechno.com',
	},
	{
		key: 'whatsapp' as const,
		icon: 'logo-whatsapp' as const,
		label: 'WhatsApp',
		value: '+91 98765 00000',
	},
];

const FAQS = [
	{
		q: 'How do I reschedule a booking?',
		a: 'Go to My Bookings, select the booking you want to reschedule, and tap "Reschedule". Choose a new date and confirm. Note that rescheduling is subject to vendor availability.',
	},
	{
		q: 'When will my refund be processed?',
		a: 'Refunds are processed within 5–7 business days after cancellation approval. The amount will be credited back to your original payment method.',
	},
	{
		q: 'How do I contact the event manager?',
		a: 'After a booking is confirmed, you can find the vendor\'s contact details on the booking detail page under "Vendor Info".',
	},
	{
		q: 'How can I update my profile details?',
		a: 'Tap on your profile picture or go to Profile tab → Edit Profile. You can update your name, phone number, and profile photo.',
	},
	{
		q: 'Can I cancel my booking from the app?',
		a: 'Yes. Go to My Bookings, select the booking, and tap "Cancel Booking". Cancellation charges may apply depending on the vendor\'s policy.',
	},
	{
		q: 'Can I get support on weekends?',
		a: 'Yes, our support team is available 7 days a week. Response time may be slightly longer on weekends (4–6 hours).',
	},
];

// ─── Component ───────────────────────────────────────────────

export default function SupportScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);
	const { mode, palette } = useSettingsTheme();
	const isDark = mode === 'dark';

	const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

	const supportPhone = '+91 98765 00000';
	const supportEmail = 'goeventify@adrstechno.com';

	const goBack = useCallback(() => {
		router.replace('/(tabs)/profile');
	}, [router]);

	useEffect(() => {
		const sub = BackHandler.addEventListener('hardwareBackPress', () => {
			goBack();
			return true;
		});
		return () => sub.remove();
	}, [goBack]);

	const handleChannel = useCallback(
		async (key: 'call' | 'mail' | 'whatsapp') => {
			try {
				if (key === 'call') {
					await Linking.openURL(`tel:${supportPhone.replace(/\s+/g, '')}`);
					return;
				}
				if (key === 'whatsapp') {
					const url = `whatsapp://send?phone=${supportPhone.replace(/\s+/g, '')}&text=Hi, I need help with GoEventify`;
					const canOpen = await Linking.canOpenURL(url);
					if (canOpen) {
						await Linking.openURL(url);
					} else {
						Alert.alert('WhatsApp not installed', 'Please install WhatsApp to use this feature.');
					}
					return;
				}
				const subject = encodeURIComponent('Support Request - GoEventify');
				const gmail = `googlegmail://co?to=${supportEmail}&subject=${subject}`;
				const mailto = `mailto:${supportEmail}?subject=${subject}`;
				const canGmail = await Linking.canOpenURL(gmail);
				await Linking.openURL(canGmail ? gmail : mailto);
			} catch {
				Alert.alert(
					'Unable to open',
					key === 'call'
						? 'Calling is not available on this device.'
						: key === 'whatsapp'
						? 'WhatsApp is not available.'
						: 'Email app is not available on this device.',
				);
			}
		},
		[supportEmail, supportPhone],
	);

	if (isHydrated && !isAuthenticated) {
		return <Redirect href="/(auth)/login" />;
	}

	return (
		<SafeAreaView style={[styles.safe, { backgroundColor: palette.screenBg }]} edges={['top', 'bottom']}>
			<StatusBar style={isDark ? 'light' : 'dark'} />
			<AppTopBar title="Support" onBackPress={goBack} />

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
			>
				{/* ── Hero ── */}
				<View style={[styles.hero, { backgroundColor: palette.primary }]}>
					<View style={styles.heroIconWrap}>
						<Ionicons name="headset-outline" size={28} color="#FFFFFF" />
					</View>
					<ThemedText style={styles.heroTitle}>How can we help?</ThemedText>
					<ThemedText style={styles.heroDesc}>
						Our support team is available 7 days a week to assist you with bookings, payments, and more.
					</ThemedText>
				</View>

				{/* ── Support Channels ── */}
				<View style={styles.section}>
					<ThemedText style={[styles.sectionTitle, { color: palette.text }]}>Contact Us</ThemedText>
					<View style={[styles.card, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
						{SUPPORT_CHANNELS.map((ch, i) => (
							<View key={ch.key}>
								{i > 0 && <View style={[styles.divider, { backgroundColor: palette.border }]} />}
								<Pressable
									style={({ pressed }) => [
										styles.channelRow,
										pressed && { backgroundColor: palette.pressedBg },
									]}
									onPress={() => void handleChannel(ch.key)}
								>
									<View style={[styles.channelIcon, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
										<Ionicons name={ch.icon} size={18} color={palette.primary} />
									</View>
									<View style={styles.channelText}>
										<ThemedText style={[styles.channelLabel, { color: palette.subtext }]}>{ch.label}</ThemedText>
										<ThemedText style={[styles.channelValue, { color: palette.text }]}>{ch.value}</ThemedText>
									</View>
									<Ionicons name="chevron-forward" size={16} color={palette.subtext} />
								</Pressable>
							</View>
						))}
					</View>
				</View>

				{/* ── Response Time ── */}
				<View style={[styles.infoRow, { backgroundColor: isDark ? '#1E293B' : '#F0FDF4', borderColor: isDark ? '#334155' : '#BBF7D0' }]}>
					<Ionicons name="time-outline" size={16} color={isDark ? '#86EFAC' : '#16A34A'} />
					<ThemedText style={[styles.infoText, { color: isDark ? '#86EFAC' : '#166534' }]}>
						We typically respond within 2–4 hours. Urgent? Call us directly.
					</ThemedText>
				</View>

				{/* ── FAQs ── */}
				<View style={styles.section}>
					<ThemedText style={[styles.sectionTitle, { color: palette.text }]}>Frequently Asked Questions</ThemedText>
					<View style={[styles.card, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
						{FAQS.map((faq, i) => (
							<View key={i}>
								{i > 0 && <View style={[styles.divider, { backgroundColor: palette.border }]} />}
								<Pressable
									style={({ pressed }) => [
										styles.faqRow,
										pressed && { backgroundColor: palette.pressedBg },
									]}
									onPress={() => setExpandedFAQ(expandedFAQ === i ? null : i)}
								>
									<ThemedText style={[styles.faqQ, { color: palette.text }]}>{faq.q}</ThemedText>
									<Ionicons
										name={expandedFAQ === i ? 'chevron-up' : 'chevron-down'}
										size={16}
										color={palette.subtext}
									/>
								</Pressable>
								{expandedFAQ === i && (
									<View style={[styles.faqAnswer, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
										<ThemedText style={[styles.faqA, { color: palette.subtext }]}>{faq.a}</ThemedText>
									</View>
								)}
							</View>
						))}
					</View>
				</View>

				{/* ── Footer ── */}
				<ThemedText style={[styles.footer, { color: palette.subtext }]}>
					GoEventify Support · Available 7 days a week
				</ThemedText>
			</ScrollView>
		</SafeAreaView>
	);
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
	safe: { flex: 1 },
	scroll: {
		paddingHorizontal: 16,
		paddingTop: 16,
		gap: 20,
	},

	// Hero
	hero: {
		borderRadius: 18,
		padding: 24,
		alignItems: 'center',
		gap: 8,
	},
	heroIconWrap: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: 'rgba(255,255,255,0.18)',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 4,
	},
	heroTitle: {
		fontSize: 22,
		fontWeight: '800',
		color: '#FFFFFF',
	},
	heroDesc: {
		fontSize: 13,
		color: 'rgba(255,255,255,0.75)',
		textAlign: 'center',
		lineHeight: 20,
		paddingHorizontal: 8,
	},

	// Section
	section: {
		gap: 10,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: '800',
	},

	// Card
	card: {
		borderRadius: 14,
		borderWidth: 1,
		overflow: 'hidden',
	},
	divider: {
		height: 1,
		marginHorizontal: 14,
	},

	// Channel rows
	channelRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		paddingHorizontal: 14,
		paddingVertical: 13,
		borderRadius: 0,
	},
	channelIcon: {
		width: 36,
		height: 36,
		borderRadius: 9,
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
	},
	channelText: {
		flex: 1,
		gap: 2,
	},
	channelLabel: {
		fontSize: 11,
		fontWeight: '600',
		textTransform: 'uppercase',
		letterSpacing: 0.4,
	},
	channelValue: {
		fontSize: 14,
		fontWeight: '600',
	},

	// Info row
	infoRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		borderRadius: 10,
		borderWidth: 1,
		paddingHorizontal: 14,
		paddingVertical: 10,
	},
	infoText: {
		flex: 1,
		fontSize: 12,
		fontWeight: '600',
		lineHeight: 18,
	},

	// FAQ
	faqRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 14,
		paddingVertical: 13,
		gap: 10,
	},
	faqQ: {
		flex: 1,
		fontSize: 14,
		fontWeight: '600',
		lineHeight: 20,
	},
	faqAnswer: {
		paddingHorizontal: 14,
		paddingVertical: 12,
	},
	faqA: {
		fontSize: 13,
		lineHeight: 20,
	},

	// Footer
	footer: {
		fontSize: 11,
		textAlign: 'center',
		paddingBottom: 4,
	},
});
