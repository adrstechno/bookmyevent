import { Platform } from "react-native";

export const AppPalettes = {
  light: {
    // light palette — Modern Blue & Teal
    primary: "#007AFF",
    primaryStrong: "#0051D5",
    accent: "#00D4FF",
    rose: "#FF3B5C",
    roseSoft: "#FFE5EB",
    screenBg: "#F8FAFD",
    surfaceBg: "#FFFFFF",
    elevatedBg: "#E8F4FF",
    border: "#D0E8FF",
    text: "#0A1428",
    subtext: "#495057",
    muted: "#6C757D",
    pressedBg: "#DCE8FF",
    headerBtnBg: "#E8F1FF",
    icon: "#495057",
    onPrimary: "#FFFFFF",
    tint: "#007AFF",
    danger: "#DC3545",
    dangerSoft: "#FDE8E9",
    dangerBorder: "#F5BCBF",
    success: "#28A745",
    successSoft: "#E8F7EE",
    successBorder: "#B7E2C7",
    info: "#17A2B8",
    infoSoft: "#E1F5FE",
    infoBorder: "#80DEEA",
    warning: "#FFC107",
    warningSoft: "#FFF3E0",
    switchOn: "#007AFF",
    switchOff: "#D0D8E0",
    overlay: "rgba(10,20,40,0.4)",
    shadow: "#0A1428",
  },
  dark: {
    // dark palette — Modern Blue & Teal
    primary: '#00A0FF',
    primaryStrong: '#007AFF',
    accent: '#00E5FF',
    rose: '#FF5073',
    roseSoft: '#331820',
    screenBg: '#0D1117',
    surfaceBg: '#161B22',
    elevatedBg: '#21262D',
    border: '#30363D',
    text: '#E6EDF3',
    subtext: '#8B949E',
    muted: '#6E7681',
    pressedBg: '#262D36',
    headerBtnBg: '#1C2128',
    icon: '#8B949E',
    onPrimary: '#FFFFFF',
    tint: '#00A0FF',
    danger: '#F85149',
    dangerSoft: '#3D2621',
    dangerBorder: '#8B2C2C',
    success: '#3FB950',
    successSoft: '#163B2B',
    successBorder: '#176D46',
    info: '#79C0FF',
    infoSoft: '#0D47A1',
    infoBorder: '#1F6FEB',
    warning: '#D29922',
    warningSoft: '#3E2C0A',
    switchOn: '#00A0FF',
    switchOff: '#3D444D',
    overlay: 'rgba(6,8,13,0.7)',
    shadow: '#010409',
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
