# Angry Birds

A physics-based slingshot game built with HTML5 Canvas and Matter.js.

## Play Online

Hosted on GitHub Pages: [https://angellei10112358.github.io/angry_birds/](https://angellei10112358.github.io/angry_birds/)

## How to Play

1. **Drag** the bird on the slingshot backward to aim
2. **Release** to launch
3. **Click/tap** the bird mid-flight to activate its special ability
4. Destroy all pigs to win!

### Bird Types

| Bird | Ability |
|------|---------|
| 🔴 Red | No special ability |
| 🟡 Yellow | Click to speed boost (2x, capped) |
| 🔵 Blue | Click to split into 3 |

### Scoring

- ⭐⭐⭐: 3+ birds remaining
- ⭐⭐: 1+ birds remaining
- ⭐: Any win

## How to Run Locally

```bash
git clone https://github.com/angellei10112358/angry_birds.git
cd angry_birds
# Serve with any HTTP server:
npx serve .
# Or just open index.html in a browser (may need a local server for ES modules)
```

## Physics Constants

All parameters are derived from formal constraints (see `src/config.js`):

| Parameter | Value | Unit | Derivation |
|-----------|-------|------|------------|
| `g` | 0.8 | px/step² | Chosen low for range efficiency |
| `V_MAX` | 32 | px/step | `≥ √(1.3 × 960 × 0.8)` |
| `L_max` | 150 | px | Feel-adjusted |
| `SPEED_CAP` | 32 | px/step | `= V_MAX` |
| Sub-steps | 8 | per frame | Prevents tunneling |

## Project Structure

```
index.html          — Entry point
vendor/
  matter.min.js     — Vendored Matter.js
src/
  config.js         — All physical constants
  physics.js        — Engine init, sub-stepping, speed capping
  entities.js       — Bird/block/pig creation
  levels.js         — 3 levels
  ui.js             — Rendering, HUD, particles
  main.js           — Game loop & state machine
```

## Debug

Press **D** to toggle the debug panel (FPS, state, bird velocity).
