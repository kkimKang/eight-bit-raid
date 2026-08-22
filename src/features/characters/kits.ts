import type { CharacterId, DamageType, RoleId } from "../../shared/types";

export interface KitDef {
  id: CharacterId;
  name: string;
  role: RoleId;
  roleLabel: string;
  damageType: DamageType;
  color: number;
  blurb: string;
  hearts: number;
  speed: number;
  jump: number;
  cds: { c: number; s: number; d: number };
  xInterval: number;
}

export const KITS: KitDef[] = [
  {
    id: "blade",
    name: "BLADE",
    role: "phys_dps",
    roleLabel: "물리 딜러",
    damageType: "physical",
    color: 0xffd24a,
    blurb: "근접 참격과 후크. 적중 시 쿨이 줄어듭니다.",
    hearts: 4,
    speed: 155,
    jump: 585,
    cds: { c: 1500, s: 20000, d: 20000 },
    xInterval: 220,
  },
  {
    id: "buster",
    name: "BUSTER",
    role: "phys_dps",
    roleLabel: "물리 딜러",
    damageType: "physical",
    color: 0x4aa3ff,
    blurb: "탄환 3발 제한. 초보 추천 원거리.",
    hearts: 4,
    speed: 150,
    jump: 570,
    cds: { c: 0, s: 30000, d: 15000 },
    xInterval: 140,
  },
  {
    id: "shade",
    name: "SHADE",
    role: "magic_dps",
    roleLabel: "마법 딜러",
    damageType: "magic",
    color: 0xc084fc,
    blurb: "단순한 마법탄. 초보 추천.",
    hearts: 4,
    speed: 148,
    jump: 570,
    cds: { c: 5000, s: 12000, d: 12000 },
    xInterval: 180,
  },
  {
    id: "bolt",
    name: "BOLT",
    role: "magic_dps",
    roleLabel: "마법 딜러",
    damageType: "magic",
    color: 0xf1c40f,
    blurb: "돌진 무적과 연쇄 마법.",
    hearts: 4,
    speed: 165,
    jump: 600,
    cds: { c: 2500, s: 8000, d: 16000 },
    xInterval: 200,
  },
  {
    id: "brick",
    name: "BRICK",
    role: "tank",
    roleLabel: "탱커",
    damageType: "physical",
    color: 0xe74c3c,
    blurb: "아군 보호와 탄막 소거.",
    hearts: 5,
    speed: 135,
    jump: 540,
    cds: { c: 8000, s: 14000, d: 18000 },
    xInterval: 260,
  },
  {
    id: "taunt",
    name: "TAUNT",
    role: "tank",
    roleLabel: "탱커",
    damageType: "physical",
    color: 0xe67e22,
    blurb: "커져서 어그로를 고정합니다.",
    hearts: 6,
    speed: 125,
    jump: 510,
    cds: { c: 16000, s: 10000, d: 18000 },
    xInterval: 280,
  },
  {
    id: "bloom",
    name: "BLOOM",
    role: "support",
    roleLabel: "서포터",
    damageType: "magic",
    color: 0xff8fab,
    blurb: "힐, 파티 무적, 부활.",
    hearts: 4,
    speed: 145,
    jump: 570,
    cds: { c: 6000, s: 24000, d: 22000 },
    xInterval: 240,
  },
  {
    id: "hymn",
    name: "HYMN",
    role: "support",
    roleLabel: "서포터",
    damageType: "physical",
    color: 0x2ecc71,
    blurb: "공격/쿨감 버프와 부활.",
    hearts: 4,
    speed: 145,
    jump: 570,
    cds: { c: 10000, s: 14000, d: 24000 },
    xInterval: 240,
  },
];

export function kitById(id: CharacterId): KitDef {
  return KITS.find((k) => k.id === id) ?? KITS[1];
}
