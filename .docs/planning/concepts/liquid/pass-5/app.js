/* ============================================================
   VOIDFREQUENCY — Liquid Motion Pass 5
   Neon Plasma Electric / Electronic Music Label
   App Logic, Navigation, Interactions, and Animations
   ============================================================ */

(function () {
  'use strict';

  // --- CONSTANTS ---
  const ACCENT = '#00e5ff';
  const ACCENT2 = '#ff00aa';
  const BG = '#0c0820';
  const TEXT_COLOR = '#e0e8ff';

  // --- DOM REFERENCES ---
  const navTabs = document.querySelectorAll('.nav-tab');
  const views = document.querySelectorAll('.view');
  const navShell = document.getElementById('nav-shell');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const glitchOverlay = document.getElementById('glitch-overlay');
  const dropFlash = document.getElementById('drop-flash');
  const loadingOverlay = document.getElementById('loading-overlay');
  const holoTooltip = document.getElementById('holo-tooltip');
  const plasmaBg = document.getElementById('plasma-bg');

  // --- LOADING SEQUENCE ---
  window.addEventListener('load', function () {
    setTimeout(function () {
      loadingOverlay.classList.add('hidden');
      setTimeout(function () {
        loadingOverlay.style.display = 'none';
        initScrollReveal();
      }, 600);
    }, 1200);
  });

  // --- AMBIENT PLASMA BACKGROUND CANVAS ---
  function initPlasmaCanvas() {
    const canvas = plasmaBg;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let time = 0;
    const blobs = [];

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    // Create some plasma blobs
    for (let i = 0; i < 5; i++) {
      blobs.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.002,
        vy: (Math.random() - 0.5) * 0.002,
        radius: 150 + Math.random() * 200,
        color: i % 2 === 0 ? ACCENT : ACCENT2
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      time += 0.005;

      blobs.forEach(function (blob) {
        blob.x += blob.vx + Math.sin(time * 2 + blob.radius) * 0.001;
        blob.y += blob.vy + Math.cos(time * 1.5 + blob.radius) * 0.001;

        if (blob.x < -0.2 || blob.x > 1.2) blob.vx *= -1;
        if (blob.y < -0.2 || blob.y > 1.2) blob.vy *= -1;

        var grad = ctx.createRadialGradient(
          blob.x * width, blob.y * height, 0,
          blob.x * width, blob.y * height, blob.radius
        );
        grad.addColorStop(0, blob.color + '30');
        grad.addColorStop(0.5, blob.color + '10');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      });

      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    draw();
  }

  initPlasmaCanvas();

  // --- NAVIGATION ---
  function switchView(targetId) {
    var currentActive = document.querySelector('.view.active');
    if (currentActive && currentActive.id === 'view-' + targetId) return;

    // Glitch transition
    glitchOverlay.classList.add('active');

    setTimeout(function () {
      views.forEach(function (v) {
        v.classList.remove('active');
      });
      navTabs.forEach(function (t) {
        t.classList.remove('active');
      });

      var target = document.getElementById('view-' + targetId);
      if (target) {
        target.classList.add('active');
        // Re-trigger scroll reveals in the new view
        var reveals = target.querySelectorAll('[data-reveal]');
        reveals.forEach(function (el) {
          el.classList.remove('revealed');
          el.classList.remove('revealing');
        });
        setTimeout(function () {
          revealElements(reveals);
        }, 100);
      }

      var activeTab = document.querySelector('[data-view="' + targetId + '"]');
      if (activeTab) activeTab.classList.add('active');

      // Close mobile menu
      if (window.innerWidth <= 768) {
        navShell.classList.remove('mobile-open');
        mobileMenuBtn.classList.remove('active');
      }
    }, 200);

    setTimeout(function () {
      glitchOverlay.classList.remove('active');
    }, 350);
  }

  navTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var viewId = this.getAttribute('data-view');
      switchView(viewId);
      triggerDropFlash();
    });
  });

  // --- MOBILE MENU ---
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function () {
      navShell.classList.toggle('mobile-open');
      this.classList.toggle('active');
    });
  }

  // --- HOLOGRAM TOOLTIP ---
  navTabs.forEach(function (tab) {
    tab.addEventListener('mouseenter', function (e) {
      var text = this.getAttribute('data-tooltip');
      if (!text || window.innerWidth <= 768) return;
      var holoText = holoTooltip.querySelector('.holo-text');
      holoText.textContent = text;
      holoTooltip.classList.add('visible');
      positionTooltip(e);
    });

    tab.addEventListener('mousemove', function (e) {
      if (holoTooltip.classList.contains('visible')) {
        positionTooltip(e);
      }
    });

    tab.addEventListener('mouseleave', function () {
      holoTooltip.classList.remove('visible');
    });
  });

  function positionTooltip(e) {
    var x = e.clientX + 12;
    var y = e.clientY + 20;
    if (x + 180 > window.innerWidth) x = e.clientX - 180;
    holoTooltip.style.left = x + 'px';
    holoTooltip.style.top = y + 'px';
  }

  // --- BUTTON INTERACTIONS ---
  // Plasma tendril hover + bass-drop click
  document.querySelectorAll('.plasma-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      this.classList.add('clicked');
      setTimeout(function () {
        btn.classList.remove('clicked');
      }, 400);
    });
  });

  // --- DROP FLASH MICRO FEEDBACK ---
  function triggerDropFlash() {
    dropFlash.classList.add('active');
    setTimeout(function () {
      dropFlash.classList.remove('active');
    }, 600);
  }

  // --- POWER SURGE TOGGLE ---
  document.querySelectorAll('.power-toggle').forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      this.classList.toggle('active');
      this.classList.add('surge');
      var stateEl = this.querySelector('.toggle-state');
      if (stateEl) {
        stateEl.textContent = this.classList.contains('active') ? 'ON' : 'OFF';
      }
      var self = this;
      setTimeout(function () {
        self.classList.remove('surge');
      }, 400);
    });
  });

  // --- SCROLL REVEAL (Frequency Sweep Materialize) ---
  function initScrollReveal() {
    var activeView = document.querySelector('.view.active');
    if (!activeView) return;
    var elements = activeView.querySelectorAll('[data-reveal]');
    revealElements(elements);
  }

  function revealElements(elements) {
    elements.forEach(function (el, i) {
      setTimeout(function () {
        el.classList.add('revealing');
        setTimeout(function () {
          el.classList.remove('revealing');
          el.classList.add('revealed');
        }, 400);
      }, i * 80);
    });
  }

  // --- WAVEFORM CANVAS DRAWING ---
  function drawWaveform(canvas, color, speed, amplitude) {
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;
    var phase = Math.random() * Math.PI * 2;

    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;

      for (var x = 0; x < w; x++) {
        var y = h / 2 +
          Math.sin((x / w) * Math.PI * 4 + phase) * amplitude * 0.5 +
          Math.sin((x / w) * Math.PI * 8 + phase * 1.3) * amplitude * 0.25 +
          Math.sin((x / w) * Math.PI * 16 + phase * 0.7) * amplitude * 0.12;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Add glow
      ctx.strokeStyle = color + '40';
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (var x2 = 0; x2 < w; x2++) {
        var y2 = h / 2 +
          Math.sin((x2 / w) * Math.PI * 4 + phase) * amplitude * 0.5 +
          Math.sin((x2 / w) * Math.PI * 8 + phase * 1.3) * amplitude * 0.25 +
          Math.sin((x2 / w) * Math.PI * 16 + phase * 0.7) * amplitude * 0.12;
        if (x2 === 0) ctx.moveTo(x2, y2);
        else ctx.lineTo(x2, y2);
      }
      ctx.stroke();

      phase += speed;
      requestAnimationFrame(draw);
    }
    draw();
  }

  // Draw all metric card waveforms
  document.querySelectorAll('.wave-canvas').forEach(function (c, i) {
    drawWaveform(c, i % 2 === 0 ? ACCENT : ACCENT2, 0.03, 20);
  });

  // Mini waveforms for releases
  document.querySelectorAll('.mini-wave').forEach(function (c) {
    drawWaveform(c, ACCENT, 0.02, 12);
  });

  // Kanban card waveforms
  document.querySelectorAll('.card-wave-canvas').forEach(function (c, i) {
    drawWaveform(c, i % 2 === 0 ? ACCENT : ACCENT2, 0.015, 8);
  });

  // Vinyl sleeve waveforms
  document.querySelectorAll('.sleeve-wave-canvas').forEach(function (c, i) {
    drawWaveform(c, i % 2 === 0 ? ACCENT : ACCENT2, 0.01, 16);
  });

  // Chat memo waveforms
  document.querySelectorAll('.memo-wave-canvas').forEach(function (c, i) {
    var isUser = c.closest('.user-memo');
    drawWaveform(c, isUser ? ACCENT2 : ACCENT, 0.02, 10);
  });

  // Preview waveform
  var previewCanvas = document.getElementById('preview-wave-canvas');
  if (previewCanvas) {
    drawWaveform(previewCanvas, ACCENT, 0.015, 25);
  }

  // --- SPECTRUM CHART (Dashboard) ---
  function drawSpectrumChart() {
    var canvas = document.getElementById('spectrum-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;
    var bars = 64;
    var barWidth = (w - bars * 2) / bars;
    var phase = 0;

    function draw() {
      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < bars; i++) {
        var val = (Math.sin(phase + i * 0.15) * 0.5 + 0.5) *
                  (Math.sin(phase * 0.7 + i * 0.08) * 0.3 + 0.7);
        var barH = val * h * 0.85;
        var x = i * (barWidth + 2);

        var grad = ctx.createLinearGradient(x, h, x, h - barH);
        grad.addColorStop(0, ACCENT);
        grad.addColorStop(0.6, ACCENT + 'AA');
        grad.addColorStop(1, ACCENT2);

        ctx.fillStyle = grad;
        ctx.fillRect(x, h - barH, barWidth, barH);

        // Glow top
        ctx.fillStyle = '#fff';
        ctx.fillRect(x, h - barH, barWidth, 2);
      }

      phase += 0.02;
      requestAnimationFrame(draw);
    }
    draw();
  }

  drawSpectrumChart();

  // --- CARD HOVER WAVEFORM BORDER ---
  document.querySelectorAll('.kanban-card, .metric-card, .vinyl-record, .release-track').forEach(function (card) {
    card.addEventListener('mouseenter', function (e) {
      this.style.transition = 'all 0.3s ease';
    });

    card.addEventListener('mousemove', function (e) {
      var rect = this.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width;
      var intensity = 0.15 + x * 0.2;
      this.style.boxShadow = '0 0 ' + (15 + x * 20) + 'px rgba(0, 229, 255, ' + intensity + ')';
    });

    card.addEventListener('mouseleave', function () {
      this.style.boxShadow = '';
    });
  });

  // --- DIRECTORY TREE TOGGLE ---
  document.querySelectorAll('.tree-item.folder').forEach(function (folder) {
    folder.addEventListener('click', function (e) {
      e.stopPropagation();
      var children = this.nextElementSibling;
      if (children && children.classList.contains('tree-children')) {
        var isOpen = this.classList.contains('open');
        this.classList.toggle('open');
        var toggle = this.querySelector('.tree-toggle');
        if (toggle) toggle.textContent = isOpen ? '▸' : '▾';
        children.style.display = isOpen ? 'none' : 'block';
      }
    });
  });

  // --- COLOR SWATCH SELECTION ---
  document.querySelectorAll('.swatch').forEach(function (swatch) {
    swatch.addEventListener('click', function () {
      document.querySelectorAll('.swatch').forEach(function (s) {
        s.classList.remove('active');
      });
      this.classList.add('active');
    });
  });

  // --- GSAP ANIMATIONS (if loaded) ---
  function initGSAPAnimations() {
    if (typeof gsap === 'undefined') return;

    // Register ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Subtle parallax on the main content panels
    gsap.utils.toArray('.metric-card').forEach(function (card, i) {
      gsap.from(card, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        delay: i * 0.1,
        ease: 'power2.out'
      });
    });

    // Cable lines animation
    gsap.utils.toArray('.cable-line').forEach(function (line) {
      var length = line.getTotalLength ? line.getTotalLength() : 300;
      gsap.set(line, {
        strokeDasharray: length,
        strokeDashoffset: length
      });
      gsap.to(line, {
        strokeDashoffset: 0,
        duration: 2,
        ease: 'power1.inOut',
        delay: Math.random() * 0.5
      });
    });

    // Signal flow lines
    gsap.utils.toArray('.signal-line').forEach(function (line) {
      gsap.to(line, {
        opacity: 0.3,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random()
      });
    });
  }

  // Run GSAP init after a short delay to ensure loading is done
  setTimeout(initGSAPAnimations, 1500);

  // --- KEYBOARD NAV ---
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      navShell.classList.remove('mobile-open');
      mobileMenuBtn.classList.remove('active');
    }
  });

  // --- SEND BUTTON / ENTER KEY IN CHAT ---
  var chatInput = document.querySelector('.chat-text-input');
  var sendBtn = document.querySelector('.send-btn');

  if (sendBtn && chatInput) {
    sendBtn.addEventListener('click', function () {
      if (chatInput.value.trim()) {
        triggerDropFlash();
        chatInput.value = '';
      }
    });

    chatInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter' && this.value.trim()) {
        triggerDropFlash();
        this.value = '';
      }
    });
  }

  // --- ACCESSIBILITY: Reduced Motion ---
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) {
    document.querySelectorAll('.turntable, .vinyl-label').forEach(function (el) {
      el.style.animation = 'none';
    });
    document.querySelectorAll('.eq-bar, .eq-indicator i').forEach(function (el) {
      el.style.animation = 'none';
    });
  }

  // --- INITIAL STATE: Nav fixed on mobile ---
  function handleResize() {
    if (window.innerWidth > 768) {
      navShell.classList.remove('mobile-open');
      mobileMenuBtn.classList.remove('active');
      navShell.style.transform = '';
    }
  }

  window.addEventListener('resize', handleResize);

})();
