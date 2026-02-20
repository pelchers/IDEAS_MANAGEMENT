/* ============================================================
   SPRING MEADOW — Nature Landscape Pass 2
   GSAP v3.12.5 + MotionPathPlugin | DOM/SVG Rendering
   ============================================================ */

(function () {
  'use strict';

  // Register GSAP plugin
  gsap.registerPlugin(MotionPathPlugin);

  // ---- State ----
  const state = {
    playing: true,
    windIntensity: 0.5,   // 0..1
    isDusk: false,
    timelines: [],         // all running GSAP timelines
  };

  // ---- DOM refs ----
  const scene        = document.getElementById('scene');
  const layerSky     = document.getElementById('layerSky');
  const layerHills   = document.getElementById('layerHills');
  const layerFront   = document.getElementById('layerFront');
  const grassBed     = document.getElementById('grassBed');
  const wildflowers  = document.getElementById('wildflowers');
  const petalsEl     = document.getElementById('petals');

  const btnPlayPause = document.getElementById('btnPlayPause');
  const iconPause    = document.getElementById('iconPause');
  const iconPlay     = document.getElementById('iconPlay');
  const btnLabel     = document.getElementById('btnLabel');
  const windSlider   = document.getElementById('windSlider');
  const windValue    = document.getElementById('windValue');
  const btnDayDusk   = document.getElementById('btnDayDusk');
  const toggleTrack  = document.getElementById('toggleTrack');
  const timeLabel    = document.getElementById('timeLabel');
  const skyGradient  = document.querySelector('.sky-gradient');
  const sun          = document.getElementById('sun');

  // ---- Helpers ----
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Store a timeline for global control
  function track(tl) {
    state.timelines.push(tl);
    return tl;
  }

  // ============================================================
  //  GENERATE DYNAMIC ELEMENTS
  // ============================================================

  // ---- Grass Blades ----
  function generateGrass() {
    const count = 35;
    const sceneW = scene.offsetWidth || 860;
    for (let i = 0; i < count; i++) {
      const blade = document.createElement('div');
      blade.className = 'grass-blade';
      const h = rand(40, 95);
      blade.style.height = h + '%';
      blade.style.left = (i / count * 100) + '%';
      blade.style.width = rand(2, 5) + 'px';
      blade.style.opacity = rand(0.6, 1).toFixed(2);
      const hue = randInt(110, 145);
      const sat = randInt(55, 80);
      const light = randInt(35, 55);
      blade.style.background = `linear-gradient(to top, hsl(${hue},${sat}%,${light - 10}%), hsl(${hue},${sat}%,${light + 15}%))`;
      grassBed.appendChild(blade);
    }
  }

  // ---- Wildflowers ----
  function generateWildflowers() {
    const colors = ['#F9A8D4', '#FDE68A', '#C4B5FD', '#FB923C', '#F87171', '#FBCFE8', '#FEF3C7'];
    const count = 28;
    for (let i = 0; i < count; i++) {
      const wrapper = document.createElement('div');
      wrapper.className = 'wildflower';
      wrapper.style.left = rand(5, 92) + '%';
      wrapper.style.bottom = rand(8, 42) + '%';

      const color = pick(colors);
      const size = rand(4, 10);

      // Simple SVG flower
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', String(size * 3));
      svg.setAttribute('height', String(size * 4));
      svg.setAttribute('viewBox', '0 0 20 30');

      // Stem
      const stem = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      stem.setAttribute('x1', '10');
      stem.setAttribute('y1', '14');
      stem.setAttribute('x2', '10');
      stem.setAttribute('y2', '30');
      stem.setAttribute('stroke', '#16A34A');
      stem.setAttribute('stroke-width', '1.5');
      svg.appendChild(stem);

      // Petals (5 small ellipses around center)
      for (let p = 0; p < 5; p++) {
        const angle = (p / 5) * Math.PI * 2;
        const petal = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        petal.setAttribute('cx', String(10 + Math.cos(angle) * 4));
        petal.setAttribute('cy', String(10 + Math.sin(angle) * 4));
        petal.setAttribute('rx', '3.5');
        petal.setAttribute('ry', '2.5');
        petal.setAttribute('fill', color);
        petal.setAttribute('opacity', '0.85');
        petal.setAttribute('transform', `rotate(${(angle * 180 / Math.PI)}, ${10 + Math.cos(angle) * 4}, ${10 + Math.sin(angle) * 4})`);
        svg.appendChild(petal);
      }

      // Center
      const center = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      center.setAttribute('cx', '10');
      center.setAttribute('cy', '10');
      center.setAttribute('r', '2.5');
      center.setAttribute('fill', '#FDE68A');
      svg.appendChild(center);

      wrapper.appendChild(svg);
      wildflowers.appendChild(wrapper);
    }
  }

  // ---- Drifting Petals ----
  function generatePetals() {
    const colors = ['#F9A8D4', '#FDE68A', '#C4B5FD', '#93C5FD', '#FBCFE8', '#A7F3D0'];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const petal = document.createElement('div');
      petal.className = 'petal';
      petal.style.background = pick(colors);
      petal.style.width = rand(4, 8) + 'px';
      petal.style.height = rand(4, 8) + 'px';
      petal.style.top = rand(-10, 30) + '%';
      petal.style.left = rand(-5, 105) + '%';
      petal.style.opacity = rand(0.4, 0.75).toFixed(2);
      petalsEl.appendChild(petal);
    }
  }

  // ============================================================
  //  ANIMATIONS
  // ============================================================

  // ---- Cloud Drift ----
  function animateClouds() {
    const clouds = [
      { el: '#cloud1', speed: rand(28, 38) },
      { el: '#cloud2', speed: rand(35, 50) },
      { el: '#cloud3', speed: rand(22, 32) },
      { el: '#cloud4', speed: rand(40, 55) },
      { el: '#cloud5', speed: rand(30, 42) },
    ];

    const sceneW = scene.offsetWidth || 860;

    clouds.forEach((c) => {
      const el = document.querySelector(c.el);
      if (!el) return;
      const w = el.getBoundingClientRect().width || 160;

      // Start from random left position
      gsap.set(el, { x: rand(-w, sceneW * 0.3) });

      const tl = gsap.to(el, {
        x: sceneW + w + 50,
        duration: c.speed / state.windIntensity,
        ease: 'none',
        repeat: -1,
        onRepeat: function () {
          gsap.set(el, { x: -w - 20 });
        },
      });

      track(tl);
    });
  }

  // ---- Bird Flocks ----
  function animateBirds() {
    const sceneW = scene.offsetWidth || 860;
    const sceneH = scene.offsetHeight || 550;

    const flocks = ['#birdFlock1', '#birdFlock2'];

    flocks.forEach((sel, idx) => {
      const el = document.querySelector(sel);
      if (!el) return;

      const startY = rand(sceneH * 0.05, sceneH * 0.25);
      const midY = startY + rand(-40, 40);

      const tl = gsap.to(el, {
        motionPath: {
          path: [
            { x: -60, y: startY },
            { x: sceneW * 0.3, y: midY },
            { x: sceneW * 0.6, y: startY + rand(-30, 30) },
            { x: sceneW + 80, y: midY + rand(-20, 20) },
          ],
          curviness: 1.2,
          autoRotate: false,
        },
        duration: rand(14, 22),
        ease: 'none',
        repeat: -1,
        delay: idx * 5,
      });

      track(tl);
    });
  }

  // ---- Grass Sway ----
  function animateGrass() {
    const blades = grassBed.querySelectorAll('.grass-blade');
    if (blades.length === 0) return;

    const baseAmplitude = 12;

    const tl = gsap.to(blades, {
      rotation: () => baseAmplitude * state.windIntensity * rand(0.6, 1.4),
      duration: () => rand(1.5, 2.8),
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      stagger: {
        each: 0.06,
        from: 'center',
      },
    });

    track(tl);

    // Also animate in the other direction for variety
    const tl2 = gsap.to(blades, {
      rotation: () => -baseAmplitude * state.windIntensity * rand(0.3, 0.8),
      duration: () => rand(2.5, 4),
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: 0.5,
      stagger: {
        each: 0.04,
        from: 'edges',
      },
    });

    track(tl2);
  }

  // ---- Wildflower Sway ----
  function animateWildflowers() {
    const flowers = wildflowers.querySelectorAll('.wildflower');
    if (flowers.length === 0) return;

    const tl = gsap.to(flowers, {
      rotation: () => rand(-8, 8) * state.windIntensity,
      x: () => rand(-3, 3) * state.windIntensity,
      duration: () => rand(2, 4),
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      stagger: {
        each: 0.08,
        from: 'random',
      },
    });

    track(tl);
  }

  // ---- Butterfly Motion Paths ----
  function animateButterflies() {
    const sceneW = scene.offsetWidth || 860;
    const sceneH = scene.offsetHeight || 550;

    const butterflies = [
      '#butterfly1', '#butterfly2', '#butterfly3', '#butterfly4', '#butterfly5'
    ];

    butterflies.forEach((sel, idx) => {
      const el = document.querySelector(sel);
      if (!el) return;

      // Wing flap animation
      const leftWing = el.querySelector('.wing--left');
      const rightWing = el.querySelector('.wing--right');

      if (leftWing && rightWing) {
        const flapTl = gsap.timeline({ repeat: -1, yoyo: true });
        const flapSpeed = rand(0.1, 0.2);

        flapTl.to(leftWing, {
          scaleX: 0.3,
          duration: flapSpeed,
          ease: 'sine.inOut',
          transformOrigin: 'right center',
        }, 0);

        flapTl.to(rightWing, {
          scaleX: 0.3,
          duration: flapSpeed,
          ease: 'sine.inOut',
          transformOrigin: 'left center',
        }, 0);

        track(flapTl);
      }

      // Bezier motion path
      const pathPoints = [];
      const numPoints = randInt(5, 8);
      for (let p = 0; p < numPoints; p++) {
        pathPoints.push({
          x: rand(sceneW * 0.05, sceneW * 0.9),
          y: rand(sceneH * 0.15, sceneH * 0.75),
        });
      }
      // Close the loop back to start
      pathPoints.push({ x: pathPoints[0].x, y: pathPoints[0].y });

      const motionTl = gsap.to(el, {
        motionPath: {
          path: pathPoints,
          curviness: 1.5,
          autoRotate: false,
        },
        duration: rand(12, 22) / Math.max(state.windIntensity, 0.3),
        ease: 'none',
        repeat: -1,
        delay: idx * 1.5,
      });

      track(motionTl);
    });
  }

  // ---- Drifting Petals Animation ----
  function animatePetals() {
    const petals = petalsEl.querySelectorAll('.petal');
    const sceneW = scene.offsetWidth || 860;
    const sceneH = scene.offsetHeight || 550;

    petals.forEach((petal) => {
      const startX = rand(-20, sceneW * 0.8);
      const startY = rand(-20, sceneH * 0.3);

      gsap.set(petal, { x: startX, y: startY });

      const drift = gsap.to(petal, {
        x: `+=${rand(100, 300) * state.windIntensity}`,
        y: `+=${rand(200, sceneH)}`,
        rotation: rand(180, 720),
        duration: rand(8, 16),
        ease: 'none',
        repeat: -1,
        onRepeat: function () {
          gsap.set(petal, {
            x: rand(-40, sceneW * 0.5),
            y: rand(-30, -10),
          });
        },
      });

      track(drift);
    });
  }

  // ---- Sun glow animation (GSAP version) ----
  function animateSun() {
    const sunGlow = document.querySelector('.sun-glow');
    if (!sunGlow) return;

    const tl = gsap.to(sunGlow, {
      scale: 1.4,
      opacity: 1,
      duration: 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    track(tl);
  }

  // ============================================================
  //  PARALLAX DEPTH
  // ============================================================

  function setupParallax() {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      // Back layer moves slower, front moves faster
      gsap.set(layerSky, { y: scrollY * 0.05 });
      gsap.set(layerHills, { y: scrollY * 0.15 });
      gsap.set(layerFront, { y: scrollY * 0.3 });
    }, { passive: true });

    // Also do a subtle mouse parallax inside the scene
    scene.addEventListener('mousemove', (e) => {
      const rect = scene.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 to 0.5
      const my = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(layerSky, { x: mx * -8, y: my * -5, duration: 1.2, ease: 'power2.out' });
      gsap.to(layerHills, { x: mx * -15, y: my * -10, duration: 1, ease: 'power2.out' });
      gsap.to(layerFront, { x: mx * -25, y: my * -15, duration: 0.8, ease: 'power2.out' });
    });
  }

  // ============================================================
  //  CONTROLS
  // ============================================================

  // ---- Play / Pause ----
  btnPlayPause.addEventListener('click', () => {
    state.playing = !state.playing;

    if (state.playing) {
      state.timelines.forEach(tl => tl.play());
      iconPause.classList.remove('hidden');
      iconPlay.classList.add('hidden');
      btnLabel.textContent = 'Pause';
    } else {
      state.timelines.forEach(tl => tl.pause());
      iconPause.classList.add('hidden');
      iconPlay.classList.remove('hidden');
      btnLabel.textContent = 'Play';
    }
  });

  // ---- Wind Intensity Slider ----
  windSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    state.windIntensity = val / 100;
    windValue.textContent = val + '%';

    // Adjust grass sway amplitude by changing timeScale
    // Higher wind = faster movement
    const speedFactor = 0.4 + state.windIntensity * 1.6;
    state.timelines.forEach(tl => {
      tl.timeScale(speedFactor);
    });
  });

  // ---- Day / Dusk Toggle ----
  btnDayDusk.addEventListener('click', () => {
    state.isDusk = !state.isDusk;

    if (state.isDusk) {
      skyGradient.classList.add('dusk');
      toggleTrack.classList.add('active');
      timeLabel.textContent = 'Dusk';

      // Shift sun lower and orange
      gsap.to(sun, { top: '35%', right: '25%', duration: 1.5, ease: 'power2.inOut' });
      gsap.to('.sun-core', {
        background: '#FB923C',
        boxShadow: '0 0 30px rgba(251, 146, 60, 0.8)',
        duration: 1.5,
      });

      // Darken hills
      gsap.to('.hill--back', { backgroundColor: '#065F46', duration: 1.5 });
      gsap.to('.hill--mid', { backgroundColor: '#047857', duration: 1.5 });
      gsap.to('.hill--front', { backgroundColor: '#059669', duration: 1.5 });

      // Darken grass
      gsap.to('.grass-blade', { opacity: 0.7, duration: 1.5 });
    } else {
      skyGradient.classList.remove('dusk');
      toggleTrack.classList.remove('active');
      timeLabel.textContent = 'Day';

      gsap.to(sun, { top: '8%', right: '15%', duration: 1.5, ease: 'power2.inOut' });
      gsap.to('.sun-core', {
        background: '#FDE68A',
        boxShadow: '0 0 20px rgba(253, 230, 138, 0.8)',
        duration: 1.5,
      });

      gsap.to('.hill--back', { backgroundColor: '#16A34A', duration: 1.5 });
      gsap.to('.hill--mid', { backgroundColor: '#22C55E', duration: 1.5 });
      gsap.to('.hill--front', { backgroundColor: '#4ADE80', duration: 1.5 });

      gsap.to('.grass-blade', { opacity: 1, duration: 1.5 });
    }
  });

  // ============================================================
  //  INIT
  // ============================================================

  function init() {
    // Generate dynamic elements
    generateGrass();
    generateWildflowers();
    generatePetals();

    // Kick off animations
    animateClouds();
    animateBirds();
    animateGrass();
    animateWildflowers();
    animateButterflies();
    animatePetals();
    animateSun();

    // Setup parallax
    setupParallax();
  }

  // Wait for DOM + fonts
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
