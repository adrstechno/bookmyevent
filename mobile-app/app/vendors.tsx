import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import FadeInView from '@/components/common/FadeInView';
import { StackHeader } from '@/components/layout/StackHeader';
import { ThemedText } from '@/components/themed-text';
import {
	fetchServiceCategories,
	fetchVendors,
	fetchVendorsByService,
	fetchVendorsBySubservice,
} from '@/services/catalog/catalogService';
import type { VendorSummary } from '@/types/catalog';
import { useSettingsTheme } from '@/theme/settingsTheme';

const FALLBACK_IMAGE = require('../assets/images/frontend/Corporate-event.jpg');

function RatingPill({ rating }: { rating?: number }) {
	if (typeof rating !== 'number' || Number.isNaN(rating)) {
		return null;
	}

	return (
		<View style={styles.ratingPill}>
			<Ionicons name="star" size={12} color="#F59E0B" />
			<ThemedText style={styles.ratingText}>{rating.toFixed(1)}</ThemedText>
		</View>
	);
}

function VendorCard({ vendor, onPress, imageUri }: { vendor: VendorSummary; onPress: () => void; imageUri?: string }) {
	return (
		<Pressable style={styles.vendorCard} onPress={onPress}>
			<Image source={imageUri ? { uri: imageUri } : FALLBACK_IMAGE} style={styles.vendorImage} />
			<View style={styles.vendorCardBody}>
				<View style={styles.vendorHeaderRow}>
					<ThemedText style={styles.vendorName} numberOfLines={1}>
						{vendor.businessName}
					</ThemedText>
					<RatingPill rating={vendor.rating} />
				</View>
				<ThemedText style={styles.vendorMeta} numberOfLines={1}>
					{[vendor.city, vendor.state].filter(Boolean).join(', ') || 'Location unavailable'}
				</ThemedText>
				<ThemedText style={styles.vendorDescription} numberOfLines={2}>
					{vendor.description || 'Explore services, pricing, and profile details.'}
				</ThemedText>
				<View style={styles.vendorFooterRow}>
					<ThemedText style={styles.vendorFooterText} numberOfLines={1}>
						{typeof vendor.experienceYears === 'number' ? `${vendor.experienceYears} years experience` : 'Experience not listed'}
					</ThemedText>
					<View style={styles.viewMorePill}>
						<ThemedText style={styles.viewMoreText}>View</ThemedText>
						<Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
					</View>
				</View>
			</View>
		</Pressable>
	);
}

