import { getEnemyMotion, getFacing, getKnightMotion, getSwordMotion, getTorchFlicker } from './towerAnimation';

describe('tower animation poses', () => {
  test('the knight walks with a bobbing, squashing step while moving', () => {
    const a = getKnightMotion(1_000, true);
    const b = getKnightMotion(1_120, true);
    expect(a).not.toEqual(b);
    // Moving lifts him off the floor and squashes the body on the footfall.
    expect(a.lift).toBeLessThanOrEqual(0);
    expect(a.scaleX).not.toBe(1);
    expect(a.scaleY).not.toBe(1);
  });

  test('a standing knight still breathes so he never looks frozen', () => {
    const still = getKnightMotion(1_000, false);
    const later = getKnightMotion(2_400, false);
    expect(still).not.toEqual(later);
    // But he does not take strides while standing.
    expect(still.stride).toBe(0);
    expect(Math.abs(still.lift)).toBeLessThan(1.5);
  });

  test('the sword winds up, sweeps forward and follows through', () => {
    const windup = getSwordMotion(1_000, 1_000, true);
    const strike = getSwordMotion(1_210, 1_000, true);
    const resting = getSwordMotion(1_500, 1_000, false);

    expect(windup.rotation).toBeLessThan(strike.rotation);
    expect(windup.opacity).toBe(1);
    expect(resting.opacity).toBe(0);
  });

  test('the swing produces a motion trail and an impact flash', () => {
    const samples = Array.from({ length: 40 }, (_, i) => getSwordMotion(1_000 + i * 10, 1_000, true));
    expect(Math.max(...samples.map(s => s.trail))).toBeGreaterThan(0.5);
    expect(Math.max(...samples.map(s => s.flash))).toBeGreaterThan(0);
    expect(Math.max(...samples.map(s => s.lunge))).toBeGreaterThan(0);
  });

  test('enemies have offset movement cycles', () => {
    expect(getEnemyMotion(1_000, 0)).not.toEqual(getEnemyMotion(1_000, 1));
  });

  test('facing follows movement and holds when input stops', () => {
    expect(getFacing(0.8, -1)).toBe(1);
    expect(getFacing(-0.8, 1)).toBe(-1);
    expect(getFacing(0, -1)).toBe(-1);
    expect(getFacing(0.02, 1)).toBe(1);
  });

  test('torch flicker stays within a sensible brightness range', () => {
    for (let t = 0; t < 2_000; t += 37) {
      const value = getTorchFlicker(t, 1);
      expect(value).toBeGreaterThan(0.4);
      expect(value).toBeLessThan(1.05);
    }
  });
});
