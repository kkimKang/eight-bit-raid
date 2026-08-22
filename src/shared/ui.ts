import Phaser from "phaser";
import { COLORS, HEIGHT, RENDER_SCALE, WIDTH } from "../config/constants";

export const UI_FONT = '"Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';

export const PIXEL_TEXT: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: UI_FONT,
  fontSize: "14px",
  color: "#f4f0e6",
  align: "left",
};

export function setupWorldCamera(scene: Phaser.Scene): void {
  const cam = scene.cameras.main;
  cam.setZoom(RENDER_SCALE);
  cam.centerOn(WIDTH / 2, HEIGHT / 2);
}

export function addText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  content: string,
  extra?: Phaser.Types.GameObjects.Text.TextStyle,
): Phaser.GameObjects.Text {
  const fontSize = extra?.fontSize ?? PIXEL_TEXT.fontSize ?? "14px";
  const px = typeof fontSize === "number" ? fontSize : parseInt(String(fontSize), 10) || 14;
  return scene.add
    .text(x, y, content, { ...PIXEL_TEXT, ...extra })
    .setResolution(Math.max(2, RENDER_SCALE))
    .setPadding(Math.ceil(px * 0.15), Math.ceil(px * 0.12), Math.ceil(px * 0.15), Math.ceil(px * 0.2));
}

export function addTitle(
  scene: Phaser.Scene,
  x: number,
  y: number,
  content: string,
  size = "28px",
): Phaser.GameObjects.Text {
  return addText(scene, x, y, content, {
    fontSize: size,
    fontStyle: "bold",
    color: "#ffd24a",
    stroke: "#1a1420",
    strokeThickness: 3,
  }).setOrigin(0.5);
}

export function addButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
  extra?: Phaser.Types.GameObjects.Text.TextStyle,
): Phaser.GameObjects.Text {
  const t = addText(scene, x, y, label, extra).setInteractive({ useHandCursor: true });
  t.on("pointerover", () => t.setAlpha(0.8));
  t.on("pointerout", () => t.setAlpha(1));
  t.on("pointerdown", onClick);
  return t;
}

export function fillBg(scene: Phaser.Scene, color: number = COLORS.bg): void {
  setupWorldCamera(scene);
  scene.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, color).setScrollFactor(0);
}
