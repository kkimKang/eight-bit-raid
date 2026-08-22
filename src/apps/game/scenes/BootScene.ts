import Phaser from "phaser";
import { generateTextures } from "../../../shared/pixelArt";
import { setupWorldCamera } from "../../../shared/ui";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create(): void {
    setupWorldCamera(this);
    generateTextures(this);
    void this.ready();
  }

  private async ready(): Promise<void> {
    try {
      if (document.fonts) {
        await Promise.race([
          Promise.all([
            document.fonts.load('400 16px "Noto Sans KR"'),
            document.fonts.load('700 28px "Noto Sans KR"'),
            document.fonts.load('400 16px "Malgun Gothic"'),
          ]),
          new Promise((resolve) => window.setTimeout(resolve, 1500)),
        ]);
      }
    } catch {
      /* system gothic fallback */
    }
    this.scene.start("TitleScene");
  }
}
