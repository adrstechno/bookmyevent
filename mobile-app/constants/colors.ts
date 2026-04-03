import { AppPalettes, ThemeColors } from '@/constants/theme';

export const Palette = {
	primary: AppPalettes.light.primary,
	primaryStrong: AppPalettes.light.primaryStrong,
	accent: AppPalettes.light.accent,
	screenBg: AppPalettes.light.screenBg,
	surfaceBg: AppPalettes.light.surfaceBg,
	text: AppPalettes.light.text,
	subtext: AppPalettes.light.subtext,
} as const;

export { ThemeColors };

export type ThemeMode = keyof typeof ThemeColors;
export type ThemeColorName = keyof typeof ThemeColors.light;

