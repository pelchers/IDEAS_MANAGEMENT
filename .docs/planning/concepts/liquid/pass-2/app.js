/* ==========================================================
   LIQUID MOTION — PASS 2: WAVE CURRENT FLOW
   GSAP-powered navigation, transitions, scroll effects
   ========================================================== */

(function () {
  'use strict';

  /* ---------------------------------------------------------
     CONSTANTS & STATE
  --------------------------------------------------------- */
  const VIEWS = [
    'dashboard', 'projects', 'project-workspace', 'kanban',
    'whiteboard', 'schema-planner', 'directory-tree',
    'ideas', 'ai-chat', 'settings'
  ];

  let currentView = 'dashboard';
  let isTransitioning = false;

  /* ---------------------------------------------------------
     DOM REFERENCES
  --------------------------------------------------------- */
  const navItems = document.querySelectorAll('[data-view]');
  const viewSections = document.querySelectorAll('[data-page]');
  const hamburger = document.getElementById('navHamburger');
  const navStream = document.getElementById('navStream');

  /* ---------------------------------------------------------
     INIT
  --------------------------------------------------------- */
  function init() {
    setupHashRouting();
    setupNavigation();
    setupMobileNav();
    setupRippleButtons();
    setupNavBobAnimation();
    animateCurrentView();
  }

  /* ---------------------------------------------------------
     HASH ROUTING
  --------------------------------------------------------- */
  function setupHashRouting() {
    // Read initial hash
    const hash = window.location.hash.replace('#', '');
    if (hash && VIEWS.includes(hash)) {
      navigateTo(hash, false);
    } else {
      window.location.hash = currentView;
      animateCurrentView();
    }

    // Listen for hash changes (browser back/forward)
    window.addEventListener('hashchange', function () {
      const h = window.location.hash.replace('#', '');
      if (h && VIEWS.includes(h) && h !== currentView) {
        navigateTo(h, false);
      }
    });
  }

  /* ---------------------------------------------------------
     NAVIGATION
  --------------------------------------------------------- */
  function setupNavigation() {
    navItems.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const target = btn.getAttribute('data-view');
        if (target && target !== currentView) {
          window.location.hash = target;
          navigateTo(target, true);
        }
        // Close mobile nav
        if (navStream.classList.contains('mobile-open')) {
          closeMobileNav();
        }
      });
    });
  }

  function navigateTo(viewName, animate) {
    if (isTransitioning) return;
    if (!VIEWS.includes(viewName)) return;

    isTransitioning = true;

    // Update nav active state
    navItems.forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });

    const outgoing = document.querySelector('.view--active');
    const incoming = document.querySelector('[data-page="' + viewName + '"]');

    if (!incoming) {
      isTransitioning = false;
      return;
    }

    if (animate !== false && outgoing && outgoing !== incoming) {
      // Animate outgoing view — slide out to the left like a passing current
      gsap.to(outgoing, {
        x: -80,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: function () {
          outgoing.classList.remove('view--active');
          outgoing.style.display = 'none';
          gsap.set(outgoing, { x: 0, opacity: 0 });

          // Show and animate incoming view — slide in from the right
          incoming.style.display = 'block';
          incoming.classList.add('view--active');
          gsap.fromTo(incoming,
            { x: 80, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.5,
              ease: 'power2.out',
              onComplete: function () {
                currentView = viewName;
                isTransitioning = false;
                animateCurrentView();
              }
            }
          );
        }
      });
    } else {
      // No animation — direct switch
      viewSections.forEach(function (v) {
        v.classList.remove('view--active');
        v.style.display = 'none';
        gsap.set(v, { x: 0, opacity: 0 });
      });
      incoming.style.display = 'block';
      incoming.classList.add('view--active');
      gsap.set(incoming, { x: 0, opacity: 1 });
      currentView = viewName;
      isTransitioning = false;
      animateCurrentView();
    }
  }

  /* ---------------------------------------------------------
     VIEW ENTRANCE ANIMATIONS
  --------------------------------------------------------- */
  function animateCurrentView() {
    var page = document.querySelector('[data-page="' + currentView + '"]');
    if (!page) return;

    // Animate header elements
    var title = page.querySelector('.view__title');
    var subtitle = page.querySelector('.view__subtitle');
    if (title) {
      gsap.fromTo(title,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.1 }
      );
    }
    if (subtitle) {
      gsap.fromTo(subtitle,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.2 }
      );
    }

    // View-specific animations
    switch (currentView) {
      case 'dashboard':
        animateDashboard(page);
        break;
      case 'projects':
        animateProjects(page);
        break;
      case 'project-workspace':
        animateWorkspace(page);
        break;
      case 'kanban':
        animateKanban(page);
        break;
      case 'whiteboard':
        animateWhiteboard(page);
        break;
      case 'schema-planner':
        animateSchema(page);
        break;
      case 'directory-tree':
        animateDirectory(page);
        break;
      case 'ideas':
        animateIdeas(page);
        break;
      case 'ai-chat':
        animateChat(page);
        break;
      case 'settings':
        animateSettings(page);
        break;
    }
  }

  /* Dashboard: stats rise from seafloor, counter animation */
  function animateDashboard(page) {
    var cards = page.querySelectorAll('.stat-card');
    cards.forEach(function (card, i) {
      gsap.fromTo(card,
        { y: 60, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          ease: 'power3.out',
          delay: 0.2 + i * 0.12
        }
      );
    });

    // Counter animation
    var counters = page.querySelectorAll('[data-counter]');
    counters.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-counter'), 10);
      var obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.5,
        ease: 'power2.out',
        delay: 0.5,
        onUpdate: function () {
          el.textContent = Math.round(obj.val);
        }
      });
    });

    // Activity items slide in like a current
    var items = page.querySelectorAll('.activity-stream__item');
    items.forEach(function (item, i) {
      gsap.fromTo(item,
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.4 + i * 0.08 }
      );
    });
  }

  /* Projects: vessels float in */
  function animateProjects(page) {
    var vessels = page.querySelectorAll('.vessel-card');
    vessels.forEach(function (card, i) {
      gsap.fromTo(card,
        { y: 50, opacity: 0, rotation: -1 },
        {
          y: 0,
          opacity: 1,
          rotation: 0,
          duration: 0.7,
          ease: 'power2.out',
          delay: 0.15 + i * 0.1
        }
      );
    });

    // Subtle bobbing idle animation for vessels
    vessels.forEach(function (card, i) {
      gsap.to(card, {
        y: '+=4',
        duration: 2 + i * 0.3,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 1 + i * 0.2
      });
    });
  }

  /* Workspace: depth layers descend */
  function animateWorkspace(page) {
    var layers = page.querySelectorAll('.depth-layer');
    layers.forEach(function (layer, i) {
      gsap.fromTo(layer,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.2 + i * 0.15 }
      );
    });

    // Coral tree items
    var leaves = page.querySelectorAll('.coral-tree__leaf');
    leaves.forEach(function (leaf, i) {
      gsap.fromTo(leaf,
        { x: -15, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out', delay: 0.3 + i * 0.04 }
      );
    });
  }

  /* Kanban: columns flow in like currents */
  function animateKanban(page) {
    var columns = page.querySelectorAll('.current-column');
    columns.forEach(function (col, i) {
      gsap.fromTo(col,
        { x: 60, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.1 + i * 0.12 }
      );
    });

    // Cards float up within columns
    var cards = page.querySelectorAll('.current-card');
    cards.forEach(function (card, i) {
      gsap.fromTo(card,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.4 + i * 0.06 }
      );
    });
  }

  /* Whiteboard: nodes emerge from depth */
  function animateWhiteboard(page) {
    var nodes = page.querySelectorAll('.canvas-node');
    nodes.forEach(function (node, i) {
      gsap.fromTo(node,
        { scale: 0.7, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.7,
          ease: 'back.out(1.4)',
          delay: 0.2 + i * 0.15
        }
      );
    });

    // Animate SVG connection lines drawing
    var lines = page.querySelectorAll('.current-line');
    lines.forEach(function (line) {
      var length = line.getTotalLength ? line.getTotalLength() : 300;
      gsap.fromTo(line,
        { strokeDashoffset: length },
        { strokeDashoffset: 0, duration: 1.2, ease: 'power2.out', delay: 0.5 }
      );
    });
  }

  /* Schema: entities surface with bioluminescent glow */
  function animateSchema(page) {
    var entities = page.querySelectorAll('.schema-entity');
    entities.forEach(function (ent, i) {
      gsap.fromTo(ent,
        { y: 40, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: 'power2.out',
          delay: 0.2 + i * 0.15
        }
      );
    });

    // Pulsing biolum dots
    var dots = page.querySelectorAll('.schema-entity__biolum');
    dots.forEach(function (dot, i) {
      gsap.fromTo(dot,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)', delay: 0.6 + i * 0.1 }
      );
    });
  }

  /* Directory: branches unfold */
  function animateDirectory(page) {
    var branches = page.querySelectorAll('.reef-branch__label, .reef-creature');
    branches.forEach(function (el, i) {
      gsap.fromTo(el,
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out', delay: 0.1 + i * 0.03 }
      );
    });
  }

  /* Ideas: bubbles rise from the deep */
  function animateIdeas(page) {
    var bubbles = page.querySelectorAll('.idea-bubble');
    bubbles.forEach(function (bubble, i) {
      gsap.fromTo(bubble,
        { y: 80, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          delay: 0.2 + i * 0.12
        }
      );
    });

    // Subtle float after entrance
    bubbles.forEach(function (bubble, i) {
      gsap.to(bubble, {
        y: '-=6',
        duration: 2.5 + i * 0.4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 1.2 + i * 0.2
      });
    });
  }

  /* AI Chat: messages pulse in like sonar */
  function animateChat(page) {
    var messages = page.querySelectorAll('.sonar-msg');
    messages.forEach(function (msg, i) {
      var isAI = msg.classList.contains('sonar-msg--ai');
      gsap.fromTo(msg,
        {
          y: isAI ? 30 : -20,
          opacity: 0,
          scale: 0.95
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: 'power2.out',
          delay: 0.15 + i * 0.1
        }
      );
    });
  }

  /* Settings: gauges spin up, controls appear */
  function animateSettings(page) {
    var gauges = page.querySelectorAll('.gauge');
    gauges.forEach(function (gauge, i) {
      gsap.fromTo(gauge,
        { scale: 0.8, opacity: 0, rotation: -10 },
        {
          scale: 1,
          opacity: 1,
          rotation: 0,
          duration: 0.7,
          ease: 'back.out(1.3)',
          delay: 0.2 + i * 0.12
        }
      );
    });

    var toggles = page.querySelectorAll('.valve-toggle');
    toggles.forEach(function (toggle, i) {
      gsap.fromTo(toggle,
        { x: 30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out', delay: 0.5 + i * 0.06 }
      );
    });

    var dials = page.querySelectorAll('.dial-control');
    dials.forEach(function (dial, i) {
      gsap.fromTo(dial,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.7 + i * 0.08 }
      );
    });
  }

  /* ---------------------------------------------------------
     NAV BOB ANIMATION — staggered sine wave
  --------------------------------------------------------- */
  function setupNavBobAnimation() {
    navItems.forEach(function (item, i) {
      gsap.to(item, {
        y: '+=2',
        duration: 1.8 + (i * 0.15),
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.12
      });
    });
  }

  /* ---------------------------------------------------------
     RIPPLE BUTTON EFFECT
  --------------------------------------------------------- */
  function setupRippleButtons() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.btn-ripple');
      if (!btn) return;

      var effect = btn.querySelector('.btn-ripple__effect');
      if (!effect) return;

      var rect = btn.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;

      effect.style.left = x + 'px';
      effect.style.top = y + 'px';

      // Kill any existing ripple animation
      gsap.killTweensOf(effect);

      gsap.fromTo(effect,
        { scale: 0, opacity: 0.8 },
        {
          scale: 30,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out'
        }
      );
    });
  }

  /* ---------------------------------------------------------
     MOBILE NAVIGATION
  --------------------------------------------------------- */
  function setupMobileNav() {
    if (!hamburger || !navStream) return;

    hamburger.addEventListener('click', function () {
      if (navStream.classList.contains('mobile-open')) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (
        navStream.classList.contains('mobile-open') &&
        !navStream.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        closeMobileNav();
      }
    });
  }

  function openMobileNav() {
    navStream.classList.add('mobile-open');
    hamburger.classList.add('open');

    // Stagger nav items in
    var items = navStream.querySelectorAll('.stream-nav__item');
    items.forEach(function (item, i) {
      gsap.fromTo(item,
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out', delay: i * 0.04 }
      );
    });
  }

  function closeMobileNav() {
    navStream.classList.remove('mobile-open');
    hamburger.classList.remove('open');
  }

  /* ---------------------------------------------------------
     WAVE HOVER EFFECT ON CARDS
  --------------------------------------------------------- */
  function setupWaveHoverEffects() {
    var hoverTargets = document.querySelectorAll(
      '.vessel-card, .current-card, .idea-bubble, .canvas-node, .schema-entity'
    );
    hoverTargets.forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        gsap.to(el, {
          boxShadow: '0 0 24px rgba(0, 212, 255, 0.18), 0 8px 32px rgba(0, 0, 0, 0.3)',
          duration: 0.4,
          ease: 'power2.out'
        });
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(el, {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
          duration: 0.4,
          ease: 'power2.out'
        });
      });
    });
  }

  /* ---------------------------------------------------------
     AMBIENT OCEAN WAVE ANIMATION (background SVGs)
  --------------------------------------------------------- */
  function setupAmbientWaves() {
    var waves = document.querySelectorAll('.ocean-bg__wave');
    waves.forEach(function (wave, i) {
      gsap.to(wave, {
        x: (i % 2 === 0) ? 15 : -15,
        y: (i % 2 === 0) ? -3 : 5,
        duration: 6 + i * 2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1
      });
    });
  }

  /* ---------------------------------------------------------
     WAVE DIVIDER SUBTLE MOTION
  --------------------------------------------------------- */
  function setupWaveDividerMotion() {
    var dividers = document.querySelectorAll('.wave-divider');
    dividers.forEach(function (div, i) {
      gsap.to(div, {
        x: (i % 2 === 0) ? 6 : -6,
        duration: 4 + (i % 3),
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.3
      });
    });
  }

  /* ---------------------------------------------------------
     SCROLL-TRIGGERED WAVE CONTENT RISE
     (Simple implementation without ScrollTrigger plugin —
      uses IntersectionObserver for a current-like reveal)
  --------------------------------------------------------- */
  function setupScrollReveal() {
    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          gsap.fromTo(entry.target,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }
          );
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    // Observe key content blocks
    var revealTargets = document.querySelectorAll(
      '.dashboard-chart, .dashboard-activity, .canvas-toolbar, ' +
      '.sub-panel__controls, .sub-panel__analog'
    );
    revealTargets.forEach(function (el) {
      gsap.set(el, { y: 40, opacity: 0 });
      observer.observe(el);
    });
  }

  /* ---------------------------------------------------------
     CURRENT-LIKE PARALLAX ON SCROLL
  --------------------------------------------------------- */
  function setupCurrentParallax() {
    var bgWaves = document.querySelectorAll('.ocean-bg__wave');

    function onScroll() {
      var scrollY = window.pageYOffset || document.documentElement.scrollTop;
      bgWaves.forEach(function (wave, i) {
        var speed = 0.02 + i * 0.015;
        var xShift = Math.sin(scrollY * 0.003 + i) * 10;
        gsap.set(wave, {
          y: scrollY * speed,
          x: xShift
        });
      });
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     NAV STREAM RIPPLE — click on nav sends a wave
  --------------------------------------------------------- */
  function setupNavRipple() {
    navItems.forEach(function (item) {
      item.addEventListener('click', function (e) {
        // Create a temporary ripple circle
        var ripple = document.createElement('span');
        ripple.style.cssText =
          'position:absolute;border-radius:50%;pointer-events:none;' +
          'background:radial-gradient(circle, rgba(0,212,255,0.3) 0%, transparent 70%);' +
          'width:10px;height:10px;z-index:200;';

        var rect = item.getBoundingClientRect();
        ripple.style.left = (e.clientX - rect.left) + 'px';
        ripple.style.top = (e.clientY - rect.top) + 'px';
        item.style.position = 'relative';
        item.appendChild(ripple);

        gsap.fromTo(ripple,
          { scale: 0, opacity: 0.7 },
          {
            scale: 15,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: function () {
              if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
            }
          }
        );
      });
    });
  }

  /* ---------------------------------------------------------
     BOOT
  --------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    init();
    setupWaveHoverEffects();
    setupAmbientWaves();
    setupWaveDividerMotion();
    setupScrollReveal();
    setupCurrentParallax();
    setupNavRipple();
  });

})();
