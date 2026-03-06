/* ============================================= */
/* MINIMALISM PASS 2 — APP.JS                    */
/* Navigation, view transitions, interactions     */
/* ============================================= */

(function () {
  'use strict';

  /* ---- Constants ---- */
  var VIEWS = [
    'dashboard', 'projects', 'workspace', 'kanban',
    'whiteboard', 'schema', 'directory-tree', 'ideas',
    'ai-chat', 'settings'
  ];

  /* ---- DOM References ---- */
  var mainNav = document.getElementById('main-nav');
  var mobileNav = document.getElementById('mobile-nav');
  var mobileOverlay = document.getElementById('mobile-nav-overlay');
  var hamburger = document.getElementById('hamburger');
  var mainContent = document.getElementById('main-content');

  /* ============================================= */
  /* VIEW SWITCHING WITH CROSS-FADE                */
  /* ============================================= */
  function switchView(viewId) {
    if (VIEWS.indexOf(viewId) === -1) viewId = 'dashboard';

    /* Hide all views */
    var allViews = document.querySelectorAll('.view');
    allViews.forEach(function (v) {
      v.style.display = 'none';
      v.classList.remove('view-enter');
    });

    /* Show target view */
    var target = document.getElementById(viewId);
    if (!target) return;

    target.style.display = 'block';
    target.classList.add('view-enter');

    /* Animate entry with Anime.js */
    if (typeof anime !== 'undefined') {
      anime({
        targets: target,
        opacity: [0, 1],
        translateY: [8, 0],
        duration: 350,
        easing: 'easeOutCubic'
      });

      /* Stagger card reveals within the view */
      var cards = target.querySelectorAll(
        '.stat-card, .project-card, .kanban-card, .idea-card, .card, .entity-card, .integration-item'
      );
      if (cards.length > 0) {
        anime({
          targets: cards,
          opacity: [0, 1],
          translateY: [12, 0],
          delay: anime.stagger(40, { start: 100 }),
          duration: 300,
          easing: 'easeOutCubic'
        });
      }
    } else {
      target.style.opacity = '1';
      target.style.transform = 'none';
    }

    /* Update active nav links */
    updateActiveNav(viewId);

    /* Close mobile nav if open */
    closeMobileNav();

    /* Initialize whiteboard canvas if switching to whiteboard */
    if (viewId === 'whiteboard') {
      initWhiteboardCanvas();
    }
  }

  function updateActiveNav(viewId) {
    /* Desktop nav */
    var desktopLinks = mainNav.querySelectorAll('.nav-link');
    desktopLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('data-view') === viewId);
    });

    /* Mobile nav */
    var mobileLinks = mobileNav.querySelectorAll('.mobile-nav__link');
    mobileLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('data-view') === viewId);
    });
  }

  /* ============================================= */
  /* HASH ROUTING                                  */
  /* ============================================= */
  function getViewFromHash() {
    var hash = window.location.hash.replace('#', '');
    return (VIEWS.indexOf(hash) !== -1) ? hash : 'dashboard';
  }

  window.addEventListener('hashchange', function () {
    switchView(getViewFromHash());
  });

  /* ============================================= */
  /* NAVIGATION CLICK HANDLERS                     */
  /* ============================================= */
  /* Desktop nav */
  mainNav.addEventListener('click', function (e) {
    var link = e.target.closest('.nav-link');
    if (!link) return;
    e.preventDefault();
    var viewId = link.getAttribute('data-view');
    window.location.hash = viewId;
  });

  /* Mobile nav */
  mobileNav.addEventListener('click', function (e) {
    var link = e.target.closest('.mobile-nav__link');
    if (!link) return;
    e.preventDefault();
    var viewId = link.getAttribute('data-view');
    window.location.hash = viewId;
  });

  /* ============================================= */
  /* HAMBURGER / MOBILE NAV                        */
  /* ============================================= */
  function openMobileNav() {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('open');
    mobileOverlay.classList.add('visible');
  }

  function closeMobileNav() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    mobileOverlay.classList.remove('visible');
  }

  hamburger.addEventListener('click', function () {
    if (mobileNav.classList.contains('open')) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });

  mobileOverlay.addEventListener('click', closeMobileNav);

  /* ============================================= */
  /* FILTER BUTTONS (Projects)                     */
  /* ============================================= */
  var filterBar = document.querySelector('.filter-bar');
  if (filterBar) {
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filterBar.querySelectorAll('.filter-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');
    });
  }

  /* ============================================= */
  /* FILE TREE TOGGLES (Workspace + Directory)     */
  /* ============================================= */
  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('.file-tree__toggle, .dir-tree__toggle');
    if (!toggle) return;
    var folder = toggle.parentElement;
    if (folder) {
      folder.classList.toggle('open');
    }
  });

  /* ============================================= */
  /* WHITEBOARD CANVAS — Simple Drawing            */
  /* ============================================= */
  var whiteboardInitialized = false;

  function initWhiteboardCanvas() {
    if (whiteboardInitialized) return;
    whiteboardInitialized = true;

    var canvas = document.getElementById('whiteboard-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var isDrawing = false;
    var lastX = 0;
    var lastY = 0;
    var currentColor = '#1A1A2E';
    var currentTool = 'pen';

    /* Resize canvas to container */
    function resizeCanvas() {
      var rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = Math.max(300, Math.min(600, rect.width * 0.45));

      /* Draw grid pattern */
      drawGrid();
    }

    function drawGrid() {
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.5)';
      ctx.lineWidth = 0.5;
      var step = 20;
      for (var x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (var y = 0; y < canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    function getPos(e) {
      var rect = canvas.getBoundingClientRect();
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      var clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }

    function startDraw(e) {
      if (currentTool !== 'pen' && currentTool !== 'eraser') return;
      isDrawing = true;
      var pos = getPos(e);
      lastX = pos.x;
      lastY = pos.y;
    }

    function draw(e) {
      if (!isDrawing) return;
      e.preventDefault();
      var pos = getPos(e);

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = currentTool === 'eraser' ? '#F8FAFB' : currentColor;
      ctx.lineWidth = currentTool === 'eraser' ? 20 : 2;
      ctx.lineCap = 'round';
      ctx.stroke();

      lastX = pos.x;
      lastY = pos.y;
    }

    function stopDraw() {
      isDrawing = false;
    }

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseleave', stopDraw);
    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDraw);

    /* Tool selection */
    var toolBtns = document.querySelectorAll('.tool-btn');
    toolBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tool = btn.getAttribute('data-tool');
        if (!tool) return;
        toolBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentTool = tool;
        canvas.style.cursor = (tool === 'pen' || tool === 'eraser') ? 'crosshair' : 'default';
      });
    });

    /* Color swatches */
    var swatches = document.querySelectorAll('.swatch');
    swatches.forEach(function (swatch) {
      swatch.addEventListener('click', function () {
        currentColor = swatch.getAttribute('data-color');
        swatches.forEach(function (s) {
          s.style.borderColor = 'var(--color-border)';
        });
        swatch.style.borderColor = 'var(--color-accent)';
      });
    });

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  /* ============================================= */
  /* SETTINGS TABS                                 */
  /* ============================================= */
  var settingsTabs = document.querySelectorAll('.settings-tab');
  settingsTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var tabName = tab.getAttribute('data-settings-tab');

      /* Update tab styles */
      settingsTabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');

      /* Show/hide panels */
      document.querySelectorAll('.settings-panel').forEach(function (panel) {
        panel.style.display = 'none';
      });
      var panel = document.getElementById('settings-' + tabName);
      if (panel) {
        panel.style.display = 'block';

        /* Animate panel entry */
        if (typeof anime !== 'undefined') {
          anime({
            targets: panel,
            opacity: [0, 1],
            translateY: [6, 0],
            duration: 250,
            easing: 'easeOutCubic'
          });
        }
      }
    });
  });

  /* ============================================= */
  /* FONT SIZE RANGE SLIDER (Settings)             */
  /* ============================================= */
  var fontRange = document.getElementById('setting-font-size');
  var rangeValue = document.querySelector('.range-value');
  if (fontRange && rangeValue) {
    fontRange.addEventListener('input', function () {
      rangeValue.textContent = fontRange.value + 'px';
    });
  }

  /* ============================================= */
  /* AI CHAT — Mock Message Sending                */
  /* ============================================= */
  var chatInput = document.getElementById('chat-input');
  var chatSend = document.getElementById('chat-send');
  var chatMessages = document.getElementById('chat-messages');

  function sendChatMessage() {
    if (!chatInput || !chatMessages) return;
    var text = chatInput.value.trim();
    if (!text) return;

    /* User message */
    var userMsg = document.createElement('div');
    userMsg.className = 'chat-msg chat-msg--user';
    userMsg.innerHTML = '<div class="chat-msg__avatar">You</div>' +
      '<div class="chat-msg__bubble"><p>' + escapeHtml(text) + '</p></div>';
    chatMessages.appendChild(userMsg);

    chatInput.value = '';

    /* Animate user message */
    if (typeof anime !== 'undefined') {
      anime({
        targets: userMsg,
        opacity: [0, 1],
        translateX: [20, 0],
        duration: 250,
        easing: 'easeOutCubic'
      });
    }

    /* Mock AI reply after delay */
    setTimeout(function () {
      var aiMsg = document.createElement('div');
      aiMsg.className = 'chat-msg chat-msg--ai';
      var replies = [
        'That\'s a great point! Let me analyze your project data and get back to you with specific recommendations.',
        'I\'ve reviewed the related ideas in your backlog. Here are some connections I found that might help prioritize this.',
        'Based on your team\'s velocity data, I\'d estimate this would take about 2 sprints to complete. Want me to break it down into tasks?',
        'Interesting perspective. I can see how this relates to the user onboarding project. Should I create a dependency link?'
      ];
      var reply = replies[Math.floor(Math.random() * replies.length)];
      aiMsg.innerHTML = '<div class="chat-msg__avatar">AI</div>' +
        '<div class="chat-msg__bubble"><p>' + reply + '</p></div>';
      chatMessages.appendChild(aiMsg);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      if (typeof anime !== 'undefined') {
        anime({
          targets: aiMsg,
          opacity: [0, 1],
          translateX: [-20, 0],
          duration: 250,
          easing: 'easeOutCubic'
        });
      }
    }, 800);

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  if (chatSend) {
    chatSend.addEventListener('click', sendChatMessage);
  }
  if (chatInput) {
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ============================================= */
  /* WORKSPACE EDITOR TABS                         */
  /* ============================================= */
  var editorTabs = document.querySelectorAll('.workspace-editor__tab');
  editorTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      editorTabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
    });
  });

  /* ============================================= */
  /* INITIAL LOAD                                  */
  /* ============================================= */
  /* Set initial view from hash or default */
  var initialView = getViewFromHash();
  if (!window.location.hash) {
    window.location.hash = 'dashboard';
  } else {
    switchView(initialView);
  }

  /* Animate health bars on dashboard load */
  setTimeout(function () {
    var fills = document.querySelectorAll('.health-bar__fill');
    fills.forEach(function (fill) {
      var width = fill.style.width;
      fill.style.width = '0%';
      setTimeout(function () {
        fill.style.width = width;
      }, 100);
    });
  }, 200);

})();
