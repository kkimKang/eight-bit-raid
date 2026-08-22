import type { CharacterId, DamageType, RoleId } from "../../shared/types";

export interface KitDef {
  id: CharacterId;
  name: string;
  role: RoleId;
  roleLabel: string;
  damageType: DamageType;
  color: number;
  blurb: string;
  attackDesc: string;
  skillC: string;
  skillS: string;
  skillD: string;
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
    blurb: "근접 참격과 기동성으로 보스에게 붙어 싸우는 딜러.",
    attackDesc: "X: 참격 + 탄환 콤보. 관통 참격 뒤 보조 탄을 발사합니다.",
    skillC: "C: 그래플 훅 — 입력 방향으로 돌진하며 잠시 무적. 보스에게 빠르게 접근합니다.",
    skillS: "S: 폭탄 설치 — 잠시 후 폭발해 넓은 범위 물리 피해를 줍니다.",
    skillD: "D: 집중 — 2초간 무적. 위기 탈출·스톰프 대비용입니다.",
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
    blurb: "안정적인 원거리 화력. 초보자에게 추천하는 물리 딜러.",
    attackDesc: "X: 탄환 발사(최대 3발). 길게 누르면 차지 샷으로 강화됩니다. ↓+점프로 슬라이딩.",
    skillC: "C: 유도 미사일 — MP 20 소모. 보스를 추적하는 강력한 한 발.",
    skillS: "S: 마그넷 탄 — 8초간 탄환이 보스 쪽으로 휘어집니다.",
    skillD: "D: 섬광 이동 — 보스 근처로 순간이동 후 잠시 무적.",
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
    blurb: "단순하지만 안정적인 마법탄. 마법 딜 입문용 캐릭터.",
    attackDesc: "X: 마법 구체 — 직선으로 날아가는 기본 마법 피해.",
    skillC: "C: 삼연 사격 — 위·앞·아래 3방향으로 구체를 동시에 발사합니다.",
    skillS: "S: 추적 구체 — 크고 느리게 보스를 따라가는 마법탄.",
    skillD: "D: 그림자 가호 — 1초간 무적. 짧지만 재사용이 빠릅니다.",
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
    blurb: "돌진과 연쇄 마법으로 순간 화력을 뽑는 공격형 딜러.",
    attackDesc: "X: 조준 번개 — 8방향 입력에 맞춰 마법탄을 발사합니다.",
    skillC: "C: 번개 돌진 — 무적 상태로 돌진하며 경로에 마법 참격 피해.",
    skillS: "S: 체인 볼트 — 보스를 향해 강하게 유도되는 고화력 마법.",
    skillD: "D: 정전 보호 — 2초간 무적. 돌진 후 자리 잡을 때 유용합니다.",
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
    blurb: "탄막을 막아주고 아군을 지키는 방어형 탱커.",
    attackDesc: "X: 망치 강타 — 짧은 관통 근접 공격. 접촉한 적 탄막을 소거합니다.",
    skillC: "C: 방벽 — 주변 탄막을 지우고 전방에 잠시 막는 벽을 설치합니다.",
    skillS: "S: 방패 전달 — 가장 가까운 아군에게 1.8초 무적을 부여합니다.",
    skillD: "D: 철벽 — 2초 무적 + 넓은 범위 탄막 소거.",
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
    blurb: "커진 몸집으로 어그로를 끌고 탄막을 밟아 부수는 탱커.",
    attackDesc: "X: 망치 타격. 거대화 중에는 탄막 소거 범위가 넓어집니다.",
    skillC: "C: 거대화 — MP 25 소모. 8초간 몸이 커지고 잠시 무적. 보스가 우선 공격합니다.",
    skillS: "S: 지진 밟기 — 주변 적 탄막을 소거하고 화면을 흔듭니다.",
    skillD: "D: 버티기 — 2초간 무적. 거대화와 함께 쓰면 생존력이 높아집니다.",
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
    blurb: "힐·부활·파티 무적으로 팀을 살려내는 서포터.",
    attackDesc: "X: 별빛 탄 — 약한 마법 피해. 생존 보조가 주 역할입니다.",
    skillC: "C: 꽃잎 치유 — MP 15. 가까운 아군 전원 HP +1.",
    skillS: "S: 부활 — 가장 가까운 쓰러진 아군을 2하트로 되살립니다.",
    skillD: "D: 별의 가호 — 2초간 파티 전체 무적.",
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
    blurb: "공격력·쿨감 버프와 부활로 팀 딜을 끌어올리는 서포터.",
    attackDesc: "X: 음표 탄 — 물리 피해. 버프 중 팀 화력이 크게 오릅니다.",
    skillC: "C: 전율 — MP 20. 8초간 파티 공격력 +25%.",
    skillS: "S: 가속 화음 — 8초간 스킬 쿨타임이 빨라집니다.",
    skillD: "D: 재생의 찬 — 가장 가까운 아군 부활 + 자신 HP +1.",
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
