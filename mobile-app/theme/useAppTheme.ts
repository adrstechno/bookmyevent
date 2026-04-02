import { ThemeColors } from '@/constants/colors';

export type AppResolvedMode = 'light' | 'dark';
export type AppThemePalette = typeof ThemeColors.light;
export type AppThemeResult = {
	resolvedMode: AppResolvedMode;
	palette: AppThemePalette;
	isDark: boolean;
};

export function useAppTheme(): AppThemeResult {
	const resolvedMode: AppResolvedMode = 'light';
	const palette: AppThemePalette = ThemeColors.light;

	return {
		resolvedMode,
		palette,
		isDark: false,
	};
}
