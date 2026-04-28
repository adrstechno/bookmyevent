import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import FadeInView from '@/components/common/FadeInView';
import { StackHeader } from '@/components/layout/StackHeader';
import { ThemedText } from '@/components/themed-text';
import { fetchVendorById, fetchVendorPackages } from '@/services/catalog/catalogService';
import type { VendorPackage, VendorSummary } from '@/types/catalog';
import { useSettingsTheme } from '@/theme/settingsTheme';

const FALLBACK_IMAGE = require('../../assets/images/frontend/Corporate-event.jpg');

const formatPrice = (amount?: number) => {
	if (typeof amount !== 'number' || Number.isNaN(amount)) {
		return 'Contact for pricing';
	}

	return `₹${amount.toLocaleString('en-IN')}`;
};

function VendorPackageCard({ item, onBookNow }: { item: VendorPackage; onBookNow: () => void }) {
	return (
		<View style={styles.packageCard}>
			<View style={styles.packageContent}>
				<ThemedText style={styles.packageTitle}>{item.packageName}</ThemedText>
				<ThemedText style={styles.packageDescription} numberOfLines={2}>
					{item.packageDescription || 'Package details available on request.'}
				</ThemedText>
				<View style={styles.packageFooter}>
					<ThemedText style={styles.packagePrice}>{formatPrice(item.amount)}</ThemedText>
					<Pressable style={styles.bookNowButton} onPress={onBookNow}>
						<ThemedText style={styles.bookNowButtonText}>Book Now</ThemedText>
					</Pressable>
				</View>
			</View>
		</View>
	);
}

function DetailRow({ label, value }: { label: string; value?: string | number }) {
	if (value === undefined || value === null || value === '') {
		return null;
	}

	return (
		<View style={styles.detailRow}>
			<ThemedText style={styles.detailLabel}>{label}</ThemedText>
			<ThemedText style={styles.detailValue}>{String(value)}</ThemedText>
		</View>
	);
}

