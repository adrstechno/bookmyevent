import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';

import { AppPalettes } from '@/constants/theme';

export type SettingsThemeMode = 'light' | 'dark';

const SETTINGS_THEME_KEY = 'settings.theme.mode';

export const settingsThemePalettes = AppPalettes;

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
