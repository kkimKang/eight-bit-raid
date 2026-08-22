import Phaser from "phaser";

export function burstRing(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number,
  opts?: { radius?: number; duration?: number; depth?: number },
): void {
  const ring = scene.add
    .circle(x, y, opts?.radius ?? 18, color, 0)
    .setStrokeStyle(3, color, 0.85)
    .setDepth(opts?.depth ?? 14);
  scene.tweens.add({
    targets: ring,
    scaleX: 2.6,
    scaleY: 2.6,
    alpha: 0,
    duration: opts?.duration ?? 300,
    ease: "Cubic.easeOut",
    onComplete: () => ring.destroy(),
  });
}

export function flashDisc(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number,
  radius = 28,
): void {
  const disc = scene.add.circle(x, y, radius, color, 0.55).setDepth(13);
  scene.tweens.add({
    targets: disc,
    alpha: 0,
    scaleX: 1.8,
    scaleY: 1.8,
    duration: 220,
    onComplete: () => disc.destroy(),
  });
}

export function sparkBurst(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number,
  count = 8,
): void {
  for (let i = 0; i < count; i += 1) {
    const ang = (Math.PI * 2 * i) / count;
    const spark = scene.add.rectangle(x, y, 6, 2, color, 0.9).setDepth(14).setRotation(ang);
    scene.tweens.add({
      targets: spark,
      x: x + Math.cos(ang) * 34,
      y: y + Math.sin(ang) * 34,
      alpha: 0,
      duration: 260,
      onComplete: () => spark.destroy(),
    });
  }
}

export function warpFlash(scene: Phaser.Scene, x: number, y: number, color: number): void {
  flashDisc(scene, x, y, color, 22);
  burstRing(scene, x, y, color, { radius: 12, duration: 240 });
  const cross = scene.add.image(x, y, "bang").setTint(color).setScale(0.6).setDepth(15).setAlpha(0.9);
  scene.tweens.add({
    targets: cross,
    alpha: 0,
    scaleX: 1.4,
    scaleY: 1.4,
    duration: 200,
    onComplete: () => cross.destroy(),
  });
}

export function followAura(
  scene: Phaser.Scene,
  sprite: Phaser.GameObjects.Sprite,
  color: number,
  ms: number,
  scale = 1.35,
): void {
  const aura = scene.add.circle(sprite.x, sprite.y - 8, 16, color, 0.22).setDepth(sprite.depth - 1);
  aura.setStrokeStyle(2, color, 0.75);
  const pulse = scene.tweens.add({
    targets: aura,
    scaleX: scale,
    scaleY: scale,
    alpha: 0.08,
    duration: 420,
    yoyo: true,
    repeat: Math.max(1, Math.floor(ms / 420)),
  });
  const track = scene.time.addEvent({
    delay: 16,
    repeat: Math.floor(ms / 16),
    callback: () => {
      if (!sprite.active) {
        return;
      }
      aura.setPosition(sprite.x, sprite.y - 8);
    },
  });
  scene.time.delayedCall(ms, () => {
    track.remove(false);
    pulse.remove();
    aura.destroy();
  });
}

export function slashArc(
  scene: Phaser.Scene,
  x: number,
  y: number,
  facing: number,
  color: number,
): void {
  const slash = scene.add.image(x + facing * 14, y - 8, "slash").setTint(color).setDepth(14).setAlpha(0.85);
  slash.setFlipX(facing < 0);
  slash.setScale(facing < 0 ? -1.2 : 1.2, 1.2);
  scene.tweens.add({
    targets: slash,
    alpha: 0,
    x: slash.x + facing * 22,
    duration: 180,
    onComplete: () => slash.destroy(),
  });
}

export function groundSlam(scene: Phaser.Scene, x: number, y: number, color: number): void {
  const dust = scene.add.ellipse(x, y + 6, 48, 10, color, 0.35).setDepth(12);
  scene.tweens.add({
    targets: dust,
    scaleX: 2.2,
    alpha: 0,
    duration: 320,
    onComplete: () => dust.destroy(),
  });
  burstRing(scene, x, y + 4, color, { radius: 10, duration: 260 });
}

export function healRise(scene: Phaser.Scene, x: number, y: number, color: number): void {
  for (let i = 0; i < 4; i += 1) {
    const heart = scene.add.image(x + (i - 1.5) * 10, y - 6, "heart").setTint(color).setScale(0.7).setDepth(14);
    scene.tweens.add({
      targets: heart,
      y: y - 36,
      alpha: 0,
      delay: i * 60,
      duration: 520,
      onComplete: () => heart.destroy(),
    });
  }
  flashDisc(scene, x, y - 8, color, 20);
}

export function lightningBolt(
  scene: Phaser.Scene,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: number,
): void {
  const g = scene.add.graphics().setDepth(15);
  g.lineStyle(3, color, 0.95);
  g.beginPath();
  g.moveTo(x1, y1);
  const steps = 5;
  for (let i = 1; i < steps; i += 1) {
    const t = i / steps;
    const mx = Phaser.Math.Linear(x1, x2, t) + Phaser.Math.Between(-8, 8);
    const my = Phaser.Math.Linear(y1, y2, t) + Phaser.Math.Between(-6, 6);
    g.lineTo(mx, my);
  }
  g.lineTo(x2, y2);
  g.strokePath();
  scene.tweens.add({
    targets: g,
    alpha: 0,
    duration: 180,
    onComplete: () => g.destroy(),
  });
  flashDisc(scene, x2, y2, color, 16);
}
