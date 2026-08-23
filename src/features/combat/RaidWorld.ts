import Phaser from "phaser";
import { GROUND_TOP, HEIGHT, PLAYER_ATTACK_RANGE_MUL, WIDTH } from "../../config/constants";
import { PLAYER_HP_SCALE, difficultyDef, type DifficultyId } from "../../config/difficulties";
import { audio } from "../../shared/audio";
import type { DamageType, PlatformRect } from "../../shared/types";
import { addText } from "../../shared/ui";
import { bossById } from "../bosses/roster";
import { BossActor } from "../bosses/BossActor";
import { PlayerActor } from "./PlayerActor";
import type { CombatWorld, ShotOpts } from "./worldTypes";
import {
  burstRing,
  flashDisc,
  followAura,
  groundSlam,
  healRise,
  lightningBolt,
  slashArc,
  sparkBurst,
  warpFlash,
} from "./skillFx";

export class RaidWorld implements CombatWorld {
  now = 0;
  partyInvulnUntil = 0;
  atkBuffUntil = 0;
  atkBuffMul = 1;
  cdrBuffUntil = 0;
  cdrBuffMul = 1;
  players: PlayerActor[] = [];
  boss: BossActor;
  platforms: Phaser.Physics.Arcade.StaticGroup;
  playerShots: Phaser.Physics.Arcade.Group;
  enemyShots: Phaser.Physics.Arcade.Group;
  hazards: Phaser.Physics.Arcade.StaticGroup;
  movers: { sprite: Phaser.GameObjects.Rectangle | Phaser.Physics.Arcade.Sprite; vx: number; minX: number; maxX: number }[] = [];
  defaultLayout: PlatformRect[];
  roundDeaths = 0;
  ended: "win" | "lose" | null = null;
  bannerText?: Phaser.GameObjects.Text;
  timerLeft = -1;
  elapsed = 0;
  private deadOnce = new Set<number>();
  private pendingKill: Phaser.Physics.Arcade.Sprite[] = [];

  constructor(
    readonly scene: Phaser.Scene,
    readonly difficulty: DifficultyId,
    playerCount: number,
    bossId: ReturnType<typeof bossById>["id"],
  ) {
    this.platforms = scene.physics.add.staticGroup();
    this.hazards = scene.physics.add.staticGroup();
    this.playerShots = scene.physics.add.group({ allowGravity: false });
    this.enemyShots = scene.physics.add.group({ allowGravity: false });
    const def = bossById(bossId);
    this.defaultLayout = def.layout;
    this.rebuildPlatforms(def.layout);
    const hpMul = difficultyDef(difficulty).hpMul * (PLAYER_HP_SCALE[playerCount - 1] ?? 1);
    this.boss = new BossActor(scene, def, difficulty, hpMul, playerCount === 1);
  }

  attachPlayers(players: PlayerActor[]): void {
    this.players = players;
    for (const p of players) {
      this.scene.physics.add.collider(p.sprite, this.platforms);
      this.scene.physics.add.overlap(p.sprite, this.hazards, (_pl, hz) => {
        const key = (hz as Phaser.Physics.Arcade.Sprite).texture?.key ?? "";
        if (key === "tile-lava" || key === "tile-water") {
          p.hurt(99, this);
        } else {
          p.hurt(1, this);
        }
      });
      this.scene.physics.add.overlap(
        p.sprite,
        this.enemyShots,
        (_pl, shot) => {
          const s = shot as Phaser.Physics.Arcade.Sprite;
          if (!s.active || s.getData("spent")) {
            return;
          }
          p.hurt(Number(s.getData("damage") ?? 1), this, {
            stun: Number(s.getData("stun") ?? 0),
            knock: Number(s.getData("knock") ?? 0),
            dir: Math.sign(p.x - s.x) || -p.facing,
          });
          if (!s.getData("pierce")) {
            this.retireShot(s);
          } else {
            s.setData("spent", true);
          }
        },
        (_pl, shot) => {
          const s = shot as Phaser.Physics.Arcade.Sprite;
          return Boolean(s.active && s.body && (s.body as Phaser.Physics.Arcade.Body).enable && !s.getData("spent"));
        },
      );
      this.scene.physics.add.overlap(p.sprite, this.boss.sprite, () => {
        if (this.boss.dead || this.boss.inUltimate) {
          return;
        }
        p.hurt(this.boss.contactDamage, this, { knock: 160, dir: Math.sign(p.x - this.boss.x) || 1 });
      });
    }
    this.scene.physics.add.overlap(
      this.playerShots,
      this.boss.sprite,
      (a, b) => {
        const s = this.shotFromPair(this.playerShots, a, b);
        if (s) {
          this.onPlayerShotHitBoss(s);
        }
      },
      (a, b) => {
        const s = this.shotFromPair(this.playerShots, a, b);
        return Boolean(s && s.active && s.body && (s.body as Phaser.Physics.Arcade.Body).enable && !s.getData("spent"));
      },
    );
  }

