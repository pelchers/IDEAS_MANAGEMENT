/* ================================================
   SWISS STYLE — PASS 1
   Application Logic
   Hash routing, GSAP animations, Chart.js, SortableJS
   ================================================ */

(function () {
  'use strict';

  /* ================================================
     CONSTANTS & MOCK DATA
     ================================================ */
  const VIEWS = [
    'dashboard', 'projects', 'workspace', 'kanban',
    'whiteboard', 'schema', 'directory', 'ideas', 'chat', 'settings'
  ];

  /* ================================================
     UTILITY FUNCTIONS
     ================================================ */
  function $(selector) {
    return document.querySelector(selector);
  }

  function $$(selector) {
    return document.querySelectorAll(selector);
  }

  /* ================================================
     HASH ROUTING
     ================================================ */
  function getViewFromHash() {
    const hash = window.location.hash.replace('#', '');
    return VIEWS.includes(hash) ? hash : 'dashboard';
  }

  function activateView(viewId) {
    // Deactivate all views
    $$('.view').forEach(function (v) {
      v.classList.remove('is-active');
    });

    // Deactivate all nav links
    $$('.rail-link').forEach(function (link) {
      link.classList.remove('active');
    });

    // Activate target view
    var targetView = document.getElementById(viewId);
    if (targetView) {
      targetView.classList.add('is-active');

      // Animate view entry with GSAP if available
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(targetView,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
        );
      }
    }

    // Activate matching nav link
    var activeLink = document.querySelector('.rail-link[data-view="' + viewId + '"]');
    if (activeLink) {
      activeLink.classList.add('active');
    }

    // Close mobile nav if open
    closeMobileNav();

    // Initialize view-specific features
    if (viewId === 'dashboard') {
      initDashboardCharts();
    }
    if (viewId === 'whiteboard') {
      initWhiteboard();
    }
  }

  function handleHashChange() {
    var view = getViewFromHash();
    activateView(view);
  }

  /* ================================================
     MOBILE NAVIGATION
     ================================================ */
  function openMobileNav() {
    var rail = $('#leftRail');
    var hamburger = $('#hamburgerBtn');
    var overlay = $('#navOverlay');

    if (rail) rail.classList.add('is-open');
    if (hamburger) hamburger.classList.add('is-active');
    if (overlay) overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    var rail = $('#leftRail');
    var hamburger = $('#hamburgerBtn');
    var overlay = $('#navOverlay');

    if (rail) rail.classList.remove('is-open');
    if (hamburger) hamburger.classList.remove('is-active');
    if (overlay) overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
  }

  function initMobileNav() {
    var hamburger = $('#hamburgerBtn');
    var overlay = $('#navOverlay');

    if (hamburger) {
      hamburger.addEventListener('click', function () {
        var rail = $('#leftRail');
        if (rail && rail.classList.contains('is-open')) {
          closeMobileNav();
        } else {
          openMobileNav();
        }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', closeMobileNav);
    }
  }

  /* ================================================
     GRID OVERLAY TOGGLE
     ================================================ */
  function initGridToggle() {
    var gridToggle = $('#gridToggle');
    var gridOverlay = $('#gridOverlay');
    var settingsGridToggle = $('#settingsGridToggle');

    if (gridToggle && gridOverlay) {
      gridToggle.addEventListener('click', function () {
        gridOverlay.classList.toggle('is-visible');
        gridToggle.classList.toggle('is-active');
        if (settingsGridToggle) {
          settingsGridToggle.checked = gridOverlay.classList.contains('is-visible');
        }
      });
    }

    if (settingsGridToggle && gridOverlay) {
      settingsGridToggle.addEventListener('change', function () {
        if (this.checked) {
          gridOverlay.classList.add('is-visible');
          if (gridToggle) gridToggle.classList.add('is-active');
        } else {
          gridOverlay.classList.remove('is-visible');
          if (gridToggle) gridToggle.classList.remove('is-active');
        }
      });
    }
  }

  /* ================================================
     DASHBOARD CHARTS (Chart.js)
     ================================================ */
  var chartsInitialized = false;

  function initDashboardCharts() {
    if (chartsInitialized) return;
    if (typeof Chart === 'undefined') return;

    // Chart defaults — Swiss style
    Chart.defaults.font.family = "'Helvetica Neue', Helvetica, system-ui, sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.color = '#6B6B6B';
    Chart.defaults.plugins.legend.display = false;
    Chart.defaults.elements.bar.borderWidth = 0;
    Chart.defaults.elements.line.borderWidth = 2;

    // Weekly Activity Chart (Bar)
    var weeklyCtx = document.getElementById('weeklyChart');
    if (weeklyCtx) {
      new Chart(weeklyCtx.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            data: [12, 19, 8, 15, 22, 6, 10],
            backgroundColor: '#0057B7',
            hoverBackgroundColor: '#0A0A0A',
            borderRadius: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: '#E8E8E8', lineWidth: 1 },
              border: { color: '#0A0A0A', width: 1 },
              ticks: { font: { family: "'Source Code Pro', monospace", size: 10 } }
            },
            x: {
              grid: { display: false },
              border: { color: '#0A0A0A', width: 1 },
              ticks: { font: { family: "'Source Code Pro', monospace", size: 10 } }
            }
          },
          plugins: {
            tooltip: {
              backgroundColor: '#0A0A0A',
              titleFont: { size: 11, weight: '700' },
              bodyFont: { size: 11 },
              padding: 8,
              cornerRadius: 0,
              displayColors: false
            }
          }
        }
      });
    }

    // Project Distribution Chart (Doughnut)
    var projectCtx = document.getElementById('projectChart');
    if (projectCtx) {
      new Chart(projectCtx.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: ['Active', 'Planning', 'Review', 'Done'],
          datasets: [{
            data: [3, 1, 1, 1],
            backgroundColor: ['#0057B7', '#F57F17', '#2E7D32', '#E8E8E8'],
            hoverBackgroundColor: ['#004A9E', '#E65100', '#1B5E20', '#D0D0D0'],
            borderWidth: 2,
            borderColor: '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                padding: 16,
                usePointStyle: true,
                pointStyle: 'rect',
                font: { family: "'Source Code Pro', monospace", size: 10 }
              }
            },
            tooltip: {
              backgroundColor: '#0A0A0A',
              bodyFont: { size: 11 },
              padding: 8,
              cornerRadius: 0,
              displayColors: false
            }
          }
        }
      });
    }

    chartsInitialized = true;
  }

  /* ================================================
     KANBAN — SORTABLE.JS
     ================================================ */
  function initKanban() {
    if (typeof Sortable === 'undefined') return;

    var columns = ['backlogCards', 'todoCards', 'progressCards', 'doneCards'];
    columns.forEach(function (colId) {
      var el = document.getElementById(colId);
      if (el) {
        new Sortable(el, {
          group: 'kanban',
          animation: 200,
          ghostClass: 'sortable-ghost',
          chosenClass: 'sortable-chosen',
          dragClass: 'sortable-drag',
          easing: 'cubic-bezier(0, 0, 0.2, 1)',
          onEnd: function (evt) {
            updateColumnCounts();
          }
        });
      }
    });
  }

  function updateColumnCounts() {
    $$('.kanban-column').forEach(function (col) {
      var cards = col.querySelectorAll('.kanban-card');
      var countEl = col.querySelector('.column-count');
      if (countEl) {
        countEl.textContent = cards.length;
      }
    });
  }

  /* ================================================
     WHITEBOARD — CANVAS DRAWING
     ================================================ */
  var whiteboardState = {
    tool: 'select',
    isDrawing: false,
    startX: 0,
    startY: 0,
    shapes: [],
    initialized: false
  };

  function initWhiteboard() {
    if (whiteboardState.initialized) return;

    var canvas = document.getElementById('whiteboardCanvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    resizeWhiteboardCanvas(canvas);

    // Draw initial demo shapes
    drawDemoShapes(ctx, canvas);

    // Tool selection
    $$('.wb-tool').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tool = this.getAttribute('data-tool');

        if (tool === 'clear') {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          whiteboardState.shapes = [];
          drawGrid(ctx, canvas);
          return;
        }

        whiteboardState.tool = tool;
        $$('.wb-tool').forEach(function (b) { b.classList.remove('wb-tool-active'); });
        this.classList.add('wb-tool-active');
      });
    });

    // Mouse drawing
    canvas.addEventListener('mousedown', function (e) {
      if (whiteboardState.tool === 'select') return;
      whiteboardState.isDrawing = true;
      var rect = canvas.getBoundingClientRect();
      var scaleX = canvas.width / rect.width;
      var scaleY = canvas.height / rect.height;
      whiteboardState.startX = (e.clientX - rect.left) * scaleX;
      whiteboardState.startY = (e.clientY - rect.top) * scaleY;
    });

    canvas.addEventListener('mouseup', function (e) {
      if (!whiteboardState.isDrawing) return;
      whiteboardState.isDrawing = false;

      var rect = canvas.getBoundingClientRect();
      var scaleX = canvas.width / rect.width;
      var scaleY = canvas.height / rect.height;
      var endX = (e.clientX - rect.left) * scaleX;
      var endY = (e.clientY - rect.top) * scaleY;

      drawShape(ctx, whiteboardState.tool,
        whiteboardState.startX, whiteboardState.startY,
        endX, endY
      );
    });

    canvas.addEventListener('mouseleave', function () {
      whiteboardState.isDrawing = false;
    });

    whiteboardState.initialized = true;
  }

  function resizeWhiteboardCanvas(canvas) {
    var wrapper = canvas.parentElement;
    if (wrapper) {
      canvas.width = wrapper.clientWidth;
      canvas.height = wrapper.clientHeight || 500;
    }
  }

  function drawGrid(ctx, canvas) {
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 0.5;
    var step = 40;
    for (var x = 0; x <= canvas.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (var y = 0; y <= canvas.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  function drawShape(ctx, tool, x1, y1, x2, y2) {
    ctx.strokeStyle = '#0A0A0A';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'transparent';

    if (tool === 'rectangle') {
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    } else if (tool === 'circle') {
      var rx = Math.abs(x2 - x1) / 2;
      var ry = Math.abs(y2 - y1) / 2;
      var cx = Math.min(x1, x2) + rx;
      var cy = Math.min(y1, y2) + ry;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (tool === 'line') {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    } else if (tool === 'text') {
      ctx.font = '16px "Helvetica Neue", Helvetica, system-ui, sans-serif';
      ctx.fillStyle = '#0A0A0A';
      ctx.fillText('Text', x1, y1);
    }
  }

  function drawDemoShapes(ctx, canvas) {
    drawGrid(ctx, canvas);

    // Demo rectangles
    ctx.strokeStyle = '#0A0A0A';
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 80, 200, 120);
    ctx.strokeRect(360, 160, 160, 160);

    // Demo circle
    ctx.beginPath();
    ctx.ellipse(700, 200, 80, 80, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Demo lines
    ctx.beginPath();
    ctx.moveTo(280, 140);
    ctx.lineTo(360, 240);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(520, 240);
    ctx.lineTo(620, 200);
    ctx.stroke();

    // Demo text
    ctx.font = '700 14px "Helvetica Neue", Helvetica, system-ui, sans-serif';
    ctx.fillStyle = '#0057B7';
    ctx.fillText('Component A', 110, 150);
    ctx.fillText('Component B', 390, 250);
    ctx.fillText('Service', 670, 205);

    // Labels
    ctx.font = '400 11px "Source Code Pro", monospace';
    ctx.fillStyle = '#6B6B6B';
    ctx.fillText('API Layer', 300, 180);
    ctx.fillText('Data Flow', 550, 230);
  }

  /* ================================================
     DIRECTORY TREE — EXPAND/COLLAPSE
     ================================================ */
  function initDirectoryTree() {
    $$('.tree-toggle').forEach(function (toggle) {
      toggle.addEventListener('click', function () {
        var parentNode = this.parentElement;
        var children = parentNode.querySelector('.tree-children');

        if (children) {
          var isOpen = parentNode.classList.contains('open');
          if (isOpen) {
            parentNode.classList.remove('open');
            children.style.display = 'none';
            this.setAttribute('aria-expanded', 'false');
          } else {
            parentNode.classList.add('open');
            children.style.display = '';
            this.setAttribute('aria-expanded', 'true');
          }

          // GSAP animation
          if (typeof gsap !== 'undefined' && !isOpen) {
            gsap.from(children, {
              height: 0,
              opacity: 0,
              duration: 0.25,
              ease: 'power2.out'
            });
          }
        }
      });

      // Keyboard support
      toggle.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });
  }

  /* ================================================
     IDEAS — SEARCH FILTER
     ================================================ */
  function initIdeasSearch() {
    var searchInput = $('.ideas-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', function () {
      var query = this.value.toLowerCase().trim();
      $$('.idea-card').forEach(function (card) {
        var title = card.querySelector('.idea-title');
        var body = card.querySelector('.idea-body');
        var titleText = title ? title.textContent.toLowerCase() : '';
        var bodyText = body ? body.textContent.toLowerCase() : '';

        if (!query || titleText.includes(query) || bodyText.includes(query)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  /* ================================================
     AI CHAT — MOCK MESSAGES
     ================================================ */
  function initChat() {
    var chatInput = $('#chatInput');
    var chatSend = $('#chatSend');
    var chatMessages = $('#chatMessages');

    if (!chatInput || !chatSend || !chatMessages) return;

    var mockResponses = [
      'That\'s an interesting approach. Consider breaking the problem into smaller sub-tasks and tackling each one independently.',
      'Based on the project structure, I\'d recommend using a modular architecture pattern. This will make testing and maintenance significantly easier.',
      'Good question. The key trade-off here is between complexity and performance. For most use cases, the simpler approach will suffice.',
      'I can help with that. Let me analyze the current codebase structure and suggest optimizations based on common patterns.',
      'Consider implementing a caching layer at the API level. This would reduce database queries by approximately 60% for read-heavy operations.',
      'The design pattern you\'re describing is similar to the Observer pattern. It works well for real-time features like notifications and live updates.'
    ];

    function sendMessage() {
      var text = chatInput.value.trim();
      if (!text) return;

      // Add user message
      var userMsg = createChatMessage('You', text, true);
      chatMessages.appendChild(userMsg);

      chatInput.value = '';

      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Simulate AI response
      setTimeout(function () {
        var response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
        var aiMsg = createChatMessage('AI Assistant', response, false);
        chatMessages.appendChild(aiMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // GSAP fade in
        if (typeof gsap !== 'undefined') {
          gsap.from(aiMsg, { opacity: 0, y: 8, duration: 0.3, ease: 'power2.out' });
        }
      }, 800);
    }

    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  function createChatMessage(author, text, isUser) {
    var wrapper = document.createElement('div');
    wrapper.className = 'chat-message ' + (isUser ? 'chat-user' : 'chat-ai');

    var now = new Date();
    var timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    wrapper.innerHTML =
      '<div class="message-header">' +
      '<span class="message-author">' + author + '</span>' +
      '<span class="message-time">' + timeStr + '</span>' +
      '</div>' +
      '<p class="message-text">' + escapeHtml(text) + '</p>';

    return wrapper;
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /* ================================================
     SETTINGS — TOGGLE INTERACTIONS
     ================================================ */
  function initSettings() {
    // Theme toggle group
    $$('.toggle-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var group = this.parentElement;
        group.querySelectorAll('.toggle-btn').forEach(function (b) {
          b.classList.remove('toggle-active');
        });
        this.classList.add('toggle-active');
      });
    });
  }

  /* ================================================
     GSAP ENTRANCE ANIMATIONS
     ================================================ */
  function initEntranceAnimations() {
    if (typeof gsap === 'undefined') return;

    // Rail links stagger
    gsap.from('.rail-link', {
      x: -20,
      opacity: 0,
      duration: 0.3,
      stagger: 0.05,
      ease: 'power2.out',
      delay: 0.2
    });

    // Rail header
    gsap.from('.rail-header', {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.out',
      delay: 0.1
    });
  }

  /* ================================================
     HOVER MICRO-INTERACTIONS (GSAP)
     ================================================ */
  function initHoverAnimations() {
    if (typeof gsap === 'undefined') return;

    // Stat cards
    $$('.stat-card').forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        gsap.to(this, { borderColor: '#0A0A0A', duration: 0.2, ease: 'power2.out' });
        gsap.to(this.querySelector('.stat-number'), { color: '#0057B7', duration: 0.2 });
      });
      card.addEventListener('mouseleave', function () {
        gsap.to(this, { borderColor: '#D0D0D0', duration: 0.2, ease: 'power2.out' });
        gsap.to(this.querySelector('.stat-number'), { color: '#0A0A0A', duration: 0.2 });
      });
    });

    // Project cards
    $$('.project-card').forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        gsap.to(this.querySelector('.progress-fill'), {
          scaleX: 1.02,
          transformOrigin: 'left center',
          duration: 0.3,
          ease: 'power2.out'
        });
      });
      card.addEventListener('mouseleave', function () {
        gsap.to(this.querySelector('.progress-fill'), {
          scaleX: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });
  }

  /* ================================================
     INITIALIZATION
     ================================================ */
  function init() {
    // Set initial view from hash
    if (!window.location.hash) {
      window.location.hash = '#dashboard';
    }
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    // Initialize all features
    initMobileNav();
    initGridToggle();
    initKanban();
    initDirectoryTree();
    initIdeasSearch();
    initChat();
    initSettings();
    initEntranceAnimations();
    initHoverAnimations();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
