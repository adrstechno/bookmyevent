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
const EFFECTIVE_DATE = 'May 1, 2025';

type Section = {
	icon: string;
	iconColor: string;
	title: string;
	content: string[];
};

const SECTIONS: Section[] = [
	{
		icon: 'person-circle-outline',
		iconColor: '#3B82F6',
		title: '1. Eligibility & Account Registration',
		content: [
			'You must be at least 18 years of age to create an account and use GoEventify. By registering, you confirm that all information you provide is accurate, current, and complete.',
			'You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately at goeventify@adrstechno.com if you suspect any unauthorized access to your account.',
			'GoEventify reserves the right to suspend or terminate accounts that provide false information, violate these Terms, or engage in any activity that harms the platform or its users.',
			'One person may not maintain more than one active account. Creating duplicate accounts to circumvent a suspension or ban is strictly prohibited.',
		],
	},
	{
		icon: 'calendar-outline',
		iconColor: '#10B981',
		title: '2. Booking & Reservation Policy',
		content: [
			'All bookings made through GoEventify are subject to vendor availability and confirmation. A booking is considered confirmed only after you receive an official confirmation notification from GoEventify.',
			'Booking requests are reviewed by the vendor and subsequently approved by our admin team. GoEventify acts as an intermediary platform and does not guarantee vendor availability until confirmation is issued.',
			'You are responsible for providing accurate event details including date, time, venue address, and any special requirements at the time of booking. Errors in booking details may result in service disruptions for which GoEventify cannot be held liable.',
			'GoEventify reserves the right to cancel any booking that violates our policies, involves fraudulent activity, or cannot be fulfilled due to circumstances beyond our control.',
			'The OTP (One-Time Password) system is used to verify service delivery. You must share the OTP with the vendor only at the time of service commencement. Sharing the OTP prematurely may result in disputes for which GoEventify cannot be held responsible.',
		],
	},
	{
		icon: 'cash-outline',
		iconColor: '#F59E0B',
		title: '3. Payments & Pricing',
		content: [
			'All prices displayed on GoEventify are in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. Prices are subject to change without prior notice.',
			'Payments are processed through Razorpay, a secure third-party payment gateway. GoEventify does not store your full payment card details on its servers.',
			'By completing a payment, you authorize GoEventify to charge the specified amount for the selected service. Payment confirmation will be sent to your registered email address.',
			'In the event of a payment failure or technical error, please contact our support team before attempting another transaction to avoid duplicate charges.',
			'GoEventify is not responsible for any additional charges levied by your bank or payment provider, including foreign transaction fees or currency conversion charges.',
		],
	},
	{
		icon: 'return-down-back-outline',
		iconColor: '#EF4444',
		title: '4. Cancellation & Refund Policy',
		content: [
			'Cancellations made more than 72 hours before the scheduled event date may be eligible for a full or partial refund, subject to the vendor\'s individual cancellation policy.',
			'Cancellations made within 72 hours of the event may not be eligible for a refund. GoEventify will communicate the applicable refund terms at the time of cancellation.',
			'Refunds, where applicable, will be processed to the original payment method within 7–10 business days. Processing times may vary depending on your bank or payment provider.',
			'GoEventify reserves the right to deduct a platform service fee from any refund amount. This fee will be clearly communicated before the cancellation is confirmed.',
			'In cases where a vendor fails to deliver the confirmed service, GoEventify will investigate the matter and may issue a full refund at its sole discretion.',
			'No-show by the customer without prior cancellation will be treated as a completed booking and will not be eligible for a refund.',
		],
	},
	{
		icon: 'storefront-outline',
		iconColor: '#8B5CF6',
		title: '5. Vendor Conduct & Responsibilities',
		content: [
			'Vendors listed on GoEventify are independent service providers and are not employees or agents of GoEventify. GoEventify does not endorse any specific vendor.',
			'While GoEventify verifies vendors before listing them on the platform, we do not guarantee the quality, safety, or legality of services provided by vendors.',
			'Vendors are required to honor confirmed bookings. Failure to do so may result in removal from the platform and potential legal action.',
			'Any disputes between users and vendors must first be reported to GoEventify support. We will make reasonable efforts to mediate and resolve such disputes.',
			'GoEventify is not liable for any loss, damage, injury, or dissatisfaction arising from vendor services. Users are encouraged to review vendor profiles and ratings before booking.',
		],
	},
	{
		icon: 'shield-outline',
		iconColor: '#06B6D4',
		title: '6. Prohibited Activities',
		content: [
			'You agree not to use GoEventify for any unlawful purpose or in any way that violates these Terms and Conditions.',
			'The following activities are strictly prohibited: impersonating another person or entity; submitting false or misleading information; attempting to gain unauthorized access to any part of the platform; using automated tools, bots, or scrapers to access the platform.',
			'You must not post, upload, or transmit any content that is defamatory, obscene, offensive, or infringes upon the intellectual property rights of any third party.',
			'Any attempt to manipulate reviews, ratings, or booking records is a serious violation and will result in immediate account termination and potential legal action.',
			'Harassment, abuse, or threatening behavior toward vendors, other users, or GoEventify staff will not be tolerated under any circumstances.',
		],
	},
	{
		icon: 'document-text-outline',
		iconColor: '#EC4899',
		title: '7. Intellectual Property',
		content: [
			'All content on GoEventify — including but not limited to the app design, logo, text, graphics, images, and software — is the exclusive property of GoEventify and is protected by applicable intellectual property laws.',
			'You are granted a limited, non-exclusive, non-transferable license to access and use the GoEventify application for personal, non-commercial purposes only.',
			'You may not reproduce, distribute, modify, create derivative works of, publicly display, or commercially exploit any content from GoEventify without our prior written consent.',
			'Any feedback, suggestions, or ideas you submit to GoEventify may be used by us without any obligation to compensate you or maintain confidentiality.',
		],
	},
	{
		icon: 'alert-circle-outline',
		iconColor: '#F97316',
		title: '8. Limitation of Liability',
		content: [
			'GoEventify provides its platform on an "as is" and "as available" basis without warranties of any kind, either express or implied, including but not limited to warranties of merchantability or fitness for a particular purpose.',
			'To the maximum extent permitted by applicable law, GoEventify shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.',
			'GoEventify\'s total liability to you for any claim arising from these Terms or your use of the platform shall not exceed the amount you paid to GoEventify in the three months preceding the claim.',
			'GoEventify is not responsible for any service interruptions, data loss, or technical failures caused by factors beyond our reasonable control, including internet outages, server failures, or third-party service disruptions.',
		],
	},
	{
		icon: 'globe-outline',
		iconColor: '#14B8A6',
		title: '9. Governing Law & Dispute Resolution',
		content: [
			'These Terms and Conditions are governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.',
			'Any dispute arising out of or in connection with these Terms shall first be attempted to be resolved through good-faith negotiation between the parties.',
			'If a dispute cannot be resolved through negotiation within 30 days, it shall be submitted to binding arbitration in accordance with the Arbitration and Conciliation Act, 1996 of India.',
			'The seat of arbitration shall be Jabalpur, Madhya Pradesh, India. The language of arbitration shall be English.',
			'Nothing in this clause shall prevent GoEventify from seeking injunctive or other equitable relief from a court of competent jurisdiction.',
		],
	},
	{
		icon: 'refresh-circle-outline',
		iconColor: '#A855F7',
		title: '10. Modifications to Terms',
		content: [
			'GoEventify reserves the right to modify these Terms and Conditions at any time. We will provide notice of significant changes through the app, via email, or by updating the "Last Updated" date on this page.',
			'Your continued use of GoEventify after any modifications to these Terms constitutes your acceptance of the revised Terms.',
			'If you do not agree with the updated Terms, you must discontinue use of the platform and may request account deletion by contacting us at goeventify@adrstechno.com.',
			'We encourage you to review these Terms periodically to stay informed of any updates.',
		],
	},
	{
		icon: 'mail-outline',
		iconColor: '#3B82F6',
		title: '11. Contact Information',
		content: [
			'If you have any questions, concerns, or feedback regarding these Terms and Conditions, please reach out to us:',
			'Email: goeventify@adrstechno.com',
			'Support Portal: Available within the GoEventify app under Profile → Support',
			'Address: GoEventify, Jabalpur, Madhya Pradesh, India',
			'We aim to respond to all inquiries within 2 business days.',
		],
	},
];