  private shotFromPair(
    group: Phaser.Physics.Arcade.Group,
    a: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
    b: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
  ): Phaser.Physics.Arcade.Sprite | undefined {
    const asSprite = (
      obj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
    ): Phaser.Physics.Arcade.Sprite | undefined => {
      const go =
        obj && typeof obj === "object" && "gameObject" in obj
          ? (obj as Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody).gameObject
          : obj;
      if (go && group.contains(go as Phaser.GameObjects.GameObject)) {
        return go as Phaser.Physics.Arcade.Sprite;
      }
      return undefined;
    };
    return asSprite(a) ?? asSprite(b);
  }

  private onPlayerShotHitBoss(s: Phaser.Physics.Arcade.Sprite): void {
    if (!s || s === this.boss.sprite || !s.active || s.getData("spent")) {
      return;
    }
    if (s.getData("tag") === "blade-bomb") {
      this.detonateBladeBomb(s);
      return;
    }
    s.setData("spent", true);
    const owner = Number(s.getData("ownerSlot") ?? 0);
    if (this.boss.counterUntil > this.now) {
      this.players[owner]?.hurt(99, this);
      this.retireShot(s);
      this.banner("COUNTER ATTACK!");
      return;
    }
    const heal = Number(s.getData("healBoss") ?? 0);
    if (heal) {
      this.boss.hp = Math.min(this.boss.maxHp, this.boss.hp + heal);
      this.retireShot(s);
      return;
    }
    if (this.boss.invuln || this.boss.dead) {
      if (!s.getData("pierce")) {
        this.retireShot(s);
      }
      return;
    }
    const dtype = (s.getData("damageType") as DamageType) || "physical";
    this.damageBoss(Number(s.getData("damage") ?? 0), dtype, owner);
    if (!s.getData("pierce")) {
      this.retireShot(s);
    }
  }

  private bladeBombExplosionOpts(s: Phaser.Physics.Arcade.Sprite): ShotOpts {
    return {
      x: s.x,
      y: s.y,
      vx: 0,
      vy: 0,
      damage: Number(s.getData("boom") ?? 160),
      damageType: "physical",
      texture: "bomb",
      scale: 2.2,
      lifespan: 180,
      pierce: true,
      ownerSlot: Number(s.getData("ownerSlot") ?? 0),
    };
  }

  private detonateBladeBomb(s: Phaser.Physics.Arcade.Sprite, queued?: ShotOpts[]): void {
    if (!s.active || s.getData("tag") !== "blade-bomb" || s.getData("spent")) {
      return;
    }
    this.skillFlash(s.x, s.y, 0xffd24a);
    this.shake(0.008, 140);
    const opts = this.bladeBombExplosionOpts(s);
    if (queued) {
      queued.push(opts);
    } else {
      this.spawnPlayerShot(opts);
    }
    this.retireShot(s);
  }

  private retireShot(s: Phaser.Physics.Arcade.Sprite): void {
    if (!s || s === this.boss.sprite || s.getData("queuedDestroy")) {
      return;
    }
    s.setData("queuedDestroy", true);
    s.setData("spent", true);
    const body = s.body as Phaser.Physics.Arcade.Body | null;
    if (body) {
      body.enable = false;
    }
    s.setActive(false);
    s.setVisible(false);
    this.pendingKill.push(s);
  }

  private flushRetiredShots(): void {
    if (this.pendingKill.length === 0) {
      return;
    }
    const batch = this.pendingKill;
    this.pendingKill = [];
    for (const s of batch) {
      if (s.scene) {
        s.destroy();
      }
    }
  }

