import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSettingsTheme } from '@/theme/settingsTheme';

type ReviewBookingModalProps = {
	visible: boolean;
	booking: {
		id: string;
		eventName: string;
		date: string;
		venue: string;
	} | null;
	onClose: () => void;
	onSubmit: (bookingId: string, reviewData: any) => Promise<void>;
};

type StarRatingProps = {
	label: string;
	value: number;
	onChange: (value: number) => void;
	required?: boolean;
};

function StarRating({ label, value, onChange, required }: StarRatingProps) {
	const { palette } = useSettingsTheme();
	const [hover, setHover] = useState(0);

	return (
		<View style={styles.ratingRow}>
			<ThemedText style={[styles.ratingLabel, { color: palette.text }]}>
				{label} {required && <ThemedText style={{ color: '#DC2626' }}>*</ThemedText>}
			</ThemedText>
			<View style={styles.stars}>
				{[1, 2, 3, 4, 5].map((star) => (
					<Pressable
						key={star}
						onPress={() => onChange(star)}
						onPressIn={() => setHover(star)}
						onPressOut={() => setHover(0)}
					>
						<Ionicons
							name={star <= (hover || value) ? 'star' : 'star-outline'}
							size={28}
							color={star <= (hover || value) ? '#FBBF24' : '#D1D5DB'}
						/>
					</Pressable>
				))}
			</View>
			<ThemedText style={[styles.ratingValue, { color: palette.subtext }]}>
				{value > 0 ? `${value}/5` : 'Not rated'}
			</ThemedText>
		</View>
	);
}

