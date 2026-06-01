/**
 * reservationService.ts
 * Manual shift reservations — mirrors VendorManualReservations (Frontend)
 *
 * Endpoints:
 *   GET  /manual-reservations/vendor/:vendorId  → list reservations
 *   GET  /shift-availability/available-shifts   → available shifts for a date
 *   POST /manual-reservations                   → create reservation
 *   DELETE /manual-reservations/:id             → cancel reservation
 */
import apiClient from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Reservation {
	reservation_id: string;
	shift_name: string;
	event_date: string;
	start_time: string;
	end_time: string;
	reason?: string;
}

export interface AvailableShift {
	shift_id: string;
	shift_name: string;
	start_time: string;
	end_time: string;
	time_display?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format a Date → "YYYY-MM-DD" */
export const formatDateParam = (date: Date): string => {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
};

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * Fetch vendor profile to get vendor_id.
 * Returns the vendor_id string or throws.
 */
export const fetchVendorId = async (): Promise<string> => {
	const res = await apiClient.get(API_ENDPOINTS.vendor.profile);
	const vendorId = res.data?.vendor_id ?? res.data?.data?.vendor_id;
	if (!vendorId) throw new Error('Could not retrieve vendor profile.');
	return String(vendorId);
};

/**
 * Fetch all active reservations for the vendor (current month).
 */
export const fetchReservations = async (vendorId: string): Promise<Reservation[]> => {
	const now = new Date();
	const res = await apiClient.get(
		API_ENDPOINTS.manualReservations.listByVendor(vendorId),
		{ params: { month: now.getMonth() + 1, year: now.getFullYear() } }
	);
	return (res.data?.data ?? res.data ?? []) as Reservation[];
};

/**
 * Fetch available (not yet booked/reserved) shifts for a vendor on a given date.
 */
export const fetchAvailableShifts = async (
	vendorId: string,
	date: Date
): Promise<AvailableShift[]> => {
	const res = await apiClient.get(
		API_ENDPOINTS.shiftAvailability.availableShifts,
		{ params: { vendor_id: vendorId, event_date: formatDateParam(date) } }
	);

	if (res.data?.success) {
		return (res.data.availableShifts ?? []) as AvailableShift[];
	}
	return [];
};

/**
 * Create a manual reservation.
 */
export const createReservation = async (params: {
	vendorId: string;
	shiftId: string;
	date: Date;
	reason?: string;
}): Promise<void> => {
	await apiClient.post(API_ENDPOINTS.manualReservations.create, {
		vendor_id: params.vendorId,
		shift_id: params.shiftId,
		event_date: formatDateParam(params.date),
		reason: params.reason?.trim() || 'Manual reservation by vendor',
		reserved_by_type: 'vendor',
	});
};

/**
 * Cancel (delete) a reservation by ID.
 */
export const cancelReservation = async (reservationId: string): Promise<void> => {
	await apiClient.delete(API_ENDPOINTS.manualReservations.cancel(reservationId));
};
