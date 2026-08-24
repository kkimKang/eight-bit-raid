import Phaser from "phaser";
import { audio } from "../../../shared/audio";
import { isHandheld } from "../../../shared/device";
import { loadClears } from "../../../shared/session";
import { addText, addTitle, fillBg } from "../../../shared/ui";

export class TitleScene extends Phaser.Scene {

  constructor() {
    super("TitleScene");
  }

  create(): void {
    this.input.keyboard?.removeAllListeners();
    fillBg(this);
    for (let i = 0; i < 24; i += 1) {
      this.add.image(20 + (i * 53) % 640, 40 + (i * 37) % 280, "star").setAlpha(0.15).setScale(0.7);
    }
    addTitle(this, 320, 90, "8-BIT RAID", "36px");
    addText(this, 320, 128, "키보드로 보스를 공략하라", { fontSize: "15px", color: "#c8c4d4" }).setOrigin(0.5);
    addText(this, 320, 168, "오리지널 팬 호러지 · 타사 IP와 무관", { fontSize: "13px", color: "#8a8494" }).setOrigin(0.5);

    const clears = loadClears();
    const badges = ["easy", "normal", "hard", "impossible"]
      .filter((k) => clears[k])
      .map((k) => k.toUpperCase())
      .join("  ");
    if (badges) {
      addText(this, 320, 196, `CLEAR  ${badges}`, { fontSize: "13px", color: "#5ee0a0" }).setOrigin(0.5);
    }

    this.makeMenuButton(320, 236, "[ 새 시작 ]", "#ffd24a", () => this.beginNew());
    this.makeMenuButton(320, 276, "[ 불러오기 ]", "#5ee0a0", () => this.openLoad());

    if (isHandheld()) {
      addText(this, 320, 318, "휴대폰: 전투 중 왼쪽 조이스틱 · 오른쪽 공격/스킬", {
        fontSize: "13px",
        color: "#8a8494",
      }).setOrigin(0.5);
    } else {
      addText(this, 320, 318, "1P  방향키 이동  Z점프  X공격  C/S/D스킬", { fontSize: "13px", color: "#8a8494" }).setOrigin(0.5);
      addText(this, 320, 336, "Enter 새 시작  ·  L 불러오기", { fontSize: "13px", color: "#6a6474" }).setOrigin(0.5);
    }

    this.input.keyboard?.on("keydown-ENTER", () => this.beginNew());
    this.input.keyboard?.on("keydown-L", () => this.openLoad());
  }

  private makeMenuButton(x: number, y: number, label: string, color: string, onClick: () => void): void {
    const hit = this.add.rectangle(x, y, 220, 32, 0x1a1420, 0.001).setInteractive({ useHandCursor: true });
    const text = addText(this, x, y, label, { fontSize: "18px", color }).setOrigin(0.5);
    hit.on("pointerover", () => text.setAlpha(0.8));
    hit.on("pointerout", () => text.setAlpha(1));
    hit.on("pointerdown", onClick);
  }

  private beginNew(): void {
    audio.unlock();
    audio.tone(523, 0.08);
    this.scene.start("DifficultyScene");
  }

  private openLoad(): void {
    audio.unlock();
    this.scene.start("SaveSlotScene", { mode: "load", returnScene: "TitleScene" });
  }
}
