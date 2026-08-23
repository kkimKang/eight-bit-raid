import Phaser from "phaser";
import { HEIGHT, WIDTH } from "../../../config/constants";
import { makePlayer } from "../../../features/combat/PlayerActor";
import { RaidWorld } from "../../../features/combat/RaidWorld";
import { FightHud } from "../../../features/hud/FightHud";
import { PauseOverlay } from "../../../features/hud/PauseOverlay";
import { TouchControls } from "../../../features/hud/TouchControls";
import { audio } from "../../../shared/audio";
import { isHandheld } from "../../../shared/device";
import { InputHub } from "../../../shared/input";
import { currentBossId, getRun } from "../../../shared/session";
import { addButton, addText, fillBg } from "../../../shared/ui";
import { rankForDeaths } from "../../../config/upgrades";

export class BossFightScene extends Phaser.Scene {
  private world!: RaidWorld;
  private inputHub!: InputHub;
  private hud!: FightHud;
  private pauseOverlay!: PauseOverlay;
  private closing = false;
  private paused = false;

  constructor() {
    super("BossFightScene");
  }

  create(): void {
    this.input.keyboard?.removeAllListeners();
    fillBg(this, 0x161422);
    this.add.rectangle(320, 344, 640, 32, 0x0c0c14, 0.5);
    const run = getRun();
    run.roundDeaths = 0;
    run.fightStartedAt = this.time.now;
    this.physics.world.setBounds(0, -24, WIDTH, HEIGHT + 96);
    this.world = new RaidWorld(this, run.difficulty, run.players.length, currentBossId());
    const players = run.players.map((p, i) =>
      makePlayer(this, 120 + i * 40, 300, i, p.characterId, p.upgrades),
    );
    this.world.attachPlayers(players);
    const touch = isHandheld() ? new TouchControls(this) : undefined;
    this.inputHub = new InputHub(this, touch);
    this.hud = new FightHud(this, this.world);
    this.pauseOverlay = new PauseOverlay(
      this,
      () => this.setPaused(false),
      () => this.finish("lose"),
    );
    this.closing = false;
    this.paused = false;

    if (isHandheld()) {
      addButton(this, WIDTH - 8, 44, "일시정지", () => this.togglePause(), {
        fontSize: "12px",
        color: "#8a8494",
      })
        .setOrigin(1, 0)
        .setDepth(16);
    } else {
      addText(this, 8, 44, "P / ESC 일시정지", { fontSize: "12px", color: "#5a5464" }).setDepth(16);
    }

    this.input.keyboard?.on("keydown-M", () => {
      const muted = audio.toggleMute();
      this.world.banner(muted ? "MUTE" : "BGM/SFX ON");
    });
    this.input.keyboard?.on("keydown-ESC", () => {
      this.togglePause();
    });
    this.input.keyboard?.on("keydown-P", () => {
      this.togglePause();
    });
    if (import.meta.env.DEV) {
      this.input.keyboard?.on("keydown-F10", () => {
        if (this.paused) {
          return;
        }
        this.world.boss.hp = 0;
        this.world.boss.dead = true;
        this.world.ended = "win";
      });
    }
  }

  update(_time: number, delta: number): void {
    if (!this.world || this.closing || this.paused) {
      return;
    }
    const dt = Math.min(delta, 34);
    for (const p of this.world.players) {
      p.update(this.world, this.inputHub.sample(p.slot), dt);
    }
    this.world.update(dt);
    this.hud.update(this.world);
    if (this.world.ended) {
      this.finish(this.world.ended);
    }
  }

  private togglePause(): void {
    if (this.closing) {
      return;
    }
    this.setPaused(!this.paused);
  }

  private setPaused(value: boolean): void {
    if (this.closing || this.paused === value) {
      return;
    }
    this.paused = value;
    if (this.paused) {
      this.physics.pause();
      this.time.timeScale = 0;
      this.pauseOverlay.show();
    } else {
      this.physics.resume();
      this.time.timeScale = 1;
      this.pauseOverlay.hide();
    }
  }

  private finish(kind: "win" | "lose"): void {
    if (this.closing) {
      return;
    }
    if (this.paused) {
      this.setPaused(false);
    }
    this.closing = true;
    const run = getRun();
    const deaths = this.world.roundDeaths;
    const { rank, gold } = rankForDeaths(deaths);
    const wiped = kind === "lose";
    if (wiped) {
      audio.lose();
    }
    run.lastResult = {
      bossId: this.world.boss.def.id,
      bossName: this.world.boss.def.name,
      deaths,
      rank: wiped ? "F" : rank,
      gold: wiped ? 0 : gold,
      wiped,
      timeMs: this.world.elapsed,
    };
    if (!wiped) {
      for (const p of run.players) {
        p.gold += gold;
      }
    }
    this.time.delayedCall(1200, () => this.scene.start("ResultScene"));
  }
}
