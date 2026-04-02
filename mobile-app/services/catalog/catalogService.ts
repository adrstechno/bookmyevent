import apiClient from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import type { ServiceCategory, VendorSummary } from '@/types/catalog';

const toServiceCategory = (item: Record<string, unknown>, index: number): ServiceCategory => {
	return {
		serviceId: (item.service_id as number | string | undefined) ?? index,
		name: (item.name as string | undefined) ?? 'Unnamed Service',
		iconUrl: (item.service_icon as string | undefined) ?? (item.icon_url as string | undefined),
		description: item.description as string | undefined,
	};
};

const toVendorSummary = (item: Record<string, unknown>, index: number): VendorSummary => {
	return {
		vendorId: (item.vendor_id as number | string | undefined) ?? index,
		businessName: (item.business_name as string | undefined) ?? 'Unnamed Vendor',
		city: item.city as string | undefined,
		rating:
			typeof item.avg_rating === 'number'
				? item.avg_rating
				: typeof item.rating === 'number'
					? item.rating
					: undefined,
		experienceYears:
			typeof item.years_experience === 'number'
				? item.years_experience
				: typeof item.experience_years === 'number'
					? item.experience_years
					: undefined,
		serviceCategoryId: item.service_category_id as number | string | undefined,
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
	const response = await apiClient.get(API_ENDPOINTS.service.all);
	const rows = ensureArray(response.data);
	return rows.map(toServiceCategory);
};

export const fetchVendors = async (): Promise<VendorSummary[]> => {
	const response = await apiClient.get(API_ENDPOINTS.vendor.all);
	const rows = ensureArray(response.data);
	return rows.map(toVendorSummary);
};
