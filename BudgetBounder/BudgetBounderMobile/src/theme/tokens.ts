export const bb = {
  colors: {
    canvas: '#080D1B',
    surface: '#111A2E',
    raised: '#17233B',
    text: '#F5F2E8',
    muted: '#A8B3C7',
    border: '#2B3B59',
    emerald: '#35D58A',
    gold: '#F6C95F',
    violet: '#9B7BFF',
    coral: '#FF7A72',
    cyan: '#52D9FF',
  },
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radius: { sm: 10, md: 14, lg: 18, xl: 20, screen: 28 },
} as const;

export function formatIls(value: number) {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}
