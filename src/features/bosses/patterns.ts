import Phaser from "phaser";
import { HEIGHT, WIDTH } from "../../config/constants";
import { difficultyDef } from "../../config/difficulties";
import type { RaidWorld } from "../combat/RaidWorld";
import type { BossActor } from "./BossActor";
import type { BossId } from "../../shared/types";

export interface Pattern {
  update: (world: RaidWorld, dt: number) => boolean;
}

function timed(
  duration: number,
  tick: (t: number, world: RaidWorld, boss: BossActor, dt: number) => void,
  start?: (world: RaidWorld, boss: BossActor) => void,
): Pattern {
  let t = 0;
  let began = false;
  return {
    update(world, dt) {
      if (!began) {
        start?.(world, bossRef);
        began = true;
      }
      t += dt;
      tick(t, world, bossRef, dt);
      return t >= duration;
    },
  };
}

let bossRef: BossActor;

function setBoss(boss: BossActor): void {
  bossRef = boss;
}

function shootFan(
  world: RaidWorld,
  boss: BossActor,
  count: number,
  speed: number,
  dmg: number,
  texture: string,
  spread = 0.4,
): void {
  const base = boss.facing > 0 ? 0 : Math.PI;
  for (let i = 0; i < count; i += 1) {
    const a = base + (i - (count - 1) / 2) * spread;
    world.spawnEnemyShot({
      x: boss.x,
      y: boss.y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      damage: dmg,
      damageType: "physical",
      texture,
      lifespan: 2600,
    });
  }
}

function aimShot(world: RaidWorld, boss: BossActor, speed: number, dmg: number, texture: string, extra?: Partial<Parameters<RaidWorld["spawnEnemyShot"]>[0]>): void {
  const t = world.pickTarget();
  if (!t) {
    return;
  }
  const ang = Math.atan2(t.y - 10 - boss.y, t.x - boss.x);
  world.spawnEnemyShot({
    x: boss.x,
    y: boss.y,
    vx: Math.cos(ang) * speed,
    vy: Math.sin(ang) * speed,
    damage: dmg,
    damageType: "physical",
    texture,
    lifespan: 2800,
    ...extra,
  });
}

export function createPattern(id: BossId, world: RaidWorld, boss: BossActor): Pattern {
  setBoss(boss);
  const diff = difficultyDef(world.difficulty);
  const stun = diff.stun;
  const extra = diff.extraPatterns;
  const names = patternNames(id, extra, world.difficulty === "impossible", world.difficulty);
  const name = Phaser.Utils.Array.GetRandom(names);
  return makePattern(id, name, world, boss, stun);
}

export function createUltimate(id: BossId, world: RaidWorld, boss: BossActor): Pattern {
  setBoss(boss);
  return ultimates[id](world, boss);
}

function patternNames(id: BossId, extra: boolean, imp: boolean, difficulty: RaidWorld["difficulty"]): string[] {
  const map: Record<BossId, string[]> = {
    chomper: ["walkShoot", "dash", "lanes", "laser", ...(extra ? ["ghosts"] : [])],
    bubblor: ["spit", "burst", "rain", "drop"],
    bombit: ["place", "giant", "scatter"],
    tyrant: ["emerge", "fireball", "claw", "shell", "hammers"],
    ringo: ["stomp", "ball", "horse", "scatter", ...(extra ? ["wave"] : [])],
    icicle: ["walk", "smash", "icicles", "dash", "penguins"],
    ironclad: ["chase", "laser", "burst", "spin", "boom"],
    masked: ["combo", "dash", ...(extra ? ["beams"] : [])],
    gondola: ["fly", "weights", "zap", "fish"],
    postcat: ["bells", "doors", "shove", "cats"],
  };
  if (id === "masked" && difficultyIsHard(difficulty)) {
    map.masked.push("counter");
  }
  if (id === "postcat" && imp) {
    map.postcat.push("bigbell");
  }
  if (id === "bombit" && extra) {
    map.bombit.push("kick");
  }
  return map[id];
}

function difficultyIsHard(d: RaidWorld["difficulty"]): boolean {
  return d === "hard" || d === "impossible";
}

