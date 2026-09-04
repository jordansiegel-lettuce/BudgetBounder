export type Vector2 = { x: number; y: number };
export type RoomKind = 'entry' | 'hazard' | 'combat' | 'treasure' | 'guardian';
export type ObstacleKind = 'pillar' | 'crate' | 'spikes';

export type RoomObstacle = {
  id: string;
  kind: ObstacleKind;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DungeonEnemy = Vector2 & {
  id: string;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  boss: boolean;
};

export type DungeonLoot = Vector2 & {
  id: string;
  kind: 'coin' | 'relic';
  collected: boolean;
};

export type DungeonRoom = {
  id: string;
  kind: RoomKind;
  title: string;
  obstacles: RoomObstacle[];
  enemies: DungeonEnemy[];
  loot: DungeonLoot[];
};

export type DungeonRun = {
  floorId: number;
  roomIndex: number;
  hero: Vector2;
  hearts: number;
  score: number;
  coins: number;
  savingsStars: number;
  status: 'playing' | 'paused' | 'victory' | 'defeated';
  enemies: DungeonEnemy[];
  loot: DungeonLoot[];
  startedAtMs: number;
  lastAttackAtMs: number;
  hurtUntilMs: number;
  dodgeUntilMs: number;
  dodgeCooldownUntilMs: number;
  clockMs: number;
  spikeArmedAtMs: Record<string, number>;
};

export type SpikePhase = 'idle' | 'warning' | 'active';

export const MAX_HEARTS = 3;
export const SPIKE_WARNING_MS = 700;
export const SPIKE_ACTIVE_MS = 450;

const enemy = (id: string, x: number, y: number, hp = 2, boss = false): DungeonEnemy => ({
  id, x, y, hp, maxHp: hp, speed: boss ? 0.105 : 0.085, damage: 1, boss,
});
const loot = (id: string, kind: DungeonLoot['kind'], x: number, y: number): DungeonLoot => ({
  id, kind, x, y, collected: false,
});

export const DUNGEON_ROOMS: DungeonRoom[] = [
  {
    id: 'gatehouse', kind: 'entry', title: 'The Gatehouse',
    obstacles: [
      { id: 'gate-pillar-l', kind: 'pillar', x: 0.17, y: 0.32, width: 0.13, height: 0.18 },
      { id: 'gate-pillar-r', kind: 'pillar', x: 0.70, y: 0.32, width: 0.13, height: 0.18 },
    ],
    enemies: [],
    loot: [loot('gate-coin', 'coin', 0.5, 0.46)],
  },
  {
    id: 'blade-gallery', kind: 'hazard', title: 'The Blade Gallery',
    obstacles: [
      { id: 'spikes-l', kind: 'spikes', x: 0.12, y: 0.34, width: 0.26, height: 0.11 },
      { id: 'spikes-r', kind: 'spikes', x: 0.62, y: 0.56, width: 0.26, height: 0.11 },
      { id: 'gallery-pillar', kind: 'pillar', x: 0.44, y: 0.40, width: 0.12, height: 0.20 },
    ],
    enemies: [],
    loot: [loot('gallery-coin-a', 'coin', 0.2, 0.62), loot('gallery-coin-b', 'coin', 0.79, 0.30)],
  },
  {
    id: 'guard-barracks', kind: 'combat', title: 'The Guard Barracks',
    obstacles: [
      { id: 'barracks-crate-l', kind: 'crate', x: 0.15, y: 0.44, width: 0.14, height: 0.13 },
      { id: 'barracks-crate-r', kind: 'crate', x: 0.71, y: 0.44, width: 0.14, height: 0.13 },
    ],
    enemies: [enemy('guard-a', 0.30, 0.32), enemy('guard-b', 0.70, 0.32)],
    loot: [loot('barracks-coin', 'coin', 0.5, 0.35)],
  },
  {
    id: 'moon-vault', kind: 'treasure', title: 'The Moon Vault',
    obstacles: [
      { id: 'vault-pillar-l', kind: 'pillar', x: 0.20, y: 0.36, width: 0.12, height: 0.20 },
      { id: 'vault-pillar-r', kind: 'pillar', x: 0.68, y: 0.36, width: 0.12, height: 0.20 },
    ],
    enemies: [enemy('vault-guard', 0.5, 0.28, 3)],
    loot: [loot('vault-coin-a', 'coin', 0.31, 0.65), loot('vault-relic', 'relic', 0.5, 0.42), loot('vault-coin-b', 'coin', 0.69, 0.65)],
  },
  {
    id: 'crown-chamber', kind: 'guardian', title: 'The Crown Chamber',
    obstacles: [
      { id: 'crown-pillar-l', kind: 'pillar', x: 0.11, y: 0.36, width: 0.12, height: 0.22 },
      { id: 'crown-pillar-r', kind: 'pillar', x: 0.77, y: 0.36, width: 0.12, height: 0.22 },
    ],
    enemies: [enemy('floor-guardian', 0.5, 0.27, 5, true)],
    loot: [loot('crown-relic', 'relic', 0.5, 0.15)],
  },
];

const HERO_RADIUS = 0.045;
const HERO_SPEED = 0.42;
const ROOM_MIN_X = 0.12;
const ROOM_MAX_X = 0.88;
const ROOM_MIN_Y = 0.09;
const ROOM_MAX_Y = 0.88;

function spawnEnemies(room: DungeonRoom, floorId: number): DungeonEnemy[] {
  const hpBonus = Math.max(0, floorId - 1);
  return room.enemies.map(item => ({
    ...item,
    hp: item.hp + hpBonus,
    maxHp: item.maxHp + hpBonus,
    speed: item.speed + hpBonus * 0.008,
  }));
}

function spawnLoot(room: DungeonRoom): DungeonLoot[] {
  return room.loot.map(item => ({ ...item, collected: false }));
}

export function createDungeonRun(floorId: number, startedAtMs = Date.now()): DungeonRun {
  const firstRoom = DUNGEON_ROOMS[0];
  return {
    floorId,
    roomIndex: 0,
    hero: { x: 0.5, y: 0.86 },
    hearts: MAX_HEARTS,
    score: 0,
    coins: 0,
    savingsStars: 0,
    status: 'playing',
    enemies: spawnEnemies(firstRoom, floorId),
    loot: spawnLoot(firstRoom),
    startedAtMs,
    lastAttackAtMs: 0,
    hurtUntilMs: 0,
    dodgeUntilMs: 0,
    dodgeCooldownUntilMs: 0,
    clockMs: startedAtMs,
    spikeArmedAtMs: {},
  };
}

function normalized(input: Vector2): Vector2 {
  const magnitude = Math.hypot(input.x, input.y);
  if (magnitude <= 1) return input;
  return { x: input.x / magnitude, y: input.y / magnitude };
}

function hitsSolid(point: Vector2, room: DungeonRoom, radius = HERO_RADIUS): boolean {
  return room.obstacles.some(item => item.kind !== 'spikes'
    && point.x + radius > item.x
    && point.x - radius < item.x + item.width
    && point.y + radius > item.y
    && point.y - radius < item.y + item.height);
}

function moveWithCollision(start: Vector2, delta: Vector2, room: DungeonRoom, radius = HERO_RADIUS): Vector2 {
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(delta.x), Math.abs(delta.y)) / 0.02));
  let point = start;
  for (let index = 0; index < steps; index += 1) {
    const nextX = Math.max(ROOM_MIN_X, Math.min(ROOM_MAX_X, point.x + delta.x / steps));
    if (!hitsSolid({ x: nextX, y: point.y }, room, radius)) point = { ...point, x: nextX };
    const nextY = Math.max(ROOM_MIN_Y, Math.min(ROOM_MAX_Y, point.y + delta.y / steps));
    if (!hitsSolid({ x: point.x, y: nextY }, room, radius)) point = { ...point, y: nextY };
  }
  return point;
}