  rebuildPlatforms(rects: PlatformRect[]): void {
    this.platforms.clear(true, true);
    this.hazards.clear(true, true);
    this.movers = [];
    for (const r of rects) {
      const key = r.key ?? "tile";
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      if (key === "tile-lava" || key === "tile-water" || key === "tile-spike") {
        const h = this.hazards.create(cx, cy, key) as Phaser.Physics.Arcade.Sprite;
        h.setDisplaySize(r.w, r.h);
        h.refreshBody();
      } else {
        const s = this.platforms.create(cx, cy, key) as Phaser.Physics.Arcade.Sprite;
        s.setDisplaySize(r.w, r.h);
        s.refreshBody();
      }
    }
  }

  restoreLayout(): void {
    this.rebuildPlatforms(this.defaultLayout);
    this.boss.sprite.setPosition(320, 260);
    this.boss.sprite.setScale(1);
    this.boss.sprite.setVisible(true);
  }

  snapPlayersToNearestPlatforms(): void {
    const plats = this.platforms.getChildren() as Phaser.Physics.Arcade.Sprite[];
    if (!plats.length) {
      return;
    }
    const standAbove = GROUND_TOP - 300;
    for (const p of this.living()) {
      let best = plats[0]!;
      let bestDist = Infinity;
      for (const plat of plats) {
        const dist = Phaser.Math.Distance.Between(p.x, p.y, plat.x, plat.y);
        if (dist < bestDist) {
          bestDist = dist;
          best = plat;
        }
      }
      const top = best.y - best.displayHeight / 2;
      const margin = 14;
      const minX = best.x - best.displayWidth / 2 + margin;
      const maxX = best.x + best.displayWidth / 2 - margin;
      const x = Phaser.Math.Clamp(p.x, minX, maxX);
      p.sprite.setPosition(x, top - standAbove);
      p.body.setVelocity(0, 0);
      p.body.reset(p.sprite.x, p.sprite.y);
    }
  }

  smashPlatformsNear(x: number, y: number, radius: number): void {
    const gone: Phaser.GameObjects.GameObject[] = [];
    this.platforms.children.iterate((obj) => {
      const s = obj as Phaser.Physics.Arcade.Sprite;
      if (Phaser.Math.Distance.Between(x, y, s.x, s.y) < radius) {
        gone.push(s);
      }
      return true;
    });
    for (const g of gone) {
      g.destroy();
    }
  }

  spawnPlayerShot(opts: ShotOpts): Phaser.Physics.Arcade.Sprite {
    const mul = PLAYER_ATTACK_RANGE_MUL;
    return this.spawnShot(
      this.playerShots,
      {
        ...opts,
        lifespan: (opts.lifespan ?? 2500) * mul,
        scale: (opts.scale ?? 1) * mul,
      },
      false,
    );
  }

  spawnEnemyShot(opts: ShotOpts): Phaser.Physics.Arcade.Sprite {
    return this.spawnShot(this.enemyShots, opts, true);
  }

  private spawnShot(
    group: Phaser.Physics.Arcade.Group,
    opts: ShotOpts,
    enemy: boolean,
  ): Phaser.Physics.Arcade.Sprite {
    const s = group.create(opts.x, opts.y, opts.texture) as Phaser.Physics.Arcade.Sprite;
    s.setVelocity(opts.vx, opts.vy);
    s.setScale(opts.scale ?? 1);
    if (opts.tint !== undefined) {
      s.setTint(opts.tint);
    }
    const body = s.body as Phaser.Physics.Arcade.Body;
    body.allowGravity = false;
    body.updateFromGameObject();
    s.setData("damage", opts.damage);
    s.setData("damageType", opts.damageType);
    s.setData("erasable", opts.erasable !== false && enemy);
    s.setData("lifespan", this.now + (opts.lifespan ?? 2500));
    s.setData("homing", opts.homing ?? 0);
    s.setData("magnet", Boolean(opts.magnet));
    s.setData("tag", opts.tag ?? "");
    s.setData("pierce", Boolean(opts.pierce));
    s.setData("stun", opts.stun ?? 0);
    s.setData("knock", opts.knock ?? 0);
    s.setData("ownerSlot", opts.ownerSlot ?? -1);
    s.setData("healBoss", opts.healBoss ?? 0);
    s.setData("boom", opts.boom ?? 0);
    s.setData("bent", false);
    s.setDepth(6);
    if (opts.rotate) {
      s.setRotation(Math.atan2(opts.vy, opts.vx));
    }
    return s;
  }

