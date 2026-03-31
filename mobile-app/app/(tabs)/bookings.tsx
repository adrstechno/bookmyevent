import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const SAMPLE_BOOKINGS = [
	{
		id: 'BK-1001',
		eventName: 'Wedding Event',
		date: '12 Apr 2026',
		venue: 'Silver Oak Lawn, Indore',
		amount: 'Rs 45,000',
		status: 'Upcoming',
	},
	{
		id: 'BK-1002',
		eventName: 'Office Seminar',
		date: '22 Apr 2026',
		venue: 'Metro Convention Hall, Bhopal',
		amount: 'Rs 18,500',
		status: 'Pending',
	},
	{
		id: 'BK-1003',
		eventName: 'Birthday Party',
		date: '02 Mar 2026',
		venue: 'Sunrise Banquet, Dewas',
		amount: 'Rs 12,000',
		status: 'Completed',
	},
];

const STATUS_CHIPS = ['All', 'Upcoming', 'Pending', 'Completed'];

export default function BookingsTabScreen() {
	const tabBarHeight = useBottomTabBarHeight();

	return (
		<ScrollView
			style={styles.page}
			showsVerticalScrollIndicator={false}
			contentContainerStyle={[styles.container, { paddingBottom: tabBarHeight + 16 }]}
		>
			<ThemedView style={styles.heroCard}>
				<ThemedText type="title" style={styles.heroTitle}>My Bookings</ThemedText>
				<ThemedText style={styles.heroSubtext}>Track your event requests, confirmations, and payment status.</ThemedText>

				<View style={styles.statsRow}>
					<ThemedView style={styles.statPill}>
						<ThemedText style={styles.statValue}>03</ThemedText>
						<ThemedText style={styles.statLabel}>Total</ThemedText>
					</ThemedView>
					<ThemedView style={styles.statPill}>
						<ThemedText style={styles.statValue}>01</ThemedText>
						<ThemedText style={styles.statLabel}>Upcoming</ThemedText>
					</ThemedView>
					<ThemedView style={styles.statPill}>
						<ThemedText style={styles.statValue}>01</ThemedText>
						<ThemedText style={styles.statLabel}>Pending</ThemedText>
					</ThemedView>
				</View>
			</ThemedView>

			<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
				{STATUS_CHIPS.map((chip, index) => (
					<ThemedView key={chip} style={[styles.chip, index === 0 ? styles.activeChip : null]}>
						<ThemedText style={[styles.chipText, index === 0 ? styles.activeChipText : null]}>{chip}</ThemedText>
					</ThemedView>
				))}
			</ScrollView>

			{SAMPLE_BOOKINGS.map((booking) => (
				<ThemedView key={booking.id} style={styles.bookingCard}>
					<View style={styles.rowTop}>
						<View style={styles.eventMeta}>
							<ThemedText type="defaultSemiBold" style={styles.eventName}>{booking.eventName}</ThemedText>
							<ThemedText style={styles.bookingId}>Booking ID: {booking.id}</ThemedText>
						</View>
						<ThemedView style={[styles.statusPill, booking.status === 'Pending' ? styles.statusPending : booking.status === 'Completed' ? styles.statusCompleted : null]}>
							<ThemedText style={[styles.statusText, booking.status === 'Pending' ? styles.statusTextPending : booking.status === 'Completed' ? styles.statusTextCompleted : null]}>{booking.status}</ThemedText>
						</ThemedView>
					</View>

					<View style={styles.detailRow}>
						<Ionicons name="calendar-outline" size={15} color="#475569" />
						<ThemedText style={styles.detailText}>{booking.date}</ThemedText>
					</View>
					<View style={styles.detailRow}>
						<Ionicons name="location-outline" size={15} color="#475569" />
						<ThemedText style={styles.detailText}>{booking.venue}</ThemedText>
					</View>
					<View style={styles.detailRow}>
						<Ionicons name="wallet-outline" size={15} color="#475569" />
						<ThemedText style={styles.detailText}>{booking.amount}</ThemedText>
					</View>

					<ThemedView style={styles.ctaBtn}>
						<ThemedText style={styles.ctaText}>View Details</ThemedText>
					</ThemedView>
				</ThemedView>
			))}

			<ThemedView style={styles.helpCard}>
				<ThemedText style={styles.helpTitle}>Need help with a booking?</ThemedText>
				<ThemedText style={styles.helpSubtext}>Go to Support from profile quick actions for instant dummy help options.</ThemedText>
			</ThemedView>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	page: {
		flex: 1,
		backgroundColor: '#F4F7F9',
	},
	container: {
		padding: 16,
		gap: 12,
	},
	heroCard: {
		borderRadius: 18,
		padding: 14,
		gap: 10,
		backgroundColor: '#FFFFFF',
		borderTopWidth: 4,
		borderTopColor: '#3C6E71',
		borderWidth: 1,
		borderColor: '#DDE7EC',
	},
	heroTitle: {
		fontSize: 26,
		fontWeight: '800',
		color: '#0F172A',
	},
	heroSubtext: {
		fontSize: 13,
		color: '#64748B',
	},
	statsRow: {
		flexDirection: 'row',
		gap: 8,
	},
	statPill: {
		flex: 1,
		borderRadius: 12,
		paddingVertical: 8,
		alignItems: 'center',
		backgroundColor: '#F8FAFC',
		borderWidth: 1,
		borderColor: '#E2E8F0',
	},
	statValue: {
		fontSize: 16,
		fontWeight: '800',
		color: '#0F766E',
	},
	statLabel: {
		fontSize: 11,
		color: '#64748B',
	},
	chipsRow: {
		gap: 8,
		paddingRight: 6,
	},
	chip: {
		paddingHorizontal: 12,
		paddingVertical: 7,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: '#D0DCE3',
		backgroundColor: '#FFFFFF',
	},
	activeChip: {
		backgroundColor: '#3C6E71',
		borderColor: '#3C6E71',
	},
	chipText: {
		fontSize: 12,
		fontWeight: '700',
		color: '#475569',
	},
	activeChipText: {
		color: '#FFFFFF',
	},
	bookingCard: {
		borderWidth: 1,
		borderColor: '#E2E8F0',
		borderRadius: 14,
		padding: 12,
		gap: 8,
		backgroundColor: '#FFFFFF',
	},
	rowTop: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		gap: 8,
	},
	eventMeta: {
		flex: 1,
	},
	eventName: {
		fontSize: 16,
	},
	bookingId: {
		fontSize: 12,
		color: '#64748B',
		marginTop: 2,
	},
	detailRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	detailText: {
		fontSize: 13,
		color: '#334155',
	},
	statusPill: {
		backgroundColor: '#DBEAFE',
		borderRadius: 999,
		paddingHorizontal: 10,
		paddingVertical: 4,
	},
	statusPending: {
		backgroundColor: '#FEF3C7',
	},
	statusCompleted: {
		backgroundColor: '#DCFCE7',
	},
	statusText: {
		color: '#1D4ED8',
		fontWeight: '700',
		fontSize: 12,
	},
	statusTextPending: {
		color: '#B45309',
	},
	statusTextCompleted: {
		color: '#166534',
	},
	ctaBtn: {
		marginTop: 2,
		paddingVertical: 9,
		borderRadius: 10,
		alignItems: 'center',
		backgroundColor: '#ECFEFF',
		borderWidth: 1,
		borderColor: '#CCFBF1',
	},
	ctaText: {
		fontSize: 13,
		fontWeight: '700',
		color: '#0F766E',
	},
	helpCard: {
		borderRadius: 12,
		padding: 12,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E2E8F0',
		gap: 4,
	},
	helpTitle: {
		fontSize: 14,
		fontWeight: '800',
		color: '#1E293B',
	},
	helpSubtext: {
		fontSize: 12,
		color: '#64748B',
	},
});
