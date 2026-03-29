type AppEnv = {
	apiBaseUrl: string;
	apiTimeoutMs: number;
	enableApiDebugLogs: boolean;
};

const DEFAULT_API_BASE_URL = 'http://localhost:3232';
const DEFAULT_API_TIMEOUT_MS = 15000;

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, '');

const parseTimeout = (value?: string): number => {
	if (!value) {
		return DEFAULT_API_TIMEOUT_MS;
	}

	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_API_TIMEOUT_MS;
};

const parseBoolean = (value?: string): boolean => {
	if (!value) {
		return false;
	}

	const normalized = value.toLowerCase();
	return normalized === '1' || normalized === 'true' || normalized === 'yes';
};

const rawBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
const apiBaseUrl = rawBaseUrl ? normalizeBaseUrl(rawBaseUrl) : DEFAULT_API_BASE_URL;

if (__DEV__ && !rawBaseUrl) {
	console.warn(
		'[env] EXPO_PUBLIC_API_BASE_URL is not set. Falling back to http://localhost:3232.'
	);
}

export const ENV: AppEnv = {
	apiBaseUrl,
	apiTimeoutMs: parseTimeout(process.env.EXPO_PUBLIC_API_TIMEOUT_MS),
	enableApiDebugLogs: parseBoolean(process.env.EXPO_PUBLIC_API_DEBUG),
};

