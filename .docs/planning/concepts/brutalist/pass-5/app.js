/* ============================================================
   RISE UP — Protest Poster Collage Brutalist UI
   Pass 5: app.js
   Navigation, interactions, library initialization
   ============================================================ */

(function () {
  'use strict';

  // ---- DOM REFERENCES ----
  const views = document.querySelectorAll('.view');
  const navBtns = document.querySelectorAll('.nav-btn');
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
  const loadingOverlay = document.getElementById('loading-overlay');
  const microFeedback = document.getElementById('micro-feedback');
  const shoutTooltip = document.getElementById('shout-tooltip');

  // ---- LOADING STATE (megaphone pulse spin) ----
  function hideLoading() {
    setTimeout(function () {
      loadingOverlay.classList.add('hidden');
      // Trigger initial scroll reveals
      revealOnScroll();
    }, 800);
  }

  // ---- NAVIGATION ----
  let currentView = 'dashboard';

  function switchView(viewId) {
    if (viewId === currentView) return;

    // Hide all views
    views.forEach(function (v) {
      v.classList.remove('active', 'rip-enter');
    });

    // Show target view with rip animation
    var target = document.getElementById('view-' + viewId);
    if (target) {
      target.classList.add('active', 'rip-enter');
      currentView = viewId;

      // Update nav active states
      navBtns.forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.view === viewId);
      });

      mobileNavItems.forEach(function (item) {
        item.classList.toggle('active', item.dataset.view === viewId);
      });

      // Close mobile nav
      closeMobileNav();

      // Re-trigger scroll reveals for new view
      setTimeout(revealOnScroll, 100);

      // Re-init sortable for kanban
      if (viewId === 'kanban') {
        setTimeout(initSortable, 200);
      }

      // Scroll to top
      window.scrollTo({ top: 0 });

      // Micro feedback
      showMicroFeedback();
    }
  }

  // Top bar nav clicks
  navBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      switchView(this.dataset.view);
    });
  });

  // Mobile nav clicks
  mobileNavItems.forEach(function (item) {
    item.addEventListener('click', function () {
      switchView(this.dataset.view);
    });
  });

  // ---- MOBILE MENU ----
  function openMobileNav() {
    mobileNav.classList.add('show');
    mobileNavOverlay.classList.add('show');
    mobileMenuToggle.classList.add('open');
  }

  function closeMobileNav() {
    mobileNav.classList.remove('show');
    mobileNavOverlay.classList.remove('show');
    mobileMenuToggle.classList.remove('open');
  }

  mobileMenuToggle.addEventListener('click', function () {
    if (mobileNav.classList.contains('show')) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });

  mobileNavOverlay.addEventListener('click', closeMobileNav);

  // ---- BUTTON INTERACTIONS ----
  // Stamp-press ink-spread hover + slam-down stamp-mark click
  document.querySelectorAll('.btn-stamp').forEach(function (btn) {
    btn.addEventListener('click', function () {
      this.classList.add('stamp-clicked');
      setTimeout(function () {
        btn.classList.remove('stamp-clicked');
      }, 400);
    });
  });

  // ---- VOTE BUTTONS ----
  document.querySelectorAll('.vote-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var countEl = this.nextElementSibling;
      if (countEl && countEl.classList.contains('vote-count')) {
        var current = parseInt(countEl.textContent, 10);
        countEl.textContent = current + 1;
      }
      showMicroFeedback();

      // Anime.js bounce
      if (typeof anime !== 'undefined') {
        anime({
          targets: countEl,
          scale: [1.4, 1],
          duration: 300,
          easing: 'easeOutBack'
        });
      }
    });
  });

  // ---- TOGGLE SWITCHES (fist-punch) ----
  document.querySelectorAll('.toggle-switch').forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      var isActive = this.classList.toggle('active');
      this.dataset.state = isActive ? 'on' : 'off';

      // Punch impact animation with anime.js
      if (typeof anime !== 'undefined') {
        anime({
          targets: this.querySelector('.toggle-fist'),
          scale: [1.5, 1],
          duration: 200,
          easing: 'easeOutBack'
        });
      }

      showMicroFeedback();
    });
  });

  // ---- SCROLL REVEAL (wheat-paste slap-on) ----
  function revealOnScroll() {
    var items = document.querySelectorAll('.view.active .wheat-paste-in');
    items.forEach(function (item, i) {
      var delay = parseInt(item.dataset.delay || 0, 10);
      var rect = item.getBoundingClientRect();
      var inView = rect.top < window.innerHeight * 0.92;

      if (inView) {
        setTimeout(function () {
          item.style.setProperty('--wp-rot', (Math.random() * 3 - 1.5) + 'deg');
          item.classList.add('visible');
        }, delay * 80);
      }
    });
  }

  window.addEventListener('scroll', revealOnScroll, { passive: true });

  // ---- TOOLTIPS (speech-bubble-shout) ----
  function showShoutTooltip(target, text) {
    var rect = target.getBoundingClientRect();
    var tooltip = shoutTooltip;
    tooltip.querySelector('.shout-text').textContent = text;
    tooltip.style.left = (rect.left + rect.width / 2) + 'px';
    tooltip.style.top = (rect.top - 10) + 'px';
    tooltip.classList.add('visible');
    tooltip.setAttribute('aria-hidden', 'false');
  }

  function hideShoutTooltip() {
    shoutTooltip.classList.remove('visible');
    shoutTooltip.setAttribute('aria-hidden', 'true');
  }

  // Attach tooltips to nav buttons
  navBtns.forEach(function (btn) {
    btn.addEventListener('mouseenter', function () {
      showShoutTooltip(this, this.title || this.getAttribute('aria-label'));
    });
    btn.addEventListener('mouseleave', hideShoutTooltip);
  });

  // ---- MICRO FEEDBACK (megaphone-shake-confirm) ----
  var feedbackTimeout = null;

  function showMicroFeedback() {
    if (feedbackTimeout) clearTimeout(feedbackTimeout);
    microFeedback.classList.add('show');
    feedbackTimeout = setTimeout(function () {
      microFeedback.classList.remove('show');
    }, 1200);
  }

  // ---- SORTABLE JS (Kanban drag-and-drop) ----
  function initSortable() {
    if (typeof Sortable === 'undefined') return;

    document.querySelectorAll('.kanban-cards').forEach(function (col) {
      if (col._sortable) return; // Don't re-initialize
      col._sortable = new Sortable(col, {
        group: 'kanban',
        animation: 180,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        onEnd: function () {
          showMicroFeedback();
        }
      });
    });
  }

  // ---- ANIME.JS INTERACTIONS ----
  function initAnimeInteractions() {
    if (typeof anime === 'undefined') return;

    // Stagger stat tiles on dashboard load
    anime({
      targets: '#view-dashboard .stat-tile',
      opacity: [0, 1],
      translateY: [20, 0],
      rotate: function () { return anime.random(-2, 2) + 'deg'; },
      delay: anime.stagger(100, { start: 300 }),
      easing: 'easeOutCubic',
      duration: 500
    });

    // Stat bar fill animation
    document.querySelectorAll('.stat-bar-fill').forEach(function (bar) {
      var targetWidth = bar.style.width;
      bar.style.width = '0%';
      anime({
        targets: bar,
        width: targetWidth,
        duration: 1200,
        delay: 600,
        easing: 'easeOutExpo'
      });
    });
  }

  // ---- SPLITTING.JS for slogans ----
  function initSplitting() {
    if (typeof Splitting === 'undefined') return;

    Splitting({
      target: '.slogan-text',
      by: 'chars'
    });

    // Animate each character
    var chars = document.querySelectorAll('.slogan-text .char');
    if (chars.length && typeof anime !== 'undefined') {
      anime({
        targets: chars,
        opacity: [0, 1],
        translateY: [15, 0],
        delay: anime.stagger(25, { start: 200 }),
        easing: 'easeOutCubic',
        duration: 400
      });
    }
  }

  // ---- ROUGH.JS for whiteboard connectors ----
  function initRoughConnectors() {
    if (typeof rough === 'undefined') return;

    // Draw rough lines on whiteboard canvas
    var whiteboardSvg = document.getElementById('connector-svg');
    if (!whiteboardSvg) return;

    try {
      var rc = rough.svg(whiteboardSvg);
      var lines = whiteboardSvg.querySelectorAll('.string-line');
      lines.forEach(function (line) {
        var x1 = parseFloat(line.getAttribute('x1'));
        var y1 = parseFloat(line.getAttribute('y1'));
        var x2 = parseFloat(line.getAttribute('x2'));
        var y2 = parseFloat(line.getAttribute('y2'));

        // Convert percentages to approximate pixel values
        var w = whiteboardSvg.clientWidth || 800;
        var h = whiteboardSvg.clientHeight || 600;
        var px1 = (x1 / 100) * w;
        var py1 = (y1 / 100) * h;
        var px2 = (x2 / 100) * w;
        var py2 = (y2 / 100) * h;

        var roughLine = rc.line(px1, py1, px2, py2, {
          stroke: '#f5f0e0',
          strokeWidth: 1.5,
          roughness: 2.5,
          bowing: 3
        });
        whiteboardSvg.appendChild(roughLine);
        // Hide the original clean line
        line.style.display = 'none';
      });
    } catch (e) {
      // Rough.js may fail on percentage-based coords; keep original lines
    }

    // Draw rough red strings on conspiracy board
    var redStringsSvg = document.getElementById('red-strings-svg');
    if (!redStringsSvg) return;

    try {
      var rc2 = rough.svg(redStringsSvg);
      var redLines = redStringsSvg.querySelectorAll('.red-string');
      redLines.forEach(function (line) {
        var x1 = parseFloat(line.getAttribute('x1'));
        var y1 = parseFloat(line.getAttribute('y1'));
        var x2 = parseFloat(line.getAttribute('x2'));
        var y2 = parseFloat(line.getAttribute('y2'));

        var w = redStringsSvg.clientWidth || 800;
        var h = redStringsSvg.clientHeight || 600;
        var px1 = (x1 / 100) * w;
        var py1 = (y1 / 100) * h;
        var px2 = (x2 / 100) * w;
        var py2 = (y2 / 100) * h;

        var roughLine = rc2.line(px1, py1, px2, py2, {
          stroke: '#ff0066',
          strokeWidth: 1.5,
          roughness: 3,
          bowing: 4
        });
        redStringsSvg.appendChild(roughLine);
        line.style.display = 'none';
      });
    } catch (e) {
      // Fallback to original SVG lines
    }
  }

  // ---- POSTER FLUTTER (idle ambient) ----
  function initPosterFlutter() {
    var flyers = document.querySelectorAll('.project-flyer');
    flyers.forEach(function (flyer, i) {
      flyer.style.animationDelay = (i * 0.8) + 's';
    });
  }

  // ---- DIRECTORY TREE EXPAND/COLLAPSE ----
  document.querySelectorAll('.dir-file-row').forEach(function (row) {
    var nextSub = row.nextElementSibling;
    if (nextSub && nextSub.classList.contains('dir-sub-children')) {
      row.style.cursor = 'pointer';
      row.addEventListener('click', function () {
        var isHidden = nextSub.style.display === 'none';
        nextSub.style.display = isHidden ? 'block' : 'none';

        if (typeof anime !== 'undefined' && isHidden) {
          anime({
            targets: nextSub.querySelectorAll('.dir-file-row'),
            opacity: [0, 1],
            translateX: [-10, 0],
            delay: anime.stagger(50),
            duration: 300,
            easing: 'easeOutCubic'
          });
        }
      });
    }
  });

  // ---- CHAT SEND ----
  var chatInput = document.querySelector('.chat-input');
  var chatSendBtn = document.querySelector('.chat-send-btn');
  var chatWall = document.querySelector('.chat-wall');

  if (chatSendBtn && chatInput && chatWall) {
    function sendMessage() {
      var text = chatInput.value.trim();
      if (!text) return;

      // Create user message
      var msgDiv = document.createElement('div');
      msgDiv.className = 'chat-message user-msg';
      var noteRot = (Math.random() * 3 - 1.5).toFixed(1);
      msgDiv.innerHTML =
        '<div class="sticky-note yellow-note" style="--note-rot: ' + noteRot + 'deg">' +
          '<div class="tape-mark"></div>' +
          '<div class="note-text" style="color: #1a1200">' + escapeHtml(text) + '</div>' +
          '<div class="note-author" style="color: #3a3000">You — Just now</div>' +
        '</div>';
      chatWall.appendChild(msgDiv);

      // Clear input
      chatInput.value = '';

      // AI response after delay
      setTimeout(function () {
        var aiDiv = document.createElement('div');
        aiDiv.className = 'chat-message ai-msg';
        var aiRot = (Math.random() * 3 - 1.5).toFixed(1);
        aiDiv.innerHTML =
          '<div class="sticky-note magenta-note" style="--note-rot: ' + aiRot + 'deg">' +
            '<div class="tape-mark"></div>' +
            '<div class="note-text">Received. The collective is processing your input. Every voice matters in this movement. We\'ll have a strategic response ready shortly. Stay strong, comrade.</div>' +
            '<div class="note-author">AI Ally — Just now</div>' +
          '</div>';
        chatWall.appendChild(aiDiv);
        chatWall.scrollTop = chatWall.scrollHeight;
        showMicroFeedback();
      }, 800);

      chatWall.scrollTop = chatWall.scrollHeight;
      showMicroFeedback();
    }

    chatSendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') sendMessage();
    });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- INIT ----
  hideLoading();
  initAnimeInteractions();
  initSplitting();
  initPosterFlutter();

  // Delay rough.js init to let DOM settle
  setTimeout(initRoughConnectors, 500);

  // Init sortable on first kanban visit
  setTimeout(function () {
    if (currentView === 'kanban') initSortable();
  }, 300);

  // Expose switchView for direct access
  window.switchView = switchView;

})();
