import apiClient from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import type {
	OtpAttemptStatus,
	VendorActivity,
	VendorBooking,
	VendorKpis,
	VendorProfile,
	VendorShift,
} from '@/types/vendor';

const toRows = (payload: unknown): Record<string, unknown>[] => {
	if (Array.isArray(payload)) {
		return payload as Record<string, unknown>[];
	}

	if (payload && typeof payload === 'object') {
		const maybeData = (payload as { data?: unknown }).data;
		if (Array.isArray(maybeData)) {
			return maybeData as Record<string, unknown>[];
		}
	}

	return [];
};

const toObject = (payload: unknown): Record<string, unknown> => {
	if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
		return payload as Record<string, unknown>;
	}

	return {};
};

const toText = (value: unknown, fallback = ''): string => {
	if (typeof value === 'string') {
		return value;
	}
	if (typeof value === 'number') {
		return String(value);
	}
	return fallback;
};

const toNumber = (value: unknown, fallback = 0): number => {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value;
	}
	if (typeof value === 'string') {
		const num = Number(value);
		if (Number.isFinite(num)) {
			return num;
		}
	}
	return fallback;
};

const parseDays = (value: unknown): string[] => {
	if (Array.isArray(value)) {
		return value.filter((item): item is string => typeof item === 'string');
	}

	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (!trimmed) {
			return [];
		}

		if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
			try {
				const parsed = JSON.parse(trimmed);
				if (Array.isArray(parsed)) {
					return parsed.filter((item): item is string => typeof item === 'string');
				}
			} catch {
				return [];
			}
		}

		return trimmed
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean);
	}

	return [];
};

export const fetchVendorProfile = async (): Promise<VendorProfile | null> => {
	const response = await apiClient.get(API_ENDPOINTS.vendor.profile);
	const payload = toObject(response.data);
	const record = toObject(payload.data ?? payload.vendor ?? payload.profile ?? payload);
	const vendorId = record.vendor_id ?? record.id;

	if (!vendorId) {
		return null;
	}

	return {
		vendorId: toText(vendorId),
		businessName: toText(record.business_name),
		serviceCategoryId: toText(record.service_category_id),
		description: toText(record.description),
		yearsExperience: toNumber(record.years_experience, 0),
		contact: toText(record.contact),
		address: toText(record.address),
		city: toText(record.city),
		state: toText(record.state),
		profileImageUrl: toText(record.profile_image_url || record.profile_picture),
	};
};

export const fetchVendorKpis = async (): Promise<VendorKpis> => {
	const response = await apiClient.get(API_ENDPOINTS.vendor.kpis);
	const payload = toObject(response.data);
	const kpis = toObject(payload.kpis ?? payload.data ?? payload);

	return {
		totalSales: toNumber(kpis.totalSales ?? kpis.total_sales),
		newOrders: toNumber(kpis.newOrders ?? kpis.new_orders),
		activeEvents: toNumber(kpis.activeEvents ?? kpis.active_events),
		totalClients: toNumber(kpis.totalClients ?? kpis.total_clients),
	};
};

export const fetchVendorRecentActivities = async (limit = 5): Promise<VendorActivity[]> => {
	const response = await apiClient.get(API_ENDPOINTS.vendor.activities, { params: { limit } });
	const payload = toObject(response.data);
	const rows = toRows(payload.activities ?? payload.data ?? payload);

	return rows.map((row) => ({
		bookingId: toText(row.booking_id ?? row.id),
		bookingUuid: toText(row.booking_uuid),
		status: toText(row.status, 'pending'),
		userName: toText(row.user_name),
		createdAt: toText(row.created_at),
	}));
};

export const fetchVendorShifts = async (): Promise<VendorShift[]> => {
	const response = await apiClient.get(API_ENDPOINTS.vendor.shifts);
	const payload = toObject(response.data);
	const rows = toRows(payload.data ?? payload.shifts ?? payload.vendorShifts ?? payload);

	return rows.map((row) => ({
		shiftId: toText(row.shift_id ?? row.id),
		shiftName: toText(row.shift_name),
		startTime: toText(row.start_time).slice(0, 5),
		endTime: toText(row.end_time).slice(0, 5),
		daysOfWeek: parseDays(row.days_of_week),
	}));
};

