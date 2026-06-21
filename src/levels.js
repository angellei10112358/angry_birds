// All blocks sit on the ground (y=660) or on blocks below them.
// Bottom face of every block must touch the block/ground below it.
// Pig at y=660-r sits on ground.

export const LEVELS = [
  {
    // Simple hut: two pillars + roof, pig inside
    name: 'First Flight',
    birds: ['red'],
    blocks: [
      { x: 905, y: 645, w: 20, h: 30, material: 'wood' },
      { x: 955, y: 645, w: 20, h: 30, material: 'wood' },
      { x: 930, y: 625, w: 70, h: 10, material: 'wood' },
    ],
    pigs: [
      { x: 930, y: 642, r: 18 },
    ],
    D_far: 955,
  },
  {
    // Two huts connected by a glass bridge
    name: 'Double Trouble',
    birds: ['red', 'yellow'],
    blocks: [
      // Left hut walls (wood)
      { x: 855, y: 645, w: 16, h: 30, material: 'wood' },
      { x: 895, y: 645, w: 16, h: 30, material: 'wood' },
      { x: 875, y: 625, w: 56, h: 10, material: 'wood' },
      // Right hut walls (wood)
      { x: 990, y: 645, w: 16, h: 30, material: 'wood' },
      { x: 1030, y: 645, w: 16, h: 30, material: 'wood' },
      { x: 1010, y: 625, w: 56, h: 10, material: 'wood' },
      // Glass bridge between huts (supported by wall tops at y=610)
      { x: 943, y: 605, w: 64, h: 8, material: 'glass' },
    ],
    pigs: [
      { x: 875, y: 642, r: 18 },
      { x: 1010, y: 642, r: 18 },
    ],
    D_far: 1030,
  },
  {
    // Stone fortress: two chambers, pig on each floor
    name: 'Fortress',
    birds: ['red', 'yellow', 'blue'],
    blocks: [
      // Left chamber walls
      { x: 870, y: 645, w: 20, h: 30, material: 'stone' },
      { x: 920, y: 645, w: 20, h: 30, material: 'stone' },
      // Left chamber roof (stone)
      { x: 895, y: 625, w: 70, h: 12, material: 'stone' },
      // Right chamber walls
      { x: 980, y: 645, w: 20, h: 30, material: 'stone' },
      { x: 1030, y: 645, w: 20, h: 30, material: 'stone' },
      // Right chamber roof (stone)
      { x: 1005, y: 625, w: 70, h: 12, material: 'stone' },
      // 2nd floor left — glass walls on left chamber roof (roof top y=619)
      { x: 885, y: 602, w: 14, h: 34, material: 'glass' },
      { x: 915, y: 602, w: 14, h: 34, material: 'glass' },
      // 2nd floor right — glass walls on right chamber roof
      { x: 990, y: 602, w: 14, h: 34, material: 'glass' },
      { x: 1020, y: 602, w: 14, h: 34, material: 'glass' },
      // 2nd floor roofs (glass)
      { x: 900, y: 580, w: 44, h: 10, material: 'glass' },
      { x: 1005, y: 580, w: 44, h: 10, material: 'glass' },
    ],
    pigs: [
      { x: 895, y: 642, r: 18 },
      { x: 1005, y: 642, r: 18 },
      { x: 950, y: 642, r: 20 },
    ],
    D_far: 1030,
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
