import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useSettingsTheme } from '@/theme/settingsTheme';
import VendorAppBar from '@/components/vendor/VendorAppBar';

type EventStatus = 'Active' | 'Completed' | 'Cancelled';

interface EventItem {
	eventId: number;
	eventName: string;
	eventDate: string;
	venue: string;
	status: EventStatus;
	description: string;
}

const MOCK_EVENTS: EventItem[] = [
	{ eventId: 1, eventName: 'Royal Wedding Setup', eventDate: '12 Apr 2026', venue: 'Indore Palace', status: 'Active', description: 'Premium decoration, stage design, and guest coordination.' },
	{ eventId: 2, eventName: 'Corporate Annual Meet', eventDate: '18 Apr 2026', venue: 'Central Business Hall', status: 'Completed', description: 'Conference seating, lighting, and corporate branding.' },
	{ eventId: 3, eventName: 'Birthday Bash', eventDate: '22 Apr 2026', venue: 'Skyline Banquet', status: 'Cancelled', description: 'Theme event setup with entertainment and desserts.' },
	{ eventId: 4, eventName: 'Engagement Ceremony', eventDate: '28 Apr 2026', venue: 'Lake View Resort', status: 'Active', description: 'Intimate ceremony setup with floral decor and photo corners.' },
];

const FILTERS: Array<'all' | 'active' | 'completed' | 'cancelled'> = ['all', 'active', 'completed', 'cancelled'];

export default function VendorEventsScreen() {
	const { palette } = useSettingsTheme();
	const [loading, setLoading] = useState(true);
	const [events, setEvents] = useState<EventItem[]>([]);
	const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
	const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

	useEffect(() => {
		const timer = setTimeout(() => {
			setEvents(MOCK_EVENTS);
			setLoading(false);
		}, 350);

		return () => clearTimeout(timer);
	}, []);

	const styles = useMemo(() => createStyles(palette), [palette]);

	const filteredEvents =
		filter === 'all'
			? events
			: events.filter((event) => event.status.toLowerCase() === filter);

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: palette.screenBg }}>
			<VendorAppBar title="My Events" />

			<ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
				<View style={styles.pageHeader}>
					<ThemedText style={styles.pageTitle}>My Events</ThemedText>
					<ThemedText style={styles.pageSubtitle}>A simple event overview without gallery images</ThemedText>
				</View>

				<View style={styles.filterRow}>
					{FILTERS.map((item) => {
						const active = filter === item;
						return (
							<Pressable
								key={item}
								style={({ pressed }) => [
									styles.filterPill,
									active ? styles.filterPillActive : styles.filterPillInactive,
									{ opacity: pressed ? 0.9 : 1 },
								]}
								onPress={() => setFilter(item)}
							>
								<ThemedText style={active ? styles.filterTextActive : styles.filterTextInactive}>
									{item.charAt(0).toUpperCase() + item.slice(1)}
								</ThemedText>
							</Pressable>
						);
					})}
				</View>

				{loading ? (
					<View style={styles.centerState}>
						<ActivityIndicator size="large" color={palette.primary} />
						<ThemedText style={styles.loadingText}>Loading events...</ThemedText>
					</View>
				) : filteredEvents.length === 0 ? (
					<View style={styles.centerState}>
						<Ionicons name="calendar-outline" size={56} color={palette.muted} />
						<ThemedText style={styles.emptyTitle}>No events found</ThemedText>
						<ThemedText style={styles.emptySubtitle}>Try switching filters or add your first event.</ThemedText>
					</View>
				) : (
					<View style={styles.eventList}>
						{filteredEvents.map((event) => (
							<Pressable key={event.eventId} style={styles.eventCard} onPress={() => setSelectedEvent(event)}>
								<View style={styles.eventTopRow}>
									<View style={styles.eventIconBubble}>
										<Ionicons name="calendar-outline" size={18} color="#fff" />
									</View>
									<View style={styles.eventCopy}>
										<ThemedText style={styles.eventName}>{event.eventName}</ThemedText>
										<ThemedText style={styles.eventMeta}>{event.eventDate} · {event.venue}</ThemedText>
									</View>
									<View style={[styles.statusChip, event.status === 'Active' ? styles.activeChip : event.status === 'Completed' ? styles.completedChip : styles.cancelledChip]}>
										<ThemedText style={[styles.statusText, event.status === 'Active' ? styles.activeText : event.status === 'Completed' ? styles.completedText : styles.cancelledText]}>
											{event.status}
										</ThemedText>
									</View>
								</View>

								<ThemedText style={styles.eventDescription} numberOfLines={2}>
									{event.description}
								</ThemedText>

								<View style={styles.eventFooter}>
									<ThemedText style={styles.viewHint}>Tap to view details</ThemedText>
									<Ionicons name="chevron-forward" size={16} color={palette.muted} />
								</View>
							</Pressable>
						))}
					</View>
				)}
			</ScrollView>

			<Modal visible={Boolean(selectedEvent)} transparent animationType="fade" onRequestClose={() => setSelectedEvent(null)}>
				<View style={styles.modalOverlay}>
					<Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedEvent(null)} />
					<View style={[styles.modalCard, { backgroundColor: palette.surfaceBg }]}>
						<View style={styles.modalHeader}>
							<ThemedText style={styles.modalTitle}>Event Details</ThemedText>
							<Pressable onPress={() => setSelectedEvent(null)}>
								<Ionicons name="close" size={24} color={palette.text} />
							</Pressable>
						</View>
						{selectedEvent ? (
							<View style={styles.modalBody}>
								<ThemedText style={styles.modalEventName}>{selectedEvent.eventName}</ThemedText>
								<ThemedText style={styles.modalEventMeta}>{selectedEvent.eventDate}</ThemedText>
								<ThemedText style={styles.modalEventMeta}>{selectedEvent.venue}</ThemedText>
								<ThemedText style={styles.modalEventDescription}>{selectedEvent.description}</ThemedText>
							</View>
						) : null}
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

