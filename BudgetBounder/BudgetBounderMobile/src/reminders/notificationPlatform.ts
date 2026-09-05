export function shouldObserveNotifications(platform: string) {
  return platform !== 'web';
}
