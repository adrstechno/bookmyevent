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