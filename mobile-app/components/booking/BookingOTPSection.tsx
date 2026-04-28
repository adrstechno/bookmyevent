import { Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSettingsTheme } from '@/theme/settingsTheme';
import { router } from 'expo-router';

type BookingOTPSectionProps = {
	bookingId: string;
};

export function BookingOTPSection({ bookingId }: BookingOTPSectionProps) {
	const { palette } = useSettingsTheme();

	const handleViewOTP = () => {
		router.push('/notifications');
	};

	return (
		<ThemedView style={[styles.container, { backgroundColor: '#F3E8FF', borderColor: '#D8B4FE' }]}>
			<View style={styles.content}>
				<View style={[styles.iconCircle, { backgroundColor: '#E9D5FF' }]}>
					<Ionicons name="key" size={24} color="#7C3AED" />
				</View>
				<View style={styles.textContent}>
					<ThemedText style={[styles.title, { color: '#6B21A8' }]}>Your OTP Code</ThemedText>
					<ThemedText style={[styles.description, { color: '#7C3AED' }]}>
						Share this code with the vendor to complete your booking. Check your notifications for the OTP.
					</ThemedText>
					<View style={[styles.infoBox, { backgroundColor: '#FFFFFF', borderColor: '#D8B4FE' }]}>
						<ThemedText style={[styles.infoText, { color: '#9333EA' }]}>
							Your OTP has been sent to your registered email/phone
						</ThemedText>
						<View style={styles.infoRow}>
							<ThemedText style={[styles.infoLabel, { color: '#7C3AED' }]}>
								Check your <ThemedText style={styles.bold}>Notifications</ThemedText> for the OTP code
							</ThemedText>
							<Pressable
								onPress={handleViewOTP}
								style={({ pressed }) => [
									styles.button,
									{ backgroundColor: '#7C3AED' },
									pressed && styles.buttonPressed,
								]}
							>
								<Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
								<ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>View OTP</ThemedText>
							</Pressable>
						</View>
					</View>
					<ThemedText style={[styles.warning, { color: '#9333EA' }]}>
						⚠️ Do not share this OTP with anyone except the vendor at the time of service
					</ThemedText>
				</View>
			</View>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		borderRadius: 12,
		padding: 16,
		borderWidth: 2,
		marginTop: 12,
	},
	content: {
		flexDirection: 'row',
		gap: 12,
	},
	iconCircle: {
		width: 48,
		height: 48,
		borderRadius: 24,
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
	},
	textContent: {
		flex: 1,
		gap: 8,
	},
	title: {
		fontSize: 16,
		fontWeight: '700',
	},
	description: {
		fontSize: 13,
		lineHeight: 18,
	},
	infoBox: {
		borderRadius: 10,
		padding: 12,
		borderWidth: 1,
		gap: 8,
	},
	infoText: {
		fontSize: 11,
	},
	infoRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 8,
	},
	infoLabel: {
		fontSize: 12,
		flex: 1,
	},
	bold: {
		fontWeight: '700',
	},
	button: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
	},
	buttonPressed: {
		opacity: 0.8,
	},
	buttonText: {
		fontSize: 12,
		fontWeight: '700',
	},
	warning: {
		fontSize: 11,
	},
});
