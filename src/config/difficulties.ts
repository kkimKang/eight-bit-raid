export type DifficultyId = "easy" | "normal" | "hard" | "impossible";

export interface DifficultyDef {
  id: DifficultyId;
  label: string;
  labelEn: string;
  hpMul: number;
  speedMul: number;
  manaRegen: number;
  stun: boolean;
  extraPatterns: boolean;
}

export const DIFFICULTIES: DifficultyDef[] = [
  { id: "easy", label: "쉬움", labelEn: "EASY", hpMul: 1, speedMul: 1, manaRegen: 11, stun: false, extraPatterns: false },
  { id: "normal", label: "보통", labelEn: "NORMAL", hpMul: 1.12, speedMul: 1.12, manaRegen: 15, stun: false, extraPatterns: true },
  { id: "hard", label: "어려움", labelEn: "HARD", hpMul: 1.28, speedMul: 1.28, manaRegen: 21, stun: true, extraPatterns: true },
  { id: "impossible", label: "불가능", labelEn: "IMPOSSIBLE", hpMul: 1.45, speedMul: 1.45, manaRegen: 28, stun: true, extraPatterns: true },
];

export function difficultyDef(id: DifficultyId): DifficultyDef {
  return DIFFICULTIES.find((d) => d.id === id) ?? DIFFICULTIES[0];
}

export const PLAYER_HP_SCALE = [1, 1.75, 2.4, 3.05];
