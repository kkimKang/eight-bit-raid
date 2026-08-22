export interface KeyBind {
  left: string;
  right: string;
  up: string;
  down: string;
  jump: string;
  attack: string;
  skillC: string;
  skillS: string;
  skillD: string;
}

export const KEY_BINDS: KeyBind[] = [
  {
    left: "LEFT",
    right: "RIGHT",
    up: "UP",
    down: "DOWN",
    jump: "Z",
    attack: "X",
    skillC: "C",
    skillS: "S",
    skillD: "D",
  },
  {
    left: "J",
    right: "L",
    up: "I",
    down: "K",
    jump: "F",
    attack: "G",
    skillC: "H",
    skillS: "U",
    skillD: "O",
  },
];
