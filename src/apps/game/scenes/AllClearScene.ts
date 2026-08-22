import Phaser from "phaser";
import { audio } from "../../../shared/audio";
import { getRun, markCleared } from "../../../shared/session";
import { addButton, addText, addTitle, fillBg } from "../../../shared/ui";

export class AllClearScene extends Phaser.Scene {
  constructor() {
    super("AllClearScene");
  }

  create(): void {
    this.input.keyboard?.removeAllListeners();
    fillBg(this, 0x101018);
    const run = getRun();
    markCleared(run.difficulty);
    audio.win();
    addTitle(this, 320, 90, "ALL CLEAR", "36px");
    addText(this, 320, 140, `${run.difficulty.toUpperCase()}  레이드를 완수했다`, {
      fontSize: "14px",
      color: "#c8c4d4",
    }).setOrigin(0.5);
    addText(this, 320, 180, "8-BIT RAID", { fontSize: "12px", color: "#ffd24a" }).setOrigin(0.5);
    run.players.forEach((p, i) => {
      addText(this, 320, 210 + i * 16, `P${i + 1}  ${p.characterId.toUpperCase()}  GOLD ${p.gold}`, {
        fontSize: "13px",
        color: "#8a8494",
      }).setOrigin(0.5);
    });
    addButton(this, 320, 300, "[ 타이틀로 ]", () => this.scene.start("TitleScene"), {
      fontSize: "14px",
      color: "#5ee0a0",
    }).setOrigin(0.5);
    this.input.keyboard?.once("keydown-ENTER", () => this.scene.start("TitleScene"));
  }
}
