import Phaser from "phaser";

function paint(
  g: Phaser.GameObjects.Graphics,
  rows: string[],
  palette: Record<string, number>,
  scale = 1,
): void {
  for (let y = 0; y < rows.length; y += 1) {
    const row = rows[y];
    for (let x = 0; x < row.length; x += 1) {
      const color = palette[row[x]];
      if (!color) {
        continue;
      }
      g.fillStyle(color, 1);
      g.fillRect(x * scale, y * scale, scale, scale);
    }
  }
}

function bake(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  draw: (g: Phaser.GameObjects.Graphics) => void,
): void {
  if (scene.textures.exists(key)) {
    return;
  }
  const g = scene.make.graphics({ x: 0, y: 0 });
  draw(g);
  g.generateTexture(key, w, h);
  g.destroy();
}

const P: Record<string, number> = {
  w: 0xf4f0e6,
  k: 0x1a1420,
  r: 0xe74c3c,
  o: 0xe67e22,
  y: 0xffd24a,
  g: 0x5ee0a0,
  b: 0x4aa3ff,
  p: 0xc084fc,
  n: 0xf5c6a0,
  d: 0x5a4638,
  s: 0x8a8494,
  m: 0x3d4d5e,
  t: 0x6d7d8e,
  c: 0x2ecc71,
  h: 0xff8fab,
};

