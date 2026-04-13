import apiClient from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';

export type SubscriptionStatus = {
	isActive: boolean;
	endDate: string | null;
	daysRemaining: number;
	hasSubscription: boolean;
};

const toObject = (payload: unknown): Record<string, unknown> => {
	if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
		return payload as Record<string, unknown>;
	}
	return {};
};

const toNumber = (value: unknown, fallback = 0): number => {
	if (typeof value === 'number' && Number.isFinite(value)) return value;
	if (typeof value === 'string') {
		const n = Number(value);
		if (Number.isFinite(n)) return n;
	}
	return fallback;
};

export const fetchSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
	const response = await apiClient.get(API_ENDPOINTS.subscription.status);
	const payload = toObject(response.data);
	const data = toObject(payload.data ?? payload);

	const isActive = Boolean(data.isActive ?? data.is_active ?? false);
	const endDate = typeof data.expiresAt === 'string'
		? data.expiresAt
		: typeof data.end_date === 'string'
		? data.end_date
		: null;
	const daysRemaining = toNumber(data.daysRemaining ?? data.days_remaining, 0);

	return {
		isActive,
		endDate,
		daysRemaining,
		hasSubscription: isActive || daysRemaining > 0,
	};
};
