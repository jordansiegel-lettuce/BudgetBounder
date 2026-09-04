import { getEnemyMotion, getKnightMotion, getSwordMotion } from './towerAnimation';

describe('tower animation poses', () => {
  test('the knight only walks while movement input is active', () => {
    expect(getKnightMotion(1_000, false)).toEqual({ lift: 0, tilt: 0 });
    expect(getKnightMotion(1_000, true)).not.toEqual(getKnightMotion(1_120, true));
  });

  test('the sword travels through a visible attack arc', () => {
    const start = getSwordMotion(1_000, 1_000, true);
    const middle = getSwordMotion(1_210, 1_000, true);
    const resting = getSwordMotion(1_500, 1_000, false);

    expect(start.rotation).toBeLessThan(middle.rotation);
    expect(start.opacity).toBe(1);
    expect(resting.opacity).toBe(0);
  });

  test('enemies have offset movement cycles', () => {
    expect(getEnemyMotion(1_000, 0)).not.toEqual(getEnemyMotion(1_000, 1));
  });
});