function createStyles(palette: ReturnType<typeof useSettingsTheme>['palette']) {
	return StyleSheet.create({
		headerContainer: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 12,
			paddingHorizontal: 16,
			paddingVertical: 12,
			borderBottomWidth: 1,
			borderBottomColor: palette.border,
			backgroundColor: palette.screenBg,
		},
		headerCopy: {
			flex: 1,
		},
		headerTitle: {
			fontSize: 18,
			fontWeight: '800',
			color: palette.text,
		},
		headerSubtitle: {
			fontSize: 12,
			color: palette.muted,
			marginTop: 2,
		},
		screen: {
			flex: 1,
		},
		content: {
			padding: 16,
			paddingBottom: 28,
			gap: 12,
		},
		pageHeader: {
			marginBottom: 4,
		},
		pageTitle: {
			fontSize: 22,
			fontWeight: '800',
			color: palette.text,
		},
		pageSubtitle: {
			fontSize: 13,
			color: palette.muted,
			marginTop: 4,
		},
		filterRow: {
			flexDirection: 'row',
			gap: 10,
			marginBottom: 4,
		},
		filterPill: {
			paddingHorizontal: 14,
			paddingVertical: 10,
			borderRadius: 999,
		},
		filterPillActive: {
			backgroundColor: palette.primary,
		},
		filterPillInactive: {
			backgroundColor: palette.elevatedBg,
		},
		filterTextActive: {
			fontSize: 13,
			fontWeight: '800',
			color: '#fff',
		},
		filterTextInactive: {
			fontSize: 13,
			fontWeight: '700',
			color: palette.text,
		},
		centerState: {
			alignItems: 'center',
			justifyContent: 'center',
			paddingVertical: 48,
			paddingHorizontal: 20,
			gap: 10,
			backgroundColor: palette.surfaceBg,
			borderRadius: 18,
			borderTopWidth: 4,
			borderTopColor: palette.primary,
		},
		loadingText: {
			fontSize: 13,
			fontWeight: '600',
			color: palette.muted,
		},
		emptyTitle: {
			fontSize: 18,
			fontWeight: '800',
			color: palette.text,
		},
		emptySubtitle: {
			fontSize: 13,
			color: palette.muted,
			textAlign: 'center',
			lineHeight: 19,
		},
		eventList: {
			gap: 12,
		},
		eventCard: {
			backgroundColor: palette.surfaceBg,
			borderRadius: 18,
			padding: 14,
			borderWidth: 1,
			borderColor: palette.border,
			shadowColor: palette.shadow,
			shadowOpacity: 0.08,
			shadowRadius: 10,
			shadowOffset: { width: 0, height: 2 },
			elevation: 3,
		},
		eventTopRow: {
			flexDirection: 'row',
			alignItems: 'flex-start',
			gap: 10,
		},
		eventIconBubble: {
			width: 38,
			height: 38,
			borderRadius: 12,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: palette.primary,
		},
		eventCopy: {
			flex: 1,
			gap: 4,
		},
		eventName: {
			fontSize: 16,
			fontWeight: '800',
			color: palette.text,
		},
		eventMeta: {
			fontSize: 12,
			color: palette.muted,
		},
		statusChip: {
			paddingHorizontal: 10,
			paddingVertical: 5,
			borderRadius: 999,
		},
		activeChip: {
			backgroundColor: 'rgba(22,101,52,0.12)',
		},
		completedChip: {
			backgroundColor: 'rgba(37,99,235,0.12)',
		},
		cancelledChip: {
			backgroundColor: 'rgba(220,38,38,0.12)',
		},
		statusText: {
			fontSize: 11,
			fontWeight: '800',
		},
		activeText: {
			color: '#166534',
		},
		completedText: {
			color: '#2563eb',
		},
		cancelledText: {
			color: '#dc2626',
		},
		eventDescription: {
			fontSize: 13,
			color: palette.text,
			lineHeight: 19,
			marginTop: 10,
		},
		eventFooter: {
			marginTop: 12,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
		},
		viewHint: {
			fontSize: 12,
			fontWeight: '700',
			color: palette.muted,
		},
		modalOverlay: {
			flex: 1,
			backgroundColor: 'rgba(0,0,0,0.82)',
			justifyContent: 'center',
			padding: 16,
		},
		modalCard: {
			borderRadius: 18,
			overflow: 'hidden',
		},
		modalHeader: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingHorizontal: 16,
			paddingVertical: 14,
			borderBottomWidth: 1,
			borderBottomColor: palette.border,
		},
		modalTitle: {
			fontSize: 16,
			fontWeight: '800',
			color: palette.text,
		},
		modalBody: {
			padding: 16,
			gap: 8,
		},
		modalEventName: {
			fontSize: 18,
			fontWeight: '800',
			color: palette.text,
		},
		modalEventMeta: {
			fontSize: 13,
			color: palette.muted,
		},
		modalEventDescription: {
			fontSize: 13,
			lineHeight: 19,
			color: palette.text,
			marginTop: 6,
		},
	});
}