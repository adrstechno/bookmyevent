import apiClientInstance from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import type { ServiceCategory, VendorPackage, VendorSummary } from '@/types/catalog';

const toServiceCategory = (item: Record<string, unknown>, index: number): ServiceCategory => {
	return {
		serviceId: (item.service_id as number | string | undefined) ?? index,
		name: (item.name as string | undefined) ?? 'Unnamed Service',
		iconUrl: (item.service_icon as string | undefined) ?? (item.icon_url as string | undefined),
		description: item.description as string | undefined,
	};
};

const toVendorSummary = (item: Record<string, unknown>, index: number): VendorSummary => {
	const ratingValue = item.avg_rating ?? item.rating;
	const experienceValue = item.years_experience ?? item.experience_years;

	return {
		vendorId: (item.vendor_id as number | string | undefined) ?? index,
		businessName: (item.business_name as string | undefined) ?? 'Unnamed Vendor',
		description: item.description as string | undefined,
		profileUrl: (item.profile_url as string | undefined) ?? (item.profileImageUrl as string | undefined),
		contact: item.contact as string | undefined,
		address: item.address as string | undefined,
		state: item.state as string | undefined,
		city: item.city as string | undefined,
		rating: typeof ratingValue === 'number' ? ratingValue : typeof ratingValue === 'string' ? Number(ratingValue) : undefined,
		experienceYears:
			typeof experienceValue === 'number' ? experienceValue : typeof experienceValue === 'string' ? Number(experienceValue) : undefined,
		serviceCategoryId: item.service_category_id as number | string | undefined,
		subserviceId: item.subservice_id as number | string | undefined,
		isVerified: item.is_verified === 1 || item.is_verified === true,
		isActive: item.is_active === 1 || item.is_active === true,
	};
};

const toVendorPackage = (item: Record<string, unknown>, index: number): VendorPackage => {
	const amountValue = item.amount;

	return {
		packageId: (item.package_id as number | string | undefined) ?? index,
		packageName: (item.package_name as string | undefined) ?? 'Vendor Package',
		packageDescription: item.package_desc as string | undefined,
		amount:
			typeof amountValue === 'number'
				? amountValue
				: typeof amountValue === 'string'
					? Number(amountValue)
					: undefined,
	};
};

const ensureArray = (payload: unknown): Record<string, unknown>[] => {
	if (Array.isArray(payload)) {
		return payload as Record<string, unknown>[];
	}

	if (payload && typeof payload === 'object') {
		const nested = (payload as { data?: unknown; vendors?: unknown; services?: unknown }).data;

		if (Array.isArray(nested)) {
			return nested as Record<string, unknown>[];
		}

		const vendors = (payload as { vendors?: unknown }).vendors;
		if (Array.isArray(vendors)) {
			return vendors as Record<string, unknown>[];
		}

		const services = (payload as { services?: unknown }).services;
		if (Array.isArray(services)) {
			return services as Record<string, unknown>[];
		}
	}

	return [];
};

export const fetchServiceCategories = async (): Promise<ServiceCategory[]> => {
	const response = await apiClientInstance.get(API_ENDPOINTS.service.all);
	const rows = ensureArray(response.data);
	return rows.map(toServiceCategory);
};

export const fetchVendors = async (): Promise<VendorSummary[]> => {
	const response = await apiClientInstance.get(API_ENDPOINTS.vendor.all);
	const rows = ensureArray(response.data);
	return rows.map(toVendorSummary);
};

export const fetchVendorsByService = async (serviceId: number | string): Promise<VendorSummary[]> => {
	const response = await apiClientInstance.get(API_ENDPOINTS.vendor.byService, {
		params: { service_category_id: serviceId },
	});
	const rows = ensureArray(response.data);
	return rows.map(toVendorSummary);
};

export const fetchVendorsBySubservice = async (subserviceId: number | string): Promise<VendorSummary[]> => {
	const response = await apiClientInstance.get(API_ENDPOINTS.vendor.bySubservice, {
		params: { subservice_id: subserviceId },
	});
	const rows = ensureArray(response.data);
	return rows.map(toVendorSummary);
};

export const fetchVendorById = async (vendorId: number | string): Promise<VendorSummary | null> => {
	const vendors = await fetchVendors();
	const vendor = vendors.find((item) => String(item.vendorId) === String(vendorId));
	return vendor ?? null;
};

export const fetchVendorPackages = async (vendorId: number | string): Promise<VendorPackage[]> => {
	const response = await apiClientInstance.get(API_ENDPOINTS.vendor.packages, {
		params: { vendor_id: vendorId },
	});
	const payload = response.data as { packages?: unknown };
	const rows = ensureArray(payload.packages ?? response.data);
	return rows.map(toVendorPackage);
};
