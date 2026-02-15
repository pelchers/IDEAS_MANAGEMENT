/**
 * OBSIDIAN FORGE — Slate Pass 3
 * Navigation, interactions, library initialization
 *
 * Libraries used:
 * - Anime.js: staggered scroll reveals, card entrance animations, volcanic crack pulses
 * - SortableJS: kanban card drag-and-drop
 */

(function () {
  'use strict';

  /* ===================================================================
     LOADING STATE — magma-flow-fill
     =================================================================== */

  const loadingOverlay = document.getElementById('loadingOverlay');

  function hideLoading() {
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
      setTimeout(() => { loadingOverlay.style.display = 'none'; }, 700);
    }
  }

  // Simulate loading (magma bar animation runs via CSS for 2s)
  setTimeout(hideLoading, 2200);


  /* ===================================================================
     HASH-BASED NAVIGATION
     Shell: top-tab-strip / browser-tab-row
     Content: full-width-panels
     Transition: volcanic-crack-shatter (slide left/right)
     =================================================================== */

  const views = [
    'dashboard', 'projects', 'project-workspace', 'kanban',
    'whiteboard', 'schema-planner', 'directory-tree', 'ideas',
    'ai-chat', 'settings'
  ];

  const tabBtns = document.querySelectorAll('.tab-btn[data-view]');
  const mobileBtns = document.querySelectorAll('.mobile-nav-item[data-view]');
  const panels = document.querySelectorAll('.view-panel[data-page]');
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const mobileOverlay = document.getElementById('mobileNavOverlay');

  let currentView = 'dashboard';
  let isTransitioning = false;

  function navigateTo(viewName) {
    if (viewName === currentView || isTransitioning) return;
    if (!views.includes(viewName)) return;

    isTransitioning = true;
    const currentIdx = views.indexOf(currentView);
    const nextIdx = views.indexOf(viewName);
    const direction = nextIdx > currentIdx ? 1 : -1;

    // Mark current as exiting
    const currentPanel = document.querySelector(`.view-panel[data-page="${currentView}"]`);
    const nextPanel = document.querySelector(`.view-panel[data-page="${viewName}"]`);

    if (currentPanel) {
      currentPanel.classList.add('exiting');
      currentPanel.classList.remove('active');
    }

    // Prepare next panel entrance direction
    if (nextPanel) {
      nextPanel.style.transform = `translateX(${direction * 40}px)`;
      nextPanel.style.opacity = '0';
      // Force reflow
      void nextPanel.offsetWidth;
      nextPanel.classList.add('active');
      nextPanel.style.transform = '';
      nextPanel.style.opacity = '';
    }

    // Update tab buttons
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
      btn.setAttribute('aria-selected', btn.dataset.view === viewName);
    });
    mobileBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Close mobile nav
    closeMobileNav();

    // Cleanup after transition
    setTimeout(() => {
      if (currentPanel) {
        currentPanel.classList.remove('exiting');
      }
      currentView = viewName;
      isTransitioning = false;

      // Run scroll reveals and entrance animations for the new view
      runEntranceAnimations(viewName);
    }, 400);

    // Update hash
    history.replaceState(null, '', `#${viewName}`);
  }

  // Bind tab clicks
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.view));
  });
  mobileBtns.forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.view));
  });

  // Mobile menu toggle
  function closeMobileNav() {
    mobileToggle.classList.remove('open');
    mobileOverlay.classList.remove('open');
  }
  mobileToggle.addEventListener('click', () => {
    const isOpen = mobileOverlay.classList.contains('open');
    mobileToggle.classList.toggle('open', !isOpen);
    mobileOverlay.classList.toggle('open', !isOpen);
  });

  // Read initial hash
  function initFromHash() {
    const hash = window.location.hash.replace('#', '');
    if (views.includes(hash) && hash !== 'dashboard') {
      // Set initial view without animation
      panels.forEach(p => p.classList.remove('active'));
      const target = document.querySelector(`.view-panel[data-page="${hash}"]`);
      if (target) target.classList.add('active');
      tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === hash);
        btn.setAttribute('aria-selected', btn.dataset.view === hash);
      });
      mobileBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === hash);
      });
      currentView = hash;
    }
  }
  initFromHash();


  /* ===================================================================
     BUTTON INTERACTIONS
     Hover: ember-glow-from-cracks (CSS handles gradient overlay)
     Click: magma-pulse-burst
     =================================================================== */

  function addMagmaPulse(btn) {
    btn.addEventListener('click', function (e) {
      this.classList.remove('clicked');
      void this.offsetWidth;
      this.classList.add('clicked');
      setTimeout(() => this.classList.remove('clicked'), 550);
    });
  }

  document.querySelectorAll('.action-btn, .chat-send-btn').forEach(addMagmaPulse);


  /* ===================================================================
     CARD HOVER — obsidian-reflection-shift
     The CSS .card-reflection element slides across on hover.
     No extra JS needed — CSS handles it.
     =================================================================== */


  /* ===================================================================
     TOOLTIP — obsidian-shard-popup
     =================================================================== */

  const tooltip = document.getElementById('obsidianTooltip');
  const tooltipTriggers = document.querySelectorAll('[data-tooltip]');

  tooltipTriggers.forEach(el => {
    el.addEventListener('mouseenter', function (e) {
      const text = this.dataset.tooltip;
      if (!text) return;
      tooltip.textContent = text;
      tooltip.classList.add('visible');
      positionTooltip(e);
    });
    el.addEventListener('mousemove', positionTooltip);
    el.addEventListener('mouseleave', () => {
      tooltip.classList.remove('visible');
    });
  });

  function positionTooltip(e) {
    const x = e.clientX;
    const y = e.clientY;
    tooltip.style.left = (x - tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = (y - tooltip.offsetHeight - 16) + 'px';
  }


  /* ===================================================================
     TOGGLE SWITCH — lava-flow-slide
     CSS handles the lava trail animation.
     JS adds micro-feedback toast on toggle.
     =================================================================== */

  document.querySelectorAll('.lava-toggle input').forEach(toggle => {
    toggle.addEventListener('change', function () {
      const label = this.closest('.setting-row')?.querySelector('.setting-label')?.textContent || 'Setting';
      const state = this.checked ? 'enabled' : 'disabled';
      showEmberToast(`${label} ${state}`);
    });
  });


  /* ===================================================================
     MICRO-FEEDBACK — ember-flare-success toast
     =================================================================== */

  const toastEl = document.getElementById('emberToast');
  let toastTimer = null;

  function showEmberToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.classList.add('visible');
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('visible');
    }, 2000);
  }


  /* ===================================================================
     SCROLL REVEAL — ember-rise-from-below (using Anime.js)
     =================================================================== */

  function runEntranceAnimations(viewName) {
    if (typeof anime === 'undefined') return;

    const panel = document.querySelector(`.view-panel[data-page="${viewName}"]`);
    if (!panel) return;

    // Stagger card entrances
    const cards = panel.querySelectorAll('.glass-card, .activity-item, .kanban-card, .idea-tile, .schema-entity, .setting-row, .tree-branch, .chat-msg');
    if (cards.length > 0) {
      anime({
        targets: Array.from(cards),
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        delay: anime.stagger(50, { start: 100 }),
        easing: 'easeOutCubic'
      });
    }

    // Volcanic divider glow pulse
    const dividers = panel.querySelectorAll('.volcanic-divider');
    if (dividers.length > 0) {
      anime({
        targets: Array.from(dividers),
        opacity: [0, 0.3],
        duration: 800,
        delay: 300,
        easing: 'easeInOutQuad'
      });
    }
  }

  // Run entrance for initial view
  setTimeout(() => runEntranceAnimations(currentView), 2400);


  /* ===================================================================
     IDLE AMBIENT — ember-crack-pulse
     The CSS ambient-cracks element pulses via CSS animation.
     Anime.js adds subtle additional animation to the cracks.
     =================================================================== */

  function initAmbientCracks() {
    if (typeof anime === 'undefined') return;
    const cracks = document.getElementById('ambientCracks');
    if (!cracks) return;

    // Slowly cycle the opacity for organic feel
    anime({
      targets: cracks,
      opacity: [0.04, 0.1],
      duration: 6000,
      easing: 'easeInOutSine',
      direction: 'alternate',
      loop: true
    });
  }
  setTimeout(initAmbientCracks, 2500);


  /* ===================================================================
     KANBAN — SortableJS drag and drop
     =================================================================== */

  function initKanban() {
    if (typeof Sortable === 'undefined') return;

    document.querySelectorAll('.kanban-cards').forEach(col => {
      Sortable.create(col, {
        group: 'kanban',
        animation: 200,
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        onEnd: function (evt) {
          // Update column counts
          document.querySelectorAll('.kanban-col').forEach(column => {
            const cards = column.querySelectorAll('.kanban-card');
            const countEl = column.querySelector('.col-count');
            if (countEl) countEl.textContent = cards.length;
          });
          showEmberToast('Card repositioned');
        }
      });
    });
  }
  setTimeout(initKanban, 2500);


  /* ===================================================================
     DIRECTORY TREE — expand/collapse with ember glow
     =================================================================== */

  document.querySelectorAll('.branch-toggle').forEach(btn => {
    btn.addEventListener('click', function () {
      const children = this.parentElement.querySelector('.tree-children');
      if (!children) return;

      const isOpen = children.classList.contains('open');
      children.classList.toggle('open', !isOpen);
      this.classList.toggle('expanded', !isOpen);

      // Animate children entrance with Anime.js
      if (!isOpen && typeof anime !== 'undefined') {
        const items = children.querySelectorAll('.tree-leaf, .tree-branch');
        anime({
          targets: Array.from(items),
          opacity: [0, 1],
          translateX: [-10, 0],
          duration: 300,
          delay: anime.stagger(40),
          easing: 'easeOutCubic'
        });
      }
    });
  });


  /* ===================================================================
     AI CHAT — message input handling
     =================================================================== */

  const chatInput = document.getElementById('chatInput');
  const chatSendBtn = document.getElementById('chatSendBtn');
  const chatMessages = document.getElementById('chatMessages');

  function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Create user message
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg msg-user obsidian-msg';
    msgDiv.innerHTML = `
      <div class="msg-avatar">JD</div>
      <div class="msg-content">
        <div class="msg-text">${escapeHtml(text)}</div>
        <div class="msg-time mono-tag">${getCurrentTime()}</div>
      </div>
    `;
    chatMessages.appendChild(msgDiv);
    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Simulate AI response after delay
    setTimeout(() => {
      const aiDiv = document.createElement('div');
      aiDiv.className = 'chat-msg msg-ai ember-msg';
      aiDiv.innerHTML = `
        <div class="msg-avatar forge-avatar">
          <svg viewBox="0 0 20 20" fill="#ff6600"><path d="M10 2L2 7v6l8 5 8-5V7L10 2z"/></svg>
        </div>
        <div class="msg-content">
          <div class="msg-text heated-text">I understand your inquiry regarding "${escapeHtml(text.substring(0, 50))}". Based on our horological database, I recommend consulting the relevant caliber specifications. The tolerance parameters should be cross-referenced with the COSC certification requirements for optimal accuracy.</div>
          <div class="msg-time mono-tag">${getCurrentTime()}</div>
        </div>
      `;
      chatMessages.appendChild(aiDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      showEmberToast('Forge Intelligence responded');
    }, 1500);
  }

  chatSendBtn?.addEventListener('click', sendChatMessage);
  chatInput?.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') sendChatMessage();
  });

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function getCurrentTime() {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  }


  /* ===================================================================
     WHITEBOARD & SCHEMA — magma vein glow animation via Anime.js
     =================================================================== */

  function initMagmaVeins() {
    if (typeof anime === 'undefined') return;

    anime({
      targets: '.magma-vein',
      strokeDashoffset: [anime.setDashoffset, 0],
      opacity: [0.3, 1],
      duration: 2000,
      delay: anime.stagger(200),
      easing: 'easeInOutSine',
      direction: 'alternate',
      loop: true
    });
  }
  setTimeout(initMagmaVeins, 3000);


  /* ===================================================================
     PROGRESS BAR ANIMATIONS
     =================================================================== */

  function animateProgressBars() {
    if (typeof anime === 'undefined') return;

    document.querySelectorAll('.progress-fill').forEach(bar => {
      const targetWidth = bar.style.width;
      bar.style.width = '0%';
      anime({
        targets: bar,
        width: targetWidth,
        duration: 1200,
        delay: 300,
        easing: 'easeOutCubic'
      });
    });
  }
  // Run when projects tab is shown
  const originalNav = navigateTo;


  /* ===================================================================
     KEYBOARD NAVIGATION
     =================================================================== */

  document.addEventListener('keydown', function (e) {
    // Ctrl+1 through Ctrl+0 for quick tab switch
    if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
      e.preventDefault();
      const idx = parseInt(e.key) - 1;
      if (views[idx]) navigateTo(views[idx]);
    }
    if (e.ctrlKey && e.key === '0') {
      e.preventDefault();
      navigateTo(views[9]); // settings
    }
    // Escape to close mobile nav
    if (e.key === 'Escape') {
      closeMobileNav();
    }
  });

})();
