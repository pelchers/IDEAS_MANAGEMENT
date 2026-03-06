/* ============================================================
   HAND-DRAWN STYLE — PASS 2: WATERCOLOR & INK
   Idea Management Platform — Application Logic
   ============================================================ */

(function () {
  'use strict';

  /* ===== Constants & State ===== */
  const VIEWS = ['dashboard', 'projects', 'workspace', 'kanban', 'whiteboard', 'schema', 'directory', 'ideas', 'chat', 'settings'];
  const VIEW_LABELS = {
    dashboard: 'Dashboard',
    projects: 'Projects',
    workspace: 'Workspace',
    kanban: 'Kanban Board',
    whiteboard: 'Whiteboard',
    schema: 'Schema Planner',
    directory: 'Directory Tree',
    ideas: 'Ideas Capture',
    chat: 'AI Chat',
    settings: 'Settings'
  };

  let currentView = 'dashboard';
  let fabOpen = false;
  let mobileNavOpen = false;

  /* ===== Utility Functions ===== */
  function $(sel, parent) { return (parent || document).querySelector(sel); }
  function $$(sel, parent) { return Array.from((parent || document).querySelectorAll(sel)); }

  /* ===== View Routing (Hash-based) ===== */
  function navigateToView(viewId) {
    if (!VIEWS.includes(viewId)) viewId = 'dashboard';
    currentView = viewId;

    // Hide all views, show the active one
    $$('.view').forEach(function (v) { v.classList.remove('active'); });
    var targetView = $('#' + viewId);
    if (targetView) targetView.classList.add('active');

    // Update view label in header
    var label = $('#current-view-label');
    if (label) label.textContent = VIEW_LABELS[viewId] || viewId;

    // Update FAB nav active state
    $$('.fab-item').forEach(function (item) {
      item.classList.toggle('active', item.getAttribute('data-view') === viewId);
    });

    // Update mobile nav active state
    $$('.mobile-nav-item').forEach(function (item) {
      item.classList.toggle('active', item.getAttribute('data-view') === viewId);
    });

    // Close menus
    closeFab();
    closeMobileNav();

    // Update URL hash without triggering hashchange
    if (window.location.hash !== '#' + viewId) {
      history.pushState(null, '', '#' + viewId);
    }
  }

  function handleHashChange() {
    var hash = window.location.hash.replace('#', '') || 'dashboard';
    navigateToView(hash);
  }

  window.addEventListener('hashchange', handleHashChange);

  /* ===== FAB Navigation ===== */
  function toggleFab() {
    fabOpen = !fabOpen;
    var trigger = $('.fab-trigger');
    var menu = $('.fab-menu');
    if (trigger) trigger.classList.toggle('open', fabOpen);
    if (trigger) trigger.setAttribute('aria-expanded', fabOpen.toString());
    if (menu) menu.classList.toggle('open', fabOpen);
  }

  function closeFab() {
    fabOpen = false;
    var trigger = $('.fab-trigger');
    var menu = $('.fab-menu');
    if (trigger) trigger.classList.remove('open');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (menu) menu.classList.remove('open');
  }

  var fabTrigger = $('.fab-trigger');
  if (fabTrigger) {
    fabTrigger.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleFab();
    });
  }

  // Close FAB on outside click
  document.addEventListener('click', function (e) {
    if (fabOpen && !e.target.closest('.fab-nav')) {
      closeFab();
    }
  });

  // FAB item clicks
  $$('.fab-item').forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      var view = this.getAttribute('data-view');
      navigateToView(view);
    });
  });

  /* ===== Mobile Navigation ===== */
  function toggleMobileNav() {
    mobileNavOpen = !mobileNavOpen;
    var toggle = $('.mobile-nav-toggle');
    var drawer = $('.mobile-nav-drawer');
    if (toggle) toggle.classList.toggle('open', mobileNavOpen);
    if (toggle) toggle.setAttribute('aria-expanded', mobileNavOpen.toString());
    if (drawer) drawer.classList.toggle('open', mobileNavOpen);
  }

  function closeMobileNav() {
    mobileNavOpen = false;
    var toggle = $('.mobile-nav-toggle');
    var drawer = $('.mobile-nav-drawer');
    if (toggle) toggle.classList.remove('open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    if (drawer) drawer.classList.remove('open');
  }

  var mobileToggle = $('.mobile-nav-toggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMobileNav();
    });
  }

  $$('.mobile-nav-item').forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      var view = this.getAttribute('data-view');
      navigateToView(view);
    });
  });

  /* ===== Ink Splatter Canvas (Ambient Particles) ===== */
  function initInkCanvas() {
    var canvas = document.getElementById('ink-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var maxParticles = 25;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 4 + 1,
        opacity: Math.random() * 0.3 + 0.05,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        color: ['rgba(74, 44, 106,', 'rgba(45, 139, 139,', 'rgba(199, 91, 122,'][Math.floor(Math.random() * 3)],
        life: Math.random() * 400 + 200
      };
    }

    for (var i = 0; i < maxParticles; i++) {
      particles.push(createParticle());
    }

    function drawSplatter(p) {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color + p.opacity + ')';
      ctx.beginPath();

      // Create an organic shape with multiple arcs
      var arms = Math.floor(Math.random() * 3) + 4;
      for (var i = 0; i < arms; i++) {
        var angle = (i / arms) * Math.PI * 2;
        var radius = p.size * (0.6 + Math.random() * 0.8);
        var cx = p.x + Math.cos(angle) * radius * 0.5;
        var cy = p.y + Math.sin(angle) * radius * 0.5;
        ctx.moveTo(cx + radius, cy);
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.restore();
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(function (p, idx) {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        if (p.life <= 0 || p.x < -20 || p.x > canvas.width + 20 || p.y < -20 || p.y > canvas.height + 20) {
          particles[idx] = createParticle();
        }

        drawSplatter(p);
      });

      requestAnimationFrame(animate);
    }

    // Respect reduced motion
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      animate();
    }
  }

  /* ===== Rough.js Brand Icon ===== */
  function initBrandIcon() {
    if (typeof rough === 'undefined') return;
    var svg = document.querySelector('.brand-icon');
    if (!svg) return;

    var rc = rough.svg(svg);
    // Draw a hand-drawn lightbulb shape
    svg.appendChild(rc.circle(18, 14, 18, {
      stroke: '#4A2C6A',
      strokeWidth: 1.8,
      roughness: 1.5,
      fill: 'rgba(199, 91, 122, 0.15)',
      fillStyle: 'hachure'
    }));
    svg.appendChild(rc.line(14, 23, 14, 30, { stroke: '#4A2C6A', strokeWidth: 1.5, roughness: 1.2 }));
    svg.appendChild(rc.line(22, 23, 22, 30, { stroke: '#4A2C6A', strokeWidth: 1.5, roughness: 1.2 }));
    svg.appendChild(rc.line(13, 30, 23, 30, { stroke: '#4A2C6A', strokeWidth: 1.5, roughness: 1.2 }));
    svg.appendChild(rc.line(14, 33, 22, 33, { stroke: '#4A2C6A', strokeWidth: 1.5, roughness: 1.2 }));
  }

  /* ===== Rough.js Card Borders ===== */
  function initRoughBorders() {
    if (typeof rough === 'undefined') return;

    $$('.wc-card').forEach(function (card) {
      var canvas = document.createElement('canvas');
      canvas.className = 'rough-border-canvas';
      canvas.width = card.offsetWidth;
      canvas.height = card.offsetHeight;
      card.style.position = 'relative';
      card.appendChild(canvas);

      var rc = rough.canvas(canvas);
      rc.rectangle(2, 2, canvas.width - 4, canvas.height - 4, {
        stroke: 'rgba(74, 44, 106, 0.15)',
        strokeWidth: 1.5,
        roughness: 2,
        bowing: 1.5,
        fill: 'transparent'
      });
    });
  }

  /* ===== Schema Diagram (Rough.js) ===== */
  function initSchemaCanvas() {
    if (typeof rough === 'undefined') return;
    var svg = document.getElementById('schema-canvas');
    if (!svg) return;

    var rc = rough.svg(svg);

    // Entity boxes
    var entities = [
      { name: 'Users', x: 60, y: 40, w: 160, h: 120, color: '#4A2C6A' },
      { name: 'Projects', x: 360, y: 40, w: 160, h: 120, color: '#2D8B8B' },
      { name: 'Ideas', x: 360, y: 260, w: 160, h: 120, color: '#C75B7A' },
      { name: 'Tasks', x: 660, y: 140, w: 160, h: 120, color: '#D4A574' }
    ];

    entities.forEach(function (e) {
      // Entity box
      svg.appendChild(rc.rectangle(e.x, e.y, e.w, e.h, {
        stroke: e.color,
        strokeWidth: 2,
        roughness: 1.8,
        fill: e.color + '15',
        fillStyle: 'hachure',
        hachureGap: 8,
        hachureAngle: -41
      }));

      // Entity name text
      var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', e.x + e.w / 2);
      text.setAttribute('y', e.y + 30);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-family', 'Kalam, cursive');
      text.setAttribute('font-size', '16');
      text.setAttribute('font-weight', '700');
      text.setAttribute('fill', e.color);
      text.textContent = e.name;
      svg.appendChild(text);

      // Divider line under name
      svg.appendChild(rc.line(e.x + 10, e.y + 40, e.x + e.w - 10, e.y + 40, {
        stroke: e.color,
        strokeWidth: 1,
        roughness: 1.5
      }));

      // Field names
      var fields = {
        'Users': ['id', 'name', 'email', 'role'],
        'Projects': ['id', 'title', 'owner_id', 'status'],
        'Ideas': ['id', 'content', 'project_id', 'author'],
        'Tasks': ['id', 'title', 'idea_id', 'assignee']
      };

      (fields[e.name] || []).forEach(function (field, i) {
        var ft = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        ft.setAttribute('x', e.x + 15);
        ft.setAttribute('y', e.y + 60 + i * 16);
        ft.setAttribute('font-family', 'Quicksand, sans-serif');
        ft.setAttribute('font-size', '11');
        ft.setAttribute('fill', '#2A2A2A');
        ft.textContent = field;
        svg.appendChild(ft);
      });
    });

    // Relationship lines
    // Users -> Projects
    svg.appendChild(rc.line(220, 100, 360, 100, {
      stroke: '#4A2C6A',
      strokeWidth: 1.5,
      roughness: 1.8
    }));
    // Projects -> Ideas
    svg.appendChild(rc.line(440, 160, 440, 260, {
      stroke: '#2D8B8B',
      strokeWidth: 1.5,
      roughness: 1.8
    }));
    // Projects -> Tasks
    svg.appendChild(rc.line(520, 100, 660, 200, {
      stroke: '#D4A574',
      strokeWidth: 1.5,
      roughness: 1.8
    }));
    // Ideas -> Tasks
    svg.appendChild(rc.line(520, 320, 660, 260, {
      stroke: '#C75B7A',
      strokeWidth: 1.5,
      roughness: 1.8
    }));

    // Relationship labels
    var labels = [
      { text: 'owns', x: 290, y: 92 },
      { text: 'contains', x: 450, y: 215 },
      { text: 'has', x: 600, y: 140 },
      { text: 'linked', x: 600, y: 305 }
    ];

    labels.forEach(function (l) {
      var t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', l.x);
      t.setAttribute('y', l.y);
      t.setAttribute('font-family', 'Patrick Hand, cursive');
      t.setAttribute('font-size', '12');
      t.setAttribute('fill', '#8A7A9A');
      t.textContent = l.text;
      svg.appendChild(t);
    });
  }

  /* ===== Dashboard Chart (Chart.js) ===== */
  function initDashboardChart() {
    if (typeof Chart === 'undefined') return;
    var ctx = document.getElementById('chart-ideas-timeline');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Ideas Created',
          data: [4, 7, 5, 12, 9, 15],
          borderColor: '#4A2C6A',
          backgroundColor: 'rgba(74, 44, 106, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: '#4A2C6A',
          pointBorderColor: '#FDF8F0',
          pointBorderWidth: 2,
          pointRadius: 5
        }, {
          label: 'Ideas Completed',
          data: [2, 4, 3, 8, 7, 11],
          borderColor: '#2D8B8B',
          backgroundColor: 'rgba(45, 139, 139, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: '#2D8B8B',
          pointBorderColor: '#FDF8F0',
          pointBorderWidth: 2,
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: { family: 'Quicksand', size: 12, weight: '500' },
              color: '#2A2A2A',
              padding: 16,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(74, 44, 106, 0.9)',
            titleFont: { family: 'Kalam', size: 14, weight: '700' },
            bodyFont: { family: 'Quicksand', size: 12 },
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(74, 44, 106, 0.06)' },
            ticks: { font: { family: 'Quicksand', size: 11 }, color: '#8A7A9A' }
          },
          y: {
            grid: { color: 'rgba(74, 44, 106, 0.06)' },
            ticks: { font: { family: 'Quicksand', size: 11 }, color: '#8A7A9A' },
            beginAtZero: true
          }
        }
      }
    });
  }

  /* ===== Whiteboard Drawing Canvas ===== */
  function initWhiteboardCanvas() {
    var canvas = document.getElementById('whiteboard-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var drawing = false;
    var lastX = 0;
    var lastY = 0;
    var brushColor = '#4A2C6A';
    var brushSize = 3;

    function resizeCanvas() {
      var wrap = canvas.parentElement;
      var tempImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = wrap.clientWidth - 32;
      canvas.height = 500;
      ctx.putImageData(tempImg, 0, 0);
    }

    resizeCanvas();

    function getPos(e) {
      var rect = canvas.getBoundingClientRect();
      var touch = e.touches ? e.touches[0] : e;
      return {
        x: (touch.clientX - rect.left) * (canvas.width / rect.width),
        y: (touch.clientY - rect.top) * (canvas.height / rect.height)
      };
    }

    function startDraw(e) {
      drawing = true;
      var pos = getPos(e);
      lastX = pos.x;
      lastY = pos.y;
    }

    function draw(e) {
      if (!drawing) return;
      e.preventDefault();
      var pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = 0.85;
      ctx.stroke();
      lastX = pos.x;
      lastY = pos.y;
    }

    function stopDraw() {
      drawing = false;
    }

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseleave', stopDraw);
    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDraw);

    // Color picker
    var colorPicker = $('.color-picker');
    if (colorPicker) {
      colorPicker.addEventListener('input', function () {
        brushColor = this.value;
      });
    }

    // Brush size
    var sizeSlider = $('.brush-size');
    if (sizeSlider) {
      sizeSlider.addEventListener('input', function () {
        brushSize = parseInt(this.value);
      });
    }

    // Tool buttons
    $$('.whiteboard-toolbar .tool-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tool = this.getAttribute('data-tool');
        if (tool === 'clear') {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          return;
        }
        if (tool === 'eraser') {
          brushColor = '#FDF8F0';
          brushSize = 20;
        } else if (tool === 'pencil') {
          brushColor = colorPicker ? colorPicker.value : '#4A2C6A';
          brushSize = 3;
        } else if (tool === 'brush') {
          brushColor = colorPicker ? colorPicker.value : '#4A2C6A';
          brushSize = 8;
        }

        // Active state
        $$('.whiteboard-toolbar .tool-btn').forEach(function (b) { b.classList.remove('active'); });
        if (tool !== 'clear') this.classList.add('active');
      });
    });

    // Draw initial watercolor splashes
    function drawInitialArt() {
      var colors = [
        'rgba(74, 44, 106, 0.08)',
        'rgba(45, 139, 139, 0.08)',
        'rgba(199, 91, 122, 0.08)'
      ];

      for (var i = 0; i < 5; i++) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        var cx = Math.random() * canvas.width;
        var cy = Math.random() * canvas.height;
        var r = Math.random() * 60 + 30;
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    drawInitialArt();
  }

  /* ===== Directory Tree Toggle ===== */
  function initDirectoryTree() {
    $$('.tree-folder').forEach(function (folder) {
      var toggle = folder.querySelector('.folder-toggle');
      var nameEl = folder.querySelector('.folder-name');
      if (!toggle && !nameEl) return;

      var clickTarget = toggle || nameEl;
      clickTarget.addEventListener('click', function (e) {
        e.stopPropagation();
        folder.classList.toggle('open');
        var isOpen = folder.classList.contains('open');
        folder.setAttribute('aria-expanded', isOpen.toString());
        if (toggle) toggle.textContent = isOpen ? '\u25BE' : '\u25B8';
      });
    });

    // Expand/Collapse all
    var expandBtn = $('#expand-all');
    var collapseBtn = $('#collapse-all');

    if (expandBtn) {
      expandBtn.addEventListener('click', function () {
        $$('.tree-folder').forEach(function (f) {
          f.classList.add('open');
          f.setAttribute('aria-expanded', 'true');
          var t = f.querySelector('.folder-toggle');
          if (t) t.textContent = '\u25BE';
        });
      });
    }

    if (collapseBtn) {
      collapseBtn.addEventListener('click', function () {
        $$('.tree-folder').forEach(function (f) {
          f.classList.remove('open');
          f.setAttribute('aria-expanded', 'false');
          var t = f.querySelector('.folder-toggle');
          if (t) t.textContent = '\u25B8';
        });
      });
    }
  }

  /* ===== Ideas Filter ===== */
  function initIdeasFilter() {
    $$('.filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');

        var filter = this.getAttribute('data-filter');
        $$('.idea-card').forEach(function (card) {
          if (filter === 'all') {
            card.style.display = '';
          } else {
            card.style.display = card.getAttribute('data-category') === filter ? '' : 'none';
          }
        });
      });
    });
  }

  /* ===== Settings Tabs ===== */
  function initSettingsTabs() {
    $$('.settings-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        $$('.settings-tab').forEach(function (t) { t.classList.remove('active'); });
        $$('.settings-panel').forEach(function (p) { p.classList.remove('active'); });
        this.classList.add('active');
        var panelId = 'settings-' + this.getAttribute('data-settings');
        var panel = $('#' + panelId);
        if (panel) panel.classList.add('active');
      });
    });

    // Toggle buttons
    $$('.toggle-group').forEach(function (group) {
      $$('.toggle-btn', group).forEach(function (btn) {
        btn.addEventListener('click', function () {
          $$('.toggle-btn', group).forEach(function (b) { b.classList.remove('active'); });
          this.classList.add('active');
        });
      });
    });
  }

  /* ===== Anime.js Ambient Animations ===== */
  function initAmbientAnimations() {
    if (typeof anime === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Animate stat numbers on view
    anime({
      targets: '.stat-number',
      opacity: [0, 1],
      translateY: [20, 0],
      delay: anime.stagger(100),
      duration: 800,
      easing: 'easeOutQuart'
    });

    // Watercolor bleed effect on card hover — using CSS transitions instead for performance
    // Continuous slow rotation on blobs (handled by CSS keyframes, just add variation)
    anime({
      targets: '.blob-purple',
      scale: [1, 1.05, 0.98, 1],
      duration: 15000,
      easing: 'easeInOutSine',
      loop: true
    });

    anime({
      targets: '.blob-teal',
      scale: [1, 0.95, 1.08, 1],
      duration: 18000,
      easing: 'easeInOutSine',
      loop: true
    });

    anime({
      targets: '.blob-rose',
      scale: [1, 1.1, 0.93, 1],
      duration: 20000,
      easing: 'easeInOutSine',
      loop: true
    });
  }

  /* ===== Chat Send Simulation ===== */
  function initChatSend() {
    var sendBtn = $('.chat-send');
    var chatInput = $('.chat-input');
    var chatMessages = $('#chat-messages');

    if (!sendBtn || !chatInput || !chatMessages) return;

    function sendMessage() {
      var text = chatInput.value.trim();
      if (!text) return;

      // Add user message
      var userMsg = document.createElement('div');
      userMsg.className = 'chat-msg msg-user';
      userMsg.innerHTML = '<div class="msg-avatar">JD</div><div class="msg-content"><p>' + escapeHtml(text) + '</p></div>';
      chatMessages.appendChild(userMsg);

      chatInput.value = '';

      // Simulate AI response after delay
      setTimeout(function () {
        var aiMsg = document.createElement('div');
        aiMsg.className = 'chat-msg msg-ai';
        aiMsg.innerHTML = '<div class="msg-avatar">AI</div><div class="msg-content"><p>That\'s an interesting point! Let me think about that and get back to you with some ideas.</p></div>';
        chatMessages.appendChild(aiMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 1000);

      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ===== Notebook Clicks ===== */
  function initNotebookClicks() {
    $$('.notebook-item').forEach(function (item) {
      item.addEventListener('click', function () {
        $$('.notebook-item').forEach(function (n) { n.classList.remove('active'); });
        this.classList.add('active');
      });
    });
  }

  /* ===== Entity Clicks (Schema) ===== */
  function initEntityClicks() {
    $$('.entity-item').forEach(function (item) {
      item.addEventListener('click', function () {
        $$('.entity-item').forEach(function (e) { e.classList.remove('active'); });
        this.classList.add('active');

        var entity = this.getAttribute('data-entity');
        var detailTitle = $('.schema-detail .sidebar-title');
        if (detailTitle) {
          detailTitle.textContent = 'Fields: ' + entity.charAt(0).toUpperCase() + entity.slice(1);
        }
      });
    });
  }

  /* ===== Chat Session Clicks ===== */
  function initChatSessionClicks() {
    $$('.chat-session').forEach(function (session) {
      session.addEventListener('click', function () {
        $$('.chat-session').forEach(function (s) { s.classList.remove('active'); });
        this.classList.add('active');
      });
    });
  }

  /* ===== Initialize All ===== */
  function init() {
    // Route from URL hash
    handleHashChange();

    // Init all features
    initInkCanvas();
    initBrandIcon();
    initDashboardChart();
    initWhiteboardCanvas();
    initSchemaCanvas();
    initDirectoryTree();
    initIdeasFilter();
    initSettingsTabs();
    initChatSend();
    initNotebookClicks();
    initEntityClicks();
    initChatSessionClicks();
    initAmbientAnimations();

    // Draw rough borders after a short delay (DOM needs to settle)
    setTimeout(function () {
      initRoughBorders();
    }, 300);
  }

  // DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
