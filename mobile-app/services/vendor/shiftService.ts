/**
 * shiftService.ts
 * Vendor shift CRUD — wired to localhost:3232
 *
 * Endpoints (all under /Vendor):
 *   GET  /Vendor/getVendorShiftforVendor   → fetch all shifts for logged-in vendor
 *   POST /Vendor/AddvendorShifts           → create shift  (URLSearchParams)
 *   POST /Vendor/updateVendorShiftbyId     → update shift  (URLSearchParams)
 *   GET  /Vendor/deleteVendorShiftbyId     → delete shift  (?shift_id=X)
 */
import apiClient from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';

// ─── Types ────────────────────────────────────────────────────

export type VendorShift = {
	shiftId: string;
	shiftName: string;
	startTime: string; // HH:MM
	endTime: string;   // HH:MM
	daysOfWeek: string[];
};

// ─── Helpers ─────────────────────────────────────────────────

/** Backend stores days_of_week as JSON string OR comma-separated OR array */
const parseDays = (value: unknown): string[] => {
	if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string');
	if (typeof value === 'string') {
		const t = value.trim();
		if (!t) return [];
		if (t.startsWith('[')) {
			try { return JSON.parse(t); } catch { /* fall through */ }
		}
		return t.split(',').map((d) => d.trim()).filter(Boolean);
	}
	return [];
};

/** Slice HH:MM:SS → HH:MM */
const sliceTime = (t: unknown): string =>
	typeof t === 'string' ? t.slice(0, 5) : '00:00';

/** Map raw DB row → VendorShift */
const mapRow = (row: Record<string, unknown>): VendorShift => ({
	shiftId: String(row.shift_id ?? row.id ?? ''),
	shiftName: String(row.shift_name ?? ''),
	startTime: sliceTime(row.start_time),
	endTime: sliceTime(row.end_time),
	daysOfWeek: parseDays(row.days_of_week),
});

// ─── API calls ────────────────────────────────────────────────

/** Fetch all shifts for the logged-in vendor */
export const fetchShifts = async (): Promise<VendorShift[]> => {
	const res = await apiClient.get(API_ENDPOINTS.vendor.shifts);
	const d = res.data as Record<string, unknown>;
	// Backend returns: { shifts: [...] } or { data: [...] } or []
	const rows = Array.isArray(d)
		? d
		: Array.isArray(d.shifts)
		? (d.shifts as Record<string, unknown>[])
		: Array.isArray(d.data)
		? (d.data as Record<string, unknown>[])
		: [];
	return rows.map(mapRow);
};

/** Create a new shift */
export const createShift = async (input: {
	shiftName: string;
	startTime: string; // HH:MM
	endTime: string;   // HH:MM
	daysOfWeek: string[];
}): Promise<void> => {
	const body = new URLSearchParams();
	body.append('shift_name', input.shiftName.trim());
	body.append('start_time', `${input.startTime}:00`);   // backend expects HH:MM:SS
	body.append('end_time', `${input.endTime}:00`);
	body.append('days_of_week', JSON.stringify(input.daysOfWeek));

	await apiClient.post(API_ENDPOINTS.vendor.createShift, body, {
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	});
};

/** Update an existing shift */
export const updateShift = async (input: {
	shiftId: string;
	shiftName: string;
	startTime: string;
	endTime: string;
	daysOfWeek: string[];
}): Promise<void> => {
	const body = new URLSearchParams();
	body.append('shift_id', input.shiftId);
	body.append('shift_name', input.shiftName.trim());
	body.append('start_time', `${input.startTime}:00`);
	body.append('end_time', `${input.endTime}:00`);
	body.append('days_of_week', JSON.stringify(input.daysOfWeek));

	await apiClient.post(API_ENDPOINTS.vendor.updateShift, body, {
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	});
};

/** Delete a shift by ID */
export const deleteShift = async (shiftId: string): Promise<void> => {
	await apiClient.get(API_ENDPOINTS.vendor.deleteShift, {
		params: { shift_id: shiftId },
	});
};
