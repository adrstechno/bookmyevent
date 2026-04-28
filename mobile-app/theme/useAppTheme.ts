import { useSettingsTheme } from '@/theme/settingsTheme';

export type AppResolvedMode = 'light' | 'dark';
export type AppThemePalette = ReturnType<typeof useSettingsTheme>['palette'];
export type AppThemeResult = {
	resolvedMode: AppResolvedMode;
	palette: AppThemePalette;
	isDark: boolean;
};

export function useAppTheme(): AppThemeResult {
	const { mode, palette } = useSettingsTheme();
	const resolvedMode: AppResolvedMode = mode;

	return {
		resolvedMode,
		palette,
		isDark: resolvedMode === 'dark',
	};
}
