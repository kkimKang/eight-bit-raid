export const ATK_COST = 40;
export const ATK_MAX = 8;
export const ATK_PER = 0.1;

export const HP_COST = 60;
export const HP_MAX = 4;

export const CDR_COST = 40;
export const CDR_MAX = 8;
export const CDR_PER = 0.05;

export function atkMultiplier(level: number): number {
  return 1 + level * ATK_PER;
}

export function cooldownMul(level: number): number {
  return 1 - level * CDR_PER;
}

export function manaRegenMul(level: number): number {
  return 1 + level * CDR_PER;
}

export const RANKS: { deaths: number; rank: string; gold: number }[] = [
  { deaths: 0, rank: "S", gold: 65 },
  { deaths: 1, rank: "A", gold: 60 },
  { deaths: 2, rank: "B", gold: 55 },
  { deaths: 3, rank: "C", gold: 50 },
  { deaths: 4, rank: "D", gold: 45 },
  { deaths: 5, rank: "E", gold: 40 },
  { deaths: 6, rank: "F", gold: 35 },
];

export function rankForDeaths(deaths: number): { rank: string; gold: number } {
  const row = RANKS.find((r) => r.deaths === deaths) ?? RANKS[RANKS.length - 1];
  return { rank: row.rank, gold: row.gold };
}
