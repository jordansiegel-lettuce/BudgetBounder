export type TowerLane = 0 | 1 | 2;
export type EncounterKind = 'coin' | 'relic' | 'enemy' | 'trap';

export type TowerEncounter = {
  id: string;
  kind: EncounterKind;
  lane: TowerLane;
  at: number;
};

export type TowerFloor = {
  id: number;
  name: string;
  subtitle: string;
  boss: string;
  accent: string;
  glow: string;
  speed: number;
  length: number;
  encounters: TowerEncounter[];
};

export type TowerRunStatus = 'playing' | 'paused' | 'victory' | 'defeated';

export type TowerRun = {
  floorId: number;
  lane: TowerLane;
  hearts: number;
  score: number;
  coins: number;
  savingsStars: number;
  progress: number;
  status: TowerRunStatus;
  resolvedEncounterIds: string[];
  startedAtMs: number;
};

const route = (
  floor: number,
  values: [EncounterKind, TowerLane, number][],
): TowerEncounter[] => values.map(([kind, lane, at], index) => ({
  id: `f${floor}-${kind}-${index}`,
  kind,
  lane,
  at,
}));

export const TOWER_FLOORS: TowerFloor[] = [
  {
    id: 1,
    name: 'The Ember Gate',
    subtitle: 'Learn the rhythm. Claim the first treasury key.',
    boss: 'The Toll Keeper',
    accent: '#F2B94B',
    glow: '#F68D1F',
    speed: 7.2,
    length: 100,
    encounters: route(1, [
      ['coin', 1, 12], ['coin', 0, 21], ['trap', 2, 30], ['coin', 1, 40],
      ['enemy', 1, 50], ['relic', 2, 61], ['trap', 0, 70], ['coin', 1, 79], ['enemy', 2, 90],
    ]),
  },
  {
    id: 2,
    name: 'Coinkeep Hall',
    subtitle: 'False riches guard the stairway upward.',
    boss: 'The Gilded Mimic',
    accent: '#FFD45A',
    glow: '#DB7920',
    speed: 7.8,
    length: 108,
    encounters: route(2, [
      ['coin', 2, 10], ['trap', 1, 18], ['coin', 0, 27], ['enemy', 2, 36],
      ['relic', 1, 48], ['trap', 0, 57], ['enemy', 1, 68], ['coin', 2, 78], ['trap', 1, 88], ['enemy', 0, 99],
    ]),
  },
  {
    id: 3,
    name: 'Debt Dungeon',
    subtitle: 'Break the chains before they drain your resolve.',
    boss: 'The Interest Warden',
    accent: '#66D5E8',
    glow: '#277E9E',
    speed: 8.5,
    length: 116,
    encounters: route(3, [
      ['enemy', 0, 11], ['coin', 1, 20], ['trap', 2, 29], ['enemy', 1, 38],
      ['coin', 0, 48], ['relic', 2, 58], ['trap', 1, 68], ['enemy', 0, 80], ['coin', 2, 91], ['enemy', 1, 104],
    ]),
  },
  {
    id: 4,
    name: 'Vault of Echoes',
    subtitle: 'Old spending choices return as restless shadows.',
    boss: 'The Impulse Knight',
    accent: '#B7AEFF',
    glow: '#6659C9',
    speed: 9.2,
    length: 124,
    encounters: route(4, [
      ['trap', 1, 10], ['enemy', 2, 19], ['coin', 0, 29], ['enemy', 1, 39],
      ['relic', 0, 50], ['trap', 2, 61], ['enemy', 0, 72], ['coin', 1, 83], ['trap', 0, 95], ['enemy', 2, 108], ['coin', 1, 116],
    ]),
  },
  {
    id: 5,
    name: 'The Crown Treasury',
    subtitle: 'Face the final guardian and master the tower.',
    boss: 'The Dragon of Want',
    accent: '#FF6B78',
    glow: '#A92E48',
    speed: 10,
    length: 132,
    encounters: route(5, [
      ['enemy', 1, 9], ['trap', 0, 18], ['enemy', 2, 27], ['coin', 1, 36],
      ['relic', 0, 47], ['enemy', 1, 57], ['trap', 2, 68], ['enemy', 0, 79], ['coin', 2, 90],
      ['trap', 1, 101], ['enemy', 2, 112], ['relic', 1, 123],
    ]),
  },
];

