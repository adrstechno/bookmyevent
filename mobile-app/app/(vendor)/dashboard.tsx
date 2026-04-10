import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FadeInView from '@/components/common/FadeInView';
import PageLoadingState from '@/components/common/PageLoadingState';
import VendorAppBar from '@/components/vendor/VendorAppBar';
import { ThemedText } from '@/components/themed-text';
import { useAppToast } from '@/components/common/AppToastProvider';
import {
	fetchVendorKpis,
	fetchVendorProfile,
	fetchVendorRecentActivities,
} from '@/services/vendor/vendorService';
import { useAppSelector } from '@/store';
import { useSettingsTheme } from '@/theme/settingsTheme';
import type { VendorActivity, VendorKpis } from '@/types/vendor';

const EMPTY_KPIS: VendorKpis = {
	totalSales: 0,
	newOrders: 0,
	activeEvents: 0,
	totalClients: 0,
};

// Mock subscription data - no backend connection
interface SubscriptionData {
	hasSubscription: boolean;
	isActive: boolean;
	endDate: string | null;
	daysRemaining: number;
}

const MOCK_SUBSCRIPTION: SubscriptionData = {
	hasSubscription: false,
	isActive: false,
	endDate: null,
	daysRemaining: 0,
};

export default function VendorDashboardScreen() {
	const { palette } = useSettingsTheme();
	const { showError } = useAppToast();
	const router = useRouter();
	const name = useAppSelector((state: { auth: { name: string | null } }) => state.auth.name);
	const email = useAppSelector((state: { auth: { email: string | null } }) => state.auth.email);

	const [isLoading, setIsLoading] = useState(true);
	const [profileIncomplete, setProfileIncomplete] = useState(false);
	const [kpis, setKpis] = useState<VendorKpis>(EMPTY_KPIS);
	const [activities, setActivities] = useState<VendorActivity[]>([]);
	const [subscription] = useState<SubscriptionData>(MOCK_SUBSCRIPTION);
	const [showPayment, setShowPayment] = useState(false);

	const vendorName = useMemo(() => {
		if (name?.trim()) return name;
		if (email) return email.split('@')[0] ?? 'Vendor';
		return 'Vendor';
	}, [email, name]);

	const loadDashboard = useCallback(async () => {
		setIsLoading(true);
		try {
			const profile = await fetchVendorProfile();
			if (!profile) {
				setProfileIncomplete(true);
				return;
			}
			setProfileIncomplete(false);
			const [nextKpis, nextActivities] = await Promise.all([
				fetchVendorKpis(),
				fetchVendorRecentActivities(5),
			]);
			setKpis(nextKpis);
			setActivities(nextActivities);
		} catch (error) {
			const message =
				typeof error === 'object' && error && 'message' in error
					? String((error as { message?: string }).message)
					: 'Unable to load dashboard data.';
			showError(message);
		} finally {
			setIsLoading(false);
		}
	}, [showError]);

	useEffect(() => {
		void loadDashboard();
	}, [loadDashboard]);

	if (isLoading) {
		return <PageLoadingState text="Loading vendor dashboard..." />;
	}

	// Profile incomplete state
	if (profileIncomplete) {
		return (
			<SafeAreaView style={[styles.safeArea, { backgroundColor: palette.screenBg }]} edges={['top']}>
				<VendorAppBar title="Vendor Dashboard" actionIcon="refresh-outline" onAction={() => void loadDashboard()} />
				<ScrollView contentContainerStyle={styles.container}>

					<View style={styles.headerCopy}>
						<ThemedText style={[styles.pageTitle, { color: palette.text }]}>Vendor Dashboard</ThemedText>
						<ThemedText style={[styles.pageSubtitle, { color: palette.subtext }]}>
							Welcome, {vendorName}! Complete your profile to start receiving bookings.
						</ThemedText>
					</View>

					<FadeInView>
						<View style={[styles.warningCard, { backgroundColor: palette.surfaceBg, borderColor: '#f97316', borderTopColor: '#f97316' }]}>
							<Ionicons name="warning-outline" size={52} color="#f97316" />
							<ThemedText style={[styles.warningTitle, { color: palette.text }]}>Profile Setup Required</ThemedText>
							<ThemedText style={[styles.warningBody, { color: palette.subtext }]}>
								To access your vendor dashboard and start receiving bookings, complete your vendor profile first.
							</ThemedText>

							<View style={[styles.checklistCard, { backgroundColor: '#fff7ed' }]}>
								<ThemedText style={[styles.checklistTitle, { color: '#9a3412' }]}>What you need to provide:</ThemedText>
								{['Business name and description', 'Service category', 'Contact information', 'Business address', 'Profile picture'].map((item) => (
									<ThemedText key={item} style={[styles.checklistLine, { color: '#c2410c' }]}>• {item}</ThemedText>
								))}
							</View>

							<Pressable
								style={[styles.primaryBtn, { backgroundColor: palette.primary }]}
								onPress={() => router.push('/(vendor)/settings')}
							>
								<Ionicons name="settings-outline" size={18} color={palette.onPrimary} />
								<ThemedText style={[styles.primaryBtnText, { color: palette.onPrimary }]}>Complete Profile Setup</ThemedText>
							</Pressable>

							<ThemedText style={[styles.hintText, { color: palette.muted }]}>This will only take a few minutes to complete</ThemedText>
						</View>
					</FadeInView>
				</ScrollView>
			</SafeAreaView>
		);
	}

	const isExpiringSoon = subscription.isActive && subscription.daysRemaining <= 30 && subscription.daysRemaining > 0;

	// Normal dashboard
	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: palette.screenBg }]} edges={['top']}>
			<VendorAppBar title="Vendor Dashboard" actionIcon="refresh-outline" onAction={() => void loadDashboard()} />
			<ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

				{/* Header */}
				<View style={styles.headerCopy}>
					<ThemedText style={[styles.pageTitle, { color: palette.text }]}>Vendor Dashboard</ThemedText>
					<ThemedText style={[styles.pageSubtitle, { color: palette.subtext }]}>
						Welcome back, {vendorName}! Here's your business overview.
					</ThemedText>
				</View>

				{/* Subscription Status Card */}
				<FadeInView delay={30}>
					<SubscriptionCard
						subscription={subscription}
						isExpiringSoon={isExpiringSoon}
						palette={palette}
						onSubscribe={() => setShowPayment(true)}
					/>
				</FadeInView>

				{/* KPI Cards - 2x2 grid */}
				<FadeInView delay={60} style={styles.kpiRow}>
					<KpiCard title="Total Sales" value={`₹${kpis.totalSales.toLocaleString()}`} caption="Lifetime earnings" icon="cash-outline" palette={palette} />
					<KpiCard title="New Orders" value={String(kpis.newOrders)} caption="This month" icon="receipt-outline" palette={palette} />
				</FadeInView>

				<FadeInView delay={90} style={styles.kpiRow}>
					<KpiCard title="Active Events" value={String(kpis.activeEvents)} caption="Ongoing projects" icon="bar-chart-outline" palette={palette} />
					<KpiCard title="Total Clients" value={String(kpis.totalClients)} caption="Unique customers" icon="people-outline" palette={palette} />
				</FadeInView>

				{/* Recent Activities */}
				<FadeInView delay={120}>
					<View style={[styles.sectionCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
						<ThemedText style={[styles.sectionTitle, { color: palette.text }]}>Recent Activities</ThemedText>
						{activities.length === 0 ? (
							<ThemedText style={[styles.emptyText, { color: palette.subtext }]}>No recent activities yet.</ThemedText>
						) : (
							activities.map((activity) => (
								<View
									key={`${activity.bookingId}-${activity.createdAt ?? 'now'}`}
									style={[styles.activityRow, { borderTopColor: palette.border }]}
								>
									<View style={styles.activityLeft}>
										<ThemedText style={[styles.activityTitle, { color: palette.text }]}>
											Booking #{String(activity.bookingUuid || activity.bookingId).slice(-8)}
										</ThemedText>
										<ThemedText style={[styles.activitySub, { color: palette.subtext }]}>
											{activity.userName || 'Customer'} — {activity.status}
										</ThemedText>
									</View>
									<ThemedText style={[styles.activityDate, { color: palette.muted }]}>
										{activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : '-'}
									</ThemedText>
								</View>
							))
						)}
					</View>
				</FadeInView>

				{/* Quick Actions */}
				<FadeInView delay={180}>
					<View style={[styles.sectionCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
						<ThemedText style={[styles.sectionTitle, { color: palette.text }]}>Quick Actions</ThemedText>
						<View style={styles.actionsRow}>
							<QuickAction label="Manage Shifts" icon="time-outline" onPress={() => router.push('/(vendor)/shifts')} palette={palette} />
							<QuickAction label="View Bookings" icon="calendar-outline" onPress={() => router.push('/(vendor)/bookings')} palette={palette} />
							<QuickAction label="Packages" icon="cube-outline" onPress={() => router.push('/(vendor)/packages')} palette={palette} />
						</View>
					</View>
				</FadeInView>
			</ScrollView>

			{/* Subscription Payment Modal */}
			<SubscriptionPaymentModal
				visible={showPayment}
				onClose={() => setShowPayment(false)}
				onSuccess={() => {
					setShowPayment(false);
					// TODO: refresh subscription status from API
				}}
				palette={palette}
			/>
		</SafeAreaView>
	);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SubscriptionCard({
	subscription,
	isExpiringSoon,
	palette,
	onSubscribe,
}: {
	subscription: SubscriptionData;
	isExpiringSoon: boolean;
	palette: any;
	onSubscribe: () => void;
}) {
	const borderColor = subscription.isActive
		? isExpiringSoon ? '#f9a826' : '#10b981'
		: '#ef4444';

	const statusBg = subscription.isActive
		? isExpiringSoon ? '#fef9c3' : '#dcfce7'
		: '#fee2e2';

	const statusText = subscription.isActive
		? isExpiringSoon ? '#854d0e' : '#166534'
		: '#991b1b';

	return (
		<View style={[styles.subscriptionCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border, borderLeftColor: borderColor }]}>
			<View style={styles.subRow}>
				<Ionicons
					name={subscription.isActive ? 'checkmark-circle' : 'alert-circle'}
					size={22}
					color={borderColor}
				/>
				<ThemedText style={[styles.subTitle, { color: palette.text }]}>Subscription Status</ThemedText>
			</View>

			{subscription.isActive ? (
				<>
					<View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
						<ThemedText style={[styles.statusBadgeText, { color: statusText }]}>Active</ThemedText>
					</View>

					{subscription.endDate && (
						<View style={styles.subDateRow}>
							<Ionicons name="calendar-outline" size={14} color={palette.muted} />
							<ThemedText style={[styles.subDateText, { color: palette.subtext }]}>
								Valid until: {new Date(subscription.endDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
							</ThemedText>
						</View>
					)}

					{isExpiringSoon && (
						<View style={[styles.expiryWarning, { backgroundColor: '#fef9c3', borderColor: '#fde047' }]}>
							<ThemedText style={[styles.expiryWarningText, { color: '#854d0e' }]}>
								⚠️ Your subscription expires in {subscription.daysRemaining} days. Renew now to continue accepting bookings.
							</ThemedText>
						</View>
					)}

					<ThemedText style={[styles.daysText, { color: palette.muted }]}>
						{subscription.daysRemaining} days remaining
					</ThemedText>
				</>
			) : (
				<>
					<ThemedText style={[styles.subBody, { color: palette.subtext }]}>
						You don't have an active subscription. Subscribe now to start accepting bookings.
					</ThemedText>
					<Pressable style={styles.subscribeBtn} onPress={onSubscribe}>
						<Ionicons name="card-outline" size={16} color="#fff" />
						<ThemedText style={styles.subscribeBtnText}>Subscribe Now - ₹999/year</ThemedText>
					</Pressable>
				</>
			)}
		</View>
	);
}

function KpiCard({
	title,
	value,
	caption,
	icon,
	palette,
}: {
	title: string;
	value: string;
	caption: string;
	icon: keyof typeof Ionicons.glyphMap;
	palette: any;
}) {
	return (
		<View style={[styles.kpiCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border, borderTopColor: palette.primary }]}>
			<View style={styles.kpiTopRow}>
				<ThemedText style={[styles.kpiTitle, { color: palette.subtext }]}>{title}</ThemedText>
				<Ionicons name={icon} size={20} color={palette.primary} />
			</View>
			<ThemedText style={[styles.kpiValue, { color: palette.text }]}>{value}</ThemedText>
			<ThemedText style={[styles.kpiCaption, { color: palette.muted }]}>{caption}</ThemedText>
		</View>
	);
}

function QuickAction({
	label,
	icon,
	onPress,
	palette,
}: {
	label: string;
	icon: keyof typeof Ionicons.glyphMap;
	onPress: () => void;
	palette: any;
}) {
	return (
		<Pressable
			style={({ pressed }) => [
				styles.quickAction,
				{ backgroundColor: pressed ? palette.pressedBg : palette.headerBtnBg, borderColor: palette.border },
			]}
			onPress={onPress}
		>
			<Ionicons name={icon} size={18} color={palette.primary} />
			<ThemedText style={[styles.quickActionText, { color: palette.text }]}>{label}</ThemedText>
		</Pressable>
	);
}

// ─── Subscription Payment Modal ───────────────────────────────────────────────

const SUBSCRIPTION_DETAILS = {
	originalAmount: 999,
	discountedAmount: 499,
	validCoupon: 'welcome546goeventify',
	features: [
		'Accept unlimited bookings',
		'Manage your calendar and shifts',
		'Receive instant notifications',
		'Access to vendor dashboard',
		'Customer reviews and ratings',
		'24/7 customer support',
	],
};

function SubscriptionPaymentModal({
	visible,
	onClose,
	onSuccess: _onSuccess,
	palette,
}: {
	visible: boolean;
	onClose: () => void;
	onSuccess: () => void;
	palette: any;
}) {
	const { showSuccess, showError, showInfo } = useAppToast();
	const [couponCode, setCouponCode] = useState('');
	const [couponApplied, setCouponApplied] = useState(false);
	const [couponError, setCouponError] = useState('');
	const [isProcessing, setIsProcessing] = useState(false);

	const finalAmount = couponApplied
		? SUBSCRIPTION_DETAILS.discountedAmount
		: SUBSCRIPTION_DETAILS.originalAmount;

	const applyCoupon = () => {
		setCouponError('');
		if (!couponCode.trim()) {
			setCouponError('Please enter a coupon code');
			return;
		}
		if (couponCode.trim().toLowerCase() === SUBSCRIPTION_DETAILS.validCoupon.toLowerCase()) {
			setCouponApplied(true);
			showSuccess(`🎉 Coupon applied! You saved ₹${SUBSCRIPTION_DETAILS.originalAmount - SUBSCRIPTION_DETAILS.discountedAmount}`);
		} else {
			setCouponError('Invalid coupon code');
			showError('Invalid coupon code');
		}
	};

	const removeCoupon = () => {
		setCouponCode('');
		setCouponApplied(false);
		setCouponError('');
		showInfo('Coupon removed');
	};

	const handlePayment = async () => {
		setIsProcessing(true);
		// TODO: integrate Razorpay React Native SDK when backend is ready
		await new Promise((r) => setTimeout(r, 800));
		setIsProcessing(false);
		showInfo('Payment gateway integration coming soon.');
	};

	const handleClose = () => {
		setCouponCode('');
		setCouponApplied(false);
		setCouponError('');
		onClose();
	};

	return (
		<Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
			<BlurView intensity={60} tint="dark" style={modalStyles.overlay}>
				<Pressable style={modalStyles.backdrop} onPress={handleClose} />
				<View style={[modalStyles.sheet, { backgroundColor: palette.surfaceBg }]}>
					{/* Header */}
					<View style={modalStyles.header}>
						<View>
							<ThemedText style={modalStyles.headerTitle}>Vendor Subscription</ThemedText>
							<ThemedText style={modalStyles.headerSub}>Activate your vendor account</ThemedText>
						</View>
						<Pressable style={modalStyles.closeBtn} onPress={handleClose}>
							<Ionicons name="close" size={22} color="#fff" />
						</Pressable>
					</View>

					<ScrollView contentContainerStyle={modalStyles.body} showsVerticalScrollIndicator={false}>
						{/* Pricing Card */}
						<View style={modalStyles.pricingCard}>
							{couponApplied && (
								<ThemedText style={modalStyles.originalPrice}>₹{SUBSCRIPTION_DETAILS.originalAmount}</ThemedText>
							)}
							<ThemedText style={[modalStyles.finalPrice, { color: '#284b63' }]}>₹{finalAmount}</ThemedText>
							<ThemedText style={[modalStyles.perYear, { color: palette.subtext }]}>per year</ThemedText>

							{couponApplied && (
								<View style={modalStyles.savingsBadge}>
									<ThemedText style={modalStyles.savingsText}>
										🎉 You saved ₹{SUBSCRIPTION_DETAILS.originalAmount - SUBSCRIPTION_DETAILS.discountedAmount}!
									</ThemedText>
								</View>
							)}

							<View style={modalStyles.validRow}>
								<Ionicons name="time-outline" size={14} color="#f9a826" />
								<ThemedText style={[modalStyles.validText, { color: palette.subtext }]}>Valid for 365 days</ThemedText>
							</View>
						</View>

						{/* Coupon Section */}
						<View style={modalStyles.section}>
							<ThemedText style={[modalStyles.sectionLabel, { color: palette.text }]}>Have a coupon code?</ThemedText>

							{!couponApplied ? (
								<View style={modalStyles.couponRow}>
									<TextInput
										style={[
											modalStyles.couponInput,
											{
												borderColor: couponError ? '#dc2626' : palette.border,
												color: palette.text,
												backgroundColor: palette.headerBtnBg,
											},
										]}
										placeholder="Enter coupon code"
										placeholderTextColor={palette.muted}
										value={couponCode}
										onChangeText={(v) => { setCouponCode(v); setCouponError(''); }}
										autoCapitalize="none"
									/>
									<Pressable
										style={[modalStyles.applyBtn, { backgroundColor: '#284b63', opacity: !couponCode.trim() ? 0.5 : 1 }]}
										onPress={applyCoupon}
										disabled={!couponCode.trim()}
									>
										<ThemedText style={modalStyles.applyBtnText}>Apply</ThemedText>
									</Pressable>
								</View>
							) : (
								<View style={modalStyles.couponAppliedRow}>
									<Ionicons name="checkmark-circle" size={20} color="#16a34a" />
									<ThemedText style={modalStyles.couponAppliedText}>{couponCode.toUpperCase()}</ThemedText>
									<Pressable onPress={removeCoupon} style={modalStyles.removeBtn}>
										<ThemedText style={modalStyles.removeBtnText}>Remove</ThemedText>
									</Pressable>
								</View>
							)}

							{couponError ? (
								<ThemedText style={modalStyles.couponError}>{couponError}</ThemedText>
							) : null}
						</View>

						{/* Features */}
						<View style={modalStyles.section}>
							<ThemedText style={[modalStyles.sectionLabel, { color: palette.text }]}>What's Included:</ThemedText>
							{SUBSCRIPTION_DETAILS.features.map((feature) => (
								<View key={feature} style={modalStyles.featureRow}>
									<View style={modalStyles.featureCheck}>
										<Ionicons name="checkmark" size={12} color="#16a34a" />
									</View>
									<ThemedText style={[modalStyles.featureText, { color: palette.subtext }]}>{feature}</ThemedText>
								</View>
							))}
						</View>

						{/* Security Badge */}
						<View style={[modalStyles.securityBadge, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
							<Ionicons name="shield-checkmark-outline" size={26} color="#2563eb" />
							<View style={{ flex: 1 }}>
								<ThemedText style={modalStyles.securityTitle}>Secure Payment</ThemedText>
								<ThemedText style={modalStyles.securitySub}>Powered by Razorpay - India's most trusted payment gateway</ThemedText>
							</View>
						</View>

						{/* Pay Button */}
						<Pressable
							style={[modalStyles.payBtn, { opacity: isProcessing ? 0.7 : 1 }]}
							onPress={() => void handlePayment()}
							disabled={isProcessing}
						>
							{isProcessing ? (
								<ThemedText style={modalStyles.payBtnText}>Processing...</ThemedText>
							) : (
								<>
									<Ionicons name="card-outline" size={20} color="#fff" />
									<ThemedText style={modalStyles.payBtnText}>Pay ₹{finalAmount} & Activate</ThemedText>
								</>
							)}
						</Pressable>

						{/* Terms */}
						<ThemedText style={[modalStyles.terms, { color: palette.muted }]}>
							By proceeding, you agree to our Terms of Service and Privacy Policy. Subscription will be valid for 365 days from the date of payment.
						</ThemedText>
					</ScrollView>
				</View>
			</BlurView>
		</Modal>
	);
}

const modalStyles = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	backdrop: {
		...StyleSheet.absoluteFillObject,
	},
	sheet: {
		borderTopLeftRadius: 22,
		borderTopRightRadius: 22,
		maxHeight: '92%',
		overflow: 'hidden',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 18,
		paddingBottom: 16,
		backgroundColor: '#284b63',
	},
	headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
	headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
	closeBtn: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: 'rgba(255,255,255,0.2)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	body: { padding: 18, gap: 18, paddingBottom: 32 },

	// Pricing
	pricingCard: {
		borderWidth: 2,
		borderColor: '#f9a826',
		borderRadius: 14,
		padding: 18,
		alignItems: 'center',
		backgroundColor: 'rgba(249,168,38,0.06)',
		gap: 4,
	},
	originalPrice: { fontSize: 20, color: '#9ca3af', textDecorationLine: 'line-through' },
	finalPrice: { fontSize: 44, fontWeight: '800' },
	perYear: { fontSize: 14 },
	savingsBadge: {
		marginTop: 6,
		backgroundColor: '#dcfce7',
		paddingHorizontal: 14,
		paddingVertical: 6,
		borderRadius: 20,
	},
	savingsText: { fontSize: 13, fontWeight: '700', color: '#15803d' },
	validRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
	validText: { fontSize: 13 },

	// Coupon
	section: { gap: 10 },
	sectionLabel: { fontSize: 14, fontWeight: '700' },
	couponRow: { flexDirection: 'row', gap: 8 },
	couponInput: {
		flex: 1,
		height: 46,
		borderWidth: 1.5,
		borderRadius: 10,
		paddingHorizontal: 12,
		fontSize: 14,
	},
	applyBtn: {
		height: 46,
		paddingHorizontal: 18,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
	},
	applyBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
	couponAppliedRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		borderWidth: 1.5,
		borderColor: '#16a34a',
		borderRadius: 10,
		paddingHorizontal: 12,
		paddingVertical: 10,
		backgroundColor: '#f0fdf4',
	},
	couponAppliedText: { flex: 1, fontSize: 14, fontWeight: '700', color: '#15803d' },
	removeBtn: {},
	removeBtnText: { fontSize: 13, fontWeight: '700', color: '#dc2626' },
	couponError: { fontSize: 12, color: '#dc2626' },

	// Features
	featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
	featureCheck: {
		width: 20,
		height: 20,
		borderRadius: 10,
		backgroundColor: '#dcfce7',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 1,
	},
	featureText: { flex: 1, fontSize: 14, lineHeight: 20 },

	// Security
	securityBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		borderWidth: 1,
		borderRadius: 12,
		padding: 14,
	},
	securityTitle: { fontSize: 14, fontWeight: '700', color: '#1e3a5f' },
	securitySub: { fontSize: 12, color: '#3b82f6', marginTop: 2 },

	// Pay button
	payBtn: {
		height: 54,
		borderRadius: 14,
		backgroundColor: '#f9a826',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
	},
	payBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },

	// Terms
	terms: { fontSize: 11, textAlign: 'center', lineHeight: 16 },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
	safeArea: { flex: 1 },
	container: { padding: 16, paddingTop: 12, paddingBottom: 32, gap: 12 },

	// Header copy
	headerCopy: { gap: 4, paddingTop: 4 },
	pageTitle: { fontSize: 28, fontWeight: '800' },
	pageSubtitle: { fontSize: 14, lineHeight: 20 },

	// Subscription card
	subscriptionCard: {
		borderRadius: 14,
		borderWidth: 1,
		borderLeftWidth: 4,
		padding: 14,
		gap: 8,
	},
	subRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	subTitle: { fontSize: 16, fontWeight: '700' },
	statusBadge: {
		alignSelf: 'flex-start',
		paddingHorizontal: 10,
		paddingVertical: 3,
		borderRadius: 20,
	},
	statusBadgeText: { fontSize: 12, fontWeight: '700' },
	subDateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
	subDateText: { fontSize: 13 },
	expiryWarning: {
		borderRadius: 8,
		borderWidth: 1,
		padding: 10,
	},
	expiryWarningText: { fontSize: 13, lineHeight: 18 },
	daysText: { fontSize: 12 },
	subBody: { fontSize: 14, lineHeight: 20 },
	subscribeBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		alignSelf: 'flex-start',
		backgroundColor: '#f9a826',
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderRadius: 10,
	},
	subscribeBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

	// KPI
	kpiRow: { flexDirection: 'row', gap: 10 },
	kpiCard: {
		flex: 1,
		borderRadius: 14,
		borderWidth: 1,
		borderTopWidth: 4,
		padding: 12,
		gap: 6,
	},
	kpiTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	kpiTitle: { fontSize: 12, fontWeight: '600' },
	kpiValue: { fontSize: 22, fontWeight: '800' },
	kpiCaption: { fontSize: 12 },

	// Section card
	sectionCard: {
		borderRadius: 14,
		borderWidth: 1,
		padding: 14,
		gap: 10,
	},
	sectionTitle: { fontSize: 16, fontWeight: '800' },
	emptyText: { fontSize: 14 },

	// Activity
	activityRow: {
		paddingTop: 10,
		borderTopWidth: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 8,
	},
	activityLeft: { flex: 1, gap: 2 },
	activityTitle: { fontSize: 14, fontWeight: '700' },
	activitySub: { fontSize: 13 },
	activityDate: { fontSize: 12 },

	// Quick actions
	actionsRow: { gap: 8 },
	quickAction: {
		height: 44,
		borderRadius: 10,
		borderWidth: 1,
		paddingHorizontal: 14,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	quickActionText: { fontSize: 14, fontWeight: '700' },

	// Profile incomplete
	warningCard: {
		borderRadius: 18,
		borderWidth: 1,
		borderTopWidth: 4,
		padding: 18,
		alignItems: 'center',
		gap: 10,
	},
	warningTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
	warningBody: { fontSize: 14, lineHeight: 21, textAlign: 'center' },
	checklistCard: { width: '100%', borderRadius: 12, padding: 12, gap: 4 },
	checklistTitle: { fontSize: 14, fontWeight: '800' },
	checklistLine: { fontSize: 13, lineHeight: 20 },
	primaryBtn: {
		width: '100%',
		height: 48,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		gap: 8,
	},
	primaryBtnText: { fontSize: 15, fontWeight: '700' },
	hintText: { fontSize: 12 },
});
