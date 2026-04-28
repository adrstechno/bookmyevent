import { ENV } from '@/config/env';

export const APP_CONFIG = {
	appName: 'GoEventify',
	api: {
		baseUrl: ENV.apiBaseUrl,
		timeoutMs: ENV.apiTimeoutMs,
		debugLogsEnabled: ENV.enableApiDebugLogs,
	},
	features: {
		enableOfflineBanner: true,
		enableDarkMode: false,
		enablePullToRefresh: true,
		enableInfiniteScroll: true,
	},
} as const;

export type AppConfig = typeof APP_CONFIG;

