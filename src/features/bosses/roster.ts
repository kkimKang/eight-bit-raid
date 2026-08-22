import type { BossId, PlatformRect, ResistRow } from "../../shared/types";
import type { DifficultyId } from "../../config/difficulties";

export interface BossDef {
  id: BossId;
  name: string;
  title: string;
  texture: string;
  color: number;
  baseHp: number;
  maxMana: number;
  size: number;
  layout: PlatformRect[];
  resist: Record<DifficultyId, ResistRow>;
  soloResist: Record<DifficultyId, ResistRow>;
  minDifficulty: DifficultyId;
}

const floor: PlatformRect[] = [{ x: 0, y: 328, w: 640, h: 32, key: "tile" }];
const twoLedges: PlatformRect[] = [
  ...floor,
  { x: 48, y: 232, w: 112, h: 14, key: "tile" },
  { x: 480, y: 232, w: 112, h: 14, key: "tile" },
];
const threeLanes: PlatformRect[] = [
  ...floor,
  { x: 40, y: 250, w: 140, h: 14, key: "tile" },
  { x: 250, y: 190, w: 140, h: 14, key: "tile" },
  { x: 460, y: 250, w: 140, h: 14, key: "tile" },
];

function r(physical: number, magic: number): ResistRow {
  return { physical, magic };
}