function segmentCrossesSolid(start: Vector2, end: Vector2, room: DungeonRoom): boolean {
  return room.obstacles.some(item => {
    if (item.kind === 'spikes') return false;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    let near = 0;
    let far = 1;
    for (const [origin, direction, minimum, maximum] of [
      [start.x, dx, item.x, item.x + item.width],
      [start.y, dy, item.y, item.y + item.height],
    ] as const) {
      if (Math.abs(direction) < 0.000001) {
        if (origin < minimum || origin > maximum) return false;
        continue;
      }
      const first = (minimum - origin) / direction;
      const second = (maximum - origin) / direction;
      near = Math.max(near, Math.min(first, second));
      far = Math.min(far, Math.max(first, second));
      if (near > far) return false;
    }
    return true;
  });
}

export function moveHero(run: DungeonRun, room: DungeonRoom, rawInput: Vector2, elapsedSeconds: number, nowMs = Date.now()): DungeonRun {
  if (run.status !== 'playing' || elapsedSeconds <= 0) return run;
  const input = normalized(rawInput);
  const dodgeBoost = run.dodgeUntilMs > nowMs ? 1.7 : 1;
  const distance = HERO_SPEED * dodgeBoost * elapsedSeconds;
  return { ...run, hero: moveWithCollision(run.hero, { x: input.x * distance, y: input.y * distance }, room) };
}

