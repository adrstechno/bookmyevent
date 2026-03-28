import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

import { APP_CONFIG } from '@/constants/config';

type ApiError = {
	status: number;
	message: string;
	code?: string;
	details?: unknown;
	isNetworkError: boolean;
};

let bearerToken: string | null = null;

export const setApiAuthToken = (token: string | null) => {
	bearerToken = token;
};

export const clearApiAuthToken = () => {
	bearerToken = null;
};

const onRequest = (config: InternalAxiosRequestConfig) => {
	const nextConfig = { ...config };
	nextConfig.headers = nextConfig.headers ?? {};

	if (bearerToken) {
		nextConfig.headers.Authorization = `Bearer ${bearerToken}`;
	}

	if (!nextConfig.headers.Accept) {
		nextConfig.headers.Accept = 'application/json';
	}

	if (!nextConfig.headers['Content-Type'] && !(nextConfig.data instanceof FormData)) {
		nextConfig.headers['Content-Type'] = 'application/json';
	}

	if (APP_CONFIG.api.debugLogsEnabled) {
		console.log('[api][request]', {
			method: nextConfig.method,
			url: nextConfig.url,
			hasAuth: Boolean(nextConfig.headers.Authorization),
		});
	}

	return nextConfig;
};

const normalizeApiError = (error: AxiosError): ApiError => {
	const status = error.response?.status ?? 0;
	const responseData = error.response?.data as
		| { message?: string; error?: string; code?: string; details?: unknown }
		| undefined;

	return {
		status,
		message:
			responseData?.message ??
			responseData?.error ??
			error.message ??
			'Something went wrong. Please try again.',
		code: responseData?.code,
		details: responseData?.details ?? error.response?.data,
		isNetworkError: !error.response,
	};
};

export const apiClient = axios.create({
	baseURL: APP_CONFIG.api.baseUrl,
	timeout: APP_CONFIG.api.timeoutMs,
	headers: {
		Accept: 'application/json',
	},
});

apiClient.interceptors.request.use(onRequest, (error) => Promise.reject(error));

apiClient.interceptors.response.use(
	(response) => {
		if (APP_CONFIG.api.debugLogsEnabled) {
			console.log('[api][response]', {
				method: response.config.method,
				url: response.config.url,
				status: response.status,
			});
		}

		return response;
	},
	(error: AxiosError) => Promise.reject(normalizeApiError(error))
);

export const createRequestConfig = (config: AxiosRequestConfig = {}): AxiosRequestConfig => ({
	...config,
});

export default apiClient;

