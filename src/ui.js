import {
  WORLD_W, WORLD_H, ANCHOR, L_MAX, GRAVITY, V_MAX, GROUND_Y,
  SPEED_CAP, SUB_STEPS,
} from './config.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = WORLD_W;
canvas.height = WORLD_H;

let dragging = false;
let dragPos = null;
let trajectoryPts = [];
let particles = [];
let debugInfo = {};

export function clearCanvas() {
  ctx.clearRect(0, 0, WORLD_W, WORLD_H);
}

export function drawBackground() {
  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, WORLD_H);
  grad.addColorStop(0, '#4FC3F7');
  grad.addColorStop(0.6, '#81D4FA');
  grad.addColorStop(1, '#B3E5FC');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);

  // Clouds
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  drawCloud(200, 100, 60);
  drawCloud(500, 70, 45);
  drawCloud(900, 120, 50);
  drawCloud(1100, 60, 35);

  // Ground
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(0, GROUND_Y, WORLD_W, WORLD_H - GROUND_Y);
  ctx.fillStyle = '#388E3C';
  ctx.fillRect(0, GROUND_Y + 10, WORLD_W, WORLD_H - GROUND_Y - 10);

  // Ground line
  ctx.strokeStyle = '#2E7D32';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(WORLD_W, GROUND_Y);
  ctx.stroke();
}

function drawCloud(x, y, size) {
  ctx.beginPath();
  ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
  ctx.arc(x + size * 0.4, y - size * 0.15, size * 0.4, 0, Math.PI * 2);
  ctx.arc(x + size * 0.8, y, size * 0.35, 0, Math.PI * 2);
  ctx.arc(x + size * 0.4, y + size * 0.1, size * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

export function drawSlingshot() {
  const { x, y } = ANCHOR;
  // Fork left
  ctx.strokeStyle = '#5D4037';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 30);
  ctx.lineTo(x - 10, y - 25);
  ctx.stroke();
  // Fork right
  ctx.beginPath();
  ctx.moveTo(x + 12, y + 30);
  ctx.lineTo(x + 10, y - 25);
  ctx.stroke();
  // Base
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 30);
  ctx.lineTo(x + 12, y + 30);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 8, y + 30);
  ctx.lineTo(x, y + 55);
  ctx.lineTo(x + 8, y + 30);
  ctx.stroke();
}

export function drawRubberBands(birdX, birdY) {
  const { x, y } = ANCHOR;
  ctx.strokeStyle = '#3E2723';
  ctx.lineWidth = 3;
  // Left band
  ctx.beginPath();
  ctx.moveTo(x - 10, y - 25);
  ctx.lineTo(birdX, birdY);
  ctx.stroke();
  // Right band
  ctx.beginPath();
  ctx.moveTo(x + 10, y - 25);
  ctx.lineTo(birdX, birdY);
  ctx.stroke();
}

