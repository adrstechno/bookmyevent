import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	RefreshControl,
	ScrollView,
	StyleSheet,
	View,
	Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FadeInView from '@/components/common/FadeInView';
import RazorpayWebModal, { type RazorpayPaymentResult } from '@/components/payment/RazorpayWebModal';
import VendorAppBar from '@/components/vendor/VendorAppBar';
import { ThemedText } from '@/components/themed-text';
import { useAppToast } from '@/components/common/AppToastProvider';
import {
	fetchVendorKpis,
	fetchVendorProfile,
	fetchVendorRecentActivities,
} from '@/services/vendor/vendorService';
import {
	createSubscriptionOrder,
	fetchSubscriptionStatus,
	type SubscriptionOrder,
	type SubscriptionStatus,
	verifySubscriptionPayment,
} from '@/services/vendor/subscriptionService';
import { useAppSelector } from '@/store';
import { useSettingsTheme } from '@/theme/settingsTheme';
import type { VendorActivity, VendorKpis } from '@/types/vendor';

const EMPTY_KPIS: VendorKpis = {
	totalSales: 0,
	newOrders: 0,
	activeEvents: 0,
	totalClients: 0,
};

const DEFAULT_SUB: SubscriptionStatus = {
	isActive: false,
	endDate: null,
	daysRemaining: 0,
	hasSubscription: false,
};

