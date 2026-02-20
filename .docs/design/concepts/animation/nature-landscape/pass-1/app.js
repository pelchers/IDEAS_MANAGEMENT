/* ============================================================
   Autumn Landscape — Pass 1 | p5.js Animation
   ============================================================
   A framed autumn landscape with falling leaves, layered
   clouds, rolling hills, trees, swaying grass, and a stream.
   ============================================================ */

// --------------- Global State ---------------
let paused = false;
let windFactor = 0.4;      // 0..1
let leafCount = 35;
let leaves = [];
let clouds = [];
let trees = [];
let grassBlades = [];
let hillLayers = [];
let streamPoints = [];

// Canvas pixel dimensions (actual render size)
const CW = 900;
const CH = 600;

// Frame counter
let tick = 0;

// --------------- p5.js Setup ---------------
function setup() {
  const cnv = createCanvas(CW, CH);
  cnv.parent('canvas-container');
  colorMode(RGB, 255);
  noStroke();

  initHills();
  initTrees();
  initClouds();
  initLeaves(leafCount);
  initGrass();
  initStream();
}

// --------------- p5.js Draw ---------------
function draw() {
  if (paused) return;
  tick++;

  drawSky();
  drawClouds();
  drawHills();
  drawStream();
  drawTrees();
  drawGrass();
  drawLeaves();
}

// ============================================================
//  SKY — warm gradient from blue top to sunset orange horizon
// ============================================================
function drawSky() {
  const horizonY = CH * 0.48;
  // Top color: warm blue
  const topR = 70, topG = 130, topB = 200;
  // Horizon color: warm sunset orange
  const botR = 245, botG = 166, botB = 80;

  for (let y = 0; y <= horizonY; y++) {
    const t = y / horizonY;
    const r = lerp(topR, botR, t);
    const g = lerp(topG, botG, t);
    const b = lerp(topB, botB, t);
    stroke(r, g, b);
    line(0, y, CW, y);
  }

  // Below horizon — warm orange to soft green transition
  const lowR = 200, lowG = 180, lowB = 100;
  for (let y = Math.floor(horizonY); y < CH; y++) {
    const t = (y - horizonY) / (CH - horizonY);
    const r = lerp(botR, lowR, t);
    const g = lerp(botG, lowG, t);
    const b = lerp(botB, lowB, t);
    stroke(r, g, b);
    line(0, y, CW, y);
  }
  noStroke();
}

// ============================================================
//  CLOUDS — 3 layers, each moving at a different velocity
// ============================================================
function initClouds() {
  clouds = [];
  const layers = [
    { y: 40,  speed: 0.15, alpha: 60,  scale: 1.4, count: 4 },
    { y: 75,  speed: 0.30, alpha: 80,  scale: 1.1, count: 4 },
    { y: 110, speed: 0.55, alpha: 110, scale: 0.85, count: 5 },
  ];

  layers.forEach((layer, li) => {
    for (let i = 0; i < layer.count; i++) {
      clouds.push({
        x: random(-200, CW + 200),
        y: layer.y + random(-15, 15),
        speed: layer.speed,
        alpha: layer.alpha,
        scale: layer.scale,
        puffs: buildCloudPuffs(layer.scale),
        layerIndex: li,
      });
    }
  });
}

function buildCloudPuffs(s) {
  const puffs = [];
  const n = floor(random(4, 8));
  for (let i = 0; i < n; i++) {
    puffs.push({
      ox: random(-50, 50) * s,
      oy: random(-12, 12) * s,
      r: random(22, 50) * s,
    });
  }
  return puffs;
}

function drawClouds() {
  clouds.forEach(c => {
    const sp = c.speed * (0.4 + windFactor * 1.2);
    c.x += sp;
    if (c.x > CW + 300) c.x = -300;

    push();
    translate(c.x, c.y);
    noStroke();
    c.puffs.forEach(p => {
      fill(255, 255, 255, c.alpha);
      ellipse(p.ox, p.oy, p.r * 2, p.r * 1.3);
    });
    pop();
  });
}

// ============================================================
//  HILLS — 3 rolling layers with depth haze
// ============================================================
function initHills() {
  hillLayers = [
    { baseY: CH * 0.46, amp: 35, freq: 0.0025, color: [110, 130, 80, 180], noiseOff: 0 },
    { baseY: CH * 0.55, amp: 40, freq: 0.003,  color: [140, 115, 60, 210], noiseOff: 100 },
    { baseY: CH * 0.65, amp: 30, freq: 0.004,  color: [95, 140, 65, 240],  noiseOff: 200 },
  ];
}

