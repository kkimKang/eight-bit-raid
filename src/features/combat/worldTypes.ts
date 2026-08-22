import Phaser from "phaser";
import type { DamageType } from "../../shared/types";
import type { PlayerActor } from "./PlayerActor";

export interface ShotOpts {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  damageType: DamageType;
  texture: string;
  erasable?: boolean;
  tint?: number;
  lifespan?: number;
  homing?: number;
  magnet?: boolean;
  scale?: number;
  tag?: string;
  pierce?: boolean;
  stun?: number;
  knock?: number;
  rotate?: boolean;
  ownerSlot?: number;
  healBoss?: number;
  boom?: number;
}

export interface CombatWorld {
  now: number;
  partyInvulnUntil: number;
  atkBuffUntil: number;
  atkBuffMul: number;
  cdrBuffUntil: number;
  cdrBuffMul: number;
  spawnPlayerShot(opts: ShotOpts): Phaser.Physics.Arcade.Sprite;
  spawnEnemyShot(opts: ShotOpts): Phaser.Physics.Arcade.Sprite;
  damageBoss(amount: number, type: DamageType, slot: number): void;
  eraseShotsNear(x: number, y: number, r: number): number;
  grantPartyInvuln(ms: number): void;
  heal(slot: number, amount: number): void;
  reviveNearest(fromSlot: number, hearts: number): void;
  buffAtk(mul: number, ms: number): void;
  buffCdr(mul: number, ms: number): void;
  living(): PlayerActor[];
  nearestAlly(from: PlayerActor): PlayerActor | undefined;
  bossPos(): { x: number; y: number };
  shake(intensity: number, ms: number): void;
  countShots(tag: string): number;
}
