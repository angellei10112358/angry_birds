import {
  MATERIALS, PIG_HP, PIG_RADIUS, BIRD_TYPES, SPEED_CAP, WORLD_W,
} from './config.js';

export function createBird(type, x, y) {
  const cfg = BIRD_TYPES[type];
  if (!cfg) throw new Error(`Unknown bird type: ${type}`);

  const body = Matter.Bodies.circle(x, y, cfg.radius, {
    restitution: 0.3,
    friction: 0.5,
    density: 0.004,
    label: 'bird',
    birdType: type,
    isActive: false,
  });
  body.renderData = {
    color: cfg.color,
    radius: cfg.radius,
    type,
  };
  return body;
}

export function createBlock(x, y, w, h, material, angle = 0) {
  const cfg = MATERIALS[material];
  if (!cfg) throw new Error(`Unknown material: ${material}`);

  const body = Matter.Bodies.rectangle(x, y, w, h, {
    restitution: cfg.restitution,
    friction: 0.6,
    density: 0.002,
    angle,
    label: 'block',
    material,
    hp: cfg.hp,
    maxHp: cfg.hp,
  });
  body.renderData = {
    color: cfg.color,
    stroke: cfg.stroke,
    w, h,
    material,
    hp: cfg.hp,
    maxHp: cfg.hp,
  };
  return body;
}

export function createPig(x, y, radius = PIG_RADIUS) {
  const body = Matter.Bodies.circle(x, y, radius, {
    restitution: 0.2,
    friction: 0.5,
    density: 0.003,
    label: 'pig',
    hp: PIG_HP,
    maxHp: PIG_HP,
  });
  body.renderData = {
    color: '#4CAF50',
    stroke: '#2E7D32',
    radius,
    hp: PIG_HP,
    maxHp: PIG_HP,
  };
  return body;
}

export function cloneBirdForSplit(original) {
  const type = original.birdType || 'blue';
  return createBird(type, original.position.x, original.position.y);
}
