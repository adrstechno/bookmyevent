import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	FlatList,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FadeInView from '@/components/common/FadeInView';
import PageLoadingState from '@/components/common/PageLoadingState';
import { useAppToast } from '@/components/common/AppToastProvider';
import { ThemedText } from '@/components/themed-text';
import VendorAppBar from '@/components/vendor/VendorAppBar';
import {
	createVendorPackage,
	deleteVendorPackage,
	fetchVendorPackages,
	fetchVendorProfile,
	updateVendorPackage,
} from '@/services/vendor/vendorService';
import { useSettingsTheme } from '@/theme/settingsTheme';
import type { VendorPackage } from '@/types/vendor';

type PackageForm = {
	packageId: string | null;
	packageName: string;
	packageDesc: string;
	amount: string;
};

const EMPTY_FORM: PackageForm = {
	packageId: null,
	packageName: '',
	packageDesc: '',
	amount: '',
};

const getErrorMessage = (error: unknown, fallback: string) => {
	if (error && typeof error === 'object' && 'message' in error) {
		const message = (error as { message?: string }).message;
		if (typeof message === 'string' && message.trim()) {
			return message;
		}
	}

	return fallback;
};

export default function VendorPackagesScreen() {
	const { palette } = useSettingsTheme();
	const { showSuccess, showError, showInfo } = useAppToast();
	const styles = useMemo(() => createStyles(palette), [palette]);

	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [vendorId, setVendorId] = useState<string | null>(null);
	const [packages, setPackages] = useState<VendorPackage[]>([]);
	const [form, setForm] = useState<PackageForm>(EMPTY_FORM);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [openModal, setOpenModal] = useState(false);
	const [isUpdate, setIsUpdate] = useState(false);
	const [expandedPackageId, setExpandedPackageId] = useState<string | null>(null);

	const resetForm = useCallback(() => {
		setForm(EMPTY_FORM);
		setErrors({});
	}, []);

	const loadPackages = useCallback(
		async (nextVendorId?: string | null) => {
			const targetVendorId = nextVendorId ?? vendorId;
			if (!targetVendorId) {
				setPackages([]);
				return;
			}

			const packageRows = await fetchVendorPackages(targetVendorId);
			setPackages(packageRows);
			if (packageRows.length > 0) {
				setExpandedPackageId(String(packageRows[0].packageId));
			} else {
				setExpandedPackageId(null);
			}
		},
		[vendorId]
	);

	const initialize = useCallback(async () => {
		setIsLoading(true);
		try {
			const profile = await fetchVendorProfile();
			if (!profile?.vendorId) {
				setVendorId(null);
				setPackages([]);
				showInfo('Complete your vendor profile in Settings before creating packages.');
				return;
			}

			const nextVendorId = String(profile.vendorId);
			setVendorId(nextVendorId);
			await loadPackages(nextVendorId);
		} catch (error) {
			const message = getErrorMessage(error, 'Unable to load packages right now.');
			showError(message);
		} finally {
			setIsLoading(false);
		}
	}, [loadPackages, showError, showInfo]);

	useEffect(() => {
		void initialize();
	}, [initialize]);

	const openCreate = useCallback(() => {
		setIsUpdate(false);
		resetForm();
		setOpenModal(true);
	}, [resetForm]);

	const openEdit = useCallback((pkg: VendorPackage) => {
		setIsUpdate(true);
		setForm({
			packageId: String(pkg.packageId),
			packageName: pkg.packageName,
			packageDesc: pkg.packageDesc,
			amount: String(pkg.amount),
		});
		setErrors({});
		setOpenModal(true);
	}, []);

	const validateForm = useCallback(() => {
		const nextErrors: Record<string, string> = {};

		if (!form.packageName.trim()) {
			nextErrors.packageName = 'Package name is required';
		}

		if (!form.amount.trim()) {
			nextErrors.amount = 'Amount is required';
		} else if (Number.isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
			nextErrors.amount = 'Enter a valid amount';
		}

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	}, [form.amount, form.packageName]);

	const handleSave = useCallback(async () => {
		if (!vendorId) {
			showError('Vendor profile not found. Please complete Settings first.');
			return;
		}

		if (!validateForm()) {
			showError('Please fix the highlighted fields.');
			return;
		}

		setIsSubmitting(true);
		try {
			const payload = {
				packageName: form.packageName,
				packageDesc: form.packageDesc,
				amount: Number(form.amount),
			};

			if (isUpdate && form.packageId) {
				await updateVendorPackage(form.packageId, payload);
				showSuccess('Package updated successfully');
			} else {
				await createVendorPackage(payload);
				showSuccess('Package created successfully');
			}

			setOpenModal(false);
			resetForm();
			await loadPackages(vendorId);
		} catch (error) {
			showError(
				getErrorMessage(
					error,
					isUpdate ? 'Failed to update package.' : 'Failed to create package.'
				)
			);
		} finally {
			setIsSubmitting(false);
		}
	}, [
		form.amount,
		form.packageDesc,
		form.packageId,
		form.packageName,
		isUpdate,
		loadPackages,
		resetForm,
		showError,
		showSuccess,
		validateForm,
		vendorId,
	]);

	const handleDelete = useCallback(
		(pkg: VendorPackage) => {
			Alert.alert('Delete Package', `Delete "${pkg.packageName}"?`, [
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
					onPress: () => {
						void (async () => {
							try {
								await deleteVendorPackage(pkg.packageId);
								showSuccess('Package deleted successfully');
								await loadPackages(vendorId);
							} catch (error) {
								showError(getErrorMessage(error, 'Failed to delete package.'));
							}
						})();
					},
				},
			]);
		},
		[loadPackages, showError, showSuccess, vendorId]
	);

	const renderPackageRow = useCallback(
		({ item }: { item: VendorPackage }) => {
			const packageId = String(item.packageId);
			const isExpanded = expandedPackageId === packageId;
			return (
				<View style={styles.packageCard}>
					<View style={styles.packageTopRow}>
						<View style={styles.packageTitleWrap}>
							<View style={styles.packageIconBubble}>
								<Ionicons name="cube-outline" size={18} color="#fff" />
							</View>
							<View style={styles.packageTitleStack}>
								<ThemedText style={styles.packageName}>{item.packageName}</ThemedText>
								<View style={[styles.stateChip, styles.activeChip]}>
									<ThemedText style={[styles.stateChipText, styles.activeChipText]}>Active</ThemedText>
								</View>
							</View>
						</View>

						<View style={styles.amountBadge}>
							<ThemedText style={styles.amountText}>₹ {item.amount.toLocaleString('en-IN')}</ThemedText>
						</View>
					</View>

					<View style={styles.metaRow}>
						<View style={styles.metaPill}>
							<Ionicons name="pricetag-outline" size={12} color={palette.primary} />
							<ThemedText style={styles.metaText}>Package #{packageId}</ThemedText>
						</View>
						<View style={styles.metaPill}>
							<Ionicons name="checkmark-circle-outline" size={12} color="#166534" />
							<ThemedText style={[styles.metaText, styles.activeMetaText]}>Visible in listing</ThemedText>
						</View>
					</View>

					<Pressable
						style={({ pressed }) => [styles.detailsToggle, { opacity: pressed ? 0.82 : 1 }]}
						onPress={() => setExpandedPackageId((prev) => (prev === packageId ? null : packageId))}
					>
						<ThemedText style={styles.detailsToggleText}>
							{isExpanded ? 'Hide details' : 'View details'}
						</ThemedText>
						<Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={palette.primary} />
					</Pressable>

					{isExpanded ? (
						<View style={styles.detailsBox}>
							<ThemedText style={styles.detailsLabel}>Description</ThemedText>
							<ThemedText style={styles.detailsText}>
								{item.packageDesc || 'No description available for this package.'}
							</ThemedText>
						</View>
					) : null}

					<View style={styles.cardFooter}>
						<Pressable
							style={({ pressed }) => [styles.cardAction, styles.editButton, { opacity: pressed ? 0.86 : 1 }]}
							onPress={() => openEdit(item)}
						>
							<Ionicons name="create-outline" size={16} color="#2563eb" />
							<ThemedText style={styles.editText}>Edit</ThemedText>
						</Pressable>
						<Pressable
							style={({ pressed }) => [styles.cardAction, styles.deleteButton, { opacity: pressed ? 0.86 : 1 }]}
							onPress={() => handleDelete(item)}
						>
							<Ionicons name="trash-outline" size={16} color="#dc2626" />
							<ThemedText style={styles.deleteText}>Delete</ThemedText>
						</Pressable>
					</View>
				</View>
			);
		},
		[expandedPackageId, handleDelete, openEdit, palette.primary, styles]
	);

	if (isLoading) {
		return <PageLoadingState text="Loading packages..." />;
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: palette.screenBg }}>
			<VendorAppBar
				title="My Packages"
				actionElement={
					<Pressable
						style={({ pressed }) => [
							styles.createButton,
							{ opacity: pressed || !vendorId ? 0.9 : 1 },
							!vendorId ? styles.disabledCreateButton : null,
						]}
						onPress={openCreate}
						disabled={!vendorId}
					>
						<Ionicons name="add" size={18} color="#fff" />
						<ThemedText style={styles.createButtonText}>Create</ThemedText>
					</Pressable>
				}
			/>

			<ScrollView style={styles.screen} contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
				<FadeInView>
					<View style={styles.panel}>
						{!vendorId ? (
							<View style={styles.centerState}>
								<Ionicons name="alert-circle-outline" size={56} color={palette.muted} />
								<ThemedText style={styles.emptyTitle}>Vendor profile required</ThemedText>
								<ThemedText style={styles.emptySubtitle}>
									Please complete your vendor profile in Settings before creating packages.
								</ThemedText>
							</View>
						) : packages.length === 0 ? (
							<View style={styles.centerState}>
								<Ionicons name="cube-outline" size={56} color={palette.muted} />
								<ThemedText style={styles.emptyTitle}>No packages found</ThemedText>
								<ThemedText style={styles.emptySubtitle}>Create your first package to get started</ThemedText>
							</View>
						) : (
							<FlatList
								data={packages}
								keyExtractor={(item) => String(item.packageId)}
								renderItem={renderPackageRow}
								scrollEnabled={false}
								contentContainerStyle={styles.cardList}
								ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
							/>
						)}
					</View>
				</FadeInView>
			</ScrollView>

			<Modal visible={openModal} transparent animationType="fade" onRequestClose={() => setOpenModal(false)}>
				<View style={styles.modalOverlay}>
					<Pressable style={StyleSheet.absoluteFill} onPress={() => setOpenModal(false)} />
					<View style={[styles.modalCard, { backgroundColor: palette.surfaceBg }]}>
						<View style={styles.modalHeader}>
							<ThemedText style={styles.modalTitle}>{isUpdate ? 'Edit Package' : 'Create Package'}</ThemedText>
							<Pressable onPress={() => setOpenModal(false)}>
								<Ionicons name="close" size={24} color={palette.text} />
							</Pressable>
						</View>

						<ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
							<View style={styles.fieldGroup}>
								<ThemedText style={styles.label}>Package Name</ThemedText>
								<TextInput
									style={[styles.input, { borderColor: errors.packageName ? '#dc2626' : palette.border, color: palette.text }]}
									placeholder="Enter package name"
									placeholderTextColor={palette.muted}
									value={form.packageName}
									onChangeText={(value) => {
										setForm((prev) => ({ ...prev, packageName: value }));
										setErrors((prev) => ({ ...prev, packageName: '' }));
									}}
								/>
								{errors.packageName ? <ThemedText style={styles.errorText}>{errors.packageName}</ThemedText> : null}
							</View>

							<View style={styles.fieldGroup}>
								<ThemedText style={styles.label}>Description</ThemedText>
								<TextInput
									style={[styles.textArea, { borderColor: palette.border, color: palette.text }]}
									placeholder="Enter package description"
									placeholderTextColor={palette.muted}
									value={form.packageDesc}
									onChangeText={(value) => setForm((prev) => ({ ...prev, packageDesc: value }))}
									multiline
									numberOfLines={4}
								/>
							</View>

							<View style={styles.fieldGroup}>
								<ThemedText style={styles.label}>Amount</ThemedText>
								<TextInput
									style={[styles.input, { borderColor: errors.amount ? '#dc2626' : palette.border, color: palette.text }]}
									placeholder="Enter amount"
									placeholderTextColor={palette.muted}
									value={form.amount}
									onChangeText={(value) => {
										setForm((prev) => ({ ...prev, amount: value.replace(/[^0-9]/g, '') }));
										setErrors((prev) => ({ ...prev, amount: '' }));
									}}
									keyboardType="number-pad"
								/>
								{errors.amount ? <ThemedText style={styles.errorText}>{errors.amount}</ThemedText> : null}
							</View>
						</ScrollView>

						<View style={styles.modalActions}>
							<Pressable
								style={({ pressed }) => [styles.secondaryButton, { backgroundColor: pressed ? palette.pressedBg : palette.elevatedBg }]}
								onPress={() => setOpenModal(false)}
								disabled={isSubmitting}
							>
								<ThemedText style={[styles.buttonText, { color: palette.primary }]}>Cancel</ThemedText>
							</Pressable>
							<Pressable
								style={({ pressed }) => [styles.primaryButton, { backgroundColor: pressed ? '#2f5b60' : palette.primary }]}
								onPress={handleSave}
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<ActivityIndicator size="small" color="#fff" />
								) : (
									<ThemedText style={[styles.buttonText, { color: '#fff' }]}>{isUpdate ? 'Update' : 'Save'}</ThemedText>
								)}
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