  damageBoss(amount: number, type: DamageType, slot: number): void {
    if (this.boss.dead || this.boss.invuln || amount <= 0) {
      return;
    }
    const resist = this.boss.resist(type);
    const dealt = Math.max(1, amount * (1 - resist));
    this.boss.hp -= dealt;
    this.players[slot] && (this.players[slot].damageDealt += dealt);
    this.boss.flashHit();
    if (this.boss.hp <= 0) {
      this.boss.hp = 0;
      this.boss.dead = true;
      this.ended = "win";
      audio.win();
    }
  }

  eraseShotsNear(x: number, y: number, r: number): number {
    let n = 0;
    const kill: Phaser.GameObjects.GameObject[] = [];
    this.enemyShots.children.iterate((obj) => {
      const s = obj as Phaser.Physics.Arcade.Sprite;
      if (s.getData("erasable") && Phaser.Math.Distance.Between(x, y, s.x, s.y) < r) {
        kill.push(s);
        n += 1;
      }
      return true;
    });
    for (const k of kill) {
      this.retireShot(k as Phaser.Physics.Arcade.Sprite);
    }
    return n;
  }

  grantPartyInvuln(ms: number): void {
    this.partyInvulnUntil = this.now + ms;
    this.banner("STAR!");
    for (const p of this.living()) {
      this.skillAura(p.sprite, 0xffd24a, ms);
      this.skillSparks(p.x, p.y - 10, 0xffd24a);
    }
    this.skillFlash(WIDTH / 2, HEIGHT / 2, 0xffd24a);
  }

  heal(slot: number, amount: number): void {
    const p = this.players[slot];
    if (!p || p.dead) {
      return;
    }
    p.hearts = Math.min(p.maxHearts, p.hearts + amount);
    this.skillHeal(p.x, p.y - 12, p.kit.color);
  }

  reviveNearest(fromSlot: number, hearts: number): void {
    const from = this.players[fromSlot];
    const dead = this.players.filter((p) => p.dead);
    if (!from || dead.length === 0) {
      return;
    }
    dead.sort(
      (a, b) =>
        Phaser.Math.Distance.Between(from.x, from.y, a.x, a.y) -
        Phaser.Math.Distance.Between(from.x, from.y, b.x, b.y),
    );
    const p = dead[0];
    p.dead = false;
    p.hearts = hearts;
    p.iframeUntil = this.now + 2000;
    p.sprite.setTexture("player");
    p.sprite.setTint(p.kit.color);
    this.deadOnce.delete(p.slot);
    this.skillWarp(p.x, p.y - 8, p.kit.color);
    this.skillHeal(p.x, p.y - 12, p.kit.color);
  }

  buffAtk(mul: number, ms: number): void {
    this.atkBuffMul = mul;
    this.atkBuffUntil = this.now + ms;
    for (const p of this.living()) {
      this.skillSparks(p.x, p.y - 10, 0x2ecc71);
      this.skillAura(p.sprite, 0x2ecc71, Math.min(ms, 1200));
    }
  }

  buffCdr(mul: number, ms: number): void {
    this.cdrBuffMul = mul;
    this.cdrBuffUntil = this.now + ms;
    for (const p of this.living()) {
      this.skillRing(p.x, p.y - 8, 0x4aa3ff);
      this.skillAura(p.sprite, 0x4aa3ff, Math.min(ms, 1200));
    }
  }

  living(): PlayerActor[] {
    return this.players.filter((p) => !p.dead);
  }

  nearestAlly(from: PlayerActor): PlayerActor | undefined {
    const others = this.living().filter((p) => p.slot !== from.slot);
    others.sort(
      (a, b) =>
        Phaser.Math.Distance.Between(from.x, from.y, a.x, a.y) -
        Phaser.Math.Distance.Between(from.x, from.y, b.x, b.y),
    );
    return others[0];
  }

  bossPos(): { x: number; y: number } {
    return { x: this.boss.x, y: this.boss.y };
  }

