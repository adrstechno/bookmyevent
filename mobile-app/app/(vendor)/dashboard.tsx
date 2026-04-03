import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FadeInView from '@/components/common/FadeInView';
import PageLoadingState from '@/components/common/PageLoadingState';
import AppMenuDrawer from '@/components/layout/AppMenuDrawer';
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

export default function VendorDashboardScreen() {
	const { palette } = useSettingsTheme();
	const { showError } = useAppToast();
	const router = useRouter();
	const { name, email } = useAppSelector((state) => state.auth);

	const [isLoading, setIsLoading] = useState(true);
	const [profileIncomplete, setProfileIncomplete] = useState(false);
	const [kpis, setKpis] = useState<VendorKpis>(EMPTY_KPIS);
	const [activities, setActivities] = useState<VendorActivity[]>([]);

	const vendorName = useMemo(() => {
		if (name?.trim()) {
			return name;
		}

		if (email) {
			return email.split('@')[0] ?? 'Vendor';
		}

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

	if (profileIncomplete) {
		return (
			<SafeAreaView style={[styles.safeArea, { backgroundColor: palette.screenBg }]} edges={['top']}>
				<ScrollView contentContainerStyle={styles.container}>
					<View style={[styles.appBar, { backgroundColor: palette.primary, borderColor: palette.primaryStrong }]}>
						<AppMenuDrawer />
						<ThemedText style={[styles.appBarTitle, { color: palette.onPrimary }]}>Vendor Dashboard</ThemedText>
						<View style={styles.appBarRight} />
					</View>

					<View style={styles.headerCopy}>
						<ThemedText style={[styles.pageTitle, { color: palette.text }]}>Vendor Dashboard</ThemedText>
						<ThemedText style={[styles.pageSubtitle, { color: palette.subtext }]}>Welcome, {vendorName}! Complete your profile to start receiving bookings.</ThemedText>
					</View>

					<FadeInView>
						<View style={[styles.warningCard, { backgroundColor: palette.surfaceBg, borderColor: palette.accent }]}> 
							<Ionicons name="warning-outline" size={54} color={palette.accent} />
							<ThemedText style={[styles.warningTitle, { color: palette.text }]}>Profile Setup Required</ThemedText>
							<ThemedText style={[styles.warningBody, { color: palette.subtext }]}>To access your vendor dashboard and start receiving bookings, complete your vendor profile first.</ThemedText>

							<View style={[styles.checklistCard, { backgroundColor: palette.roseSoft }]}> 
								<ThemedText style={[styles.checklistTitle, { color: palette.text }]}>What you need to provide:</ThemedText>
								<ThemedText style={[styles.checklistLine, { color: palette.subtext }]}>• Business name and description</ThemedText>
								<ThemedText style={[styles.checklistLine, { color: palette.subtext }]}>• Service category</ThemedText>
								<ThemedText style={[styles.checklistLine, { color: palette.subtext }]}>• Contact information</ThemedText>
								<ThemedText style={[styles.checklistLine, { color: palette.subtext }]}>• Business address</ThemedText>
								<ThemedText style={[styles.checklistLine, { color: palette.subtext }]}>• Profile picture</ThemedText>
							</View>

							<Pressable
								style={[styles.primaryBtn, { backgroundColor: palette.primary }]}
								onPress={() => router.push('/(vendor)/settings')}
							>
								<Ionicons name="settings-outline" size={18} color={palette.onPrimary} />
								<ThemedText style={[styles.primaryBtnText, { color: palette.onPrimary }]}>Complete Profile Setup</ThemedText>
							</Pressable>
						</View>
					</FadeInView>
				</ScrollView>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: palette.screenBg }]} edges={['top']}>
			<ScrollView contentContainerStyle={styles.container}>
				<View style={[styles.appBar, { backgroundColor: palette.primary, borderColor: palette.primaryStrong }]}>
					<AppMenuDrawer />
					<ThemedText style={[styles.appBarTitle, { color: palette.onPrimary }]}>Vendor Dashboard</ThemedText>
					<Pressable style={[styles.iconBtn, { borderColor: palette.primaryStrong, backgroundColor: palette.primaryStrong }]} onPress={() => void loadDashboard()}>
						<Ionicons name="refresh-outline" size={18} color={palette.onPrimary} />
					</Pressable>
				</View>

				<View style={styles.headerCopy}>
					<ThemedText style={[styles.pageTitle, { color: palette.text }]}>Welcome back, {vendorName}</ThemedText>
					<ThemedText style={[styles.pageSubtitle, { color: palette.subtext }]}>Here is your business overview and recent activity.</ThemedText>
				</View>

				<FadeInView delay={40} style={styles.kpiRow}>
					<KpiCard title="Total Sales" value={`Rs ${kpis.totalSales.toLocaleString()}`} caption="Lifetime earnings" icon="cash-outline" />
					<KpiCard title="New Orders" value={String(kpis.newOrders)} caption="This month" icon="receipt-outline" />
				</FadeInView>

				<FadeInView delay={80} style={styles.kpiRow}>
					<KpiCard title="Active Events" value={String(kpis.activeEvents)} caption="Ongoing projects" icon="bar-chart-outline" />
					<KpiCard title="Total Clients" value={String(kpis.totalClients)} caption="Unique customers" icon="people-outline" />
				</FadeInView>

				<FadeInView delay={110}>
					<View style={[styles.sectionCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
						<ThemedText style={[styles.sectionTitle, { color: palette.text }]}>Recent Activities</ThemedText>
						{activities.length === 0 ? (
							<ThemedText style={[styles.emptyText, { color: palette.subtext }]}>No recent activities yet.</ThemedText>
						) : (
							activities.map((activity) => (
								<View key={`${activity.bookingId}-${activity.createdAt ?? 'now'}`} style={[styles.activityRow, { borderTopColor: palette.border }]}> 
									<View style={styles.activityLeft}>
										<ThemedText style={[styles.activityTitle, { color: palette.text }]}>Booking #{String(activity.bookingUuid || activity.bookingId).slice(-8)}</ThemedText>
										<ThemedText style={[styles.activitySub, { color: palette.subtext }]}>{activity.userName || 'Customer'} - {activity.status}</ThemedText>
									</View>
									<ThemedText style={[styles.activityDate, { color: palette.muted }]}>{activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : '-'}</ThemedText>
								</View>
							))
						)}
					</View>
				</FadeInView>

				<FadeInView delay={140}>
					<View style={[styles.sectionCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
						<ThemedText style={[styles.sectionTitle, { color: palette.text }]}>Quick Actions</ThemedText>
						<View style={styles.actionsRow}>
							<QuickAction label="Manage Shifts" icon="time-outline" onPress={() => router.push('/(vendor)/shifts')} />
							<QuickAction label="View Bookings" icon="calendar-outline" onPress={() => router.push('/(vendor)/bookings')} />
							<QuickAction label="Packages" icon="cube-outline" onPress={() => router.push('/(vendor)/packages')} />
						</View>
					</View>
				</FadeInView>
			</ScrollView>
		</SafeAreaView>
	);
}

function KpiCard({
	title,
	value,
	caption,
	icon,
}: {
	title: string;
	value: string;
	caption: string;
	icon: keyof typeof Ionicons.glyphMap;
}) {
	const { palette } = useSettingsTheme();

	return (
		<View style={[styles.kpiCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
			<View style={styles.kpiTopRow}>
				<ThemedText style={[styles.kpiTitle, { color: palette.subtext }]}>{title}</ThemedText>
				<Ionicons name={icon} size={18} color={palette.primary} />
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
}: {
	label: string;
	icon: keyof typeof Ionicons.glyphMap;
	onPress: () => void;
}) {
	const { palette } = useSettingsTheme();

	return (
		<Pressable style={[styles.quickAction, { backgroundColor: palette.headerBtnBg, borderColor: palette.border }]} onPress={onPress}>
			<Ionicons name={icon} size={18} color={palette.primary} />
			<ThemedText style={[styles.quickActionText, { color: palette.text }]}>{label}</ThemedText>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	container: {
		padding: 16,
		paddingBottom: 28,
		gap: 12,
	},
	appBar: {
		height: 56,
		borderRadius: 14,
		paddingHorizontal: 12,
		borderWidth: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	appBarTitle: {
		fontSize: 16,
		fontWeight: '800',
	},
	appBarRight: {
		width: 36,
		height: 36,
	},
	iconBtn: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
	},
	headerCopy: {
		gap: 4,
		paddingTop: 4,
	},
	pageTitle: {
		fontSize: 30,
		fontWeight: '800',
	},
	pageSubtitle: {
		fontSize: 14,
		lineHeight: 20,
	},
	warningCard: {
		borderRadius: 18,
		borderWidth: 1,
		padding: 18,
		alignItems: 'center',
		gap: 10,
	},
	warningTitle: {
		fontSize: 26,
		fontWeight: '800',
		textAlign: 'center',
	},
	warningBody: {
		fontSize: 15,
		lineHeight: 22,
		textAlign: 'center',
	},
	checklistCard: {
		width: '100%',
		borderRadius: 12,
		padding: 12,
		gap: 4,
	},
	checklistTitle: {
		fontSize: 15,
		fontWeight: '800',
	},
	checklistLine: {
		fontSize: 14,
		lineHeight: 20,
	},
	primaryBtn: {
		width: '100%',
		height: 48,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		gap: 8,
	},
	primaryBtnText: {
		fontSize: 15,
		fontWeight: '700',
	},
	kpiRow: {
		flexDirection: 'row',
		gap: 10,
	},
	kpiCard: {
		flex: 1,
		borderRadius: 12,
		borderWidth: 1,
		padding: 12,
		gap: 6,
	},
	kpiTopRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	kpiTitle: {
		fontSize: 12,
		fontWeight: '700',
	},
	kpiValue: {
		fontSize: 21,
		fontWeight: '800',
	},
	kpiCaption: {
		fontSize: 12,
	},
	sectionCard: {
		borderRadius: 14,
		borderWidth: 1,
		padding: 12,
		gap: 10,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: '800',
	},
	emptyText: {
		fontSize: 14,
	},
	activityRow: {
		paddingTop: 10,
		borderTopWidth: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 8,
	},
	activityLeft: {
		flex: 1,
		gap: 2,
	},
	activityTitle: {
		fontSize: 14,
		fontWeight: '700',
	},
	activitySub: {
		fontSize: 13,
	},
	activityDate: {
		fontSize: 12,
	},
	actionsRow: {
		gap: 8,
	},
	quickAction: {
		height: 42,
		borderRadius: 10,
		borderWidth: 1,
		paddingHorizontal: 12,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	quickActionText: {
		fontSize: 14,
		fontWeight: '700',
	},
});
