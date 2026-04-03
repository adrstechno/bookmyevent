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
	description?: string;
	yearsExperience?: number;
	contact?: string;
	address?: string;
	city?: string;
	state?: string;
	profileImageUrl?: string;
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