export function getFloorAccess(userLevel: number, unlockAll = false) {
  const availableLevel = Math.max(1, Math.floor(userLevel || 1));
  return TOWER_FLOORS.map(floor => ({
    floor,
    unlocked: unlockAll || floor.id <= availableLevel,
  }));
}

export function createRun(floorId: number, startedAtMs = Date.now()): TowerRun {
  const floor = TOWER_FLOORS.find(item => item.id === floorId);
  if (!floor) throw new RangeError(`Unknown tower floor: ${floorId}`);
  return {
    floorId,
    lane: 1,
    hearts: 3,
    score: 0,
    coins: 0,
    savingsStars: 0,
    progress: 0,
    status: 'playing',
    resolvedEncounterIds: [],
    startedAtMs,
  };
}

export function moveLane(lane: TowerLane, direction: -1 | 1): TowerLane {
  return Math.max(0, Math.min(2, lane + direction)) as TowerLane;
}

export function applyEncounter(run: TowerRun, encounter: TowerEncounter, attacking: boolean): TowerRun {
  if (run.resolvedEncounterIds.includes(encounter.id) || run.status !== 'playing') return run;

  let score = run.score;
  let coins = run.coins;
  let savingsStars = run.savingsStars;
  let hearts = run.hearts;

  if (encounter.kind === 'coin') {
    coins += 1;
    score += 100;
  } else if (encounter.kind === 'relic') {
    savingsStars += 1;
    score += 250;
  } else if (encounter.kind === 'enemy' && attacking) {
    score += 300;
  } else {
    hearts = Math.max(0, hearts - 1);
  }

  return {
    ...run,
    score,
    coins,
    savingsStars,
    hearts,
    status: hearts === 0 ? 'defeated' : run.status,
    resolvedEncounterIds: [...run.resolvedEncounterIds, encounter.id],
  };
}

export function advanceRun(
  run: TowerRun,
  floor: TowerFloor,
  elapsedSeconds: number,
  attacking: boolean,
): TowerRun {
  if (run.status !== 'playing' || elapsedSeconds <= 0) return run;

  const progress = Math.min(floor.length, run.progress + floor.speed * elapsedSeconds);
  let next = { ...run, progress };
  const crossed = floor.encounters.filter(encounter =>
    !run.resolvedEncounterIds.includes(encounter.id)
    && encounter.at > run.progress
    && encounter.at <= progress,
  );

  for (const encounter of crossed) {
    next = encounter.lane === next.lane
      ? applyEncounter(next, encounter, attacking)
      : { ...next, resolvedEncounterIds: [...next.resolvedEncounterIds, encounter.id] };
  }

  if (next.status === 'playing' && progress >= floor.length) {
    return { ...next, status: 'victory' };
  }
  return next;
}

export function buildGameSessionPayload(
  run: Pick<TowerRun, 'score' | 'coins' | 'savingsStars'>,
  durationSeconds: number,
  clientResultId: string,
) {
  return {
    clientResultId,
    score: Math.min(100_000, Math.max(0, Math.round(run.score))),
    durationSeconds: Math.min(7_200, Math.max(1, Math.round(durationSeconds))),
    coins: Math.min(10_000, Math.max(0, Math.round(run.coins))),
    savingsStars: Math.min(1_000, Math.max(0, Math.round(run.savingsStars))),
  };
}

export function createClientResultId(random = Math.random): string {
  const hex = (length: number) => Array.from({ length }, () => Math.floor(random() * 16).toString(16)).join('');
  return `${hex(8)}-${hex(4)}-4${hex(3)}-${((8 + Math.floor(random() * 4))).toString(16)}${hex(3)}-${hex(12)}`;
}
