import { Platform } from "react-native";

export const AppPalettes = {
  light: {
    // light palette — Consistent teal theme
    primary: "#3C6E71",
    primaryStrong: "#2F5B5E",
    accent: "#0F766E",
    rose: "#3C6E71",
    roseSoft: "#E0F2F1",
    screenBg: "#F3F7F6",
    surfaceBg: "#FFFFFF",
    elevatedBg: "#F8FAFA",
    border: "#D1E3E1",
    elevatedBorder: "#B8D4D1",
    text: "#0F172A",
    subtext: "#64748B",
    muted: "#94A3B8",
    pressedBg: "#E0F2F1",
    headerBtnBg: "#F0F9F8",
    icon: "#64748B",
    onPrimary: "#FFFFFF",
    tint: "#3C6E71",
    danger: "#DC2626",
    dangerSoft: "#FEE2E2",
    dangerBorder: "#FCA5A5",
    success: "#059669",
    successSoft: "#D1FAE5",
    successBorder: "#86EFAC",
    info: "#1D4ED8",
    infoSoft: "#DBEAFE",
    infoBorder: "#93C5FD",
    warning: "#F59E0B",
    warningSoft: "#FEF3C7",
    warningBorder: "#FDE68A",
    switchOn: "#3C6E71",
    switchOff: "#D1E3E1",
    overlay: "rgba(15, 23, 42, 0.45)",
    shadow: "#0F172A",
  },
  dark: {
    // dark palette — Same teal theme with darker backgrounds
    primary: "#3C6E71",
    primaryStrong: "#2F5B5E",
    accent: "#0F766E",
    rose: "#3C6E71",
    roseSoft: "#2D1F1A",
    screenBg: "#1A1410",
    surfaceBg: "#2B1F18",
    elevatedBg: "#3A2820",
    border: "#4A3830",
    elevatedBorder: "#5A4840",
    text: "#F5E6D3",
    subtext: "#C4A890",
    muted: "#A08868",
    pressedBg: "#3A2820",
    headerBtnBg: "#2B1F18",
    icon: "#C4A890",
    onPrimary: "#FFFFFF",
    tint: "#3C6E71",
    danger: "#DC2626",
    dangerSoft: "#3D2121",
    dangerBorder: "#7F1D1D",
    success: "#059669",
    successSoft: "#1B3A1B",
    successBorder: "#2D6B47",
    info: "#1D4ED8",
    infoSoft: "#1A3A5C",
    infoBorder: "#2D5A99",
    warning: "#F59E0B",
    warningSoft: "#3A3013",
    warningBorder: "#6B5A2D",
    switchOn: "#3C6E71",
    switchOff: "#4A5A6A",
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
