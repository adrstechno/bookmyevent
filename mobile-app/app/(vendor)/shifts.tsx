import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	ActivityIndicator,
	Modal,
	Platform,
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppToast } from '@/components/common/AppToastProvider';
import VendorAppBar from '@/components/vendor/VendorAppBar';
import { useSettingsTheme } from '@/theme/settingsTheme';
import {
	createShift,
	deleteShift,
	fetchShifts,
	updateShift,
	type VendorShift,
} from '@/services/vendor/shiftService';

// ─── Constants ────────────────────────────────────────────────

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const EMPTY_FORM = {
	shiftId: '',
	shiftName: '',
	startTime: '09:00',
	endTime: '18:00',
	daysOfWeek: [] as string[],
};

// ─── Helpers ─────────────────────────────────────────────────

const toMin = (t: string) => {
	const [h = '0', m = '0'] = t.split(':');
	return Number(h) * 60 + Number(m);
};

const isValidTime = (t: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);

const sameDays = (a: string[], b: string[]) => {
	if (a.length !== b.length) return false;
	const s = new Set(a);
	return b.every((d) => s.has(d));
};

// ─── Screen ───────────────────────────────────────────────────

export default function VendorShiftsScreen() {
	const { palette } = useSettingsTheme();
	const { showError, showSuccess } = useAppToast();

	const [shifts, setShifts] = useState<VendorShift[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const [search, setSearch] = useState('');
	const [sortAsc, setSortAsc] = useState(true);

	const [modalOpen, setModalOpen] = useState(false);
	const [isEdit, setIsEdit] = useState(false);
	const [form, setForm] = useState({ ...EMPTY_FORM });

	const [deleteTarget, setDeleteTarget] = useState<VendorShift | null>(null);

	// ── Fetch ──────────────────────────────────────────────────

	const loadShifts = useCallback(async (silent = false) => {
		if (!silent) setIsLoading(true);
		try {
			const data = await fetchShifts();
			setShifts(data);
		} catch (err: unknown) {
			const msg = err && typeof err === 'object' && 'message' in err
				? String((err as { message: unknown }).message)
				: 'Failed to load shifts.';
			showError(msg);
		} finally {
			setIsLoading(false);
			setIsRefreshing(false);
		}
	}, [showError]);

	useEffect(() => { void loadShifts(); }, [loadShifts]);

	const onRefresh = () => {
		setIsRefreshing(true);
		void loadShifts(true);
	};

	// ── Filtered + sorted list ─────────────────────────────────

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return shifts
			.filter((s) =>
				!q ||
				s.shiftName.toLowerCase().includes(q) ||
				s.daysOfWeek.join(' ').toLowerCase().includes(q)
			)
			.sort((a, b) =>
				sortAsc
					? toMin(a.startTime) - toMin(b.startTime)
					: toMin(b.startTime) - toMin(a.startTime)
			);
	}, [shifts, search, sortAsc]);

	// ── Modal helpers ──────────────────────────────────────────

	const openCreate = () => {
		setForm({ ...EMPTY_FORM });
		setIsEdit(false);
		setModalOpen(true);
	};

	const openEdit = (s: VendorShift) => {
		setForm({
			shiftId: s.shiftId,
			shiftName: s.shiftName,
			startTime: s.startTime,
			endTime: s.endTime,
			daysOfWeek: [...s.daysOfWeek],
		});
		setIsEdit(true);
		setModalOpen(true);
	};

	const toggleDay = (day: string) =>
		setForm((p) => ({
			...p,
			daysOfWeek: p.daysOfWeek.includes(day)
				? p.daysOfWeek.filter((d) => d !== day)
				: [...p.daysOfWeek, day],
		}));

	// ── Save (create / update) ─────────────────────────────────

	const saveShift = async () => {
		// Validation
		if (!form.shiftName.trim()) { showError('Shift name is required.'); return; }
		if (!form.daysOfWeek.length) { showError('Select at least one day.'); return; }
		if (!isValidTime(form.startTime)) { showError('Start time must be HH:MM (e.g. 09:00).'); return; }
		if (!isValidTime(form.endTime)) { showError('End time must be HH:MM (e.g. 18:00).'); return; }
		if (toMin(form.startTime) >= toMin(form.endTime)) {
			showError('Start time must be before end time.');
			return;
		}

		// Client-side duplicate guard
		const dup = shifts.find((s) => {
			if (isEdit && s.shiftId === form.shiftId) return false;
			return (
				s.shiftName.trim().toLowerCase() === form.shiftName.trim().toLowerCase() &&
				s.startTime === form.startTime &&
				s.endTime === form.endTime &&
				sameDays(s.daysOfWeek, form.daysOfWeek)
			);
		});
		if (dup) { showError('This shift already exists.'); return; }

		setIsSaving(true);
		try {
			if (isEdit) {
				await updateShift({
					shiftId: form.shiftId,
					shiftName: form.shiftName,
					startTime: form.startTime,
					endTime: form.endTime,
					daysOfWeek: form.daysOfWeek,
				});
				showSuccess('Shift updated.');
			} else {
				await createShift({
					shiftName: form.shiftName,
					startTime: form.startTime,
					endTime: form.endTime,
					daysOfWeek: form.daysOfWeek,
				});
				showSuccess('Shift added.');
			}
			setModalOpen(false);
			void loadShifts(true); // refresh list from server
		} catch (err: unknown) {
			const raw = err as { status?: number; message?: string } | null;
			if (raw?.status === 409 || raw?.message?.toLowerCase().includes('already')) {
				showError('Shift already exists.');
			} else if (raw?.status && raw.status >= 500) {
				showError('Server error. Please try again.');
			} else {
				showError(raw?.message ?? 'Failed to save shift.');
			}
		} finally {
			setIsSaving(false);
		}
	};

	// ── Delete ─────────────────────────────────────────────────

	const doDelete = async () => {
		if (!deleteTarget) return;
		const target = deleteTarget;
		setDeleteTarget(null);
		setDeletingId(target.shiftId);
		try {
			await deleteShift(target.shiftId);
			setShifts((p) => p.filter((s) => s.shiftId !== target.shiftId));
			showSuccess('Shift deleted.');
		} catch (err: unknown) {
			const msg = err && typeof err === 'object' && 'message' in err
				? String((err as { message: unknown }).message)
				: 'Failed to delete shift.';
			showError(msg);
		} finally {
			setDeletingId(null);
		}
	};

	// ── Render ─────────────────────────────────────────────────

	const c = palette;

	if (isLoading) {
		return (
			<SafeAreaView style={[st.safe, { backgroundColor: c.screenBg }]} edges={['top']}>
				<VendorAppBar title="My Shifts" />
				<View style={st.center}>
					<ActivityIndicator size="large" color={c.primary} />
					<Text style={[st.loadingText, { color: c.muted }]}>Loading shifts...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={[st.safe, { backgroundColor: c.screenBg }]} edges={['top']}>

			{/* Blur overlay for modals */}
			{(modalOpen || !!deleteTarget) && (
				<BlurView
					intensity={Platform.OS === 'android' ? 20 : 60}
					tint="dark"
					style={StyleSheet.absoluteFill}
					pointerEvents="none"
				/>
			)}

			<VendorAppBar
				title="My Shifts"
				actionIcon={sortAsc ? 'arrow-up-outline' : 'arrow-down-outline'}
				onAction={() => setSortAsc((p) => !p)}
			/>

			{/* Toolbar */}
			<View style={st.toolbar}>
				<View style={[st.searchBox, { borderColor: c.border, backgroundColor: c.elevatedBg }]}>
					<Feather name="search" size={15} color={c.subtext} />
					<TextInput
						style={[st.searchInput, { color: c.text }]}
						placeholder="Search by name or days"
						placeholderTextColor={c.muted}
						value={search}
						onChangeText={setSearch}
					/>
					{search.length > 0 && (
						<Pressable onPress={() => setSearch('')} hitSlop={8}>
							<Feather name="x-circle" size={15} color={c.muted} />
						</Pressable>
					)}
				</View>
				<Pressable style={[st.addBtn, { backgroundColor: c.primary }]} onPress={openCreate}>
					<Feather name="plus" size={18} color="#fff" />
					<Text style={st.addBtnText}>Add</Text>
				</Pressable>
			</View>

			{/* Meta row */}
			<View style={st.metaRow}>
				<Text style={[st.metaText, { color: c.muted }]}>
					Sorted by start time · {sortAsc ? 'earliest first' : 'latest first'}
				</Text>
				<Text style={[st.metaText, { color: c.muted }]}>
					{filtered.length} shift{filtered.length !== 1 ? 's' : ''}
				</Text>
			</View>

			{/* List */}
			<ScrollView
				contentContainerStyle={st.list}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={isRefreshing}
						onRefresh={onRefresh}
						tintColor={c.primary}
						colors={[c.primary]}
					/>
				}
			>
				{filtered.length === 0 ? (
					<View style={[st.emptyBox, { backgroundColor: c.surfaceBg, borderColor: c.border }]}>
						<Feather name="clock" size={48} color={c.border} />
						<Text style={[st.emptyTitle, { color: c.text }]}>No Shifts Found</Text>
						<Text style={[st.emptyBody, { color: c.subtext }]}>
							{search
								? 'No shifts match your search.'
								: "You haven't added any shifts yet.\nTap 'Add' to get started."}
						</Text>
					</View>
				) : (
					filtered.map((shift) => (
						<ShiftCard
							key={shift.shiftId}
							shift={shift}
							palette={c}
							isDeleting={deletingId === shift.shiftId}
							onEdit={() => openEdit(shift)}
							onDelete={() => setDeleteTarget(shift)}
						/>
					))
				)}
			</ScrollView>

			{/* ── Add / Edit Modal ── */}
			<Modal
				visible={modalOpen}
				animationType="slide"
				transparent
				onRequestClose={() => setModalOpen(false)}
			>
				<BlurView
					intensity={Platform.OS === 'android' ? 40 : 90}
					tint="dark"
					style={st.modalOverlay}
				>
					<Pressable style={StyleSheet.absoluteFill} onPress={() => setModalOpen(false)} />
					<View style={[st.sheet, { backgroundColor: c.surfaceBg }]}>

						{/* Header */}
						<View style={[st.sheetHeader, { borderBottomColor: c.border }]}>
							<Pressable
								style={[st.backBtn, { borderColor: c.border, backgroundColor: c.elevatedBg }]}
								onPress={() => setModalOpen(false)}
							>
								<Feather name="arrow-left" size={18} color={c.primary} />
							</Pressable>
							<Text style={[st.sheetTitle, { color: c.text }]}>
								{isEdit ? 'Edit Shift' : 'Add Shift'}
							</Text>
						</View>

						<ScrollView contentContainerStyle={st.sheetBody} showsVerticalScrollIndicator={false}>

							{/* Shift Name */}
							<View style={st.field}>
								<Text style={[st.fieldLabel, { color: c.text }]}>Shift Name</Text>
								<TextInput
									style={[st.input, { color: c.text, borderColor: c.border, backgroundColor: c.elevatedBg }]}
									placeholder="e.g. Morning Setup"
									placeholderTextColor={c.muted}
									value={form.shiftName}
									onChangeText={(v) => setForm((p) => ({ ...p, shiftName: v }))}
								/>
							</View>

							{/* Time row */}
							<View style={st.timeRow}>
								<View style={[st.field, { flex: 1 }]}>
									<Text style={[st.fieldLabel, { color: c.text }]}>Start Time</Text>
									<TextInput
										style={[st.input, { color: c.text, borderColor: c.border, backgroundColor: c.elevatedBg }]}
										placeholder="09:00"
										placeholderTextColor={c.muted}
										value={form.startTime}
										onChangeText={(v) => setForm((p) => ({ ...p, startTime: v }))}
										keyboardType="numbers-and-punctuation"
										maxLength={5}
									/>
								</View>
								<View style={[st.field, { flex: 1 }]}>
									<Text style={[st.fieldLabel, { color: c.text }]}>End Time</Text>
									<TextInput
										style={[st.input, { color: c.text, borderColor: c.border, backgroundColor: c.elevatedBg }]}
										placeholder="18:00"
										placeholderTextColor={c.muted}
										value={form.endTime}
										onChangeText={(v) => setForm((p) => ({ ...p, endTime: v }))}
										keyboardType="numbers-and-punctuation"
										maxLength={5}
									/>
								</View>
							</View>

							{/* Days */}
							<View style={st.field}>
								<Text style={[st.fieldLabel, { color: c.text }]}>Days of Week</Text>
								<View style={st.daysGrid}>
									{WEEKDAYS.map((day) => {
										const active = form.daysOfWeek.includes(day);
										return (
											<Pressable
												key={day}
												style={[
													st.dayChip,
													{
														borderColor: active ? c.primary : c.border,
														backgroundColor: active ? c.primary : c.elevatedBg,
													},
												]}
												onPress={() => toggleDay(day)}
											>
												<Feather
													name={active ? 'check-square' : 'square'}
													size={14}
													color={active ? '#fff' : c.muted}
												/>
												<Text style={[st.dayChipText, { color: active ? '#fff' : c.subtext }]}>
													{day}
												</Text>
											</Pressable>
										);
									})}
								</View>
							</View>

							{/* Actions */}
							<View style={st.sheetActions}>
								<Pressable
									style={[st.sheetBtn, { backgroundColor: c.elevatedBg, borderColor: c.border }]}
									onPress={() => setModalOpen(false)}
								>
									<Text style={[st.sheetBtnText, { color: c.text }]}>Cancel</Text>
								</Pressable>
								<Pressable
									style={[st.sheetBtn, { backgroundColor: c.primary, opacity: isSaving ? 0.65 : 1 }]}
									onPress={() => void saveShift()}
									disabled={isSaving}
								>
									{isSaving
										? <ActivityIndicator size="small" color="#fff" />
										: <Text style={[st.sheetBtnText, { color: '#fff' }]}>
											{isEdit ? 'Update' : 'Save'}
										</Text>
									}
								</Pressable>
							</View>

						</ScrollView>
					</View>
				</BlurView>
			</Modal>

			{/* ── Delete Confirm Modal ── */}
			<Modal
				visible={!!deleteTarget}
				transparent
				animationType="fade"
				onRequestClose={() => setDeleteTarget(null)}
			>
				<View style={st.confirmOverlay}>
					<View style={[st.confirmBox, { backgroundColor: c.surfaceBg }]}>
						<Feather name="trash-2" size={36} color="#ef4444" style={{ alignSelf: 'center' }} />
						<Text style={[st.confirmTitle, { color: c.text }]}>Delete Shift</Text>
						<Text style={[st.confirmBody, { color: c.subtext }]}>
							Are you sure you want to delete{' '}
							<Text style={{ fontWeight: '700', color: c.text }}>"{deleteTarget?.shiftName}"</Text>?
							{'\n'}This cannot be undone.
						</Text>
						<View style={st.confirmBtns}>
							<Pressable
								style={[st.sheetBtn, { backgroundColor: c.elevatedBg, borderColor: c.border }]}
								onPress={() => setDeleteTarget(null)}
							>
								<Text style={[st.sheetBtnText, { color: c.text }]}>Cancel</Text>
							</Pressable>
							<Pressable
								style={[st.sheetBtn, { backgroundColor: '#ef4444' }]}
								onPress={() => void doDelete()}
							>
								<Text style={[st.sheetBtnText, { color: '#fff' }]}>Delete</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>

		</SafeAreaView>
	);
}