export default function VendorDetailScreen() {
	const params = useLocalSearchParams<{ vendorId?: string }>();
	const router = useRouter();
	const { palette, mode } = useSettingsTheme();
	const vendorId = params.vendorId;

	const [vendor, setVendor] = useState<VendorSummary | null>(null);
	const [packages, setPackages] = useState<VendorPackage[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const heading = useMemo(() => vendor?.businessName || 'Vendor Details', [vendor?.businessName]);

	const handleBookNow = () => {
		// TODO: Navigate to booking screen
		console.log('Book now clicked');
	};

	useEffect(() => {
		let active = true;

		const load = async () => {
			if (!vendorId) {
				setError('Missing vendor identifier.');
				setLoading(false);
				return;
			}

			setLoading(true);
			setError('');

			try {
				const [vendorData, vendorPackages] = await Promise.all([
					fetchVendorById(vendorId),
					fetchVendorPackages(vendorId),
				]);

				if (active) {
					setVendor(vendorData);
					setPackages(vendorPackages);
					if (!vendorData) {
						setError('Vendor profile could not be found.');
					}
				}
			} catch (loadError) {
				if (active) {
					setError(loadError instanceof Error ? loadError.message : 'Unable to load vendor details.');
				}
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		};

		void load();

		return () => {
			active = false;
		};
	}, [vendorId]);

	const imageSource = vendor?.profileUrl ? { uri: vendor.profileUrl } : FALLBACK_IMAGE;

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: palette.screenBg }]} edges={['top']}>
			<StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
			<View style={[styles.page, { backgroundColor: palette.screenBg }]}>
				<StackHeader title={heading} />

				<FadeInView delay={80} distance={8} style={styles.body}>
					{loading ? (
						<View style={styles.stateWrap}>
							<ActivityIndicator size="large" color={palette.primary} />
							<ThemedText style={[styles.stateText, { color: palette.subtext }]}>Loading vendor profile...</ThemedText>
						</View>
					) : error ? (
						<View style={[styles.stateCard, { borderColor: palette.border, backgroundColor: palette.surfaceBg }]}>
							<ThemedText style={[styles.stateTitle, { color: palette.text }]}>Vendor detail unavailable</ThemedText>
							<ThemedText style={[styles.stateText, { color: palette.subtext }]}>{error}</ThemedText>
						</View>
					) : vendor ? (
						<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
							{/* Hero Image with Overlay */}
							<View style={styles.heroContainer}>
								<Image source={imageSource} style={styles.heroImage} />
								<View style={styles.heroOverlay}>
									<ThemedText style={styles.heroTitle}>{vendor.businessName}</ThemedText>
									<View style={styles.heroBadgesRow}>
										{vendor.isVerified && (
											<View style={styles.verifiedBadge}>
												<Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
												<ThemedText style={styles.verifiedBadgeText}>Verified</ThemedText>
											</View>
										)}
										{vendor.experienceYears && (
											<View style={styles.experienceBadge}>
												<Ionicons name="trophy" size={14} color="#FFFFFF" />
												<ThemedText style={styles.experienceBadgeText}>{vendor.experienceYears}+ Years</ThemedText>
											</View>
										)}
										{vendor.rating && (
											<View style={styles.ratingBadge}>
												<Ionicons name="star" size={14} color="#F59E0B" />
												<ThemedText style={styles.ratingBadgeText}>{vendor.rating.toFixed(1)}</ThemedText>
											</View>
										)}
									</View>
								</View>
							</View>

							{/* About Section */}
							<View style={[styles.sectionCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
								<View style={styles.sectionHeader}>
									<Ionicons name="information-circle-outline" size={22} color="#3c6e71" />
									<ThemedText style={[styles.sectionTitle, { color: palette.text }]}>About Us</ThemedText>
								</View>
								<ThemedText style={[styles.aboutText, { color: palette.subtext }]}>
									{vendor.description || 'Professional event services provider dedicated to making your special moments unforgettable.'}
								</ThemedText>
							</View>

							{/* Contact Info Section */}
							<View style={[styles.sectionCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
								<View style={styles.sectionHeader}>
									<Ionicons name="call-outline" size={22} color="#3c6e71" />
									<ThemedText style={[styles.sectionTitle, { color: palette.text }]}>Contact Info</ThemedText>
								</View>
								<View style={styles.contactInfoList}>
									{vendor.contact && (
										<View style={styles.contactInfoRow}>
											<Ionicons name="call" size={16} color="#3c6e71" />
											<ThemedText style={[styles.contactInfoText, { color: palette.text }]}>{vendor.contact}</ThemedText>
										</View>
									)}
									{(vendor.city || vendor.state) && (
										<View style={styles.contactInfoRow}>
											<Ionicons name="location" size={16} color="#3c6e71" />
											<ThemedText style={[styles.contactInfoText, { color: palette.text }]}>
												{[vendor.address, vendor.city, vendor.state].filter(Boolean).join(', ')}
											</ThemedText>
										</View>
									)}
									{vendor.experienceYears && (
										<View style={styles.contactInfoRow}>
											<Ionicons name="calendar" size={16} color="#3c6e71" />
											<ThemedText style={[styles.contactInfoText, { color: palette.text }]}>
												{vendor.experienceYears} Years Experience
											</ThemedText>
										</View>
									)}
								</View>
							</View>

							{/* Packages Section */}
							<View style={[styles.sectionCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
								<View style={styles.sectionHeader}>
									<Ionicons name="cube-outline" size={22} color="#3c6e71" />
									<ThemedText style={[styles.sectionTitle, { color: palette.text }]}>Our Packages</ThemedText>
									<ThemedText style={[styles.packageCount, { color: palette.subtext }]}>
										({packages.length} {packages.length === 1 ? 'package' : 'packages'})
									</ThemedText>
								</View>

								{packages.length === 0 ? (
									<View style={styles.emptyPackages}>
										<Ionicons name="cube-outline" size={48} color="#CBD5E1" />
										<ThemedText style={[styles.emptyPackagesTitle, { color: palette.text }]}>
											No Packages Available
										</ThemedText>
										<ThemedText style={[styles.emptyPackagesText, { color: palette.subtext }]}>
											This vendor hasn't added any packages yet.
										</ThemedText>
									</View>
								) : (
									<View style={styles.packagesGrid}>
										{packages.map((item) => (
											<VendorPackageCard key={item.packageId} item={item} onBookNow={handleBookNow} />
										))}
									</View>
								)}
							</View>

							{/* Book Now Button (Sticky at bottom when scrolling) */}
							{packages.length > 0 && (
								<Pressable style={styles.mainBookButton} onPress={handleBookNow}>
									<Ionicons name="cart-outline" size={20} color="#FFFFFF" />
									<ThemedText style={styles.mainBookButtonText}>Book Now</ThemedText>
								</Pressable>
							)}
						</ScrollView>
					) : null}
				</FadeInView>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	page: {
		flex: 1,
	},
	body: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: 28,
		gap: 16,
	},
	heroContainer: {
		position: 'relative',
		height: 320,
		width: '100%',
	},
	heroImage: {
		width: '100%',
		height: '100%',
		backgroundColor: '#E2E8F0',
	},
	heroOverlay: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		padding: 20,
		paddingBottom: 24,
		backgroundColor: 'rgba(0, 0, 0, 0.6)',
	},
	heroTitle: {
		fontSize: 28,
		fontWeight: '800',
		color: '#FFFFFF',
		marginBottom: 12,
		textShadowColor: 'rgba(0, 0, 0, 0.75)',
		textShadowOffset: { width: 0, height: 2 },
		textShadowRadius: 4,
	},
	heroBadgesRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	verifiedBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 20,
		backgroundColor: '#10B981',
	},
	verifiedBadgeText: {
		fontSize: 11,
		fontWeight: '700',
		color: '#FFFFFF',
	},
	experienceBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 20,
		backgroundColor: '#F59E0B',
	},
	experienceBadgeText: {
		fontSize: 11,
		fontWeight: '700',
		color: '#FFFFFF',
	},
	ratingBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 20,
		backgroundColor: '#FFFFFF',
	},
	ratingBadgeText: {
		fontSize: 11,
		fontWeight: '700',
		color: '#0F172A',
	},
	sectionCard: {
		marginHorizontal: 16,
		padding: 16,
		borderRadius: 16,
		borderWidth: 1,
		gap: 14,
		shadowColor: '#0F172A',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 3,
	},
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: '800',
	},
	packageCount: {
		fontSize: 12,
		fontWeight: '600',
		marginLeft: 'auto',
	},
	aboutText: {
		fontSize: 14,
		lineHeight: 22,
		fontWeight: '500',
	},
	contactInfoList: {
		gap: 12,
	},
	contactInfoRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 10,
		paddingVertical: 8,
		paddingHorizontal: 12,
		backgroundColor: '#F8FAFC',
		borderRadius: 10,
	},
	contactInfoText: {
		flex: 1,
		fontSize: 14,
		fontWeight: '600',
		lineHeight: 20,
	},
	packagesGrid: {
		gap: 12,
	},
	packageCard: {
		borderRadius: 14,
		overflow: 'hidden',
		backgroundColor: '#F8FAFC',
		borderWidth: 2,
		borderColor: '#E2E8F0',
	},
	packageContent: {
		padding: 14,
		gap: 10,
	},
	packageTitle: {
		fontSize: 17,
		fontWeight: '800',
		color: '#0F172A',
	},
	packageDescription: {
		fontSize: 13,
		lineHeight: 19,
		fontWeight: '500',
		color: '#475569',
	},
	packageFooter: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: 4,
	},
	packagePrice: {
		fontSize: 20,
		fontWeight: '800',
		color: '#2F6570',
	},
	bookNowButton: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 10,
		backgroundColor: '#284b63',
	},
	bookNowButtonText: {
		fontSize: 13,
		fontWeight: '700',
		color: '#FFFFFF',
	},
	emptyPackages: {
		alignItems: 'center',
		paddingVertical: 32,
		gap: 8,
	},
	emptyPackagesTitle: {
		fontSize: 16,
		fontWeight: '700',
		marginTop: 8,
	},
	emptyPackagesText: {
		fontSize: 13,
		fontWeight: '500',
		textAlign: 'center',
	},
	mainBookButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
		marginHorizontal: 16,
		paddingVertical: 14,
		borderRadius: 12,
		backgroundColor: '#284b63',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 4,
	},
	mainBookButtonText: {
		fontSize: 16,
		fontWeight: '800',
		color: '#FFFFFF',
	},
	stateWrap: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
		paddingHorizontal: 20,
	},
	stateCard: {
		margin: 16,
		padding: 16,
		borderRadius: 14,
		borderWidth: 1,
		gap: 10,
	},
	stateTitle: {
		fontSize: 16,
		fontWeight: '800',
	},
	stateText: {
		fontSize: 13,
		fontWeight: '600',
		textAlign: 'center',
	},
});