export function generateTextures(scene: Phaser.Scene): void {
  bake(scene, "px", 2, 2, (g) => {
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 2, 2);
  });

  bake(scene, "tile", 16, 16, (g) => {
    g.fillStyle(0x3d4a5c, 1);
    g.fillRect(0, 0, 16, 16);
    g.fillStyle(0x55657a, 1);
    g.fillRect(1, 1, 14, 6);
    g.fillStyle(0x2a3342, 1);
    g.fillRect(0, 14, 16, 2);
    g.fillRect(14, 0, 2, 16);
  });

  bake(scene, "tile-lava", 16, 16, (g) => {
    g.fillStyle(0x7a1f12, 1);
    g.fillRect(0, 0, 16, 16);
    g.fillStyle(0xe67e22, 1);
    g.fillRect(0, 2, 16, 4);
    g.fillStyle(0xffd24a, 1);
    g.fillRect(3, 3, 4, 2);
  });

  bake(scene, "tile-water", 16, 16, (g) => {
    g.fillStyle(0x163a6b, 1);
    g.fillRect(0, 0, 16, 16);
    g.fillStyle(0x2e6bb0, 1);
    g.fillRect(0, 4, 16, 3);
    g.fillStyle(0x7ec8ff, 0.7);
    g.fillRect(2, 5, 5, 1);
  });

  bake(scene, "tile-spike", 16, 16, (g) => {
    paint(g, ["................", "................", ".......w........", "......www.......", ".....wwwww......", "....wwwwwww.....", "...wwwwwwwww....", "..wwkwwkwwwww...", ".wwwwwwwwwwwww..", "wwwwwwwwwwwwwww.", "kkkkkkkkkkkkkkkk", "mmmmmmmmmmmmmmmm", "mmmmmmmmmmmmmmmm", "mmmmmmmmmmmmmmmm", "kkkkkkkkkkkkkkkk", "kkkkkkkkkkkkkkkk"], { w: 0xcfd6de, k: 0x1a1420, m: 0x3d4a5c });
  });

  bake(scene, "heart", 9, 8, (g) => {
    paint(g, [".rr.rr...", "rrrrrrr..", "rrrrrrr..", "rrrrrrr..", ".rrrrr...", "..rrr....", "...r.....", "........."], P);
  });

  bake(scene, "heart-empty", 9, 8, (g) => {
    paint(g, [".ss.ss...", "sssssss..", "sssssss..", "sssssss..", ".sssss...", "..sss....", "...s.....", "........."], P);
  });

  bake(scene, "bang", 10, 14, (g) => {
    paint(g, ["...rr.....", "..rrrr....", "..rrrr....", "..rrrr....", "...rr.....", "...rr.....", "...rr.....", "...rr.....", "..........", "...rr.....", "..rrrr....", "...rr.....", "..........", ".........."], P);
  });

  bake(scene, "player", 16, 20, (g) => {
    paint(
      g,
      [
        "................",
        ".....wwww.......",
        "....wnnnnw......",
        "....wnkknw......",
        "....wnnnnw......",
        ".....wwww.......",
        "....bbbbbb......",
        "...bbbwbbb......",
        "...b.bbbb.b.....",
        "...b.bbbb.b.....",
        "....bbbbbb......",
        "....bb..bb......",
        "....b....b......",
        "....b....b......",
        "...ww....ww.....",
        "...ww....ww.....",
        "................",
        "................",
        "................",
        "................",
      ],
      P,
    );
  });

  bake(scene, "pellet", 6, 6, (g) => {
    g.fillStyle(0xfff4a3, 1);
    g.fillRect(1, 1, 4, 4);
    g.fillStyle(0xffffff, 1);
    g.fillRect(2, 2, 2, 2);
  });

  bake(scene, "bolt", 8, 8, (g) => {
    paint(g, ["...y....", "..yyy...", ".yyyyy..", "yyyyyyy.", ".yyyyy..", "..yyy...", "...y....", "........"], P);
  });

  bake(scene, "orb", 8, 8, (g) => {
    g.fillStyle(0xc084fc, 1);
    g.fillCircle(4, 4, 4);
    g.fillStyle(0xf4e4ff, 1);
    g.fillCircle(3, 3, 2);
  });

  bake(scene, "missile", 10, 6, (g) => {
    paint(g, ["..........", ".wwbbbbw..", "wwbbbbbbw.", ".wwbbbbw..", "..........", ".........."], P);
  });

  bake(scene, "slash", 18, 10, (g) => {
    g.fillStyle(0xfff4a3, 0.9);
    g.fillTriangle(0, 5, 18, 1, 18, 9);
  });

  bake(scene, "bomb", 10, 12, (g) => {
    paint(g, ["....y.....", "...yy.....", "...k......", "..kkkk....", ".kkwwkk...", ".kwwwwk...", ".kkwwkk...", "..kkkk....", "...kk.....", "..........", "..........", ".........."], P);
  });

  bake(scene, "ghost", 14, 16, (g) => {
    paint(g, ["..............", "....wwwww.....", "...wwwwwww....", "..wwkwwkwww...", "..wwwwwwwww...", "..wwwwwwwww...", "..wwwwwwwww...", "..w.www.www...", "..w.www.www...", "..wwwwwwwww...", "..w.w.w.w.w...", "..w.w.w.w.w...", "..............", "..............", "..............", ".............."], P);
  });

  bake(scene, "bubble", 12, 12, (g) => {
    g.lineStyle(1, 0x7ec8ff, 1);
    g.strokeCircle(6, 6, 5);
    g.fillStyle(0x7ec8ff, 0.25);
    g.fillCircle(6, 6, 5);
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(4, 4, 1);
  });

  bake(scene, "fireball", 10, 10, (g) => {
    paint(g, ["..........", "...oo.....", "..ooyo....", ".oyyyyo...", ".oywwyo...", "..oyyyo...", "...ooo....", "....o.....", "..........", ".........."], P);
  });

  bake(scene, "hammer", 12, 12, (g) => {
    paint(g, ["............", ".ssssss.....", ".syyyy s....".replace(" ", "s"), ".ssssss.....", "....dd......", "....dd......", "....dd......", "....dd......", "............", "............", "............", "............"], { ...P, s: 0x8a8494 });
  });

  bake(scene, "star", 10, 10, (g) => {
    paint(g, ["....y.....", "...yyy....", "yyyyyyyyy.", ".yyyyyyy..", "..yyyyy...", ".yyyyyyy..", "y..yyy..y.", "....y.....", "..........", ".........."], P);
  });

  bake(scene, "heart-shot", 8, 8, (g) => {
    paint(g, [".rr.rr..", "rrrrrrr.", "rrrrrrr.", ".rrrrr..", "..rrr...", "...r....", "........", "........"], P);
  });

  bake(scene, "bell", 10, 12, (g) => {
    paint(g, ["....y.....", "...yyy....", "..yyyyy...", ".yyyyyyy..", ".yyyyyyy..", ".yyyyyyy..", "..yyyyy...", "...kkk....", "....k.....", "..........", "..........", ".........."], P);
  });

  bake(scene, "door", 14, 22, (g) => {
    g.fillStyle(0x6d4c2b, 1);
    g.fillRect(0, 0, 14, 22);
    g.fillStyle(0x3d2a16, 1);
    g.fillRect(2, 2, 10, 18);
    g.fillStyle(0xffd24a, 1);
    g.fillRect(9, 11, 2, 2);
  });

  bake(scene, "ball", 14, 14, (g) => {
    g.fillStyle(0xe74c3c, 1);
    g.fillCircle(7, 7, 7);
    g.fillStyle(0xf4f0e6, 1);
    g.fillRect(0, 6, 14, 2);
    g.fillRect(6, 0, 2, 14);
  });

  bake(scene, "penguin", 10, 12, (g) => {
    paint(g, ["...www....", "..wwwww...", ".wwkwwkw..", ".wwwwwww..", ".www.www..", ".wwwwwww..", "..w.w.w...", "..wwwww...", "...y.y....", "..........", "..........", ".........."], P);
  });

  bake(scene, "icicle", 8, 14, (g) => {
    paint(g, ["..bbbb..", "..bbbb..", ".bbbbbb.", ".bbwwbb.", ".bbbbbb.", "..bbbb..", "..bbbb..", "...bb...", "...bb...", "....b...", "........", "........", "........", "........"], P);
  });

  bake(scene, "laser", 8, 8, (g) => {
    g.fillStyle(0xff3b4e, 1);
    g.fillRect(0, 3, 8, 2);
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 4, 8, 1);
  });

  bake(scene, "fish", 14, 8, (g) => {
    paint(g, ["..............", "...ggggg.g....", "..ggwkggggg...", ".ggggggggg.g..", "..ggggggggg...", "...ggggg.g....", "..............", ".............."], P);
  });

  bake(scene, "tomb", 12, 14, (g) => {
    paint(g, ["....ss......", "...ssss.....", "...ssss.....", "..ssssss....", "..sswsss....", "..ssssss....", "..ssssss....", "..ssssss....", "..ssssss....", "...ssss.....", "............", "............", "............", "............"], P);
  });

  const bosses: [string, number, (g: Phaser.GameObjects.Graphics) => void][] = [
    ["boss-chomper", 40, (g) => {
      g.fillStyle(0xffd24a, 1);
      g.fillCircle(20, 20, 18);
      g.fillStyle(0x1a1420, 1);
      g.fillTriangle(20, 20, 38, 10, 38, 30);
      g.fillCircle(12, 14, 3);
    }],
    ["boss-bubblor", 44, (g) => {
      g.fillStyle(0x5ee0a0, 1);
      g.fillCircle(22, 24, 16);
      g.fillCircle(22, 12, 10);
      g.fillStyle(0x1a1420, 1);
      g.fillCircle(18, 10, 2);
      g.fillCircle(26, 10, 2);
      g.fillStyle(0xff8fab, 1);
      g.fillTriangle(22, 12, 18, 18, 26, 18);
    }],
    ["boss-bombit", 36, (g) => {
      g.fillStyle(0xf4f0e6, 1);
      g.fillRect(6, 10, 24, 22);
      g.fillStyle(0x4aa3ff, 1);
      g.fillCircle(14, 18, 3);
      g.fillCircle(22, 18, 3);
      g.fillStyle(0xe74c3c, 1);
      g.fillRect(16, 4, 4, 8);
    }],
    ["boss-tyrant", 48, (g) => {
      g.fillStyle(0xe67e22, 1);
      g.fillCircle(24, 28, 18);
      g.fillStyle(0x2ecc71, 1);
      g.fillCircle(24, 16, 12);
      g.fillStyle(0x1a1420, 1);
      g.fillCircle(20, 14, 2);
      g.fillCircle(28, 14, 2);
      g.fillStyle(0xe74c3c, 1);
      g.fillTriangle(24, 18, 20, 24, 28, 24);
    }],
    ["boss-ringo", 36, (g) => {
      g.fillStyle(0xe74c3c, 1);
      g.fillRect(8, 8, 20, 24);
      g.fillStyle(0xf5c6a0, 1);
      g.fillCircle(18, 12, 8);
      g.fillStyle(0x1a1420, 1);
      g.fillCircle(15, 11, 2);
      g.fillCircle(21, 11, 2);
      g.fillStyle(0xffd24a, 1);
      g.fillRect(10, 2, 16, 6);
    }],
    ["boss-icicle", 36, (g) => {
      g.fillStyle(0x4aa3ff, 1);
      g.fillRect(10, 8, 16, 22);
      g.fillStyle(0xf4f0e6, 1);
      g.fillCircle(18, 10, 7);
      g.fillStyle(0x8a8494, 1);
      g.fillRect(4, 20, 28, 6);
    }],
    ["boss-ironclad", 48, (g) => {
      g.fillStyle(0x6d7d8e, 1);
      g.fillRect(4, 16, 40, 20);
      g.fillStyle(0x3d4a5c, 1);
      g.fillCircle(16, 36, 8);
      g.fillCircle(36, 36, 8);
      g.fillStyle(0xe74c3c, 1);
      g.fillRect(28, 8, 14, 10);
    }],
    ["boss-masked", 40, (g) => {
      g.fillStyle(0x3d2a6b, 1);
      g.fillCircle(20, 22, 16);
      g.fillStyle(0xf4f0e6, 1);
      g.fillCircle(20, 16, 10);
      g.fillStyle(0x1a1420, 1);
      g.fillRect(12, 14, 16, 4);
      g.fillStyle(0xc084fc, 1);
      g.fillTriangle(20, 4, 16, 12, 24, 12);
    }],
    ["boss-gondola", 40, (g) => {
      g.fillStyle(0xe74c3c, 1);
      g.fillCircle(12, 10, 8);
      g.fillCircle(28, 10, 8);
      g.fillStyle(0xf5c6a0, 1);
      g.fillRect(14, 18, 12, 16);
      g.fillStyle(0x1a1420, 1);
      g.fillCircle(17, 24, 2);
      g.fillCircle(23, 24, 2);
    }],
    ["boss-postcat", 40, (g) => {
      g.fillStyle(0xf4f0e6, 1);
      g.fillCircle(20, 22, 14);
      g.fillTriangle(8, 8, 12, 18, 16, 12);
      g.fillTriangle(32, 8, 28, 18, 24, 12);
      g.fillStyle(0x1a1420, 1);
      g.fillCircle(16, 20, 2);
      g.fillCircle(24, 20, 2);
      g.fillStyle(0xe74c3c, 1);
      g.fillCircle(20, 26, 2);
    }],
  ];

  for (const [key, size, draw] of bosses) {
    bake(scene, key, size, size, draw);
  }

  bake(scene, "ui-panel", 32, 32, (g) => {
    g.fillStyle(0x1c1c2e, 0.92);
    g.fillRect(0, 0, 32, 32);
    g.lineStyle(1, 0x4a4a68, 1);
    g.strokeRect(0.5, 0.5, 31, 31);
  });
}