export default function VendorDashboardScreen() {
	const { palette } = useSettingsTheme();
	const { showError, showInfo, showSuccess } = useAppToast();
	const router = useRouter();
	const name = useAppSelector((s: any) => s.auth.name);
	const email = useAppSelector((s: any) => s.auth.email);

	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [profileIncomplete, setProfileIncomplete] = useState(false);
	const [kpis, setKpis] = useState<VendorKpis>(EMPTY_KPIS);
	const [activities, setActivities] = useState<VendorActivity[]>([]);
	const [subscription, setSubscription] = useState<SubscriptionStatus>(DEFAULT_SUB);
	const [paymentLoading, setPaymentLoading] = useState(false);
	const [razorpayModal, setRazorpayModal] = useState<{
		visible: boolean;
		order: SubscriptionOrder | null;
	}>({ visible: false, order: null });

	const vendorName = useMemo(() => {
		if (name?.trim()) return name;
		if (email) return email.split('@')[0] ?? 'Vendor';
		return 'Vendor';
	}, [email, name]);

	// ── Load all dashboard data ──────────────────────────────────
	const loadDashboard = useCallback(async (isRefresh = false) => {
		if (isRefresh) setRefreshing(true);
		else setLoading(true);

		try {
			const profile = await fetchVendorProfile();
			if (!profile) {
				setProfileIncomplete(true);
				return;
			}
			setProfileIncomplete(false);

			const [nextKpis, nextActivities, nextSub] = await Promise.all([
				fetchVendorKpis(),
				fetchVendorRecentActivities(5),
				fetchSubscriptionStatus().catch(() => DEFAULT_SUB),
			]);

			setKpis(nextKpis);
			setActivities(nextActivities);
			setSubscription(nextSub);
		} catch (err: unknown) {
			const status = (err as { status?: number })?.status;
			if (status === 404) {
				setProfileIncomplete(true);
			} else {
				showError((err as { message?: string })?.message ?? 'Unable to load dashboard data.');
			}
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, [showError]);

	useEffect(() => { loadDashboard(); }, [loadDashboard]);

	// ── Step 1: Create order and open WebView checkout ───────────
	const handleSubscriptionPayment = useCallback(async () => {
		if (paymentLoading) return;
		setPaymentLoading(true);
		try {
			showInfo('Creating secure payment order...');
			const order = await createSubscriptionOrder();
			if (!order.orderId || !order.keyId || !order.vendorId) {
				throw new Error('Payment order is incomplete. Please try again.');
			}
			setRazorpayModal({ visible: true, order });
		} catch (err: unknown) {
			const error = err as { message?: string };
			showError(error.message ?? 'Could not create payment order. Please try again.');
		} finally {
			setPaymentLoading(false);
		}
	}, [paymentLoading, showError, showInfo]);

	// ── Step 2: Payment success — verify and activate ─────────────
	const handlePaymentSuccess = useCallback(async (result: RazorpayPaymentResult) => {
		const order = razorpayModal.order;
		setRazorpayModal({ visible: false, order: null });
		if (!order) return;

		setPaymentLoading(true);
		try {
			showInfo('Verifying payment...');
			await verifySubscriptionPayment({
				razorpay_order_id: result.razorpay_order_id,
				razorpay_payment_id: result.razorpay_payment_id,
				razorpay_signature: result.razorpay_signature,
				vendor_id: order.vendorId,
			});
			const nextSub = await fetchSubscriptionStatus().catch(() => ({
				...DEFAULT_SUB,
				isActive: true,
				hasSubscription: true,
			}));
			setSubscription(nextSub);
			showSuccess('Subscription activated successfully!');
		} catch (err: unknown) {
			const error = err as { message?: string };
			showError(error.message ?? 'Payment verification failed. Contact support.');
		} finally {
			setPaymentLoading(false);
		}
	}, [razorpayModal.order, showError, showInfo, showSuccess]);

	const handlePaymentCancel = useCallback(() => {
		setRazorpayModal({ visible: false, order: null });
		showInfo('Payment cancelled.');
	}, [showInfo]);

	const handlePaymentError = useCallback((message: string) => {
		setRazorpayModal({ visible: false, order: null });
		showError(message || 'Payment failed. Please try again.');
	}, [showError]);

	// ── Loading ──────────────────────────────────────────────────
	if (loading) {
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: palette.screenBg }}>
				<VendorAppBar title="Vendor Dashboard" />
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
					<ActivityIndicator size="large" color={palette.primary} />
					<ThemedText style={{ color: palette.muted }}>Loading dashboard...</ThemedText>
				</View>
			</SafeAreaView>
		);
	}

	// ── Profile incomplete (same as frontend) ────────────────────
	if (profileIncomplete) {
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: palette.screenBg }}>
				<VendorAppBar title="Vendor Dashboard" />
				<ScrollView contentContainerStyle={s.container}>
					<View style={s.headerCopy}>
						<ThemedText style={[s.pageTitle, { color: palette.text }]}>Vendor Dashboard</ThemedText>
						<ThemedText style={[s.pageSubtitle, { color: palette.muted }]}>
							Welcome, {vendorName}! Complete your profile to start receiving bookings.
						</ThemedText>
					</View>

					<FadeInView>
						<View style={[s.warningCard, { backgroundColor: palette.surfaceBg, borderTopColor: '#f97316' }]}>
							<Ionicons name="warning-outline" size={52} color="#f97316" />
							<ThemedText style={[s.warningTitle, { color: palette.text }]}>
								Profile Setup Required
							</ThemedText>
							<ThemedText style={[s.warningBody, { color: palette.muted }]}>
								To access your vendor dashboard and start receiving bookings, you need to complete your vendor profile first.
							</ThemedText>

							<View style={s.checklistCard}>
								<ThemedText style={s.checklistTitle}>What you need to provide:</ThemedText>
								{[
									'Business name and description',
									'Service category',
									'Contact information',
									'Business address',
									'Profile picture',
								].map((item) => (
									<ThemedText key={item} style={s.checklistLine}>• {item}</ThemedText>
								))}
							</View>

							<Pressable
								style={[s.primaryBtn, { backgroundColor: palette.primary }]}
								onPress={() => router.push('/(vendor)/settings')}
							>
								<Ionicons name="settings-outline" size={18} color="#fff" />
								<ThemedText style={s.primaryBtnText}>Complete Profile Setup</ThemedText>
							</Pressable>

							<ThemedText style={[s.hintText, { color: palette.muted }]}>
								This will only take a few minutes to complete
							</ThemedText>
						</View>
					</FadeInView>
				</ScrollView>
			</SafeAreaView>
		);
	}

	const isExpiringSoon = subscription.isActive && subscription.daysRemaining <= 30 && subscription.daysRemaining > 0;

	// ── Normal dashboard ─────────────────────────────────────────
	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: palette.screenBg }}>
			<VendorAppBar title="Vendor Dashboard" />

			<ScrollView
				contentContainerStyle={s.container}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={() => loadDashboard(true)}
						colors={[palette.primary]}
						tintColor={palette.primary}
					/>
				}
			>
				{/* Header */}
				<View style={s.headerCopy}>
					<ThemedText style={[s.pageTitle, { color: palette.text }]}>Vendor Dashboard</ThemedText>
					<ThemedText style={[s.pageSubtitle, { color: palette.muted }]}>
						Welcome back, {vendorName}! Here is your business overview.
					</ThemedText>
				</View>

				{/* ── Subscription Status (same as frontend) ── */}
				<FadeInView>
					<SubscriptionCard
						subscription={subscription}
						isExpiringSoon={isExpiringSoon}
						palette={palette}
						paymentLoading={paymentLoading}
						onPayPress={handleSubscriptionPayment}
					/>
				</FadeInView>

				{/* ── KPI Cards 2x2 (Total Sales removed per user request) ── */}
				<FadeInView style={s.kpiRow}>
					<KpiCard
						title="New Orders"
						value={String(kpis.newOrders)}
						caption="This month"
						icon="receipt-outline"
						palette={palette}
					/>
					<KpiCard
						title="Active Events"
						value={String(kpis.activeEvents)}
						caption="Ongoing projects"
						icon="bar-chart-outline"
						palette={palette}
					/>
				</FadeInView>

				<FadeInView style={s.kpiRow}>
					<KpiCard
						title="Total Clients"
						value={String(kpis.totalClients)}
						caption="Unique customers"
						icon="people-outline"
						palette={palette}
					/>
					{/* Empty slot to keep grid balanced */}
					<View style={{ flex: 1 }} />
				</FadeInView>

				{/* ── Recent Activities (same as frontend) ── */}
				<FadeInView>
					<View style={[s.sectionCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
						<ThemedText style={[s.sectionTitle, { color: palette.text }]}>Recent Activities</ThemedText>
						{activities.length === 0 ? (
							<ThemedText style={[s.emptyText, { color: palette.muted }]}>No recent activities</ThemedText>
						) : (
							activities.map((act) => (
								<View
									key={`${act.bookingId}-${act.createdAt ?? 'x'}`}
									style={[s.activityRow, { borderTopColor: palette.border }]}
								>
									<View style={s.activityLeft}>
										<ThemedText style={[s.activityTitle, { color: palette.text }]}>
											Booking #{String(act.bookingUuid || act.bookingId).slice(-8)}
										</ThemedText>
										<ThemedText style={[s.activitySub, { color: palette.muted }]}>
											{act.userName ? `Customer: ${act.userName}` : ''}{act.userName ? ' — ' : ''}{act.status}
										</ThemedText>
									</View>
									<ThemedText style={[s.activityDate, { color: palette.muted }]}>
										{act.createdAt ? new Date(act.createdAt).toLocaleDateString() : '-'}
									</ThemedText>
								</View>
							))
						)}
					</View>
				</FadeInView>

				{/* ── Performance Overview placeholder (same as frontend) ── */}
				<FadeInView>
					<View style={[s.sectionCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
						<ThemedText style={[s.sectionTitle, { color: palette.text }]}>Performance Overview</ThemedText>
						<View style={[s.chartPlaceholder, { borderColor: palette.border }]}>
							<ThemedText style={s.chartEmoji}>📈</ThemedText>
							<ThemedText style={[s.chartText, { color: palette.muted }]}>
								Analytics visualization coming soon
							</ThemedText>
						</View>
					</View>
				</FadeInView>
			</ScrollView>

			{/* ── Razorpay WebView payment modal ── */}
			{razorpayModal.visible && razorpayModal.order && (
				<RazorpayWebModal
					visible={razorpayModal.visible}
					keyId={razorpayModal.order.keyId}
					orderId={razorpayModal.order.orderId}
					amount={razorpayModal.order.amount}
					currency={razorpayModal.order.currency}
					businessName={razorpayModal.order.businessName || 'GoEventify'}
					prefillName={vendorName}
					prefillEmail={email ?? ''}
					onSuccess={handlePaymentSuccess}
					onCancel={handlePaymentCancel}
					onError={handlePaymentError}
				/>
			)}
		</SafeAreaView>
	);
}

// ─── Subscription Card ────────────────────────────────────────────────────────

function SubscriptionCard({
	subscription,
	isExpiringSoon,
	palette,
	paymentLoading,
	onPayPress,
}: {
	subscription: SubscriptionStatus;
	isExpiringSoon: boolean;
	palette: any;
	paymentLoading: boolean;
	onPayPress: () => void;
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
		<View style={[s.subCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border, borderLeftColor: borderColor }]}>
			<View style={s.subRow}>
				<Ionicons
					name={subscription.isActive ? 'checkmark-circle' : 'alert-circle'}
					size={22}
					color={borderColor}
				/>
				<ThemedText style={[s.subTitle, { color: palette.text }]}>Subscription Status</ThemedText>
			</View>

			{subscription.isActive ? (
				<>
					<View style={[s.statusBadge, { backgroundColor: statusBg }]}>
						<ThemedText style={[s.statusBadgeText, { color: statusText }]}>Active</ThemedText>
					</View>

					{subscription.endDate ? (
						<View style={s.subDateRow}>
							<Ionicons name="calendar-outline" size={14} color={palette.muted} />
							<ThemedText style={[s.subDateText, { color: palette.muted }]}>
								Valid until:{' '}
								{new Date(subscription.endDate).toLocaleDateString('en-IN', {
									year: 'numeric', month: 'long', day: 'numeric',
								})}
							</ThemedText>
						</View>
					) : null}

					{isExpiringSoon ? (
						<View style={[s.expiryWarning, { backgroundColor: '#fef9c3', borderColor: '#fde047' }]}>
							<ThemedText style={{ fontSize: 13, lineHeight: 18, color: '#854d0e' }}>
								⚠️ Your subscription expires in {subscription.daysRemaining} days. Renew now to continue accepting bookings.
							</ThemedText>
						</View>
					) : null}

					<ThemedText style={[s.daysText, { color: palette.muted }]}>
						{subscription.daysRemaining} days remaining
					</ThemedText>

					{isExpiringSoon ? (
						<SubscriptionPayButton
							amountLabel="Renew"
							loading={paymentLoading}
							palette={palette}
							onPress={onPayPress}
						/>
					) : null}
				</>
			) : (
				<>
					<ThemedText style={[s.subBody, { color: palette.muted }]}>
						You do not have an active subscription. Subscribe to start accepting bookings.
					</ThemedText>
					<SubscriptionPayButton
						amountLabel="Pay & Activate"
						loading={paymentLoading}
						palette={palette}
						onPress={onPayPress}
					/>
				</>
				)}
			</View>
	);
}

function SubscriptionPayButton({
	amountLabel,
	loading,
	palette,
	onPress,
}: {
	amountLabel: string;
	loading: boolean;
	palette: any;
	onPress: () => void;
}) {
	return (
		<Pressable
			style={[s.payBtn, { backgroundColor: palette.primary }, loading ? s.payBtnDisabled : null]}
			disabled={loading}
			onPress={onPress}
		>
			{loading ? (
				<ActivityIndicator size="small" color="#fff" />
			) : (
				<Ionicons name="card-outline" size={18} color="#fff" />
			)}
			<ThemedText style={s.payBtnText}>{loading ? 'Processing...' : amountLabel}</ThemedText>
		</Pressable>
	);
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
	title, value, caption, icon, palette,
}: {
	title: string; value: string; caption: string;
	icon: keyof typeof Ionicons.glyphMap; palette: any;
}) {
	return (
		<View style={[s.kpiCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border, borderTopColor: palette.primary }]}>
			<View style={s.kpiTopRow}>
				<ThemedText style={[s.kpiTitle, { color: palette.muted }]}>{title}</ThemedText>
				<Ionicons name={icon} size={20} color={palette.primary} />
			</View>
			<ThemedText style={[s.kpiValue, { color: palette.text }]}>{value}</ThemedText>
			<ThemedText style={[s.kpiCaption, { color: palette.muted }]}>{caption}</ThemedText>
		</View>
	);
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
	container: { padding: 16, paddingTop: 12, paddingBottom: 32, gap: 12 },

	headerCopy: { gap: 4, paddingTop: 4 },
	pageTitle: { fontSize: 28, fontWeight: '800' },
	pageSubtitle: { fontSize: 14, lineHeight: 20 },

	// Subscription
	subCard: { borderRadius: 14, borderWidth: 1, borderLeftWidth: 4, padding: 14, gap: 8 },
	subRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	subTitle: { fontSize: 16, fontWeight: '700' },
	statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
	statusBadgeText: { fontSize: 12, fontWeight: '700' },
	subDateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
	subDateText: { fontSize: 13 },
	expiryWarning: { borderRadius: 8, borderWidth: 1, padding: 10 },
	daysText: { fontSize: 12 },
	subBody: { fontSize: 14, lineHeight: 20 },
	payBtn: {
		height: 46,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		gap: 8,
		marginTop: 4,
	},
	payBtnDisabled: { opacity: 0.7 },
	payBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },

	// KPI
	kpiRow: { flexDirection: 'row', gap: 10 },
	kpiCard: { flex: 1, borderRadius: 14, borderWidth: 1, borderTopWidth: 4, padding: 12, gap: 6 },
	kpiTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	kpiTitle: { fontSize: 12, fontWeight: '600' },
	kpiValue: { fontSize: 22, fontWeight: '800' },
	kpiCaption: { fontSize: 12 },

	// Section card
	sectionCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
	sectionTitle: { fontSize: 16, fontWeight: '800' },
	emptyText: { fontSize: 14 },

	// Activity
	activityRow: { paddingTop: 10, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
	activityLeft: { flex: 1, gap: 2 },
	activityTitle: { fontSize: 14, fontWeight: '700' },
	activitySub: { fontSize: 13 },
	activityDate: { fontSize: 12 },

	// Chart placeholder (same as frontend)
	chartPlaceholder: {
		height: 140,
		borderWidth: 2,
		borderStyle: 'dashed',
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},
	chartEmoji: { fontSize: 36 },
	chartText: { fontSize: 13 },

	// Profile incomplete
	warningCard: {
		borderRadius: 18, borderTopWidth: 4, padding: 18,
		alignItems: 'center', gap: 10,
		shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10,
		shadowOffset: { width: 0, height: 2 }, elevation: 3,
	},
	warningTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
	warningBody: { fontSize: 14, lineHeight: 21, textAlign: 'center' },
	checklistCard: { width: '100%', borderRadius: 12, padding: 12, gap: 4, backgroundColor: '#fff7ed' },
	checklistTitle: { fontSize: 14, fontWeight: '800', color: '#9a3412' },
	checklistLine: { fontSize: 13, lineHeight: 20, color: '#c2410c' },
	primaryBtn: {
		width: '100%', height: 48, borderRadius: 12,
		alignItems: 'center', justifyContent: 'center',
		flexDirection: 'row', gap: 8,
	},
	primaryBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
	hintText: { fontSize: 12 },
});