// ─── ShiftCard ────────────────────────────────────────────────

function ShiftCard({
	shift, palette, isDeleting, onEdit, onDelete,
}: {
	shift: VendorShift;
	palette: ReturnType<typeof useSettingsTheme>['palette'];
	isDeleting: boolean;
	onEdit: () => void;
	onDelete: () => void;
}) {
	const c = palette;
	return (
		<View style={[st.card, { backgroundColor: c.surfaceBg, borderColor: c.border, borderLeftColor: c.primary }]}>
			<View style={st.cardTop}>
				<View style={{ flex: 1 }}>
					<Text style={[st.cardName, { color: c.text }]}>{shift.shiftName}</Text>
					<View style={st.cardTimeRow}>
						<Feather name="clock" size={13} color={c.primary} />
						<Text style={[st.cardTime, { color: c.primary }]}>
							{shift.startTime} – {shift.endTime}
						</Text>
					</View>
				</View>
				<View style={st.cardActions}>
					<Pressable
						style={[st.cardBtn, { backgroundColor: c.elevatedBg, borderColor: c.border }]}
						onPress={onEdit}
					>
						<Feather name="edit-2" size={15} color={c.primary} />
					</Pressable>
					<Pressable
						style={[st.cardBtn, { backgroundColor: '#fee2e2', borderColor: '#fca5a5' }]}
						onPress={onDelete}
						disabled={isDeleting}
					>
						{isDeleting
							? <ActivityIndicator size="small" color="#ef4444" />
							: <Feather name="trash-2" size={15} color="#ef4444" />
						}
					</Pressable>
				</View>
			</View>

			{/* Day pills */}
			<View style={st.dayPills}>
				{shift.daysOfWeek.map((day) => (
					<View
						key={day}
						style={[st.dayPill, { backgroundColor: c.elevatedBg, borderColor: c.border }]}
					>
						<Text style={[st.dayPillText, { color: c.primary }]}>{day.slice(0, 3)}</Text>
					</View>
				))}
			</View>
		</View>
	);
}

