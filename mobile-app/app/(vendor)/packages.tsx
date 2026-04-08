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

import AppMenuDrawer from '@/components/layout/AppMenuDrawer';
import FadeInView from '@/components/common/FadeInView';
import { useAppToast } from '@/components/common/AppToastProvider';
import { ThemedText } from '@/components/themed-text';
import { useSettingsTheme } from '@/theme/settingsTheme';

interface PackageItem {
	package_id: number;
	package_name: string;
	package_desc: string;
	amount: string;
	is_active: boolean;
}

interface PackageForm {
	package_id: number | null;
	package_name: string;
	package_desc: string;
	amount: string;
}

const MOCK_PACKAGES: PackageItem[] = [
	{
		package_id: 1,
		package_name: 'Wedding Essentials',
		package_desc: 'Decoration, planning, and coordination for intimate weddings.',
		amount: '45000',
		is_active: true,
	},
	{
		package_id: 2,
		package_name: 'Corporate Premium',
		package_desc: 'Venue setup, sound, and event management for business functions.',
		amount: '65000',
		is_active: true,
	},
	{
		package_id: 3,
		package_name: 'Birthday Delight',
		package_desc: 'Theme planning, balloons, and entertainment support.',
		amount: '22000',
		is_active: false,
	},
];

const EMPTY_FORM: PackageForm = {
	package_id: null,
	package_name: '',
	package_desc: '',
	amount: '',
};

