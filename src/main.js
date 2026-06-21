import {
  WORLD_W, WORLD_H, ANCHOR, L_MAX, V_MAX, SPEED_CAP,
  GROUND_Y, GRAVITY, SETTLE_SPEED, SETTLE_STEPS,
  PIG_HP, IMPACT_DMG_SCALE,
  BIRD_TYPES,
  STAR_3, STAR_2, STAR_1, DEBUG,
} from './config.js';
import { initPhysics, stepPhysics, clearWorld, getWorld, getEngine, drainEvents, clampSpeeds } from './physics.js';
import { createBird, createBlock, createPig } from './entities.js';
import { LEVELS } from './levels.js';
import { playLaunch, playHit, playBreak, playPigDeath, playWin, playLose } from './audio.js';
import {
  getCanvas,
  clearCanvas, drawBackground, drawSlingshot, drawRubberBands,
  drawBody, drawTrajectory,
  drawHUD, drawWinScreen, drawLoseScreen, drawLevelSelect,
  spawnParticles, updateParticles, drawParticles,
  setDebugInfo, drawDebugPanel,
} from './ui.js';

const State = {
  MENU: 'menu', READY: 'ready', AIMING: 'aiming',
  FLYING: 'flying', SETTLING: 'settling', WON: 'won', LOST: 'lost',
};

let state = State.MENU;
let currentLevel = 0;
let levelStars = [0, 0, 0];
let score = 0;

let birdQueue = [];
let birdIndex = 0;
let activeBird = null;
let flyingBirds = [];
let settleTimer = 0;
let settleStableCount = 0;

let isDragging = false;
let dragCurrent = null;
let canActivateAbility = false;

let lastTime = 0;
let fpsCounter = 0;
let fpsTime = 0;
let currentFps = 60;

export function init() {
  initPhysics();
  const canvas = getCanvas();
  canvas.addEventListener('mousedown', onPointerDown);
  canvas.addEventListener('mousemove', onPointerMove);
  canvas.addEventListener('mouseup', onPointerUp);
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    onPointerDown({ clientX: t.clientX, clientY: t.clientY });
  }, { passive: false });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    onPointerMove({ clientX: t.clientX, clientY: t.clientY });
  }, { passive: false });
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    onPointerUp({});
  }, { passive: false });

  document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      if (state === State.WON) nextLevel();
      else if (state === State.LOST) retryLevel();
      else if (state === State.MENU) startLevel(currentLevel);
      else if (state === State.FLYING && activeBird) activateBirdAbility(activeBird);
    }
    if (e.key === 'd' || e.key === 'D') DEBUG.showFPS = !DEBUG.showFPS;
  });

  loadLevel(currentLevel);
  requestAnimationFrame(gameLoop);
}

function getCanvasCoords(clientX, clientY) {
  const rect = getCanvas().getBoundingClientRect();
  const sx = WORLD_W / rect.width;
  const sy = WORLD_H / rect.height;
  return { x: (clientX - rect.left) * sx, y: (clientY - rect.top) * sy };
}

function onPointerDown(e) {
  const pos = getCanvasCoords(e.clientX, e.clientY);

  if (state === State.MENU) {
    const startY = 200;
    const spacing = 100;
    for (let i = 0; i < LEVELS.length; i++) {
      const cx = WORLD_W / 2, cy = startY + i * spacing;
      if (pos.x >= cx - 120 && pos.x <= cx + 120 && pos.y >= cy - 25 && pos.y <= cy + 25) {
        if (i <= currentLevel) { currentLevel = i; startLevel(i); return; }
      }
    }
    return;
  }
  if (state === State.WON) { nextLevel(); return; }
  if (state === State.LOST) { retryLevel(); return; }

  if (state === State.READY && activeBird) {
    const dx = pos.x - activeBird.position.x;
    const dy = pos.y - activeBird.position.y;
    if (Math.sqrt(dx * dx + dy * dy) < 40) {
      state = State.AIMING;
      isDragging = true;
      dragCurrent = { x: pos.x, y: pos.y };
      Matter.Body.setPosition(activeBird, { x: pos.x, y: pos.y });
      Matter.Body.setVelocity(activeBird, { x: 0, y: 0 });
    }
  }

  if (state === State.FLYING && activeBird) {
    activateBirdAbility(activeBird);
  }
}

function onPointerMove(e) {
  if (!isDragging) return;
  const pos = getCanvasCoords(e.clientX, e.clientY);
  const dx = pos.x - ANCHOR.x;
  const dy = pos.y - ANCHOR.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  let cx, cy;
  if (dist > L_MAX) {
    cx = ANCHOR.x + (dx / dist) * L_MAX;
    cy = ANCHOR.y + (dy / dist) * L_MAX;
  } else {
    cx = pos.x; cy = pos.y;
  }
  dragCurrent = { x: cx, y: cy };
  if (activeBird) {
    Matter.Body.setPosition(activeBird, { x: cx, y: cy });
    Matter.Body.setVelocity(activeBird, { x: 0, y: 0 });
  }
}

