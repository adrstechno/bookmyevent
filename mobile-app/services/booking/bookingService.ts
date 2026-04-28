import apiClient from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { executeApi, extractListFromPayload, unwrapApiPayload, type ApiResult } from '@/services/api/result';
import type { BookingItem, BookingStatus } from '@/types/booking';

type BookingQuery = {
	status?: BookingStatus;
};

const toBookingStatus = (status: unknown): BookingStatus => {
	if (typeof status !== 'string') {
		return 'pending';
	}

	const normalized = status.toLowerCase();

	if (normalized.includes('cancel') || normalized.includes('reject')) {
		return 'cancelled';
	}

	if (normalized.includes('complete') || normalized.includes('review')) {
		return 'completed';
	}

	if (
		normalized.includes('confirm') ||
		normalized.includes('approve') ||
		normalized.includes('otp')
	) {
		return 'confirmed';
	}

	return 'pending';
};

const toDateLabel = (value: unknown): string => {
	if (typeof value !== 'string' || value.trim().length === 0) {
		return 'Date not provided';
	}

	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		return value;
	}

	return parsed.toLocaleDateString('en-IN', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	});
};

const toAmountLabel = (value: unknown): string => {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return `Rs ${Math.round(value).toLocaleString('en-IN')}`;
	}

	if (typeof value === 'string' && value.trim().length > 0) {
		if (value.toLowerCase().includes('rs') || value.toLowerCase().includes('inr')) {
			return value;
		}

		const parsed = Number(value.replace(/[^0-9.]/g, ''));
		if (Number.isFinite(parsed) && parsed > 0) {
			return `Rs ${Math.round(parsed).toLocaleString('en-IN')}`;
		}

		return value;
	}

	return 'Rs N/A';
};

const toAdminApprovalStatus = (status: unknown): 'pending' | 'approved' | 'rejected' | undefined => {
	if (typeof status !== 'string') {
		return undefined;
	}

	const normalized = status.toLowerCase();

	if (normalized.includes('approve')) {
		return 'approved';
	}

	if (normalized.includes('reject')) {
		return 'rejected';
	}

	if (normalized.includes('pending')) {
		return 'pending';
	}

	return undefined;
};

const toBookingItem = (row: Record<string, unknown>, index: number): BookingItem => {
	const idCandidate = row.booking_id ?? row.booking_uuid ?? row.id ?? `booking-${index + 1}`;
	const eventNameCandidate =
		(typeof row.package_name === 'string' && row.package_name.trim().length > 0
			? row.package_name
			: undefined) ??
		(typeof row.service_name === 'string' && row.service_name.trim().length > 0
			? row.service_name
			: undefined) ??
		(typeof row.event_name === 'string' && row.event_name.trim().length > 0
			? row.event_name
			: undefined) ??
		'Event Booking';

	const venueCandidate =
		(typeof row.event_address === 'string' && row.event_address.trim().length > 0
			? row.event_address
			: undefined) ??
		(typeof row.venue === 'string' && row.venue.trim().length > 0 ? row.venue : undefined) ??
		(typeof row.business_name === 'string' && row.business_name.trim().length > 0
			? row.business_name
			: undefined) ??
		'Venue not provided';

	return {
		id: String(idCandidate),
		eventName: eventNameCandidate,
		date: toDateLabel(row.event_date ?? row.date),
		venue: venueCandidate,
		amount: toAmountLabel(row.amount),
		status: toBookingStatus(row.status),
		adminApproval: toAdminApprovalStatus(row.admin_approval),
		vendorName: typeof row.vendor_name === 'string' ? row.vendor_name : typeof row.business_name === 'string' ? row.business_name : undefined,
		packageName: typeof row.package_name === 'string' ? row.package_name : undefined,
		eventDate: typeof row.event_date === 'string' ? row.event_date : undefined,
		eventTime: typeof row.event_time === 'string' ? row.event_time : undefined,
		eventAddress: typeof row.event_address === 'string' ? row.event_address : undefined,
		specialRequirement: typeof row.special_requirement === 'string' ? row.special_requirement : undefined,
	};
};

export const fetchUserBookings = async (query: BookingQuery = {}): Promise<ApiResult<BookingItem[]>> => {
	return executeApi(async () => {
		const response = await apiClient.get(API_ENDPOINTS.booking.listByUser, {
			params: query.status ? { status: query.status } : undefined,
		});

		const payload = unwrapApiPayload<unknown>(response.data);
		const rows = extractListFromPayload<Record<string, unknown>>(payload, ['bookings']);
		return rows.map(toBookingItem);
	}, 'Unable to load bookings right now.');
};

export const cancelBooking = async (bookingId: string | number, reason?: string): Promise<ApiResult<void>> => {
	return executeApi(async () => {
		await apiClient.put(API_ENDPOINTS.booking.cancel(bookingId), {
			reason: reason || 'Cancelled by user',
		});
	}, 'Unable to cancel booking right now.');
};

export const submitReview = async (
	bookingId: string | number,
	reviewData: {
		rating: number;
		review_text?: string;
		service_quality?: number;
		communication?: number;
		value_for_money?: number;
		punctuality?: number;
	}
): Promise<ApiResult<void>> => {
	return executeApi(async () => {
		await apiClient.post(API_ENDPOINTS.review.submitAuthenticated(bookingId), reviewData);
	}, 'Unable to submit review right now.');
};

export const getOTPStatus = async (bookingId: string | number): Promise<ApiResult<any>> => {
	return executeApi(async () => {
		const response = await apiClient.get(API_ENDPOINTS.otp.status(bookingId));
		return unwrapApiPayload<any>(response.data);
	}, 'Unable to fetch OTP status.');
};