function createStyles(palette: ReturnType<typeof useSettingsTheme>['palette']) {
	return StyleSheet.create({
		createButton: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
			backgroundColor: palette.primary,
			paddingHorizontal: 14,
			paddingVertical: 10,
			borderRadius: 10,
		},
		disabledCreateButton: {
			opacity: 0.55,
		},
		createButtonText: {
			color: '#fff',
			fontSize: 13,
			fontWeight: '700',
		},
		screen: {
			flex: 1,
			backgroundColor: palette.screenBg,
		},
		screenContent: {
			padding: 16,
			paddingBottom: 28,
		},
		panel: {
			backgroundColor: palette.surfaceBg,
			borderRadius: 18,
			overflow: 'hidden',
			borderTopWidth: 4,
			borderTopColor: palette.primary,
			shadowColor: palette.shadow,
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.08,
			shadowRadius: 8,
			elevation: 3,
		},
		centerState: {
			alignItems: 'center',
			justifyContent: 'center',
			paddingVertical: 40,
			paddingHorizontal: 24,
			gap: 10,
			minHeight: 240,
		},
		emptyTitle: {
			fontSize: 18,
			fontWeight: '700',
			color: palette.text,
		},
		emptySubtitle: {
			fontSize: 13,
			color: palette.muted,
			textAlign: 'center',
		},
		cardList: {
			padding: 16,
			paddingTop: 14,
			gap: 12,
		},
		cardSeparator: {
			height: 12,
		},
		packageCard: {
			backgroundColor: palette.screenBg,
			borderRadius: 18,
			borderWidth: 1,
			borderColor: palette.border,
			padding: 14,
			shadowColor: palette.shadow,
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.05,
			shadowRadius: 8,
			elevation: 2,
		},
		packageTopRow: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'flex-start',
			gap: 12,
		},
		packageTitleWrap: {
			flex: 1,
			flexDirection: 'row',
			alignItems: 'flex-start',
			gap: 10,
		},
		packageIconBubble: {
			width: 34,
			height: 34,
			borderRadius: 12,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: palette.primary,
		},
		packageTitleStack: {
			flex: 1,
			gap: 6,
		},
		packageName: {
			fontSize: 14,
			fontWeight: '700',
			color: palette.text,
		},
		stateChip: {
			alignSelf: 'flex-start',
			paddingHorizontal: 10,
			paddingVertical: 5,
			borderRadius: 999,
		},
		activeChip: {
			backgroundColor: 'rgba(22, 101, 52, 0.12)',
		},
		activeChipText: {
			color: '#166534',
		},
		stateChipText: {
			fontSize: 11,
			fontWeight: '700',
		},
		metaRow: {
			flexDirection: 'row',
			flexWrap: 'wrap',
			gap: 8,
			marginTop: 12,
		},
		metaPill: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
			paddingHorizontal: 10,
			paddingVertical: 7,
			borderRadius: 999,
			backgroundColor: palette.elevatedBg,
		},
		metaText: {
			fontSize: 11,
			fontWeight: '600',
			color: palette.text,
		},
		activeMetaText: {
			color: '#166534',
		},
		amountBadge: {
			backgroundColor: 'rgba(34, 197, 94, 0.12)',
			borderRadius: 999,
			paddingHorizontal: 12,
			paddingVertical: 8,
		},
		amountText: {
			fontSize: 13,
			fontWeight: '800',
			color: '#166534',
		},
		detailsToggle: {
			marginTop: 12,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingVertical: 10,
			paddingHorizontal: 12,
			borderRadius: 12,
			backgroundColor: palette.elevatedBg,
		},
		detailsToggleText: {
			fontSize: 13,
			fontWeight: '700',
			color: palette.primary,
		},
		detailsBox: {
			marginTop: 12,
			padding: 12,
			borderRadius: 14,
			backgroundColor: palette.elevatedBg,
			borderLeftWidth: 4,
			borderLeftColor: palette.primary,
		},
		detailsLabel: {
			fontSize: 12,
			fontWeight: '800',
			color: palette.text,
			marginBottom: 4,
		},
		detailsText: {
			fontSize: 13,
			lineHeight: 19,
			color: palette.muted,
		},
		cardFooter: {
			flexDirection: 'row',
			gap: 10,
			marginTop: 14,
		},
		cardAction: {
			flex: 1,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 6,
			paddingVertical: 11,
			borderRadius: 12,
		},
		editButton: {
			backgroundColor: 'rgba(37, 99, 235, 0.12)',
		},
		deleteButton: {
			backgroundColor: 'rgba(220, 38, 38, 0.12)',
		},
		editText: {
			fontSize: 13,
			fontWeight: '700',
			color: '#2563eb',
		},
		deleteText: {
			fontSize: 13,
			fontWeight: '700',
			color: '#dc2626',
		},
		modalOverlay: {
			flex: 1,
			backgroundColor: palette.overlay,
			justifyContent: 'center',
			paddingHorizontal: 18,
		},
		modalCard: {
			borderRadius: 20,
			overflow: 'hidden',
			shadowColor: palette.shadow,
			shadowOffset: { width: 0, height: 10 },
			shadowOpacity: 0.18,
			shadowRadius: 24,
			elevation: 12,
		},
		modalHeader: {
			paddingHorizontal: 18,
			paddingVertical: 16,
			borderBottomWidth: 1,
			borderBottomColor: palette.border,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
		},
		modalTitle: {
			fontSize: 18,
			fontWeight: '800',
			color: palette.text,
		},
		modalBody: {
			padding: 18,
			gap: 16,
		},
		fieldGroup: {
			gap: 6,
		},
		label: {
			fontSize: 13,
			fontWeight: '700',
			color: palette.text,
		},
		input: {
			borderWidth: 1,
			borderRadius: 12,
			paddingHorizontal: 14,
			paddingVertical: 12,
			fontSize: 14,
			backgroundColor: palette.screenBg,
		},
		textArea: {
			borderWidth: 1,
			borderRadius: 12,
			paddingHorizontal: 14,
			paddingVertical: 12,
			fontSize: 14,
			backgroundColor: palette.screenBg,
			textAlignVertical: 'top',
			minHeight: 110,
		},
		errorText: {
			fontSize: 12,
			fontWeight: '600',
			color: '#dc2626',
		},
		modalActions: {
			paddingHorizontal: 18,
			paddingVertical: 16,
			borderTopWidth: 1,
			borderTopColor: palette.border,
			flexDirection: 'row',
			gap: 12,
		},
		secondaryButton: {
			flex: 1,
			borderRadius: 12,
			paddingVertical: 13,
			alignItems: 'center',
			justifyContent: 'center',
		},
		primaryButton: {
			flex: 1,
			borderRadius: 12,
			paddingVertical: 13,
			alignItems: 'center',
			justifyContent: 'center',
		},
		buttonText: {
			fontSize: 14,
			fontWeight: '800',
		},
	});
}
