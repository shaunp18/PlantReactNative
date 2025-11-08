import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F5F5F5',
    tint: '#0E3B2E',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#0E3B2E',
    card: '#FFFFFF',
    border: '#E0E0E0',
  },
  dark: {
    text: '#FFFFFF',
    background: '#0B0F10',
    tint: '#B7FFD8',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#B7FFD8',
    card: '#12171A',
    border: '#1E2528',
  },
};

export const BrandColors = {
  emerald: '#0E3B2E',
  amethyst: '#6F5BD4',
  mint: '#B7FFD8',
  darkBg: '#0B0F10',
  darkCard: '#12171A',
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