export function drawBody(body, isGhost = false) {
  const verts = body.vertices;
  const data = body.renderData || {};
  ctx.save();

  if (body.label === 'bird') {
    // Draw bird as a circle
    ctx.beginPath();
    ctx.arc(body.position.x, body.position.y, data.radius || 15, 0, Math.PI * 2);
    ctx.fillStyle = isGhost ? 'rgba(255,255,255,0.4)' : (data.color || '#E53935');
    ctx.fill();
    ctx.strokeStyle = isGhost ? 'rgba(255,255,255,0.6)' : '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eyes
    if (!isGhost) {
      const r = data.radius || 15;
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(body.position.x - r * 0.3, body.position.y - r * 0.2, r * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(body.position.x + r * 0.3, body.position.y - r * 0.2, r * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(body.position.x - r * 0.25, body.position.y - r * 0.2, r * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(body.position.x + r * 0.35, body.position.y - r * 0.2, r * 0.12, 0, Math.PI * 2);
      ctx.fill();
      // Eyebrows (angry!)
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(body.position.x - r * 0.5, body.position.y - r * 0.5);
      ctx.lineTo(body.position.x - r * 0.15, body.position.y - r * 0.35);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(body.position.x + r * 0.5, body.position.y - r * 0.5);
      ctx.lineTo(body.position.x + r * 0.15, body.position.y - r * 0.35);
      ctx.stroke();
    }
  } else if (body.label === 'pig') {
    ctx.beginPath();
    ctx.arc(body.position.x, body.position.y, data.radius || 18, 0, Math.PI * 2);
    ctx.fillStyle = isGhost ? 'rgba(76,175,80,0.3)' : (data.color || '#4CAF50');
    ctx.fill();
    ctx.strokeStyle = isGhost ? 'rgba(76,175,80,0.5)' : '#2E7D32';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (!isGhost) {
      const r = data.radius || 18;
      // Snout
      ctx.fillStyle = '#388E3C';
      ctx.beginPath();
      ctx.ellipse(body.position.x, body.position.y + r * 0.1, r * 0.3, r * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      // Nostrils
      ctx.fillStyle = '#1B5E20';
      ctx.beginPath();
      ctx.ellipse(body.position.x - r * 0.1, body.position.y + r * 0.1, r * 0.08, r * 0.06, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(body.position.x + r * 0.1, body.position.y + r * 0.1, r * 0.08, r * 0.06, 0, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(body.position.x - r * 0.25, body.position.y - r * 0.25, r * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(body.position.x + r * 0.25, body.position.y - r * 0.25, r * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(body.position.x - r * 0.2, body.position.y - r * 0.2, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(body.position.x + r * 0.3, body.position.y - r * 0.2, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (body.label === 'block') {
    ctx.beginPath();
    ctx.moveTo(verts[0].x, verts[0].y);
    for (let i = 1; i < verts.length; i++) {
      ctx.lineTo(verts[i].x, verts[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = isGhost ? 'rgba(200,200,200,0.3)' : (data.color || '#8B4513');
    ctx.fill();
    ctx.strokeStyle = isGhost ? 'rgba(200,200,200,0.5)' : (data.stroke || '#5C2E00');
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Damage cracks
    if (!isGhost && data.maxHp && data.hp != null) {
      const ratio = data.hp / data.maxHp;
      if (ratio < 0.5) {
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        const cx = body.position.x, cy = body.position.y;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(cx + (Math.random() - 0.5) * data.w * 0.3, cy + (Math.random() - 0.5) * data.h * 0.3);
          ctx.lineTo(cx + (Math.random() - 0.5) * data.w * 0.4, cy + (Math.random() - 0.5) * data.h * 0.4);
          ctx.stroke();
        }
      }
    }
  } else {
    // Generic body
    ctx.beginPath();
    ctx.moveTo(verts[0].x, verts[0].y);
    for (let i = 1; i < verts.length; i++) {
      ctx.lineTo(verts[i].x, verts[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = isGhost ? 'rgba(200,200,200,0.3)' : '#999';
    ctx.fill();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.restore();
}

export function drawTrajectory(startX, startY, vx, vy, steps = 80) {
  trajectoryPts = [];
  let x = startX, y = startY;
  let cvx = vx, cvy = vy;
  const dt = 1 / 60;
  for (let i = 0; i < steps; i++) {
    x += cvx;
    y += cvy;
    cvy += GRAVITY;
    trajectoryPts.push({ x, y });
    if (y > GROUND_Y - 5) break;
  }

  ctx.save();
  ctx.setLineDash([4, 6]);
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (trajectoryPts.length > 0) {
    ctx.moveTo(trajectoryPts[0].x, trajectoryPts[0].y);
    for (let i = 1; i < trajectoryPts.length; i++) {
      ctx.lineTo(trajectoryPts[i].x, trajectoryPts[i].y);
    }
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

export function drawAimLine(fromX, fromY, toX, toY) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  ctx.setLineDash([3, 5]);
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

export function getCanvas() { return canvas; }
export function getCtx() { return ctx; }

// Particles
export function spawnParticles(x, y, color, count = 8) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 4;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 30 + Math.random() * 20,
      maxLife: 50,
      color,
      size: 2 + Math.random() * 3,
    });
  }
}

export function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15;
    p.life--;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

export function drawParticles() {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawHUD(levelNum, levelName, birdsRemaining, stars, score) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(0, 0, WORLD_W, 40);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Level ${levelNum}: ${levelName}`, 12, 26);

  // Birds remaining (icons)
  ctx.textAlign = 'right';
  ctx.font = '14px Arial';
  ctx.fillText(`Birds: ${birdsRemaining}  Score: ${score}`, WORLD_W - 12, 26);

  // Stars
  if (stars > 0) {
    ctx.textAlign = 'center';
    ctx.font = '20px Arial';
    let starStr = '';
    for (let i = 0; i < 3; i++) {
      starStr += i < stars ? '★' : '☆';
    }
    ctx.fillText(starStr, WORLD_W / 2, 28);
  }

  ctx.restore();
}

export function drawWinScreen(stars, levelNum) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);

  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('VICTORY!', WORLD_W / 2, WORLD_H / 2 - 60);

  ctx.fillStyle = '#fff';
  ctx.font = '24px Arial';
  let starStr = '';
  for (let i = 0; i < 3; i++) {
    starStr += i < stars ? '★' : '☆';
  }
  ctx.fillText(starStr, WORLD_W / 2, WORLD_H / 2);

  ctx.font = '18px Arial';
  ctx.fillText('Click or press SPACE for next level', WORLD_W / 2, WORLD_H / 2 + 60);

  ctx.restore();
}

export function drawLoseScreen() {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);

  ctx.fillStyle = '#E53935';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('DEFEAT', WORLD_W / 2, WORLD_H / 2 - 40);

  ctx.fillStyle = '#fff';
  ctx.font = '18px Arial';
  ctx.fillText('Click or press SPACE to retry', WORLD_W / 2, WORLD_H / 2 + 30);

  ctx.restore();
}

export function drawLevelSelect(currentLevel, totalLevels, stars) {
  ctx.save();
  drawBackground();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Angry Birds', WORLD_W / 2, 80);

  ctx.font = '20px Arial';
  ctx.fillText('Select Level', WORLD_W / 2, 130);

  const startY = 200;
  const spacing = 100;

  for (let i = 0; i < totalLevels; i++) {
    const x = WORLD_W / 2;
    const y = startY + i * spacing;
    const unlocked = i <= currentLevel;

    ctx.fillStyle = unlocked ? '#4CAF50' : '#666';
    ctx.fillRect(x - 120, y - 25, 240, 50);

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 120, y - 25, 240, 50);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`Level ${i + 1}`, x, y + 7);

    if (unlocked && stars[i] > 0) {
      ctx.font = '14px Arial';
      let str = '';
      for (let s = 0; s < 3; s++) {
        str += s < stars[i] ? '★' : '☆';
      }
      ctx.fillText(str, x, y + 25);
    }
  }

  ctx.restore();
}

export function setDebugInfo(info) {
  debugInfo = info;
}

export function drawDebugPanel() {
  const x = 10;
  let y = 50;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(x, y - 10, 220, 120);
  ctx.fillStyle = '#0f0';
  ctx.font = '11px monospace';
  ctx.textAlign = 'left';

  for (const [key, val] of Object.entries(debugInfo)) {
    ctx.fillText(`${key}: ${val}`, x + 8, y + 8);
    y += 16;
  }
  ctx.restore();
}
