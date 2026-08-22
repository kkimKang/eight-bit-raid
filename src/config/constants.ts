export const WIDTH = 640;
export const HEIGHT = 360;
/** Canvas / camera multiplier so UI text rasterizes near display size (1080p에서 1:1). */
export const RENDER_SCALE = 3;
export const GROUND_TOP = 328;
export const TILE = 16;

export const MAX_PLAYERS = 4;
export const BASE_HEARTS = 4;
export const HIT_IFRAME_MS = 900;
export const STOMP_KNOCK = 280;
export const PLAYER_MANA_MAX = 100;

export const COLORS = {
  bg: 0x12121c,
  bg2: 0x1a1a2a,
  ink: 0xf4f0e6,
  dim: 0x8a8494,
  gold: 0xffd24a,
  hp: 0xe74c3c,
  mana: 0x4aa3ff,
  magic: 0xc084fc,
  phys: 0xffd24a,
  danger: 0xff3b4e,
  ok: 0x5ee0a0,
} as const;
