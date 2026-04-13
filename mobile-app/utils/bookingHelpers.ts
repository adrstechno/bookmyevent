export type FilterKey = 'all' | 'pending' | 'awaiting-admin' | 'otp-required' | 'completed' | 'cancelled';

export const FILTER_KEYS: FilterKey[] = [
	'all', 'pending', 'awaiting-admin', 'otp-required', 'completed', 'cancelled',
];

export const getFilterLabel = (key: FilterKey) => {
	const map: Record<FilterKey, string> = {
		all: 'All',
		pending: 'Pending',
		'awaiting-admin': 'Awaiting Admin',
		'otp-required': 'OTP Required',
		completed: 'Completed',
		cancelled: 'Cancelled',
	};
	return map[key];
};

// Matches backend VendorBooking from vendorService.ts
export interface VendorBooking {
	bookingId: string;
	bookingUuid?: string;
	status: string;
	adminApproval?: string;
	firstName?: string;
	lastName?: string;
	userName?: string;
	email?: string;
	phone?: string;
	eventDate?: string;
	eventTime?: string;
	packageName?: string;
	packageId?: string | number;
	amount?: number;
	eventAddress?: string;
	specialRequirement?: string;
	createdAt?: string;
}

// ── Status helpers (same logic as frontend) ──────────────────
export const isPending = (b: VendorBooking) =>
	b.status === 'pending_vendor_response' || b.status === 'pending';

export const isAwaitingAdmin = (b: VendorBooking) =>
	b.status === 'confirmed' && b.adminApproval === 'pending';

export const isOtpRequired = (b: VendorBooking) =>
	b.status === 'confirmed' && b.adminApproval === 'approved';

export const isCompleted = (b: VendorBooking) =>
	b.status === 'completed' || b.status === 'awaiting_review';

export const isCancelled = (b: VendorBooking) =>
	b.status.includes('cancelled') || b.status.includes('rejected');
