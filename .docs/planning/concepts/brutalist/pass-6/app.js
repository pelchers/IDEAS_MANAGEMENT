/* ============================================================
   FREIGHT // CMD — Warehouse Industrial Logistics
   Brutalist Pass 6 — App Controller
   ============================================================ */

(function () {
  'use strict';

  // --- State ---
  let currentView = 'dashboard';
  let mobileNavOpen = false;

  // --- DOM References ---
  const tabBtns = document.querySelectorAll('.tab-btn');
  const mobileBtns = document.querySelectorAll('.mobile-tab-btn');
  const viewPanels = document.querySelectorAll('.view-panel');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileOverlay = document.getElementById('mobile-nav-overlay');
  const mobileClose = document.getElementById('mobile-nav-close');
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadPct = document.getElementById('load-pct');
  const tooltip = document.getElementById('shipping-tooltip');
  const ttDesc = document.getElementById('tt-desc');
  const ttWeight = document.getElementById('tt-weight');
  const ttDest = document.getElementById('tt-dest');
  const scanOk = document.getElementById('scan-ok');
  const dashClock = document.getElementById('dash-clock');

  // --- Loading Screen ---
  function runLoading() {
    let pct = 0;
    const interval = setInterval(() => {
      pct += Math.floor(Math.random() * 12) + 3;
      if (pct > 100) pct = 100;
      if (loadPct) loadPct.textContent = pct;
      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          loadingOverlay.classList.add('done');
          setTimeout(() => { loadingOverlay.style.display = 'none'; }, 500);
          revealPalletDrops();
        }, 300);
      }
    }, 120);
  }

  // --- Navigation ---
  function switchView(viewId) {
    if (viewId === currentView) return;
    currentView = viewId;

    // Update tab buttons
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewId);
      btn.setAttribute('aria-selected', btn.dataset.view === viewId ? 'true' : 'false');
    });
    mobileBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewId);
    });

    // Switch panels with container door animation
    viewPanels.forEach(panel => {
      if (panel.dataset.view === viewId) {
        panel.classList.add('active');
        // Re-trigger pallet drops for new view
        setTimeout(() => revealPalletDrops(panel), 80);
      } else {
        panel.classList.remove('active');
        // Reset pallet drops
        panel.querySelectorAll('.pallet-drop').forEach(el => el.classList.remove('visible'));
      }
    });

    // Show scan-ok feedback
    showScanOk();

    // Close mobile nav if open
    closeMobileNav();

    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // Tab click handlers
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });
  mobileBtns.forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // --- Mobile Navigation ---
  function openMobileNav() {
    mobileNavOpen = true;
    mobileNav.classList.add('open');
    mobileOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileNav() {
    mobileNavOpen = false;
    mobileNav.classList.remove('open');
    mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openMobileNav);
  if (mobileClose) mobileClose.addEventListener('click', closeMobileNav);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileNav);

  // --- Pallet Stack Drop-in (Scroll Reveal) ---
  function revealPalletDrops(container) {
    const root = container || document.querySelector('.view-panel.active');
    if (!root) return;
    const items = root.querySelectorAll('.pallet-drop');
    items.forEach((el, i) => {
      setTimeout(() => {
        el.classList.add('visible');
      }, i * 60);
    });
  }

  // Also use IntersectionObserver for scroll-triggered reveals
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  function observeAllPalletDrops() {
    document.querySelectorAll('.pallet-drop').forEach(el => {
      observer.observe(el);
    });
  }

  // --- Shipping Label Tooltip ---
  function initTooltips() {
    const tooltipTargets = document.querySelectorAll('[data-tooltip]');
    tooltipTargets.forEach(target => {
      target.addEventListener('mouseenter', (e) => {
        const desc = target.dataset.tooltip;
        const weight = target.dataset.tooltipWeight || '—';
        const dest = target.dataset.tooltipDest || '—';
        ttDesc.textContent = desc;
        ttWeight.textContent = weight;
        ttDest.textContent = dest;
        tooltip.classList.remove('hidden');
        positionTooltip(e);
      });
      target.addEventListener('mousemove', positionTooltip);
      target.addEventListener('mouseleave', () => {
        tooltip.classList.add('hidden');
      });
    });
  }

  function positionTooltip(e) {
    const x = e.clientX + 16;
    const y = e.clientY + 16;
    const ttW = tooltip.offsetWidth;
    const ttH = tooltip.offsetHeight;
    const winW = window.innerWidth;
    const winH = window.innerHeight;

    tooltip.style.left = (x + ttW > winW ? x - ttW - 32 : x) + 'px';
    tooltip.style.top = (y + ttH > winH ? y - ttH - 32 : y) + 'px';
  }

  // --- Scan OK Micro-Feedback ---
  function showScanOk() {
    scanOk.classList.remove('hidden');
    setTimeout(() => {
      scanOk.classList.add('hidden');
    }, 1200);
  }

  // --- Dashboard Clock ---
  function updateClock() {
    if (dashClock) {
      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      dashClock.textContent =
        pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds()) + ' UTC';
    }
  }

  // --- Circuit Breaker Toggle (mechanical snap feel) ---
  function initCircuitBreakers() {
    const breakers = document.querySelectorAll('.circuit-breaker input');
    breakers.forEach(input => {
      input.addEventListener('change', () => {
        const track = input.nextElementSibling;
        // Add a quick scale pulse for mechanical snap
        track.style.transform = 'scaleX(0.95)';
        setTimeout(() => { track.style.transform = 'scaleX(1)'; }, 100);
        showScanOk();
      });
    });
  }

  // --- Tree Toggle ---
  function initTreeToggles() {
    const toggles = document.querySelectorAll('.tree-toggle');
    toggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const node = toggle.closest('.tree-node');
        const children = node.nextElementSibling;
        if (children && children.classList.contains('tree-children')) {
          const isOpen = toggle.classList.contains('open');
          if (isOpen) {
            toggle.classList.remove('open');
            toggle.innerHTML = '&#9654;';
            children.style.display = 'none';
          } else {
            toggle.classList.add('open');
            toggle.innerHTML = '&#9660;';
            children.style.display = '';
          }
        }
      });
    });
  }

  // --- Kanban Drag & Drop with SortableJS ---
  function initKanban() {
    if (typeof Sortable === 'undefined') return;
    const kanbanCards = document.querySelectorAll('.kanban-cards');
    kanbanCards.forEach(container => {
      new Sortable(container, {
        group: 'kanban',
        animation: 200,
        ghostClass: 'kanban-ghost',
        dragClass: 'kanban-dragging',
        onEnd: () => {
          // Update counts
          document.querySelectorAll('.kanban-col').forEach(col => {
            const count = col.querySelectorAll('.kanban-card').length;
            const badge = col.querySelector('.zone-count');
            if (badge) badge.textContent = count;
          });
          showScanOk();
        }
      });
    });
  }

  // --- Anime.js Gauge Animation ---
  function animateGauges() {
    if (typeof anime === 'undefined') return;
    const gaugeCards = document.querySelectorAll('.gauge-ring');
    gaugeCards.forEach(ring => {
      const pct = parseInt(ring.dataset.pct) || 0;
      const fill = ring.querySelector('.gauge-fill');
      const valueEl = ring.querySelector('.gauge-value');
      if (!fill || !valueEl) return;

      // Animate the SVG circle stroke
      const circumference = 2 * Math.PI * 52;
      const targetDash = (pct / 100) * circumference;
      fill.style.strokeDasharray = '0 ' + circumference;

      anime({
        targets: fill,
        strokeDasharray: targetDash + ' ' + circumference,
        easing: 'easeOutCubic',
        duration: 1500,
        delay: 400
      });

      // Animate the percentage counter
      const counter = { val: 0 };
      anime({
        targets: counter,
        val: pct,
        round: 1,
        easing: 'easeOutCubic',
        duration: 1500,
        delay: 400,
        update: function () {
          valueEl.textContent = counter.val + '%';
        }
      });
    });
  }

  // --- Conveyor belt line animation on section dividers ---
  function initConveyorAmbient() {
    const dividers = document.querySelectorAll('.hazmat-divider');
    dividers.forEach(div => {
      div.style.backgroundSize = '22.6px 8px';
      // Animate background position for movement
      let pos = 0;
      function drift() {
        pos += 0.3;
        div.style.backgroundPosition = pos + 'px 0';
        requestAnimationFrame(drift);
      }
      drift();
    });
  }

  // --- Button click hydraulic press enhancement ---
  function initButtonFeedback() {
    document.querySelectorAll('.wh-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Slow compression fast release
        btn.style.transition = 'transform 0.15s ease-in, box-shadow 0.15s ease-in';
        btn.style.transform = 'translateY(4px) scaleY(0.96)';
        btn.style.boxShadow = 'inset 0 4px 12px rgba(0,0,0,0.5)';
        setTimeout(() => {
          btn.style.transition = 'transform 0.06s ease-out, box-shadow 0.06s ease-out';
          btn.style.transform = '';
          btn.style.boxShadow = '';
        }, 150);
        showScanOk();
      });
    });
  }

  // --- Route Line Animation (Whiteboard) ---
  function initRouteDashAnimation() {
    if (typeof anime === 'undefined') return;
    const routeLines = document.querySelectorAll('.route-line');
    routeLines.forEach(line => {
      const length = line.getTotalLength ? line.getTotalLength() : 200;
      line.style.strokeDasharray = length;
      line.style.strokeDashoffset = length;
    });
    // When whiteboard view is active, animate the lines drawing in
    const whiteboardPanel = document.getElementById('view-whiteboard');
    const mutObs = new MutationObserver(() => {
      if (whiteboardPanel.classList.contains('active')) {
        routeLines.forEach((line, i) => {
          const length = line.getTotalLength ? line.getTotalLength() : 200;
          anime({
            targets: line,
            strokeDashoffset: [length, 0],
            easing: 'easeInOutQuad',
            duration: 1200,
            delay: i * 200
          });
        });
      }
    });
    mutObs.observe(whiteboardPanel, { attributes: true, attributeFilter: ['class'] });
  }

  // --- Keyboard Navigation ---
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNavOpen) {
      closeMobileNav();
    }
  });

  // --- Initialize ---
  function init() {
    runLoading();
    observeAllPalletDrops();
    initTooltips();
    initCircuitBreakers();
    initTreeToggles();
    initKanban();
    initConveyorAmbient();
    initButtonFeedback();
    initRouteDashAnimation();

    // Clock
    updateClock();
    setInterval(updateClock, 1000);

    // Animate gauges after loading finishes
    setTimeout(animateGauges, 1200);
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
