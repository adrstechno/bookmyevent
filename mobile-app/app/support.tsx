import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppSelector } from '@/store';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

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
	{ key: 'mail', label: 'Email', value: 'support@bookmyevent.demo', icon: 'mail-outline' },
];

export default function SupportScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);

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
		<SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
			<StatusBar style="dark" />
			<View style={styles.header}>
				<Pressable style={styles.backBtn} onPress={goToProfile} hitSlop={10}>
					<Ionicons name="arrow-back" size={20} color="#0F172A" />
				</Pressable>
				<ThemedText style={styles.headerTitle}>Support</ThemedText>
				<View style={styles.headerRightPlaceholder} />
			</View>

			<ScrollView
				style={styles.page}
				contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 20 }]}
				showsVerticalScrollIndicator={false}
			>
				<ThemedView style={styles.heroCard}>
					<ThemedText style={styles.heroTitle}>Need Help?</ThemedText>
					<ThemedText style={styles.heroSubtext}>Our support team is here to help you with bookings and payments.</ThemedText>
					<Pressable style={styles.primaryBtn}>
						<ThemedText style={styles.primaryBtnText}>Create New Ticket</ThemedText>
					</Pressable>
				</ThemedView>

				<ThemedText style={styles.sectionTitle}>Support Channels</ThemedText>
				{SUPPORT_OPTIONS.map((item) => (
					<ThemedView key={item.key} style={styles.optionRow}>
						<View style={styles.optionLeft}>
							<View style={styles.optionIconWrap}>
								<Ionicons name={item.icon as any} size={18} color="#0F766E" />
							</View>
							<View>
								<ThemedText style={styles.optionLabel}>{item.label}</ThemedText>
								<ThemedText style={styles.optionValue}>{item.value}</ThemedText>
							</View>
						</View>
						<Ionicons name="chevron-forward" size={17} color="#94A3B8" />
					</ThemedView>
				))}

				<ThemedText style={styles.sectionTitle}>Popular FAQs</ThemedText>
				{DUMMY_FAQ.map((faq) => (
					<ThemedView key={faq} style={styles.faqRow}>
						<Ionicons name="help-circle-outline" size={18} color="#0F766E" />
						<ThemedText style={styles.faqText}>{faq}</ThemedText>
					</ThemedView>
				))}

				<ThemedText style={styles.footerNote}>Dummy support page for UI preview mode.</ThemedText>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#F4F7F9',
	},
	header: {
		height: 56,
		paddingHorizontal: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#FFFFFF',
		borderBottomWidth: 1,
		borderBottomColor: '#E2E8F0',
	},
	backBtn: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#F8FAFC',
		borderWidth: 1,
		borderColor: '#E2E8F0',
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: '800',
		color: '#0F172A',
	},
	headerRightPlaceholder: {
		width: 36,
		height: 36,
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
