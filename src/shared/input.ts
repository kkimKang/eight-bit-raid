import Phaser from "phaser";
import { KEY_BINDS } from "../config/keys";

export interface PlayerInput {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  jumpPressed: boolean;
  attack: boolean;
  attackPressed: boolean;
  attackReleased: boolean;
  skillC: boolean;
  skillCPressed: boolean;
  skillS: boolean;
  skillSPressed: boolean;
  skillD: boolean;
  skillDPressed: boolean;
}

type KeyMap = {
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  jump: Phaser.Input.Keyboard.Key;
  attack: Phaser.Input.Keyboard.Key;
  skillC: Phaser.Input.Keyboard.Key;
  skillS: Phaser.Input.Keyboard.Key;
  skillD: Phaser.Input.Keyboard.Key;
};

export class InputHub {
  private maps: KeyMap[] = [];
  private prev: Array<[boolean, boolean, boolean, boolean, boolean]> = [];

  constructor(private scene: Phaser.Scene) {
    const kb = scene.input.keyboard;
    if (!kb) {
      return;
    }
    for (const bind of KEY_BINDS) {
      this.maps.push(kb.addKeys(bind) as KeyMap);
    }
  }

  sample(slot: number): PlayerInput {
    const kb = this.maps[slot];
    const padIndex = slot === 0 ? -1 : slot - 1;
    const pad = padIndex >= 0 ? this.scene.input.gamepad?.getPad(padIndex) : undefined;
    const stickX = pad?.leftStick?.x ?? 0;
    const stickY = pad?.leftStick?.y ?? 0;

    const left = Boolean(kb?.left.isDown || pad?.left || stickX < -0.35);
    const right = Boolean(kb?.right.isDown || pad?.right || stickX > 0.35);
    const up = Boolean(kb?.up.isDown || pad?.up || stickY < -0.35);
    const down = Boolean(kb?.down.isDown || pad?.down || stickY > 0.35);
    const jump = Boolean(kb?.jump.isDown || pad?.A);
    const attack = Boolean(kb?.attack.isDown || pad?.X);
    const skillC = Boolean(kb?.skillC.isDown || pad?.Y);
    const skillS = Boolean(kb?.skillS.isDown || pad?.B);
    const skillD = Boolean(kb?.skillD.isDown || (pad && pad.R1 > 0.4));

    const prev = this.prev[slot] ?? [false, false, false, false, false];
    this.prev[slot] = [jump, attack, skillC, skillS, skillD];

    return {
      left,
      right,
      up,
      down,
      jump,
      jumpPressed: jump && !prev[0],
      attack,
      attackPressed: attack && !prev[1],
      attackReleased: !attack && prev[1],
      skillC,
      skillCPressed: skillC && !prev[2],
      skillS,
      skillSPressed: skillS && !prev[3],
      skillD,
      skillDPressed: skillD && !prev[4],
    };
  }
}

export function aimDir(input: PlayerInput, facing: number): { x: number; y: number } {
  let x = input.left ? -1 : input.right ? 1 : 0;
  let y = input.up ? -1 : input.down ? 1 : 0;
  if (x === 0 && y === 0) {
    x = facing;
  }
  const len = Math.hypot(x, y) || 1;
  return { x: x / len, y: y / len };
}
