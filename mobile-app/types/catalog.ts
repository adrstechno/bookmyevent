export type ServiceCategory = {
	serviceId: number | string;
	name: string;
	iconUrl?: string;
	description?: string;
};

export type VendorSummary = {
	vendorId: number | string;
	businessName: string;
	description?: string;
	profileUrl?: string;
	contact?: string;
	address?: string;
	state?: string;
	city?: string;
	rating?: number;
	experienceYears?: number;
	serviceCategoryId?: number | string;
	subserviceId?: number | string;
	isVerified?: boolean;
	isActive?: boolean;
};

export type VendorPackage = {
	packageId: number | string;
	packageName: string;
	packageDescription?: string;
	amount?: number;
};

export type UserKpis = {
	totalBookings: number;
	totalSpent: number;
	pendingBookings: number;
	completedBookings: number;
};
