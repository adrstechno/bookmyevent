export type FilterKey = 'all' | 'pending' | 'awaiting-admin' | 'otp-required' | 'completed' | 'cancelled';

export type BookingStatus =
	| 'pending_vendor_response' | 'pending'
	| 'confirmed' | 'completed' | 'awaiting_review'
	| 'cancelled_by_vendor' | 'rejected_by_vendor';

export type AdminApproval = 'pending' | 'approved' | 'rejected';

export interface VendorBooking {
	bookingId: string;
	bookingUuid: string;
	firstName: string;
	lastName: string;
	userName: string;
	email?: string;
	phone?: string;
	eventDate: string;
	eventTime: string;
	packageName: string;
	packageId: string;
	amount?: string;
	eventAddress?: string;
	specialRequirement?: string;
	createdAt?: string;
	status: BookingStatus;
	adminApproval: AdminApproval;
	otp: string;
	otpAttemptsRemaining: number;
	rejectReason?: string;
}

export const FILTER_KEYS: FilterKey[] = ['all', 'pending', 'awaiting-admin', 'otp-required', 'completed', 'cancelled'];

export const getFilterLabel = (key: FilterKey) => {
	const map: Record<FilterKey, string> = {
		'all': 'All', 'pending': 'Pending',
		'awaiting-admin': 'Awaiting Admin', 'otp-required': 'OTP Required',
		'completed': 'Completed', 'cancelled': 'Cancelled',
	};
	return map[key];
};

export const isPending = (b: VendorBooking) => b.status === 'pending_vendor_response' || b.status === 'pending';
export const isAwaitingAdmin = (b: VendorBooking) => b.status === 'confirmed' && b.adminApproval === 'pending';
export const isOtpRequired = (b: VendorBooking) => b.status === 'confirmed' && b.adminApproval === 'approved';
export const isCompleted = (b: VendorBooking) => b.status === 'completed' || b.status === 'awaiting_review';
export const isCancelled = (b: VendorBooking) => b.status.includes('cancelled') || b.status.includes('rejected');
