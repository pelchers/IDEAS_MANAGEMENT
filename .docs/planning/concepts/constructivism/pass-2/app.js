/* ==============================================
   CONSTRUCTIVISM PASS 2 — Magazine Editorial
   Application JavaScript
   ============================================== */

(function () {
  'use strict';

  /* ---- Constants ---- */
  const VIEWS = [
    'dashboard', 'projects', 'workspace', 'kanban',
    'whiteboard', 'schema', 'directory', 'ideas', 'chat', 'settings'
  ];

  const TRANSITION_DURATION = 600;

  /* ---- DOM References ---- */
  const bottomTabs = document.getElementById('bottom-tabs');
  const mainContent = document.getElementById('main-content');
  const transitionOverlay = document.getElementById('transition-overlay');

  /* ========================================
     VIEW NAVIGATION SYSTEM
     ======================================== */

  let currentView = 'dashboard';
  let isTransitioning = false;

  function getViewFromHash() {
    const hash = window.location.hash.replace('#', '');
    return VIEWS.includes(hash) ? hash : 'dashboard';
  }

  function switchView(targetView) {
    if (targetView === currentView || isTransitioning) return;
    if (!VIEWS.includes(targetView)) return;

    isTransitioning = true;

    /* Geometric wipe transition using Anime.js */
    const wipes = transitionOverlay.querySelectorAll('.transition-wipe');
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      /* Skip animation, just swap views */
      performViewSwap(targetView);
      isTransitioning = false;
      return;
    }

    /* Phase 1: Wipe in */
    anime({
      targets: wipes[0],
      translateX: ['-100%', '0%'],
      duration: 200,
      easing: 'easeInQuad',
      complete: function () {
        anime({
          targets: wipes[1],
          translateX: ['-100%', '0%'],
          duration: 150,
          easing: 'easeInQuad',
          complete: function () {
            /* Swap content while covered */
            performViewSwap(targetView);

            /* Phase 2: Wipe out */
            anime({
              targets: [wipes[0], wipes[1]],
              translateX: '100%',
              duration: 300,
              easing: 'easeOutQuad',
              delay: anime.stagger(80),
              complete: function () {
                /* Reset wipe positions */
                wipes[0].style.transform = 'translateX(-100%)';
                wipes[1].style.transform = 'translateX(-100%)';
                isTransitioning = false;
              }
            });
          }
        });
      }
    });
  }

  function performViewSwap(targetView) {
    /* Hide current view */
    const currentSection = document.querySelector('.view--active');
    if (currentSection) {
      currentSection.classList.remove('view--active');
    }

    /* Show target view */
    const targetSection = document.getElementById('view-' + targetView);
    if (targetSection) {
      targetSection.classList.add('view--active');
    }

    /* Update tab active states */
    document.querySelectorAll('.bottom-tab').forEach(function (tab) {
      tab.classList.remove('bottom-tab--active');
      tab.removeAttribute('aria-current');
      if (tab.dataset.view === targetView) {
        tab.classList.add('bottom-tab--active');
        tab.setAttribute('aria-current', 'page');
      }
    });

    currentView = targetView;

    /* Scroll main content to top */
    mainContent.scrollTop = 0;
    window.scrollTo(0, 0);

    /* Initialize view-specific features */
    initViewFeatures(targetView);
  }

  /* Tab click handler */
  bottomTabs.addEventListener('click', function (e) {
    var tab = e.target.closest('.bottom-tab');
    if (!tab) return;
    e.preventDefault();
    var view = tab.dataset.view;
    if (view) {
      window.location.hash = view;
    }
  });

  /* Hash change handler */
  window.addEventListener('hashchange', function () {
    var view = getViewFromHash();
    switchView(view);
  });

  /* ========================================
     VIEW-SPECIFIC FEATURES
     ======================================== */

  var viewsInitialized = {};

  function initViewFeatures(view) {
    switch (view) {
      case 'dashboard':
        if (!viewsInitialized.dashboard) {
          initDashboardChart();
          viewsInitialized.dashboard = true;
        }
        break;
      case 'kanban':
        if (!viewsInitialized.kanban) {
          initKanbanBoard();
          viewsInitialized.kanban = true;
        }
        break;
      case 'whiteboard':
        if (!viewsInitialized.whiteboard) {
          initWhiteboard();
          viewsInitialized.whiteboard = true;
        }
        break;
      case 'directory':
        if (!viewsInitialized.directory) {
          initDirectoryTree();
          viewsInitialized.directory = true;
        }
        break;
      case 'chat':
        initChat();
        break;
    }
  }

  /* ---- Dashboard Chart ---- */
  function initDashboardChart() {
    var ctx = document.getElementById('dashboard-chart');
    if (!ctx || !window.Chart) return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Ideas Created',
            data: [12, 19, 23, 28, 35, 32, 42, 38, 45, 52, 48, 57],
            borderColor: '#008B8B',
            backgroundColor: 'rgba(0, 139, 139, 0.08)',
            borderWidth: 2,
            fill: true,
            tension: 0.3,
            pointBackgroundColor: '#008B8B',
            pointRadius: 3,
            pointHoverRadius: 5
          },
          {
            label: 'Ideas Completed',
            data: [8, 12, 15, 20, 24, 22, 30, 28, 35, 40, 38, 45],
            borderColor: '#FF6600',
            backgroundColor: 'rgba(255, 102, 0, 0.05)',
            borderWidth: 2,
            fill: true,
            tension: 0.3,
            pointBackgroundColor: '#FF6600',
            pointRadius: 3,
            pointHoverRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: { family: "'Staatliches', sans-serif", size: 11 },
              padding: 16,
              usePointStyle: true
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: {
              font: { family: "'Staatliches', sans-serif", size: 10 },
              color: '#555'
            }
          },
          y: {
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: {
              font: { family: "'Staatliches', sans-serif", size: 10 },
              color: '#555'
            },
            beginAtZero: true
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }

  /* ---- Kanban Board (SortableJS) ---- */
  function initKanbanBoard() {
    if (!window.Sortable) return;

    var columns = ['kanban-backlog', 'kanban-todo', 'kanban-progress', 'kanban-done'];
    columns.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      Sortable.create(el, {
        group: 'kanban',
        animation: 200,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        onEnd: function () {
          updateKanbanCounts();
        }
      });
    });
  }

  function updateKanbanCounts() {
    document.querySelectorAll('.kanban-column').forEach(function (col) {
      var cards = col.querySelector('.kanban-column__cards');
      var count = col.querySelector('.kanban-column__count');
      if (cards && count) {
        count.textContent = cards.children.length;
      }
    });
  }

  /* ---- Whiteboard Canvas ---- */
  function initWhiteboard() {
    var canvas = document.getElementById('whiteboard-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var isDrawing = false;
    var currentTool = 'select';
    var lastX = 0;
    var lastY = 0;

    /* Resize canvas to container */
    function resizeCanvas() {
      var container = canvas.parentElement;
      var rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = Math.max(400, rect.height - 50);
      drawGrid();
    }

    function drawGrid() {
      ctx.strokeStyle = 'rgba(0, 139, 139, 0.08)';
      ctx.lineWidth = 1;
      for (var x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (var y = 0; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      /* Decorative geometric shapes */
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 139, 139, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(200, 180, 60, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 102, 0, 0.2)';
      ctx.strokeRect(400, 120, 120, 80);

      ctx.strokeStyle = 'rgba(13, 13, 13, 0.15)';
      ctx.beginPath();
      ctx.moveTo(100, 300);
      ctx.lineTo(180, 260);
      ctx.lineTo(180, 340);
      ctx.closePath();
      ctx.stroke();

      /* Label */
      ctx.fillStyle = 'rgba(0, 139, 139, 0.3)';
      ctx.font = "14px 'Staatliches', sans-serif";
      ctx.letterSpacing = '2px';
      ctx.fillText('WHITEBOARD CANVAS', canvas.width / 2 - 80, 40);
      ctx.restore();
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    /* Drawing handlers */
    function getPos(e) {
      var rect = canvas.getBoundingClientRect();
      var touch = e.touches ? e.touches[0] : e;
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    }

    canvas.addEventListener('mousedown', function (e) {
      if (currentTool !== 'draw') return;
      isDrawing = true;
      var pos = getPos(e);
      lastX = pos.x;
      lastY = pos.y;
    });

    canvas.addEventListener('mousemove', function (e) {
      if (!isDrawing) return;
      var pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = '#0D0D0D';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();
      lastX = pos.x;
      lastY = pos.y;
    });

    canvas.addEventListener('mouseup', function () { isDrawing = false; });
    canvas.addEventListener('mouseleave', function () { isDrawing = false; });

    /* Touch support */
    canvas.addEventListener('touchstart', function (e) {
      if (currentTool !== 'draw') return;
      e.preventDefault();
      isDrawing = true;
      var pos = getPos(e);
      lastX = pos.x;
      lastY = pos.y;
    }, { passive: false });

    canvas.addEventListener('touchmove', function (e) {
      if (!isDrawing) return;
      e.preventDefault();
      var pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = '#0D0D0D';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();
      lastX = pos.x;
      lastY = pos.y;
    }, { passive: false });

    canvas.addEventListener('touchend', function () { isDrawing = false; });

    /* Tool selection */
    document.querySelectorAll('.whiteboard-tool').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tool = this.dataset.tool;
        if (!tool) return;

        if (tool === 'clear') {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawGrid();
          return;
        }

        if (tool === 'undo') {
          /* Simple undo: just clear and redraw grid */
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawGrid();
          return;
        }

        currentTool = tool;
        document.querySelectorAll('.whiteboard-tool').forEach(function (b) {
          b.classList.remove('whiteboard-tool--active');
        });
        this.classList.add('whiteboard-tool--active');
      });
    });
  }

  /* ---- Directory Tree ---- */
  function initDirectoryTree() {
    document.querySelectorAll('.tree-node__toggle').forEach(function (toggle) {
      toggle.addEventListener('click', function () {
        var node = this.closest('.tree-node');
        var children = node.querySelector('.tree-children');
        if (!children) return;

        var isOpen = node.classList.contains('tree-node--open');
        if (isOpen) {
          node.classList.remove('tree-node--open');
          children.style.display = 'none';
          this.textContent = '\u25B6';
          this.setAttribute('aria-expanded', 'false');
        } else {
          node.classList.add('tree-node--open');
          children.style.display = '';
          this.textContent = '\u25BC';
          this.setAttribute('aria-expanded', 'true');
        }
      });

      toggle.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });
  }

  /* ---- AI Chat ---- */
  function initChat() {
    var chatInput = document.getElementById('chat-input');
    var chatSendBtn = document.getElementById('chat-send-btn');
    var chatMessages = document.getElementById('chat-messages');
    if (!chatInput || !chatSendBtn || !chatMessages) return;

    function sendMessage() {
      var text = chatInput.value.trim();
      if (!text) return;

      /* Add user message */
      var userMsg = document.createElement('div');
      userMsg.className = 'chat-message chat-message--user';
      userMsg.innerHTML =
        '<div class="chat-message__content"><p>' + escapeHtml(text) + '</p></div>' +
        '<span class="chat-message__avatar chat-message__avatar--user">You</span>';
      chatMessages.appendChild(userMsg);

      chatInput.value = '';

      /* Simulate AI response after delay */
      setTimeout(function () {
        var aiMsg = document.createElement('div');
        aiMsg.className = 'chat-message chat-message--ai';
        var responses = [
          "That's an interesting perspective. Let me analyze that against your current project data and get back to you with specific recommendations.",
          "Based on the patterns in your idea backlog, I'd suggest focusing on the integration features first. They have the highest correlation with user engagement.",
          "I can see how that connects to your earlier ideas. Would you like me to create a relationship map between these concepts?",
          "Good question. Looking at similar implementations across your projects, I'd recommend starting with a minimal prototype to validate the core assumption.",
          "I've identified 3 related ideas in your backlog that could be combined into a more impactful initiative. Want me to draft a proposal?"
        ];
        var response = responses[Math.floor(Math.random() * responses.length)];
        aiMsg.innerHTML =
          '<span class="chat-message__avatar chat-message__avatar--ai">AI</span>' +
          '<div class="chat-message__content"><p>' + response + '</p></div>';
        chatMessages.appendChild(aiMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 800);

      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    chatSendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ========================================
     ENTRY ANIMATIONS
     ======================================== */

  function animateEntrance() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.anime) return;

    /* Animate header */
    anime({
      targets: '.editorial-header',
      translateY: [-56, 0],
      opacity: [0, 1],
      duration: 600,
      easing: 'easeOutCubic'
    });

    /* Animate bottom tabs */
    anime({
      targets: '.bottom-tabs',
      translateY: [68, 0],
      opacity: [0, 1],
      duration: 600,
      delay: 200,
      easing: 'easeOutCubic'
    });

    /* Animate first view content */
    anime({
      targets: '.view--active .spread__headline-col > *',
      translateX: [-30, 0],
      opacity: [0, 1],
      duration: 500,
      delay: anime.stagger(100, { start: 400 }),
      easing: 'easeOutCubic'
    });

    anime({
      targets: '.view--active .spread__content-col > *',
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 500,
      delay: anime.stagger(80, { start: 600 }),
      easing: 'easeOutCubic'
    });
  }

  /* ========================================
     INITIALIZATION
     ======================================== */

  function init() {
    /* Set initial view from hash */
    var initialView = getViewFromHash();
    performViewSwap(initialView);

    /* Run entrance animation */
    animateEntrance();
  }

  /* Wait for DOM and fonts */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
