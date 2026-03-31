export type ServiceCategory = {
	serviceId: number | string;
	name: string;
	iconUrl?: string;
	description?: string;
};

export type VendorSummary = {
	vendorId: number | string;
	businessName: string;
	city?: string;
	rating?: number;
	experienceYears?: number;
	serviceCategoryId?: number | string;
};

export type UserKpis = {
	totalBookings: number;
	totalSpent: number;
	pendingBookings: number;
	completedBookings: number;
};