export const BOSSES: BossDef[] = [
  {
    id: "chomper",
    name: "CHOMPER",
    title: "점묘의 포식자",
    texture: "boss-chomper",
    color: 0xffd24a,
    baseHp: 1700,
    maxMana: 560,
    size: 40,
    layout: threeLanes,
    resist: {
      easy: r(0, 0),
      normal: r(0.3, 0.3),
      hard: r(0.4, 0.4),
      impossible: r(0.45, 0.45),
    },
    soloResist: {
      easy: r(0, 0),
      normal: r(0.3, 0.3),
      hard: r(0.4, 0.4),
      impossible: r(0.45, 0.45),
    },
    minDifficulty: "easy",
  },
  {
    id: "bubblor",
    name: "BUBBLOR",
    title: "거품 왕",
    texture: "boss-bubblor",
    color: 0x5ee0a0,
    baseHp: 2000,
    maxMana: 580,
    size: 44,
    layout: twoLedges,
    resist: {
      easy: r(0, 0.5),
      normal: r(0.4, 0.6),
      hard: r(0.45, 0.65),
      impossible: r(0.4, 0.85),
    },
    soloResist: {
      easy: r(0, 0),
      normal: r(0.3, 0.3),
      hard: r(0.4, 0.4),
      impossible: r(0.4, 0.4),
    },
    minDifficulty: "easy",
  },
  {
    id: "bombit",
    name: "BOMBIT",
    title: "폭파 기사",
    texture: "boss-bombit",
    color: 0xf4f0e6,
    baseHp: 2300,
    maxMana: 600,
    size: 36,
    layout: floor,
    resist: {
      easy: r(0.4, 0.2),
      normal: r(0.55, 0.35),
      hard: r(0.65, 0.4),
      impossible: r(0.85, 0.4),
    },
    soloResist: {
      easy: r(0, 0),
      normal: r(0.2, 0.2),
      hard: r(0.25, 0.25),
      impossible: r(0.4, 0.4),
    },
    minDifficulty: "easy",
  },
  {
    id: "tyrant",
    name: "TYRANT",
    title: "용암 폭군",
    texture: "boss-tyrant",
    color: 0xe67e22,
    baseHp: 2600,
    maxMana: 620,
    size: 48,
    layout: [
      { x: 0, y: 328, w: 640, h: 32, key: "tile-lava" },
      { x: 24, y: 268, w: 160, h: 14, key: "tile" },
      { x: 240, y: 220, w: 160, h: 14, key: "tile" },
      { x: 456, y: 268, w: 160, h: 14, key: "tile" },
    ],
    resist: {
      easy: r(0.2, 0.4),
      normal: r(0.45, 0.55),
      hard: r(0.45, 0.65),
      impossible: r(0.45, 0.8),
    },
    soloResist: {
      easy: r(0, 0),
      normal: r(0.3, 0.3),
      hard: r(0.4, 0.4),
      impossible: r(0.45, 0.5),
    },
    minDifficulty: "easy",
  },
  {
    id: "ringo",
    name: "RINGO",
    title: "서커스 마스터",
    texture: "boss-ringo",
    color: 0xe74c3c,
    baseHp: 2700,
    maxMana: 600,
    size: 36,
    layout: twoLedges,
    resist: {
      easy: r(0.45, 0.25),
      normal: r(0.6, 0.4),
      hard: r(0.7, 0.5),
      impossible: r(0.8, 0.6),
    },
    soloResist: {
      easy: r(0.25, 0.25),
      normal: r(0.4, 0.4),
      hard: r(0.5, 0.5),
      impossible: r(0.6, 0.6),
    },
    minDifficulty: "easy",
  },
  {
    id: "icicle",
    name: "ICICLE",
    title: "빙하 등반가",
    texture: "boss-icicle",
    color: 0x4aa3ff,
    baseHp: 2800,
    maxMana: 640,
    size: 36,
    layout: [
      { x: 0, y: 328, w: 128, h: 16, key: "tile" },
      { x: 128, y: 328, w: 128, h: 16, key: "tile" },
      { x: 256, y: 328, w: 128, h: 16, key: "tile" },
      { x: 384, y: 328, w: 128, h: 16, key: "tile" },
      { x: 512, y: 328, w: 128, h: 16, key: "tile" },
      { x: 80, y: 236, w: 96, h: 14, key: "tile" },
      { x: 280, y: 188, w: 96, h: 14, key: "tile" },
      { x: 480, y: 236, w: 96, h: 14, key: "tile" },
    ],
    resist: {
      easy: r(0.1, 0),
      normal: r(0.4, 0.3),
      hard: r(0.45, 0.35),
      impossible: r(0.5, 0.4),
    },
    soloResist: {
      easy: r(0, 0),
      normal: r(0.3, 0.3),
      hard: r(0.35, 0.35),
      impossible: r(0.4, 0.4),
    },
    minDifficulty: "easy",
  },
  {
    id: "ironclad",
    name: "IRONCLAD",
    title: "강철 전차",
    texture: "boss-ironclad",
    color: 0x8a8494,
    baseHp: 3400,
    maxMana: 520,
    size: 48,
    layout: floor,
    resist: {
      easy: r(0.4, 0.4),
      normal: r(0.5, 0.5),
      hard: r(0.6, 0.6),
      impossible: r(0.65, 0.65),
    },
    soloResist: {
      easy: r(0.4, 0.4),
      normal: r(0.5, 0.5),
      hard: r(0.6, 0.6),
      impossible: r(0.65, 0.65),
    },
    minDifficulty: "easy",
  },
  {
    id: "masked",
    name: "MASKED",
    title: "가면 검성",
    texture: "boss-masked",
    color: 0xc084fc,
    baseHp: 2400,
    maxMana: 500,
    size: 40,
    layout: twoLedges,
    resist: {
      easy: r(0, 0),
      normal: r(0.3, 0.3),
      hard: r(0.4, 0.4),
      impossible: r(0.4, 0.4),
    },
    soloResist: {
      easy: r(0, 0),
      normal: r(0.3, 0.3),
      hard: r(0.4, 0.4),
      impossible: r(0.4, 0.4),
    },
    minDifficulty: "easy",
  },
  {
    id: "gondola",
    name: "GONDOLA",
    title: "풍선 에이스",
    texture: "boss-gondola",
    color: 0xff8fab,
    baseHp: 3000,
    maxMana: 640,
    size: 40,
    layout: [
      { x: 0, y: 328, w: 160, h: 32, key: "tile" },
      { x: 480, y: 328, w: 160, h: 32, key: "tile" },
      { x: 160, y: 328, w: 320, h: 32, key: "tile-water" },
      { x: 40, y: 220, w: 100, h: 14, key: "tile" },
      { x: 500, y: 220, w: 100, h: 14, key: "tile" },
      { x: 248, y: 28, w: 144, h: 12, key: "tile-spike" },
    ],
    resist: {
      easy: r(0.95, 0.95),
      normal: r(0.95, 0.95),
      hard: r(0.95, 0.95),
      impossible: r(0.95, 0.95),
    },
    soloResist: {
      easy: r(0.95, 0.95),
      normal: r(0.95, 0.95),
      hard: r(0.95, 0.95),
      impossible: r(0.95, 0.95),
    },
    minDifficulty: "normal",
  },
  {
    id: "postcat",
    name: "POSTCAT",
    title: "역의 수호자",
    texture: "boss-postcat",
    color: 0xf4f0e6,
    baseHp: 3800,
    maxMana: 700,
    size: 40,
    layout: [
      ...floor,
      { x: 40, y: 248, w: 120, h: 14, key: "tile" },
      { x: 480, y: 248, w: 120, h: 14, key: "tile" },
    ],
    resist: {
      easy: r(0.5, 0.85),
      normal: r(0.5, 0.85),
      hard: r(0.5, 0.85),
      impossible: r(0.5, 0.85),
    },
    soloResist: {
      easy: r(0.5, 0.5),
      normal: r(0.5, 0.5),
      hard: r(0.5, 0.5),
      impossible: r(0.5, 0.5),
    },
    minDifficulty: "hard",
  },
];

const ORDER: BossId[] = [
  "chomper",
  "bubblor",
  "bombit",
  "tyrant",
  "ringo",
  "icicle",
  "ironclad",
  "masked",
  "gondola",
  "postcat",
];

const CUT: Record<DifficultyId, number> = {
  easy: 8,
  normal: 9,
  hard: 10,
  impossible: 10,
};

export function bossById(id: BossId): BossDef {
  return BOSSES.find((b) => b.id === id) ?? BOSSES[0];
}

export function bossesForDifficulty(difficulty: DifficultyId): BossId[] {
  return ORDER.slice(0, CUT[difficulty]);
}
