/**
 * env.ts — Centralized API URL config
 *
 * Uses Expo public env when available so EAS builds can inject the correct backend.
 */

const CLOUD_BACKEND_URL = 'https://bookmyevent-rf0j.onrender.com';
const EXPO_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

export const ENV = {
	apiBaseUrl: EXPO_API_BASE_URL || CLOUD_BACKEND_URL,
	apiTimeoutMs: 15000,
	enableApiDebugLogs: false,
};
