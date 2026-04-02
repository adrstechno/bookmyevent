import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';

export type SettingsThemeMode = 'light' | 'dark';

const SETTINGS_THEME_KEY = 'settings.theme.mode';

export const settingsThemePalettes = {
	light: {
		screenBg: '#F4F7F9',
		surfaceBg: '#FFFFFF',
		border: '#E2E8F0',
		text: '#0F172A',
		subtext: '#64748B',
		pressedBg: '#F1F5F9',
		headerBtnBg: '#F8FAFC',
		switchOn: '#2D6A4F',
		switchOff: '#CBD5E1',
		tint: '#0F766E',
	},
	dark: {
		screenBg: '#0F172A',
		surfaceBg: '#111827',
		border: '#334155',
		text: '#E2E8F0',
		subtext: '#94A3B8',
		pressedBg: '#1E293B',
		headerBtnBg: '#1F2937',
		switchOn: '#22C55E',
		switchOff: '#475569',
		tint: '#2DD4BF',
	},
} as const;

const isSettingsThemeMode = (value: string | null): value is SettingsThemeMode => {
	return value === 'light' || value === 'dark';
};

export const getSavedSettingsTheme = async (): Promise<SettingsThemeMode> => {
	try {
		const value = await SecureStore.getItemAsync(SETTINGS_THEME_KEY);
		if (isSettingsThemeMode(value)) {
			return value;
		}
	} catch {
		// Keep default when storage is unavailable.
	}

	return 'light';
};

export const setSavedSettingsTheme = async (mode: SettingsThemeMode) => {
	try {
		await SecureStore.setItemAsync(SETTINGS_THEME_KEY, mode);
	} catch {
		// Ignore storage errors for non-blocking UX.
	}
};

export const useSettingsTheme = () => {
	const [mode, setMode] = useState<SettingsThemeMode>('light');

	useEffect(() => {
		void (async () => {
			const savedMode = await getSavedSettingsTheme();
			setMode(savedMode);
		})();
	}, []);

	const updateMode = useCallback((nextMode: SettingsThemeMode) => {
		setMode(nextMode);
		void setSavedSettingsTheme(nextMode);
	}, []);

	return {
		mode,
		palette: settingsThemePalettes[mode],
		setMode: updateMode,
	};
};
