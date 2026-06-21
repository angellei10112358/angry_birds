import {
  GRAVITY, SPEED_CAP, SUB_STEPS, GROUND_Y, WORLD_W,
  IMPACT_THRESHOLD, IMPACT_DMG_SCALE,
} from './config.js';

let engine, world, events;

export function initPhysics() {
  engine = Matter.Engine.create({
    gravity: { x: 0, y: GRAVITY, scale: 0.001 },
    enableSleeping: true,
  });
  world = engine.world;

  const ground = Matter.Bodies.rectangle(
    WORLD_W / 2, GROUND_Y + 25, WORLD_W + 200, 50,
    { isStatic: true, label: 'ground', friction: 1, restitution: 0 },
  );
  const leftWall = Matter.Bodies.rectangle(
    -10, 360, 20, 720,
    { isStatic: true, label: 'wall', friction: 1 },
  );
  const rightWall = Matter.Bodies.rectangle(
    WORLD_W + 10, 360, 20, 720,
    { isStatic: true, label: 'wall', friction: 1 },
  );
  const ceiling = Matter.Bodies.rectangle(
    WORLD_W / 2, -10, WORLD_W, 20,
    { isStatic: true, label: 'wall' },
  );
  Matter.Composite.add(world, [ground, leftWall, rightWall, ceiling]);

  events = [];
  Matter.Events.on(engine, 'collisionStart', (e) => {
    for (const pair of e.pairs) {
      const impulse = pair.collision.depth;
      const relVel = Matter.Vector.sub(
        pair.bodyA.velocity, pair.bodyB.velocity,
      );
      const speed = Matter.Vector.magnitude(relVel);
      if (speed < 0.5) continue;
      const dmg = Math.floor(speed * IMPACT_DMG_SCALE);
      if (dmg < 1) continue;
      events.push({
        bodyA: pair.bodyA,
        bodyB: pair.bodyB,
        damage: dmg,
        pos: pair.activeContacts?.[0]?.vertex || null,
      });
    }
  });

  return { engine, world, events };
}

export function stepPhysics(delta) {
  Matter.Engine.update(engine, delta, SUB_STEPS);
  clampSpeeds();
}

export function clampSpeeds() {
  const bodies = Matter.Composite.allBodies(world);
  for (const b of bodies) {
    if (b.isStatic) continue;
    const spd = Matter.Vector.magnitude(b.velocity);
    if (spd > SPEED_CAP) {
      const scale = SPEED_CAP / spd;
      Matter.Body.setVelocity(b, {
        x: b.velocity.x * scale,
        y: b.velocity.y * scale,
      });
    }
  }
}

export function clearWorld() {
  const bodies = Matter.Composite.allBodies(world);
  for (const b of bodies) {
    if (b.label === 'ground' || b.label === 'wall') continue;
    Matter.Composite.remove(world, b);
  }
  events.length = 0;
}

export function getEngine() { return engine; }
export function getWorld() { return world; }
export function drainEvents() {
  const copy = events.slice();
  events.length = 0;
  return copy;
}
