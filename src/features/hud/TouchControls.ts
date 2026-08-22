import Phaser from "phaser";
import { HEIGHT, WIDTH } from "../../config/constants";
import { addText } from "../../shared/ui";
import type { PlayerInput } from "../../shared/input";

const DEPTH = 40;
const STICK_MAX = 30;
const STICK_DEAD = 10;

export class TouchControls {
  left = false;
  right = false;
  up = false;
  down = false;
  jump = false;
  attack = false;
  skillC = false;
  skillS = false;
  skillD = false;

  private stickPointer = -1;
  private readonly knob: Phaser.GameObjects.Arc;
  private readonly baseX = 78;
  private readonly baseY = HEIGHT - 62;

  constructor(scene: Phaser.Scene) {
    scene.input.addPointer(3);

    const stickHit = scene.add
      .zone(this.baseX, this.baseY, 170, 150)
      .setDepth(DEPTH)
      .setInteractive();
    const base = scene.add
      .circle(this.baseX, this.baseY, 38, 0x1a1420, 0.45)
      .setStrokeStyle(2, 0xf4f0e6, 0.55)
      .setDepth(DEPTH)
      .setInteractive();
    this.knob = scene.add.circle(this.baseX, this.baseY, 16, 0xffd24a, 0.85).setDepth(DEPTH + 1);
    addText(scene, this.baseX, this.baseY + 46, "이동", { fontSize: "11px", color: "#8a8494" })
      .setOrigin(0.5)
      .setDepth(DEPTH);

    stickHit.on("pointerdown", (p: Phaser.Input.Pointer) => this.grabStick(p));
    base.on("pointerdown", (p: Phaser.Input.Pointer) => this.grabStick(p));

    scene.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      if (p.id === this.stickPointer) {
        this.dragStick(p);
      }
    });
    scene.input.on("pointerup", (p: Phaser.Input.Pointer) => this.release(p.id));
    scene.input.on("pointerupoutside", (p: Phaser.Input.Pointer) => this.release(p.id));

    this.makeButton(scene, WIDTH - 52, HEIGHT - 42, 26, "공격", 0x4aa3ff, (down) => {
      this.attack = down;
    });
    this.makeButton(scene, WIDTH - 112, HEIGHT - 42, 26, "점프", 0x5ee0a0, (down) => {
      this.jump = down;
    });
    this.makeButton(scene, WIDTH - 172, HEIGHT - 88, 20, "C", 0xffd24a, (down) => {
      this.skillC = down;
    });
    this.makeButton(scene, WIDTH - 112, HEIGHT - 96, 20, "S", 0xc084fc, (down) => {
      this.skillS = down;
    });
    this.makeButton(scene, WIDTH - 52, HEIGHT - 96, 20, "D", 0xe67e22, (down) => {
      this.skillD = down;
    });
  }

  sample(): Pick<
    PlayerInput,
    "left" | "right" | "up" | "down" | "jump" | "attack" | "skillC" | "skillS" | "skillD"
  > {
    return {
      left: this.left,
      right: this.right,
      up: this.up,
      down: this.down,
      jump: this.jump,
      attack: this.attack,
      skillC: this.skillC,
      skillS: this.skillS,
      skillD: this.skillD,
    };
  }

  private makeButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    r: number,
    label: string,
    color: number,
    setHeld: (down: boolean) => void,
  ): void {
    const btn = scene.add.circle(x, y, r, color, 0.38).setStrokeStyle(2, color, 0.9).setDepth(DEPTH);
    addText(scene, x, y, label, { fontSize: r > 22 ? "12px" : "13px", color: "#f4f0e6" })
      .setOrigin(0.5)
      .setDepth(DEPTH + 1);
    btn.setInteractive();
    btn.on("pointerdown", (p: Phaser.Input.Pointer) => {
      p.event?.preventDefault?.();
      setHeld(true);
      btn.setFillStyle(color, 0.7);
    });
    const up = () => {
      setHeld(false);
      btn.setFillStyle(color, 0.38);
    };
    btn.on("pointerup", up);
    btn.on("pointerout", up);
    btn.on("pointerupoutside", up);
  }

  private grabStick(p: Phaser.Input.Pointer): void {
    this.stickPointer = p.id;
    this.dragStick(p);
  }

  private dragStick(p: Phaser.Input.Pointer): void {
    const dx = Phaser.Math.Clamp(p.worldX - this.baseX, -STICK_MAX, STICK_MAX);
    const dy = Phaser.Math.Clamp(p.worldY - this.baseY, -STICK_MAX, STICK_MAX);
    const dist = Math.hypot(dx, dy);
    const scale = dist > STICK_MAX ? STICK_MAX / dist : 1;
    this.knob.setPosition(this.baseX + dx * scale, this.baseY + dy * scale);
    this.left = dx < -STICK_DEAD;
    this.right = dx > STICK_DEAD;
    this.up = dy < -STICK_DEAD;
    this.down = dy > STICK_DEAD;
  }

  private release(id: number): void {
    if (id !== this.stickPointer) {
      return;
    }
    this.stickPointer = -1;
    this.knob.setPosition(this.baseX, this.baseY);
    this.left = this.right = this.up = this.down = false;
  }
}