export function ReviewBookingModal({ visible, booking, onClose, onSubmit }: ReviewBookingModalProps) {
	const { palette } = useSettingsTheme();
	const [rating, setRating] = useState(0);
	const [reviewText, setReviewText] = useState('');
	const [serviceQuality, setServiceQuality] = useState(0);
	const [communication, setCommunication] = useState(0);
	const [valueForMoney, setValueForMoney] = useState(0);
	const [punctuality, setPunctuality] = useState(0);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async () => {
		if (rating === 0) {
			return;
		}

		if (!booking) return;

		try {
			setLoading(true);
			await onSubmit(booking.id, {
				rating,
				review_text: reviewText,
				service_quality: serviceQuality || rating,
				communication: communication || rating,
				value_for_money: valueForMoney || rating,
				punctuality: punctuality || rating,
			});
			resetForm();
			onClose();
		} catch (error) {
			// Error handled by parent
		} finally {
			setLoading(false);
		}
	};

	const resetForm = () => {
		setRating(0);
		setReviewText('');
		setServiceQuality(0);
		setCommunication(0);
		setValueForMoney(0);
		setPunctuality(0);
	};

	const handleClose = () => {
		if (!loading) {
			resetForm();
			onClose();
		}
	};

	if (!booking) return null;

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
			<View style={styles.overlay}>
				<Pressable style={styles.overlayPress} onPress={handleClose} />
				<View style={[styles.modal, { backgroundColor: palette.surfaceBg }]}>
					<View style={[styles.header, { backgroundColor: palette.tint }]}>
						<View style={styles.headerContent}>
							<ThemedText style={styles.headerTitle}>Rate Your Experience</ThemedText>
							<ThemedText style={styles.headerSubtitle}>{booking.eventName}</ThemedText>
						</View>
						<Pressable onPress={handleClose} disabled={loading} style={styles.closeButton}>
							<Ionicons name="close" size={24} color="#FFFFFF" />
						</Pressable>
					</View>

					<ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
						<View style={styles.overallRating}>
							<StarRating label="Overall Rating" value={rating} onChange={setRating} required />
						</View>

						<View style={styles.section}>
							<ThemedText style={[styles.sectionTitle, { color: palette.text }]}>
								Detailed Ratings (Optional)
							</ThemedText>
							<View style={[styles.detailedRatings, { backgroundColor: palette.screenBg }]}>
								<StarRating label="Service Quality" value={serviceQuality} onChange={setServiceQuality} />
								<StarRating label="Communication" value={communication} onChange={setCommunication} />
								<StarRating label="Value for Money" value={valueForMoney} onChange={setValueForMoney} />
								<StarRating label="Punctuality" value={punctuality} onChange={setPunctuality} />
							</View>
						</View>

						<View style={styles.section}>
							<ThemedText style={[styles.sectionTitle, { color: palette.text }]}>
								Share Your Experience (Optional)
							</ThemedText>
							<TextInput
								value={reviewText}
								onChangeText={setReviewText}
								placeholder="Tell us about your experience with this vendor..."
								placeholderTextColor={palette.subtext}
								multiline
								numberOfLines={4}
								style={[
									styles.textArea,
									{
										backgroundColor: palette.screenBg,
										borderColor: palette.border,
										color: palette.text,
									},
								]}
								editable={!loading}
							/>
							<ThemedText style={[styles.hint, { color: palette.subtext }]}>
								Your review will help other customers make informed decisions
							</ThemedText>
						</View>

						<View style={[styles.bookingInfo, { backgroundColor: '#DBEAFE', borderColor: '#93C5FD' }]}>
							<ThemedText style={[styles.bookingInfoTitle, { color: '#1E40AF' }]}>
								Booking Details
							</ThemedText>
							<ThemedText style={[styles.bookingInfoText, { color: '#1E3A8A' }]}>
								Date: {booking.date}
							</ThemedText>
							<ThemedText style={[styles.bookingInfoText, { color: '#1E3A8A' }]}>
								Venue: {booking.venue}
							</ThemedText>
						</View>
					</ScrollView>

					<View style={[styles.footer, { borderTopColor: palette.border }]}>
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
							<ThemedText style={[styles.buttonText, { color: palette.text }]}>Skip for Now</ThemedText>
						</Pressable>
						<Pressable
							onPress={handleSubmit}
							disabled={loading || rating === 0}
							style={({ pressed }) => [
								styles.button,
								styles.buttonPrimary,
								{ backgroundColor: palette.tint },
								pressed && styles.buttonPressed,
								(loading || rating === 0) && styles.buttonDisabled,
							]}
						>
							{loading ? (
								<ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>Submitting...</ThemedText>
							) : (
								<ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>Submit Review</ThemedText>
							)}
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	overlayPress: {
		...StyleSheet.absoluteFillObject,
	},
	modal: {
		width: '90%',
		maxWidth: 600,
		maxHeight: '90%',
		borderRadius: 16,
		overflow: 'hidden',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 20,
	},
	headerContent: {
		flex: 1,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: '700',
		color: '#FFFFFF',
	},
	headerSubtitle: {
		fontSize: 13,
		color: 'rgba(255, 255, 255, 0.8)',
		marginTop: 2,
	},
	closeButton: {
		padding: 4,
	},
	body: {
		padding: 20,
	},
	overallRating: {
		backgroundColor: '#FEF3C7',
		borderRadius: 12,
		padding: 16,
		borderWidth: 2,
		borderColor: '#FDE68A',
		marginBottom: 16,
	},
	section: {
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: '700',
		marginBottom: 12,
	},
	detailedRatings: {
		borderRadius: 12,
		padding: 12,
		gap: 12,
	},
	ratingRow: {
		gap: 8,
	},
	ratingLabel: {
		fontSize: 13,
		fontWeight: '600',
	},
	stars: {
		flexDirection: 'row',
		gap: 4,
		marginVertical: 4,
	},
	ratingValue: {
		fontSize: 12,
	},
	textArea: {
		borderWidth: 2,
		borderRadius: 12,
		padding: 12,
		fontSize: 14,
		textAlignVertical: 'top',
		minHeight: 100,
	},
	hint: {
		fontSize: 11,
		marginTop: 4,
	},
	bookingInfo: {
		borderRadius: 12,
		padding: 12,
		borderWidth: 1,
		marginBottom: 8,
	},
	bookingInfoTitle: {
		fontSize: 14,
		fontWeight: '700',
		marginBottom: 6,
	},
	bookingInfoText: {
		fontSize: 12,
		marginTop: 2,
	},
	footer: {
		flexDirection: 'row',
		gap: 12,
		padding: 20,
		borderTopWidth: 1,
	},
	button: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 12,
		borderRadius: 10,
	},
	buttonSecondary: {
		borderWidth: 2,
	},
	buttonPrimary: {},
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
