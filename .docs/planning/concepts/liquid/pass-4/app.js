/* ============================================================
   Bloom — Watercolor Wash Wellness Studio
   Pass 4: Liquid Motion / Watercolor Wash Blend
   ============================================================ */

(function () {
  'use strict';

  // -----------------------------------------------------------
  // CONFIG
  // -----------------------------------------------------------
  const VIEWS = [
    'dashboard', 'projects', 'project-workspace', 'kanban',
    'whiteboard', 'schema-planner', 'directory-tree',
    'ideas', 'ai-chat', 'settings'
  ];
  const DEFAULT_VIEW = 'dashboard';

  // -----------------------------------------------------------
  // DOM REFS
  // -----------------------------------------------------------
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebarNav = document.getElementById('sidebar-nav');
  const mainContent = document.getElementById('main-content');
  const pageWash = document.getElementById('page-wash');
  const petalContainer = document.getElementById('petal-container');
  const loadingOverlay = document.getElementById('loading-overlay');
  const mobileHamburger = document.getElementById('mobile-hamburger');
  const mobileOverlay = document.getElementById('mobile-overlay');
  const ambientCanvas = document.getElementById('ambient-canvas');

  // -----------------------------------------------------------
  // 1. LOADING STATE (paint-drip-fill)
  // -----------------------------------------------------------
  function hideLoading() {
    setTimeout(() => {
      loadingOverlay.classList.add('hidden');
      setTimeout(() => {
        loadingOverlay.style.display = 'none';
        initAmbientCanvas();
        initScrollReveals();
      }, 800);
    }, 1200);
  }

  // -----------------------------------------------------------
  // 2. HASH-BASED NAVIGATION
  // -----------------------------------------------------------
  function navigateTo(viewName, skipWash) {
    if (!VIEWS.includes(viewName)) viewName = DEFAULT_VIEW;

    // Page wash transition
    if (!skipWash) {
      pageWash.classList.add('active');
      setTimeout(() => pageWash.classList.remove('active'), 750);
    }

    // Hide all views, show target
    const delay = skipWash ? 0 : 200;
    setTimeout(() => {
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      const target = document.querySelector(`[data-page="${viewName}"]`);
      if (target) {
        target.classList.add('active');
        // Re-trigger Splitting for the view title
        const title = target.querySelector('.view-title[data-splitting]');
        if (title && !title.classList.contains('splitting')) {
          Splitting({ target: title, by: 'chars' });
        }
        // Re-trigger scroll reveals
        setTimeout(() => initScrollReveals(), 100);
      }

      // Update nav
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
      });

      // Update hash
      if (window.location.hash !== `#${viewName}`) {
        history.pushState(null, '', `#${viewName}`);
      }
    }, delay);
  }

  // Nav item clicks
  sidebarNav.addEventListener('click', (e) => {
    const navItem = e.target.closest('.nav-item');
    if (!navItem) return;
    const view = navItem.dataset.view;
    if (view) {
      navigateTo(view);
      // Close mobile nav
      if (window.innerWidth <= 768) {
        closeMobileNav();
      }
    }
  });

  // Hash change
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    navigateTo(hash, true);
  });

  // -----------------------------------------------------------
  // 3. SIDEBAR COLLAPSE (collapsible-left-sidebar)
  // -----------------------------------------------------------
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    // GSAP animate the sidebar width
    if (typeof gsap !== 'undefined') {
      gsap.to(sidebar, {
        duration: 0.5,
        ease: 'power2.inOut'
      });
    }
  });

  // -----------------------------------------------------------
  // 4. ACCORDION SECTIONS (accordion-sections navPattern)
  // -----------------------------------------------------------
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', !expanded);
      const panel = trigger.nextElementSibling;
      if (expanded) {
        panel.classList.add('collapsed');
        panel.setAttribute('aria-hidden', 'true');
      } else {
        panel.classList.remove('collapsed');
        panel.setAttribute('aria-hidden', 'false');
      }
      // GSAP collapse-expand motion
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(panel, { opacity: expanded ? 1 : 0 }, {
          opacity: expanded ? 0 : 1,
          duration: 0.35,
          ease: 'power2.inOut'
        });
      }
    });
  });

  // -----------------------------------------------------------
  // 5. MOBILE NAV
  // -----------------------------------------------------------
  function openMobileNav() {
    sidebar.classList.add('mobile-open');
    mobileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileNav() {
    sidebar.classList.remove('mobile-open');
    mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  mobileHamburger.addEventListener('click', openMobileNav);
  mobileOverlay.addEventListener('click', closeMobileNav);

  // -----------------------------------------------------------
  // 6. BUTTON INTERACTIONS
  //    - Hover: watercolor-bleed-fill (CSS + JS position)
  //    - Click: paint-splatter-micro
  // -----------------------------------------------------------
  document.addEventListener('mousemove', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
    btn.style.setProperty('--click-x', x + '%');
    btn.style.setProperty('--click-y', y + '%');
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    // Paint splatter micro
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const splatter = document.createElement('div');
    splatter.className = 'paint-splatter';
    const size = 30 + Math.random() * 20;
    const colors = ['var(--accent)', 'var(--accent2)', 'var(--lavender)', 'var(--peach)'];
    splatter.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${x - size / 2}px; top: ${y - size / 2}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      opacity: 0.4;
    `;
    btn.appendChild(splatter);
    setTimeout(() => splatter.remove(), 700);

    // Micro-feedback: petal float away
    spawnPetal(e.clientX, e.clientY);
  });

  // -----------------------------------------------------------
  // 7. PETAL FLOAT MICRO-FEEDBACK
  // -----------------------------------------------------------
  function spawnPetal(x, y) {
    const petal = document.createElement('div');
    petal.className = 'floating-petal';
    const colors = ['#d4889a', '#8baa8b', '#c7a4cc', '#e8c4a0'];
    petal.style.cssText = `
      left: ${x}px; top: ${y}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      transform: rotate(${Math.random() * 360}deg);
    `;
    petalContainer.appendChild(petal);
    setTimeout(() => petal.remove(), 2000);
  }

  // -----------------------------------------------------------
  // 8. TOGGLE SWITCHES (smooth-slide-soft)
  // -----------------------------------------------------------
  document.querySelectorAll('.toggle-switch').forEach(toggle => {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      // Smooth GSAP spring if available
      if (typeof gsap !== 'undefined') {
        const thumb = toggle.querySelector('.toggle-thumb');
        const isActive = toggle.classList.contains('active');
        gsap.to(thumb, {
          x: isActive ? 20 : 0,
          duration: 0.5,
          ease: 'power2.inOut'
        });
      }
      // Micro petal feedback
      const rect = toggle.getBoundingClientRect();
      spawnPetal(rect.left + rect.width / 2, rect.top);
    });
  });

  // -----------------------------------------------------------
  // 9. TOOLTIPS (soft-cloud-popup via Tippy.js)
  // -----------------------------------------------------------
  function initTooltips() {
    if (typeof tippy === 'undefined') return;
    tippy('[data-tooltip]', {
      content: (ref) => ref.getAttribute('data-tooltip'),
      animation: 'scale',
      duration: [300, 200],
      placement: 'top',
      offset: [0, 10],
      arrow: true,
      inertia: true
    });
  }

  // -----------------------------------------------------------
  // 10. SPLITTING.JS — Character cascade reveal for titles
  // -----------------------------------------------------------
  function initSplitting() {
    if (typeof Splitting === 'undefined') return;
    // We initialize on navigation
  }

  // -----------------------------------------------------------
  // 11. SCROLL REVEAL (paint-stroke-reveal)
  //     Using GSAP ScrollTrigger
  // -----------------------------------------------------------
  function initScrollReveals() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Reveal cards, panels, sections on scroll
    const revealElements = document.querySelectorAll(
      '.stat-panel, .card, .project-card, .kanban-card, .idea-card, .workspace-section, .settings-section, .schema-entity, .wb-node, .chat-message'
    );

    revealElements.forEach((el, i) => {
      if (el._scrollRevealInit) return;
      el._scrollRevealInit = true;

      // Only apply to visible view
      const parentView = el.closest('.view');
      if (!parentView || !parentView.classList.contains('active')) return;

      gsap.fromTo(el,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          delay: i * 0.04,
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            once: true
          }
        }
      );
    });

    ScrollTrigger.refresh();
  }

  // -----------------------------------------------------------
  // 12. AMBIENT CANVAS (color-wash-drift)
  //     Slow-drifting pastel watercolor washes
  // -----------------------------------------------------------
  function initAmbientCanvas() {
    const ctx = ambientCanvas.getContext('2d');
    let width, height;
    let blobs = [];

    function resize() {
      width = ambientCanvas.width = window.innerWidth;
      height = ambientCanvas.height = window.innerHeight;
    }

    function createBlobs() {
      blobs = [
        { x: width * 0.2, y: height * 0.3, radius: 250, color: 'rgba(212,136,154,0.08)', vx: 0.15, vy: 0.1 },
        { x: width * 0.7, y: height * 0.6, radius: 300, color: 'rgba(139,170,139,0.06)', vx: -0.12, vy: 0.08 },
        { x: width * 0.5, y: height * 0.2, radius: 220, color: 'rgba(199,164,204,0.05)', vx: 0.08, vy: -0.14 },
        { x: width * 0.3, y: height * 0.8, radius: 280, color: 'rgba(232,196,160,0.05)', vx: -0.1, vy: -0.06 }
      ];
    }

    function drawBlob(blob) {
      const gradient = ctx.createRadialGradient(
        blob.x, blob.y, 0,
        blob.x, blob.y, blob.radius
      );
      gradient.addColorStop(0, blob.color);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      blobs.forEach(blob => {
        blob.x += blob.vx;
        blob.y += blob.vy;
        // Soft bounce at edges
        if (blob.x < -blob.radius) blob.vx = Math.abs(blob.vx);
        if (blob.x > width + blob.radius) blob.vx = -Math.abs(blob.vx);
        if (blob.y < -blob.radius) blob.vy = Math.abs(blob.vy);
        if (blob.y > height + blob.radius) blob.vy = -Math.abs(blob.vy);
        drawBlob(blob);
      });
      requestAnimationFrame(animate);
    }

    resize();
    createBlobs();
    animate();

    window.addEventListener('resize', () => {
      resize();
      createBlobs();
    });
  }

  // -----------------------------------------------------------
  // 13. NAV ITEM HOVER (wash-highlight-appear)
  //     Soft watercolor wash bg on hover — handled in CSS
  //     Adding JS for GSAP extra smoothness
  // -----------------------------------------------------------
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(item, { scale: 1.01, duration: 0.3, ease: 'power2.out' });
      }
    });
    item.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(item, { scale: 1, duration: 0.3, ease: 'power2.out' });
      }
    });
  });

  // -----------------------------------------------------------
  // 14. CARD HOVER (wash-border-bleed)
  //     Handled mostly in CSS; GSAP adds lift
  // -----------------------------------------------------------
  document.querySelectorAll('.project-card, .kanban-card, .idea-card, .stat-panel').forEach(card => {
    card.addEventListener('mouseenter', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(card, { y: -3, duration: 0.4, ease: 'power2.out' });
      }
    });
    card.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(card, { y: 0, duration: 0.4, ease: 'power2.out' });
      }
    });
  });

  // -----------------------------------------------------------
  // 15. INPUT FOCUS (soft-blush-border-glow)
  //     Handled in CSS transitions
  // -----------------------------------------------------------

  // -----------------------------------------------------------
  // 16. WHITEBOARD — Draw SVG connectors with Vivus-like stroke
  // -----------------------------------------------------------
  function animateWhiteboardConnectors() {
    const connectors = document.querySelectorAll('.wb-connector');
    connectors.forEach((path, i) => {
      const length = path.getTotalLength ? path.getTotalLength() : 200;
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
      if (typeof gsap !== 'undefined') {
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1.2,
          delay: 0.3 + i * 0.2,
          ease: 'power2.inOut'
        });
      } else {
        path.style.transition = `stroke-dashoffset 1.2s ${0.3 + i * 0.2}s ease`;
        setTimeout(() => { path.style.strokeDashoffset = '0'; }, 50);
      }
    });
  }

  // Schema connector animation
  function animateSchemaLines() {
    const lines = document.querySelectorAll('.schema-line');
    lines.forEach((line, i) => {
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(line,
          { opacity: 0 },
          { opacity: 0.3, duration: 0.8, delay: 0.4 + i * 0.15, ease: 'power2.out' }
        );
      }
    });
  }

  // Observe when whiteboard or schema view becomes active
  const viewObserver = new MutationObserver((mutations) => {
    mutations.forEach(mut => {
      if (mut.target.classList.contains('active')) {
        const page = mut.target.dataset.page;
        if (page === 'whiteboard') animateWhiteboardConnectors();
        if (page === 'schema-planner') animateSchemaLines();
      }
    });
  });
  document.querySelectorAll('.view').forEach(view => {
    viewObserver.observe(view, { attributes: true, attributeFilter: ['class'] });
  });

  // -----------------------------------------------------------
  // 17. CHAT — Simple send functionality
  // -----------------------------------------------------------
  const chatSendBtn = document.querySelector('.chat-send-btn');
  const chatInput = document.querySelector('.chat-input');
  const chatMessages = document.getElementById('chat-messages');

  if (chatSendBtn && chatInput) {
    chatSendBtn.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }

  function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Add user message
    const msgEl = document.createElement('div');
    msgEl.className = 'chat-message user-message';
    msgEl.innerHTML = `
      <div class="message-paper">
        <div class="brushstroke-msg-divider"></div>
        <div class="message-author">Sage</div>
        <p>${escapeHtml(text)}</p>
        <time>Just now</time>
      </div>
    `;
    chatMessages.appendChild(msgEl);
    chatInput.value = '';

    // GSAP entrance
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(msgEl, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
    }

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Petal feedback
    const rect = chatSendBtn.getBoundingClientRect();
    spawnPetal(rect.left, rect.top);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        'That is a lovely thought. The connection between intention and practice grows deeper when we honor it with ritual and presence.',
        'I see the vision clearly. Let me think about how we might weave that into the existing framework of the retreat experience.',
        'What a beautiful way to approach this. The seasonal rhythm you describe aligns perfectly with the natural cycles we are working with.',
        'Yes, I think that would resonate deeply with the community. Shall I draft an outline for how this might unfold?'
      ];
      const aiMsg = document.createElement('div');
      aiMsg.className = 'chat-message ai-message';
      aiMsg.innerHTML = `
        <div class="message-paper">
          <div class="brushstroke-msg-divider"></div>
          <div class="message-author">Muse</div>
          <p>${aiResponses[Math.floor(Math.random() * aiResponses.length)]}</p>
          <time>Just now</time>
        </div>
      `;
      chatMessages.appendChild(aiMsg);
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(aiMsg, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
      }
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1500);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // -----------------------------------------------------------
  // 18. KANBAN DRAG — Basic reorder with visual feedback
  // -----------------------------------------------------------
  document.querySelectorAll('.kanban-card').forEach(card => {
    card.setAttribute('draggable', 'true');
    card.addEventListener('dragstart', (e) => {
      card.style.opacity = '0.5';
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', '');
    });
    card.addEventListener('dragend', () => {
      card.style.opacity = '1';
    });
  });

  document.querySelectorAll('.kanban-cards').forEach(col => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      col.style.background = 'rgba(212,136,154,0.04)';
    });
    col.addEventListener('dragleave', () => {
      col.style.background = '';
    });
    col.addEventListener('drop', (e) => {
      e.preventDefault();
      col.style.background = '';
      const draggedCard = document.querySelector('.kanban-card[style*="opacity: 0.5"]');
      if (draggedCard) {
        col.appendChild(draggedCard);
        draggedCard.style.opacity = '1';
        // Petal feedback on successful drop
        spawnPetal(e.clientX, e.clientY);
      }
    });
  });

  // -----------------------------------------------------------
  // 19. DIRECTORY TREE — Collapse/expand branches
  // -----------------------------------------------------------
  document.querySelectorAll('.tree-branch-label').forEach(label => {
    label.style.cursor = 'pointer';
    label.addEventListener('click', () => {
      const branch = label.closest('.tree-branch');
      const subTree = branch.querySelector(':scope > ul');
      if (!subTree) return;
      const isHidden = subTree.style.display === 'none';
      if (typeof gsap !== 'undefined') {
        if (isHidden) {
          subTree.style.display = '';
          gsap.fromTo(subTree, { opacity: 0, height: 0 }, { opacity: 1, height: 'auto', duration: 0.4, ease: 'power2.out' });
        } else {
          gsap.to(subTree, {
            opacity: 0, height: 0, duration: 0.3, ease: 'power2.in',
            onComplete: () => { subTree.style.display = 'none'; }
          });
        }
      } else {
        subTree.style.display = isHidden ? '' : 'none';
      }
    });
  });

  // -----------------------------------------------------------
  // 20. SEARCH — Filter projects
  // -----------------------------------------------------------
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      document.querySelectorAll('.project-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        const match = !query || text.includes(query);
        card.style.display = match ? '' : 'none';
        if (match && typeof gsap !== 'undefined') {
          gsap.fromTo(card, { opacity: 0.5 }, { opacity: 1, duration: 0.3 });
        }
      });
    });
  }

  // -----------------------------------------------------------
  // INIT
  // -----------------------------------------------------------
  function init() {
    // Determine initial view from hash
    const hash = window.location.hash.replace('#', '');
    navigateTo(hash || DEFAULT_VIEW, true);

    // Init libraries
    initTooltips();
    initSplitting();

    // Hide loading after a beat
    hideLoading();
  }

  // Wait for DOM and fonts
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
