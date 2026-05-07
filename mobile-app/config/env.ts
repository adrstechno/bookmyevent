/**
 * env.ts — Centralized API URL config
 *
 * Uses Expo public env when available so EAS builds can inject the correct backend.
 *
 * Production:  EXPO_PUBLIC_API_BASE_URL=https://bookmyevent-rf0j.onrender.com
 * Local dev:   EXPO_PUBLIC_API_BASE_URL=http://<your-machine-ip>:3232
 */

const PRODUCTION_BACKEND_URL = 'https://bookmyevent-rf0j.onrender.com';

const EXPO_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

export const ENV = {
	apiBaseUrl: EXPO_API_BASE_URL || PRODUCTION_BACKEND_URL,
	apiTimeoutMs: Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS) || 20000,
	enableApiDebugLogs: process.env.EXPO_PUBLIC_API_DEBUG === 'true',
};
