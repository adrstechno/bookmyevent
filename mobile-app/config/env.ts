/**
 * env.ts — Centralized API URL config
 * 
 * Production cloud backend URL only
 */

const CLOUD_BACKEND_URL = 'https://bookmyevent-rf0j.onrender.com';

export const ENV = {
	apiBaseUrl: CLOUD_BACKEND_URL,
	apiTimeoutMs: 15000,
	enableApiDebugLogs: false,
};
