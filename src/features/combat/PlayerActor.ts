import Phaser from "phaser";
import { HIT_IFRAME_MS, PLAYER_MANA_MAX, STOMP_KNOCK } from "../../config/constants";
import { atkMultiplier, cooldownMul, manaRegenMul } from "../../config/upgrades";
import type { Upgrades } from "../../shared/types";
import { audio } from "../../shared/audio";
import { aimDir, type PlayerInput } from "../../shared/input";
import { kitById, type KitDef } from "../characters/kits";
import type { CombatWorld } from "./worldTypes";

export class PlayerActor {
  sprite: Phaser.Physics.Arcade.Sprite;
  kit: KitDef;
  slot: number;
  hearts: number;
  maxHearts: number;
  mana = PLAYER_MANA_MAX;
  facing = 1;
  dead = false;
  upgrades: Upgrades;
  invulnUntil = 0;
  iframeUntil = 0;
  stunUntil = 0;
  cdC = 0;
  cdS = 0;
  cdD = 0;
  xReady = 0;
  attackHold = 0;
  coyote = 0;
  jumpCut = false;
  slidingUntil = 0;
  enlargedUntil = 0;
  magnetUntil = 0;
  hookUntil = 0;
  lastHurtAt = -9999;
  damageDealt = 0;
  healingDone = 0;
  erases = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    slot: number,
    kit: KitDef,
    upgrades: Upgrades,
  ) {
    this.slot = slot;
    this.kit = kit;
    this.upgrades = upgrades;
    this.maxHearts = kit.hearts + upgrades.hp;
    this.hearts = this.maxHearts;
    this.invulnUntil = 2200;
    this.erases = kit.role === "tank";
    this.sprite = scene.physics.add.sprite(x, y, "player");
    this.sprite.setTint(kit.color);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(8);
    this.sprite.setData("actor", this);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(12, 16);
    body.setOffset(2, 4);
    body.setMaxVelocity(280, 700);
  }

  get x(): number {
    return this.sprite.x;
  }

  get y(): number {
    return this.sprite.y;
  }

  get body(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }

  atkMul(world: CombatWorld): number {
    const buff = world.now < world.atkBuffUntil ? world.atkBuffMul : 1;
    return atkMultiplier(this.upgrades.atk) * buff;
  }

  cdMul(world: CombatWorld): number {
    const buff = world.now < world.cdrBuffUntil ? world.cdrBuffMul : 1;
    return cooldownMul(this.upgrades.cdr) * buff;
  }

  protectedNow(world: CombatWorld): boolean {
    return world.now < this.invulnUntil || world.now < this.iframeUntil || world.now < world.partyInvulnUntil;
  }

  update(world: CombatWorld, input: PlayerInput, dt: number): void {
    const now = world.now;
    this.cdC = Math.max(0, this.cdC - dt);
    this.cdS = Math.max(0, this.cdS - dt);
    this.cdD = Math.max(0, this.cdD - dt);
    this.xReady = Math.max(0, this.xReady - dt);
    this.mana = Math.min(PLAYER_MANA_MAX, this.mana + 8 * manaRegenMul(this.upgrades.cdr) * (dt / 1000));

    if (this.dead) {
      this.body.setVelocity(0, 0);
      this.sprite.setTexture("tomb");
      this.sprite.setTint(0x8a8494);
      return;
    }

    this.sprite.setTexture("player");
    this.sprite.setTint(this.kit.color);
    if (now < this.enlargedUntil) {
      this.sprite.setScale(1.55);
    } else {
      this.sprite.setScale(1);
    }

    if (now < this.stunUntil || now < this.hookUntil) {
      this.sprite.setAlpha(now % 120 < 60 ? 0.7 : 1);
      return;
    }

    if (this.protectedNow(world) && now < this.invulnUntil) {
      this.sprite.setAlpha(0.55);
    } else if (now < this.iframeUntil) {
      this.sprite.setAlpha(now % 80 < 40 ? 0.35 : 1);
    } else {
      this.sprite.setAlpha(1);
    }

    const grounded = this.body.blocked.down || this.body.touching.down;
    if (grounded) {
      this.coyote = 90;
      this.jumpCut = false;
    } else {
      this.coyote = Math.max(0, this.coyote - dt);
    }

    if (now < this.slidingUntil) {
      this.body.setVelocityX(this.facing * 260);
      return;
    }

    if (input.left && !input.right) {
      this.facing = -1;
      this.body.setVelocityX(-this.kit.speed);
      this.sprite.setFlipX(true);
    } else if (input.right && !input.left) {
      this.facing = 1;
      this.body.setVelocityX(this.kit.speed);
      this.sprite.setFlipX(false);
    } else {
      this.body.setVelocityX(0);
    }

    if (this.kit.id === "buster" && grounded && input.down && input.jumpPressed) {
      this.slidingUntil = now + 220;
      this.body.setVelocityX(this.facing * 280);
      return;
    }

    if (input.jumpPressed && this.coyote > 0) {
      this.body.setVelocityY(-this.kit.jump);
      this.coyote = 0;
      this.jumpCut = false;
      audio.jump();
    }
    if (!input.jump && this.body.velocity.y < -40 && !this.jumpCut) {
      this.body.setVelocityY(this.body.velocity.y * 0.48);
      this.jumpCut = true;
    }

    if (input.attack) {
      this.attackHold += dt;
    }

    if (input.attackPressed || (input.attack && this.kit.id === "buster" && this.xReady <= 0)) {
      fireX(this, world, input);
    }
    if (this.kit.id === "buster" && input.attackReleased && this.attackHold > 420) {
      fireCharge(this, world, this.attackHold);
    }
    if (!input.attack) {
      this.attackHold = 0;
    }

    if (input.skillCPressed) {
      fireC(this, world, input);
    }
    if (input.skillSPressed) {
      fireS(this, world, input);
    }
    if (input.skillDPressed) {
      fireD(this, world, input);
    }

    if (this.erases) {
      world.eraseShotsNear(this.x, this.y - 8, now < this.enlargedUntil ? 28 : 16);
    }
  }

  hurt(amount: number, world: CombatWorld, opts?: { stun?: number; knock?: number; dir?: number }): void {
    if (this.dead || this.protectedNow(world) || world.now - this.lastHurtAt < HIT_IFRAME_MS) {
      return;
    }
    this.lastHurtAt = world.now;
    this.hearts = Math.max(0, this.hearts - amount);
    this.iframeUntil = world.now + HIT_IFRAME_MS;
    audio.hurt();
    world.shake(0.004, 80);
    if (opts?.stun) {
      this.stunUntil = world.now + opts.stun;
    }
    if (opts?.knock) {
      this.body.setVelocityX((opts.dir ?? -this.facing) * (opts.knock || STOMP_KNOCK));
      this.body.setVelocityY(-140);
    }
    if (this.hearts <= 0) {
      this.dead = true;
      this.sprite.setTexture("tomb");
    }
  }

  spend(cost: number): boolean {
    if (this.mana < cost) {
      return false;
    }
    this.mana -= cost;
    return true;
  }

  tryCd(which: "c" | "s" | "d", world: CombatWorld): boolean {
    const remain = which === "c" ? this.cdC : which === "s" ? this.cdS : this.cdD;
    if (remain > 0) {
      return false;
    }
    const base = which === "c" ? this.kit.cds.c : which === "s" ? this.kit.cds.s : this.kit.cds.d;
    const value = base * this.cdMul(world);
    if (which === "c") {
      this.cdC = value;
    } else if (which === "s") {
      this.cdS = value;
    } else {
      this.cdD = value;
    }
    return true;
  }

  clock(ms: number): void {
    this.cdC = Math.max(0, this.cdC - ms);
    this.cdS = Math.max(0, this.cdS - ms);
    this.cdD = Math.max(0, this.cdD - ms);
  }
}

