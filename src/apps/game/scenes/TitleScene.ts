import Phaser from "phaser";
import { SaveSlotPanel } from "../../../features/hud/SaveSlotPanel";
import { audio } from "../../../shared/audio";
import { isHandheld } from "../../../shared/device";
import { setPendingFight } from "../../../shared/saveSlots";
import { loadClears } from "../../../shared/session";
import { addButton, addText, addTitle, fillBg } from "../../../shared/ui";

export class TitleScene extends Phaser.Scene {
  private saveSlots?: SaveSlotPanel;

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

    addButton(this, 320, 234, "[ 새 시작 ]", () => this.beginNew(), {
      fontSize: "16px",
      color: "#ffd24a",
    }).setOrigin(0.5);
    addButton(this, 320, 262, "[ 불러오기 ]", () => this.openLoad(), {
      fontSize: "16px",
      color: "#5ee0a0",
    }).setOrigin(0.5);

    if (isHandheld()) {
      addText(this, 320, 300, "휴대폰: 전투 중 왼쪽 조이스틱 · 오른쪽 공격/스킬", {
        fontSize: "13px",
        color: "#8a8494",
      }).setOrigin(0.5);
    } else {
      addText(this, 320, 296, "1P  방향키 이동  Z점프  X공격  C/S/D스킬", { fontSize: "13px", color: "#8a8494" }).setOrigin(0.5);
      addText(this, 320, 314, "2P  IJKL 이동  F점프  G공격  H/U/O스킬   M 음소거", { fontSize: "13px", color: "#8a8494" }).setOrigin(0.5);
      addText(this, 320, 336, "Enter 새 시작  ·  L 불러오기", { fontSize: "13px", color: "#6a6474" }).setOrigin(0.5);
    }

    this.saveSlots = new SaveSlotPanel(this);
    this.input.keyboard?.on("keydown-ENTER", () => {
      if (this.saveSlots?.isVisible()) {
        return;
      }
      this.beginNew();
    });
    this.input.keyboard?.on("keydown-Z", () => {
      if (!this.saveSlots?.isVisible()) {
        this.beginNew();
      }
    });
    this.input.keyboard?.on("keydown-X", () => {
      if (!this.saveSlots?.isVisible()) {
        this.beginNew();
      }
    });
    this.input.keyboard?.on("keydown-L", () => this.openLoad());
    this.input.keyboard?.on("keydown-ESC", () => this.saveSlots?.hide());
    this.input.keyboard?.on("keydown-ONE", () => this.saveSlots?.pickByNumber(1));
    this.input.keyboard?.on("keydown-TWO", () => this.saveSlots?.pickByNumber(2));
    this.input.keyboard?.on("keydown-THREE", () => this.saveSlots?.pickByNumber(3));
    this.input.keyboard?.on("keydown-FOUR", () => this.saveSlots?.pickByNumber(4));
    this.input.keyboard?.on("keydown-FIVE", () => this.saveSlots?.pickByNumber(5));
  }

  private beginNew(): void {
    audio.unlock();
    audio.tone(523, 0.08);
    this.scene.start("DifficultyScene");
  }

  private openLoad(): void {
    audio.unlock();
    this.saveSlots?.open("load", {
      onLoaded: (slot) => {
        if (slot.fight) {
          setPendingFight(slot.fight);
          this.scene.start("BossFightScene");
          return;
        }
        this.scene.start("LobbyShopScene");
      },
    });
  }
}