// ─── Styles ───────────────────────────────────────────────────

const st = StyleSheet.create({
	safe: { flex: 1 },
	center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
	loadingText: { fontSize: 14, fontWeight: '600' },

	toolbar: {
		flexDirection: 'row', alignItems: 'center', gap: 10,
		paddingHorizontal: 16, paddingTop: 12,
	},
	searchBox: {
		flex: 1, height: 42, borderRadius: 10, paddingHorizontal: 10,
		borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
	},
	searchInput: { flex: 1, fontSize: 14 },
	addBtn: {
		height: 42, paddingHorizontal: 14, borderRadius: 10,
		flexDirection: 'row', alignItems: 'center', gap: 6,
	},
	addBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

	metaRow: {
		flexDirection: 'row', justifyContent: 'space-between',
		paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4,
	},
	metaText: { fontSize: 12 },

	list: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 32, gap: 12 },

	emptyBox: {
		borderRadius: 16, borderWidth: 1, padding: 40,
		alignItems: 'center', gap: 10, marginTop: 20,
	},
	emptyTitle: { fontSize: 18, fontWeight: '800' },
	emptyBody: { fontSize: 13, textAlign: 'center', lineHeight: 20 },

	// Card
	card: {
		borderRadius: 14, borderWidth: 1, borderLeftWidth: 4,
		padding: 14, gap: 10,
	},
	cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
	cardName: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
	cardTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
	cardTime: { fontSize: 13, fontWeight: '700' },
	cardActions: { flexDirection: 'row', gap: 8 },
	cardBtn: {
		width: 36, height: 36, borderRadius: 8, borderWidth: 1,
		alignItems: 'center', justifyContent: 'center',
	},
	dayPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
	dayPill: {
		paddingHorizontal: 10, paddingVertical: 4,
		borderRadius: 20, borderWidth: 1,
	},
	dayPillText: { fontSize: 12, fontWeight: '700' },

	// Modal sheet
	modalOverlay: { flex: 1, justifyContent: 'flex-end' },
	sheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: '92%', overflow: 'hidden' },
	sheetHeader: {
		flexDirection: 'row', alignItems: 'center', gap: 12,
		padding: 16, borderBottomWidth: 1,
	},
	backBtn: {
		width: 36, height: 36, borderRadius: 18, borderWidth: 1,
		alignItems: 'center', justifyContent: 'center',
	},
	sheetTitle: { fontSize: 18, fontWeight: '800' },
	sheetBody: { padding: 16, gap: 16, paddingBottom: 36 },

	field: { gap: 6 },
	fieldLabel: { fontSize: 13, fontWeight: '700' },
	input: { height: 46, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 14 },
	timeRow: { flexDirection: 'row', gap: 12 },

	daysGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
	dayChip: {
		flexDirection: 'row', alignItems: 'center', gap: 6,
		paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1,
	},
	dayChipText: { fontSize: 13, fontWeight: '600' },

	sheetActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
	sheetBtn: {
		flex: 1, height: 46, borderRadius: 12, borderWidth: 1,
		borderColor: 'transparent', alignItems: 'center', justifyContent: 'center',
	},
	sheetBtnText: { fontSize: 14, fontWeight: '700' },

	// Delete confirm
	confirmOverlay: {
		flex: 1, justifyContent: 'center', padding: 24,
		backgroundColor: 'rgba(0,0,0,0.4)',
	},
	confirmBox: { borderRadius: 18, padding: 24, gap: 12 },
	confirmTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
	confirmBody: { fontSize: 14, lineHeight: 22, textAlign: 'center' },
	confirmBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
});
