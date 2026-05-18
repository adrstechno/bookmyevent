import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';

export type SubscriptionStatus = {
	isActive: boolean;
	endDate: string | null;
	daysRemaining: number;
	hasSubscription: boolean;
};

export type SubscriptionOrder = {
	orderId: string;
	amount: number;
	currency: string;
	keyId: string;
	vendorId: number | string;
	businessName: string;
};

export type VerifySubscriptionPaymentPayload = {
	razorpay_order_id: string;
	razorpay_payment_id: string;
	razorpay_signature: string;
	vendor_id: number | string;
};

export type VerifiedSubscription = {
	startDate: string | null;
	endDate: string | null;
	status: string;
	paymentId: string;
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

const toString = (value: unknown, fallback = ''): string => {
	if (typeof value === 'string') return value;
	if (typeof value === 'number') return String(value);
	return fallback;
};

export const fetchSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
	const response = await apiClient.get(API_ENDPOINTS.subscription.status);
	const payload = toObject(response.data);

	// Backend returns: { success, hasSubscription, subscription: { is_active, end_date, days_remaining, ... } }
	// OR:             { success, hasSubscription: false, message }
	const sub = toObject(payload.subscription ?? payload.data ?? {});

	const isActive = Boolean(sub.is_active ?? sub.isActive ?? false);
	const endDate = typeof sub.end_date === 'string'
		? sub.end_date
		: typeof sub.expiresAt === 'string'
		? sub.expiresAt
		: null;
	const daysRemaining = toNumber(sub.days_remaining ?? sub.daysRemaining, 0);

	return {
		isActive,
		endDate,
		daysRemaining,
		hasSubscription: Boolean(payload.hasSubscription) || isActive || daysRemaining > 0,
	};
};

export const createSubscriptionOrder = async (): Promise<SubscriptionOrder> => {
	const response = await apiClient.post(API_ENDPOINTS.subscription.createOrder);
	const payload = toObject(response.data);
	const data = toObject(payload.data ?? payload);

	return {
		orderId: toString(data.order_id),
		amount: toNumber(data.amount),
		currency: toString(data.currency, 'INR'),
		keyId: toString(data.key_id),
		vendorId: toString(data.vendor_id),
		businessName: toString(data.business_name, 'GoEventify Vendor'),
	};
};

export const testActivateSubscription = async (): Promise<void> => {
	await apiClient.post(API_ENDPOINTS.subscription.testActivate);
};

export const verifySubscriptionPayment = async (
	paymentData: VerifySubscriptionPaymentPayload
): Promise<VerifiedSubscription> => {
	const response = await apiClient.post(API_ENDPOINTS.subscription.verifyPayment, paymentData);
	const payload = toObject(response.data);
	const data = toObject(payload.data ?? payload);

	return {
		startDate: toString(data.start_date, '') || null,
		endDate: toString(data.end_date, '') || null,
		status: toString(data.status, 'active'),
		paymentId: toString(data.payment_id),
	};
};