function drawHills() {
  hillLayers.forEach(h => {
    fill(h.color[0], h.color[1], h.color[2], h.color[3]);
    beginShape();
    vertex(0, CH);
    for (let x = 0; x <= CW; x += 4) {
      const ny = noise((x + h.noiseOff) * h.freq, h.noiseOff * 0.01);
      const y = h.baseY - ny * h.amp * 2 + sin(x * 0.008) * h.amp * 0.5;
      vertex(x, y);
    }
    vertex(CW, CH);
    endShape(CLOSE);
  });
}

function getHillY(x) {
  // Return the topmost hill Y for tree/grass placement (last hill layer)
  const h = hillLayers[2];
  const ny = noise((x + h.noiseOff) * h.freq, h.noiseOff * 0.01);
  return h.baseY - ny * h.amp * 2 + sin(x * 0.008) * h.amp * 0.5;
}

// ============================================================
//  TREES — 6 deciduous trees on the hills
// ============================================================
function initTrees() {
  trees = [];
  const positions = [80, 180, 340, 500, 620, 770, 850];
  positions.forEach(tx => {
    // Place on the second hill layer
    const h = hillLayers[1];
    const ny = noise((tx + h.noiseOff) * h.freq, h.noiseOff * 0.01);
    const ty = h.baseY - ny * h.amp * 2 + sin(tx * 0.008) * h.amp * 0.5;
    trees.push({
      x: tx,
      y: ty,
      trunkH: random(40, 70),
      trunkW: random(6, 12),
      canopyR: random(25, 50),
      foliageColor: randomFoliageColor(),
      blobs: buildCanopyBlobs(),
    });
  });
}

function randomFoliageColor() {
  const palette = [
    [220, 100, 30],   // burnt orange
    [200, 60, 40],    // red
    [230, 170, 40],   // gold
    [180, 80, 30],    // deep orange
    [210, 140, 30],   // amber
    [160, 50, 35],    // dark red
  ];
  return random(palette);
}

function buildCanopyBlobs() {
  const blobs = [];
  const n = floor(random(5, 9));
  for (let i = 0; i < n; i++) {
    blobs.push({
      ox: random(-1, 1),
      oy: random(-1.2, 0.3),
      size: random(0.5, 1.1),
      colorShift: random(-20, 20),
    });
  }
  return blobs;
}

function drawTrees() {
  trees.forEach(t => {
    // Trunk
    fill(90, 60, 30);
    rectMode(CENTER);
    rect(t.x, t.y - t.trunkH / 2, t.trunkW, t.trunkH, 2);

    // Canopy blobs
    t.blobs.forEach(b => {
      const r = constrain(t.foliageColor[0] + b.colorShift, 0, 255);
      const g = constrain(t.foliageColor[1] + b.colorShift * 0.5, 0, 255);
      const bl = constrain(t.foliageColor[2] + b.colorShift * 0.3, 0, 255);
      fill(r, g, bl);
      const bx = t.x + b.ox * t.canopyR;
      const by = t.y - t.trunkH + b.oy * t.canopyR;
      const bs = t.canopyR * b.size;
      ellipse(bx, by, bs, bs * 0.85);
    });
  });
  rectMode(CORNER);
}

// ============================================================
//  FALLING LEAVES — 30+ particles with rotation and drift
// ============================================================
function initLeaves(count) {
  leaves = [];
  for (let i = 0; i < count; i++) {
    leaves.push(createLeaf(true));
  }
}

function createLeaf(randomY) {
  const leafColors = [
    [220, 100, 30],   // orange
    [200, 50, 35],    // red
    [235, 180, 40],   // yellow
    [160, 80, 25],    // brown
    [240, 140, 30],   // amber
    [180, 40, 30],    // crimson
    [210, 160, 50],   // gold
  ];
  const col = random(leafColors);
  return {
    x: random(0, CW),
    y: randomY ? random(-CH * 0.3, CH) : random(-80, -10),
    size: random(3, 8),
    fallSpeed: random(1, 3),
    driftAmp: random(15, 40),
    driftFreq: random(0.01, 0.03),
    driftPhase: random(TWO_PI),
    rotation: random(TWO_PI),
    rotSpeed: random(-0.06, 0.06),
    color: col,
    alpha: random(200, 255),
  };
}

