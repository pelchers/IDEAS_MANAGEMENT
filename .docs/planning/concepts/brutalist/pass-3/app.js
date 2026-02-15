/* ============================================================
   VAULTCTL — Brutalist Pass 3: Terminal/CLI CRT Aesthetic
   app.js — Navigation, Interactions, Library Init
   ============================================================ */

(function () {
  'use strict';

  // --- STATE ---
  let currentView = 'dashboard';
  let bootComplete = false;
  let helpOpen = false;
  let mobileNavOpen = false;

  // --- DOM REFS ---
  const bootScreen = document.getElementById('boot-screen');
  const bootText = document.getElementById('boot-text');
  const bootSpinner = document.getElementById('boot-spinner');
  const terminalShell = document.getElementById('terminal-shell');
  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.view');
  const statusCommand = document.getElementById('status-command');
  const clockEl = document.getElementById('clock');
  const microFeedback = document.getElementById('micro-feedback');
  const helpModal = document.getElementById('help-modal');
  const manTooltip = document.getElementById('man-tooltip');
  const sidebar = document.getElementById('nav-sidebar');

  // --- BOOT SEQUENCE ---
  const bootLines = [
    'BIOS POST... OK',
    'Memory test: 16384 MB... OK',
    'Loading kernel modules...',
    '  [OK] net_sentinel.ko',
    '  [OK] crypto_vault.ko',
    '  [OK] threat_intel.ko',
    '  [OK] anomaly_detect.ko',
    'Initializing network interfaces... eth0 UP',
    'Starting firewall daemon... pid 1337',
    'Loading threat intelligence feeds... 14 sources',
    'Connecting to SOC cluster... authenticated',
    'Starting VAULTCTL v4.2.1...',
    '',
    '  _    _____   __  ____   __________  __',
    '  | |  / /   | / / / / /  /_  __/ __ \\/ /',
    '  | | / / /| |/ / / / /    / / / /   / /',
    '  | |/ / ___ / /_/ / /____/ / / /___/ /___',
    '  |___/_/  |_\\____/_____/___/  \\____/_____/',
    '',
    'System ready. Type a command or use [1]-[0] keys.',
  ];

  async function runBoot() {
    const spinChars = ['|', '/', '-', '\\'];
    let spinIdx = 0;
    const spinInterval = setInterval(() => {
      bootSpinner.textContent = spinChars[spinIdx % 4];
      spinIdx++;
    }, 100);

    let output = '';
    for (let i = 0; i < bootLines.length; i++) {
      output += bootLines[i] + '\n';
      bootText.textContent = output;
      await sleep(60 + Math.random() * 40);
    }

    clearInterval(spinInterval);
    bootSpinner.textContent = '';
    await sleep(400);

    bootScreen.classList.add('hidden');
    terminalShell.classList.add('visible');
    bootComplete = true;

    // Initialize typed.js on status bar
    initStatusTyped();
    initScrollReveal();
    showMicroFeedback('[OK] System initialized');
  }

  // --- NAVIGATION (hash-based) ---
  function navigateTo(viewName) {
    if (viewName === currentView) return;

    const targetView = document.querySelector(`[data-page="${viewName}"]`);
    if (!targetView) return;

    // Update hash
    window.location.hash = viewName;

    // Update nav items (navItemActive: arrow-cursor-prefix)
    navItems.forEach(item => {
      const arrow = item.querySelector('.nav-arrow');
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
        if (arrow) arrow.textContent = '>';
      } else {
        item.classList.remove('active');
        if (arrow) arrow.textContent = '\u00A0';
      }
    });

    // Page transition (terminal-clear-redraw)
    const currentEl = document.querySelector(`.view.active`);
    if (currentEl) {
      currentEl.classList.remove('active');
    }

    targetView.classList.add('active', 'transitioning');
    setTimeout(() => {
      targetView.classList.remove('transitioning');
    }, 400);

    currentView = viewName;

    // Update status bar command
    const commandMap = {
      'dashboard': 'show dashboard --metrics',
      'projects': 'ls -la /vault/projects/',
      'project-workspace': 'tmux attach -t sentinel-shield',
      'kanban': 'cat /vault/kanban/priority-matrix.tbl',
      'whiteboard': 'cat /vault/whiteboard/threat-model.flow',
      'schema-planner': 'cat /vault/schema/threat_intelligence.sql',
      'directory-tree': 'tree /vault/sentinel-shield/ -L 3',
      'ideas': 'grep -rn "" /vault/ideas/ | head -12',
      'ai-chat': 'sentinel-ai --model gpt-sec-4 --context vault',
      'settings': 'cat /etc/vaultctl/sentinel.ini'
    };

    typeStatusCommand(commandMap[viewName] || viewName);
    showMicroFeedback('[OK] ' + viewName);

    // Reinitialize scroll reveal for new view
    initScrollReveal();
  }

  // Status bar typed command effect
  function typeStatusCommand(cmd) {
    statusCommand.textContent = '';
    let i = 0;
    const interval = setInterval(() => {
      if (i < cmd.length) {
        statusCommand.textContent += cmd[i];
        i++;
      } else {
        clearInterval(interval);
      }
    }, 20);
  }

  // Init typed.js for initial status
  function initStatusTyped() {
    typeStatusCommand('show dashboard --metrics');
  }

  // --- KEYBOARD NAVIGATION ---
  document.addEventListener('keydown', function (e) {
    if (!bootComplete) return;

    // Close help modal
    if (helpOpen && (e.key === 'Escape' || e.key === 'q' || e.key === 'Q')) {
      closeHelp();
      e.preventDefault();
      return;
    }

    // Close mobile nav on Escape
    if (mobileNavOpen && e.key === 'Escape') {
      closeMobileNav();
      e.preventDefault();
      return;
    }

    // Don't intercept if typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    // Number keys for navigation
    const keyMap = {
      '1': 'dashboard',
      '2': 'projects',
      '3': 'project-workspace',
      '4': 'kanban',
      '5': 'whiteboard',
      '6': 'schema-planner',
      '7': 'directory-tree',
      '8': 'ideas',
      '9': 'ai-chat',
      '0': 'settings'
    };

    if (keyMap[e.key]) {
      navigateTo(keyMap[e.key]);
      e.preventDefault();
      return;
    }

    // H for help
    if (e.key === 'h' || e.key === 'H') {
      openHelp();
      e.preventDefault();
      return;
    }

    // Q to quit (close mobile nav or just feedback)
    if (e.key === 'q' || e.key === 'Q') {
      if (mobileNavOpen) closeMobileNav();
      showMicroFeedback('[INFO] Cannot quit — this is a browser');
      e.preventDefault();
      return;
    }
  });

  // --- CLICK NAVIGATION ---
  navItems.forEach(item => {
    item.addEventListener('click', function () {
      const view = this.getAttribute('data-view');
      navigateTo(view);

      // buttonClick: flash-green-outline
      this.classList.add('btn-flash');
      setTimeout(() => this.classList.remove('btn-flash'), 200);

      // Close mobile nav
      if (mobileNavOpen) closeMobileNav();
    });
  });

  // --- HASH ROUTING ---
  function handleHash() {
    const hash = window.location.hash.replace('#', '');
    if (hash && document.querySelector(`[data-page="${hash}"]`)) {
      navigateTo(hash);
    }
  }

  window.addEventListener('hashchange', handleHash);

  // --- MOBILE NAV ---
  function createMobileToggle() {
    const btn = document.createElement('button');
    btn.id = 'mobile-nav-toggle';
    btn.textContent = '>';
    btn.setAttribute('aria-label', 'Toggle navigation');
    document.body.appendChild(btn);

    btn.addEventListener('click', function () {
      if (mobileNavOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  function openMobileNav() {
    sidebar.classList.add('open');
    mobileNavOpen = true;
    const toggle = document.getElementById('mobile-nav-toggle');
    if (toggle) toggle.textContent = '<';
  }

  function closeMobileNav() {
    sidebar.classList.remove('open');
    mobileNavOpen = false;
    const toggle = document.getElementById('mobile-nav-toggle');
    if (toggle) toggle.textContent = '>';
  }

  // --- SCROLL REVEAL (typewriter-line-print) ---
  function initScrollReveal() {
    const activeView = document.querySelector('.view.active');
    if (!activeView) return;

    const blocks = activeView.querySelectorAll(
      '.metric-block, .ls-row, .idea-entry, .task-entry, .sparkline-block, .chat-line, .dashboard-table, .recent-alerts'
    );

    blocks.forEach((block, i) => {
      block.classList.remove('scroll-reveal', 'revealed');
      block.classList.add('scroll-reveal');
    });

    // Use IntersectionObserver for scroll-triggered reveal
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          // Stagger the reveal
          const delay = Array.from(blocks).indexOf(entry.target) * 50;
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, root: activeView });

    blocks.forEach(block => observer.observe(block));
  }

  // --- CLOCK ---
  function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    if (clockEl) clockEl.textContent = h + ':' + m + ':' + s;
  }

  setInterval(updateClock, 1000);
  updateClock();

  // --- TOGGLE SWITCHES (text-toggle [ON]/[OFF]) ---
  document.querySelectorAll('.ini-toggle').forEach(toggle => {
    toggle.setAttribute('tabindex', '0');
    toggle.setAttribute('role', 'switch');

    // Determine initial state from text
    const isOn = toggle.textContent.includes('ON');
    toggle.setAttribute('data-state', isOn ? 'on' : 'off');
    toggle.setAttribute('aria-checked', isOn ? 'true' : 'false');

    toggle.addEventListener('click', function () {
      toggleSwitch(this);
    });

    toggle.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleSwitch(this);
      }
    });
  });

  function toggleSwitch(el) {
    const isOn = el.getAttribute('data-state') === 'on';
    if (isOn) {
      el.textContent = '[OFF]';
      el.setAttribute('data-state', 'off');
      el.setAttribute('aria-checked', 'false');
      showMicroFeedback('[OK] ' + el.getAttribute('data-key') + '=OFF');
    } else {
      el.textContent = '[ON]';
      el.setAttribute('data-state', 'on');
      el.setAttribute('aria-checked', 'true');
      showMicroFeedback('[OK] ' + el.getAttribute('data-key') + '=ON');
    }

    // Flash feedback
    el.classList.add('btn-flash');
    setTimeout(() => el.classList.remove('btn-flash'), 200);
  }

  // --- EDITABLE CONFIG VALUES (cycle options) ---
  document.querySelectorAll('.ini-editable').forEach(editable => {
    editable.setAttribute('tabindex', '0');
    const options = editable.getAttribute('data-options');
    if (!options) return;

    const optArr = options.split(',').filter(o => o.trim());
    if (optArr.length === 0) return;

    editable.addEventListener('click', function () {
      cycleOption(this, optArr);
    });

    editable.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        cycleOption(this, optArr);
      }
    });
  });

  function cycleOption(el, options) {
    const current = el.textContent.trim();
    const idx = options.indexOf(current);
    const next = options[(idx + 1) % options.length];
    el.textContent = next;
    showMicroFeedback('[OK] ' + el.getAttribute('data-key') + '=' + next);

    el.classList.add('btn-flash');
    setTimeout(() => el.classList.remove('btn-flash'), 200);
  }

  // --- MICRO FEEDBACK (stdout-success-message) ---
  function showMicroFeedback(msg) {
    if (!microFeedback) return;
    microFeedback.textContent = msg;
    microFeedback.classList.remove('hidden');
    setTimeout(() => {
      microFeedback.classList.add('hidden');
    }, 2000);
  }

  // --- MAN-PAGE TOOLTIPS ---
  const tooltipData = {
    'dashboard': 'DASHBOARD(1)\n\nDisplay real-time system metrics,\nthreat levels, and recent alerts.\nASCII sparklines show 24h trends.',
    'projects': 'PROJECTS(1)\n\nList all security projects in\nls -la format. Status codes:\n  [ACTIVE] [REVIEW] [DONE] [STALE]',
    'project-workspace': 'WORKSPACE(1)\n\nTmux-style split-pane view.\nTop: project README and sprint data.\nBottom: interactive shell.',
    'kanban': 'KANBAN(1)\n\nEisenhower priority matrix.\nP0=Do First, P1=Schedule,\nP2=Delegate, P3=Backlog.',
    'whiteboard': 'WHITEBOARD(1)\n\nASCII flowchart for threat\nmodeling and architecture\ndiagrams.',
    'schema-planner': 'SCHEMA(1)\n\nSQL CREATE TABLE statements\nfor database schema planning.\nIncludes types and constraints.',
    'directory-tree': 'TREE(1)\n\nProject directory structure\nwith file sizes. Uses tree\ncommand output format.',
    'ideas': 'IDEAS(1)\n\nSearchable idea backlog with\nvotes and tags. Sorted by date\nDESC by default.',
    'ai-chat': 'AI-CHAT(1)\n\nSecurity AI assistant REPL.\nUser input after $ prompt.\nAI response prefixed with =>.',
    'settings': 'SETTINGS(1)\n\nINI-style configuration editor.\nClick [ON]/[OFF] to toggle.\nClick values to cycle options.'
  };

  // Show tooltip on long-press or right-click on nav items
  navItems.forEach(item => {
    let pressTimer;

    item.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      const viewName = this.getAttribute('data-view');
      showManTooltip(viewName, e.clientX, e.clientY);
    });

    // Long-press for touch
    item.addEventListener('mousedown', function (e) {
      const viewName = this.getAttribute('data-view');
      pressTimer = setTimeout(() => {
        showManTooltip(viewName, e.clientX, e.clientY);
      }, 600);
    });

    item.addEventListener('mouseup', function () {
      clearTimeout(pressTimer);
    });

    item.addEventListener('mouseleave', function () {
      clearTimeout(pressTimer);
    });
  });

  function showManTooltip(viewName, x, y) {
    const data = tooltipData[viewName];
    if (!data) return;

    const header = manTooltip.querySelector('.man-header');
    const body = manTooltip.querySelector('.man-body');

    header.textContent = viewName.toUpperCase() + '(1)';
    body.textContent = data;

    manTooltip.classList.remove('hidden');
    manTooltip.style.left = Math.min(x + 8, window.innerWidth - 340) + 'px';
    manTooltip.style.top = Math.min(y + 8, window.innerHeight - 200) + 'px';

    setTimeout(() => {
      manTooltip.classList.add('hidden');
    }, 4000);
  }

  document.addEventListener('click', function (e) {
    if (!manTooltip.contains(e.target)) {
      manTooltip.classList.add('hidden');
    }
  });

  // --- HELP MODAL ---
  function openHelp() {
    helpModal.classList.remove('hidden');
    helpOpen = true;
  }

  function closeHelp() {
    helpModal.classList.add('hidden');
    helpOpen = false;
  }

  helpModal.addEventListener('click', function (e) {
    if (e.target === helpModal) {
      closeHelp();
    }
  });

  // --- LOADING STATE (spinning-ascii-chars) ---
  function createAsciiSpinner(el) {
    const chars = ['|', '/', '-', '\\'];
    let idx = 0;
    return setInterval(() => {
      el.textContent = chars[idx % 4];
      idx++;
    }, 100);
  }

  // --- CARD HOVER (cursor-blink-indicator) ---
  // Already handled via CSS :focus pseudo-class with keyboard navigation
  // Add mouse-driven focus for ls-rows and idea-entries
  document.querySelectorAll('.ls-row, .idea-entry').forEach(row => {
    row.addEventListener('mouseenter', function () {
      this.focus();
    });
    row.addEventListener('mouseleave', function () {
      this.blur();
    });
  });

  // --- CRT FLICKER VARIATION ---
  function randomFlicker() {
    const flickerEl = document.getElementById('crt-flicker');
    const interval = 3000 + Math.random() * 8000;

    setTimeout(() => {
      flickerEl.style.animation = 'none';
      flickerEl.offsetHeight; // trigger reflow
      flickerEl.style.animation = 'crt-flicker-anim 0.3s';
      setTimeout(() => {
        flickerEl.style.animation = 'crt-flicker-anim 6s infinite';
      }, 300);
      randomFlicker();
    }, interval);
  }

  // --- TEXT PHOSPHOR GLOW PULSE (subtle) ---
  function initPhosphorPulse() {
    const banner = document.querySelector('.ascii-banner');
    if (!banner) return;

    let glowIntensity = 0.4;
    let direction = 1;

    setInterval(() => {
      glowIntensity += direction * 0.02;
      if (glowIntensity >= 0.7) direction = -1;
      if (glowIntensity <= 0.3) direction = 1;
      banner.style.textShadow = `0 0 8px rgba(0, 255, 136, ${glowIntensity}), 0 0 20px rgba(0, 255, 136, ${glowIntensity * 0.4})`;
    }, 100);
  }

  // --- INIT ---
  function init() {
    createMobileToggle();
    runBoot().then(() => {
      handleHash();
      randomFlicker();
      initPhosphorPulse();
    });
  }

  // --- UTILITIES ---
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
