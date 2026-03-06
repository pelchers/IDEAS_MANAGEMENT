/* ========================================
   EDITORIAL STYLE — PASS 2: DARK EDITORIAL
   Main Application Script
   ======================================== */

(function () {
  'use strict';

  /* ========================================
     DOM REFERENCES
     ======================================== */
  const navDrawer = document.getElementById('navDrawer');
  const navOverlay = document.getElementById('navOverlay');
  const navOpen = document.getElementById('navOpen');
  const navClose = document.getElementById('navClose');
  const navLinks = document.querySelectorAll('.nav-drawer__link');
  const topbarTitle = document.getElementById('topbarTitle');
  const mainContent = document.getElementById('mainContent');
  const views = document.querySelectorAll('.view');

  /* ========================================
     NAV DRAWER
     ======================================== */
  function openDrawer() {
    navDrawer.classList.add('open');
    navOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    navDrawer.classList.remove('open');
    navOverlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  navOpen.addEventListener('click', openDrawer);
  navClose.addEventListener('click', closeDrawer);
  navOverlay.addEventListener('click', closeDrawer);

  // Escape key closes drawer
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navDrawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  /* ========================================
     VIEW SWITCHING (Hash Routing)
     ======================================== */
  const viewTitleMap = {
    dashboard: 'Dashboard',
    projects: 'Projects',
    workspace: 'Workspace',
    kanban: 'Kanban Board',
    whiteboard: 'Whiteboard',
    schema: 'Schema Planner',
    directory: 'Directory Tree',
    ideas: 'Ideas Capture',
    aichat: 'AI Chat',
    settings: 'Settings'
  };

  function switchView(viewId) {
    // Hide all views
    views.forEach(function (v) {
      v.style.display = 'none';
      v.classList.remove('active');
    });

    // Show target view
    var target = document.getElementById('view-' + viewId);
    if (target) {
      target.style.display = 'block';
      // Re-trigger entrance animation
      target.style.animation = 'none';
      target.offsetHeight; // force reflow
      target.style.animation = '';

      // Animate in with Anime.js if available
      if (typeof anime !== 'undefined') {
        var animatables = target.querySelectorAll('.stat-card, .project-card, .kanban-card, .idea-card, .integration-item, .activity-feed__item, .tree-node');
        if (animatables.length > 0) {
          anime({
            targets: animatables,
            opacity: [0, 1],
            translateY: [16, 0],
            delay: anime.stagger(40, { start: 100 }),
            duration: 500,
            easing: 'easeOutCubic'
          });
        }
      }
    }

    // Update nav active state
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('data-view') === viewId);
    });

    // Update topbar title
    topbarTitle.textContent = viewTitleMap[viewId] || 'Dashboard';

    // Close drawer on mobile
    closeDrawer();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Initialize view-specific features
    if (viewId === 'dashboard') {
      initDashboardChart();
    }
  }

  // Handle nav link clicks
  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var viewId = this.getAttribute('data-view');
      window.location.hash = viewId;
    });
  });

  // Handle hash changes
  function handleHash() {
    var hash = window.location.hash.replace('#', '') || 'dashboard';
    switchView(hash);
  }

  window.addEventListener('hashchange', handleHash);

  // Initial load
  handleHash();

  /* ========================================
     DASHBOARD CHART (Chart.js)
     ======================================== */
  var dashboardChartInstance = null;

  function initDashboardChart() {
    if (typeof Chart === 'undefined') return;

    var canvas = document.getElementById('dashboardChart');
    if (!canvas) return;

    // Destroy existing instance
    if (dashboardChartInstance) {
      dashboardChartInstance.destroy();
    }

    var ctx = canvas.getContext('2d');

    // Create gradient
    var gradient = ctx.createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, 'rgba(108, 142, 191, 0.3)');
    gradient.addColorStop(1, 'rgba(108, 142, 191, 0.0)');

    dashboardChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Ideas Created',
            data: [12, 19, 15, 25, 22, 30, 28, 35, 32, 40, 38, 45],
            borderColor: '#6C8EBF',
            backgroundColor: gradient,
            tension: 0.4,
            fill: true,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#6C8EBF',
            pointHoverBorderColor: '#0D0E1A',
            pointHoverBorderWidth: 3
          },
          {
            label: 'Completed',
            data: [8, 14, 11, 18, 16, 22, 20, 26, 24, 30, 28, 34],
            borderColor: '#8BA8D9',
            backgroundColor: 'transparent',
            tension: 0.4,
            fill: false,
            borderWidth: 2,
            borderDash: [6, 4],
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#8BA8D9',
            pointHoverBorderColor: '#0D0E1A',
            pointHoverBorderWidth: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              color: '#9A968E',
              font: {
                family: 'Outfit',
                size: 12
              },
              boxWidth: 12,
              padding: 16,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: '#181A2E',
            titleColor: '#E8E4DC',
            bodyColor: '#9A968E',
            borderColor: 'rgba(108, 142, 191, 0.3)',
            borderWidth: 1,
            titleFont: { family: 'Outfit', weight: '600' },
            bodyFont: { family: 'Outfit' },
            padding: 12,
            cornerRadius: 8,
            displayColors: false
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(108, 142, 191, 0.08)',
              drawBorder: false
            },
            ticks: {
              color: '#6B6760',
              font: { family: 'Outfit', size: 11 }
            }
          },
          y: {
            grid: {
              color: 'rgba(108, 142, 191, 0.08)',
              drawBorder: false
            },
            ticks: {
              color: '#6B6760',
              font: { family: 'Outfit', size: 11 },
              stepSize: 10
            },
            beginAtZero: true
          }
        }
      }
    });
  }

  /* ========================================
     FILTER BUTTONS (Toggle Active)
     ======================================== */
  document.querySelectorAll('.projects-toolbar__filters, .ideas-filters').forEach(function (container) {
    container.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-btn');
      if (!btn) return;
      container.querySelectorAll('.filter-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');
    });
  });

  /* ========================================
     SETTINGS TABS
     ======================================== */
  var settingsNav = document.querySelectorAll('.settings-nav__link');
  var settingsPanels = document.querySelectorAll('.settings-panel');

  settingsNav.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var tab = this.getAttribute('data-settings-tab');

      settingsNav.forEach(function (l) { l.classList.remove('active'); });
      this.classList.add('active');

      settingsPanels.forEach(function (p) { p.classList.remove('active'); });
      var targetPanel = document.getElementById('settings-' + tab);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  /* ========================================
     WHITEBOARD TOOL SELECTION
     ======================================== */
  var whiteboardTools = document.querySelectorAll('.whiteboard-tool');
  whiteboardTools.forEach(function (tool) {
    tool.addEventListener('click', function () {
      whiteboardTools.forEach(function (t) { t.classList.remove('active'); });
      this.classList.add('active');
    });
  });

  /* ========================================
     DIRECTORY TREE TOGGLE
     ======================================== */
  document.querySelectorAll('.tree-node__toggle').forEach(function (toggle) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var node = this.closest('.tree-node');
      var children = node.nextElementSibling;

      if (children && children.classList.contains('tree-children')) {
        children.classList.toggle('collapsed');
        this.classList.toggle('tree-node__toggle--open');
      }
    });
  });

  // Click on folder name also toggles
  document.querySelectorAll('.tree-node:not(.tree-node--file)').forEach(function (node) {
    node.addEventListener('click', function () {
      var toggle = this.querySelector('.tree-node__toggle');
      if (toggle) {
        toggle.click();
      }
    });
  });

  /* ========================================
     STAR TOGGLE (Ideas)
     ======================================== */
  document.querySelectorAll('.idea-card__star').forEach(function (star) {
    star.addEventListener('click', function () {
      var isActive = this.classList.toggle('idea-card__star--active');
      this.innerHTML = isActive ? '&#9733;' : '&#9734;';
    });
  });

  /* ========================================
     EDITOR TOOLBAR (Toggle Active)
     ======================================== */
  document.querySelectorAll('.editor-toolbar__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      this.classList.toggle('active');
    });
  });

  /* ========================================
     TOGGLE GROUP (Settings)
     ======================================== */
  document.querySelectorAll('.toggle-group').forEach(function (group) {
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('.toggle-btn');
      if (!btn) return;
      group.querySelectorAll('.toggle-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');
    });
  });

  /* ========================================
     COLOR SWATCH (Settings)
     ======================================== */
  document.querySelectorAll('.color-swatches').forEach(function (container) {
    container.addEventListener('click', function (e) {
      var swatch = e.target.closest('.color-swatch');
      if (!swatch) return;
      container.querySelectorAll('.color-swatch').forEach(function (s) {
        s.classList.remove('active');
      });
      swatch.classList.add('active');
    });
  });

  /* ========================================
     FONT SIZE RANGE (Settings)
     ======================================== */
  var fontRange = document.querySelector('.form-range');
  var fontValue = document.querySelector('.form-range__value');
  if (fontRange && fontValue) {
    fontRange.addEventListener('input', function () {
      fontValue.textContent = this.value + 'px';
    });
  }

  /* ========================================
     CHAT INPUT (Auto-resize + Mock Send)
     ======================================== */
  var chatInput = document.querySelector('.chat-input');
  var chatSend = document.querySelector('.chat-send');
  var chatMessages = document.getElementById('chatMessages');

  if (chatInput) {
    chatInput.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }

  if (chatSend) {
    chatSend.addEventListener('click', sendChatMessage);
  }

  function sendChatMessage() {
    if (!chatInput || !chatMessages) return;
    var text = chatInput.value.trim();
    if (!text) return;

    // Add user message
    var userMsg = document.createElement('div');
    userMsg.className = 'chat-message chat-message--user';
    userMsg.innerHTML = '<div class="chat-message__content"><p>' + escapeHtml(text) + '</p></div><div class="chat-message__avatar">JD</div>';
    chatMessages.appendChild(userMsg);

    // Animate in
    if (typeof anime !== 'undefined') {
      anime({
        targets: userMsg,
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 400,
        easing: 'easeOutCubic'
      });
    }

    chatInput.value = '';
    chatInput.style.height = 'auto';

    // Simulate AI response
    setTimeout(function () {
      var aiMsg = document.createElement('div');
      aiMsg.className = 'chat-message chat-message--ai';
      aiMsg.innerHTML = '<div class="chat-message__avatar">AI</div><div class="chat-message__content"><p>Thank you for your input. I am analyzing your request and will provide a thoughtful response shortly. This is a prototype demonstration of the AI chat interface.</p></div>';
      chatMessages.appendChild(aiMsg);

      if (typeof anime !== 'undefined') {
        anime({
          targets: aiMsg,
          opacity: [0, 1],
          translateY: [10, 0],
          duration: 400,
          easing: 'easeOutCubic'
        });
      }

      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 800);

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /* ========================================
     LENIS SMOOTH SCROLL
     ======================================== */
  if (typeof Lenis !== 'undefined') {
    var lenis = new Lenis({
      duration: 1.2,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      smooth: true
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }

  /* ========================================
     ENTRANCE ANIMATIONS (Anime.js)
     ======================================== */
  if (typeof anime !== 'undefined') {
    // Topbar entrance
    anime({
      targets: '.topbar',
      opacity: [0, 1],
      translateY: [-20, 0],
      duration: 600,
      easing: 'easeOutCubic',
      delay: 100
    });
  }

  /* ========================================
     KANBAN CARD DRAG SIMULATION
     ======================================== */
  document.querySelectorAll('.kanban-card').forEach(function (card) {
    card.addEventListener('mousedown', function () {
      this.style.cursor = 'grabbing';
      this.style.opacity = '0.8';
    });
    card.addEventListener('mouseup', function () {
      this.style.cursor = 'grab';
      this.style.opacity = '1';
    });
    card.addEventListener('mouseleave', function () {
      this.style.cursor = 'grab';
      this.style.opacity = '1';
    });
  });

  /* ========================================
     IDEAS INPUT — CAPTURE BUTTON MOCK
     ======================================== */
  var captureBtn = document.querySelector('.ideas-input-area .btn--primary');
  var ideasInput = document.querySelector('.ideas-input');

  if (captureBtn && ideasInput) {
    captureBtn.addEventListener('click', function () {
      var text = ideasInput.value.trim();
      if (!text) return;

      // Visual feedback
      if (typeof anime !== 'undefined') {
        anime({
          targets: captureBtn,
          scale: [1, 0.95, 1],
          duration: 300,
          easing: 'easeInOutQuad'
        });
      }

      ideasInput.value = '';
    });
  }

  /* ========================================
     WHITEBOARD STICKY DRAG (Simple)
     ======================================== */
  document.querySelectorAll('.wb-sticky').forEach(function (sticky) {
    var isDragging = false;
    var startX, startY, origLeft, origTop;

    sticky.addEventListener('mousedown', function (e) {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      origLeft = parseInt(sticky.style.left) || 0;
      origTop = parseInt(sticky.style.top) || 0;
      sticky.style.zIndex = '10';
      sticky.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      sticky.style.left = (origLeft + dx) + 'px';
      sticky.style.top = (origTop + dy) + 'px';
    });

    document.addEventListener('mouseup', function () {
      if (!isDragging) return;
      isDragging = false;
      sticky.style.zIndex = '';
      sticky.style.cursor = 'move';
    });
  });

})();
