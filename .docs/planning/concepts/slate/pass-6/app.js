/* =====================================================
   AEGIS COMMAND | PASS 6 — CONCRETE BRUTALIST BUNKER
   app.js — Navigation, interactions, library init
   Libraries: Anime.js, Typed.js
   ===================================================== */

(function () {
  'use strict';

  /* --- DOM References --- */
  const loadingOverlay = document.getElementById('loading-overlay');
  const overlayNav = document.getElementById('overlay-nav');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const closeNavBtn = document.getElementById('close-nav-btn');
  const navLinks = document.querySelectorAll('.nav-link');
  const views = document.querySelectorAll('.view');
  const blastDoorLeft = document.querySelector('.blast-door-left');
  const blastDoorRight = document.querySelector('.blast-door-right');
  const currentViewLabel = document.getElementById('current-view-label');
  const navTimestamp = document.getElementById('nav-timestamp');
  const stampOverlay = document.getElementById('stamp-overlay');
  const tooltip = document.getElementById('classified-tooltip');
  const tooltipContent = document.getElementById('tooltip-content');

  let currentView = 'dashboard';
  let isTransitioning = false;

  /* --- Loading Screen --- */
  function hideLoadingScreen() {
    setTimeout(() => {
      loadingOverlay.classList.add('hidden');
      initScrollReveal();
    }, 2200);
  }

  /* --- Navigation --- */
  function openNav() {
    overlayNav.classList.add('open');
    document.body.style.overflow = 'hidden';
    updateTimestamp();
    // Animate nav items in with anime.js
    if (typeof anime !== 'undefined') {
      anime({
        targets: '.overlay-nav-list li',
        translateX: [-60, 0],
        opacity: [0, 1],
        delay: anime.stagger(50, { start: 200 }),
        duration: 500,
        easing: 'easeOutCubic'
      });
    }
  }

  function closeNav() {
    overlayNav.classList.remove('open');
    document.body.style.overflow = '';
  }

  function updateTimestamp() {
    const now = new Date();
    const h = String(now.getUTCHours()).padStart(2, '0');
    const m = String(now.getUTCMinutes()).padStart(2, '0');
    const d = String(now.getUTCDate()).padStart(2, '0');
    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    navTimestamp.textContent = `${h}${m}Z ${d}${months[now.getUTCMonth()]}${now.getUTCFullYear()}`;
  }

  function switchView(viewId) {
    if (viewId === currentView || isTransitioning) return;
    isTransitioning = true;
    closeNav();

    // Blast door close animation
    blastDoorLeft.classList.add('closing');
    blastDoorRight.classList.add('closing');

    setTimeout(() => {
      // Hide current view
      const activeView = document.querySelector('.view.active');
      if (activeView) activeView.classList.remove('active');

      // Show new view
      const newView = document.getElementById('view-' + viewId);
      if (newView) {
        newView.classList.add('active');
        // Reset scroll reveal items
        newView.querySelectorAll('.sr-item').forEach(el => el.classList.remove('revealed'));
      }

      // Update nav state
      navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.view === viewId);
      });

      // Update top bar label
      const viewLabels = {
        'dashboard': 'COMMAND CENTER',
        'projects': 'OPERATIONS MANIFEST',
        'project-workspace': 'BUNKER STATION',
        'kanban': 'MISSION BOARD',
        'whiteboard': 'TACTICAL MAP',
        'schema-planner': 'EQUIPMENT MANIFEST',
        'directory-tree': 'CHAIN OF COMMAND',
        'ideas': 'INTEL BULLETIN',
        'ai-chat': 'SECURE COMMS',
        'settings': 'SYSTEMS CONTROL'
      };
      currentViewLabel.textContent = viewLabels[viewId] || viewId.toUpperCase();
      currentView = viewId;

      // Open blast doors
      setTimeout(() => {
        blastDoorLeft.classList.remove('closing');
        blastDoorRight.classList.remove('closing');
        isTransitioning = false;
        // Trigger scroll reveal for new view
        setTimeout(() => initScrollReveal(), 300);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 200);
    }, 700);
  }

  hamburgerBtn.addEventListener('click', openNav);
  closeNavBtn.addEventListener('click', closeNav);

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchView(link.dataset.view);
    });
  });

  // Close nav on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlayNav.classList.contains('open')) {
      closeNav();
    }
  });

  /* --- Scroll Reveal: Declassified Redaction --- */
  function initScrollReveal() {
    const activeView = document.querySelector('.view.active');
    if (!activeView) return;
    const items = activeView.querySelectorAll('.sr-item');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    items.forEach(item => observer.observe(item));
  }

  /* --- Parallax Layers --- */
  function handleParallax() {
    const scrollY = window.scrollY;
    document.querySelectorAll('.parallax-layer').forEach(layer => {
      const speed = parseFloat(layer.dataset.speed) || 0.2;
      const offset = scrollY * speed;
      layer.style.transform = `translateY(${offset}px)`;
    });
  }

  window.addEventListener('scroll', () => {
    requestAnimationFrame(handleParallax);
  });

  /* --- Card Hover: Bunker Slit Viewport Peek --- */
  // On non-hover, cards show a narrow slit. On hover, slit opens fully.
  // Implemented via CSS pseudo-elements on .card-bunker-slit
  document.querySelectorAll('.project-card').forEach(card => {
    const slit = card.querySelector('.card-bunker-slit');
    if (!slit) return;

    card.addEventListener('mouseenter', () => {
      if (typeof anime !== 'undefined') {
        anime({
          targets: card,
          borderColor: ['#4a4e38', '#d4a020'],
          duration: 300,
          easing: 'easeInOutQuad'
        });
      }
    });

    card.addEventListener('mouseleave', () => {
      if (typeof anime !== 'undefined') {
        anime({
          targets: card,
          borderColor: ['#d4a020', '#4a4e38'],
          duration: 300,
          easing: 'easeInOutQuad'
        });
      }
    });
  });

  /* --- Toggle Switch: Missile Switch Guard --- */
  document.querySelectorAll('.toggle-switch').forEach(toggle => {
    let guardLifted = false;

    toggle.addEventListener('click', () => {
      if (!guardLifted) {
        // First click: lift the guard
        toggle.classList.add('guard-lifted');
        guardLifted = true;
        // Auto-close guard after 3s if not confirmed
        setTimeout(() => {
          if (guardLifted) {
            toggle.classList.remove('guard-lifted');
            guardLifted = false;
          }
        }, 3000);
      } else {
        // Second click: toggle the switch
        const current = toggle.dataset.state;
        toggle.dataset.state = current === 'on' ? 'off' : 'on';
        toggle.classList.remove('guard-lifted');
        guardLifted = false;
        showStamp();
      }
    });
  });

  /* --- CONFIRMED Stamp (Micro-feedback) --- */
  function showStamp() {
    stampOverlay.classList.remove('show');
    void stampOverlay.offsetWidth;
    stampOverlay.classList.add('show');
    setTimeout(() => {
      stampOverlay.classList.remove('show');
    }, 800);
  }

  /* --- Tooltips: Classified Briefing Popup --- */
  const tooltipTriggers = document.querySelectorAll('[data-tooltip]');
  // Add tooltips to tactical map nodes
  document.querySelectorAll('.tac-node').forEach(node => {
    const label = node.dataset.label;
    if (label) {
      node.addEventListener('mouseenter', (e) => {
        showTooltip(e, label);
      });
      node.addEventListener('mouseleave', hideTooltip);
      node.addEventListener('mousemove', moveTooltip);
    }
  });

  function showTooltip(e, text) {
    tooltipContent.textContent = text;
    tooltip.classList.add('visible');
    moveTooltip(e);
  }

  function hideTooltip() {
    tooltip.classList.remove('visible');
  }

  function moveTooltip(e) {
    const x = e.clientX + 15;
    const y = e.clientY - 10;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
  }

  /* --- Input Focus: Perimeter Scan --- */
  const chatInput = document.querySelector('.chat-input');
  const inputWrapper = document.querySelector('.input-wrapper');

  if (chatInput && inputWrapper) {
    chatInput.addEventListener('focus', () => {
      inputWrapper.classList.add('scanning');
    });
    chatInput.addEventListener('blur', () => {
      inputWrapper.classList.remove('scanning');
    });
  }

  /* --- Chat Send Button --- */
  const chatSendBtn = document.querySelector('.chat-send-btn');
  if (chatSendBtn && chatInput) {
    chatSendBtn.addEventListener('click', () => {
      const val = chatInput.value.trim();
      if (val) {
        chatInput.value = '';
        showStamp();
      }
    });
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        chatSendBtn.click();
      }
    });
  }

  /* --- Ambient Camo Pattern Shift --- */
  // Handled via CSS animation on body::before. Additional JS-driven
  // subtle color shifts on surfaces to enhance the camo feel.
  function ambientSurfaceShift() {
    const surfaces = document.querySelectorAll('.metric-viewport, .entity-block, .intel-brief, .mission-dossier');
    surfaces.forEach((el, i) => {
      if (typeof anime !== 'undefined') {
        anime({
          targets: el,
          backgroundColor: [
            { value: '#353828', duration: 8000 },
            { value: '#3a3d2d', duration: 8000 },
            { value: '#353828', duration: 8000 }
          ],
          delay: i * 2000,
          loop: true,
          easing: 'easeInOutSine'
        });
      }
    });
  }

  /* --- Radar Sweep Loading (for view transitions) --- */
  // The main loading overlay uses CSS. This provides a secondary mini-radar
  // that appears during blast-door transitions via the overlay.

  /* --- Button click: confirmed stamp feedback --- */
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showStamp();
    });
  });

  /* --- Comms buttons: confirmed stamp feedback --- */
  document.querySelectorAll('.comms-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showStamp();
    });
  });

  /* --- Anime.js: Stagger entrance for kanban cards --- */
  function animateKanbanCards() {
    if (typeof anime === 'undefined') return;
    const cards = document.querySelectorAll('#view-kanban .mission-dossier');
    anime({
      targets: cards,
      opacity: [0, 1],
      translateY: [20, 0],
      delay: anime.stagger(80),
      duration: 600,
      easing: 'easeOutCubic'
    });
  }

  /* --- Typed.js: Hero subtitle typing effect on dashboard --- */
  function initTypedSubtitle() {
    if (typeof Typed === 'undefined') return;
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (!heroSubtitle) return;
    const originalText = heroSubtitle.textContent;
    heroSubtitle.textContent = '';

    new Typed(heroSubtitle, {
      strings: [originalText],
      typeSpeed: 25,
      showCursor: true,
      cursorChar: '_',
      startDelay: 2500,
      onComplete: (self) => {
        setTimeout(() => {
          if (self.cursor) self.cursor.style.display = 'none';
        }, 2000);
      }
    });
  }

  /* --- Anime.js: Gauge fill animation --- */
  function animateGauges() {
    if (typeof anime === 'undefined') return;
    document.querySelectorAll('.gauge-fill').forEach(fill => {
      const target = fill.dataset.fill || 50;
      fill.style.width = '0%';
      anime({
        targets: fill,
        width: target + '%',
        duration: 1500,
        delay: 500,
        easing: 'easeOutCubic'
      });
    });
  }

  /* --- Anime.js: Activity feed stagger --- */
  function animateActivityFeed() {
    if (typeof anime === 'undefined') return;
    anime({
      targets: '.activity-entry',
      opacity: [0, 1],
      translateX: [-30, 0],
      delay: anime.stagger(100, { start: 800 }),
      duration: 500,
      easing: 'easeOutCubic'
    });
  }

  /* --- Anime.js: Tactical map node pulse --- */
  function animateTacNodes() {
    if (typeof anime === 'undefined') return;
    anime({
      targets: '.tac-node rect, .tac-node circle, .tac-node polygon',
      strokeWidth: [2, 3, 2],
      duration: 2000,
      loop: true,
      delay: anime.stagger(300),
      easing: 'easeInOutSine'
    });
  }

  /* --- Anime.js: Chain of command entrance --- */
  function animateChainNodes() {
    if (typeof anime === 'undefined') return;
    anime({
      targets: '.node-badge',
      opacity: [0, 1],
      translateX: [-20, 0],
      delay: anime.stagger(120),
      duration: 500,
      easing: 'easeOutCubic'
    });
  }

  /* --- View-specific animations --- */
  function onViewEnter(viewId) {
    switch (viewId) {
      case 'dashboard':
        animateGauges();
        animateActivityFeed();
        break;
      case 'kanban':
        animateKanbanCards();
        break;
      case 'whiteboard':
        animateTacNodes();
        break;
      case 'directory-tree':
        animateChainNodes();
        break;
    }
  }

  // Hook view-specific animations into view switch
  const origSwitchView = switchView;
  // Override is done differently since switchView is already defined
  // Instead, observe mutations or hook into the switch

  // Use a MutationObserver to detect view changes
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    const viewObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target;
          if (target.classList.contains('view') && target.classList.contains('active')) {
            const viewId = target.dataset.view;
            if (viewId) {
              setTimeout(() => onViewEnter(viewId), 500);
            }
          }
        }
      });
    });

    views.forEach(view => {
      viewObserver.observe(view, { attributes: true, attributeFilter: ['class'] });
    });
  }

  /* --- INITIALIZATION --- */
  function init() {
    hideLoadingScreen();
    initTypedSubtitle();
    ambientSurfaceShift();

    // Initial animations for dashboard
    setTimeout(() => {
      animateGauges();
      animateActivityFeed();
    }, 2500);
  }

  // Wait for fonts and libraries
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