function drawLeaves() {
  leaves.forEach(lf => {
    // Physics
    const windMul = 0.3 + windFactor * 1.4;
    lf.y += lf.fallSpeed * (0.6 + windFactor * 0.8);
    lf.x += sin(tick * lf.driftFreq + lf.driftPhase) * lf.driftAmp * 0.04 * windMul;
    lf.rotation += lf.rotSpeed * windMul;

    // Wrap
    if (lf.y > CH + 20) {
      lf.y = random(-60, -10);
      lf.x = random(0, CW);
    }
    if (lf.x < -20) lf.x = CW + 10;
    if (lf.x > CW + 20) lf.x = -10;

    // Draw leaf shape
    push();
    translate(lf.x, lf.y);
    rotate(lf.rotation);
    fill(lf.color[0], lf.color[1], lf.color[2], lf.alpha);
    noStroke();
    // Leaf: two overlapping ellipses to make a pointed oval
    ellipse(0, 0, lf.size * 2.2, lf.size);
    // Stem
    stroke(lf.color[0] * 0.6, lf.color[1] * 0.6, lf.color[2] * 0.6, lf.alpha);
    strokeWeight(0.5);
    line(0, 0, lf.size * 1.2, 0);
    noStroke();
    pop();
  });
}

// ============================================================
//  GRASS — swaying blades at the bottom
// ============================================================
function initGrass() {
  grassBlades = [];
  for (let x = 0; x < CW; x += 4) {
    const bladeH = random(12, 28);
    grassBlades.push({
      x: x + random(-2, 2),
      h: bladeH,
      phase: random(TWO_PI),
      freq: random(0.03, 0.06),
      green: random(60, 130),
    });
  }
}

function drawGrass() {
  grassBlades.forEach(g => {
    const baseY = getHillY(g.x);
    if (baseY > CH + 5) return;  // off-screen
    const windSway = sin(tick * g.freq + g.phase) * (3 + windFactor * 8);
    stroke(40, g.green, 20);
    strokeWeight(1.5);
    const tipX = g.x + windSway;
    const tipY = baseY - g.h;
    line(g.x, baseY, tipX, tipY);
  });
  noStroke();
}

// ============================================================
//  STREAM — small winding stream in the valley
// ============================================================
function initStream() {
  streamPoints = [];
  // The stream winds across the lower portion
  for (let x = 0; x <= CW; x += 8) {
    const baseY = CH * 0.78 + sin(x * 0.008) * 18 + noise(x * 0.005) * 20;
    streamPoints.push({ x, y: baseY });
  }
}

function drawStream() {
  // Draw the stream as a series of connected quads with animated shimmer
  const shimmer = sin(tick * 0.05) * 3;
  noStroke();
  for (let i = 0; i < streamPoints.length - 1; i++) {
    const p1 = streamPoints[i];
    const p2 = streamPoints[i + 1];
    const w = 8 + sin((p1.x + tick) * 0.02) * 3;
    const alpha = 140 + sin(tick * 0.04 + i * 0.3) * 30;
    fill(80, 150, 220, alpha);
    beginShape();
    vertex(p1.x, p1.y - w / 2 + shimmer);
    vertex(p2.x, p2.y - w / 2 + shimmer);
    vertex(p2.x, p2.y + w / 2 + shimmer);
    vertex(p1.x, p1.y + w / 2 + shimmer);
    endShape(CLOSE);
  }
  // Sparkle highlights
  fill(200, 230, 255, 80);
  for (let i = 0; i < streamPoints.length; i += 3) {
    const sp = streamPoints[i];
    const sparkleX = sp.x + sin(tick * 0.06 + i) * 4;
    const sparkleY = sp.y + shimmer + cos(tick * 0.08 + i) * 2;
    ellipse(sparkleX, sparkleY, 4 + sin(tick * 0.1 + i) * 2, 2);
  }
}

// ============================================================
//  UI CONTROLS
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
  const btnPlayPause = document.getElementById('btn-play-pause');
  const iconPause = document.getElementById('icon-pause');
  const iconPlay = document.getElementById('icon-play');
  const btnLabel = document.getElementById('btn-label');

  const windSlider = document.getElementById('wind-slider');
  const windValue = document.getElementById('wind-value');
  const leafSlider = document.getElementById('leaf-slider');
  const leafValue = document.getElementById('leaf-value');

  btnPlayPause.addEventListener('click', () => {
    paused = !paused;
    if (paused) {
      iconPause.classList.add('hidden');
      iconPlay.classList.remove('hidden');
      btnLabel.textContent = 'Play';
    } else {
      iconPause.classList.remove('hidden');
      iconPlay.classList.add('hidden');
      btnLabel.textContent = 'Pause';
    }
  });

  windSlider.addEventListener('input', () => {
    windFactor = parseInt(windSlider.value, 10) / 100;
    windValue.textContent = windSlider.value + '%';
  });

  leafSlider.addEventListener('input', () => {
    const newCount = parseInt(leafSlider.value, 10);
    leafValue.textContent = newCount;
    adjustLeafCount(newCount);
  });
});

function adjustLeafCount(target) {
  while (leaves.length < target) {
    leaves.push(createLeaf(true));
  }
  while (leaves.length > target) {
    leaves.pop();
  }
  leafCount = target;
}