function onPointerUp() {
  if (!isDragging) return;
  isDragging = false;
  if (state !== State.AIMING) return;

  const dx = ANCHOR.x - dragCurrent.x;
  const dy = ANCHOR.y - dragCurrent.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 5) {
    resetBirdToAnchor();
    return;
  }

  const vScale = (dist / L_MAX) * V_MAX;
  const vx = (dx / dist) * vScale;
  const vy = (dy / dist) * vScale;

  if (activeBird) {
    Matter.Body.setVelocity(activeBird, { x: vx, y: vy });
    Matter.Composite.add(getWorld(), activeBird);
    activeBird.isActive = true;
    canActivateAbility = true;
    flyingBirds = [activeBird];
    playLaunch();
  }
  state = State.FLYING;
  settleTimer = 0;
  settleStableCount = 0;
}

function resetBirdToAnchor() {
  if (activeBird) {
    Matter.Body.setPosition(activeBird, { x: ANCHOR.x, y: ANCHOR.y });
    Matter.Body.setVelocity(activeBird, { x: 0, y: 0 });
  }
  state = State.READY;
}

function activateBirdAbility(bird) {
  if (!canActivateAbility || !bird || !bird.birdType) return;
  canActivateAbility = false;

  const type = bird.birdType;
  const pos = { x: bird.position.x, y: bird.position.y };
  const vel = { x: bird.velocity.x, y: bird.velocity.y };
  const cfg = BIRD_TYPES[type];

  if (type === 'yellow') {
    const spd = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
    const newSpd = Math.min(spd * (cfg.speedMult || 2), SPEED_CAP);
    const s = newSpd / spd;
    Matter.Body.setVelocity(bird, { x: vel.x * s, y: vel.y * s });
  } else if (type === 'blue') {
    const spd = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
    const baseAngle = Math.atan2(vel.y, vel.x);
    const spread = cfg.splitAngle || 0.3;
    const world = getWorld();
    const newBirds = [];

    Matter.Composite.remove(world, bird);
    spawnParticles(pos.x, pos.y, '#4169E1', 12);

    for (let i = 0; i < (cfg.splitCount || 3); i++) {
      const angle = baseAngle + (i - 1) * spread;
      const nb = createBird('blue', pos.x, pos.y);
      nb.renderData.radius = (cfg.radius || 12) * 0.8;
      Matter.Body.scale(nb, 0.8, 0.8);
      Matter.Body.setVelocity(nb, {
        x: Math.cos(angle) * spd * 0.9,
        y: Math.sin(angle) * spd * 0.9,
      });
      Matter.Composite.add(world, nb);
      newBirds.push(nb);
    }

    activeBird = null;
    flyingBirds = newBirds;
  }
}

function isBirdDone(bird) {
  if (!bird) return true;
  const p = bird.position;
  const v = bird.velocity;
  const spd = Math.sqrt(v.x * v.x + v.y * v.y);
  return (p.x > WORLD_W + 80 || p.x < -80 || p.y > GROUND_Y + 80 || p.y < -300 || (spd < 0.2 && p.y > GROUND_Y - 40));
}

function loadLevel(idx) {
  clearWorld();
  const lvl = LEVELS[idx];
  if (!lvl) return;

  birdQueue = [];
  birdIndex = 0;
  activeBird = null;
  flyingBirds = [];

  for (const type of lvl.birds) {
    birdQueue.push(createBird(type, ANCHOR.x, ANCHOR.y));
  }

  const engine = getEngine();
  const world = getWorld();
  for (const bd of lvl.blocks) {
    Matter.Composite.add(world, createBlock(bd.x, bd.y, bd.w, bd.h, bd.material, bd.angle || 0));
  }
  for (const pd of lvl.pigs) {
    Matter.Composite.add(world, createPig(pd.x, pd.y, pd.r || 18));
  }

  // Stabilize: let all blocks/pigs settle before game starts
  for (let i = 0; i < 120; i++) {
    Matter.Engine.update(engine, 1000 / 60);
  }
  clampSpeeds();
  drainEvents();

  placeNextBird();
}

function placeNextBird() {
  activeBird = null;
  flyingBirds = [];

  if (birdIndex >= birdQueue.length) return;

  activeBird = birdQueue[birdIndex];
  if (activeBird) {
    Matter.Body.setPosition(activeBird, { x: ANCHOR.x, y: ANCHOR.y });
    Matter.Body.setVelocity(activeBird, { x: 0, y: 0 });
    // Don't add to world until launch — bird is "ghosted" on slingshot
    state = State.READY;
  }
}

function startLevel(idx) {
  loadLevel(idx);
  state = State.READY;
}

function nextLevel() {
  if (currentLevel + 1 < LEVELS.length) {
    currentLevel++;
    startLevel(currentLevel);
  } else {
    state = State.MENU;
    currentLevel = 0;
    loadLevel(currentLevel);
  }
}

function retryLevel() {
  startLevel(currentLevel);
}

