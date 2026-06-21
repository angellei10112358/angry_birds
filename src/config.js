// ============================================================
// config.js — All physical constants (Section 4, Section 9)
// ============================================================
// Self-check results (Section 9):
//   A: R_max = 1280 ≥ 1248 (1.3 × 960)  ✅
//   B: H_peak = 640 ≥ 331.5 (1.3 × 255)  ✅
//   C: step_disp = 4 < 8 (16/2)          ✅
//   V_MAX=32 ≤ SPEED_CAP=32              ✅

export const GRAVITY = 0.8;
// g=0.8 px/step² — deliberately low to maximise range (range ∝ 1/g).
// Lower g lets V_MAX stay within SPEED_CAP while still reaching D_far.

export const V_MAX = 32;
// V_MAX=32 px/step — derived from V_MAX ≥ sqrt(1.3 × 960 × 0.8) ≈ 31.6
// Rounds up to 32.  See constraint A below.

export const L_MAX = 150;
// L_max = 150 px — max slingshot stretch, within recommended [120,180].

export const SPEED_CAP = 32;
// SPEED_CAP = V_MAX = 32 px/step.  See constraint C below.

export const MIN_THICK = 16;
// MIN_THICK = 16 px — thinnest collider (glass pane).

export const SUB_STEPS = 8;
// 8 sub-steps ensures per-sub-step displacement = 32/8 = 4 < 8 = MIN_THICK/2.

export const WORLD_W = 1280;
export const WORLD_H = 720;

export const ANCHOR = { x: 220, y: 480 };

export const GROUND_Y = 660;
// Ground y position (top of ground body).

export const SAFETY = 1.3;

export const ENEMY_X_MIN = 820;
export const ENEMY_X_MAX = 1180;

// ---- Derived (for self-check) ----
export const D_FAR = ENEMY_X_MAX - ANCHOR.x;
// D_far = 1180 - 220 = 960 px — furthest enemy horizontal distance.

// ---- Materials ----
export const MATERIALS = {
  wood: { hp: 100, color: '#8B4513', stroke: '#5C2E00', restitution: 0.2 },
  glass: { hp: 50, color: '#B0E0E6', stroke: '#7EC8E3', restitution: 0.1 },
  stone: { hp: 200, color: '#696969', stroke: '#404040', restitution: 0.05 },
};

export const PIG_HP = 100;
export const PIG_RADIUS = 18;

// ---- Bird types ----
export const BIRD_TYPES = {
  red:    { radius: 15, color: '#E53935' },
  yellow: { radius: 13, color: '#FDD835', speedMult: 2 },
  blue:   { radius: 12, color: '#1E88E5', splitCount: 3, splitAngle: 0.3 }, // rad
};

// ---- Collision damage ----
export const IMPACT_THRESHOLD = 0.0015;
// Minimum collision impulse magnitude to cause HP reduction.
export const IMPACT_DMG_SCALE = 40;
// Scalar: damage = impulse * IMPACT_DMG_SCALE (then floored).

// ---- Settle detection ----
export const SETTLE_TIME = 1800;   // ms to wait after bird stops
export const SETTLE_SPEED = 0.15;  // max speed for "settled"
export const SETTLE_STEPS = 60;    // consecutive frames below threshold

// ---- Star thresholds (ratio of birds remaining) ----
export const STAR_3 = 0.8;
export const STAR_2 = 0.5;
export const STAR_1 = 0.0;

// ---- Debug ----
export const DEBUG = { showTrajectory: true, showFPS: true };
