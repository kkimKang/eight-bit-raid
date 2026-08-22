import Phaser from "phaser";
import { DIFFICULTIES, type DifficultyId } from "../../../config/difficulties";
import { audio } from "../../../shared/audio";
import { resetRun } from "../../../shared/session";
import { addButton, addText, addTitle, fillBg } from "../../../shared/ui";

export class DifficultyScene extends Phaser.Scene {
  constructor() {
    super("DifficultyScene");
  }

  create(): void {
    this.input.keyboard?.removeAllListeners();
    fillBg(this);
    addTitle(this, 320, 50, "난이도", "24px");
    addText(this, 320, 78, "Easy는 MASKED까지 · Normal은 GONDOLA까지 · Hard+는 POSTCAT까지", {
      fontSize: "13px",
      color: "#8a8494",
    }).setOrigin(0.5);

    DIFFICULTIES.forEach((d, i) => {
      const y = 120 + i * 42;
      addButton(this, 320, y, `${d.labelEn}   ${d.label}`, () => this.pick(d.id), {
        fontSize: "16px",
        color: i === 3 ? "#ff8fab" : "#f4f0e6",
      }).setOrigin(0.5);
    });

    this.input.keyboard?.on("keydown-ONE", () => this.pick("easy"));
    this.input.keyboard?.on("keydown-TWO", () => this.pick("normal"));
    this.input.keyboard?.on("keydown-THREE", () => this.pick("hard"));
    this.input.keyboard?.on("keydown-FOUR", () => this.pick("impossible"));
    this.input.keyboard?.on("keydown-ESC", () => this.scene.start("TitleScene"));
  }

  private pick(id: DifficultyId): void {
    audio.buy();
    resetRun(id);
    this.scene.start("CharacterSelectScene");
  }
}
