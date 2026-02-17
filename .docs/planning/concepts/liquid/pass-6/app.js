/* ============================================
   INKWELL STUDIO — Liquid Motion Pass 6
   Ink in Water Calligraphy Aesthetic
   app.js — Navigation, Interactions, Library Init
   ============================================ */

(function () {
  'use strict';

  // ─── State ───
  let currentView = 'dashboard';
  let isTransitioning = false;
  let ambientEnabled = true;

  // ─── DOM Refs ───
  const leftRail = document.getElementById('leftRail');
  const contentArea = document.getElementById('contentArea');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileHeader = document.getElementById('mobileHeader');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const goldSealOverlay = document.getElementById('goldSealOverlay');
  const railNav = document.getElementById('railNav');
  const chatInput = document.getElementById('chatInput');
  const chatSendBtn = document.getElementById('chatSendBtn');
  const inkAmbientCanvas = document.getElementById('inkAmbient');

  // ─── Loading Screen ───
  function hideLoading() {
    setTimeout(() => {
      loadingOverlay.classList.add('hidden');
      initScrollReveals();
      revealCurrentTitle();
    }, 1200);
  }

  // ─── Splitting.js Init ───
  function initSplitting() {
    if (typeof Splitting !== 'undefined') {
      Splitting({ target: '[data-splitting]', by: 'chars' });
    }
  }

  // ─── Title Reveal ───
  function revealCurrentTitle() {
    const activePanel = document.querySelector('.view-panel.active');
    if (!activePanel) return;
    const title = activePanel.querySelector('.chiseled-title');
    if (!title) return;

    // Reset chars
    const chars = title.querySelectorAll('.char');
    chars.forEach(c => {
      c.style.opacity = '0';
      c.style.transform = 'translateY(8px)';
    });

    // Stagger reveal with GSAP if available, otherwise CSS
    if (typeof gsap !== 'undefined' && chars.length > 0) {
      gsap.to(chars, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.03,
        ease: 'power2.out',
        delay: 0.2
      });
    } else {
      title.classList.add('revealed');
      chars.forEach((c, i) => {
        c.style.transitionDelay = `${i * 30}ms`;
      });
    }
  }

  // ─── Navigation ───
  function navigateTo(viewId) {
    if (viewId === currentView || isTransitioning) return;
    isTransitioning = true;

    // Update nav items
    railNav.querySelectorAll('.rail-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewId);
    });

    const currentPanel = document.getElementById(`view-${currentView}`);
    const nextPanel = document.getElementById(`view-${viewId}`);
    if (!currentPanel || !nextPanel) {
      isTransitioning = false;
      return;
    }

    // Ink diffusion dissolve transition
    currentPanel.classList.add('dissolving');

    setTimeout(() => {
      currentPanel.classList.remove('active', 'dissolving');
      currentPanel.style.display = 'none';
      currentPanel.style.opacity = '0';

      nextPanel.style.display = 'block';
      nextPanel.classList.add('active', 'coalescing');

      // Scroll to top
      nextPanel.querySelector('.view-inner')?.scrollIntoView({ behavior: 'instant', block: 'start' });
      window.scrollTo(0, 0);

      setTimeout(() => {
        nextPanel.classList.remove('coalescing');
        nextPanel.style.opacity = '1';
        isTransitioning = false;
        currentView = viewId;
        revealCurrentTitle();
        initScrollReveals();
      }, 500);
    }, 400);

    // Close mobile nav
    closeMobileMenu();
  }

  function closeMobileMenu() {
    leftRail.classList.remove('open');
    mobileOverlay.classList.remove('visible');
    setTimeout(() => { mobileOverlay.style.display = 'none'; }, 300);
  }

  function openMobileMenu() {
    mobileOverlay.style.display = 'block';
    requestAnimationFrame(() => {
      leftRail.classList.add('open');
      mobileOverlay.classList.add('visible');
    });
  }

  // ─── Nav Event Listeners ───
  railNav.addEventListener('click', (e) => {
    const item = e.target.closest('.rail-item');
    if (item && item.dataset.view) {
      navigateTo(item.dataset.view);
    }
  });

  mobileMenuBtn.addEventListener('click', openMobileMenu);
  mobileOverlay.addEventListener('click', closeMobileMenu);

  // ─── Directory Tree Collapse/Expand ───
  document.querySelectorAll('.chapter-heading').forEach(heading => {
    heading.addEventListener('click', () => {
      const content = heading.nextElementSibling;
      const isExpanded = heading.dataset.expanded === 'true';
      const toggle = heading.querySelector('.chapter-toggle');

      if (isExpanded) {
        content.classList.remove('expanded');
        heading.dataset.expanded = 'false';
        if (toggle) toggle.textContent = '\u25B6'; // right triangle
      } else {
        content.classList.add('expanded');
        heading.dataset.expanded = 'true';
        if (toggle) toggle.textContent = '\u25BE'; // down triangle
      }
    });
  });

  // ─── Button Click: Ink Drop Splash ───
  function handleInkSplash(e) {
    const btn = e.currentTarget;
    btn.classList.remove('ink-splash');

    // Create splash element positioned at click point
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const splash = document.createElement('span');
    splash.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(200,168,78,0.3) 0%, transparent 70%);
      transform: translate(-50%, -50%) scale(0);
      pointer-events: none;
      z-index: 10;
    `;
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(splash);

    if (typeof gsap !== 'undefined') {
      gsap.to(splash, {
        scale: 1.5,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => splash.remove()
      });
    } else {
      splash.animate([
        { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
        { transform: 'translate(-50%, -50%) scale(1.5)', opacity: 0 }
      ], { duration: 800, easing: 'ease-out' });
      setTimeout(() => splash.remove(), 800);
    }
  }

  document.querySelectorAll('.btn-primary, .btn-secondary, .chat-send-btn').forEach(btn => {
    btn.addEventListener('click', handleInkSplash);
  });

  // ─── Gold Seal Stamp Confirmation ───
  function showGoldSeal() {
    goldSealOverlay.classList.add('show');
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(goldSealOverlay.querySelector('svg'), {
        scale: 0.3,
        rotation: -30,
        opacity: 0
      }, {
        scale: 1,
        rotation: 0,
        opacity: 1,
        duration: 0.5,
        ease: 'back.out(2)',
        onComplete: () => {
          gsap.to(goldSealOverlay, {
            opacity: 0,
            scale: 0.8,
            duration: 0.4,
            delay: 0.6,
            ease: 'power2.in',
            onComplete: () => {
              goldSealOverlay.classList.remove('show');
              gsap.set(goldSealOverlay, { opacity: 1, scale: 1 });
            }
          });
        }
      });
    } else {
      setTimeout(() => {
        goldSealOverlay.classList.remove('show');
      }, 1200);
    }
  }

  // Wire save button to show gold seal
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', () => {
      setTimeout(showGoldSeal, 200);
    });
  });

  // ─── Chat Send ───
  function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    const messagesContainer = document.getElementById('chatMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message msg-user';
    msgDiv.innerHTML = `
      <div class="msg-header">
        <span class="msg-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <span class="msg-sender">Eleanor</span>
      </div>
      <div class="msg-body"><p>${escapeHtml(text)}</p></div>
    `;
    messagesContainer.appendChild(msgDiv);
    chatInput.value = '';

    // Auto-scroll
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Simulate scribe response
    setTimeout(() => {
      const respDiv = document.createElement('div');
      respDiv.className = 'chat-message msg-ai';
      respDiv.innerHTML = `
        <div class="msg-header">
          <span class="msg-sender">The Scribe</span>
          <span class="msg-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="msg-body"><p>I shall research that topic carefully and return with detailed findings. The art of calligraphy teaches us patience -- a virtue I intend to honor in my response.</p></div>
        <div class="msg-ink-blot"></div>
      `;
      messagesContainer.appendChild(respDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1500);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  chatSendBtn.addEventListener('click', sendChatMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });

  // ─── Tippy.js Init: Parchment Scroll Tooltips ───
  function initTooltips() {
    if (typeof tippy === 'undefined') return;

    tippy('[data-tooltip]', {
      content: (ref) => ref.getAttribute('data-tooltip'),
      theme: 'parchment',
      placement: 'top',
      animation: 'scale',
      duration: [300, 200],
      arrow: true,
      delay: [200, 0],
      offset: [0, 8]
    });
  }

  // ─── GSAP Scroll Reveals: Quill-Stroke Write-In ───
  function initScrollReveals() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Reveal cards, panels, items as if drawn by quill
    const activePanel = document.querySelector('.view-panel.active');
    if (!activePanel) return;

    const revealItems = activePanel.querySelectorAll(
      '.metric-card, .project-letter, .kanban-card, .idea-card, .parchment-panel, ' +
      '.tool-panel, .settings-group, .deadline-item, .activity-item, .schema-entity, ' +
      '.chapter-group, .chat-message, .wb-node'
    );

    revealItems.forEach((item, i) => {
      gsap.set(item, { opacity: 0, x: -15 });
      gsap.to(item, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        delay: 0.08 * i,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 90%',
          once: true
        }
      });
    });
  }

  // ─── Ambient Ink Wisps Canvas ───
  function initAmbientInk() {
    if (!inkAmbientCanvas) return;

    const ctx = inkAmbientCanvas.getContext('2d');
    let width, height;
    const wisps = [];
    const maxWisps = 6;

    function resize() {
      width = inkAmbientCanvas.width = window.innerWidth;
      height = inkAmbientCanvas.height = window.innerHeight;
    }

    function createWisp() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2,
        points: generateWispPath(),
        opacity: Math.random() * 0.15 + 0.05,
        scale: Math.random() * 0.5 + 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.002,
        life: 0,
        maxLife: 600 + Math.random() * 600,
        color: Math.random() > 0.7 ? 'rgba(200, 168, 78,' : 'rgba(240, 236, 228,'
      };
    }

    function generateWispPath() {
      const pts = [];
      const len = 5 + Math.floor(Math.random() * 4);
      let cx = 0, cy = 0;
      for (let i = 0; i < len; i++) {
        cx += (Math.random() - 0.5) * 60;
        cy += (Math.random() - 0.5) * 30;
        pts.push({ x: cx, y: cy });
      }
      return pts;
    }

    function drawWisp(wisp) {
      const fadeIn = Math.min(wisp.life / 60, 1);
      const fadeOut = Math.max((wisp.maxLife - wisp.life) / 60, 0);
      const alpha = wisp.opacity * Math.min(fadeIn, fadeOut);

      if (alpha <= 0) return;

      ctx.save();
      ctx.translate(wisp.x, wisp.y);
      ctx.rotate(wisp.rotation);
      ctx.scale(wisp.scale, wisp.scale);

      ctx.beginPath();
      const pts = wisp.points;
      if (pts.length < 2) { ctx.restore(); return; }

      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
      }
      ctx.quadraticCurveTo(
        pts[pts.length - 2].x, pts[pts.length - 2].y,
        pts[pts.length - 1].x, pts[pts.length - 1].y
      );

      ctx.strokeStyle = wisp.color + alpha + ')';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
    }

    function animate() {
      if (!ambientEnabled) {
        requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Manage wisps
      while (wisps.length < maxWisps) {
        wisps.push(createWisp());
      }

      for (let i = wisps.length - 1; i >= 0; i--) {
        const w = wisps[i];
        w.x += w.vx;
        w.y += w.vy;
        w.rotation += w.rotSpeed;
        w.life++;

        if (w.life > w.maxLife) {
          wisps.splice(i, 1);
          continue;
        }

        drawWisp(w);
      }

      requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener('resize', resize);
    animate();
  }

  // ─── Keyboard Navigation ───
  document.addEventListener('keydown', (e) => {
    // ESC closes mobile menu
    if (e.key === 'Escape') {
      closeMobileMenu();
    }
  });

  // ─── Task Checkbox Toggle ───
  document.querySelectorAll('.task-check').forEach(check => {
    check.addEventListener('click', () => {
      check.classList.toggle('checked');
      const taskItem = check.closest('.task-item');
      if (taskItem) {
        taskItem.classList.toggle('completed');
      }
    });
  });

  // ─── Initialize Everything ───
  function init() {
    initSplitting();
    hideLoading();
    initTooltips();
    initAmbientInk();

    // Ensure first view is visible
    const firstPanel = document.getElementById('view-dashboard');
    if (firstPanel) {
      firstPanel.style.display = 'block';
      firstPanel.style.opacity = '1';
    }
  }

  // Wait for DOM and fonts
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