export default function VendorsScreen() {
	const router = useRouter();
	const { palette, mode } = useSettingsTheme();
	const params = useLocalSearchParams<{ serviceId?: string; subserviceId?: string; serviceName?: string }>();

	const [vendors, setVendors] = useState<VendorSummary[]>([]);
	const [serviceName, setServiceName] = useState(params.serviceName ?? 'Vendors');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const selectedServiceId = useMemo(() => {
		const value = params.serviceId;
		return typeof value === 'string' && value.length > 0 ? value : undefined;
	}, [params.serviceId]);

	const selectedSubserviceId = useMemo(() => {
		const value = params.subserviceId;
		return typeof value === 'string' && value.length > 0 ? value : undefined;
	}, [params.subserviceId]);

	useEffect(() => {
		let active = true;

		const load = async () => {
			setLoading(true);
			setError('');

			try {
				const categories = await fetchServiceCategories();
				if (active) {
					if (!params.serviceName && selectedServiceId) {
						const matched = categories.find((item) => String(item.serviceId) === String(selectedServiceId));
						if (matched) {
							setServiceName(matched.name);
						}
					}
				}

				let nextVendors: VendorSummary[] = [];
				if (selectedSubserviceId) {
					nextVendors = await fetchVendorsBySubservice(selectedSubserviceId);
				} else if (selectedServiceId) {
					nextVendors = await fetchVendorsByService(selectedServiceId);
				} else {
					nextVendors = await fetchVendors();
				}

				if (active) {
					setVendors(nextVendors);
				}
			} catch (loadError) {
				if (active) {
					setError(loadError instanceof Error ? loadError.message : 'Unable to load vendors.');
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
	}, [params.serviceName, selectedServiceId, selectedSubserviceId]);

	const heading = serviceName || 'Vendors';
	const subtitle = selectedSubserviceId
		? 'Browse vendors for this sub-service.'
		: selectedServiceId
			? 'Browse vendors for this service category.'
			: 'Browse all available vendors.';

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: palette.screenBg }]} edges={['top']}>
			<StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
			<View style={[styles.page, { backgroundColor: palette.screenBg }]}>
				<StackHeader title={heading} />
				<View style={[styles.appBar, { backgroundColor: palette.primary }]}>
					<ThemedText style={[styles.subtitle, { color: palette.onPrimary }]} numberOfLines={2}>
						{subtitle}
					</ThemedText>
				</View>

				<FadeInView delay={80} distance={8} style={styles.body}>
					{loading ? (
						<View style={styles.stateWrap}>
							<ActivityIndicator size="large" color={palette.primary} />
							<ThemedText style={[styles.stateText, { color: palette.subtext }]}>Loading vendors...</ThemedText>
						</View>
					) : error ? (
						<View style={[styles.stateCard, { borderColor: palette.border, backgroundColor: palette.surfaceBg }]}>
							<ThemedText style={[styles.stateTitle, { color: palette.text }]}>Unable to load vendors</ThemedText>
							<ThemedText style={[styles.stateText, { color: palette.subtext }]}>{error}</ThemedText>
						</View>
					) : vendors.length === 0 ? (
						<View style={[styles.stateCard, { borderColor: palette.border, backgroundColor: palette.surfaceBg }]}>
							<ThemedText style={[styles.stateTitle, { color: palette.text }]}>No vendors found</ThemedText>
							<ThemedText style={[styles.stateText, { color: palette.subtext }]}>
								Try another service or check back later.
							</ThemedText>
						</View>
					) : (
						<ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
							{vendors.map((vendor) => {
								const imageUri = vendor.profileUrl;
								return (
									<VendorCard
										key={vendor.vendorId}
										vendor={vendor}
										imageUri={imageUri}
										onPress={() => router.push(`/vendor/${vendor.vendorId}` as never)}
									/>
								);
							})}
						</ScrollView>
					)}
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
	list: {
		padding: 16,
		gap: 12,
		paddingBottom: 28,
	},
	vendorCard: {
		borderRadius: 18,
		overflow: 'hidden',
		backgroundColor: '#FFFFFF',
		boxShadow: '0px 6px 14px rgba(15, 23, 42, 0.08)',
	},
	vendorImage: {
		width: '100%',
		height: 180,
		backgroundColor: '#E2E8F0',
	},
	vendorCardBody: {
		padding: 14,
		gap: 8,
	},
	vendorHeaderRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 12,
	},
	vendorName: {
		flex: 1,
		fontSize: 18,
		fontWeight: '800',
	},
	vendorMeta: {
		fontSize: 12,
		fontWeight: '700',
		color: '#64748B',
	},
	vendorDescription: {
		fontSize: 13,
		lineHeight: 19,
		fontWeight: '500',
		color: '#475569',
	},
	vendorFooterRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 10,
		marginTop: 2,
	},
	vendorFooterText: {
		flex: 1,
		fontSize: 12,
		fontWeight: '700',
		color: '#0F172A',
	},
	viewMorePill: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 999,
		backgroundColor: '#2F6570',
	},
	viewMoreText: {
		fontSize: 12,
		fontWeight: '800',
		color: '#FFFFFF',
	},
	ratingPill: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 999,
		backgroundColor: '#FEF3C7',
	},
	ratingText: {
		fontSize: 11,
		fontWeight: '800',
		color: '#92400E',
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
		gap: 6,
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
