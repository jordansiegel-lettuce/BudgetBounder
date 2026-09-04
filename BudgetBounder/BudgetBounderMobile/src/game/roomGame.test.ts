import {
  DUNGEON_ROOMS,
  createDungeonRun,
  dodge,
  moveHero,
  stepDungeon,
  stepEnemies,
  strike,
  tryEnterDoor,
  type DungeonRoom,
} from './roomGame';

const emptyRoom: DungeonRoom = {
  id: 'test-room',
  kind: 'entry',
  title: 'Test Chamber',
  obstacles: [],
  enemies: [],
  loot: [],
};

describe('room movement', () => {
  test('moves freely in two dimensions and stays inside the room', () => {
    const run = createDungeonRun(1, 1_000);
    const moved = moveHero(run, emptyRoom, { x: 1, y: -1 }, 1);

    expect(moved.hero.x).toBeGreaterThan(run.hero.x);
    expect(moved.hero.y).toBeLessThan(run.hero.y);
    const clamped = moveHero({ ...run, hero: { x: 0.91, y: 0.08 } }, emptyRoom, { x: 1, y: -1 }, 2).hero;
    expect(clamped.x).toBeCloseTo(0.88);
    expect(clamped.y).toBeCloseTo(0.09);
  });

  test('starts every floor with three full hearts', () => {
    expect(createDungeonRun(5, 1_000).hearts).toBe(3);
  });

  test('blocks movement through solid room obstacles while allowing wall sliding', () => {
    const room: DungeonRoom = {
      ...emptyRoom,
      obstacles: [{ id: 'pillar', kind: 'pillar', x: 0.48, y: 0.45, width: 0.16, height: 0.2 }],
    };
    const run = { ...createDungeonRun(1, 1_000), hero: { x: 0.39, y: 0.55 } };

    const moved = moveHero(run, room, { x: 1, y: -0.5 }, 0.4);

    expect(moved.hero.x).toBeLessThan(0.44);
    expect(moved.hero.y).toBeLessThan(0.55);
  });
});

describe('room combat and rewards', () => {
  test('spikes warn before their delayed damage window', () => {
    const run = {
      ...createDungeonRun(1, 1_000),
      roomIndex: 1,
      hero: { x: 0.2, y: 0.38 },
      enemies: [],
      loot: [],
    };

    const warning = stepDungeon(run, { x: 0, y: 0 }, 0.01, 2_000);
    const almostActive = stepDungeon(warning, { x: 0, y: 0 }, 0.01, 2_699);
    const active = stepDungeon(almostActive, { x: 0, y: 0 }, 0.01, 2_700);

    expect(warning.hearts).toBe(3);
    expect(almostActive.hearts).toBe(3);
    expect(active.hearts).toBe(2);
  });

  test('enemies chase around solid obstacles instead of passing through them', () => {
    const room: DungeonRoom = {
      ...emptyRoom,
      obstacles: [{ id: 'cover', kind: 'pillar', x: 0.48, y: 0.45, width: 0.16, height: 0.2 }],
    };
    const run = {
      ...createDungeonRun(1, 1_000),
      hero: { x: 0.76, y: 0.55 },
      enemies: [{ id: 'guard', x: 0.39, y: 0.55, hp: 2, maxHp: 2, speed: 0.3, damage: 1, boss: false }],
    };

    const chased = stepEnemies(run, 1, 2_000, room);

    expect(chased.enemies[0].x).toBeLessThan(0.44);
  });

  test('solid cover blocks a melee strike', () => {
    const room: DungeonRoom = {
      ...emptyRoom,
      obstacles: [{ id: 'cover', kind: 'crate', x: 0.48, y: 0.45, width: 0.08, height: 0.1 }],
    };
    const run = {
      ...createDungeonRun(1, 1_000),
      hero: { x: 0.44, y: 0.5 },
      enemies: [{ id: 'guard', x: 0.60, y: 0.5, hp: 2, maxHp: 2, speed: 0.1, damage: 1, boss: false }],
    };

    expect(strike(run, 2_000, room).enemies[0].hp).toBe(2);
  });

  test('a strike damages only nearby living enemies and scores a defeat once', () => {
    const run = {
      ...createDungeonRun(1, 1_000),
      hero: { x: 0.5, y: 0.6 },
      enemies: [
        { id: 'near', x: 0.56, y: 0.58, hp: 1, maxHp: 1, speed: 0.1, damage: 1, boss: false },
        { id: 'far', x: 0.1, y: 0.1, hp: 2, maxHp: 2, speed: 0.1, damage: 1, boss: false },
      ],
    };

    const attacked = strike(run, 2_000);
    const attackedAgain = strike(attacked, 2_100);

    expect(attacked.enemies.map(enemy => enemy.hp)).toEqual([0, 2]);
    expect(attacked.score).toBe(300);
    expect(attackedAgain).toEqual(attacked);
  });

  test('dodge prevents contact damage during its active window', () => {
    const run = {
      ...createDungeonRun(1, 1_000),
      hero: { x: 0.5, y: 0.5 },
      enemies: [{ id: 'guard', x: 0.52, y: 0.5, hp: 2, maxHp: 2, speed: 0.1, damage: 1, boss: false }],
    };

    expect(stepEnemies(dodge(run, 2_000), 0.1, 2_100).hearts).toBe(3);
    expect(stepEnemies(run, 0.1, 2_100).hearts).toBe(2);
  });
});

describe('room progression', () => {
  test('keeps the exit sealed while a living enemy remains', () => {
    const run = {
      ...createDungeonRun(1, 1_000),
      roomIndex: 2,
      hero: { x: 0.5, y: 0.07 },
      enemies: DUNGEON_ROOMS[2].enemies.map(enemy => ({ ...enemy })),
    };

    expect(tryEnterDoor(run, DUNGEON_ROOMS[2])).toBe(run);
  });

  test('moves to the next room after clearing it and reaching the north door', () => {
    const run = {
      ...createDungeonRun(1, 1_000),
      hero: { x: 0.5, y: 0.07 },
      enemies: [],
    };

    const advanced = tryEnterDoor(run, DUNGEON_ROOMS[0]);

    expect(advanced.roomIndex).toBe(1);
    expect(advanced.hero).toEqual({ x: 0.5, y: 0.86 });
  });

  test('defeating the guardian and entering the final door wins the floor', () => {
    const lastRoom = DUNGEON_ROOMS[DUNGEON_ROOMS.length - 1];
    const run = {
      ...createDungeonRun(1, 1_000),
      roomIndex: DUNGEON_ROOMS.length - 1,
      hero: { x: 0.5, y: 0.07 },
      enemies: lastRoom.enemies.map(enemy => ({ ...enemy, hp: 0 })),
    };

    expect(tryEnterDoor(run, lastRoom).status).toBe('victory');
  });
});
