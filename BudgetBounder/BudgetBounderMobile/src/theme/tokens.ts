import { Platform } from 'react-native';

export const bb = {
  colors: {
    canvas: '#080D1A',
    surface: '#141C2E',
    raised: '#1C2740',
    title: '#F7F3E8',
    text: '#E8EDF7',
    muted: '#AAB7D1',
    border: '#52689F',
    bevelLight: '#7892C8',
    carbon: '#080D1A',
    emerald: '#F68D1F',
    gold: '#F2B94B',
    violet: '#B7AEFF',
    coral: '#FF5B68',
    cyan: '#66D5E8',
    navGold: '#FFD45A',
    chromeSoft: '#24365A',
    floatBlue: 'rgba(98, 133, 210, 0.15)',
    floatGold: 'rgba(255, 212, 90, 0.09)',
  },
  fonts: {
    body: Platform.select({ ios: 'Arial', android: 'sans-serif', default: 'Arial' }),
    display: Platform.select({ ios: 'Arial', android: 'sans-serif-black', default: 'Arial Black' }),
  },
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radius: { sm: 8, md: 10, lg: 12, xl: 16, screen: 20 },
  motion: { driftDistance: 12, driftDurationMs: 7200, entranceDurationMs: 360 },
} as const;

export function formatIls(value: number) {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency', currency: 'ILS', maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}
