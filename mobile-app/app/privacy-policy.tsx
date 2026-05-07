import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { BackHandler, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppTopBar } from '@/components/layout/AppTopBar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSettingsTheme } from '@/theme/settingsTheme';

const LAST_UPDATED = 'May 1, 2025';

type Section = {
	icon: string;
	iconColor: string;
	title: string;
	content: string[];
};

const SECTIONS: Section[] = [
	{
		icon: 'information-circle-outline',
		iconColor: '#3B82F6',
		title: '1. Information We Collect',
		content: [
			'Account Information: When you register on GoEventify, we collect your full name, email address, mobile number, and optionally a profile photograph. This information is used to create and manage your account.',
			'Booking & Event Data: We collect details you provide when making a booking — including event type, preferred date and time, venue address, selected vendor, package details, and any special requirements.',
			'Payment Records: We collect transaction identifiers, payment status, and booking amounts to maintain accurate financial records. Full card or banking details are handled exclusively by our payment partner, Razorpay, and are never stored on GoEventify servers.',
			'Device & Technical Data: We automatically collect device identifiers, operating system version, app version, IP address, and crash logs to maintain platform stability and improve performance.',
			'Location Data: With your explicit permission, we access your approximate location to surface nearby vendors and services. You may revoke this permission at any time through your device settings without losing access to core features.',
			'Support Communications: When you contact our support team, we retain the content of those communications to resolve your issue and improve our service quality.',
		],
	},
	{
		icon: 'shield-checkmark-outline',
		iconColor: '#10B981',
		title: '2. How We Use Your Information',
		content: [
			'Service Delivery: To process your bookings, match you with suitable vendors, send booking confirmations and OTPs, and facilitate the end-to-end event management experience.',
			'Account Management: To authenticate your identity, maintain your profile, and provide a personalized experience tailored to your event preferences and history.',
			'Platform Communications: To send you transactional notifications (booking updates, OTP codes, payment receipts) and, with your consent, promotional content about new vendors and offers.',
			'Quality & Safety: To verify vendor credentials, monitor platform activity for fraudulent behavior, and enforce our Terms and Conditions to maintain a safe marketplace.',
			'Analytics & Improvement: To analyze aggregated usage patterns, identify feature gaps, and continuously improve the GoEventify experience for all users.',
			'Legal Obligations: To comply with applicable Indian laws and regulations, respond to lawful government requests, and protect the rights and safety of our users and the public.',
		],
	},
	{
		icon: 'share-social-outline',
		iconColor: '#A855F7',
		title: '3. Information Sharing & Disclosure',
		content: [
			'With Vendors: When you confirm a booking, we share your name, contact number, event details, and special requirements with the selected vendor solely to fulfill your service request.',
			'Payment Partners: Transaction data is shared with Razorpay to process payments securely. Razorpay\'s handling of your payment information is governed by their own Privacy Policy.',
			'Infrastructure Providers: We use trusted cloud and technology service providers to host our platform and deliver our services. These providers are contractually bound to handle your data with strict confidentiality.',
			'Legal Disclosures: We may disclose your information when required by law, court order, or government authority, or when we believe disclosure is necessary to prevent harm or protect our legal rights.',
			'Business Continuity: In the event of a merger, acquisition, or restructuring, your data may be transferred to the successor entity. We will notify you in advance and ensure your data remains protected under equivalent terms.',
			'GoEventify does not sell, rent, or trade your personal information to any third party for advertising or marketing purposes — ever.',
		],
	},
	{
		icon: 'lock-closed-outline',
		iconColor: '#EF4444',
		title: '4. Data Security',
		content: [
			'Encryption in Transit: All data exchanged between your device and our servers is encrypted using TLS 1.2 or higher, ensuring your information cannot be intercepted during transmission.',
			'Secure Credential Storage: Authentication tokens and sensitive credentials are stored using your device\'s native secure storage — Keychain on iOS and Keystore on Android.',
			'Access Controls: Access to personal data within GoEventify is restricted on a strict need-to-know basis. All internal access is logged and audited regularly.',
			'Vulnerability Management: We conduct periodic security assessments and promptly address identified vulnerabilities to maintain the integrity of our platform.',
			'Breach Response: In the unlikely event of a data breach affecting your personal information, we will notify you and the relevant authorities within the timeframes required by applicable law.',
			'While we employ industry-standard security practices, no digital system is entirely immune to risk. We encourage you to use a strong, unique password and enable device-level security features.',
		],
	},
	{
		icon: 'person-outline',
		iconColor: '#F59E0B',
		title: '5. Your Rights & Choices',
		content: [
			'Right to Access: You may request a copy of the personal data we hold about you at any time by contacting us at goeventify@adrstechno.com.',
			'Right to Correction: You can update inaccurate or incomplete personal information directly through the Profile section of the GoEventify app.',
			'Right to Deletion: You may request deletion of your account and associated personal data. We will honor such requests subject to any legal retention obligations.',
			'Right to Opt-Out: You can withdraw consent for marketing communications at any time through the Notification Settings in the app or by emailing us directly.',
			'Location Consent: You may revoke location access at any time through your device settings. This will not affect your ability to use the core booking features of the app.',
			'We will respond to all data rights requests within 30 calendar days. For complex requests, we may extend this period by an additional 30 days with prior notice.',
		],
	},
	{
		icon: 'time-outline',
		iconColor: '#06B6D4',
		title: '6. Data Retention',
		content: [
			'We retain your personal information for as long as your account is active or as needed to provide you with our services.',
			'Booking records and transaction data are retained for a minimum of 5 years to comply with financial and legal record-keeping requirements under Indian law.',
			'If you request account deletion, we will delete or anonymize your personal data within 30 days, except where retention is required by law or for legitimate dispute resolution purposes.',
			'Anonymized and aggregated data that cannot identify you personally may be retained indefinitely for analytical and platform improvement purposes.',
		],
	},
	{
		icon: 'people-outline',
		iconColor: '#8B5CF6',
		title: '7. Children\'s Privacy',
		content: [
			'GoEventify is designed for adults aged 18 and above. We do not knowingly collect, process, or store personal information from individuals under the age of 18.',
			'If you are a parent or legal guardian and believe your minor child has registered on GoEventify or provided us with personal information, please contact us immediately at goeventify@adrstechno.com.',
			'Upon verification, we will promptly delete all information associated with the minor\'s account from our systems.',
		],
	},
	{
		icon: 'globe-outline',
		iconColor: '#EC4899',
		title: '8. Third-Party Services',
		content: [
			'GoEventify integrates with select third-party services to deliver a complete experience. These include Razorpay (payments) and cloud infrastructure providers.',
			'Each third-party service operates under its own privacy policy. We encourage you to review those policies to understand how your data is handled by these partners.',
			'We are not responsible for the privacy practices of third-party websites or services that may be linked from within our platform.',
		],
	},
	{
		icon: 'refresh-outline',
		iconColor: '#14B8A6',
		title: '9. Changes to This Policy',
		content: [
			'We may revise this Privacy Policy periodically to reflect changes in our data practices, legal requirements, or platform features.',
			'Material changes will be communicated to you through an in-app notification, email, or a prominent notice on the platform at least 7 days before they take effect.',
			'The "Last Updated" date at the top of this policy reflects the most recent revision. Your continued use of GoEventify after the effective date of any changes constitutes your acceptance of the revised policy.',
		],
	},
	{
		icon: 'mail-outline',
		iconColor: '#F97316',
		title: '10. Contact & Grievance Redressal',
		content: [
			'For any questions, concerns, or requests related to this Privacy Policy or your personal data, please contact our Data Protection Officer:',
			'Email: goeventify@adrstechno.com',
			'Support: Available within the GoEventify app under Profile → Support',
			'Address: GoEventify, Jabalpur, Madhya Pradesh, India',
			'We are committed to addressing all privacy-related concerns promptly and transparently. Grievances will be acknowledged within 48 hours and resolved within 30 business days.',
		],
	},
];

