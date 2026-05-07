export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'awaiting_review' | 'cancelled';

export type AdminApprovalStatus = 'pending' | 'approved' | 'rejected';

export type BookingItem = {
	id: string;
	eventName: string;
	date: string;
	venue: string;
	amount: string;
	status: BookingStatus;
	adminApproval?: AdminApprovalStatus;
	vendorName?: string;
	packageName?: string;
	eventDate?: string;
	eventTime?: string;
	eventAddress?: string;
	specialRequirement?: string;
};