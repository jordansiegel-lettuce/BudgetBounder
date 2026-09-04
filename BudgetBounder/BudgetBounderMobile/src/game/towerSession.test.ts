import { submitTowerSession } from './towerSession';

const payload = {
  clientResultId: '12345678-1234-4123-8123-123456789abc',
  score: 800,
  durationSeconds: 42,
  coins: 4,
  savingsStars: 1,
};

describe('tower session submission', () => {
  test('reports a fully refreshed submission when both operations succeed', async () => {
    const result = await submitTowerSession(
      payload,
      async () => ({ awardedXp: 54, validationState: 'Valid' }),
      async () => undefined,
    );

    expect(result).toEqual({
      status: 'submitted',
      result: { awardedXp: 54, validationState: 'Valid' },
      profileRefreshed: true,
    });
  });

  test('keeps the awarded result when only the later profile refresh fails', async () => {
    const result = await submitTowerSession(
      payload,
      async () => ({ awardedXp: 54, validationState: 'Valid' }),
      async () => { throw new Error('refresh unavailable'); },
    );

    expect(result).toEqual({
      status: 'submitted',
      result: { awardedXp: 54, validationState: 'Valid' },
      profileRefreshed: false,
    });
  });

  test('retains the exact payload for an idempotent retry when upload fails', async () => {
    const result = await submitTowerSession(
      payload,
      async () => { throw new Error('offline'); },
      async () => undefined,
    );

    expect(result).toEqual({ status: 'uploadFailed', payload });
  });
});