function makePattern(id: BossId, name: string, world: RaidWorld, boss: BossActor, stun: boolean): Pattern {
  const speed = difficultyDef(world.difficulty).speedMul;

  if (id === "chomper") {
    const moveMul = 0.75;
    if (name === "walkShoot") {
      let acc = 0;
      boss.face(boss.x < 320 ? 500 : 100);
      return timed(1800 / speed, (_t, w, b, dt) => {
        b.sprite.x += b.facing * 1.4 * speed * moveMul;
        acc += dt;
        if (acc > 420 / speed) {
          acc = 0;
          shootFan(w, b, 3, 160, 1, "pellet", 0.28);
        }
      });
    }
    if (name === "dash") {
      const t = world.pickTarget();
      boss.face(t?.x ?? 320);
      return timed(900 / speed, (tm, w, b) => {
        if (tm < 350) {
          b.sprite.setTint(0xffffff);
        } else {
          b.sprite.clearTint();
          b.sprite.x += b.facing * 6 * speed * moveMul;
        }
      }, (w, b) => {
        const mark = w.scene.add.image(b.x, b.y - 40, "bang").setDepth(12);
        w.scene.time.delayedCall(300, () => mark.destroy());
      });
    }
    if (name === "lanes") {
      const ys = [268, 210, 300];
      const y = Phaser.Utils.Array.GetRandom(ys);
      const x = boss.x < 320 ? 520 : 120;
      return timed(1000 / speed, () => {
        boss.sprite.x = Phaser.Math.Linear(boss.sprite.x, x, 0.08 * moveMul);
        boss.sprite.y = Phaser.Math.Linear(boss.sprite.y, y, 0.08 * moveMul);
      });
    }
    if (name === "laser") {
      const t = world.pickTarget();
      const y = t?.y ?? 260;
      return timed(1100 / speed, (tm, w, b) => {
        if (tm > 500 && tm < 560) {
          w.beam(b.facing > 0 ? b.x + 160 : b.x - 160, y, 320, 14, 1.5, 280, stun);
        }
      }, (w, b) => {
        const line = w.scene.add.rectangle(b.facing > 0 ? b.x + 160 : b.x - 160, y, 320, 4, 0xff3b4e, 0.4);
        w.scene.time.delayedCall(500, () => line.destroy());
      });
    }
    return timed(1600, (_t, w, b) => {
      if (Math.random() < 0.04) {
        const g = w.spawnEnemyShot({
          x: b.x,
          y: b.y,
          vx: 0,
          vy: 0,
          damage: 1,
          damageType: "magic",
          texture: "ghost",
          homing: 2.2,
          lifespan: 4000,
          erasable: true,
        });
        g.setVelocity(b.facing * 40, -20);
      }
    });
  }

  if (id === "bubblor") {
    if (name === "spit") {
      let acc = 0;
      return timed(1600 / speed, (_t, w, b, dt) => {
        b.sprite.x += b.facing * 1.2 * speed;
        acc += dt;
        if (acc > 380) {
          acc = 0;
          shootFan(w, b, 2, 130, 1, "bubble", 0.2);
        }
      }, (_w, b) => b.face(b.x < 320 ? 600 : 40));
    }
    if (name === "burst") {
      return timed(900, (_t, w, b) => {
        /* fire once via flag */
      }, (w, b) => {
        for (let i = 0; i < 8; i += 1) {
          const a = (i / 8) * Math.PI * 2;
          w.spawnEnemyShot({
            x: b.x,
            y: b.y,
            vx: Math.cos(a) * 140,
            vy: Math.sin(a) * 140,
            damage: 1,
            damageType: "magic",
            texture: "bubble",
            lifespan: 2000,
          });
        }
      });
    }
    if (name === "rain") {
      return timed(1400 / speed, (t, w, b) => {
        b.sprite.y = 120;
        if (t % 200 < 20) {
          shootFan(w, b, 6, 90, 0.5, "bubble", 0.5);
        }
      }, (_w, b) => {
        b.sprite.y = 120;
      });
    }
    const t = world.pickTarget();
    const tx = t?.x ?? 320;
    const hide = stun;
    return timed(1200 / speed, (tm, w, b) => {
      if (tm < 500) {
        b.sprite.y -= 4;
      } else {
        b.sprite.x = Phaser.Math.Linear(b.sprite.x, tx, 0.2);
        b.sprite.y = Phaser.Math.Linear(b.sprite.y, 280, 0.15);
        if (tm > 900 && tm < 940) {
          w.stomp(b.x, b.y, 70, 1, stun);
        }
      }
    }, (w, b) => {
      if (!hide) {
        const m = w.scene.add.image(tx, 40, "bang").setDepth(12);
        w.scene.time.delayedCall(500, () => m.destroy());
      }
      void b;
    });
  }

  if (id === "bombit") {
    const arm = 48 + (boss.hp < boss.maxHp * 0.5 ? 24 : 0) + (world.difficulty === "impossible" ? 16 : 0);
    if (name === "place") {
      return timed(3200, () => undefined, (w, b) => {
        b.sprite.x += b.facing * 40;
        const bx = b.x;
        const by = 300;
        const bomb = w.scene.add.image(bx, by, "bomb").setDepth(7);
        w.scene.time.delayedCall(3000, () => {
          bomb.destroy();
          w.beam(bx, by, arm * 2, 18, 1, 200);
          w.beam(bx, by, 18, arm * 2, 1, 200);
        });
      });
    }
    if (name === "giant") {
      return timed(2200, () => undefined, (w, b) => {
        const t = w.pickTarget();
        const bx = t?.x ?? b.x;
        const bomb = w.scene.add.image(bx, 80, "bomb").setScale(2).setDepth(7);
        w.scene.tweens.add({
          targets: bomb,
          y: 300,
          duration: 900,
          onComplete: () => {
            bomb.destroy();
            w.stomp(bx, 300, 90, 1.5, stun);
          },
        });
      });
    }
    if (name === "kick") {
      return timed(800, (_t, w, b) => {
        w.spawnEnemyShot({
          x: b.x,
          y: b.y,
          vx: b.facing * 220,
          vy: 0,
          damage: 1,
          damageType: "physical",
          texture: "bomb",
          lifespan: 1800,
        });
      });
    }
    return timed(1000, () => undefined, (w) => {
      for (let i = 0; i < 5; i += 1) {
        const x = 60 + i * 120;
        w.scene.time.delayedCall(i * 120, () => w.beam(x, 300, 40, 40, 1, 180));
      }
    });
  }

  if (id === "tyrant") {
    if (name === "emerge") {
      const t = world.pickTarget();
      const x = t?.x ?? 320;
      return timed(1400 / speed, (tm, _w, b) => {
        if (tm < 400) {
          b.sprite.y += 6;
        } else {
          b.sprite.x = x;
          b.sprite.y = Phaser.Math.Linear(b.sprite.y, 250, 0.15);
        }
      });
    }
    if (name === "fireball") {
      return timed(700, () => undefined, (w, b) => {
        aimShot(w, b, 200, 1.5, "fireball", { scale: 1.6, knock: 200 });
      });
    }
    if (name === "claw") {
      return timed(700 / speed, (tm, w, b) => {
        if (tm > 180 && tm < 220) {
          w.beam(b.x + b.facing * 50, b.y, 90 + (stun ? 30 : 0), 40, 1.5, 160);
        }
      }, (_w, b) => {
        const t = world.pickTarget();
        if (t) {
          b.face(t.x);
        }
      });
    }
    if (name === "shell") {
      return timed(1600 / speed, (_t, _w, b) => {
        b.sprite.x += b.facing * 5 * speed;
        if (b.sprite.x < 40 || b.sprite.x > 600) {
          b.facing *= -1;
        }
        b.sprite.rotation += 0.2;
      }, (_w, b) => {
        b.sprite.setTint(0xc47a3a);
      });
    }
    return timed(800, () => undefined, (w, b) => {
      for (let i = 0; i < 8; i += 1) {
        const a = (i / 8) * Math.PI * 2;
        w.spawnEnemyShot({
          x: b.x,
          y: b.y,
          vx: Math.cos(a) * 150,
          vy: Math.sin(a) * 150,
          damage: 1,
          damageType: "physical",
          texture: "hammer",
          lifespan: 2200,
        });
      }
      b.sprite.clearTint();
      b.sprite.rotation = 0;
    });
  }

  if (id === "ringo") {
    if (name === "stomp") {
      const t = world.pickTarget();
      return timed(1000 / speed, (tm, w, b) => {
        if (tm < 400) {
          b.sprite.y -= 3;
        } else {
          b.sprite.x = Phaser.Math.Linear(b.sprite.x, t?.x ?? 320, 0.2);
          b.sprite.y = Phaser.Math.Linear(b.sprite.y, 280, 0.2);
          if (tm > 720 && tm < 760) {
            w.stomp(b.x, b.y, 64, 1, stun);
          }
        }
      });
    }
    if (name === "ball") {
      return timed(600, () => undefined, (w, b) => {
        w.spawnEnemyShot({
          x: b.x,
          y: b.y,
          vx: b.facing * 240,
          vy: 0,
          damage: 1.5,
          damageType: "physical",
          texture: "ball",
          knock: 240,
          lifespan: 2500,
          scale: 1.4,
        });
      });
    }
    if (name === "horse") {
      const t = world.pickTarget();
      const y = t?.y ?? 260;
      let n = 0;
      return timed(1800 / speed, (tm, w, b) => {
        if (tm > n * 320) {
          n += 1;
          b.sprite.y = y;
          b.facing *= -1;
          b.sprite.x = b.facing > 0 ? 80 : 560;
        }
        b.sprite.x += b.facing * 7 * speed;
      });
    }
    if (name === "wave") {
      return timed(900, (tm, w, b) => {
        if (tm < 40) {
          w.beam(320, 318, 600, 16, 1, 500, stun);
        }
        void b;
      });
    }
    return timed(800, () => undefined, (w, b) => {
      shootFan(w, b, 7, 150, 1, "ball", 0.35);
    });
  }

  if (id === "icicle") {
    if (name === "walk") {
      return timed(1200 / speed, (_t, _w, b) => {
        b.sprite.x += b.facing * 1.6 * speed;
        if (b.x < 40 || b.x > 600) {
          b.facing *= -1;
        }
      });
    }
    if (name === "smash") {
      return timed(700, (tm, w, b) => {
        if (tm > 300 && tm < 340) {
          w.stomp(b.x, b.y + 10, 50, 1, stun);
          w.smashPlatformsNear(b.x, 328, 90);
        }
      });
    }
    if (name === "icicles") {
      return timed(900, () => undefined, (w) => {
        for (let i = 0; i < 6; i += 1) {
          const x = 50 + i * 100 + Math.random() * 30;
          w.spawnEnemyShot({
            x,
            y: 20,
            vx: 0,
            vy: 160,
            damage: 1,
            damageType: "physical",
            texture: "icicle",
            lifespan: 2500,
          });
        }
      });
    }
    if (name === "dash") {
      return timed(700 / speed, (_t, _w, b) => {
        b.sprite.x += b.facing * 8 * speed;
      }, (_w, b) => {
        const t = world.pickTarget();
        if (t) {
          b.face(t.x);
        }
      });
    }
    return timed(700, () => undefined, (w, b) => {
      for (let i = 0; i < 8; i += 1) {
        const a = (i / 8) * Math.PI * 2;
        w.spawnEnemyShot({
          x: b.x,
          y: b.y,
          vx: Math.cos(a) * 140,
          vy: Math.sin(a) * 140,
          damage: 1,
          damageType: "physical",
          texture: "penguin",
          lifespan: 2200,
        });
      }
    });
  }

  if (id === "ironclad") {
    const mul = boss.superForm ? 1.35 : 1;
    if (name === "chase") {
      return timed(1200 / speed, (_t, w, b) => {
        const t = w.pickTarget();
        if (t) {
          b.sprite.x += Math.sign(t.x - b.x) * 1.4 * speed * mul;
        }
      });
    }
    if (name === "laser") {
      return timed(800 / speed, (tm, w, b) => {
        if (tm > 400 && tm < 440) {
          const t = w.pickTarget();
          w.beam(t?.x ?? b.x, 200, 18, 280, 1.5, 220, stun);
        }
      });
    }
    if (name === "burst") {
      return timed(700, () => undefined, (w, b) => {
        shootFan(w, b, 10, 150 * mul, 1, "pellet", 0.4);
      });
    }
    if (name === "spin") {
      return timed(1400 / speed, (t, w, b) => {
        const a = t / 80;
        w.spawnEnemyShot({
          x: b.x,
          y: b.y,
          vx: Math.cos(a) * 170,
          vy: Math.sin(a) * 170,
          damage: 1,
          damageType: "physical",
          texture: "pellet",
          lifespan: 2000,
        });
      });
    }
    return timed(900 / speed, (tm, w, b) => {
      if (tm > 500 && tm < 540) {
        w.beam(b.x + b.facing * 180, b.y, 340, 80, 2, 240, stun);
      }
    });
  }

  if (id === "masked") {
    if (name === "combo") {
      return timed(1000 / speed, (_t, w, b) => {
        const t = w.pickTarget();
        if (t) {
          b.face(t.x);
          b.sprite.x += b.facing * 4 * speed;
        }
        if (Math.random() < 0.08) {
          w.beam(b.x + b.facing * 30, b.y, 50, 30, 1, 80);
        }
      });
    }
    if (name === "dash") {
      return timed(500 / speed, (_t, _w, b) => {
        b.sprite.x += b.facing * 9 * speed;
      }, (_w, b) => {
        const t = world.pickTarget();
        if (t) {
          b.face(t.x);
        }
      });
    }
    if (name === "beams") {
      return timed(900, () => undefined, (w, b) => {
        shootFan(w, b, 8, 180, 1, "slash", 0.45);
      });
    }
    if (name === "counter") {
      return timed(1400, (_t, w, b) => {
        b.counterUntil = w.now + 50;
      }, (w) => {
        w.banner("COUNTER");
        w.scene.cameras.main.flash(80, 20, 20, 40);
      });
    }
    return timed(800, () => undefined, (w, b) => {
      shootFan(w, b, 5, 170, 1, "slash", 0.3);
    });
  }

  if (id === "gondola") {
    if (name === "fly") {
      return timed(1600 / speed, (t, w, b) => {
        b.sprite.x = 320 + Math.sin(t / 200) * 180;
        b.sprite.y = 90 + Math.cos(t / 180) * 30;
        if (t % 280 < 20) {
          w.spawnEnemyShot({
            x: b.x,
            y: b.y + 10,
            vx: 0,
            vy: 80,
            damage: 1,
            damageType: "physical",
            texture: "bubble",
            lifespan: 3000,
          });
        }
      });
    }
    if (name === "weights") {
      return timed(700, () => undefined, (w, b) => {
        const t = w.pickTarget();
        w.spawnEnemyShot({
          x: t?.x ?? b.x,
          y: 20,
          vx: 0,
          vy: 220,
          damage: 1.5,
          damageType: "physical",
          texture: "hammer",
          lifespan: 2500,
          erasable: false,
        });
      });
    }
    if (name === "zap") {
      return timed(800, () => undefined, (w, b) => {
        w.spawnEnemyShot({
          x: b.x,
          y: b.y,
          vx: 0,
          vy: 0,
          damage: 1,
          damageType: "magic",
          texture: "bolt",
          homing: 3,
          lifespan: 2600,
        });
      });
    }
    const t = world.pickTarget();
    let popped = false;
    return timed(2200 / speed, (tm, w, b) => {
      if (tm < 400) {
        b.sprite.y = 340;
        b.sprite.setVisible(false);
      } else if (tm < 1400) {
        b.sprite.setVisible(true);
        if (t) {
          const spikeCenter = 320;
          const goSpike = Math.abs(t.x - spikeCenter) < 80;
          const destX = goSpike ? spikeCenter : t.x;
          b.sprite.x = Phaser.Math.Linear(b.sprite.x, destX, 0.12);
          b.sprite.y = Phaser.Math.Linear(b.sprite.y, goSpike ? 50 : t.y, 0.1);
          if (goSpike && b.y < 70 && !popped && b.balloons < 4) {
            popped = true;
            b.balloons += 1;
            w.banner(`POP ${b.balloons}/4`);
          }
        }
      } else {
        b.sprite.y = Phaser.Math.Linear(b.sprite.y, 120, 0.1);
      }
    }, (w) => {
      if (t) {
        const fish = w.scene.add.image(t.x, 300, "fish").setDepth(9);
        w.scene.time.delayedCall(1400, () => fish.destroy());
      }
    });
  }

  if (id === "postcat") {
    if (name === "bells") {
      return timed(900, () => undefined, (w, b) => {
        shootFan(w, b, 10, 150, 1, "bell", 0.4);
      });
    }
    if (name === "doors") {
      return timed(800, (tm, w) => {
        if (tm < 40) {
          w.beam(200, 220, 20, 200, 1, 400, stun);
          w.beam(440, 220, 20, 200, 1, 400, stun);
        }
      });
    }
    if (name === "shove") {
      const t = world.pickTarget();
      return timed(900, (tm, w, b) => {
        if (tm > 300 && t && !t.dead) {
          t.body.setVelocityX(t.x < 320 ? -420 : 420);
          t.hurt(1, w, { stun: stun ? 800 : 0 });
          b.sprite.x = t.x;
        }
      }, (w) => {
        w.banner("DOOR");
      });
    }
    if (name === "bigbell") {
      return timed(700, (tm, w, b) => {
        if (tm > 300 && tm < 340) {
          w.stomp(b.x, b.y, 800, 1, true);
        }
      }, (w) => w.banner("BELL"));
    }
    return timed(1200, () => undefined, (w) => {
      for (let i = 0; i < 6; i += 1) {
        const x = 80 + i * 90;
        w.spawnEnemyShot({
          x,
          y: -10,
          vx: 0,
          vy: 140,
          damage: 1,
          damageType: "physical",
          texture: "boss-postcat",
          scale: 0.4,
          lifespan: 2500,
        });
      }
    });
  }

  return timed(400, () => undefined);
}