export const createVendorShift = async (shift: {
	shiftName: string;
	startTime: string;
	endTime: string;
	daysOfWeek: string[];
}) => {
	const payload = new URLSearchParams();
	payload.append('shift_name', shift.shiftName);
	payload.append('start_time', `${shift.startTime}:00`);
	payload.append('end_time', `${shift.endTime}:00`);
	payload.append('days_of_week', JSON.stringify(shift.daysOfWeek));

	await apiClient.post(API_ENDPOINTS.vendor.createShift, payload, {
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	});
};

export const updateVendorShift = async (shift: {
	shiftId: number | string;
	shiftName: string;
	startTime: string;
	endTime: string;
	daysOfWeek: string[];
}) => {
	const payload = new URLSearchParams();
	payload.append('shift_id', String(shift.shiftId));
	payload.append('shift_name', shift.shiftName);
	payload.append('start_time', `${shift.startTime}:00`);
	payload.append('end_time', `${shift.endTime}:00`);
	payload.append('days_of_week', JSON.stringify(shift.daysOfWeek));

	await apiClient.post(API_ENDPOINTS.vendor.updateShift, payload, {
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	});
};

export const deleteVendorShift = async (shiftId: number | string) => {
	await apiClient.get(API_ENDPOINTS.vendor.deleteShift, {
		params: { shift_id: shiftId },
	});
};

export const fetchVendorBookings = async (): Promise<VendorBooking[]> => {
	const response = await apiClient.get(API_ENDPOINTS.booking.listByVendor);
	const payload = toObject(response.data);
	const rows = toRows(payload.bookings ?? payload.data ?? payload);

	return rows.map((row) => ({
		bookingId: toText(row.booking_id ?? row.id),
		bookingUuid: toText(row.booking_uuid),
		status: toText(row.status, 'pending'),
		adminApproval: toText(row.admin_approval),
		firstName: toText(row.first_name),
		lastName: toText(row.last_name),
		userName: toText(row.user_name),
		email: toText(row.email),
		phone: toText(row.phone),
		eventDate: toText(row.event_date),
		eventTime: toText(row.event_time),
		packageName: toText(row.package_name),
		packageId: toText(row.package_id),
		amount: toNumber(row.amount, 0),
		eventAddress: toText(row.event_address),
		specialRequirement: toText(row.special_requirement),
		createdAt: toText(row.created_at),
	}));
};

export const acceptVendorBooking = async (bookingId: number | string) => {
	await apiClient.put(API_ENDPOINTS.booking.accept(bookingId));
};

export const rejectVendorBooking = async (bookingId: number | string, reason: string) => {
	await apiClient.put(API_ENDPOINTS.booking.reject(bookingId), {
		reason,
	});
};

export const cancelVendorBooking = async (bookingId: number | string, reason = 'Cancelled by vendor') => {
	await apiClient.put(API_ENDPOINTS.booking.cancel(bookingId), {
		reason,
	});
};

export const verifyVendorOtp = async (bookingId: number | string, otpCode: string) => {
	const response = await apiClient.post(API_ENDPOINTS.otp.verify, {
		booking_id: bookingId,
		otp_code: otpCode,
	});
	return toObject(response.data);
};

export const resendVendorOtp = async (bookingId: number | string) => {
	await apiClient.post(API_ENDPOINTS.otp.resend, {
		booking_id: bookingId,
	});
};

export const fetchOtpAttempts = async (bookingId: number | string): Promise<OtpAttemptStatus> => {
	const response = await apiClient.get(API_ENDPOINTS.otp.attempts(bookingId));
	const payload = toObject(response.data);
	const data = toObject(payload.data ?? payload);

	return {
		attemptsRemaining: toNumber(data.attempts_remaining ?? data.attemptsRemaining, 3),
		isLocked: Boolean(data.is_locked ?? data.isLocked),
	};
};
