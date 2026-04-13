import type { ApiError } from '@/services/api/client';

export type ApiResult<T> =
	| {
			success: true;
			data: T;
	  }
	| {
			success: false;
			error: ApiError;
	  };

const toApiError = (error: unknown, fallbackMessage: string): ApiError => {
	if (error && typeof error === 'object' && 'message' in error && 'isNetworkError' in error) {
		return error as ApiError;
	}

	if (error instanceof Error) {
		return {
			status: 0,
			message: error.message || fallbackMessage,
			isNetworkError: true,
		};
	}

	return {
		status: 0,
		message: fallbackMessage,
		isNetworkError: true,
	};
};

export const executeApi = async <T>(
	request: () => Promise<T>,
	fallbackMessage: string
): Promise<ApiResult<T>> => {
	try {
		const data = await request();
		return { success: true, data };
	} catch (error) {
		return {
			success: false,
			error: toApiError(error, fallbackMessage),
		};
	}
};

export const unwrapApiPayload = <T>(payload: unknown): T | null => {
	if (!payload || typeof payload !== 'object') {
		return null;
	}

	const typed = payload as { data?: unknown };
	if (typed.data !== undefined) {
		return typed.data as T;
	}

	return payload as T;
};

export const extractListFromPayload = <T>(
	payload: unknown,
	keys: string[] = ['items', 'results', 'bookings', 'services', 'vendors']
): T[] => {
	if (Array.isArray(payload)) {
		return payload as T[];
	}

	if (!payload || typeof payload !== 'object') {
		return [];
	}

	for (const key of keys) {
		const candidate = (payload as Record<string, unknown>)[key];
		if (Array.isArray(candidate)) {
			return candidate as T[];
		}
	}

	const nestedData = (payload as { data?: unknown }).data;
	if (nestedData && nestedData !== payload) {
		return extractListFromPayload<T>(nestedData, keys);
	}

	return [];
};