const ultimates: Record<BossId, (world: RaidWorld, boss: BossActor) => Pattern> = {
  chomper: (world, boss) => {
    const moveMul = 0.75;
    const spd = 1.1 * difficultyDef(world.difficulty).speedMul;
    world.rebuildPlatforms([
      { x: 40, y: 280, w: 90, h: 14 },
      { x: 170, y: 230, w: 90, h: 14 },
      { x: 300, y: 180, w: 90, h: 14 },
      { x: 430, y: 230, w: 90, h: 14 },
      { x: 540, y: 280, w: 80, h: 14 },
    ]);
    boss.sprite.setScale(2.2);
    boss.sprite.setPosition(-60, 220);
    return timed(7000, (_t, w, b) => {
      b.sprite.x += 2.8 * spd * moveMul;
      for (const p of w.living()) {
        if (Phaser.Math.Distance.Between(p.x, p.y, b.x, b.y) < 50) {
          p.hurt(99, w);
        }
      }
    });
  },
  bubblor: (world, boss) =>
    timed(7000, (t, w, b) => {
      b.sprite.setPosition(320, 80);
      if (t % 280 < 20) {
        w.spawnEnemyShot({
          x: 40 + Math.random() * 560,
          y: -10,
          vx: 0,
          vy: 90,
          damage: w.difficulty === "easy" || w.difficulty === "normal" ? 0.5 : 1,
          damageType: "magic",
          texture: "bubble",
          lifespan: 4000,
        });
      }
      if (t > 6600 && t < 6640) {
        w.flashDanger();
        for (const p of w.living()) {
          p.hurt(4, w);
        }
      }
    }, (w) => {
      w.scene.time.delayedCall(6400, () => {
        const bang = w.scene.add.image(320, 80, "bang").setScale(2);
        w.scene.time.delayedCall(300, () => bang.destroy());
      });
    }),
  bombit: (world, boss) => {
    let left = 0;
    let right = WIDTH;
    const wallL = world.scene.add.rectangle(10, 180, 20, 360, 0xf4f0e6).setDepth(9);
    const wallR = world.scene.add.rectangle(630, 180, 20, 360, 0xf4f0e6).setDepth(9);
    world.scene.physics.add.existing(wallL, true);
    world.scene.physics.add.existing(wallR, true);
    return timed(8000, (t, w) => {
      left = t / 80;
      right = WIDTH - t / 80;
      wallL.x = left;
      wallR.x = right;
      (wallL.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
      (wallR.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
      for (const p of w.living()) {
        if (p.x < left + 16 || p.x > right - 16) {
          p.hurt(99, w);
        }
      }
      void boss;
    }, () => undefined);
  },
  tyrant: (world, boss) => {
    world.rebuildPlatforms([
      { x: 40, y: 260, w: 100, h: 14 },
      { x: 270, y: 200, w: 100, h: 14 },
      { x: 500, y: 260, w: 100, h: 14 },
      { x: 0, y: 328, w: 640, h: 32, key: "tile-lava" },
    ]);
    const plats = world.platforms.getChildren() as Phaser.Physics.Arcade.Sprite[];
    return timed(10000, (t, w, b) => {
      b.sprite.setPosition(320, 70);
      plats.forEach((p, i) => {
        if (p.texture.key === "tile") {
          p.x = 90 + i * 200 + Math.sin(t / 400 + i) * 50;
          (p.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
        }
      });
      if (t % 900 < 20) {
        aimShot(w, b, 160, 1, "fireball");
      }
    });
  },
  ringo: (world, boss) =>
    timed(7000, (t, w, b) => {
      b.sprite.setPosition(320, 120);
      if (t % 400 < 20) {
        const from = world.difficulty === "impossible" ? Math.random() * 500 + 70 : 80 + Math.random() * 480;
        w.spawnEnemyShot({
          x: from,
          y: HEIGHT - 20,
          vx: (b.x - from) * 0.4,
          vy: (b.y - (HEIGHT - 20)) * 0.4,
          damage: 1,
          damageType: "magic",
          texture: "heart-shot",
          healBoss: 70,
          erasable: true,
          lifespan: 2500,
        });
      }
    }),
  icicle: (world, boss) => {
    world.rebuildPlatforms([
      { x: 80, y: 300, w: 80, h: 12 },
      { x: 260, y: 240, w: 80, h: 12 },
      { x: 420, y: 180, w: 80, h: 12 },
      { x: 220, y: 120, w: 80, h: 12 },
      { x: 380, y: 70, w: 80, h: 12 },
    ]);
    world.banner("CLIMB TIME");
    const plats = world.platforms.getChildren() as Phaser.Physics.Arcade.Sprite[];
    return timed(11000, (t, w, b) => {
      b.sprite.setVisible(false);
      plats.forEach((p, i) => {
        p.x = 80 + ((t / 8 + i * 140) % 500);
        (p.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
      });
      const plane = HEIGHT - t / 40;
      for (const p of w.living()) {
        if (p.y > plane) {
          p.hurt(99, w);
        }
      }
    });
  },
  ironclad: (world, boss) =>
    timed(2800, (t, w, b) => {
      b.sprite.setPosition(320, 240);
      if (t > 2000 && t < 2040) {
        w.flashDanger();
        for (const p of w.living()) {
          p.hurt(99, w);
        }
      }
    }, (w) => {
      w.banner("WARNING");
    }),
  masked: (world, boss) =>
    timed(2400, (t, w, b) => {
      b.sprite.setPosition(320, 200);
      if (t > 800 && t < 840) {
        w.beam(160, 200, 280, 24, 2, 600, true);
        w.beam(480, 200, 280, 24, 2, 600, true);
      }
    }, (w) => w.banner("MACH TORNADO")),
  gondola: (world, boss) =>
    timed(8000, (t, w, b) => {
      b.sprite.setPosition(320, 60);
      for (const p of w.living()) {
        p.body.setVelocityY(p.body.velocity.y - 18);
        if (p.body.velocity.y < -220) {
          p.body.setVelocityY(-220);
        }
      }
      if (t % 260 < 20) {
        w.spawnEnemyShot({
          x: Math.random() * 600 + 20,
          y: -10,
          vx: 0,
          vy: 120,
          damage: 1,
          damageType: "magic",
          texture: "star",
          tint: 0xff3b4e,
          erasable: false,
          lifespan: 3000,
        });
        w.spawnEnemyShot({
          x: Math.random() * 600 + 20,
          y: -10,
          vx: 40 - Math.random() * 80,
          vy: 100,
          damage: 1,
          damageType: "magic",
          texture: "star",
          erasable: true,
          lifespan: 3000,
        });
      }
    }, (w) => w.banner("JUMP! JUMP!")),
  postcat: (world, boss) =>
    timed(6500, (t, w, b) => {
      b.sprite.setPosition(320, 200);
      if (t % 500 < 20) {
        const x = 80 + Math.random() * 480;
        w.beam(x, 200, 18, 240, 1, 280);
      }
      if (t > 5800 && t < 5840) {
        w.beam(320, 180, 640, 40, 99, 400);
      }
    }, (w) => w.banner("DOORS")),
};
