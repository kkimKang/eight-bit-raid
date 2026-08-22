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
  skillRing(x: number, y: number, color: number): void;
  skillFlash(x: number, y: number, color: number): void;
  skillSparks(x: number, y: number, color: number): void;
  skillWarp(x: number, y: number, color: number): void;
  skillAura(sprite: Phaser.Physics.Arcade.Sprite, color: number, ms: number): void;
  skillSlash(x: number, y: number, facing: number, color: number): void;
  skillSlam(x: number, y: number, color: number): void;
  skillHeal(x: number, y: number, color: number): void;
  skillLightning(x1: number, y1: number, x2: number, y2: number, color: number): void;
  skillPop(text: string, color?: string): void;
}
