// Level 1: Simple — 1 pig, few wood blocks
// Level 2: Medium — 2 pigs, glass + wood structure
// Level 3: Hard — 3 pigs, stone + wood + glass, taller structure

export const LEVELS = [
  {
    name: 'First Flight',
    birds: ['red'],
    blocks: [
      { x: 900, y: 620, w: 80, h: 20, material: 'wood' },
      { x: 900, y: 560, w: 20, h: 80, material: 'wood', angle: 0 },
      { x: 960, y: 560, w: 20, h: 80, material: 'wood', angle: 0 },
      { x: 930, y: 500, w: 60, h: 15, material: 'wood' },
    ],
    pigs: [
      { x: 930, y: 640, r: 18 },
    ],
  },
  {
    name: 'Double Trouble',
    birds: ['red', 'yellow'],
    blocks: [
      // Left pillar
      { x: 850, y: 620, w: 20, h: 60, material: 'wood' },
      { x: 890, y: 620, w: 20, h: 60, material: 'wood' },
      { x: 870, y: 580, w: 50, h: 15, material: 'glass' },
      // Right pillar
      { x: 980, y: 620, w: 20, h: 60, material: 'wood' },
      { x: 1020, y: 620, w: 20, h: 60, material: 'wood' },
      { x: 1000, y: 580, w: 50, h: 15, material: 'glass' },
      // Top bridge
      { x: 935, y: 540, w: 110, h: 15, material: 'wood' },
      // Small hut on top
      { x: 920, y: 500, w: 15, h: 40, material: 'glass', angle: 0 },
      { x: 950, y: 500, w: 15, h: 40, material: 'glass', angle: 0 },
      { x: 935, y: 470, w: 40, h: 12, material: 'glass' },
    ],
    pigs: [
      { x: 870, y: 642, r: 18 },
      { x: 1000, y: 642, r: 18 },
    ],
  },
  {
    name: 'Fortress',
    birds: ['red', 'yellow', 'blue'],
    blocks: [
      // Outer walls (stone)
      { x: 880, y: 620, w: 25, h: 60, material: 'stone' },
      { x: 920, y: 620, w: 25, h: 60, material: 'stone' },
      { x: 980, y: 620, w: 25, h: 60, material: 'stone' },
      { x: 1020, y: 620, w: 25, h: 60, material: 'stone' },
      // Floor
      { x: 950, y: 585, w: 170, h: 15, material: 'stone' },
      // Inner glass walls
      { x: 910, y: 540, w: 15, h: 50, material: 'glass' },
      { x: 990, y: 540, w: 15, h: 50, material: 'glass' },
      // Middle floor
      { x: 950, y: 505, w: 100, h: 12, material: 'wood' },
      // Top structure
      { x: 935, y: 470, w: 15, h: 35, material: 'glass' },
      { x: 965, y: 470, w: 15, h: 35, material: 'glass' },
      { x: 950, y: 445, w: 45, h: 10, material: 'glass' },
      // Roof decoration
      { x: 950, y: 410, w: 30, h: 10, material: 'wood' },
    ],
    pigs: [
      { x: 950, y: 640, r: 20 },
      { x: 900, y: 558, r: 16 },
      { x: 1000, y: 558, r: 16 },
    ],
  },
];

export function getMaxDFar() {
  let maxX = 0;
  for (const lvl of LEVELS) {
    for (const p of lvl.pigs) {
      if (p.x > maxX) maxX = p.x;
    }
  }
  return maxX;
}

export function getMaxHeight() {
  let minY = Infinity;
  for (const lvl of LEVELS) {
    for (const b of lvl.blocks) {
      const top = b.y - b.h / 2;
      if (top < minY) minY = top;
    }
  }
  // Height above ground: GROUND_Y - minY
  return minY;
}
