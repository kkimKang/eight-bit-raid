import Phaser from "phaser";
import { KITS } from "../../../features/characters/kits";
import { audio } from "../../../shared/audio";
import { addPlayer, getRun, removeLastPlayer } from "../../../shared/session";
import type { CharacterId } from "../../../shared/types";
import { addButton, addText, addTitle, fillBg } from "../../../shared/ui";

export class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super("CharacterSelectScene");
  }

  create(): void {
    this.input.keyboard?.removeAllListeners();
    fillBg(this);
    addTitle(this, 320, 28, "캐릭터 선택", "22px");
    this.draw();
    this.input.keyboard?.on("keydown-P", () => {
      if (addPlayer()) {
        audio.buy();
        this.scene.restart();
      } else {
        audio.deny();
      }
    });
    this.input.keyboard?.on("keydown-BACKSPACE", () => {
      if (removeLastPlayer()) {
        this.scene.restart();
      }
    });
    this.input.keyboard?.on("keydown-ENTER", () => this.confirm());
    this.input.keyboard?.on("keydown-ESC", () => this.scene.start("DifficultyScene"));
  }

  private draw(): void {
    const run = getRun();
    addText(this, 320, 50, `플레이어 ${run.players.length}인  ·  P 추가  ·  Backspace 제거`, {
      fontSize: "12px",
      color: "#8a8494",
    }).setOrigin(0.5);

    run.players.forEach((p, i) => {
      addText(this, 80 + i * 150, 72, `P${i + 1}  ${p.characterId.toUpperCase()}`, {
        fontSize: "13px",
        color: "#ffd24a",
      });
    });

    KITS.forEach((kit, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = 80 + col * 150;
      const y = 110 + row * 110;
      const img = this.add.image(x, y + 8, "player").setTint(kit.color).setInteractive({ useHandCursor: true });
      addText(this, x + 18, y - 8, kit.name, { fontSize: "12px", color: "#f4f0e6" });
      addText(this, x + 18, y + 8, kit.roleLabel, { fontSize: "12px", color: "#8a8494" });
      addText(this, x, y + 36, kit.blurb, { fontSize: "12px", color: "#6a6474", wordWrap: { width: 140 } });
      const pick = () => {
        run.players[run.selectedSlot].characterId = kit.id as CharacterId;
        audio.hit();
        this.scene.restart();
      };
      img.on("pointerdown", pick);
      addButton(this, x + 18, y + 22, "선택", pick, { fontSize: "12px", color: "#ffd24a" });
    });

    addText(this, 20, 330, "슬롯: 1-4", { fontSize: "12px", color: "#8a8494" });
    [1, 2, 3, 4].forEach((n) => {
      this.input.keyboard?.on(`keydown-${["ONE", "TWO", "THREE", "FOUR"][n - 1]}`, () => {
        if (run.players[n - 1]) {
          run.selectedSlot = n - 1;
          this.scene.restart();
        }
      });
    });

    addButton(this, 320, 332, "[ 확정 Enter ]", () => this.confirm(), { fontSize: "14px", color: "#5ee0a0" }).setOrigin(0.5);
  }

  private confirm(): void {
    audio.buy();
    this.scene.start("LobbyShopScene");
  }
}
