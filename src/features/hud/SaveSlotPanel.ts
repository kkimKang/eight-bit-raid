import Phaser from "phaser";
import { HEIGHT, WIDTH } from "../../config/constants";
import { bossById, bossesForDifficulty } from "../bosses/roster";
import { audio } from "../../shared/audio";
import {
  listSaveSlots,
  readSaveSlot,
  SAVE_SLOT_COUNT,
  writeSaveSlot,
  type FightSnapshot,
  type SaveSlot,
} from "../../shared/saveSlots";
import { cloneRun, getRun, setRun } from "../../shared/session";
import { addButton, addText, addTitle } from "../../shared/ui";

const DEPTH = 60;

export type SaveSlotMode = "save" | "load";

function slotLabel(index: number, slot: SaveSlot | null): string {
  const n = index + 1;
  if (!slot) {
    return `[${n}]  빈 슬롯`;
  }
  const names = slot.run.players.map((p) => p.characterId.toUpperCase()).join("/");
  const list = bossesForDifficulty(slot.run.difficulty);
  const bossId = list[Math.min(slot.run.bossIndex, list.length - 1)];
  const boss = bossById(bossId).name;
  const gold = slot.run.players.reduce((sum, p) => sum + p.gold, 0);
  if (slot.fight) {
    const hp = slot.fight.players.map((p) => `${Math.ceil(p.hearts)}`).join("/");
    return `[${n}]  ${slot.run.difficulty.toUpperCase()}  ${boss}  ${names}  HP ${hp}`;
  }
  return `[${n}]  ${slot.run.difficulty.toUpperCase()}  ${boss}  ${names}  ${gold}G`;
}

function slotTime(slot: SaveSlot | null): string {
  if (!slot) {
    return "";
  }
  const d = new Date(slot.savedAt);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export class SaveSlotPanel {
  private readonly root: Phaser.GameObjects.Container;
  private mode: SaveSlotMode = "load";
  private status?: Phaser.GameObjects.Text;
  private onSaved?: () => void;
  private onLoaded?: (slot: SaveSlot) => void;
  private captureFight?: () => FightSnapshot | null;

  constructor(scene: Phaser.Scene) {
    this.root = scene.add.container(0, 0).setDepth(DEPTH).setVisible(false).setScrollFactor(0);
    this.rebuild(scene);
  }

  open(mode: SaveSlotMode, opts?: {
    onSaved?: () => void;
    onLoaded?: (slot: SaveSlot) => void;
    captureFight?: () => FightSnapshot | null;
  }): void {
    this.mode = mode;
    this.onSaved = opts?.onSaved;
    this.onLoaded = opts?.onLoaded;
    this.captureFight = opts?.captureFight;
    this.rebuild(this.root.scene);
    this.root.setVisible(true);
  }

  hide(): void {
    this.root.setVisible(false);
  }

  isVisible(): boolean {
    return this.root.visible;
  }

  pickByNumber(n: number): void {
    if (!this.isVisible() || n < 1 || n > SAVE_SLOT_COUNT) {
      return;
    }
    this.pick(n - 1);
  }

  private rebuild(scene: Phaser.Scene): void {
    this.root.removeAll(true);
    const blocker = scene.add
      .rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x000000, 0.72)
      .setInteractive();
    this.root.add(blocker);

    const panel = scene.add
      .rectangle(WIDTH / 2, HEIGHT / 2, 520, 300, 0x1a1420, 0.97)
      .setStrokeStyle(2, 0xffd24a, 0.8);
    this.root.add(panel);

    const title = addTitle(
      scene,
      WIDTH / 2,
      54,
      this.mode === "save" ? "저장 슬롯" : "불러오기",
      "22px",
    );
    this.root.add(title);

    const hint = addText(
      scene,
      WIDTH / 2,
      78,
      this.mode === "save" ? "슬롯을 고르면 저장합니다. 데이터가 있으면 덮어씁니다." : "전투 저장이면 그 자리에서, 아니면 대기실부터 이어합니다.",
      { fontSize: "12px", color: "#8a8494" },
    ).setOrigin(0.5);
    this.root.add(hint);

    const slots = listSaveSlots();
    slots.forEach((slot, i) => {
      const y = 108 + i * 32;
      const empty = !slot;
      const color = empty ? "#6a6474" : "#f4f0e6";
      const btn = addButton(scene, 80, y, slotLabel(i, slot), () => this.pick(i), {
        fontSize: "13px",
        color,
      });
      this.root.add(btn);
      const time = addText(scene, 560, y, slotTime(slot), { fontSize: "11px", color: "#8a8494" }).setOrigin(1, 0);
      this.root.add(time);
    });

    this.status = addText(scene, WIDTH / 2, 276, "", { fontSize: "13px", color: "#5ee0a0" }).setOrigin(0.5);
    this.root.add(this.status);

    const cancel = addButton(scene, WIDTH / 2, 304, "[ 취소 ]", () => this.hide(), {
      fontSize: "14px",
      color: "#c8c4d4",
    }).setOrigin(0.5);
    this.root.add(cancel);
  }

  private pick(index: number): void {
    if (this.mode === "save") {
      const fight = this.captureFight?.() ?? null;
      const ok = writeSaveSlot(index, getRun(), fight);
      if (!ok) {
        audio.deny();
        return;
      }
      audio.buy();
      this.rebuild(this.root.scene);
      this.status?.setText(`슬롯 ${index + 1}에 저장했습니다`);
      this.onSaved?.();
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
    this.hide();
    this.onLoaded?.(slot);
  }
}
