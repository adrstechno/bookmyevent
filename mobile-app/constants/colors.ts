export const Palette = {
	slate900: '#11181C',
	slate800: '#151718',
	slate600: '#687076',
	slate500: '#9BA1A6',
	white: '#FFFFFF',
	gray100: '#ECEDEE',
	brand500: '#0A7EA4',
} as const;

export const ThemeColors = {
	light: {
		text: Palette.slate900,
		background: Palette.white,
		tint: Palette.brand500,
		icon: Palette.slate600,
		tabIconDefault: Palette.slate600,
		tabIconSelected: Palette.brand500,
	},
	dark: {
		text: Palette.gray100,
		background: Palette.slate800,
		tint: Palette.white,
		icon: Palette.slate500,
		tabIconDefault: Palette.slate500,
		tabIconSelected: Palette.white,
	},
} as const;

export type ThemeMode = keyof typeof ThemeColors;
export type ThemeColorName = keyof typeof ThemeColors.light;

