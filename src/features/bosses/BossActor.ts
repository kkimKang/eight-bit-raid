import Phaser from "phaser";
import { difficultyDef, type DifficultyId } from "../../config/difficulties";
import type { DamageType } from "../../shared/types";
import type { RaidWorld } from "../combat/RaidWorld";
import { createPattern, createUltimate } from "./patterns";
import type { BossDef } from "./roster";
import { audio } from "../../shared/audio";

export class BossActor {
  sprite: Phaser.Physics.Arcade.Sprite;
  def: BossDef;
  hp: number;
  maxHp: number;
  mana = 0;
  maxMana: number;
  invuln = false;
  inUltimate = false;
  dead = false;
  facing = -1;
  contactDamage = 1;
  balloons = 0;
  superForm = false;
  counterUntil = 0;
  wait = 900;
  private hitFlashUntil = 0;
  private pattern: { update: (world: RaidWorld, dt: number) => boolean } | null = null;
  private phys: number;
  private mag: number;
  private regen: number;
  difficulty: DifficultyId;
  solo: boolean;

  constructor(scene: Phaser.Scene, def: BossDef, difficulty: DifficultyId, hpMul: number, solo: boolean) {
    this.def = def;
    this.difficulty = difficulty;
    this.solo = solo;
    this.maxHp = Math.round(def.baseHp * hpMul);
    this.hp = this.maxHp;
    this.maxMana = def.maxMana;
    const row = solo ? def.soloResist[difficulty] : def.resist[difficulty];
    this.phys = row.physical;
    this.mag = row.magic;
    this.regen = difficultyDef(difficulty).manaRegen;
    this.sprite = scene.physics.add.sprite(320, 260, def.texture);
    this.sprite.setImmovable(true);
    this.sprite.setDepth(5);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.allowGravity = false;
    body.setSize(def.size * 0.7, def.size * 0.7);
  }

  get x(): number {
    return this.sprite.x;
  }

  get y(): number {
    return this.sprite.y;
  }

  resist(type: DamageType): number {
    if (this.def.id === "gondola") {
      if (this.balloons >= 4) {
        return 0.2;
      }
      if (this.balloons >= 2) {
        return 0.55;
      }
      return 0.95;
    }
    return type === "physical" ? this.phys : this.mag;
  }

  flashHit(): void {
    this.hitFlashUntil = (this.sprite.scene.time.now || 0) + 90;
    this.sprite.clearTint();
    this.sprite.setAlpha(0.7);
  }

  private applyHitFlash(): void {
    const now = this.sprite.scene.time.now;
    if (this.dead) {
      this.sprite.setAlpha(0.35);
      return;
    }
    if (now < this.hitFlashUntil) {
      this.sprite.setAlpha(0.7);
      return;
    }
    if (this.sprite.alpha < 1 && this.sprite.visible) {
      this.sprite.setAlpha(1);
    }
    if (this.superForm) {
      this.sprite.setTint(0xff8866);
    }
  }

  face(x: number): void {
    this.facing = x < this.x ? -1 : 1;
    this.sprite.setFlipX(this.facing > 0);
  }

  update(world: RaidWorld, dt: number): void {
    this.applyHitFlash();
    if (!this.dead && this.hp <= 0) {
      world.defeatBoss();
    }
    if (this.dead || this.hp <= 0) {
      this.sprite.setAlpha(0.35);
      return;
    }
    if (this.hp < this.maxHp * 0.5 && this.def.id === "ironclad" && world.difficulty !== "easy" && this.superForm === false) {
      this.superForm = true;
      this.sprite.setTint(0xff8866);
      world.banner("SUPER FORM");
    }
    if (this.hp < this.maxHp * 0.3 && this.def.id === "ironclad" && this.timerReady(world)) {
      world.timerLeft = 40000;
      world.banner("TIME LIMIT");
    }
    this.mana = Math.min(this.maxMana, this.mana + this.regen * (dt / 1000) * (this.superForm ? 1.2 : 1));
    if (this.pattern) {
      if (this.pattern.update(world, dt)) {
        this.pattern = null;
        this.wait = 280;
        if (this.inUltimate) {
          this.inUltimate = false;
          this.invuln = false;
          world.restoreLayout();
        }
      }
      return;
    }
    this.wait -= dt;
    if (this.wait > 0) {
      return;
    }
    if (this.mana >= this.maxMana) {
      if (this.hp <= 0) {
        world.defeatBoss();
        return;
      }
      this.inUltimate = true;
      this.invuln = true;
      this.mana = 0;
      world.banner("ULTIMATE!");
      audio.ultimate();
      this.pattern = createUltimate(this.def.id, world, this);
      return;
    }
    this.pattern = createPattern(this.def.id, world, this);
  }

  private timed = false;
  private timerReady(world: RaidWorld): boolean {
    if (this.timed || world.timerLeft >= 0) {
      return false;
    }
    this.timed = true;
    return true;
  }

  interruptPattern(): void {
    this.pattern = null;
    this.inUltimate = false;
    this.invuln = false;
    this.wait = 280;
  }
}
