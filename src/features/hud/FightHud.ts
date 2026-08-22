import Phaser from "phaser";
import { WIDTH } from "../../config/constants";
import { addText } from "../../shared/ui";
import type { RaidWorld } from "../combat/RaidWorld";

export class FightHud {
  private bossHp: Phaser.GameObjects.Rectangle;
  private bossMana: Phaser.GameObjects.Rectangle;
  private bossHpBack: Phaser.GameObjects.Rectangle;
  private name: Phaser.GameObjects.Text;
  private hearts: Phaser.GameObjects.Image[][] = [];
  private cds: Phaser.GameObjects.Text[] = [];
  private timer?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, world: RaidWorld) {
    this.bossHpBack = scene.add.rectangle(320, 18, 420, 10, 0x2a2030).setDepth(15);
    this.bossHp = scene.add.rectangle(320, 18, 420, 10, 0xe74c3c).setDepth(16);
    this.bossMana = scene.add.rectangle(320, 28, 420, 5, 0x4aa3ff).setDepth(16);
    this.name = addText(scene, 320, 6, `${world.boss.def.name}  ${world.boss.def.title}`, {
      fontSize: "13px",
      color: "#ffd24a",
    })
      .setOrigin(0.5, 0)
      .setDepth(16);

    world.players.forEach((p, i) => {
      const baseY = 310 - (world.players.length - 1 - i) * 24;
      addText(scene, 8, baseY - 10, `P${i + 1} ${p.kit.name}`, { fontSize: "12px", color: "#c8c4d4" }).setDepth(16);
      const row: Phaser.GameObjects.Image[] = [];
      for (let h = 0; h < p.maxHearts; h += 1) {
        row.push(scene.add.image(12 + h * 10, baseY + 4, "heart").setDepth(16).setScale(1));
      }
      this.hearts.push(row);
      this.cds.push(
        addText(scene, WIDTH - 8, baseY - 4, "", { fontSize: "12px", color: "#d8d4e0" }).setOrigin(1, 0).setDepth(16),
      );
    });
    this.timer = addText(scene, 320, 38, "", { fontSize: "14px", color: "#ffd24a" }).setOrigin(0.5).setDepth(16);
  }

  update(world: RaidWorld): void {
    const hpW = 420 * Phaser.Math.Clamp(world.boss.maxHp > 0 ? world.boss.hp / world.boss.maxHp : 0, 0, 1);
    this.bossHp.width = Math.max(0, hpW);
    this.bossHp.x = 320 - (420 - this.bossHp.width) / 2;
    const manaW = 420 * Phaser.Math.Clamp(world.boss.maxMana > 0 ? world.boss.mana / world.boss.maxMana : 0, 0, 1);
    this.bossMana.width = Math.max(0, manaW);
    this.bossMana.x = 320 - (420 - this.bossMana.width) / 2;
    void this.bossHpBack;
    void this.name;
    world.players.forEach((p, i) => {
      this.hearts[i].forEach((img, h) => {
        img.setTexture(h < Math.ceil(p.hearts - 0.01) ? "heart" : "heart-empty");
        img.setAlpha(h < p.hearts ? 1 : 0.35);
      });
      const fmt = (ms: number) => (ms <= 0 ? "OK" : (ms / 1000).toFixed(1));
      this.cds[i].setText(`C ${fmt(p.cdC)}  S ${fmt(p.cdS)}  D ${fmt(p.cdD)}  MP ${p.mana | 0}`);
    });
    if (world.timerLeft >= 0) {
      this.timer?.setText(`TIME ${Math.ceil(world.timerLeft / 1000)}`);
    } else {
      this.timer?.setText(world.boss.inUltimate ? "ULTIMATE" : "");
    }
  }
}
