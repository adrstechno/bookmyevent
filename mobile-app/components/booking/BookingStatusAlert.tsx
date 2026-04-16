import { StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { BookingStatus } from '@/types/booking';

type BookingStatusAlertProps = {
	status: BookingStatus;
	adminApproval?: 'pending' | 'approved' | 'rejected';
};

export function BookingStatusAlert({ status, adminApproval }: BookingStatusAlertProps) {
	// Pending vendor response
	if (status === 'pending') {
		return (
			<ThemedView style={[styles.container, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
				<View style={styles.content}>
					<Ionicons name="time-outline" size={20} color="#B45309" />
					<View style={styles.textContent}>
						<ThemedText style={[styles.title, { color: '#92400E' }]}>Waiting for Vendor</ThemedText>
						<ThemedText style={[styles.description, { color: '#B45309' }]}>
							The vendor will review and respond to your booking request.
						</ThemedText>
					</View>
				</View>
			</ThemedView>
		);
	}

	// Awaiting admin approval
	if (status === 'confirmed' && adminApproval === 'pending') {
		return (
			<ThemedView style={[styles.container, { backgroundColor: '#DBEAFE', borderColor: '#93C5FD' }]}>
				<View style={styles.content}>
					<Ionicons name="time-outline" size={20} color="#1D4ED8" />
					<View style={styles.textContent}>
						<ThemedText style={[styles.title, { color: '#1E40AF' }]}>
							Vendor Accepted - Awaiting Admin Approval
						</ThemedText>
						<ThemedText style={[styles.description, { color: '#1D4ED8' }]}>
							The vendor has accepted your booking. Waiting for admin approval.
						</ThemedText>
					</View>
				</View>
			</ThemedView>
		);
	}

	// Awaiting review
	if (status === 'completed') {
		return (
			<ThemedView style={[styles.container, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
				<View style={styles.content}>
					<Ionicons name="star-outline" size={20} color="#B45309" />
					<View style={styles.textContent}>
						<ThemedText style={[styles.title, { color: '#92400E' }]}>Share Your Experience</ThemedText>
						<ThemedText style={[styles.description, { color: '#B45309' }]}>
							Your event is complete! Please leave a review for the vendor.
						</ThemedText>
					</View>
				</View>
			</ThemedView>
		);
	}

	return null;
}

const styles = StyleSheet.create({
	container: {
		borderRadius: 12,
		padding: 12,
		borderWidth: 1,
		marginTop: 12,
	},
	content: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 10,
	},
	textContent: {
		flex: 1,
		gap: 2,
	},
	title: {
		fontSize: 14,
		fontWeight: '700',
	},
	description: {
		fontSize: 12,
		lineHeight: 16,
	},
});
