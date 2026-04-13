/**
 * env.ts — Centralized API URL config
 *
 * Priority order:
 *  1. EXPO_PUBLIC_API_BASE_URL from .env  (manual override)
 *  2. Auto-detect from Expo dev server host (works on all platforms automatically)
 *  3. Fallback: localhost:3232
 *
 * Why auto-detect?
 *  - iOS Simulator: localhost works fine
 *  - Android Emulator: needs 10.0.2.2 (not localhost)
 *  - Physical Device: needs machine's LAN IP (e.g. 192.168.1.65)
 *  Expo's dev server host IS the machine's IP — so we reuse it.
 */
import Constants from 'expo-constants';

const PORT = 3232;

const getApiBaseUrl = (): string => {
	// 1. Manual override from .env
	const manual = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
	if (manual) return manual.replace(/\/+$/, '');

	// 2. Auto-detect: grab Expo dev server host and replace its port with 3232
	try {
		// expoConfig.hostUri looks like "192.168.1.65:8081" or "localhost:8081"
		const hostUri =
			Constants.expoConfig?.hostUri ??
			(Constants as unknown as { manifest?: { debuggerHost?: string } }).manifest?.debuggerHost;

		if (hostUri) {
			const host = hostUri.split(':')[0]; // strip the Expo port
			if (host && host !== 'null') {
				return `http://${host}:${PORT}`;
			}
		}
	} catch {
		// ignore — fall through to default
	}

	// 3. Fallback
	return `http://localhost:${PORT}`;
};

export const ENV = {
	apiBaseUrl: getApiBaseUrl(),
	apiTimeoutMs: (() => {
		const v = process.env.EXPO_PUBLIC_API_TIMEOUT_MS;
		const n = Number(v);
		return Number.isFinite(n) && n > 0 ? n : 15000;
	})(),
	enableApiDebugLogs: (() => {
		const v = process.env.EXPO_PUBLIC_API_DEBUG?.toLowerCase();
		return v === '1' || v === 'true' || v === 'yes';
	})(),
};