export default function PrivacyPolicyScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { mode, palette } = useSettingsTheme();
	const isDark = mode === 'dark';

	const goBack = useCallback(() => {
		router.back();
	}, [router]);

	useEffect(() => {
		const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
			goBack();
			return true;
		});
		return () => subscription.remove();
	}, [goBack]);

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: palette.screenBg }]} edges={['top', 'bottom']}>
			<StatusBar style={isDark ? 'light' : 'dark'} />
			<AppTopBar title="Privacy Policy" onBackPress={goBack} />

			<ScrollView
				style={styles.page}
				contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}
				showsVerticalScrollIndicator={false}
			>
				{/* Hero Banner */}
				<ThemedView style={[styles.heroBanner, { backgroundColor: palette.primary }]}>
					<View style={styles.heroIconWrap}>
						<Ionicons name="shield-checkmark" size={36} color="#FFFFFF" />
					</View>
					<ThemedText style={styles.heroTitle}>Your Privacy Matters</ThemedText>
					<ThemedText style={styles.heroSubtitle}>
						At GoEventify, we believe privacy is a right, not a feature. This policy explains exactly what data we collect, why we collect it, and how we keep it safe.
					</ThemedText>
					<View style={[styles.updatedBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
						<Ionicons name="calendar-outline" size={13} color="#FFFFFF" />
						<ThemedText style={styles.updatedText}>Last Updated: {LAST_UPDATED}</ThemedText>
					</View>
				</ThemedView>

				{/* Intro Card */}
				<ThemedView style={[styles.introCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
					<ThemedText style={[styles.introText, { color: palette.text }]}>
						This Privacy Policy describes how GoEventify ("we", "us", or "our") collects, uses, stores, and protects information about you when you use our mobile application and related services. By creating an account or using GoEventify, you consent to the data practices described in this policy. If you do not agree, please discontinue use of the platform.
					</ThemedText>
				</ThemedView>

				{/* Policy Sections */}
				{SECTIONS.map((section, index) => (
					<ThemedView
						key={index}
						style={[styles.sectionCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}
					>
						{/* Section Header */}
						<View style={styles.sectionHeader}>
							<View style={[styles.sectionIconWrap, { backgroundColor: section.iconColor + '18' }]}>
								<Ionicons name={section.icon as any} size={20} color={section.iconColor} />
							</View>
							<ThemedText style={[styles.sectionTitle, { color: palette.text }]}>{section.title}</ThemedText>
						</View>

						{/* Section Content */}
						<View style={styles.contentList}>
							{section.content.map((point, pIndex) => (
								<View key={pIndex} style={styles.bulletRow}>
									<View style={[styles.bullet, { backgroundColor: section.iconColor }]} />
									<ThemedText style={[styles.bulletText, { color: palette.text }]}>{point}</ThemedText>
								</View>
							))}
						</View>
					</ThemedView>
				))}

				{/* Footer */}
				<ThemedView style={[styles.footerCard, { backgroundColor: isDark ? '#1E293B' : '#F0FDF4', borderColor: isDark ? '#334155' : '#BBF7D0' }]}>
					<Ionicons name="checkmark-circle" size={22} color="#10B981" />
					<ThemedText style={[styles.footerText, { color: isDark ? '#86EFAC' : '#166534' }]}>
						By using GoEventify, you acknowledge that you have read, understood, and agree to this Privacy Policy. We are committed to handling your data with integrity and transparency.
					</ThemedText>
				</ThemedView>

				<ThemedText style={[styles.versionNote, { color: palette.subtext }]}>
					GoEventify Privacy Policy v1.1 • © 2025 GoEventify. All rights reserved.
				</ThemedText>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	page: {
		flex: 1,
	},
	container: {
		padding: 16,
		gap: 12,
	},
	// Hero
	heroBanner: {
		borderRadius: 16,
		padding: 20,
		alignItems: 'center',
		gap: 10,
	},
	heroIconWrap: {
		width: 68,
		height: 68,
		borderRadius: 34,
		backgroundColor: 'rgba(255,255,255,0.2)',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 4,
	},
	heroTitle: {
		fontSize: 22,
		fontWeight: '900',
		color: '#FFFFFF',
		textAlign: 'center',
	},
	heroSubtitle: {
		fontSize: 13,
		color: 'rgba(255,255,255,0.88)',
		textAlign: 'center',
		lineHeight: 20,
	},
	updatedBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 20,
		marginTop: 4,
	},
	updatedText: {
		fontSize: 12,
		color: '#FFFFFF',
		fontWeight: '600',
	},
	// Intro
	introCard: {
		borderRadius: 12,
		padding: 14,
		borderWidth: 1,
	},
	introText: {
		fontSize: 13,
		lineHeight: 21,
	},
	// Section
	sectionCard: {
		borderRadius: 14,
		padding: 14,
		borderWidth: 1,
		gap: 12,
	},
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	sectionIconWrap: {
		width: 38,
		height: 38,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
	},
	sectionTitle: {
		fontSize: 14,
		fontWeight: '800',
		flex: 1,
		flexWrap: 'wrap',
	},
	// Content
	contentList: {
		gap: 10,
	},
	bulletRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 10,
	},
	bullet: {
		width: 6,
		height: 6,
		borderRadius: 3,
		marginTop: 7,
		flexShrink: 0,
	},
	bulletText: {
		flex: 1,
		fontSize: 13,
		lineHeight: 20,
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
	footerText: {
		flex: 1,
		fontSize: 12,
		lineHeight: 18,
		fontWeight: '600',
	},
	versionNote: {
		fontSize: 11,
		textAlign: 'center',
		marginTop: 4,
	},
});
