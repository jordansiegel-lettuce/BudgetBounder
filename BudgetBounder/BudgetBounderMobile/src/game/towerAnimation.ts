export type MotionPose = { lift: number; tilt: number };
export type SwordPose = { rotation: number; opacity: number; scale: number };

export function getKnightMotion(clockMs: number, moving: boolean): MotionPose {
  if (!moving) return { lift: 0, tilt: 0 };
  const wave = Math.sin(clockMs / 85);
  return { lift: -Math.abs(wave) * 4, tilt: wave * 3.5 };
}

export function getSwordMotion(clockMs: number, attackStartedAtMs: number, attacking: boolean): SwordPose {
  if (!attacking) return { rotation: -55, opacity: 0, scale: 0.85 };
  const progress = Math.max(0, Math.min(1, (clockMs - attackStartedAtMs) / 420));
  const eased = 1 - Math.pow(1 - progress, 2);
  return { rotation: -55 + eased * 125, opacity: 1, scale: 0.85 + Math.sin(progress * Math.PI) * 0.25 };
}

export function getEnemyMotion(clockMs: number, seed: number): MotionPose {
  const wave = Math.sin(clockMs / 125 + seed * 1.7);
  return { lift: -Math.abs(wave) * 3, tilt: wave * 2.5 };
}
