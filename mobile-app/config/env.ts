/**
 * env.ts — Centralized API URL config
 *
 * Uses Expo public env when available so EAS builds can inject the correct backend.
 * For local testing: set EXPO_PUBLIC_API_BASE_URL in .env to your machine's local IP
 * e.g. EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:3232
 */

// CLOUD BACKEND (commented out for local testing)
// const CLOUD_BACKEND_URL = 'https://bookmyevent-rf0j.onrender.com';

const EXPO_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

export const ENV = {
	apiBaseUrl: EXPO_API_BASE_URL || 'http://localhost:3232',
	apiTimeoutMs: Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS) || 15000,
	enableApiDebugLogs: process.env.EXPO_PUBLIC_API_DEBUG === 'true',
};
