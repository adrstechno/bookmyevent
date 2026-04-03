import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
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
import AppMenuDrawer from '@/components/layout/AppMenuDrawer';
import { ThemedText } from '@/components/themed-text';
import { useAppToast } from '@/components/common/AppToastProvider';
import {
	createVendorShift,
	deleteVendorShift,
	fetchVendorShifts,
	updateVendorShift,
} from '@/services/vendor/vendorService';
import { useSettingsTheme } from '@/theme/settingsTheme';
import type { VendorShift } from '@/types/vendor';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const defaultForm = {
	shiftId: '',
	shiftName: '',
	startTime: '09:00',
	endTime: '12:00',
	daysOfWeek: [] as string[],
};

const timeToMinutes = (time: string) => {
	const [hours = '0', minutes = '0'] = time.split(':');
	return Number(hours) * 60 + Number(minutes);
};

const sameDays = (left: string[], right: string[]) => {
	if (left.length !== right.length) {
		return false;
	}
	const set = new Set(left);
	return right.every((item) => set.has(item));
};

export default function VendorShiftsScreen() {
	const { palette } = useSettingsTheme();
	const { showError, showSuccess } = useAppToast();

	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEdit, setIsEdit] = useState(false);
	const [search, setSearch] = useState('');
	const [sortAsc, setSortAsc] = useState(true);
	const [shifts, setShifts] = useState<VendorShift[]>([]);
	const [form, setForm] = useState(defaultForm);

	const loadShifts = useCallback(async () => {
		setIsLoading(true);
		try {
			const data = await fetchVendorShifts();
			setShifts(data);
		} catch (error) {
			const message =
				typeof error === 'object' && error && 'message' in error
					? String((error as { message?: string }).message)
					: 'Failed to load vendor shifts.';
			showError(message);
		} finally {
			setIsLoading(false);
		}
	}, [showError]);

	useEffect(() => {
		void loadShifts();
	}, [loadShifts]);

	const filteredShifts = useMemo(() => {
		const query = search.trim().toLowerCase();
		const result = shifts.filter((item) => {
			if (!query) {
				return true;
			}
			return (
				item.shiftName.toLowerCase().includes(query) ||
				item.daysOfWeek.join(' ').toLowerCase().includes(query)
			);
		});

		return result.sort((a, b) => {
			const aMinutes = timeToMinutes(a.startTime);
			const bMinutes = timeToMinutes(b.startTime);
			return sortAsc ? aMinutes - bMinutes : bMinutes - aMinutes;
		});
	}, [search, shifts, sortAsc]);

	const openCreate = () => {
		setForm(defaultForm);
		setIsEdit(false);
		setIsModalOpen(true);
	};

	const openEdit = (shift: VendorShift) => {
		setForm({
			shiftId: String(shift.shiftId),
			shiftName: shift.shiftName,
			startTime: shift.startTime,
			endTime: shift.endTime,
			daysOfWeek: [...shift.daysOfWeek],
		});
		setIsEdit(true);
		setIsModalOpen(true);
	};

	const toggleDay = (day: string) => {
		setForm((prev) => ({
			...prev,
			daysOfWeek: prev.daysOfWeek.includes(day)
				? prev.daysOfWeek.filter((item) => item !== day)
				: [...prev.daysOfWeek, day],
		}));
	};

	const saveShift = async () => {
		if (!form.shiftName.trim()) {
			showError('Shift name is required.');
			return;
		}

		if (form.daysOfWeek.length === 0) {
			showError('Select at least one weekday.');
			return;
		}

		if (timeToMinutes(form.startTime) >= timeToMinutes(form.endTime)) {
			showError('Start time must be before end time.');
			return;
		}

		const duplicate = shifts.find((item) => {
			if (isEdit && String(item.shiftId) === form.shiftId) {
				return false;
			}

			return (
				item.shiftName.trim().toLowerCase() === form.shiftName.trim().toLowerCase() &&
				item.startTime === form.startTime &&
				item.endTime === form.endTime &&
				sameDays(item.daysOfWeek, form.daysOfWeek)
			);
		});

		if (duplicate) {
			showError('This shift already exists.');
			return;
		}

		setIsSaving(true);
		try {
			if (isEdit) {
				await updateVendorShift({
					shiftId: form.shiftId,
					shiftName: form.shiftName.trim(),
					startTime: form.startTime,
					endTime: form.endTime,
					daysOfWeek: form.daysOfWeek,
				});
				showSuccess('Shift updated successfully.');
			} else {
				await createVendorShift({
					shiftName: form.shiftName.trim(),
					startTime: form.startTime,
					endTime: form.endTime,
					daysOfWeek: form.daysOfWeek,
				});
				showSuccess('Shift created successfully.');
			}

			setIsModalOpen(false);
			await loadShifts();
		} catch (error) {
			const message =
				typeof error === 'object' && error && 'message' in error
					? String((error as { message?: string }).message)
					: 'Failed to save shift.';
			showError(message);
		} finally {
			setIsSaving(false);
		}
	};

	const removeShift = async (shiftId: string) => {
		setIsDeletingId(shiftId);
		try {
			await deleteVendorShift(shiftId);
			showSuccess('Shift deleted.');
			await loadShifts();
		} catch (error) {
			const message =
				typeof error === 'object' && error && 'message' in error
					? String((error as { message?: string }).message)
					: 'Failed to delete shift.';
			showError(message);
		} finally {
			setIsDeletingId(null);
		}
	};

	if (isLoading) {
		return <PageLoadingState text="Loading vendor shifts..." />;
	}

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: palette.screenBg }]} edges={['top']}>
			<View style={styles.container}>
				<View style={[styles.appBar, { backgroundColor: palette.primary, borderColor: palette.primaryStrong }]}>
					<AppMenuDrawer />
					<ThemedText style={[styles.appBarTitle, { color: palette.onPrimary }]}>Vendor Shifts</ThemedText>
					<Pressable style={[styles.iconBtn, { borderColor: palette.primaryStrong, backgroundColor: palette.primaryStrong }]} onPress={() => setSortAsc((prev) => !prev)}>
						<Ionicons name={sortAsc ? 'arrow-up-outline' : 'arrow-down-outline'} size={18} color={palette.onPrimary} />
					</Pressable>
				</View>

				<View style={[styles.toolbar, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
					<View style={[styles.searchWrap, { borderColor: palette.border, backgroundColor: palette.headerBtnBg }]}>
						<Ionicons name="search-outline" size={16} color={palette.subtext} />
						<TextInput
							style={[styles.searchInput, { color: palette.text }]}
							placeholder="Search by name or days"
							placeholderTextColor={palette.muted}
							value={search}
							onChangeText={setSearch}
						/>
					</View>
					<Pressable style={[styles.addBtn, { backgroundColor: palette.accent }]} onPress={openCreate}>
						<Ionicons name="add" size={18} color={palette.text} />
						<ThemedText style={[styles.addBtnText, { color: palette.text }]}>Add Shift</ThemedText>
					</Pressable>
				</View>

				<ScrollView contentContainerStyle={styles.listWrap}>
					{filteredShifts.length === 0 ? (
						<ThemedText style={[styles.emptyText, { color: palette.subtext }]}>No vendor shifts found.</ThemedText>
					) : (
						filteredShifts.map((shift, index) => (
							<FadeInView key={String(shift.shiftId)} delay={index * 30}>
								<View style={[styles.shiftCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
									<View style={styles.shiftTop}>
										<ThemedText style={[styles.shiftTitle, { color: palette.text }]}>{shift.shiftName}</ThemedText>
										<ThemedText style={[styles.shiftTime, { color: palette.primary }]}>{shift.startTime} - {shift.endTime}</ThemedText>
									</View>
									<ThemedText style={[styles.shiftDays, { color: palette.subtext }]}>{shift.daysOfWeek.join(', ')}</ThemedText>

									<View style={styles.actionsRow}>
										<Pressable style={[styles.actionBtn, { borderColor: palette.border, backgroundColor: palette.headerBtnBg }]} onPress={() => openEdit(shift)}>
											<Ionicons name="create-outline" size={16} color={palette.text} />
											<ThemedText style={[styles.actionBtnText, { color: palette.text }]}>Edit</ThemedText>
										</Pressable>
										<Pressable
											style={[styles.actionBtn, { borderColor: palette.dangerBorder, backgroundColor: palette.dangerSoft }]}
											onPress={() => void removeShift(String(shift.shiftId))}
											disabled={isDeletingId === String(shift.shiftId)}
										>
											<Ionicons name="trash-outline" size={16} color={palette.danger} />
											<ThemedText style={[styles.actionBtnText, { color: palette.danger }]}>{isDeletingId === String(shift.shiftId) ? 'Deleting...' : 'Delete'}</ThemedText>
										</Pressable>
									</View>
								</View>
							</FadeInView>
						))
					)}
				</ScrollView>
			</View>

			<Modal visible={isModalOpen} animationType="slide" transparent onRequestClose={() => setIsModalOpen(false)}>
				<View style={[styles.modalOverlay, { backgroundColor: palette.overlay }]}>
					<View style={[styles.modalCard, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}> 
						<ThemedText style={[styles.modalTitle, { color: palette.text }]}>{isEdit ? 'Edit Shift' : 'Add Shift'}</ThemedText>

						<TextInput
							style={[styles.input, { color: palette.text, borderColor: palette.border, backgroundColor: palette.headerBtnBg }]}
							placeholder="Shift Name"
							placeholderTextColor={palette.muted}
							value={form.shiftName}
							onChangeText={(value) => setForm((prev) => ({ ...prev, shiftName: value }))}
						/>

						<View style={styles.timeRow}>
							<TextInput
								style={[styles.input, styles.halfInput, { color: palette.text, borderColor: palette.border, backgroundColor: palette.headerBtnBg }]}
								placeholder="Start HH:MM"
								placeholderTextColor={palette.muted}
								value={form.startTime}
								onChangeText={(value) => setForm((prev) => ({ ...prev, startTime: value }))}
							/>
							<TextInput
								style={[styles.input, styles.halfInput, { color: palette.text, borderColor: palette.border, backgroundColor: palette.headerBtnBg }]}
								placeholder="End HH:MM"
								placeholderTextColor={palette.muted}
								value={form.endTime}
								onChangeText={(value) => setForm((prev) => ({ ...prev, endTime: value }))}
							/>
						</View>

						<ThemedText style={[styles.weekdayLabel, { color: palette.subtext }]}>Days of Week</ThemedText>
						<View style={styles.daysWrap}>
							{WEEKDAYS.map((day) => {
								const active = form.daysOfWeek.includes(day);
								return (
									<Pressable
										key={day}
										style={[
											styles.dayChip,
											{ borderColor: active ? palette.primary : palette.border, backgroundColor: active ? palette.pressedBg : palette.headerBtnBg },
										]}
										onPress={() => toggleDay(day)}
									>
										<ThemedText style={[styles.dayChipText, { color: active ? palette.primary : palette.subtext }]}>{day.slice(0, 3)}</ThemedText>
									</Pressable>
								);
							})}
						</View>

						<View style={styles.modalActions}>
							<Pressable style={[styles.modalBtn, { borderColor: palette.border, backgroundColor: palette.headerBtnBg }]} onPress={() => setIsModalOpen(false)}>
								<ThemedText style={[styles.modalBtnText, { color: palette.text }]}>Cancel</ThemedText>
							</Pressable>
							<Pressable style={[styles.modalBtn, { backgroundColor: palette.primary }]} onPress={() => void saveShift()} disabled={isSaving}>
								<ThemedText style={[styles.modalBtnText, { color: palette.onPrimary }]}>{isSaving ? 'Saving...' : isEdit ? 'Update Shift' : 'Create Shift'}</ThemedText>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	container: {
		flex: 1,
		padding: 16,
		gap: 10,
	},
	appBar: {
		height: 56,
		borderRadius: 14,
		paddingHorizontal: 12,
		borderWidth: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	appBarTitle: {
		fontSize: 16,
		fontWeight: '800',
	},
	iconBtn: {
		width: 36,
		height: 36,
		borderRadius: 18,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	toolbar: {
		borderRadius: 12,
		borderWidth: 1,
		padding: 10,
		gap: 10,
	},
	searchWrap: {
		height: 40,
		borderRadius: 10,
		paddingHorizontal: 10,
		borderWidth: 1,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	searchInput: {
		flex: 1,
		fontSize: 14,
	},
	addBtn: {
		height: 42,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		gap: 6,
	},
	addBtnText: {
		fontSize: 14,
		fontWeight: '700',
	},
	listWrap: {
		gap: 10,
		paddingBottom: 24,
	},
	emptyText: {
		fontSize: 14,
		textAlign: 'center',
		marginTop: 28,
	},
	shiftCard: {
		borderRadius: 12,
		borderWidth: 1,
		padding: 12,
		gap: 8,
	},
	shiftTop: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 8,
	},
	shiftTitle: {
		fontSize: 16,
		fontWeight: '800',
		flex: 1,
	},
	shiftTime: {
		fontSize: 13,
		fontWeight: '700',
	},
	shiftDays: {
		fontSize: 13,
		lineHeight: 19,
	},
	actionsRow: {
		flexDirection: 'row',
		gap: 8,
	},
	actionBtn: {
		flex: 1,
		height: 38,
		borderRadius: 10,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		gap: 6,
	},
	actionBtnText: {
		fontSize: 13,
		fontWeight: '700',
	},
	modalOverlay: {
		flex: 1,
		justifyContent: 'center',
		padding: 16,
	},
	modalCard: {
		borderRadius: 14,
		borderWidth: 1,
		padding: 14,
		gap: 10,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: '800',
	},
	input: {
		height: 42,
		borderRadius: 10,
		borderWidth: 1,
		paddingHorizontal: 12,
		fontSize: 14,
	},
	timeRow: {
		flexDirection: 'row',
		gap: 8,
	},
	halfInput: {
		flex: 1,
	},
	weekdayLabel: {
		fontSize: 13,
		fontWeight: '700',
	},
	daysWrap: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	dayChip: {
		height: 34,
		paddingHorizontal: 10,
		borderRadius: 17,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	dayChipText: {
		fontSize: 12,
		fontWeight: '700',
	},
	modalActions: {
		flexDirection: 'row',
		gap: 8,
		marginTop: 4,
	},
	modalBtn: {
		flex: 1,
		height: 40,
		borderRadius: 10,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	modalBtnText: {
		fontSize: 14,
		fontWeight: '700',
	},
});
