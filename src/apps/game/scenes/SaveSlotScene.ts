import Phaser from "phaser";
import { HEIGHT, WIDTH } from "../../../config/constants";
import { kitById } from "../../../features/characters/kits";
import { bossById, bossesForDifficulty } from "../../../features/bosses/roster";
import { audio } from "../../../shared/audio";
import {
  listSaveSlots,
  readSaveSlot,
  SAVE_SLOT_COUNT,
  setPendingFight,
  writeSaveSlot,
  type FightSnapshot,
  type SaveSlot,
} from "../../../shared/saveSlots";
import { cloneRun, getRun, setRun } from "../../../shared/session";
import { addButton, addText, addTitle, fillBg } from "../../../shared/ui";

export type SaveSlotMode = "save" | "load";

export interface SaveSlotSceneData {
  mode: SaveSlotMode;
  returnScene: string;
  overlay?: boolean;
  fight?: FightSnapshot | null;
}

function formatWhen(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}  ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function slotMeta(slot: SaveSlot): { room: string; when: string; chars: string } {
  const list = bossesForDifficulty(slot.run.difficulty);
  const bossId = list[Math.min(slot.run.bossIndex, list.length - 1)];
  const boss = bossById(bossId);
  const chars = slot.run.players.map((p) => kitById(p.characterId).name).join(" / ");
  return {
    room: `${boss.name} 룸`,
    when: formatWhen(slot.savedAt),
    chars,
  };
}

export class SaveSlotScene extends Phaser.Scene {
  private mode: SaveSlotMode = "load";
  private returnScene = "TitleScene";
  private overlay = false;
  private fight: FightSnapshot | null = null;
  private status?: Phaser.GameObjects.Text;

  constructor() {
    super("SaveSlotScene");
  }

  init(data: SaveSlotSceneData): void {
    this.mode = data.mode;
    this.returnScene = data.returnScene;
    this.overlay = Boolean(data.overlay);
    this.fight = data.fight ?? null;
  }

  create(): void {
    this.input.keyboard?.removeAllListeners();
    this.scene.bringToTop();
    fillBg(this);
    for (let i = 0; i < 18; i += 1) {
      this.add.image(20 + (i * 53) % 640, 40 + (i * 37) % 280, "star").setAlpha(0.12).setScale(0.7);
    }

    this.add
      .rectangle(WIDTH / 2, HEIGHT / 2 + 8, 560, 332, 0x1a1420, 0.97)
      .setStrokeStyle(2, 0xffd24a, 0.8);

    addTitle(this, WIDTH / 2, 28, this.mode === "save" ? "저장 슬롯" : "불러오기", "24px").setOrigin(0.5);

    addText(
      this,
      WIDTH / 2,
      54,
      this.mode === "save"
        ? "슬롯 하나를 고르면 지금 보스룸·캐릭터·시간이 저장됩니다."
        : "슬롯을 고르면 저장된 보스룸부터 이어합니다.",
      { fontSize: "12px", color: "#8a8494" },
    ).setOrigin(0.5);

    const slots = listSaveSlots();
    slots.forEach((slot, i) => this.addSlotRow(i, slot));

    this.status = addText(this, WIDTH / 2, 318, "", { fontSize: "12px", color: "#5ee0a0" }).setOrigin(0.5);

    addButton(this, WIDTH / 2, 338, "[ 취소 ]", () => this.goBack(), {
      fontSize: "14px",
      color: "#c8c4d4",
    }).setOrigin(0.5);

    this.input.keyboard?.on("keydown-ESC", () => this.goBack());
    this.input.keyboard?.on("keydown-ONE", () => this.pickByNumber(1));
    this.input.keyboard?.on("keydown-TWO", () => this.pickByNumber(2));
    this.input.keyboard?.on("keydown-THREE", () => this.pickByNumber(3));
    this.input.keyboard?.on("keydown-FOUR", () => this.pickByNumber(4));
    this.input.keyboard?.on("keydown-FIVE", () => this.pickByNumber(5));
  }

  private addSlotRow(index: number, slot: SaveSlot | null): void {
    const y = 78 + index * 46;
    const hit = this.add.rectangle(WIDTH / 2, y + 16, 520, 42, 0x2a2434, slot ? 0.95 : 0.45).setStrokeStyle(
      1,
      slot ? 0xffd24a : 0x3d3548,
      slot ? 0.7 : 0.5,
    );
    hit.setInteractive({ useHandCursor: true });
    hit.on("pointerover", () => hit.setFillStyle(0x3a3248, 1));
    hit.on("pointerout", () => hit.setFillStyle(0x2a2434, slot ? 0.95 : 0.45));
    hit.on("pointerdown", () => this.pick(index));

    addText(this, 70, y + 8, `슬롯 ${index + 1}`, {
      fontSize: "12px",
      color: "#ffd24a",
    });

    if (!slot) {
      addText(this, 150, y + 8, "빈 슬롯", { fontSize: "13px", color: "#6a6474" });
      return;
    }

    const meta = slotMeta(slot);
    addText(this, 150, y + 2, meta.room, { fontSize: "13px", color: "#f4f0e6" });
    addText(this, 150, y + 18, `캐릭터  ${meta.chars}`, { fontSize: "12px", color: "#c8c4d4" });
    addText(this, 570, y + 8, meta.when, { fontSize: "12px", color: "#8a8494" }).setOrigin(1, 0);
  }

  private pickByNumber(n: number): void {
    if (n < 1 || n > SAVE_SLOT_COUNT) {
      return;
    }
    this.pick(n - 1);
  }

  private pick(index: number): void {
    if (this.mode === "save") {
      const ok = writeSaveSlot(index, getRun(), this.fight);
      if (!ok) {
        audio.deny();
        return;
      }
      audio.buy();
      this.status?.setText(`슬롯 ${index + 1}에 저장했습니다`);
      this.time.delayedCall(600, () => this.goBack());
      return;
    }

    const slot = readSaveSlot(index);
    if (!slot) {
      audio.deny();
      this.status?.setText("빈 슬롯입니다");
      return;
    }
    audio.buy();
    setRun(cloneRun(slot.run));
    if (this.overlay) {
      this.scene.stop(this.returnScene);
    }
    if (slot.fight) {
      setPendingFight(slot.fight);
      this.scene.start("BossFightScene");
      return;
    }
    this.scene.start("LobbyShopScene");
  }

  private goBack(): void {
    if (this.overlay) {
      this.scene.wake(this.returnScene);
      this.scene.stop();
      return;
    }
    this.scene.start(this.returnScene);
  }
}
