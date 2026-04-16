import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
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
		<View style={styles.vendorCard}>
			<View style={styles.vendorImageContainer}>
				<Image source={imageUri ? { uri: imageUri } : FALLBACK_IMAGE} style={styles.vendorImage} />
				{vendor.isVerified && (
					<View style={styles.verifiedBadge}>
						<Ionicons name="shield-checkmark" size={14} color="#FFFFFF" />
					</View>
				)}
			</View>
			<View style={styles.vendorCardBody}>
				<View style={styles.vendorHeaderRow}>
					<ThemedText style={styles.vendorName} numberOfLines={1}>
						{vendor.businessName}
					</ThemedText>
					<RatingPill rating={vendor.rating} />
				</View>
				{(vendor.city || vendor.state) && (
					<View style={styles.vendorMetaRow}>
						<Ionicons name="location-outline" size={12} color="#3c6e71" />
						<ThemedText style={styles.vendorMeta} numberOfLines={1}>
							{[vendor.city, vendor.state].filter(Boolean).join(', ')}
						</ThemedText>
					</View>
				)}
				{vendor.contact && (
					<View style={styles.vendorMetaRow}>
						<Ionicons name="call-outline" size={12} color="#3c6e71" />
						<ThemedText style={styles.vendorMeta} numberOfLines={1}>
							{vendor.contact}
						</ThemedText>
					</View>
				)}
				<ThemedText style={styles.vendorDescription} numberOfLines={2}>
					{vendor.description || 'Professional event services'}
				</ThemedText>
				<Pressable style={styles.viewMoreButton} onPress={onPress}>
					<ThemedText style={styles.viewMoreButtonText}>View Details & Book</ThemedText>
					<Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
				</Pressable>
			</View>
		</View>
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
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCity, setSelectedCity] = useState<string>('all');

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

	const heading = serviceName || 'Find Your Perfect Vendor';

	// Get unique cities from vendors
	const cities = useMemo(() => {
		const uniqueCities = [...new Set(vendors.map((v) => v.city).filter(Boolean))];
		return uniqueCities as string[];
	}, [vendors]);

	// Filter vendors based on search and city
	const filteredVendors = useMemo(() => {
		return vendors.filter((vendor) => {
			const matchesSearch =
				vendor.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				vendor.description?.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesCity = selectedCity === 'all' || vendor.city === selectedCity;
			return matchesSearch && matchesCity;
		});
	}, [vendors, searchTerm, selectedCity]);

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: palette.screenBg }]} edges={['top']}>
			<StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
			<View style={[styles.page, { backgroundColor: palette.screenBg }]}>
				<StackHeader title={heading} />

				{/* Search and Filter Section */}
				{!loading && vendors.length > 0 && (
					<View style={[styles.filterSection, { backgroundColor: palette.screenBg }]}>
						{/* Search Bar */}
						<View style={[styles.searchContainer, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
							<Ionicons name="search-outline" size={20} color={palette.subtext} />
							<TextInput
								style={[styles.searchInput, { color: palette.text }]}
								placeholder="Search vendors by name or service..."
								placeholderTextColor={palette.subtext}
								value={searchTerm}
								onChangeText={setSearchTerm}
							/>
							{searchTerm.length > 0 && (
								<Pressable onPress={() => setSearchTerm('')}>
									<Ionicons name="close-circle" size={20} color={palette.subtext} />
								</Pressable>
							)}
						</View>

						{/* City Filter */}
						{cities.length > 0 && (
							<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cityFilterRow}>
								<Pressable
									style={[
										styles.cityChip,
										{
											backgroundColor: selectedCity === 'all' ? palette.primary : palette.surfaceBg,
											borderColor: selectedCity === 'all' ? palette.primaryStrong : palette.border,
										},
									]}
									onPress={() => setSelectedCity('all')}
								>
									<ThemedText
										style={[
											styles.cityChipText,
											{ color: selectedCity === 'all' ? palette.onPrimary : palette.text },
										]}
									>
										All Cities ({vendors.length})
									</ThemedText>
								</Pressable>
								{cities.map((city) => {
									const count = vendors.filter((v) => v.city === city).length;
									const isSelected = selectedCity === city;
									return (
										<Pressable
											key={city}
											style={[
												styles.cityChip,
												{
													backgroundColor: isSelected ? palette.primary : palette.surfaceBg,
													borderColor: isSelected ? palette.primaryStrong : palette.border,
												},
											]}
											onPress={() => setSelectedCity(city)}
										>
											<ThemedText
												style={[
													styles.cityChipText,
													{ color: isSelected ? palette.onPrimary : palette.text },
												]}
											>
												{city} ({count})
											</ThemedText>
										</Pressable>
									);
								})}
							</ScrollView>
						)}

						{/* Results Count */}
						<ThemedText style={[styles.resultsCount, { color: palette.subtext }]}>
							Showing {filteredVendors.length} of {vendors.length} vendors
						</ThemedText>
					</View>
				)}

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
							<ThemedText style={[styles.stateTitle, { color: palette.text }]}>No vendors available</ThemedText>
							<ThemedText style={[styles.stateText, { color: palette.subtext }]}>
								We're working on adding new vendors. Check back soon!
							</ThemedText>
						</View>
					) : filteredVendors.length === 0 ? (
						<View style={[styles.stateCard, { borderColor: palette.border, backgroundColor: palette.surfaceBg }]}>
							<ThemedText style={[styles.stateTitle, { color: palette.text }]}>No vendors found</ThemedText>
							<ThemedText style={[styles.stateText, { color: palette.subtext }]}>
								Try adjusting your search or filters
							</ThemedText>
						</View>
					) : (
						<ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
							{filteredVendors.map((vendor) => {
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
	filterSection: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		gap: 12,
	},
	searchContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 12,
		borderWidth: 2,
	},
	searchInput: {
		flex: 1,
		fontSize: 15,
		fontWeight: '500',
	},
	cityFilterRow: {
		gap: 8,
		paddingRight: 8,
	},
	cityChip: {
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 20,
		borderWidth: 2,
	},
	cityChipText: {
		fontSize: 13,
		fontWeight: '700',
	},
	resultsCount: {
		fontSize: 13,
		fontWeight: '600',
		paddingHorizontal: 4,
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
		borderRadius: 14,
		overflow: 'hidden',
		backgroundColor: '#FFFFFF',
		shadowColor: '#0F172A',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.06,
		shadowRadius: 10,
		elevation: 6,
		borderWidth: 1.5,
		borderColor: '#E2E8F0',
	},
	vendorImageContainer: {
		position: 'relative',
		width: '100%',
		height: 150,
	},
	vendorImage: {
		width: '100%',
		height: '100%',
		backgroundColor: '#E2E8F0',
	},
	verifiedBadge: {
		position: 'absolute',
		top: 8,
		right: 8,
		backgroundColor: '#10B981',
		borderRadius: 16,
		padding: 6,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 3,
		elevation: 4,
	},
	vendorCardBody: {
		padding: 12,
		gap: 8,
	},
	vendorHeaderRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 10,
	},
	vendorName: {
		flex: 1,
		fontSize: 17,
		fontWeight: '800',
		color: '#0F172A',
	},
	vendorMetaRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
	},
	vendorMeta: {
		fontSize: 12,
		fontWeight: '600',
		color: '#64748B',
		flex: 1,
	},
	vendorDescription: {
		fontSize: 12,
		lineHeight: 17,
		fontWeight: '500',
		color: '#475569',
		marginTop: 2,
	},
	viewMoreButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 6,
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderRadius: 10,
		backgroundColor: '#284b63',
		marginTop: 6,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.12,
		shadowRadius: 6,
		elevation: 3,
	},
	viewMoreButtonText: {
		fontSize: 13,
		fontWeight: '700',
		color: '#FFFFFF',
	},
	ratingPill: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
		paddingHorizontal: 7,
		paddingVertical: 3,
		borderRadius: 999,
		backgroundColor: '#FEF3C7',
	},
	ratingText: {
		fontSize: 10,
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