export function strike(run: DungeonRun, nowMs = Date.now(), room = DUNGEON_ROOMS[run.roomIndex]): DungeonRun {
  if (run.status !== 'playing' || nowMs - run.lastAttackAtMs < 380) return run;
  let score = run.score;
  const enemies = run.enemies.map(item => {
    if (item.hp <= 0
      || Math.hypot(item.x - run.hero.x, item.y - run.hero.y) > 0.19
      || segmentCrossesSolid(run.hero, item, room)) return item;
    const hp = Math.max(0, item.hp - 1);
    if (hp === 0) score += item.boss ? 800 : 300;
    return { ...item, hp };
  });
  return { ...run, enemies, score, lastAttackAtMs: nowMs };
}

export function dodge(run: DungeonRun, nowMs = Date.now()): DungeonRun {
  if (run.status !== 'playing' || nowMs < run.dodgeCooldownUntilMs) return run;
  return { ...run, dodgeUntilMs: nowMs + 520, dodgeCooldownUntilMs: nowMs + 1_450 };
}

export function stepEnemies(run: DungeonRun, elapsedSeconds: number, nowMs = Date.now(), room = DUNGEON_ROOMS[run.roomIndex]): DungeonRun {
  if (run.status !== 'playing') return run;
  const enemies = run.enemies.map(item => {
    if (item.hp <= 0) return item;
    const dx = run.hero.x - item.x;
    const dy = run.hero.y - item.y;
    const distance = Math.max(0.001, Math.hypot(dx, dy));
    const step = Math.min(distance, item.speed * elapsedSeconds);
    return { ...item, ...moveWithCollision(item, { x: dx / distance * step, y: dy / distance * step }, room) };
  });
  const touching = enemies.some(item => item.hp > 0 && Math.hypot(item.x - run.hero.x, item.y - run.hero.y) < 0.09);
  if (!touching || nowMs < run.hurtUntilMs || nowMs < run.dodgeUntilMs) return { ...run, enemies };
  const hearts = Math.max(0, run.hearts - 1);
  return { ...run, enemies, hearts, hurtUntilMs: nowMs + 900, status: hearts === 0 ? 'defeated' : run.status };
}

