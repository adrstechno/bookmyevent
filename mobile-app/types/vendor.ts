export type VendorKpis = {
	totalSales: number;
	newOrders: number;
	activeEvents: number;
	totalClients: number;
};

export type VendorActivity = {
	bookingId: number | string;
	bookingUuid?: string;
	status: string;
	userName?: string;
	createdAt?: string;
};

export type VendorProfile = {
	vendorId: number | string;
	businessName?: string;
	serviceCategoryId?: number | string;
	subserviceId?: number | string;
	description?: string;
	yearsExperience?: number;
	contact?: string;
	address?: string;
	city?: string;
	state?: string;
	profileImageUrl?: string;
	eventProfilesUrl?: string;
};

export type VendorServiceCategory = {
	id: number | string;
	name: string;
};

export type VendorSubService = {
	subserviceId: number | string;
	subserviceName: string;
	isActive: boolean;
};

export type VendorProfileInput = {
	businessName: string;
	serviceCategoryId: string;
	subserviceId?: string;
	description: string;
	yearsExperience: string;
	contact: string;
	address: string;
	city: string;
	state: string;
	eventProfilesUrl: string;
	profileImageUri?: string | null;
};

export type VendorShift = {
	shiftId: number | string;
	shiftName: string;
	startTime: string;
	endTime: string;
	daysOfWeek: string[];
};

export type VendorBooking = {
	bookingId: number | string;
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
	packageId?: number | string;
	amount?: number;
	eventAddress?: string;
	specialRequirement?: string;
	createdAt?: string;
};

export type OtpAttemptStatus = {
	attemptsRemaining: number;
	isLocked: boolean;
};

export type VendorPackage = {
	packageId: number | string;
	packageName: string;
	packageDesc: string;
	amount: number;
};

export type VendorPackageInput = {
	packageName: string;
	packageDesc: string;
	amount: number;
};
