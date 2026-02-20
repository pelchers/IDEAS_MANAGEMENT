// ============================================================
//  3D Globe — Pass 1  |  IDEA-MANAGEMENT Graphic Design Concept
//  Three.js v0.170.0 ES Module
// ============================================================

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ---------- Constants & Palette ----------
const PALETTE = {
  primary: 0x3b82f6,
  secondary: 0x10b981,
  bg: 0x030712,
  surface: 0x111827,
  text: 0xf9fafb,
};

const GLOBE_RADIUS = 200;
const CITY_DOT_RADIUS = 2.8;
const ARC_SEGMENTS = 64;
const STAR_COUNT = 2000;
const AUTO_ROTATE_SPEED = 0.001;

// ---------- City Data ----------
const CITIES = [
  { name: "San Francisco", lat: 37.77, lng: -122.42, users: 450 },
  { name: "New York", lat: 40.71, lng: -74.01, users: 380 },
  { name: "London", lat: 51.51, lng: -0.13, users: 320 },
  { name: "Tokyo", lat: 35.68, lng: 139.69, users: 290 },
  { name: "Berlin", lat: 52.52, lng: 13.41, users: 185 },
  { name: "Sydney", lat: -33.87, lng: 151.21, users: 165 },
  { name: "São Paulo", lat: -23.55, lng: -46.63, users: 145 },
  { name: "Mumbai", lat: 19.08, lng: 72.88, users: 210 },
  { name: "Toronto", lat: 43.65, lng: -79.38, users: 175 },
  { name: "Singapore", lat: 1.35, lng: 103.82, users: 155 },
  { name: "Paris", lat: 48.86, lng: 2.35, users: 230 },
  { name: "Seoul", lat: 37.57, lng: 127.0, users: 195 },
  { name: "Lagos", lat: 6.52, lng: 3.38, users: 88 },
  { name: "Dubai", lat: 25.2, lng: 55.27, users: 120 },
  { name: "Mexico City", lat: 19.43, lng: -99.13, users: 105 },
];

// ---------- Connection pairs (indices into CITIES) ----------
const ALL_CONNECTIONS = [
  [0, 1],   // SF — NY
  [0, 3],   // SF — Tokyo
  [1, 2],   // NY — London
  [1, 6],   // NY — São Paulo
  [2, 4],   // London — Berlin
  [2, 10],  // London — Paris
  [2, 7],   // London — Mumbai
  [3, 11],  // Tokyo — Seoul
  [3, 9],   // Tokyo — Singapore
  [4, 10],  // Berlin — Paris
  [5, 9],   // Sydney — Singapore
  [5, 3],   // Sydney — Tokyo
  [6, 14],  // São Paulo — Mexico City
  [7, 13],  // Mumbai — Dubai
  [7, 9],   // Mumbai — Singapore
  [8, 1],   // Toronto — NY
  [8, 0],   // Toronto — SF
  [9, 13],  // Singapore — Dubai
  [10, 12], // Paris — Lagos
  [11, 7],  // Seoul — Mumbai
  [12, 13], // Lagos — Dubai
  [13, 2],  // Dubai — London
  [14, 0],  // Mexico City — SF
  [1, 10],  // NY — Paris
  [0, 5],   // SF — Sydney
];

// ---------- DOM refs ----------
const canvas = document.getElementById("globe-canvas");
const tooltipEl = document.getElementById("tooltip");
const loadingEl = document.getElementById("loading");
const autoRotateBtn = document.getElementById("auto-rotate-toggle");
const densitySlider = document.getElementById("density-slider");
const densityValue = document.getElementById("density-value");
const resetBtn = document.getElementById("camera-reset");

// ---------- State ----------
let autoRotate = true;
let density = 0.7;
let hoveredCity = null;

// ============================================================
//  Scene, Camera, Renderer
// ============================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(PALETTE.bg);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  1,
  5000
);
camera.position.set(0, 80, 520);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(canvas.clientWidth, canvas.clientHeight);

// ---------- OrbitControls ----------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.rotateSpeed = 0.5;
controls.minDistance = 280;
controls.maxDistance = 900;
controls.enablePan = false;

const DEFAULT_CAM = camera.position.clone();
const DEFAULT_TARGET = controls.target.clone();

// ============================================================
//  Lights
// ============================================================
const ambientLight = new THREE.AmbientLight(0x8899cc, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xaabbff, 0.6);
directionalLight.position.set(200, 300, 400);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(PALETTE.primary, 0.8, 1200);
pointLight.position.set(-200, 150, 300);
scene.add(pointLight);

// ============================================================
//  Star Field
// ============================================================
function createStarField() {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(STAR_COUNT * 3);
  const sizes = new Float32Array(STAR_COUNT);

  for (let i = 0; i < STAR_COUNT; i++) {
    const r = 1400 + Math.random() * 600;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    sizes[i] = 0.5 + Math.random() * 1.5;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.2,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.7,
  });

  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
}

// ============================================================
//  Globe (Wireframe Sphere)
// ============================================================
const globeGroup = new THREE.Group();
scene.add(globeGroup);