function collectNearbyLoot(run: DungeonRun): DungeonRun {
  let coins = run.coins;
  let savingsStars = run.savingsStars;
  let score = run.score;
  const lootItems = run.loot.map(item => {
    if (item.collected || Math.hypot(item.x - run.hero.x, item.y - run.hero.y) > 0.075) return item;
    if (item.kind === 'coin') {
      coins += 1;
      score += 100;
    } else {
      savingsStars += 1;
      score += 250;
    }
    return { ...item, collected: true };
  });
  return { ...run, coins, savingsStars, score, loot: lootItems };
}

function isInside(point: Vector2, obstacle: RoomObstacle): boolean {
  return point.x > obstacle.x && point.x < obstacle.x + obstacle.width
    && point.y > obstacle.y && point.y < obstacle.y + obstacle.height;
}

export function getSpikePhase(run: DungeonRun, obstacleId: string, nowMs = run.clockMs): SpikePhase {
  const armedAt = run.spikeArmedAtMs[obstacleId];
  if (armedAt === undefined) return 'idle';
  const elapsed = nowMs - armedAt;
  if (elapsed < SPIKE_WARNING_MS) return 'warning';
  if (elapsed < SPIKE_WARNING_MS + SPIKE_ACTIVE_MS) return 'active';
  return 'idle';
}

function updateSpikeTraps(run: DungeonRun, room: DungeonRoom, nowMs: number): DungeonRun {
  const armed = { ...run.spikeArmedAtMs };
  let next = run;
  for (const trap of room.obstacles.filter(item => item.kind === 'spikes')) {
    const onTrap = isInside(run.hero, trap);
    const armedAt = armed[trap.id];
    if (armedAt === undefined) {
      if (onTrap) armed[trap.id] = nowMs;
      continue;
    }
    const elapsed = nowMs - armedAt;
    if (elapsed >= SPIKE_WARNING_MS + SPIKE_ACTIVE_MS) {
      if (onTrap) armed[trap.id] = nowMs;
      else delete armed[trap.id];
      continue;
    }
    if (elapsed >= SPIKE_WARNING_MS && onTrap && nowMs >= next.hurtUntilMs && nowMs >= next.dodgeUntilMs) {
      const hearts = Math.max(0, next.hearts - 1);
      next = { ...next, hearts, hurtUntilMs: nowMs + 900, status: hearts === 0 ? 'defeated' : next.status };
    }
  }
  return { ...next, spikeArmedAtMs: armed };
}

export function isRoomClear(run: DungeonRun, room: DungeonRoom): boolean {
  const enemiesCleared = run.enemies.every(item => item.hp <= 0);
  const treasureClaimed = room.kind !== 'treasure' || run.loot.every(item => item.collected);
  return enemiesCleared && treasureClaimed;
}

export function tryEnterDoor(run: DungeonRun, room: DungeonRoom): DungeonRun {
  const atDoor = run.hero.y <= 0.1 && Math.abs(run.hero.x - 0.5) <= 0.17;
  if (run.status !== 'playing' || !atDoor || !isRoomClear(run, room)) return run;
  if (run.roomIndex >= DUNGEON_ROOMS.length - 1) return { ...run, status: 'victory' };
  const roomIndex = run.roomIndex + 1;
  const nextRoom = DUNGEON_ROOMS[roomIndex];
  return {
    ...run,
    roomIndex,
    hero: { x: 0.5, y: 0.86 },
    enemies: spawnEnemies(nextRoom, run.floorId),
    loot: spawnLoot(nextRoom),
    hurtUntilMs: 0,
    spikeArmedAtMs: {},
  };
}

export function stepDungeon(
  run: DungeonRun,
  input: Vector2,
  elapsedSeconds: number,
  nowMs = Date.now(),
): DungeonRun {
  if (run.status !== 'playing') return run;
  const room = DUNGEON_ROOMS[run.roomIndex];
  let next = moveHero({ ...run, clockMs: nowMs }, room, input, elapsedSeconds, nowMs);
  next = collectNearbyLoot(next);
  next = updateSpikeTraps(next, room, nowMs);
  next = stepEnemies(next, elapsedSeconds, nowMs, room);
  return tryEnterDoor(next, room);
}