function dmg(player: PlayerActor, world: CombatWorld, base: number): number {
  return base * player.atkMul(world);
}

function fireX(player: PlayerActor, world: CombatWorld, input: PlayerInput): void {
  if (player.xReady > 0 && player.kit.id !== "blade") {
    return;
  }
  const id = player.kit.id;
  const dir = aimDir(input, player.facing);
  player.xReady = player.kit.xInterval * player.cdMul(world);

  if (id === "buster") {
    if (world.countShots(`buster-${player.slot}`) >= 3) {
      return;
    }
    world.spawnPlayerShot({
      x: player.x + player.facing * 10,
      y: player.y - 10,
      vx: player.facing * 260,
      vy: 0,
      damage: dmg(player, world, player.magnetUntil > world.now ? 10 : 8),
      damageType: "physical",
      texture: "pellet",
      tag: `buster-${player.slot}`,
      lifespan: 1800,
      ownerSlot: player.slot,
      magnet: player.magnetUntil > world.now,
    });
    audio.hit();
    return;
  }

  if (id === "blade") {
    const slash = world.spawnPlayerShot({
      x: player.x + player.facing * 16,
      y: player.y - 8,
      vx: player.facing * 40,
      vy: 0,
      damage: dmg(player, world, 22),
      damageType: "physical",
      texture: "slash",
      lifespan: 140,
      pierce: true,
      ownerSlot: player.slot,
      scale: 1,
    });
    slash.setFlipX(player.facing < 0);
    world.spawnPlayerShot({
      x: player.x + player.facing * 12,
      y: player.y - 10,
      vx: player.facing * 280,
      vy: 0,
      damage: dmg(player, world, 12),
      damageType: "physical",
      texture: "pellet",
      lifespan: 700,
      ownerSlot: player.slot,
    });
    player.clock(500);
    audio.hit();
    return;
  }

  if (id === "shade") {
    world.spawnPlayerShot({
      x: player.x + player.facing * 8,
      y: player.y - 10,
      vx: player.facing * 240,
      vy: 0,
      damage: dmg(player, world, 14),
      damageType: "magic",
      texture: "orb",
      lifespan: 1600,
      ownerSlot: player.slot,
    });
    audio.hit();
    return;
  }

  if (id === "bolt") {
    world.spawnPlayerShot({
      x: player.x + dir.x * 10,
      y: player.y - 10 + dir.y * 6,
      vx: dir.x * 300,
      vy: dir.y * 300,
      damage: dmg(player, world, 16),
      damageType: "magic",
      texture: "bolt",
      lifespan: 900,
      ownerSlot: player.slot,
    });
    audio.hit();
    return;
  }

  if (id === "brick" || id === "taunt") {
    world.spawnPlayerShot({
      x: player.x + player.facing * 14,
      y: player.y - 8,
      vx: player.facing * 80,
      vy: 0,
      damage: dmg(player, world, id === "taunt" ? 18 : 16),
      damageType: "physical",
      texture: "hammer",
      lifespan: 180,
      pierce: true,
      ownerSlot: player.slot,
    });
    audio.hit();
    return;
  }

  world.spawnPlayerShot({
    x: player.x + player.facing * 8,
    y: player.y - 10,
    vx: player.facing * 220,
    vy: 0,
    damage: dmg(player, world, 9),
    damageType: player.kit.damageType,
    texture: id === "bloom" ? "star" : "pellet",
    tint: player.kit.color,
    lifespan: 1400,
    ownerSlot: player.slot,
  });
  audio.hit();
}

