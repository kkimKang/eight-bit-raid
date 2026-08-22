import Phaser from "phaser";
import { audio } from "../../../shared/audio";
import { loadClears } from "../../../shared/session";
import { addButton, addText, addTitle, fillBg } from "../../../shared/ui";

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

    addButton(this, 320, 250, "[ 시작 ]", () => this.begin(), { fontSize: "16px", color: "#ffd24a" }).setOrigin(0.5);
    addText(this, 320, 290, "1P  방향키 이동  Z점프  X공격  C/S/D스킬", { fontSize: "13px", color: "#8a8494" }).setOrigin(0.5);
    addText(this, 320, 308, "2P  IJKL 이동  F점프  G공격  H/U/O스킬   M 음소거", { fontSize: "13px", color: "#8a8494" }).setOrigin(0.5);
    addText(this, 320, 332, "클릭하거나 Enter", { fontSize: "13px", color: "#6a6474" }).setOrigin(0.5);

    this.input.keyboard?.once("keydown-ENTER", () => this.begin());
    this.input.keyboard?.once("keydown-Z", () => this.begin());
    this.input.keyboard?.once("keydown-X", () => this.begin());
  }

  private begin(): void {
    audio.unlock();
    audio.tone(523, 0.08);
    this.scene.start("DifficultyScene");
  }
}
