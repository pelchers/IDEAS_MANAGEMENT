/* ===================================================================
   GIRARD GALLERY — app.js
   Mid-Century Modern Pass 3 — Alexander Girard textile collage

   Navigation: hash-based with data-view / data-page
   Libraries:  GSAP + Flip, Tippy.js, SortableJS
   =================================================================== */

(function () {
  'use strict';

  /* ── CONSTANTS ─────────────────────────────────────────────────── */
  const ACCENT_COLORS = ['#e05a4f', '#6b8e23', '#d4a843', '#2a9d8f'];
  const VIEWS = [
    'dashboard', 'projects', 'project-workspace', 'kanban',
    'whiteboard', 'schema-planner', 'directory-tree', 'ideas',
    'ai-chat', 'settings'
  ];

  /* ── DOM REFS ──────────────────────────────────────────────────── */
  const navItems    = document.querySelectorAll('.pill-nav__item');
  const pages       = document.querySelectorAll('.card-page');
  const hamburger   = document.getElementById('hamburgerBtn');
  const navTrack    = document.getElementById('navTrack');
  const overlay     = document.getElementById('loadingOverlay');
  const microEl     = document.getElementById('microFeedback');
  const confettiCvs = document.getElementById('confettiCanvas');

  /* ── LOADING OVERLAY ───────────────────────────────────────────── */
  function hideLoading() {
    overlay.classList.add('hidden');
  }
  window.addEventListener('load', function () {
    setTimeout(hideLoading, 1200);
  });

  /* ── HASH-BASED NAVIGATION ─────────────────────────────────────── */
  let currentView = null;
  let isTransitioning = false;

  function getViewFromHash() {
    const h = window.location.hash.replace('#', '');
    return VIEWS.includes(h) ? h : 'dashboard';
  }

  function navigateTo(viewName, pushState) {
    if (isTransitioning || viewName === currentView) return;
    isTransitioning = true;

    const oldPage = currentView ? document.querySelector(`[data-page="${currentView}"]`) : null;
    const newPage = document.querySelector(`[data-page="${viewName}"]`);
    if (!newPage) { isTransitioning = false; return; }

    // Update nav active state
    navItems.forEach(function (btn) {
      btn.classList.toggle('pill-nav__item--active', btn.getAttribute('data-view') === viewName);
    });

    // Close mobile menu
    navTrack.classList.remove('open');
    hamburger.classList.remove('open');

    // pageTransition: collage-shuffle
    if (oldPage) {
      oldPage.classList.add('exiting');
      oldPage.classList.remove('entering');
      setTimeout(function () {
        oldPage.classList.remove('active', 'exiting');
        showNewPage(newPage, viewName, pushState);
      }, 350);
    } else {
      showNewPage(newPage, viewName, pushState);
    }
  }

  function showNewPage(page, viewName, pushState) {
    page.classList.add('active', 'entering');
    currentView = viewName;
    isTransitioning = false;

    if (pushState !== false) {
      window.location.hash = viewName;
    }

    // Trigger scroll reveals for new page
    requestAnimationFrame(function () {
      triggerReveals(page);
    });

    // Re-init SortableJS on kanban if needed
    if (viewName === 'kanban') initSortable();
  }

  // Listen for nav clicks
  navItems.forEach(function (btn) {
    btn.addEventListener('click', function () {
      navigateTo(btn.getAttribute('data-view'));
    });
  });

  // Listen for hash changes (back/forward)
  window.addEventListener('hashchange', function () {
    navigateTo(getViewFromHash(), false);
  });

  // Hamburger toggle
  hamburger.addEventListener('click', function () {
    hamburger.classList.toggle('open');
    navTrack.classList.toggle('open');
  });

  /* ── SCROLL REVEAL (stagger-scale-rotate) ──────────────────────── */
  function triggerReveals(container) {
    const items = container.querySelectorAll('.reveal-item:not(.revealed)');
    items.forEach(function (item, i) {
      // Assign random rotation for the reveal
      const rot = (Math.random() - 0.5) * 4;
      item.style.setProperty('--reveal-rot', rot + 'deg');
      setTimeout(function () {
        item.classList.add('revealed');
      }, 80 * i);
    });
  }

  /* ── BUTTON INTERACTIONS ───────────────────────────────────────── */

  // buttonClick: confetti-burst-micro
  const confettiCtx = confettiCvs.getContext('2d');
  let confettiParticles = [];
  let confettiAnimating = false;

  function resizeConfettiCanvas() {
    confettiCvs.width = window.innerWidth;
    confettiCvs.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeConfettiCanvas);
  resizeConfettiCanvas();

  function spawnConfetti(x, y) {
    const shapes = ['triangle', 'circle', 'diamond', 'square'];
    for (let i = 0; i < 12; i++) {
      confettiParticles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 3,
        size: 4 + Math.random() * 6,
        color: ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        life: 1.0,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.3
      });
    }
    if (!confettiAnimating) animateConfetti();
  }

  function animateConfetti() {
    confettiAnimating = true;
    confettiCtx.clearRect(0, 0, confettiCvs.width, confettiCvs.height);

    confettiParticles = confettiParticles.filter(function (p) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.life -= 0.02;
      p.rotation += p.rotSpeed;

      if (p.life <= 0) return false;

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate(p.rotation);
      confettiCtx.globalAlpha = p.life;
      confettiCtx.fillStyle = p.color;

      switch (p.shape) {
        case 'triangle':
          confettiCtx.beginPath();
          confettiCtx.moveTo(0, -p.size);
          confettiCtx.lineTo(p.size * 0.87, p.size * 0.5);
          confettiCtx.lineTo(-p.size * 0.87, p.size * 0.5);
          confettiCtx.closePath();
          confettiCtx.fill();
          break;
        case 'circle':
          confettiCtx.beginPath();
          confettiCtx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
          confettiCtx.fill();
          break;
        case 'diamond':
          confettiCtx.beginPath();
          confettiCtx.moveTo(0, -p.size);
          confettiCtx.lineTo(p.size * 0.6, 0);
          confettiCtx.lineTo(0, p.size);
          confettiCtx.lineTo(-p.size * 0.6, 0);
          confettiCtx.closePath();
          confettiCtx.fill();
          break;
        default:
          confettiCtx.fillRect(-p.size * 0.5, -p.size * 0.5, p.size, p.size);
      }

      confettiCtx.restore();
      return true;
    });

    if (confettiParticles.length > 0) {
      requestAnimationFrame(animateConfetti);
    } else {
      confettiAnimating = false;
      confettiCtx.clearRect(0, 0, confettiCvs.width, confettiCvs.height);
    }
  }

  // Wire up all buttons
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    // Click animation
    btn.classList.add('clicking');
    setTimeout(function () {
      btn.classList.remove('clicking');
      btn.classList.add('clicked');
      setTimeout(function () { btn.classList.remove('clicked'); }, 300);
    }, 100);

    // Confetti burst
    const rect = btn.getBoundingClientRect();
    spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);

    // Micro feedback for action buttons
    if (btn.hasAttribute('data-action') && btn.getAttribute('data-action') === 'micro-feedback') {
      showMicroFeedback();
    }
  });

  /* ── MICRO FEEDBACK (shape-pop-success) ────────────────────────── */
  function showMicroFeedback() {
    microEl.classList.add('active');
    setTimeout(function () {
      microEl.classList.remove('active');
      microEl.classList.add('dissolving');
      setTimeout(function () {
        microEl.classList.remove('dissolving');
      }, 400);
    }, 500);
  }

  /* ── CARD HOVER: BORDER-COLOR-CYCLE ────────────────────────────── */
  let hoverCycleIntervals = new Map();

  function startBorderCycle(card) {
    let idx = 0;
    const frameEl = card.querySelector('.salon-card__frame') || card;
    const interval = setInterval(function () {
      idx = (idx + 1) % ACCENT_COLORS.length;
      frameEl.style.borderColor = ACCENT_COLORS[idx];
    }, 350);
    hoverCycleIntervals.set(card, interval);
  }

  function stopBorderCycle(card) {
    const interval = hoverCycleIntervals.get(card);
    if (interval) {
      clearInterval(interval);
      hoverCycleIntervals.delete(card);
    }
    // Reset to original
    const frameEl = card.querySelector('.salon-card__frame') || card;
    frameEl.style.borderColor = '';
  }

  // Apply to stat cards and salon cards
  document.querySelectorAll('.stat-card, .salon-card, .idea-card, .kanban-card').forEach(function (card) {
    card.addEventListener('mouseenter', function () { startBorderCycle(card); });
    card.addEventListener('mouseleave', function () { stopBorderCycle(card); });
  });

  /* ── TIPPY.JS — PATTERNED TOOLTIPS ─────────────────────────────── */
  function initTooltips() {
    if (typeof tippy === 'undefined') return;
    document.querySelectorAll('[data-tooltip]').forEach(function (el) {
      tippy(el, {
        content: el.getAttribute('data-tooltip'),
        theme: 'girard',
        placement: 'top',
        animation: 'scale',
        duration: [200, 150],
        arrow: true,
        offset: [0, 12]
      });
    });
  }

  /* ── SORTABLEJS — KANBAN DRAG ──────────────────────────────────── */
  let sortableInstances = [];
  function initSortable() {
    if (typeof Sortable === 'undefined') return;

    // Destroy old instances
    sortableInstances.forEach(function (s) { s.destroy(); });
    sortableInstances = [];

    document.querySelectorAll('.kanban-cards').forEach(function (col) {
      const s = Sortable.create(col, {
        group: 'kanban',
        animation: 250,
        ghostClass: 'sortable-ghost',
        dragClass: 'kanban-card--dragging',
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        onEnd: function (evt) {
          // Update counts
          document.querySelectorAll('.kanban-column').forEach(function (column) {
            const count = column.querySelectorAll('.kanban-card').length;
            const badge = column.querySelector('.kanban-count');
            if (badge) badge.textContent = count;
          });
          // Micro feedback on drop
          showMicroFeedback();
        }
      });
      sortableInstances.push(s);
    });
  }

  /* ── DIRECTORY TREE TOGGLE ─────────────────────────────────────── */
  document.querySelectorAll('[data-tree-toggle]').forEach(function (node) {
    node.addEventListener('click', function () {
      const branch = node.closest('.folk-tree__branch');
      if (!branch) return;
      const children = branch.querySelector('.folk-tree__children');
      if (!children) return;
      children.classList.toggle('folk-tree__children--collapsed');
      node.classList.toggle('folk-tree__node--open');
    });
  });

  /* ── SETTINGS TRAIN WIZARD ─────────────────────────────────────── */
  document.querySelectorAll('[data-settings-step]').forEach(function (stop) {
    stop.addEventListener('click', function () {
      const step = stop.getAttribute('data-settings-step');

      // Update active stop
      document.querySelectorAll('.train-stop').forEach(function (s) {
        s.classList.toggle('train-stop--active', s.getAttribute('data-settings-step') === step);
      });

      // Switch carriage
      document.querySelectorAll('.train-carriage').forEach(function (c) {
        if (c.getAttribute('data-carriage') === step) {
          c.classList.add('train-carriage--active');
        } else {
          c.classList.remove('train-carriage--active');
        }
      });
    });
  });

  /* ── GSAP AMBIENT ENHANCEMENTS ─────────────────────────────────── */
  function initGSAP() {
    if (typeof gsap === 'undefined') return;

    // Enhance ambient shapes with GSAP for smoother drift
    document.querySelectorAll('.ambient-shape').forEach(function (shape, i) {
      gsap.to(shape, {
        x: 'random(-30, 30)',
        y: 'random(-20, 20)',
        rotation: 'random(-15, 15)',
        duration: 'random(30, 50)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 2
      });
    });

    // Schema planner line animation (dash offset)
    gsap.utils.toArray('.schema-lines path').forEach(function (path) {
      gsap.to(path, {
        strokeDashoffset: -30,
        duration: 3,
        repeat: -1,
        ease: 'none'
      });
    });
  }

  /* ── GSAP FLIP for page transitions ────────────────────────────── */
  /* Using GSAP Flip for card-flip-slide motion language */
  function flipTransitionCards(container) {
    if (typeof gsap === 'undefined' || typeof Flip === 'undefined') return;

    const cards = container.querySelectorAll('.reveal-item');
    if (cards.length === 0) return;

    // Capture initial states
    const state = Flip.getState(cards);

    // Shuffle visual order slightly for collage feel
    cards.forEach(function (card) {
      card.style.opacity = '1';
      card.style.transform = 'scale(1) rotate(0deg)';
    });

    Flip.from(state, {
      duration: 0.6,
      ease: 'power2.inOut',
      stagger: 0.05,
      absolute: false,
      scale: true
    });
  }

  /* ── IDLE AMBIENT: Pattern background drift in CSS handled above ── */
  /* Additional subtle GSAP-based idle ambient enhancement */
  function enhanceIdleAmbient() {
    if (typeof gsap === 'undefined') return;
    // Subtly animate the background pattern positions on patterned elements
    document.querySelectorAll('[data-pattern]').forEach(function (el) {
      gsap.to(el, {
        backgroundPosition: 'random(0, 100)px random(0, 100)px',
        duration: 'random(20, 40)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });
  }

  /* ── INPUT FOCUS ENHANCEMENT ───────────────────────────────────── */
  // border-pattern-activate: The CSS handles the visual, JS adds extra polish
  document.querySelectorAll('.form-input').forEach(function (input) {
    input.addEventListener('focus', function () {
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(input, { boxShadow: '0 0 0 0px rgba(224,90,79,0)' },
          { boxShadow: '0 0 0 4px rgba(224,90,79,0.1)', duration: 0.3, ease: 'power2.out' });
      }
    });
    input.addEventListener('blur', function () {
      if (typeof gsap !== 'undefined') {
        gsap.to(input, { boxShadow: '0 0 0 0px rgba(224,90,79,0)', duration: 0.2 });
      }
    });
  });

  /* ── INITIALIZE ────────────────────────────────────────────────── */
  function init() {
    initTooltips();
    initGSAP();
    enhanceIdleAmbient();

    // Navigate to initial view
    const initialView = getViewFromHash();
    navigateTo(initialView, false);
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
