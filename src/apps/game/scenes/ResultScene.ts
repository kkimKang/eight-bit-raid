import Phaser from "phaser";
import { bossesForDifficulty } from "../../../features/bosses/roster";
import { audio } from "../../../shared/audio";
import { getRun, isFinalBoss, markCleared } from "../../../shared/session";
import { addButton, addText, addTitle, fillBg } from "../../../shared/ui";

export class ResultScene extends Phaser.Scene {
  constructor() {
    super("ResultScene");
  }

  create(): void {
    this.input.keyboard?.removeAllListeners();
    fillBg(this);
    const run = getRun();
    const r = run.lastResult;
    if (!r) {
      this.scene.start("LobbyShopScene");
      return;
    }

    addTitle(this, 320, 60, r.wiped ? "WIPE" : "CLEAR", "32px");
    addText(this, 320, 100, r.bossName, { fontSize: "16px", color: "#c8c4d4" }).setOrigin(0.5);
    addText(this, 320, 140, `RANK  ${r.rank}`, { fontSize: "28px", color: "#ffd24a" }).setOrigin(0.5);
    addText(this, 320, 176, `DEATHS ${r.deaths}   GOLD +${r.gold}   TIME ${(r.timeMs / 1000).toFixed(1)}s`, {
      fontSize: "12px",
      color: "#c8c4d4",
    }).setOrigin(0.5);

    run.players.forEach((p, i) => {
      addText(this, 320, 210 + i * 16, `P${i + 1}  ${p.characterId.toUpperCase()}  GOLD ${p.gold}`, {
        fontSize: "13px",
        color: "#8a8494",
      }).setOrigin(0.5);
    });

    if (r.wiped) {
      addButton(this, 320, 300, "[ 재도전 SPACE ]", () => this.scene.start("LobbyShopScene"), {
        fontSize: "14px",
        color: "#ff8fab",
      }).setOrigin(0.5);
    } else if (isFinalBoss()) {
      markCleared(run.difficulty);
      addButton(this, 320, 300, "[ 엔딩 ]", () => this.scene.start("AllClearScene"), {
        fontSize: "14px",
        color: "#5ee0a0",
      }).setOrigin(0.5);
    } else {
      addButton(this, 320, 300, "[ 다음 보스 SPACE ]", () => {
        run.bossIndex += 1;
        const list = bossesForDifficulty(run.difficulty);
        run.bossIndex = Math.min(run.bossIndex, list.length - 1);
        this.scene.start("LobbyShopScene");
      }, { fontSize: "14px", color: "#5ee0a0" }).setOrigin(0.5);
    }

    this.input.keyboard?.once("keydown-SPACE", () => this.advance());
    this.input.keyboard?.once("keydown-ENTER", () => this.advance());
  }

  private advance(): void {
    const run = getRun();
    const r = run.lastResult;
    if (!r) {
      return;
    }
    audio.buy();
    if (r.wiped) {
      this.scene.start("LobbyShopScene");
    } else if (isFinalBoss()) {
      this.scene.start("AllClearScene");
    } else {
      run.bossIndex += 1;
      this.scene.start("LobbyShopScene");
    }
  }
}
