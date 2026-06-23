/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#f68d1f';
const tintColorDark = '#ecab37';

export const Colors = {
  light: {
    text: '#21242e',
    background: '#7a8aba',
    tint: tintColorLight,
    icon: '#60619c',
    tabIconDefault: '#c0d5e6',
    tabIconSelected: tintColorLight,
    card: '#dedede',
    mutedText: '#3d4f97',
    border: '#3d4f97',
    success: '#206479',
    warning: '#ecab37',
    danger: '#e60012',
    accent: '#f68d1f',
    surface: '#ffffff',
    chrome: '#7a8aba',
    chromeSoft: '#9fbee7',
    carbon: '#21242e',
    navGold: '#e48600',
    amber: '#ecab37',
    lavender: '#acace7',
    ice: '#c0d5e6',
    bevelLight: '#c0d5e6',
    bevelDark: '#3d4f97',
  },
  dark: {
    text: '#ffffff',
    background: '#3d4f97',
    tint: tintColorDark,
    icon: '#c0d5e6',
    tabIconDefault: '#9fbee7',
    tabIconSelected: tintColorDark,
    card: '#60619c',
    mutedText: '#c0d5e6',
    border: '#c0d5e6',
    success: '#9fbee7',
    warning: '#ecab37',
    danger: '#ff5a66',
    accent: '#f68d1f',
    surface: '#ffffff',
    chrome: '#7a8aba',
    chromeSoft: '#9fbee7',
    carbon: '#21242e',
    navGold: '#e48600',
    amber: '#ecab37',
    lavender: '#acace7',
    ice: '#c0d5e6',
    bevelLight: '#c0d5e6',
    bevelDark: '#21242e',
  },
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
