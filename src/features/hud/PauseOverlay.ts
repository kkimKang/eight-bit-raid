import Phaser from "phaser";
import { HEIGHT, WIDTH } from "../../config/constants";
import { addButton, addTitle } from "../../shared/ui";

const DEPTH = 50;

export class PauseOverlay {
  private readonly root: Phaser.GameObjects.Container;

  constructor(
    scene: Phaser.Scene,
    onResume: () => void,
    onSave: () => void,
    onLoad: () => void,
    onForfeit: () => void,
  ) {
    this.root = scene.add.container(0, 0).setDepth(DEPTH).setVisible(false);

    const blocker = scene.add
      .rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x000000, 0.65)
      .setInteractive();
    this.root.add(blocker);

    const panel = scene.add
      .rectangle(WIDTH / 2, HEIGHT / 2, 280, 260, 0x1a1420, 0.95)
      .setStrokeStyle(2, 0xffd24a, 0.8);
    this.root.add(panel);

    const title = addTitle(scene, WIDTH / 2, HEIGHT / 2 - 96, "일시정지", "24px");
    this.root.add(title);

    const resumeBtn = addButton(scene, WIDTH / 2, HEIGHT / 2 - 44, "[ 계속 ]", onResume, {
      fontSize: "18px",
      color: "#5ee0a0",
    }).setOrigin(0.5);
    this.root.add(resumeBtn);

    const saveBtn = addButton(scene, WIDTH / 2, HEIGHT / 2 - 8, "[ 저장하기 ]", onSave, {
      fontSize: "16px",
      color: "#ffd24a",
    }).setOrigin(0.5);
    this.root.add(saveBtn);

    const loadBtn = addButton(scene, WIDTH / 2, HEIGHT / 2 + 28, "[ 불러오기 ]", onLoad, {
      fontSize: "16px",
      color: "#7ec8ff",
    }).setOrigin(0.5);
    this.root.add(loadBtn);

    const forfeitBtn = addButton(scene, WIDTH / 2, HEIGHT / 2 + 64, "[ 포기 ]", onForfeit, {
      fontSize: "16px",
      color: "#e74c3c",
    }).setOrigin(0.5);
    this.root.add(forfeitBtn);

    const hint = scene.add
      .text(WIDTH / 2, HEIGHT / 2 + 106, "P / ESC", {
        fontFamily: '"Noto Sans KR", "Malgun Gothic", sans-serif',
        fontSize: "12px",
        color: "#8a8494",
      })
      .setOrigin(0.5);
    this.root.add(hint);
  }

  show(): void {
    this.root.setVisible(true);
    this.setInputEnabled(true);
  }

  hide(): void {
    this.setInputEnabled(false);
    this.root.setVisible(false);
  }

  setInputEnabled(enabled: boolean): void {
    this.root.iterate((obj: Phaser.GameObjects.GameObject) => {
      const input = (obj as Phaser.GameObjects.GameObject & { input?: { enabled: boolean } }).input;
      if (input) {
        input.enabled = enabled;
      }
      return true;
    });
  }

  isVisible(): boolean {
    return this.root.visible;
  }
}
