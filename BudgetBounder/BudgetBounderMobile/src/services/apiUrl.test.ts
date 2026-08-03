import { resolveApiUrl } from './apiUrl';

describe('resolveApiUrl', () => {
  it('uses the configured URL when one is supplied', () => {
    expect(resolveApiUrl('ios', 'https://api.example.com/api', '10.0.0.4:8081'))
      .toBe('https://api.example.com/api');
  });

  it('uses the Expo development host for a physical iPhone', () => {
    expect(resolveApiUrl('ios', undefined, '10.100.102.10:8081'))
      .toBe('http://10.100.102.10:5292/api');
  });

  it('keeps the Android emulator loopback alias when no Expo host is available', () => {
    expect(resolveApiUrl('android', undefined, undefined))
      .toBe('http://10.0.2.2:5292/api');
  });
});
