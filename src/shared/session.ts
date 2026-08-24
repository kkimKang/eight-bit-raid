import { difficultyDef, type DifficultyId } from "../config/difficulties";
import { MAX_PLAYERS } from "../config/constants";
import type { BossId, CharacterId, PlayerSetup } from "./types";
import { bossesForDifficulty } from "../features/bosses/roster";

export interface LastResult {
  bossId: BossId;
  bossName: string;
  deaths: number;
  rank: string;
  gold: number;
  wiped: boolean;
  timeMs: number;
}

export interface RunState {
  difficulty: DifficultyId;
  players: PlayerSetup[];
  selectedSlot: number;
  bossIndex: number;
  roundDeaths: number;
  lastResult: LastResult | null;
  fightStartedAt: number;
}

function emptyUpgrades() {
  return { atk: 0, hp: 0, cdr: 0 };
}

export function createRun(difficulty: DifficultyId): RunState {
  return {
    difficulty,
    players: [
      {
        slot: 0,
        characterId: "buster",
        gold: 0,
        upgrades: emptyUpgrades(),
      },
    ],
    selectedSlot: 0,
    bossIndex: 0,
    roundDeaths: 0,
    lastResult: null,
    fightStartedAt: 0,
  };
}

let run: RunState = createRun("easy");

export function getRun(): RunState {
  return run;
}

export function setRun(next: RunState): void {
  run = next;
}

export function cloneRun(state: RunState): RunState {
  return JSON.parse(JSON.stringify(state)) as RunState;
}

export function resetRun(difficulty: DifficultyId): void {
  run = createRun(difficulty);
}

export function addPlayer(characterId: CharacterId = "buster"): boolean {
  if (run.players.length >= MAX_PLAYERS) {
    return false;
  }
  run.players.push({
    slot: run.players.length,
    characterId,
    gold: 0,
    upgrades: emptyUpgrades(),
  });
  run.selectedSlot = run.players.length - 1;
  return true;
}

export function removeLastPlayer(): boolean {
  if (run.players.length <= 1) {
    return false;
  }
  run.players.pop();
  run.selectedSlot = Math.min(run.selectedSlot, run.players.length - 1);
  return true;
}

export function currentBossId(): BossId {
  const list = bossesForDifficulty(run.difficulty);
  return list[Math.min(run.bossIndex, list.length - 1)];
}

export function isFinalBoss(): boolean {
  const list = bossesForDifficulty(run.difficulty);
  return run.bossIndex >= list.length - 1;
}

export function difficulty() {
  return difficultyDef(run.difficulty);
}

const CLEAR_KEY = "eight-bit-raid-clears";

export function markCleared(id: DifficultyId): void {
  const raw = localStorage.getItem(CLEAR_KEY);
  const data = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  data[id] = true;
  localStorage.setItem(CLEAR_KEY, JSON.stringify(data));
}

export function loadClears(): Record<string, boolean> {
  const raw = localStorage.getItem(CLEAR_KEY);
  return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
}