  pickTarget(): PlayerActor | undefined {
    const live = this.living();
    const tank = live.find((p) => p.enlargedUntil > this.now);
    if (tank) {
      return tank;
    }
    return Phaser.Utils.Array.GetRandom(live);
  }

  shake(intensity: number, ms: number): void {
    this.scene.cameras.main.shake(ms, intensity);
  }

  countShots(tag: string): number {
    let n = 0;
    this.playerShots.children.iterate((obj) => {
      const s = obj as Phaser.Physics.Arcade.Sprite;
      if (s.active && s.getData("tag") === tag) {
        n += 1;
      }
      return true;
    });
    return n;
  }

  banner(text: string): void {
    this.bannerText?.destroy();
    this.bannerText = addText(this.scene, WIDTH / 2, 70, text, {
      fontSize: "22px",
      color: "#ffd24a",
      stroke: "#1a1420",
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(20);
    this.scene.tweens.add({
      targets: this.bannerText,
      alpha: 0,
      delay: 700,
      duration: 400,
      onComplete: () => this.bannerText?.destroy(),
    });
  }

  skillRing(x: number, y: number, color: number): void {
    burstRing(this.scene, x, y, color);
  }

  skillFlash(x: number, y: number, color: number): void {
    flashDisc(this.scene, x, y, color);
  }

  skillSparks(x: number, y: number, color: number): void {
    sparkBurst(this.scene, x, y, color);
  }

  skillWarp(x: number, y: number, color: number): void {
    warpFlash(this.scene, x, y, color);
  }

  skillAura(sprite: Phaser.Physics.Arcade.Sprite, color: number, ms: number): void {
    followAura(this.scene, sprite, color, ms);
  }

  skillSlash(x: number, y: number, facing: number, color: number): void {
    slashArc(this.scene, x, y, facing, color);
  }

  skillSlam(x: number, y: number, color: number): void {
    groundSlam(this.scene, x, y, color);
  }

  skillHeal(x: number, y: number, color: number): void {
    healRise(this.scene, x, y, color);
  }

  skillLightning(x1: number, y1: number, x2: number, y2: number, color: number): void {
    lightningBolt(this.scene, x1, y1, x2, y2, color);
  }

  skillPop(text: string, color = "#ffd24a"): void {
    const pop = addText(this.scene, WIDTH / 2, 52, text, {
      fontSize: "16px",
      color,
      stroke: "#1a1420",
      strokeThickness: 3,
    })
      .setOrigin(0.5)
      .setDepth(21);
    this.scene.tweens.add({
      targets: pop,
      y: 40,
      alpha: 0,
      duration: 650,
      onComplete: () => pop.destroy(),
    });
  }

  stomp(x: number, y: number, radius: number, damage: number, stun: boolean): void {
    const bang = this.scene.add.image(x, y - 36, "bang").setDepth(12);
    this.scene.time.delayedCall(280, () => bang.destroy());
    audio.stomp();
    this.shake(0.01, 160);
    const stunMs = stun ? 1100 : 0;
    for (const p of this.living()) {
      if (Phaser.Math.Distance.Between(x, y, p.x, p.y) <= radius) {
        p.hurt(damage, this, { stun: stunMs, knock: 320, dir: Math.sign(p.x - x) || 1 });
      }
    }
  }

  beam(x: number, y: number, w: number, h: number, damage: number, duration: number, stun = false): void {
    const rect = this.scene.add.rectangle(x, y, w, h, 0xff3b4e, 0.85).setDepth(7);
    this.scene.physics.add.existing(rect, true);
    const hits = new Set<number>();
    const chk = () => {
      for (const p of this.living()) {
        if (hits.has(p.slot)) {
          continue;
        }
        const b = rect.body as Phaser.Physics.Arcade.StaticBody;
        if (Phaser.Geom.Intersects.RectangleToRectangle(p.sprite.getBounds(), b as unknown as Phaser.Geom.Rectangle)) {
          hits.add(p.slot);
          p.hurt(damage, this, { stun: stun ? 900 : 0 });
        }
        const pb = p.sprite.getBounds();
        if (Math.abs(pb.centerX - x) < w / 2 + 8 && Math.abs(pb.centerY - y) < h / 2 + 8) {
          if (!hits.has(p.slot)) {
            hits.add(p.slot);
            p.hurt(damage, this, { stun: stun ? 900 : 0 });
          }
        }
      }
    };
    const ev = this.scene.time.addEvent({ delay: 50, loop: true, callback: chk });
    this.scene.time.delayedCall(duration, () => {
      ev.remove(false);
      rect.destroy();
    });
  }

  flashDanger(): void {
    const f = this.scene.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0xff3b4e, 0.35).setDepth(18);
    this.scene.tweens.add({ targets: f, alpha: 0, duration: 240, onComplete: () => f.destroy() });
  }

  updateShots(): void {
    const explosions: ShotOpts[] = [];
    const steer = (group: Phaser.Physics.Arcade.Group, towardBoss: boolean) => {
      const kill: Phaser.Physics.Arcade.Sprite[] = [];
      group.children.iterate((obj) => {
        const s = obj as Phaser.Physics.Arcade.Sprite;
        if (!s.active || !s.body || s.getData("queuedDestroy")) {
          return true;
        }
        const body = s.body as Phaser.Physics.Arcade.Body;
        if (this.now > Number(s.getData("lifespan"))) {
          if (s.getData("tag") === "blade-bomb") {
            this.detonateBladeBomb(s, explosions);
          } else {
            kill.push(s);
          }
          return true;
        }
        if (s.x < -40 || s.x > WIDTH + 40 || s.y < -40 || s.y > HEIGHT + 40) {
          kill.push(s);
          return true;
        }
        const homing = Number(s.getData("homing") ?? 0);
        if (homing && towardBoss === false) {
          const t = this.pickTarget();
          if (t) {
            const ang = Math.atan2(t.y - 10 - s.y, t.x - s.x);
            const spd = body.velocity.length() || 120;
            body.velocity.x = Phaser.Math.Linear(body.velocity.x, Math.cos(ang) * spd, homing / 60);
            body.velocity.y = Phaser.Math.Linear(body.velocity.y, Math.sin(ang) * spd, homing / 60);
          }
        }
        if (homing && towardBoss) {
          const ang = Math.atan2(this.boss.y - s.y, this.boss.x - s.x);
          const spd = body.velocity.length() || 200;
          body.velocity.x = Phaser.Math.Linear(body.velocity.x, Math.cos(ang) * spd, homing / 60);
          body.velocity.y = Phaser.Math.Linear(body.velocity.y, Math.sin(ang) * spd, homing / 60);
        }
        if (s.getData("magnet") && !s.getData("bent") && Math.abs(s.x - this.boss.x) < 18) {
          s.setData("bent", true);
          body.setVelocity(0, Math.sign(this.boss.y - s.y) * 280 || -280);
          s.setData("damage", Number(s.getData("damage")) * 1.25);
        }
        return true;
      });
      for (const k of kill) {
        this.retireShot(k);
      }
    };
    steer(this.playerShots, true);
    steer(this.enemyShots, false);
    for (const opts of explosions) {
      this.spawnPlayerShot(opts);
    }
  }

  update(dt: number): void {
    this.now += dt;
    this.elapsed += dt;
    for (const p of this.players) {
      if (p.dead && !this.deadOnce.has(p.slot)) {
        this.deadOnce.add(p.slot);
        this.roundDeaths += 1;
      }
      if (p.y > HEIGHT + 8 && !p.dead) {
        p.hurt(99, this);
      }
    }
    this.updateShots();
    for (const m of this.movers) {
      m.sprite.x += m.vx * (dt / 16);
      if (m.sprite.x < m.minX || m.sprite.x > m.maxX) {
        m.vx *= -1;
      }
      const body = (m.sprite as Phaser.Physics.Arcade.Sprite).body as Phaser.Physics.Arcade.StaticBody | Phaser.Physics.Arcade.Body | undefined;
      if (body && "updateFromGameObject" in body) {
        (body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
      }
    }
    if (this.timerLeft >= 0) {
      this.timerLeft -= dt;
      if (this.timerLeft <= 0 && !this.boss.dead) {
        for (const p of this.living()) {
          p.hurt(99, this);
        }
        this.timerLeft = -1;
      }
    }
    this.boss.update(this, dt);
    this.flushRetiredShots();
    if (this.living().length === 0 && this.elapsed > 400) {
      this.ended = "lose";
    }
  }
}
