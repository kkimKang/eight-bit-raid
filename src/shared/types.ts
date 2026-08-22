export type DamageType = "physical" | "magic";
export type CharacterId =
  | "blade"
  | "buster"
  | "shade"
  | "bolt"
  | "brick"
  | "taunt"
  | "bloom"
  | "hymn";

export type BossId =
  | "chomper"
  | "bubblor"
  | "bombit"
  | "tyrant"
  | "ringo"
  | "icicle"
  | "ironclad"
  | "masked"
  | "gondola"
  | "postcat";

export type RoleId = "phys_dps" | "magic_dps" | "tank" | "support";

export interface Upgrades {
  atk: number;
  hp: number;
  cdr: number;
}

export interface PlayerSetup {
  slot: number;
  characterId: CharacterId;
  gold: number;
  upgrades: Upgrades;
}

export interface ResistRow {
  physical: number;
  magic: number;
}

export interface PlatformRect {
  x: number;
  y: number;
  w: number;
  h: number;
  key?: string;
}
