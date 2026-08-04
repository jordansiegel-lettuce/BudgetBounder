import { getXpProgress } from './xpProgress';

describe('XP progress', () => {
  test.each([
    [0, { level: 1, current: 0, required: 100, nextLevelAt: 100, progress: 0 }],
    [125, { level: 2, current: 25, required: 150, nextLevelAt: 250, progress: 25 / 150 }],
    [500, { level: 4, current: 0, required: 500, nextLevelAt: 1000, progress: 0 }],
  ])('maps %i total XP to the correct server level range', (xp, expected) => {
    expect(getXpProgress(xp)).toEqual(expected);
  });

  test('caps progress at the maximum level', () => {
    expect(getXpProgress(5000)).toEqual({ level: 10, current: 0, required: 0, nextLevelAt: null, progress: 1 });
  });
});
