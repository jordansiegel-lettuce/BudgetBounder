import { shouldObserveNotifications } from './notificationPlatform';

describe('notification platform guard', () => {
  it('does not call native notification observers in a web browser', () => {
    expect(shouldObserveNotifications('web')).toBe(false);
  });

  it.each(['android', 'ios'])('keeps notification observers enabled on %s', platform => {
    expect(shouldObserveNotifications(platform)).toBe(true);
  });
});
