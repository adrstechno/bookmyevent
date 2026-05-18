import apiClient from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import type {
	OtpAttemptStatus,
	VendorActivity,
	VendorBooking,
	VendorKpis,
	VendorPackage,
	VendorPackageInput,
	VendorProfile,
	VendorProfileInput,
	VendorServiceCategory,
	VendorShift,
	VendorSubService,
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
		subserviceId: toText(record.subservice_id),
		description: toText(record.description),
		yearsExperience: toNumber(record.years_experience, 0),
		contact: toText(record.contact),
		address: toText(record.address),
		city: toText(record.city),
		state: toText(record.state),
		profileImageUrl: toText(record.profile_url || record.profile_image_url || record.profile_picture),
		eventProfilesUrl: toText(record.event_profiles_url),
	};
};

export const fetchVendorServiceCategories = async (): Promise<VendorServiceCategory[]> => {
	const response = await apiClient.get(API_ENDPOINTS.service.all);
	const rows = toRows(response.data);

	return rows
		.map((row) => ({
			id: row.category_id ?? row.service_category_id ?? row.id ?? '',
			name: toText(row.category_name ?? row.service_name ?? row.name),
		}))
		.filter((row) => row.id && row.name);
};

export const fetchVendorSubServices = async (
	serviceCategoryId: number | string
): Promise<VendorSubService[]> => {
	const response = await apiClient.get(API_ENDPOINTS.service.subservicesByCategory(serviceCategoryId));
	const rows = toRows(response.data);

	return rows
		.map((row) => ({
			subserviceId: row.subservice_id ?? row.id ?? '',
			subserviceName: toText(row.subservice_name ?? row.name),
			isActive: Boolean(row.is_active ?? true),
		}))
		.filter((row) => row.subserviceId && row.subserviceName && row.isActive);
};

const buildVendorProfileFormData = (input: VendorProfileInput) => {
	const formData = new FormData();

	formData.append('business_name', input.businessName.trim());
	formData.append('service_category_id', input.serviceCategoryId);
	if (input.subserviceId) {
		formData.append('subservice_id', input.subserviceId);
	}
	formData.append('description', input.description.trim());
	formData.append('years_experience', input.yearsExperience.trim());
	formData.append('contact', input.contact.trim());
	formData.append('address', input.address.trim());
	formData.append('city', input.city.trim());
	formData.append('state', input.state.trim());
	formData.append('event_profiles_url', input.eventProfilesUrl.trim());

	if (input.profileImageUri) {
		const fileName = input.profileImageUri.split('/').pop() ?? 'vendor-profile.jpg';
		const normalized = fileName.toLowerCase();
		const type = normalized.endsWith('.png') ? 'image/png' : 'image/jpeg';
		formData.append('profilePicture', {
			uri: input.profileImageUri,
			name: fileName,
			type,
		} as never);
	}

	return formData;
};

export const saveVendorProfile = async (
	input: VendorProfileInput,
	options?: { isNewProfile?: boolean }
) => {
	const endpoint = options?.isNewProfile ? API_ENDPOINTS.vendor.createProfile : API_ENDPOINTS.vendor.updateProfile;
	const formData = buildVendorProfileFormData(input);
	const response = await apiClient.post(endpoint, formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});

	return toObject(response.data);
};

export const changeVendorPassword = async (payload: {
	email: string;
	oldPassword: string;
	newPassword: string;
}) => {
	const response = await apiClient.post(API_ENDPOINTS.auth.changePassword, {
		email: payload.email.trim().toLowerCase(),
		oldPassword: payload.oldPassword,
		newPassword: payload.newPassword,
	});
	return toObject(response.data);
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
	// Backend returns: { success, data: { bookings: [...], pagination: {...} } }
	const nested = toObject(payload.data ?? payload);
	const rows = toRows(nested.bookings ?? payload.bookings ?? payload.data ?? payload);

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

export const fetchVendorPackages = async (vendorId: number | string): Promise<VendorPackage[]> => {
	const response = await apiClient.get(API_ENDPOINTS.vendor.packages, {
		params: { vendor_id: vendorId },
	});
	const payload = toObject(response.data);
	const rows = toRows(payload.packages ?? payload.data ?? payload);

	return rows.map((row) => ({
		packageId: toText(row.package_id ?? row.id),
		packageName: toText(row.package_name),
		packageDesc: toText(row.package_desc),
		amount: toNumber(row.amount),
	}));
};

export const createVendorPackage = async (input: VendorPackageInput) => {
	const response = await apiClient.post(API_ENDPOINTS.vendor.createPackage, {
		package_name: input.packageName.trim(),
		package_desc: input.packageDesc.trim(),
		amount: input.amount,
	});

	return toObject(response.data);
};

export const updateVendorPackage = async (
	packageId: number | string,
	input: VendorPackageInput
) => {
	const response = await apiClient.post(API_ENDPOINTS.vendor.updatePackage, {
		package_id: packageId,
		package_name: input.packageName.trim(),
		package_desc: input.packageDesc.trim(),
		amount: input.amount,
	});

	return toObject(response.data);
};

export const deleteVendorPackage = async (packageId: number | string) => {
	const response = await apiClient.get(API_ENDPOINTS.vendor.deletePackage, {
		params: { package_id: packageId },
	});

	return toObject(response.data);
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

// ─── Gallery ─────────────────────────────────────────────────────────────────

export type VendorEventImage = {
	imageId: number | string;
	imageUrl: string;
};

export const fetchVendorEventImages = async (): Promise<VendorEventImage[]> => {
	const response = await apiClient.get(API_ENDPOINTS.vendor.eventImages);
	const payload = toObject(response.data);
	const rows = toRows(payload.eventImages ?? payload.data ?? payload);

	return rows.map((row) => ({
		// Backend returns imageID (capital ID) from Event_images table
		imageId: row.imageID ?? row.image_id ?? row.id ?? '',
		imageUrl: toText(row.imageUrl ?? row.event_profiles_url ?? row.url),
	})).filter((img) => img.imageUrl);
};

export const uploadVendorEventImages = async (imageUris: string[]): Promise<void> => {
	const formData = new FormData();

	imageUris.forEach((uri) => {
		const fileName = uri.split('/').pop() ?? 'event-image.jpg';
		const normalized = fileName.toLowerCase();
		const type = normalized.endsWith('.png') ? 'image/png' : 'image/jpeg';
		formData.append('eventImages', {
			uri,
			name: fileName,
			type,
		} as never);
	});

	await apiClient.post(API_ENDPOINTS.vendor.uploadEventImages, formData, {
		headers: { 'Content-Type': 'multipart/form-data' },
	});
};

/**
 * Delete a vendor event image by imageID.
 * Backend: POST /Vendor/DeleteEventImage  { imageID }
 */
export const deleteVendorEventImage = async (imageId: number | string): Promise<void> => {
	await apiClient.post(API_ENDPOINTS.vendor.deleteEventImage, {
		imageID: imageId,
	});
};