function fireCharge(player: PlayerActor, world: CombatWorld, hold: number): void {
  const power = hold > 900 ? 60 : 30;
  world.spawnPlayerShot({
    x: player.x + player.facing * 10,
    y: player.y - 10,
    vx: player.facing * 300,
    vy: 0,
    damage: dmg(player, world, power),
    damageType: "physical",
    texture: "pellet",
    scale: power > 40 ? 1.8 : 1.3,
    lifespan: 1600,
    ownerSlot: player.slot,
  });
  audio.skill();
}

function fireC(player: PlayerActor, world: CombatWorld, input: PlayerInput): void {
  const id = player.kit.id;
  const dir = aimDir(input, player.facing);

  if (id === "buster") {
    if (!player.spend(20)) {
      return;
    }
    world.spawnPlayerShot({
      x: player.x,
      y: player.y - 12,
      vx: player.facing * 180,
      vy: -40,
      damage: dmg(player, world, 45),
      damageType: "physical",
      texture: "missile",
      homing: 6,
      lifespan: 2400,
      ownerSlot: player.slot,
    });
    audio.skill();
    return;
  }

  if (id === "blade") {
    if (!player.tryCd("c", world)) {
      return;
    }
    player.invulnUntil = world.now + 280;
    player.hookUntil = world.now + 220;
    player.body.setVelocity(dir.x * 420, dir.y * 420);
    audio.skill();
    return;
  }

  if (id === "shade") {
    if (!player.tryCd("c", world)) {
      return;
    }
    for (const ang of [-0.35, 0, 0.35]) {
      const vx = Math.cos(ang) * player.facing * 220;
      const vy = Math.sin(ang) * 220;
      world.spawnPlayerShot({
        x: player.x,
        y: player.y - 10,
        vx,
        vy,
        damage: dmg(player, world, 18),
        damageType: "magic",
        texture: "orb",
        lifespan: 1400,
        ownerSlot: player.slot,
      });
    }
    audio.skill();
    return;
  }

  if (id === "bolt") {
    if (!player.tryCd("c", world)) {
      return;
    }
    player.invulnUntil = world.now + 260;
    player.body.setVelocity(dir.x * 460, dir.y * 320);
    world.spawnPlayerShot({
      x: player.x,
      y: player.y - 8,
      vx: dir.x * 80,
      vy: dir.y * 80,
      damage: dmg(player, world, 40),
      damageType: "magic",
      texture: "slash",
      lifespan: 200,
      pierce: true,
      ownerSlot: player.slot,
    });
    audio.skill();
    return;
  }

  if (id === "brick") {
    if (!player.tryCd("c", world)) {
      return;
    }
    world.eraseShotsNear(player.x, player.y, 70);
    const wall = world.spawnPlayerShot({
      x: player.x + player.facing * 18,
      y: player.y - 10,
      vx: 0,
      vy: 0,
      damage: 0,
      damageType: "physical",
      texture: "tile",
      lifespan: 1600,
      pierce: true,
      ownerSlot: player.slot,
      scale: 1.4,
    });
    wall.setTint(0x88c0ff);
    audio.skill();
    return;
  }

  if (id === "taunt") {
    if (!player.tryCd("c", world) || !player.spend(25)) {
      return;
    }
    player.enlargedUntil = world.now + 8000;
    player.invulnUntil = world.now + 400;
    audio.skill();
    return;
  }

  if (id === "bloom") {
    if (!player.tryCd("c", world) || !player.spend(15)) {
      return;
    }
    for (const ally of world.living()) {
      if (Phaser.Math.Distance.Between(player.x, player.y, ally.x, ally.y) < 90) {
        world.heal(ally.slot, 1);
        player.healingDone += 1;
      }
    }
    audio.skill();
    return;
  }

  if (id === "hymn") {
    if (!player.tryCd("c", world) || !player.spend(20)) {
      return;
    }
    world.buffAtk(1.25, 8000);
    audio.skill();
  }
}