export default function VendorPackagesScreen() {
	const { palette } = useSettingsTheme();
	const { showSuccess, showError } = useAppToast();

	const [loading, setLoading] = useState(true);
	const [packages, setPackages] = useState<PackageItem[]>([]);
	const [openModal, setOpenModal] = useState(false);
	const [isUpdate, setIsUpdate] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [form, setForm] = useState<PackageForm>(EMPTY_FORM);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [expandedPackageId, setExpandedPackageId] = useState<number | null>(1);

	useEffect(() => {
		const timer = setTimeout(() => {
			setPackages(MOCK_PACKAGES);
			setLoading(false);
		}, 350);

		return () => clearTimeout(timer);
	}, []);

	const styles = useMemo(() => createStyles(palette), [palette]);

	const resetForm = useCallback(() => {
		setForm(EMPTY_FORM);
		setErrors({});
	}, []);

	const openCreate = useCallback(() => {
		setIsUpdate(false);
		resetForm();
		setOpenModal(true);
	}, [resetForm]);

	const openEdit = useCallback((pkg: PackageItem) => {
		setIsUpdate(true);
		setForm({
			package_id: pkg.package_id,
			package_name: pkg.package_name,
			package_desc: pkg.package_desc,
			amount: pkg.amount,
		});
		setErrors({});
		setOpenModal(true);
	}, []);

	const validateForm = useCallback(() => {
		const nextErrors: Record<string, string> = {};

		if (!form.package_name.trim()) {
			nextErrors.package_name = 'Package name is required';
		}

		if (!form.amount.trim()) {
			nextErrors.amount = 'Amount is required';
		} else if (Number(form.amount) <= 0 || Number.isNaN(Number(form.amount))) {
			nextErrors.amount = 'Enter a valid amount';
		}

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	}, [form.amount, form.package_name]);

	const handleSave = useCallback(async () => {
		if (!validateForm()) {
			showError('Please fix the highlighted fields');
			return;
		}

		setIsSubmitting(true);
		try {
			await new Promise((resolve) => setTimeout(resolve, 500));

			if (isUpdate && form.package_id !== null) {
				setPackages((prev) =>
					prev.map((item) =>
						item.package_id === form.package_id
							? {
								...item,
								package_name: form.package_name.trim(),
								package_desc: form.package_desc.trim(),
								amount: form.amount.trim(),
							}
							: item
					),
				);
				showSuccess('Package updated successfully');
			} else {
				const nextId = packages.length > 0 ? Math.max(...packages.map((item) => item.package_id)) + 1 : 1;
				setPackages((prev) => [
					{
						package_id: nextId,
						package_name: form.package_name.trim(),
						package_desc: form.package_desc.trim(),
						amount: form.amount.trim(),
						is_active: true,
					},
					...prev,
				]);
				showSuccess('Package created successfully');
			}

			setOpenModal(false);
			resetForm();
		} catch {
			showError('Failed to save package');
		} finally {
			setIsSubmitting(false);
		}
	}, [form.amount, form.package_desc, form.package_id, form.package_name, isUpdate, packages, resetForm, showError, showSuccess, validateForm]);

	const handleDelete = useCallback(
		(pkg: PackageItem) => {
			Alert.alert('Delete Package', `Delete "${pkg.package_name}"?`, [
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
					onPress: () => {
						setPackages((prev) => prev.filter((item) => item.package_id !== pkg.package_id));
						showSuccess('Package deleted successfully');
					},
				},
			]);
		},
		[showSuccess],
	);

	const renderPackageRow = useCallback(
		({ item }: { item: PackageItem }) => (
			<View style={styles.packageCard}>
				<View style={styles.packageTopRow}>
					<View style={styles.packageTitleWrap}>
						<View style={styles.packageIconBubble}>
							<Ionicons name="cube-outline" size={18} color="#fff" />
						</View>
						<View style={styles.packageTitleStack}>
							<ThemedText style={styles.packageName}>{item.package_name}</ThemedText>
							<View style={[styles.stateChip, item.is_active ? styles.activeChip : styles.inactiveChip]}>
								<ThemedText style={[styles.stateChipText, item.is_active ? styles.activeChipText : styles.inactiveChipText]}>
									{item.is_active ? 'Active' : 'Inactive'}
								</ThemedText>
							</View>
						</View>
					</View>

					<View style={styles.amountBadge}>
						<ThemedText style={styles.amountText}>₹ {Number(item.amount).toLocaleString()}</ThemedText>
					</View>
				</View>

				<View style={styles.metaRow}>
					<View style={styles.metaPill}>
						<Ionicons name="pricetag-outline" size={12} color={palette.primary} />
						<ThemedText style={styles.metaText}>Package #{item.package_id}</ThemedText>
					</View>
					<View style={styles.metaPill}>
						<Ionicons name={item.is_active ? 'checkmark-circle-outline' : 'pause-circle-outline'} size={12} color={item.is_active ? '#166534' : '#92400e'} />
						<ThemedText style={[styles.metaText, item.is_active ? styles.activeMetaText : styles.inactiveMetaText]}>
							{item.is_active ? 'Visible in listing' : 'Hidden from listing'}
						</ThemedText>
					</View>
				</View>

				<Pressable
					style={({ pressed }) => [styles.detailsToggle, { opacity: pressed ? 0.82 : 1 }]}
					onPress={() => setExpandedPackageId((prev) => (prev === item.package_id ? null : item.package_id))}
				>
					<ThemedText style={styles.detailsToggleText}>
						{expandedPackageId === item.package_id ? 'Hide details' : 'View details'}
					</ThemedText>
					<Ionicons name={expandedPackageId === item.package_id ? 'chevron-up' : 'chevron-down'} size={16} color={palette.primary} />
				</Pressable>

				{expandedPackageId === item.package_id ? (
					<View style={styles.detailsBox}>
						<ThemedText style={styles.detailsLabel}>Description</ThemedText>
						<ThemedText style={styles.detailsText}>
							{item.package_desc || 'No description available for this package.'}
						</ThemedText>
					</View>
				) : null}

				<View style={styles.cardFooter}>
					<Pressable
						style={({ pressed }) => [
							styles.cardAction,
							styles.editButton,
							{ opacity: pressed ? 0.86 : 1 },
						]}
						onPress={() => openEdit(item)}
					>
						<Ionicons name="create-outline" size={16} color="#2563eb" />
						<ThemedText style={styles.editText}>Edit</ThemedText>
					</Pressable>
					<Pressable
						style={({ pressed }) => [
							styles.cardAction,
							styles.deleteButton,
							{ opacity: pressed ? 0.86 : 1 },
						]}
						onPress={() => handleDelete(item)}
					>
						<Ionicons name="trash-outline" size={16} color="#dc2626" />
						<ThemedText style={styles.deleteText}>Delete</ThemedText>
					</Pressable>
				</View>
			</View>
		),
		[handleDelete, openEdit, palette.primary, styles],
	);

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: palette.screenBg }}>
			<View style={styles.headerContainer}>
				<AppMenuDrawer />
				<View style={styles.headerCopy}>
					<ThemedText style={styles.headerTitle}>My Packages</ThemedText>
					<ThemedText style={styles.headerSubtitle}>Manage your service packages</ThemedText>
				</View>
				<Pressable style={({ pressed }) => [styles.createButton, { opacity: pressed ? 0.9 : 1 }]} onPress={openCreate}>
					<Ionicons name="add" size={18} color="#fff" />
					<ThemedText style={styles.createButtonText}>Create</ThemedText>
				</Pressable>
			</View>

			<ScrollView style={styles.screen} contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
				<FadeInView>
					<View style={styles.panel}>
						{loading ? (
							<View style={styles.centerState}>
								<ActivityIndicator size="large" color={palette.primary} />
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
								keyExtractor={(item) => String(item.package_id)}
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
									style={[styles.input, { borderColor: errors.package_name ? '#dc2626' : palette.border, color: palette.text }]}
									placeholder="Enter package name"
									placeholderTextColor={palette.muted}
									value={form.package_name}
									onChangeText={(value) => {
										setForm((prev) => ({ ...prev, package_name: value }));
										setErrors((prev) => ({ ...prev, package_name: '' }));
									}}
								/>
								{errors.package_name ? <ThemedText style={styles.errorText}>{errors.package_name}</ThemedText> : null}
							</View>

							<View style={styles.fieldGroup}>
								<ThemedText style={styles.label}>Description</ThemedText>
								<TextInput
									style={[styles.textArea, { borderColor: palette.border, color: palette.text }]}
									placeholder="Enter package description"
									placeholderTextColor={palette.muted}
									value={form.package_desc}
									onChangeText={(value) => setForm((prev) => ({ ...prev, package_desc: value }))}
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
							<Pressable style={({ pressed }) => [styles.secondaryButton, { backgroundColor: pressed ? palette.pressedBg : palette.elevatedBg }]} onPress={() => setOpenModal(false)} disabled={isSubmitting}>
								<ThemedText style={[styles.buttonText, { color: palette.primary }]}>Cancel</ThemedText>
							</Pressable>
							<Pressable style={({ pressed }) => [styles.primaryButton, { backgroundColor: pressed ? '#2f5b60' : palette.primary }]} onPress={handleSave} disabled={isSubmitting}>
								{isSubmitting ? <ActivityIndicator size="small" color="#fff" /> : <ThemedText style={[styles.buttonText, { color: '#fff' }]}>{isUpdate ? 'Update' : 'Save'}</ThemedText>}
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
			fontWeight: '700',
			color: palette.text,
		},
		headerSubtitle: {
			fontSize: 12,
			color: palette.muted,
			marginTop: 2,
		},
		createButton: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
			backgroundColor: palette.primary,
			paddingHorizontal: 14,
			paddingVertical: 10,
			borderRadius: 10,
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
		stateChip: {
			alignSelf: 'flex-start',
			paddingHorizontal: 10,
			paddingVertical: 5,
			borderRadius: 999,
		},
		activeChip: {
			backgroundColor: 'rgba(22, 101, 52, 0.12)',
		},
		inactiveChip: {
			backgroundColor: 'rgba(146, 64, 14, 0.12)',
		},
		stateChipText: {
			fontSize: 11,
			fontWeight: '700',
		},
		activeChipText: {
			color: '#166534',
		},
		inactiveChipText: {
			color: '#92400e',
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
		inactiveMetaText: {
			color: '#92400e',
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
		table: {
			minWidth: 760,
			flex: 1,
		},
		tableHeader: {
			flexDirection: 'row',
			backgroundColor: palette.primary,
			paddingVertical: 14,
			paddingHorizontal: 8,
		},
		tableHeaderText: {
			color: '#fff',
			fontSize: 13,
			fontWeight: '700',
		},
		tableRow: {
			flexDirection: 'row',
			alignItems: 'center',
			paddingHorizontal: 8,
			paddingVertical: 14,
		},
		rowSeparator: {
			height: 1,
			backgroundColor: palette.border,
			marginHorizontal: 12,
		},
		tableCell: {
			paddingHorizontal: 12,
		},
		nameCell: {
			width: 220,
		},
		descriptionCell: {
			width: 320,
		},
		amountCell: {
			width: 130,
		},
		actionsCell: {
			width: 160,
		},
		centerText: {
			textAlign: 'center',
		},
		packageNameWrap: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 8,
		},
		packageName: {
			fontSize: 14,
			fontWeight: '700',
			color: palette.text,
		},
		descriptionText: {
			fontSize: 13,
			color: palette.muted,
		},
		amountBadge: {
			backgroundColor: 'rgba(34, 197, 94, 0.12)',
			borderRadius: 999,
			paddingHorizontal: 12,
			paddingVertical: 7,
			alignSelf: 'flex-start',
		},
		amountText: {
			fontSize: 13,
			fontWeight: '700',
			color: '#166534',
		},
		actionsWrap: {
			flexDirection: 'row',
			justifyContent: 'center',
			gap: 10,
		},
		actionButton: {
			width: 38,
			height: 38,
			borderRadius: 10,
			alignItems: 'center',
			justifyContent: 'center',
		},
		editButton: {
			backgroundColor: 'rgba(37, 99, 235, 0.1)',
		},
		deleteButton: {
			backgroundColor: 'rgba(220, 38, 38, 0.1)',
		},
		modalOverlay: {
			flex: 1,
			backgroundColor: 'rgba(0,0,0,0.5)',
			justifyContent: 'center',
			padding: 16,
		},
		modalCard: {
			borderRadius: 18,
			maxHeight: '90%',
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
			fontWeight: '700',
			color: palette.text,
		},
		modalBody: {
			padding: 16,
			gap: 14,
		},
		fieldGroup: {
			gap: 6,
		},
		label: {
			fontSize: 13,
			fontWeight: '600',
			color: palette.text,
		},
		input: {
			borderWidth: 1,
			borderRadius: 10,
			paddingHorizontal: 12,
			paddingVertical: 12,
			fontSize: 14,
			backgroundColor: palette.screenBg,
		},
		textArea: {
			borderWidth: 1,
			borderRadius: 10,
			paddingHorizontal: 12,
			paddingVertical: 12,
			fontSize: 14,
			backgroundColor: palette.screenBg,
			textAlignVertical: 'top',
			minHeight: 110,
		},
		errorText: {
			fontSize: 12,
			color: '#dc2626',
		},
		modalActions: {
			flexDirection: 'row',
			gap: 12,
			padding: 16,
			borderTopWidth: 1,
			borderTopColor: palette.border,
		},
		primaryButton: {
			flex: 1,
			alignItems: 'center',
			justifyContent: 'center',
			paddingVertical: 12,
			borderRadius: 10,
		},
		secondaryButton: {
			flex: 1,
			alignItems: 'center',
			justifyContent: 'center',
			paddingVertical: 12,
			borderRadius: 10,
		},
		buttonText: {
			fontSize: 14,
			fontWeight: '700',
		},
	});
}