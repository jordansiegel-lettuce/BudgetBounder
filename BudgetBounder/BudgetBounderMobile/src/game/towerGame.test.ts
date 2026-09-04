import {
  TOWER_FLOORS,
  advanceRun,
  applyEncounter,
  buildGameSessionPayload,
  createRun,
  getFloorAccess,
  moveLane,
  type TowerEncounter,
} from './towerGame';

describe('tower progression', () => {
  test('unlocks every floor up to the player level and keeps later floors locked', () => {
    expect(getFloorAccess(3).map(({ floor, unlocked }) => [floor.id, unlocked])).toEqual([
      [1, true],
      [2, true],
      [3, true],
      [4, false],
      [5, false],
    ]);
  });

  test('always gives a new player access to the first floor', () => {
    expect(getFloorAccess(0)[0].unlocked).toBe(true);
  });

  test('provides five playable floors with distinct encounter routes', () => {
    expect(TOWER_FLOORS).toHaveLength(5);
    expect(new Set(TOWER_FLOORS.map(floor => floor.encounters.map(item => `${item.lane}:${item.at}`).join('|'))).size).toBe(5);
  });
});

describe('tower run rules', () => {
  test('movement stays inside the three perspective lanes', () => {
    expect(moveLane(0, -1)).toBe(0);
    expect(moveLane(1, -1)).toBe(0);
    expect(moveLane(1, 1)).toBe(2);
    expect(moveLane(2, 1)).toBe(2);
  });

  test('loot increases the finance-themed run totals once', () => {
    const run = createRun(1, 1_000);
    const coin: TowerEncounter = { id: 'coin-a', kind: 'coin', lane: 1, at: 12 };

    const collected = applyEncounter(run, coin, false);
    const collectedAgain = applyEncounter(collected, coin, false);

    expect(collected).toMatchObject({ score: 100, coins: 1, savingsStars: 0, hearts: 3 });
    expect(collectedAgain).toEqual(collected);
  });

  test('attacking defeats an enemy while an unguarded collision costs a heart', () => {
    const enemy: TowerEncounter = { id: 'enemy-a', kind: 'enemy', lane: 1, at: 18 };
    const run = createRun(1, 1_000);

    expect(applyEncounter(run, enemy, true)).toMatchObject({ score: 300, hearts: 3 });
    expect(applyEncounter(run, enemy, false)).toMatchObject({ score: 0, hearts: 2 });
  });

  test('a run ends when the knight loses the final heart', () => {
    const trap: TowerEncounter = { id: 'trap-a', kind: 'trap', lane: 1, at: 20 };
    const run = { ...createRun(1, 1_000), hearts: 1 };

    expect(applyEncounter(run, trap, false).status).toBe('defeated');
  });

  test('advancing only applies encounters in the knight lane', () => {
    const floor = TOWER_FLOORS[0];
    const run = { ...createRun(1, 1_000), progress: 11 };

    const collected = advanceRun(run, floor, 0.2, false);
    const avoided = advanceRun({ ...run, lane: 0 }, floor, 0.2, false);

    expect(collected).toMatchObject({ coins: 1, score: 100 });
    expect(avoided).toMatchObject({ coins: 0, score: 0 });
    expect(avoided.resolvedEncounterIds).toContain('f1-coin-0');
  });

  test('reaching the top completes a surviving run', () => {
    const floor = TOWER_FLOORS[0];
    const run = { ...createRun(1, 1_000), progress: 99.5 };

    expect(advanceRun(run, floor, 1, false)).toMatchObject({
      progress: floor.length,
      status: 'victory',
    });
  });
});

describe('game session integration', () => {
  test('converts a finished run to the API contract with bounded values', () => {
    const run = {
      ...createRun(2, 1_000),
      score: 1_250,
      coins: 7,
      savingsStars: 2,
      status: 'victory' as const,
    };

    expect(buildGameSessionPayload(run, 47, '12345678-1234-4123-8123-123456789abc')).toEqual({
      clientResultId: '12345678-1234-4123-8123-123456789abc',
      score: 1_250,
      durationSeconds: 47,
      coins: 7,
      savingsStars: 2,
    });
  });

  test('never submits zero seconds or out-of-range negative totals', () => {
    const run = { ...createRun(1, 1_000), score: -1, coins: -2, savingsStars: -3 };

    expect(buildGameSessionPayload(run, 0, '12345678-1234-4123-8123-123456789abc')).toMatchObject({
      score: 0,
      durationSeconds: 1,
      coins: 0,
      savingsStars: 0,
    });
  });
});
