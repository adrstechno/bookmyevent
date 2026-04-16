import { useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSettingsTheme } from '@/theme/settingsTheme';

type CancelBookingModalProps = {
	visible: boolean;
	bookingId: string;
	onClose: () => void;
	onConfirm: (bookingId: string, reason: string) => Promise<void>;
};

export function CancelBookingModal({ visible, bookingId, onClose, onConfirm }: CancelBookingModalProps) {
	const { palette } = useSettingsTheme();
	const [reason, setReason] = useState('');
	const [loading, setLoading] = useState(false);

	const handleConfirm = async () => {
		try {
			setLoading(true);
			await onConfirm(bookingId, reason);
			setReason('');
			onClose();
		} catch (error) {
			// Error handled by parent
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		if (!loading) {
			setReason('');
			onClose();
		}
	};

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
			<Pressable style={styles.overlay} onPress={handleClose}>
				<Pressable style={[styles.modal, { backgroundColor: palette.surfaceBg }]} onPress={(e) => e.stopPropagation()}>
					<View style={styles.header}>
						<View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
							<Ionicons name="close-circle" size={28} color="#DC2626" />
						</View>
						<View style={styles.headerText}>
							<ThemedText style={[styles.title, { color: palette.text }]}>Cancel Booking</ThemedText>
							<ThemedText style={[styles.subtitle, { color: palette.subtext }]}>
								Please provide a reason for cancellation
							</ThemedText>
						</View>
					</View>

					<View style={styles.body}>
						<ThemedText style={[styles.label, { color: palette.text }]}>
							Cancellation Reason (Optional)
						</ThemedText>
						<TextInput
							value={reason}
							onChangeText={setReason}
							placeholder="e.g., Change of plans, Found another vendor, etc."
							placeholderTextColor={palette.subtext}
							multiline
							numberOfLines={3}
							maxLength={500}
							style={[
								styles.input,
								{
									backgroundColor: palette.screenBg,
									borderColor: palette.border,
									color: palette.text,
								},
							]}
							editable={!loading}
						/>
						<ThemedText style={[styles.charCount, { color: palette.subtext }]}>
							{reason.length}/500 characters
						</ThemedText>
					</View>

					<View style={styles.footer}>
						<Pressable
							onPress={handleClose}
							disabled={loading}
							style={({ pressed }) => [
								styles.button,
								styles.buttonSecondary,
								{ backgroundColor: palette.screenBg, borderColor: palette.border },
								pressed && styles.buttonPressed,
								loading && styles.buttonDisabled,
							]}
						>
							<ThemedText style={[styles.buttonText, { color: palette.text }]}>Keep Booking</ThemedText>
						</Pressable>
						<Pressable
							onPress={handleConfirm}
							disabled={loading}
							style={({ pressed }) => [
								styles.button,
								styles.buttonDanger,
								pressed && styles.buttonPressed,
								loading && styles.buttonDisabled,
							]}
						>
							{loading ? (
								<ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>Cancelling...</ThemedText>
							) : (
								<>
									<Ionicons name="close-circle" size={18} color="#FFFFFF" />
									<ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>Cancel Booking</ThemedText>
								</>
							)}
						</Pressable>
					</View>
				</Pressable>
			</Pressable>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 16,
	},
	modal: {
		width: '100%',
		maxWidth: 500,
		borderRadius: 16,
		overflow: 'hidden',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: '#E5E7EB',
	},
	iconCircle: {
		width: 48,
		height: 48,
		borderRadius: 24,
		alignItems: 'center',
		justifyContent: 'center',
	},
	headerText: {
		flex: 1,
	},
	title: {
		fontSize: 18,
		fontWeight: '700',
	},
	subtitle: {
		fontSize: 13,
		marginTop: 2,
	},
	body: {
		padding: 20,
	},
	label: {
		fontSize: 14,
		fontWeight: '600',
		marginBottom: 8,
	},
	input: {
		borderWidth: 1,
		borderRadius: 12,
		padding: 12,
		fontSize: 14,
		textAlignVertical: 'top',
		minHeight: 80,
	},
	charCount: {
		fontSize: 11,
		marginTop: 4,
	},
	footer: {
		flexDirection: 'row',
		gap: 12,
		padding: 20,
		borderTopWidth: 1,
		borderTopColor: '#E5E7EB',
	},
	button: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 6,
		paddingVertical: 12,
		borderRadius: 10,
	},
	buttonSecondary: {
		borderWidth: 1,
	},
	buttonDanger: {
		backgroundColor: '#DC2626',
	},
	buttonPressed: {
		opacity: 0.8,
	},
	buttonDisabled: {
		opacity: 0.5,
	},
	buttonText: {
		fontSize: 14,
		fontWeight: '700',
	},
});