function fireS(player: PlayerActor, world: CombatWorld, input: PlayerInput): void {
  const id = player.kit.id;
  const dir = aimDir(input, player.facing);

  if (id === "buster") {
    if (!player.tryCd("s", world)) {
      return;
    }
    player.magnetUntil = world.now + 8000;
    audio.skill();
    return;
  }

  if (id === "blade") {
    if (!player.tryCd("s", world)) {
      return;
    }
    world.spawnPlayerShot({
      x: player.x + dir.x * 12,
      y: player.y - 8,
      vx: 0,
      vy: 0,
      damage: 0,
      damageType: "physical",
      texture: "bomb",
      lifespan: 1000,
      ownerSlot: player.slot,
      tag: "blade-bomb",
      boom: dmg(player, world, 160),
    });
    audio.skill();
    return;
  }

  if (id === "shade") {
    if (!player.tryCd("s", world)) {
      return;
    }
    world.spawnPlayerShot({
      x: player.x,
      y: player.y - 12,
      vx: player.facing * 80,
      vy: -40,
      damage: dmg(player, world, 55),
      damageType: "magic",
      texture: "orb",
      scale: 1.6,
      lifespan: 1600,
      homing: 3,
      ownerSlot: player.slot,
    });
    audio.skill();
    return;
  }

  if (id === "bolt") {
    if (!player.tryCd("s", world)) {
      return;
    }
    const boss = world.bossPos();
    world.spawnPlayerShot({
      x: player.x,
      y: player.y - 10,
      vx: (boss.x - player.x) * 2,
      vy: (boss.y - player.y) * 2,
      damage: dmg(player, world, 70),
      damageType: "magic",
      texture: "bolt",
      homing: 8,
      lifespan: 1200,
      ownerSlot: player.slot,
    });
    audio.skill();
    return;
  }

  if (id === "brick") {
    if (!player.tryCd("s", world)) {
      return;
    }
    const ally = world.nearestAlly(player);
    if (ally) {
      ally.invulnUntil = world.now + 1800;
    }
    audio.skill();
    return;
  }

  if (id === "taunt") {
    if (!player.tryCd("s", world)) {
      return;
    }
    world.eraseShotsNear(player.x, player.y, 80);
    world.shake(0.006, 120);
    audio.stomp();
    return;
  }

  if (id === "hymn") {
    if (!player.tryCd("s", world)) {
      return;
    }
    world.buffCdr(0.72, 8000);
    audio.skill();
    return;
  }

  if (id === "bloom") {
    if (!player.tryCd("s", world)) {
      return;
    }
    world.reviveNearest(player.slot, 2);
    audio.skill();
  }
}

