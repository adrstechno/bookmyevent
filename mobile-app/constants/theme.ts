import { Platform } from "react-native";

export const AppPalettes = {
  light: {
    // light palette — Luxe Events & Celebrations
    primary: "#FF6B4A",
    primaryStrong: "#E63946",
    accent: "#FFB703",
    rose: "#FF1493",
    roseSoft: "#FFE8F0",
    screenBg: "#FFF8F0",
    surfaceBg: "#FFFFFF",
    elevatedBg: "#FFF0E6",
    border: "#FFD9C0",
    text: "#2B1810",
    subtext: "#8B5A3C",
    muted: "#B88968",
    pressedBg: "#FFDCC1",
    headerBtnBg: "#FFE8D9",
    icon: "#8B5A3C",
    onPrimary: "#FFFFFF",
    tint: "#FF6B4A",
    danger: "#D32F2F",
    dangerSoft: "#FADADA",
    dangerBorder: "#F5BCBC",
    success: "#388E3C",
    successSoft: "#E8F5E9",
    successBorder: "#C8E6C9",
    info: "#1976D2",
    infoSoft: "#E3F2FD",
    infoBorder: "#BBDEFB",
    warning: "#F57C00",
    warningSoft: "#FFF3E0",
    switchOn: "#FF6B4A",
    switchOff: "#FFD9C0",
    overlay: "rgba(43,24,16,0.45)",
    shadow: "#2B1810",
  },
  dark: {
    // dark palette — Luxe Events & Celebrations
    primary: '#8B5CF6',
    primaryStrong: '#6D28D9',
    accent: '#FDB022',
    rose: '#FF69B4',
    roseSoft: '#3D2A1F',
    screenBg: '#0F1419',
    surfaceBg: '#1A2332',
    elevatedBg: '#242F3F',
    border: '#3D4A5C',
    text: '#F5E6D3',
    subtext: '#D4B5A0',
    muted: '#A08868',
    pressedBg: '#35455A',
    headerBtnBg: '#212A38',
    icon: '#D4B5A0',
    onPrimary: '#FFFFFF',
    tint: '#8B5CF6',
    danger: '#FF6B6B',
    dangerSoft: '#3D2121',
    dangerBorder: '#8B3A3A',
    success: '#51CF66',
    successSoft: '#1B3A1B',
    successBorder: '#2D6B47',
    info: '#6BA3FF',
    infoSoft: '#1A3A5C',
    infoBorder: '#2D5A99',
    warning: '#FFB703',
    warningSoft: '#3A3013',
    switchOn: '#8B5CF6',
    switchOff: '#4A5A6A',
    overlay: 'rgba(15,20,25,0.7)',
    shadow: '#070A0F',
  },
} as const;

export const ThemeColors = {
  light: {
    text: AppPalettes.light.text,
    background: AppPalettes.light.screenBg,
    tint: AppPalettes.light.tint,
    icon: AppPalettes.light.subtext,
    tabIconDefault: AppPalettes.light.muted,
    tabIconSelected: AppPalettes.light.tint,
  },
  dark: {
    text: AppPalettes.dark.text,
    background: AppPalettes.dark.screenBg,
    tint: AppPalettes.dark.tint,
    icon: AppPalettes.dark.subtext,
    tabIconDefault: AppPalettes.dark.muted,
    tabIconSelected: AppPalettes.dark.tint,
  },
} as const;

export const Colors = ThemeColors;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
} as const;

export const Theme = {
  colors: Colors,
  appPalettes: AppPalettes,
  fonts: Fonts,
  spacing: Spacing,
  radius: Radius,
} as const;