function createGlobe() {
  // Main wireframe sphere
  const geo = new THREE.SphereGeometry(GLOBE_RADIUS, 48, 32);
  const mat = new THREE.MeshBasicMaterial({
    color: PALETTE.primary,
    wireframe: true,
    transparent: true,
    opacity: 0.08,
  });
  const sphere = new THREE.Mesh(geo, mat);
  globeGroup.add(sphere);

  // Slightly larger glow shell
  const glowGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.005, 48, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: PALETTE.primary,
    wireframe: true,
    transparent: true,
    opacity: 0.03,
  });
  const glowShell = new THREE.Mesh(glowGeo, glowMat);
  globeGroup.add(glowShell);

  // Equator ring
  const ringGeo = new THREE.RingGeometry(GLOBE_RADIUS + 1, GLOBE_RADIUS + 1.5, 128);
  const ringMat = new THREE.MeshBasicMaterial({
    color: PALETTE.primary,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  globeGroup.add(ring);

  // Latitude lines at 30-degree intervals
  const latitudes = [-60, -30, 30, 60];
  latitudes.forEach((lat) => {
    const r = GLOBE_RADIUS * Math.cos((lat * Math.PI) / 180);
    const y = GLOBE_RADIUS * Math.sin((lat * Math.PI) / 180);
    const latRingGeo = new THREE.RingGeometry(r, r + 0.5, 96);
    const latRingMat = new THREE.MeshBasicMaterial({
      color: PALETTE.primary,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
    });
    const latRing = new THREE.Mesh(latRingGeo, latRingMat);
    latRing.rotation.x = Math.PI / 2;
    latRing.position.y = y;
    globeGroup.add(latRing);
  });
}

// ============================================================
//  Lat/Lng to 3D Cartesian
// ============================================================
function latLngToVec3(lat, lng, radius = GLOBE_RADIUS) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

// ============================================================
//  City Dots
// ============================================================
const cityMeshes = [];
const cityDataMap = new Map();

function createCityDots() {
  CITIES.forEach((city, idx) => {
    const pos = latLngToVec3(city.lat, city.lng, GLOBE_RADIUS + 1);

    // Outer glow sphere
    const glowGeo = new THREE.SphereGeometry(CITY_DOT_RADIUS * 2.4, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: PALETTE.primary,
      transparent: true,
      opacity: 0.12,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.copy(pos);
    globeGroup.add(glow);

    // Core dot
    const dotGeo = new THREE.SphereGeometry(CITY_DOT_RADIUS, 16, 16);
    const dotMat = new THREE.MeshBasicMaterial({
      color: PALETTE.primary,
      transparent: true,
      opacity: 0.9,
    });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.copy(pos);
    dot.userData = { cityIndex: idx, glow, baseDotOpacity: 0.9 };
    globeGroup.add(dot);

    cityMeshes.push(dot);
    cityDataMap.set(dot, city);
  });
}

// ============================================================
//  Connection Arcs
// ============================================================
const arcGroup = new THREE.Group();
globeGroup.add(arcGroup);

let arcLines = [];

function buildArcCurve(cityA, cityB) {
  const start = latLngToVec3(cityA.lat, cityA.lng, GLOBE_RADIUS + 2);
  const end = latLngToVec3(cityB.lat, cityB.lng, GLOBE_RADIUS + 2);

  // Mid-point lifted above the surface
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const dist = start.distanceTo(end);
  const altitude = GLOBE_RADIUS + 2 + dist * 0.35;
  mid.normalize().multiplyScalar(altitude);

  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  return curve;
}

function createArcs() {
  // Clear existing arcs
  arcGroup.clear();
  arcLines = [];

  const count = Math.max(1, Math.round(ALL_CONNECTIONS.length * density));
  const connections = ALL_CONNECTIONS.slice(0, count);

  connections.forEach((pair, idx) => {
    const cityA = CITIES[pair[0]];
    const cityB = CITIES[pair[1]];
    const curve = buildArcCurve(cityA, cityB);
    const points = curve.getPoints(ARC_SEGMENTS);

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Animated dash material
    const material = new THREE.LineDashedMaterial({
      color: PALETTE.secondary,
      transparent: true,
      opacity: 0.45,
      dashSize: 6,
      gapSize: 4,
      linewidth: 1,
    });

    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    line.userData = { dashOffset: Math.random() * 20, speed: 0.03 + Math.random() * 0.04 };
    arcGroup.add(line);
    arcLines.push(line);
  });
}

// ============================================================
//  Atmosphere Glow (Post-processing feel via sprite)
// ============================================================
function createAtmosphere() {
  // Create a circular glow sprite behind the globe
  const spriteMat = new THREE.SpriteMaterial({
    color: PALETTE.primary,
    transparent: true,
    opacity: 0.06,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(GLOBE_RADIUS * 3.2, GLOBE_RADIUS * 3.2, 1);
  scene.add(sprite);
}

// ============================================================
//  Raycasting (Hover Detection)
// ============================================================
const raycaster = new THREE.Raycaster();
raycaster.params.Points = { threshold: 5 };
const mouse = new THREE.Vector2(-999, -999);

function onPointerMove(e) {
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

function checkHover() {
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(cityMeshes, false);

  if (hits.length > 0) {
    const mesh = hits[0].object;
    const city = cityDataMap.get(mesh);
    if (city && hoveredCity !== mesh) {
      // Reset previous
      if (hoveredCity) resetHover(hoveredCity);
      hoveredCity = mesh;
      highlightCity(mesh);
    }
    updateTooltipPosition(hits[0].point, city);
  } else {
    if (hoveredCity) {
      resetHover(hoveredCity);
      hoveredCity = null;
    }
    tooltipEl.classList.remove("visible");
  }
}

function highlightCity(mesh) {
  mesh.material.opacity = 1;
  mesh.material.color.set(0xffffff);
  mesh.scale.setScalar(1.6);

  const glow = mesh.userData.glow;
  if (glow) {
    glow.material.opacity = 0.35;
    glow.scale.setScalar(1.8);
  }

  canvas.style.cursor = "pointer";
}

function resetHover(mesh) {
  mesh.material.opacity = mesh.userData.baseDotOpacity;
  mesh.material.color.set(PALETTE.primary);
  mesh.scale.setScalar(1);

  const glow = mesh.userData.glow;
  if (glow) {
    glow.material.opacity = 0.12;
    glow.scale.setScalar(1);
  }

  canvas.style.cursor = "grab";
}

function updateTooltipPosition(worldPos, city) {
  if (!city) return;

  // Project 3D to 2D screen coordinates
  const projected = worldPos.clone().project(camera);
  const rect = canvas.getBoundingClientRect();
  const x = ((projected.x + 1) / 2) * rect.width + rect.left;
  const y = ((-projected.y + 1) / 2) * rect.height + rect.top;

  tooltipEl.style.left = `${x}px`;
  tooltipEl.style.top = `${y}px`;
  tooltipEl.innerHTML = `
    <div class="tt-city">${city.name}</div>
    <div class="tt-users"><strong>${city.users.toLocaleString()}</strong> active users</div>
  `;
  tooltipEl.classList.add("visible");
}

// ============================================================
//  Pulse Animation (City Dots)
// ============================================================
function pulseCities(time) {
  cityMeshes.forEach((mesh, i) => {
    if (mesh === hoveredCity) return;
    const phase = time * 0.002 + i * 0.7;
    const pulse = 0.7 + 0.3 * Math.sin(phase);
    mesh.material.opacity = pulse * mesh.userData.baseDotOpacity;

    const glow = mesh.userData.glow;
    if (glow) {
      glow.material.opacity = 0.06 + 0.08 * Math.sin(phase);
    }
  });
}

// ============================================================
//  Animate Arc Dashes
// ============================================================
function animateArcs() {
  arcLines.forEach((line) => {
    line.userData.dashOffset += line.userData.speed;
    line.material.dashSize = 6;
    line.material.gapSize = 4;
    // Simulate dash animation by recomputing line distances with offset
    // Three.js LineDashedMaterial doesn't natively support dashOffset,
    // so we shift the geometry slightly for the visual effect.
    // Instead, we animate opacity for a flowing feel.
    const t = performance.now() * 0.001;
    const flicker = 0.3 + 0.2 * Math.sin(t * 1.5 + line.userData.dashOffset);
    line.material.opacity = flicker;
  });
}

// ============================================================
//  Controls UI
// ============================================================
autoRotateBtn.addEventListener("click", () => {
  autoRotate = !autoRotate;
  autoRotateBtn.textContent = autoRotate ? "ON" : "OFF";
  autoRotateBtn.classList.toggle("active", autoRotate);
});

densitySlider.addEventListener("input", (e) => {
  density = parseInt(e.target.value) / 100;
  densityValue.textContent = `${e.target.value}%`;
  createArcs();
});

resetBtn.addEventListener("click", () => {
  camera.position.copy(DEFAULT_CAM);
  controls.target.copy(DEFAULT_TARGET);
  controls.update();
});

// ============================================================
//  Resize Handler
// ============================================================
function onResize() {
  const container = document.getElementById("showcase");
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

window.addEventListener("resize", onResize);
window.addEventListener("pointermove", onPointerMove);

// ============================================================
//  Initialize Scene
// ============================================================
createStarField();
createGlobe();
createCityDots();
createArcs();
createAtmosphere();

// Dismiss loading
requestAnimationFrame(() => {
  loadingEl.classList.add("hidden");
  setTimeout(() => loadingEl.remove(), 800);
});

// Initial sizing
onResize();

// ============================================================
//  Render Loop
// ============================================================
function animate(time) {
  requestAnimationFrame(animate);

  // Auto-rotate
  if (autoRotate) {
    globeGroup.rotation.y += AUTO_ROTATE_SPEED;
  }

  // Animate city pulses
  pulseCities(time);

  // Animate arcs
  animateArcs();

  // Hover detection
  checkHover();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);
}

animate(0);