function fireD(player: PlayerActor, world: CombatWorld, _input: PlayerInput): void {
  const id = player.kit.id;

  if (id === "buster") {
    if (!player.tryCd("d", world)) {
      return;
    }
    player.invulnUntil = world.now + 1500;
    player.hookUntil = world.now + 400;
    const boss = world.bossPos();
    player.sprite.setPosition(Phaser.Math.Clamp(boss.x - player.facing * 50, 30, 610), Math.max(80, boss.y - 20));
    audio.skill();
    return;
  }

  if (id === "blade" || id === "bolt" || id === "brick" || id === "taunt" || id === "shade") {
    if (!player.tryCd("d", world)) {
      return;
    }
    player.invulnUntil = world.now + (id === "shade" ? 1000 : 2000);
    if (id === "brick") {
      world.eraseShotsNear(player.x, player.y, 90);
    }
    audio.skill();
    return;
  }

  if (id === "bloom") {
    if (!player.tryCd("d", world)) {
      return;
    }
    world.grantPartyInvuln(2000);
    audio.skill();
    return;
  }

  if (id === "hymn") {
    if (!player.tryCd("d", world)) {
      return;
    }
    world.reviveNearest(player.slot, 2);
    world.heal(player.slot, 1);
    audio.skill();
  }
}

export function makePlayer(
  scene: Phaser.Scene,
  x: number,
  y: number,
  slot: number,
  characterId: Parameters<typeof kitById>[0],
  upgrades: Upgrades,
): PlayerActor {
  return new PlayerActor(scene, x, y, slot, kitById(characterId), upgrades);
}
