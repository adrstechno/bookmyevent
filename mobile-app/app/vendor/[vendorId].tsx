import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
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

	return `Rs. ${amount.toLocaleString()}`;
};

function VendorPackageCard({ item }: { item: VendorPackage }) {
	return (
		<View style={styles.packageCard}>
			<View style={styles.packageHeaderRow}>
				<ThemedText style={styles.packageTitle}>{item.packageName}</ThemedText>
				<ThemedText style={styles.packagePrice}>{formatPrice(item.amount)}</ThemedText>
			</View>
			<ThemedText style={styles.packageDescription} numberOfLines={2}>
				{item.packageDescription || 'Package details available on request.'}
			</ThemedText>
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
	const { palette, mode } = useSettingsTheme();
	const vendorId = params.vendorId;

	const [vendor, setVendor] = useState<VendorSummary | null>(null);
	const [packages, setPackages] = useState<VendorPackage[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const heading = useMemo(() => vendor?.businessName || 'Vendor Details', [vendor?.businessName]);

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
				<View style={[styles.appBar, { backgroundColor: palette.primary }]}>
					<ThemedText style={[styles.subtitle, { color: palette.onPrimary }]} numberOfLines={2}>
						Explore profile, contact details, and available packages.
					</ThemedText>
				</View>

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
							<Image source={imageSource} style={styles.heroImage} />
							<View style={[styles.profileCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
								<View style={styles.profileHeader}>
									<ThemedText style={[styles.vendorName, { color: palette.text }]}>{vendor.businessName}</ThemedText>
									<View style={styles.badgesRow}>
										{vendor.isVerified ? (
											<View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
												<ThemedText style={styles.statusBadgeText}>Verified</ThemedText>
											</View>
										) : null}
										{vendor.rating ? (
											<View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
												<Ionicons name="star" size={12} color="#D97706" />
												<ThemedText style={styles.ratingBadgeText}>{vendor.rating.toFixed(1)}</ThemedText>
											</View>
										) : null}
									</View>
								</View>
								<ThemedText style={[styles.description, { color: palette.subtext }]}> 
									{vendor.description || 'No description available.'}
								</ThemedText>
								<View style={[styles.detailsSection, { borderTopColor: palette.border }]}>
									<DetailRow label="Location" value={[vendor.city, vendor.state].filter(Boolean).join(', ')} />
									<DetailRow label="Contact" value={vendor.contact} />
									<DetailRow label="Address" value={vendor.address} />
									<DetailRow label="Experience" value={typeof vendor.experienceYears === 'number' ? `${vendor.experienceYears} years` : undefined} />
								</View>
							</View>

							<View style={styles.sectionHeader}>
								<ThemedText style={[styles.sectionTitle, { color: palette.text }]}>Packages</ThemedText>
								<ThemedText style={[styles.sectionCount, { color: palette.subtext }]}>{packages.length} available</ThemedText>
							</View>

							{packages.length === 0 ? (
								<View style={[styles.emptyCard, { borderColor: palette.border, backgroundColor: palette.surfaceBg }]}>
									<ThemedText style={[styles.stateText, { color: palette.subtext }]}>No packages listed for this vendor yet.</ThemedText>
								</View>
							) : (
								packages.map((item) => <VendorPackageCard key={item.packageId} item={item} />)
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
	appBar: {
		paddingHorizontal: 18,
		paddingTop: 8,
		paddingBottom: 12,
		gap: 8,
	},
	subtitle: {
		fontSize: 13,
		lineHeight: 18,
		fontWeight: '600',
		opacity: 0.9,
	},
	body: {
		flex: 1,
	},
	scrollContent: {
		padding: 16,
		paddingBottom: 28,
		gap: 14,
	},
	heroImage: {
		width: '100%',
		height: 230,
		borderRadius: 18,
		backgroundColor: '#E2E8F0',
	},
	profileCard: {
		borderRadius: 18,
		padding: 16,
		borderWidth: 1,
		gap: 12,
	},
	profileHeader: {
		gap: 8,
	},
	vendorName: {
		fontSize: 22,
		fontWeight: '800',
	},
	badgesRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		flexWrap: 'wrap',
	},
	statusBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 999,
	},
	statusBadgeText: {
		fontSize: 11,
		fontWeight: '800',
		color: '#166534',
	},
	ratingBadgeText: {
		fontSize: 11,
		fontWeight: '800',
		color: '#92400E',
	},
	description: {
		fontSize: 14,
		lineHeight: 20,
		fontWeight: '500',
	},
	detailsSection: {
		borderTopWidth: 1,
		paddingTop: 12,
		gap: 10,
	},
	detailRow: {
		gap: 4,
	},
	detailLabel: {
		fontSize: 12,
		fontWeight: '800',
		color: '#64748B',
	},
	detailValue: {
		fontSize: 14,
		fontWeight: '600',
		color: '#0F172A',
	},
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'baseline',
		justifyContent: 'space-between',
		gap: 10,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '800',
	},
	sectionCount: {
		fontSize: 12,
		fontWeight: '700',
	},
	packageCard: {
		padding: 14,
		borderRadius: 16,
		backgroundColor: '#FFFFFF',
		boxShadow: '0px 5px 12px rgba(15, 23, 42, 0.06)',
		gap: 8,
	},
	packageHeaderRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 10,
	},
	packageTitle: {
		flex: 1,
		fontSize: 15,
		fontWeight: '800',
	},
	packagePrice: {
		fontSize: 14,
		fontWeight: '800',
		color: '#2F6570',
	},
	packageDescription: {
		fontSize: 13,
		lineHeight: 19,
		fontWeight: '500',
		color: '#475569',
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
	emptyCard: {
		padding: 16,
		borderRadius: 14,
		borderWidth: 1,
	},
});
