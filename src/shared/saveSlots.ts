import { DIFFICULTIES, type DifficultyId } from "../config/difficulties";
import { MAX_PLAYERS } from "../config/constants";
import { bossesForDifficulty } from "../features/bosses/roster";
import { cloneRun, type RunState } from "./session";
import type { CharacterId, PlayerSetup } from "./types";

export const SAVE_SLOT_COUNT = 5;
const SAVE_KEY = "eight-bit-raid-slots";
const SAVE_VERSION = 2;

const CHAR_IDS: CharacterId[] = [
  "blade",
  "buster",
  "shade",
  "bolt",
  "brick",
  "taunt",
  "bloom",
  "hymn",
];

export interface FightPlayerSnap {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hearts: number;
  mana: number;
  facing: number;
  dead: boolean;
  cdC: number;
  cdS: number;
  cdD: number;
}

export interface FightSnapshot {
  elapsed: number;
  roundDeaths: number;
  timerLeft: number;
  players: FightPlayerSnap[];
  boss: {
    x: number;
    y: number;
    hp: number;
    mana: number;
    facing: number;
  };
}

export interface SaveSlot {
  savedAt: number;
  run: RunState;
  fight: FightSnapshot | null;
}

interface SaveBank {
  version: number;
  slots: Array<SaveSlot | null>;
}

function emptyBank(): SaveBank {
  return {
    version: SAVE_VERSION,
    slots: Array.from({ length: SAVE_SLOT_COUNT }, () => null),
  };
}

function isDifficulty(value: unknown): value is DifficultyId {
  return DIFFICULTIES.some((d) => d.id === value);
}

function isCharacter(value: unknown): value is CharacterId {
  return CHAR_IDS.includes(value as CharacterId);
}

function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function sanitizeFight(raw: unknown, playerCount: number): FightSnapshot | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const fight = raw as Partial<FightSnapshot> & { boss?: Partial<FightSnapshot["boss"]>; players?: unknown[] };
  if (!fight.boss || !Array.isArray(fight.players) || fight.players.length < 1) {
    return null;
  }
  const players = fight.players.slice(0, playerCount).map((p) => {
    const row = (p ?? {}) as Partial<FightPlayerSnap>;
    return {
      x: num(row.x, 120),
      y: num(row.y, 300),
      vx: num(row.vx),
      vy: num(row.vy),
      hearts: Math.max(0, num(row.hearts)),
      mana: Math.max(0, num(row.mana)),
      facing: num(row.facing, 1) < 0 ? -1 : 1,
      dead: Boolean(row.dead),
      cdC: Math.max(0, num(row.cdC)),
      cdS: Math.max(0, num(row.cdS)),
      cdD: Math.max(0, num(row.cdD)),
    };
  });
  if (players.length !== playerCount) {
    return null;
  }
  return {
    elapsed: Math.max(0, num(fight.elapsed)),
    roundDeaths: Math.max(0, Math.floor(num(fight.roundDeaths))),
    timerLeft: num(fight.timerLeft, -1),
    players,
    boss: {
      x: num(fight.boss.x, 320),
      y: num(fight.boss.y, 260),
      hp: Math.max(0, num(fight.boss.hp)),
      mana: Math.max(0, num(fight.boss.mana)),
      facing: num(fight.boss.facing, -1) < 0 ? -1 : 1,
    },
  };
}

function sanitizePlayer(raw: unknown, index: number): PlayerSetup | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const p = raw as Partial<PlayerSetup> & { upgrades?: Partial<PlayerSetup["upgrades"]> };
  if (!isCharacter(p.characterId)) {
    return null;
  }
  const gold = Number(p.gold);
  const atk = Number(p.upgrades?.atk);
  const hp = Number(p.upgrades?.hp);
  const cdr = Number(p.upgrades?.cdr);
  if (![gold, atk, hp, cdr].every(Number.isFinite)) {
    return null;
  }
  return {
    slot: index,
    characterId: p.characterId,
    gold: Math.max(0, Math.floor(gold)),
    upgrades: {
      atk: Math.max(0, Math.floor(atk)),
      hp: Math.max(0, Math.floor(hp)),
      cdr: Math.max(0, Math.floor(cdr)),
    },
  };
}

function sanitizeSlot(raw: unknown): SaveSlot | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const slot = raw as { savedAt?: unknown; run?: Partial<RunState>; fight?: unknown };
  const savedAt = Number(slot.savedAt);
  const run = slot.run;
  if (!Number.isFinite(savedAt) || !run || !isDifficulty(run.difficulty) || !Array.isArray(run.players)) {
    return null;
  }
  const players = run.players
    .slice(0, MAX_PLAYERS)
    .map((p, i) => sanitizePlayer(p, i))
    .filter((p): p is PlayerSetup => p !== null);
  if (players.length < 1) {
    return null;
  }
  const list = bossesForDifficulty(run.difficulty);
  const bossIndex = Math.max(0, Math.min(list.length - 1, Math.floor(Number(run.bossIndex) || 0)));
  const selectedSlot = Math.max(0, Math.min(players.length - 1, Math.floor(Number(run.selectedSlot) || 0)));
  const fight = sanitizeFight(slot.fight, players.length);
  return {
    savedAt,
    run: {
      difficulty: run.difficulty,
      players,
      selectedSlot,
      bossIndex,
      roundDeaths: fight?.roundDeaths ?? 0,
      lastResult: null,
      fightStartedAt: 0,
    },
    fight,
  };
}

function readBank(): SaveBank {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return emptyBank();
    }
    const parsed = JSON.parse(raw) as { slots?: unknown[] };
    const slots = Array.from({ length: SAVE_SLOT_COUNT }, (_, i) => sanitizeSlot(parsed.slots?.[i] ?? null));
    return { version: SAVE_VERSION, slots };
  } catch {
    return emptyBank();
  }
}

function writeBank(bank: SaveBank): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, slots: bank.slots }));
}

export function listSaveSlots(): Array<SaveSlot | null> {
  return readBank().slots;
}

export function writeSaveSlot(index: number, run: RunState, fight: FightSnapshot | null = null): boolean {
  if (index < 0 || index >= SAVE_SLOT_COUNT) {
    return false;
  }
  const bank = readBank();
  bank.slots[index] = {
    savedAt: Date.now(),
    run: cloneRun({
      ...run,
      roundDeaths: fight?.roundDeaths ?? 0,
      lastResult: null,
      fightStartedAt: 0,
    }),
    fight: fight ? (JSON.parse(JSON.stringify(fight)) as FightSnapshot) : null,
  };
  writeBank(bank);
  return true;
}

export function readSaveSlot(index: number): SaveSlot | null {
  if (index < 0 || index >= SAVE_SLOT_COUNT) {
    return null;
  }
  return readBank().slots[index];
}

let pendingFight: FightSnapshot | null = null;

export function setPendingFight(snap: FightSnapshot | null): void {
  pendingFight = snap;
}

export function takePendingFight(): FightSnapshot | null {
  const snap = pendingFight;
  pendingFight = null;
  return snap;
}
