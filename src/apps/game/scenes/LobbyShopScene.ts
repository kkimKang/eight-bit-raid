import Phaser from "phaser";
import { ATK_COST, ATK_MAX, CDR_COST, CDR_MAX, HP_COST, HP_MAX } from "../../../config/upgrades";
import { bossById } from "../../../features/bosses/roster";
import { kitById } from "../../../features/characters/kits";
import { audio } from "../../../shared/audio";
import { currentBossId, getRun } from "../../../shared/session";
import { addButton, addText, addTitle, fillBg } from "../../../shared/ui";

export class LobbyShopScene extends Phaser.Scene {
  constructor() {
    super("LobbyShopScene");
  }

  create(): void {
    this.input.keyboard?.removeAllListeners();
    fillBg(this);
    const run = getRun();
    const boss = bossById(currentBossId());
    addTitle(this, 320, 28, "대기실 상점", "22px");
    addText(this, 320, 52, `다음 보스  ${boss.name}  ·  ${boss.title}  ·  ${run.difficulty.toUpperCase()}`, {
      fontSize: "13px",
      color: "#c8c4d4",
    }).setOrigin(0.5);

    run.players.forEach((p, i) => {
      const x = 40 + i * 155;
      const kit = kitById(p.characterId);
      this.add.rectangle(x + 70, 150, 148, 150, 0x1c1c2e).setStrokeStyle(1, kit.color);
      this.add.image(x + 28, 100, "player").setTint(kit.color);
      addText(this, x + 48, 88, `P${i + 1} ${kit.name}`, { fontSize: "13px", color: "#ffd24a" });
      addText(this, x + 8, 118, `GOLD ${p.gold}`, { fontSize: "13px", color: "#ffd24a" });
      addText(this, x + 8, 136, `ATK ${p.upgrades.atk}/${ATK_MAX}`, { fontSize: "12px" });
      addText(this, x + 8, 150, `HP  ${p.upgrades.hp}/${HP_MAX}`, { fontSize: "12px" });
      addText(this, x + 8, 164, `CDR ${p.upgrades.cdr}/${CDR_MAX}`, { fontSize: "12px" });
      if (run.selectedSlot === i) {
        addText(this, x + 48, 78, "▼", { color: "#5ee0a0" });
      }
      addButton(this, x + 8, 186, "이 슬롯", () => {
        run.selectedSlot = i;
        this.scene.restart();
      }, { fontSize: "12px", color: "#5ee0a0" });
    });

    const buy = (kind: "atk" | "hp" | "cdr") => {
      const p = run.players[run.selectedSlot];
      const cost = kind === "atk" ? ATK_COST : kind === "hp" ? HP_COST : CDR_COST;
      const max = kind === "atk" ? ATK_MAX : kind === "hp" ? HP_MAX : CDR_MAX;
      if (p.upgrades[kind] >= max || p.gold < cost) {
        audio.deny();
        return;
      }
      p.gold -= cost;
      p.upgrades[kind] += 1;
      audio.buy();
      this.scene.restart();
    };

    addText(this, 40, 240, `선택 슬롯 P${run.selectedSlot + 1}  업그레이드`, { fontSize: "12px", color: "#ffd24a" });
    addButton(this, 40, 270, `[1] 공격력 +10%   ${ATK_COST}G`, () => buy("atk"), { fontSize: "12px" });
    addButton(this, 40, 292, `[2] 체력 +1칸      ${HP_COST}G`, () => buy("hp"), { fontSize: "12px" });
    addButton(this, 40, 314, `[3] 쿨감/마나 +5%  ${CDR_COST}G`, () => buy("cdr"), { fontSize: "12px" });

    addButton(this, 430, 300, "[ SPACE 출전 ]", () => this.startFight(), {
      fontSize: "16px",
      color: "#5ee0a0",
    });

    this.input.keyboard?.on("keydown-ONE", () => buy("atk"));
    this.input.keyboard?.on("keydown-TWO", () => buy("hp"));
    this.input.keyboard?.on("keydown-THREE", () => buy("cdr"));
    this.input.keyboard?.on("keydown-SPACE", () => this.startFight());
    this.input.keyboard?.on("keydown-ENTER", () => this.startFight());
    this.input.keyboard?.on("keydown-TAB", (e: Event) => {
      e.preventDefault();
      run.selectedSlot = (run.selectedSlot + 1) % run.players.length;
      this.scene.restart();
    });
  }

  private startFight(): void {
    audio.skill();
    this.scene.start("BossFightScene");
  }
}
