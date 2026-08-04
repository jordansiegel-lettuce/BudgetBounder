const levelStarts = [0, 100, 250, 500, 1000, 2000, 3000, 4000, 4500, 5000] as const;

export function getXpProgress(xp: number) {
  const safeXp = Math.max(0, xp);
  let levelIndex = levelStarts.findLastIndex(start => safeXp >= start);
  if (levelIndex < 0) levelIndex = 0;
  if (levelIndex === levelStarts.length - 1) {
    return { level: 10, current: 0, required: 0, nextLevelAt: null, progress: 1 };
  }
  const start = levelStarts[levelIndex];
  const nextLevelAt = levelStarts[levelIndex + 1];
  const current = safeXp - start;
  const required = nextLevelAt - start;
  return { level: levelIndex + 1, current, required, nextLevelAt, progress: current / required };
}
