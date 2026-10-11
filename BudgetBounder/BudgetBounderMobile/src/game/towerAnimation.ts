export type MotionPose = {
  /** Vertical bob, in pixels. Negative lifts the sprite off the floor. */
  lift: number;
  /** Body sway, in degrees. */
  tilt: number;
  /** Horizontal squash. 1 is the resting width. */
  scaleX: number;
  /** Vertical stretch. 1 is the resting height. */
  scaleY: number;
  /** 0 when both feet are planted, 1 at the top of a stride. */
  stride: number;
};

export type SwordPose = {
  /** Blade angle, in degrees, swept around the knight's shoulder. */
  rotation: number;
  opacity: number;
  scale: number;
  /** Strength of the motion-blur ghosts that follow the blade, 0 to 1. */
  trail: number;
  /** Forward lunge of the body during the swing, in pixels. */
  lunge: number;
  /** Impact spark at the moment the blade connects, 0 to 1. */
  flash: number;
};

const STEP_MS = 148;
const SWING_MS = 420;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

/**
 * A two-beat walk cycle. The knight is a single sprite, so the illusion of
 * walking comes from bobbing on each footfall, swaying into the step and
 * squashing on impact - a body in motion rather than a picture being slid
 * across the floor. Standing still still breathes, so he never looks frozen.
 */
export function getKnightMotion(clockMs: number, moving: boolean): MotionPose {
  if (!moving) {
    const breath = Math.sin(clockMs / 640);
    return {
      lift: breath * 0.9,
      tilt: breath * 0.5,
      scaleX: 1 - breath * 0.012,
      scaleY: 1 + breath * 0.018,
      stride: 0,
    };
  }

  const phase = clockMs / STEP_MS;
  const sway = Math.sin(phase);
  // Two bounces per full cycle: one per foot.
  const bounce = Math.abs(Math.sin(phase));
  // Compresses as the foot lands, extends at the top of the step.
  const impact = Math.cos(phase * 2);

  return {
    lift: -bounce * 5.5,
    tilt: sway * 4.5,
    scaleX: 1 + impact * 0.05,
    scaleY: 1 - impact * 0.06,
    stride: bounce,
  };
}

/**
 * A sword swing with weight: a short windup that pulls the blade back, a fast
 * sweep through the strike, then a slower follow-through. The trail and flash
 * outputs let the renderer draw motion ghosts and an impact spark, which is
 * what actually reads as "a sword was swung" rather than a spinning icon.
 */
export function getSwordMotion(clockMs: number, attackStartedAtMs: number, attacking: boolean): SwordPose {
  if (!attacking) return { rotation: -62, opacity: 0, scale: 0.85, trail: 0, lunge: 0, flash: 0 };

  const progress = clamp01((clockMs - attackStartedAtMs) / SWING_MS);

  // Windup: the blade drifts back and up before the strike.
  if (progress < 0.24) {
    const windup = progress / 0.24;
    return {
      rotation: -62 - windup * 26,
      opacity: 1,
      scale: 0.85 + windup * 0.1,
      trail: 0,
      lunge: -windup * 3,
      flash: 0,
    };
  }

  // Strike: a fast, decelerating sweep through the arc.
  if (progress < 0.58) {
    const swing = (progress - 0.24) / 0.34;
    const eased = 1 - Math.pow(1 - swing, 3);
    return {
      rotation: -88 + eased * 150,
      opacity: 1,
      scale: 0.95 + Math.sin(swing * Math.PI) * 0.22,
      trail: Math.sin(swing * Math.PI),
      lunge: Math.sin(swing * Math.PI) * 9,
      flash: swing > 0.55 ? Math.sin(((swing - 0.55) / 0.45) * Math.PI) : 0,
    };
  }

  // Follow-through: the blade settles and fades out.
  const recover = (progress - 0.58) / 0.42;
  return {
    rotation: 62 - recover * 22,
    opacity: recover > 0.7 ? 1 - (recover - 0.7) / 0.3 : 1,
    scale: 1.17 - recover * 0.32,
    trail: Math.max(0, 0.45 * (1 - recover)),
    lunge: Math.max(0, 5 * (1 - recover)),
    flash: 0,
  };
}

export function getEnemyMotion(clockMs: number, seed: number): MotionPose {
  const phase = clockMs / 125 + seed * 1.7;
  const wave = Math.sin(phase);
  const bounce = Math.abs(wave);
  return {
    lift: -bounce * 3,
    tilt: wave * 2.5,
    scaleX: 1 + Math.cos(phase * 2) * 0.035,
    scaleY: 1 - Math.cos(phase * 2) * 0.04,
    stride: bounce,
  };
}

/** Keeps the knight facing the way he last moved so he never walks backwards. */
export function getFacing(inputX: number, previous: 1 | -1): 1 | -1 {
  if (inputX > 0.12) return 1;
  if (inputX < -0.12) return -1;
  return previous;
}

/** Torch flicker for the room lighting. Returns a 0-1 brightness. */
export function getTorchFlicker(clockMs: number, seed: number) {
  const slow = Math.sin(clockMs / 340 + seed * 2.3);
  const fast = Math.sin(clockMs / 97 + seed * 5.1);
  return 0.72 + slow * 0.16 + fast * 0.12;
}
