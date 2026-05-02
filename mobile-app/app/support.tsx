import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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
	{ key: 'call', label: 'Call Support', value: '+91 98765 00000', icon: 'call-outline', color: '#10B981' },
	{ key: 'mail', label: 'Email', value: 'support@goeventify.demo', icon: 'mail-outline', color: '#3B82F6' },
	{ key: 'whatsapp', label: 'WhatsApp', value: '+91 98765 00000', icon: 'logo-whatsapp', color: '#22C55E' },
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
	const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
	
	const supportEmail = 'support@goeventify.demo';
	const supportPhone = '+91 98765 00000';

	const goToProfile = useCallback(() => {
		router.replace('/(tabs)/profile');
	}, [router]);

	const handleSupportOptionPress = useCallback(async (key: 'call' | 'mail' | 'whatsapp') => {
		try {
			if (key === 'call') {
				const callUrl = `tel:${supportPhone.replace(/\s+/g, '')}`;
				await Linking.openURL(callUrl);
				return;
			}

			if (key === 'whatsapp') {
				const whatsappUrl = `whatsapp://send?phone=${supportPhone.replace(/\s+/g, '')}&text=Hi, I need help with GoEventify`;
				const canOpen = await Linking.canOpenURL(whatsappUrl);
				if (canOpen) {
					await Linking.openURL(whatsappUrl);
				} else {
					Alert.alert('WhatsApp not installed', 'Please install WhatsApp to use this feature.');
				}
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
			Alert.alert('Unable to open', key === 'call' ? 'Calling is not available on this device.' : key === 'whatsapp' ? 'WhatsApp is not available.' : 'Email app is not available on this device.');
		}
	}, [supportEmail, supportPhone]);

	const toggleFAQ = (index: number) => {
		setExpandedFAQ(expandedFAQ === index ? null : index);
	};

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
				{/* Enhanced Hero Card */}
				<ThemedView style={[styles.heroCard, { backgroundColor: surfaceBg, borderColor: border }]}>
					<View style={styles.heroIconContainer}>
						<Ionicons name="headset-outline" size={32} color={palette.primary} />
					</View>
					<ThemedText style={[styles.heroTitle, { color: palette.text }]}>Need Help?</ThemedText>
					<ThemedText style={[styles.heroSubtext, { color: palette.subtext }]}>
						Our support team is here to help you with bookings and payments.
					</ThemedText>
					<Pressable
						style={({ pressed }) => [
							styles.primaryBtn,
							{ backgroundColor: palette.primary, borderColor: palette.primaryStrong, shadowColor: palette.shadow },
							pressed ? styles.primaryBtnPressed : null,
						]}
					>
						<Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
						<ThemedText style={styles.primaryBtnText}>Create New Ticket</ThemedText>
					</Pressable>
				</ThemedView>

				{/* Enhanced Support Channels */}
				<ThemedText style={[styles.sectionTitle, { color: palette.text }]}>Support Channels</ThemedText>
				{SUPPORT_OPTIONS.map((item) => (
					<Pressable 
						key={item.key} 
						style={({ pressed }) => [
							styles.optionRow, 
							{ backgroundColor: surfaceBg, borderColor: border },
							pressed && styles.optionRowPressed
						]} 
						onPress={() => handleSupportOptionPress(item.key as 'call' | 'mail' | 'whatsapp')}
					>
						<View style={styles.optionLeft}>
							<View style={[styles.optionIconWrap, { backgroundColor: item.color + '15' }]}>
								<Ionicons name={item.icon as any} size={20} color={item.color} />
							</View>
							<View style={styles.optionTextContainer}>
								<ThemedText style={[styles.optionLabel, { color: palette.text }]}>{item.label}</ThemedText>
								<ThemedText style={[styles.optionValue, { color: palette.subtext }]}>{item.value}</ThemedText>
							</View>
						</View>
						<Ionicons name="chevron-forward" size={18} color={palette.subtext} />
					</Pressable>
				))}

				{/* Enhanced FAQs */}
				<ThemedText style={[styles.sectionTitle, { color: palette.text }]}>Popular FAQs</ThemedText>
				<ThemedText style={[styles.sectionSubtitle, { color: palette.subtext }]}>
					Find quick answers to common questions
				</ThemedText>
				{DUMMY_FAQ.map((faq, index) => (
					<View key={faq}>
						<Pressable
							style={({ pressed }) => [
								styles.faqRow,
								{ backgroundColor: surfaceBg, borderColor: border },
								pressed && styles.faqRowPressed
							]}
							onPress={() => toggleFAQ(index)}
						>
							<View style={styles.faqLeft}>
								<View style={[styles.faqIconContainer, { backgroundColor: palette.headerBtnBg }]}>
									<Ionicons name="help-circle-outline" size={18} color={palette.tint} />
								</View>
								<ThemedText style={[styles.faqText, { color: palette.text }]}>{faq}</ThemedText>
							</View>
							<Ionicons 
								name={expandedFAQ === index ? "chevron-up" : "chevron-down"} 
								size={18} 
								color={palette.subtext} 
							/>
						</Pressable>
						{expandedFAQ === index && (
							<ThemedView style={[styles.faqAnswer, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: border }]}>
								<ThemedText style={[styles.faqAnswerText, { color: palette.subtext }]}>
									This is a sample answer for the FAQ. In production, this would contain detailed information to help users resolve their queries.
								</ThemedText>
							</ThemedView>
						)}
					</View>
				))}

				{/* Emergency Support Card */}
				<ThemedView style={[styles.emergencyCard, { backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2', borderColor: isDark ? '#991B1B' : '#FCA5A5' }]}>
					<View style={styles.emergencyHeader}>
						<Ionicons name="alert-circle" size={24} color={isDark ? '#FCA5A5' : '#DC2626'} />
						<ThemedText style={[styles.emergencyTitle, { color: isDark ? '#FCA5A5' : '#DC2626' }]}>
							Emergency Support
						</ThemedText>
					</View>
					<ThemedText style={[styles.emergencyText, { color: isDark ? '#FCA5A5' : '#991B1B' }]}>
						For urgent issues, call us immediately
					</ThemedText>
					<Pressable
						style={[styles.emergencyButton, { backgroundColor: isDark ? '#991B1B' : '#DC2626' }]}
						onPress={() => handleSupportOptionPress('call')}
					>
						<Ionicons name="call" size={18} color="#FFFFFF" />
						<ThemedText style={styles.emergencyButtonText}>Call Now: {supportPhone}</ThemedText>
					</Pressable>
				</ThemedView>

				{/* Footer Note */}
				<ThemedView style={[styles.footerCard, { backgroundColor: surfaceBg, borderColor: border }]}>
					<Ionicons name="information-circle-outline" size={18} color={palette.tint} />
					<ThemedText style={[styles.footerNote, { color: palette.subtext }]}>
						We typically respond within 2-4 hours. For urgent matters, please call us directly.
					</ThemedText>
				</ThemedView>
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
		gap: 12,
	},
	// Enhanced Hero Card
	heroCard: {
		borderRadius: 16,
		padding: 18,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E2E8F0',
		gap: 10,
		alignItems: 'center',
	},
	heroIconContainer: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: '#ECFEFF',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 4,
	},
	heroTitle: {
		fontSize: 22,
		fontWeight: '800',
		color: '#0F172A',
		textAlign: 'center',
	},
	heroSubtext: {
		fontSize: 13,
		color: '#64748B',
		textAlign: 'center',
		lineHeight: 18,
	},
	primaryBtn: {
		marginTop: 6,
		backgroundColor: '#0F766E',
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 12,
		alignItems: 'center',
		flexDirection: 'row',
		gap: 8,
		borderWidth: 1,
		shadowOpacity: 0.2,
		shadowOffset: { width: 0, height: 4 },
		shadowRadius: 8,
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
	// Section Headers
	sectionTitle: {
		fontSize: 17,
		fontWeight: '800',
		color: '#0F172A',
		marginTop: 4,
	},
	sectionSubtitle: {
		fontSize: 12,
		color: '#64748B',
		marginTop: -8,
		marginBottom: 4,
	},
	// Enhanced Support Options
	optionRow: {
		borderRadius: 14,
		paddingHorizontal: 14,
		paddingVertical: 14,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E2E8F0',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	optionRowPressed: {
		opacity: 0.7,
		transform: [{ scale: 0.98 }],
	},
	optionLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		flex: 1,
	},
	optionIconWrap: {
		width: 44,
		height: 44,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	optionTextContainer: {
		flex: 1,
		gap: 2,
	},
	optionLabel: {
		fontSize: 14,
		fontWeight: '700',
		color: '#1F2937',
	},
	optionValue: {
		fontSize: 12,
		color: '#64748B',
		fontWeight: '500',
	},
	// Enhanced FAQ
	faqRow: {
		borderRadius: 12,
		paddingHorizontal: 14,
		paddingVertical: 12,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E2E8F0',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	faqRowPressed: {
		opacity: 0.7,
	},
	faqLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		flex: 1,
	},
	faqIconContainer: {
		width: 32,
		height: 32,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	faqText: {
		fontSize: 13,
		fontWeight: '600',
		color: '#334155',
		flex: 1,
	},
	faqAnswer: {
		marginTop: 4,
		marginBottom: 8,
		borderRadius: 12,
		padding: 14,
		borderWidth: 1,
	},
	faqAnswerText: {
		fontSize: 12,
		lineHeight: 18,
		color: '#64748B',
	},
	// Emergency Card
	emergencyCard: {
		borderRadius: 14,
		padding: 16,
		borderWidth: 1,
		gap: 10,
	},
	emergencyHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	emergencyTitle: {
		fontSize: 16,
		fontWeight: '800',
	},
	emergencyText: {
		fontSize: 13,
		fontWeight: '600',
	},
	emergencyButton: {
		marginTop: 4,
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 10,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},
	emergencyButtonText: {
		color: '#FFFFFF',
		fontSize: 14,
		fontWeight: '700',
	},
	// Footer
	footerCard: {
		borderRadius: 12,
		padding: 14,
		borderWidth: 1,
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 10,
	},
	footerNote: {
		flex: 1,
		fontSize: 11,
		lineHeight: 16,
		color: '#94A3B8',
	},
});
