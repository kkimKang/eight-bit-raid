import Phaser from "phaser";
import { HEIGHT, RENDER_SCALE, WIDTH } from "../../config/constants";
import { AllClearScene } from "./scenes/AllClearScene";
import { BootScene } from "./scenes/BootScene";
import { BossFightScene } from "./scenes/BossFightScene";
import { CharacterSelectScene } from "./scenes/CharacterSelectScene";
import { DifficultyScene } from "./scenes/DifficultyScene";
import { LobbyShopScene } from "./scenes/LobbyShopScene";
import { ResultScene } from "./scenes/ResultScene";
import { SaveSlotScene } from "./scenes/SaveSlotScene";
import { TitleScene } from "./scenes/TitleScene";

export function createGame(parent: string | HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: WIDTH * RENDER_SCALE,
    height: HEIGHT * RENDER_SCALE,
    backgroundColor: "#12121c",
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 1100 },
        debug: false,
        fps: 60,
        fixedStep: true,
      },
    },
    fps: {
      target: 60,
      min: 30,
      smoothStep: true,
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      autoRound: true,
    },
    input: {
      gamepad: true,
      activePointers: 5,
    },
    scene: [
      BootScene,
      TitleScene,
      SaveSlotScene,
      DifficultyScene,
      CharacterSelectScene,
      LobbyShopScene,
      BossFightScene,
      ResultScene,
      AllClearScene,
    ],
  });
}