function gameLoop(timestamp) {
  const dt = timestamp - lastTime;
  lastTime = timestamp;

  fpsCounter++;
  if (timestamp - fpsTime >= 1000) {
    currentFps = fpsCounter;
    fpsCounter = 0;
    fpsTime = timestamp;
  }

  update();
  render();
  requestAnimationFrame(gameLoop);
}

function update() {
  if (state === State.MENU) return;

  stepPhysics(1000 / 60);

  const events = drainEvents();
  for (const evt of events) {
    for (const body of [evt.bodyA, evt.bodyB]) {
      if (body.isStatic || body.hp == null) continue;
      if (body.hp !== undefined) {
        body.hp -= evt.damage;
        if (body.hp <= 0) {
          spawnParticles(body.position.x, body.position.y,
            body.renderData?.color || '#888', 8);
          if (body.label === 'pig') playPigDeath();
          else playBreak();
          try { Matter.Composite.remove(getWorld(), body); } catch (e) {}
        } else {
          spawnParticles(body.position.x, body.position.y, '#aaa', 2);
          playHit();
        }
      }
    }
  }

  updateParticles();

  if (state === State.FLYING) {
    let allDone = true;
    const stillFlying = [];
    for (const b of flyingBirds) {
      if (b && !isBirdDone(b)) {
        allDone = false;
        stillFlying.push(b);
      }
    }
    flyingBirds = stillFlying;

    if (allDone || !flyingBirds.length) {
      activeBird = null;
      state = State.SETTLING;
      settleTimer = 0;
      settleStableCount = 0;
    }
  }

  if (state === State.SETTLING) {
    const bodies = Matter.Composite.allBodies(getWorld());
    let maxSpd = 0;
    for (const b of bodies) {
      if (!b.isStatic) {
        const s = Math.sqrt(b.velocity.x ** 2 + b.velocity.y ** 2);
        if (s > maxSpd) maxSpd = s;
      }
    }

    if (maxSpd < SETTLE_SPEED) settleStableCount++;
    else settleStableCount = 0;
    settleTimer++;

    if (settleStableCount >= SETTLE_STEPS || settleTimer > 300) {
      checkWinLose();
    }
  }
}

function checkWinLose() {
  let pigsAlive = 0;
  const bodies = Matter.Composite.allBodies(getWorld());
  for (const b of bodies) {
    if (b.label === 'pig' && b.hp != null && b.hp > 0) pigsAlive++;
  }

  if (pigsAlive === 0) {
    state = State.WON;
    playWin();
    const remaining = birdQueue.length - birdIndex - 1;
    const total = birdQueue.length;
    const ratio = total > 0 ? remaining / total : 0;
    let stars = 1;
    if (ratio >= STAR_2) stars = 2;
    if (ratio >= STAR_3) stars = 3;
    levelStars[currentLevel] = Math.max(levelStars[currentLevel], stars);
    score += 100 * stars;
  } else {
    birdIndex++;
    if (birdIndex >= birdQueue.length) {
      state = State.LOST;
      playLose();
    } else {
      placeNextBird();
    }
  }
}

function render() {
  clearCanvas();
  drawBackground();

  if (state === State.MENU) {
    drawLevelSelect(currentLevel, LEVELS.length, levelStars);
    return;
  }

  drawSlingshot();

  const bodies = Matter.Composite.allBodies(getWorld());
  for (const body of bodies) {
    if (body.label === 'ground' || body.label === 'wall') continue;
    drawBody(body);
  }

  // Draw bird on slingshot (not in world yet)
  if ((state === State.READY || state === State.AIMING) && activeBird) {
    const bx = state === State.AIMING ? activeBird.position.x : ANCHOR.x;
    const by = state === State.AIMING ? activeBird.position.y : ANCHOR.y;
    Matter.Body.setPosition(activeBird, { x: bx, y: by });
    drawBody(activeBird);
  }

  if (state === State.AIMING && isDragging && dragCurrent && activeBird) {
    drawRubberBands(activeBird.position.x, activeBird.position.y);
    const dx = ANCHOR.x - dragCurrent.x;
    const dy = ANCHOR.y - dragCurrent.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 5) {
      const vScale = (dist / L_MAX) * V_MAX;
      drawTrajectory(activeBird.position.x, activeBird.position.y,
        (dx / dist) * vScale, (dy / dist) * vScale);
    }
  }

  drawParticles();

  const birdsLeft = Math.max(0, birdQueue.length - birdIndex - 1);
  drawHUD(currentLevel + 1, LEVELS[currentLevel]?.name || '', birdsLeft, 0, score);

  if (state === State.WON) drawWinScreen(levelStars[currentLevel], currentLevel);
  if (state === State.LOST) drawLoseScreen();

  if (DEBUG.showFPS) {
    const ab = activeBird || flyingBirds[0];
    setDebugInfo({
      FPS: currentFps,
      State, Bodies: bodies.length,
      Bird: ab ? `(${ab.birdType}) v=${Math.sqrt(ab.velocity.x**2 + ab.velocity.y**2).toFixed(1)}` : '-',
    });
    drawDebugPanel();
  }
}

init();