export default function TermsAndConditionsScreen() {
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
			<AppTopBar title="Terms & Conditions" onBackPress={goBack} />

			<ScrollView
				style={styles.page}
				contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}
				showsVerticalScrollIndicator={false}
			>
				{/* Hero Banner */}
				<ThemedView style={[styles.heroBanner, { backgroundColor: palette.primary }]}>
					<View style={styles.heroIconWrap}>
						<Ionicons name="document-text" size={36} color="#FFFFFF" />
					</View>
					<ThemedText style={styles.heroTitle}>Terms & Conditions</ThemedText>
					<ThemedText style={styles.heroSubtitle}>
						Please read these terms carefully before using GoEventify. By accessing our platform, you agree to be bound by these terms.
					</ThemedText>
					<View style={styles.heroDatesRow}>
						<View style={[styles.dateBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
							<Ionicons name="calendar-outline" size={12} color="#FFFFFF" />
							<ThemedText style={styles.dateBadgeText}>Effective: {EFFECTIVE_DATE}</ThemedText>
						</View>
						<View style={[styles.dateBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
							<Ionicons name="refresh-outline" size={12} color="#FFFFFF" />
							<ThemedText style={styles.dateBadgeText}>Updated: {LAST_UPDATED}</ThemedText>
						</View>
					</View>
				</ThemedView>

				{/* Intro Card */}
				<ThemedView style={[styles.introCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
					<View style={styles.introHeader}>
						<Ionicons name="information-circle-outline" size={18} color={palette.primary} />
						<ThemedText style={[styles.introHeading, { color: palette.text }]}>Agreement to Terms</ThemedText>
					</View>
					<ThemedText style={[styles.introText, { color: palette.text }]}>
						These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("User") and GoEventify ("Company", "we", "us", or "our") governing your access to and use of the GoEventify mobile application and all related services. By creating an account or using our platform, you acknowledge that you have read, understood, and agree to be bound by these Terms.
					</ThemedText>
				</ThemedView>

				{/* Sections */}
				{SECTIONS.map((section, index) => (
					<ThemedView
						key={index}
						style={[styles.sectionCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}
					>
						<View style={styles.sectionHeader}>
							<View style={[styles.sectionIconWrap, { backgroundColor: section.iconColor + '18' }]}>
								<Ionicons name={section.icon as any} size={20} color={section.iconColor} />
							</View>
							<ThemedText style={[styles.sectionTitle, { color: palette.text }]}>{section.title}</ThemedText>
						</View>

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

				{/* Acceptance Footer */}
				<ThemedView
					style={[
						styles.acceptanceCard,
						{ backgroundColor: isDark ? '#1E293B' : '#EFF6FF', borderColor: isDark ? '#334155' : '#BFDBFE' },
					]}
				>
					<Ionicons name="checkmark-circle" size={22} color="#3B82F6" />
					<ThemedText style={[styles.acceptanceText, { color: isDark ? '#93C5FD' : '#1E40AF' }]}>
						By using GoEventify, you confirm that you have read, understood, and agree to these Terms and Conditions in their entirety.
					</ThemedText>
				</ThemedView>

				<ThemedText style={[styles.versionNote, { color: palette.subtext }]}>
					GoEventify Terms & Conditions v1.0 • © 2025 GoEventify. All rights reserved.
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
	heroDatesRow: {
		flexDirection: 'row',
		gap: 8,
		marginTop: 4,
		flexWrap: 'wrap',
		justifyContent: 'center',
	},
	dateBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 20,
	},
	dateBadgeText: {
		fontSize: 11,
		color: '#FFFFFF',
		fontWeight: '600',
	},
	// Intro
	introCard: {
		borderRadius: 12,
		padding: 14,
		borderWidth: 1,
		gap: 10,
	},
	introHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	introHeading: {
		fontSize: 14,
		fontWeight: '800',
	},
	introText: {
		fontSize: 13,
		lineHeight: 21,
	},
	// Section card
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
	// Acceptance footer
	acceptanceCard: {
		borderRadius: 12,
		padding: 14,
		borderWidth: 1,
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 10,
	},
	acceptanceText: {
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
