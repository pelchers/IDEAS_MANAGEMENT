/* ============================== */
/* IDEA MANAGEMENT — HAND-DRAWN   */
/* Pass 1 — app.js                */
/* ============================== */

(function () {
  'use strict';

  /* ============================== */
  /* DOM REFERENCES                 */
  /* ============================== */
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.querySelectorAll('.nav-link');
  const bottomTabs = document.querySelectorAll('.bottom-tab');
  const views = document.querySelectorAll('.view');

  /* ============================== */
  /* HASH-BASED ROUTING             */
  /* ============================== */
  function getViewFromHash() {
    const hash = window.location.hash.replace('#', '');
    return hash || 'dashboard';
  }

  function switchView(viewId) {
    // Deactivate all views
    views.forEach(function (v) { v.classList.remove('active'); });

    // Deactivate all nav links
    navLinks.forEach(function (link) { link.classList.remove('active'); });
    bottomTabs.forEach(function (tab) { tab.classList.remove('active'); });

    // Activate target view
    var targetView = document.getElementById('view-' + viewId);
    if (targetView) {
      targetView.classList.add('active');
    }

    // Activate matching nav links
    navLinks.forEach(function (link) {
      if (link.getAttribute('data-view') === viewId) {
        link.classList.add('active');
      }
    });

    bottomTabs.forEach(function (tab) {
      if (tab.getAttribute('data-view') === viewId) {
        tab.classList.add('active');
      }
    });

    // Close mobile sidebar
    closeMobileSidebar();

    // Animate cards on view change
    animateViewCards(viewId);

    // Re-draw Rough.js borders for visible cards
    requestAnimationFrame(function () {
      drawRoughBorders();
    });
  }

  // Listen for hash changes
  window.addEventListener('hashchange', function () {
    switchView(getViewFromHash());
  });

  // Nav link clicks
  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var viewId = this.getAttribute('data-view');
      window.location.hash = viewId;
    });
  });

  // Bottom tab clicks
  bottomTabs.forEach(function (tab) {
    tab.addEventListener('click', function (e) {
      e.preventDefault();
      var viewId = this.getAttribute('data-view');
      window.location.hash = viewId;
    });
  });

  // Initialize with current hash
  switchView(getViewFromHash());

  /* ============================== */
  /* MOBILE SIDEBAR                 */
  /* ============================== */
  function openMobileSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', openMobileSidebar);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeMobileSidebar);
  }

  /* ============================== */
  /* ROUGH.JS HAND-DRAWN BORDERS    */
  /* ============================== */
  function drawRoughBorders() {
    // Only draw on visible cards that haven't been drawn yet
    var cards = document.querySelectorAll('.view.active .sketch-card');
    cards.forEach(function (card) {
      if (card.querySelector('.rough-border-svg')) return; // already drawn

      var rect = card.getBoundingClientRect();
      var w = card.offsetWidth;
      var h = card.offsetHeight;

      if (w === 0 || h === 0) return;

      var svgNS = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('class', 'rough-border-svg');
      svg.setAttribute('width', w);
      svg.setAttribute('height', h);
      svg.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;z-index:1;overflow:visible;';

      card.style.position = 'relative';
      card.appendChild(svg);

      try {
        var rc = rough.svg(svg);
        var border = rc.rectangle(1, 1, w - 2, h - 2, {
          stroke: '#3D3D3D',
          strokeWidth: 1.5,
          roughness: 1.8,
          bowing: 1.2,
          fill: 'none'
        });
        svg.appendChild(border);
      } catch (e) {
        // Rough.js not loaded, remove the svg
        svg.remove();
      }
    });
  }

  /* ============================== */
  /* GSAP CARD ANIMATIONS           */
  /* ============================== */
  function animateViewCards(viewId) {
    var targetView = document.getElementById('view-' + viewId);
    if (!targetView) return;

    var cards = targetView.querySelectorAll('.sketch-card');
    if (typeof gsap !== 'undefined' && cards.length > 0) {
      gsap.fromTo(cards,
        { opacity: 0, y: 20, rotation: function () { return (Math.random() - 0.5) * 2; } },
        {
          opacity: 1,
          y: 0,
          rotation: function () { return (Math.random() - 0.5) * 1; },
          duration: 0.5,
          stagger: 0.06,
          ease: 'back.out(1.2)',
          clearProps: 'transform'
        }
      );
    }
  }

  // Hover wobble effect for cards
  function initCardHoverEffects() {
    if (typeof gsap === 'undefined') return;

    document.addEventListener('mouseenter', function (e) {
      var card = e.target.closest('.sketch-card');
      if (!card) return;
      gsap.to(card, {
        scale: 1.02,
        rotation: (Math.random() - 0.5) * 1.5,
        duration: 0.3,
        ease: 'power2.out'
      });
    }, true);

    document.addEventListener('mouseleave', function (e) {
      var card = e.target.closest('.sketch-card');
      if (!card) return;
      gsap.to(card, {
        scale: 1,
        rotation: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    }, true);
  }

  initCardHoverEffects();

  /* ============================== */
  /* DASHBOARD CHART (Canvas)       */
  /* ============================== */
  function drawDashboardChart() {
    var canvas = document.getElementById('dashboardChart');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var displayW = canvas.parentElement.offsetWidth - 40;
    var displayH = 200;

    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;
    canvas.style.width = displayW + 'px';
    canvas.style.height = displayH + 'px';
    ctx.scale(dpr, dpr);

    // Mock data
    var data = [3, 5, 8, 6, 12, 9, 15, 11, 18, 14, 22, 24];
    var labels = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    var maxVal = Math.max.apply(null, data) + 2;
    var padding = { top: 20, right: 20, bottom: 30, left: 40 };
    var chartW = displayW - padding.left - padding.right;
    var chartH = displayH - padding.top - padding.bottom;

    // Clear
    ctx.clearRect(0, 0, displayW, displayH);

    // Draw grid lines (dashed, hand-drawn feel)
    ctx.strokeStyle = '#E0D5C5';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (var i = 0; i <= 4; i++) {
      var y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(displayW - padding.right, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw axes
    ctx.strokeStyle = '#3D3D3D';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, displayH - padding.bottom);
    ctx.lineTo(displayW - padding.right, displayH - padding.bottom);
    ctx.stroke();

    // Draw data line (sketchy)
    ctx.strokeStyle = '#E07B39';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    var points = [];
    for (var i = 0; i < data.length; i++) {
      var x = padding.left + (chartW / (data.length - 1)) * i;
      var y = padding.top + chartH - (data[i] / maxVal) * chartH;
      // Add slight wobble for hand-drawn feel
      var wobbleX = x + (Math.random() - 0.5) * 2;
      var wobbleY = y + (Math.random() - 0.5) * 2;
      points.push({ x: wobbleX, y: wobbleY });

      if (i === 0) {
        ctx.moveTo(wobbleX, wobbleY);
      } else {
        ctx.lineTo(wobbleX, wobbleY);
      }
    }
    ctx.stroke();

    // Fill area under curve
    ctx.fillStyle = 'rgba(224, 123, 57, 0.1)';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (var i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(points[points.length - 1].x, displayH - padding.bottom);
    ctx.lineTo(points[0].x, displayH - padding.bottom);
    ctx.closePath();
    ctx.fill();

    // Draw dots at data points
    for (var i = 0; i < points.length; i++) {
      ctx.fillStyle = '#E07B39';
      ctx.beginPath();
      ctx.arc(points[i].x, points[i].y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3D3D3D';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // X-axis labels
    ctx.fillStyle = '#7A7A7A';
    ctx.font = '12px Nunito, sans-serif';
    ctx.textAlign = 'center';
    for (var i = 0; i < labels.length; i++) {
      var x = padding.left + (chartW / (labels.length - 1)) * i;
      ctx.fillText(labels[i], x, displayH - 8);
    }

    // Y-axis labels
    ctx.textAlign = 'right';
    for (var i = 0; i <= 4; i++) {
      var val = Math.round((maxVal / 4) * (4 - i));
      var y = padding.top + (chartH / 4) * i;
      ctx.fillText(val.toString(), padding.left - 8, y + 4);
    }
  }

  // Draw chart on load and resize
  drawDashboardChart();
  window.addEventListener('resize', function () {
    // Redraw chart
    drawDashboardChart();
    // Redraw rough borders
    document.querySelectorAll('.rough-border-svg').forEach(function (svg) { svg.remove(); });
    drawRoughBorders();
  });

  /* ============================== */
  /* WORKSPACE TABS                 */
  /* ============================== */
  var workspaceTabs = document.querySelectorAll('.workspace-tab');
  var workspacePanels = document.querySelectorAll('.workspace-panel');

  workspaceTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = this.getAttribute('data-workspace-tab');

      workspaceTabs.forEach(function (t) { t.classList.remove('active'); });
      workspacePanels.forEach(function (p) { p.classList.remove('active'); });

      this.classList.add('active');
      var panel = document.getElementById('workspace-' + target);
      if (panel) panel.classList.add('active');
    });
  });

  /* ============================== */
  /* SETTINGS SUB-NAVIGATION        */
  /* ============================== */
  var settingsNavBtns = document.querySelectorAll('.settings-nav-btn');
  var settingsPanels = document.querySelectorAll('.settings-panel');

  settingsNavBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = this.getAttribute('data-settings');

      settingsNavBtns.forEach(function (b) { b.classList.remove('active'); });
      settingsPanels.forEach(function (p) { p.classList.remove('active'); });

      this.classList.add('active');
      var panel = document.getElementById('settings-' + target);
      if (panel) panel.classList.add('active');
    });
  });

  /* ============================== */
  /* TOGGLE SWITCHES                */
  /* ============================== */
  document.querySelectorAll('.toggle-switch').forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      this.classList.toggle('on');
      var isOn = this.classList.contains('on');
      this.setAttribute('aria-checked', isOn ? 'true' : 'false');
    });
  });

  /* ============================== */
  /* WHITEBOARD TOOLBAR             */
  /* ============================== */
  var toolBtns = document.querySelectorAll('.tool-btn');
  toolBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      toolBtns.forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');
    });
  });

  var swatches = document.querySelectorAll('.swatch');
  swatches.forEach(function (swatch) {
    swatch.addEventListener('click', function () {
      swatches.forEach(function (s) { s.classList.remove('active'); });
      this.classList.add('active');
    });
  });

  /* ============================== */
  /* WHITEBOARD DRAWING             */
  /* ============================== */
  (function initWhiteboard() {
    var canvas = document.getElementById('whiteboardCanvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var drawing = false;
    var currentColor = '#3D3D3D';
    var hint = document.querySelector('.whiteboard-hint');

    function resizeCanvas() {
      var parent = canvas.parentElement;
      var dpr = window.devicePixelRatio || 1;
      canvas.width = parent.offsetWidth * dpr;
      canvas.height = (window.innerWidth <= 768 ? 300 : 500) * dpr;
      canvas.style.width = parent.offsetWidth + 'px';
      canvas.style.height = (window.innerWidth <= 768 ? 300 : 500) + 'px';
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 3;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track swatch color changes
    swatches.forEach(function (swatch) {
      swatch.addEventListener('click', function () {
        currentColor = this.getAttribute('data-color');
      });
    });

    function getPos(e) {
      var rect = canvas.getBoundingClientRect();
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      var clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }

    canvas.addEventListener('mousedown', function (e) {
      drawing = true;
      if (hint) { hint.style.display = 'none'; }
      var pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.strokeStyle = currentColor;
    });

    canvas.addEventListener('mousemove', function (e) {
      if (!drawing) return;
      var pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    });

    canvas.addEventListener('mouseup', function () { drawing = false; });
    canvas.addEventListener('mouseleave', function () { drawing = false; });

    // Touch support
    canvas.addEventListener('touchstart', function (e) {
      e.preventDefault();
      drawing = true;
      if (hint) { hint.style.display = 'none'; }
      var pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.strokeStyle = currentColor;
    }, { passive: false });

    canvas.addEventListener('touchmove', function (e) {
      e.preventDefault();
      if (!drawing) return;
      var pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }, { passive: false });

    canvas.addEventListener('touchend', function () { drawing = false; });
  })();

  /* ============================== */
  /* SCHEMA ENTITY BUTTONS          */
  /* ============================== */
  var entityBtns = document.querySelectorAll('.entity-btn');
  entityBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      entityBtns.forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');

      var entityId = this.getAttribute('data-entity');
      var entityCard = document.getElementById('entity-' + entityId);
      if (entityCard) {
        // Highlight the entity card
        document.querySelectorAll('.schema-entity-card').forEach(function (card) {
          card.style.outline = 'none';
        });
        entityCard.style.outline = '3px dashed #E07B39';
        entityCard.style.outlineOffset = '4px';
      }
    });
  });

  /* ============================== */
  /* DIRECTORY TREE                 */
  /* ============================== */
  var treeToggles = document.querySelectorAll('.tree-toggle');
  treeToggles.forEach(function (toggle) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var treeId = this.getAttribute('data-tree');
      var children = document.getElementById('tree-' + treeId);
      if (!children) return;

      var isExpanded = this.classList.contains('expanded');
      if (isExpanded) {
        this.classList.remove('expanded');
        this.textContent = '\u25B6'; // right arrow
        children.classList.add('collapsed');
      } else {
        this.classList.add('expanded');
        this.textContent = '\u25BC'; // down arrow
        children.classList.remove('collapsed');
      }
    });
  });

  // File detail display
  var leafNodes = document.querySelectorAll('.tree-node.leaf');
  var fileDetailsEl = document.getElementById('fileDetails');

  var fileDetails = {
    'Dashboard.tsx': { type: 'React Component', size: '4.2 KB', modified: 'Mar 5, 2026', lines: 142 },
    'KanbanBoard.tsx': { type: 'React Component', size: '6.8 KB', modified: 'Mar 4, 2026', lines: 234 },
    'Whiteboard.tsx': { type: 'React Component', size: '8.1 KB', modified: 'Mar 3, 2026', lines: 312 },
    'IdeaCapture.tsx': { type: 'React Component', size: '3.5 KB', modified: 'Mar 5, 2026', lines: 108 },
    'useProjects.ts': { type: 'Custom Hook', size: '1.2 KB', modified: 'Mar 2, 2026', lines: 45 },
    'useIdeas.ts': { type: 'Custom Hook', size: '1.8 KB', modified: 'Mar 1, 2026', lines: 62 },
    'useAuth.ts': { type: 'Custom Hook', size: '0.9 KB', modified: 'Feb 28, 2026', lines: 34 },
    'helpers.ts': { type: 'Utility Module', size: '2.1 KB', modified: 'Feb 25, 2026', lines: 78 },
    'validators.ts': { type: 'Utility Module', size: '1.5 KB', modified: 'Feb 26, 2026', lines: 56 },
    'schema.ts': { type: 'Convex Schema', size: '3.4 KB', modified: 'Mar 4, 2026', lines: 124 },
    'projects.ts': { type: 'Convex Function', size: '2.7 KB', modified: 'Mar 3, 2026', lines: 96 },
    'ideas.ts': { type: 'Convex Function', size: '2.3 KB', modified: 'Mar 2, 2026', lines: 82 },
    'package.json': { type: 'Config File', size: '1.8 KB', modified: 'Mar 1, 2026', lines: 48 },
    'tsconfig.json': { type: 'Config File', size: '0.6 KB', modified: 'Feb 20, 2026', lines: 22 },
    'README.md': { type: 'Documentation', size: '3.2 KB', modified: 'Mar 5, 2026', lines: 95 }
  };

  leafNodes.forEach(function (node) {
    node.addEventListener('click', function () {
      var fileName = this.querySelector('.tree-label').textContent;
      var details = fileDetails[fileName];

      // Highlight selected
      leafNodes.forEach(function (n) { n.style.background = ''; });
      this.style.background = 'rgba(224, 123, 57, 0.15)';

      if (details && fileDetailsEl) {
        fileDetailsEl.innerHTML = '<div class="detail-info"><div class="detail-info-label">File Name</div><div class="detail-info-value">' + fileName + '</div></div>' +
          '<div class="detail-info"><div class="detail-info-label">Type</div><div class="detail-info-value">' + details.type + '</div></div>' +
          '<div class="detail-info"><div class="detail-info-label">Size</div><div class="detail-info-value">' + details.size + '</div></div>' +
          '<div class="detail-info"><div class="detail-info-label">Lines</div><div class="detail-info-value">' + details.lines + '</div></div>' +
          '<div class="detail-info"><div class="detail-info-label">Last Modified</div><div class="detail-info-value">' + details.modified + '</div></div>';
      }
    });
  });

  /* ============================== */
  /* IDEAS FILTER                   */
  /* ============================== */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var ideaCards = document.querySelectorAll('.idea-card');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');

      var filter = this.getAttribute('data-filter');

      ideaCards.forEach(function (card) {
        if (filter === 'all' || card.getAttribute('data-priority') === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* ============================== */
  /* AI CHAT MOCK SEND              */
  /* ============================== */
  var chatInput = document.getElementById('chatInput');
  var chatSendBtn = document.getElementById('chatSendBtn');
  var chatMessages = document.getElementById('chatMessages');

  function sendChatMessage() {
    if (!chatInput || !chatMessages) return;
    var text = chatInput.value.trim();
    if (!text) return;

    // Add user message
    var userMsg = document.createElement('div');
    userMsg.className = 'chat-message user-message';
    userMsg.innerHTML = '<div class="sketch-card chat-bubble"><p>' + escapeHtml(text) + '</p></div><div class="chat-avatar user-avatar">JD</div>';
    chatMessages.appendChild(userMsg);

    chatInput.value = '';

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Simulate AI response
    setTimeout(function () {
      var aiMsg = document.createElement('div');
      aiMsg.className = 'chat-message ai-message';
      var responses = [
        "That's an interesting thought! Let me think about how we could approach that from a design perspective.",
        "Great idea! I'd suggest breaking that down into smaller, testable chunks. Want me to help with a task breakdown?",
        "I can see several angles to explore here. Shall we start with user research or jump into prototyping?",
        "Hmm, that reminds me of a pattern I've seen work well in other projects. Let me elaborate on that approach."
      ];
      var randomResponse = responses[Math.floor(Math.random() * responses.length)];
      aiMsg.innerHTML = '<div class="chat-avatar ai-avatar">AI</div><div class="sketch-card chat-bubble"><p>' + randomResponse + '</p></div>';
      chatMessages.appendChild(aiMsg);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Animate new messages
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(aiMsg, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
      }
    }, 800);
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  if (chatSendBtn) {
    chatSendBtn.addEventListener('click', sendChatMessage);
  }

  if (chatInput) {
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }

  /* ============================== */
  /* KANBAN DRAG AND DROP           */
  /* ============================== */
  (function initKanbanDrag() {
    var draggedCard = null;

    document.querySelectorAll('.kanban-card').forEach(function (card) {
      card.addEventListener('dragstart', function (e) {
        draggedCard = this;
        this.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
      });

      card.addEventListener('dragend', function () {
        this.style.opacity = '';
        draggedCard = null;
      });
    });

    document.querySelectorAll('.kanban-cards').forEach(function (column) {
      column.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        this.style.background = 'rgba(224, 123, 57, 0.08)';
        this.style.borderRadius = '3px';
      });

      column.addEventListener('dragleave', function () {
        this.style.background = '';
      });

      column.addEventListener('drop', function (e) {
        e.preventDefault();
        this.style.background = '';
        if (draggedCard) {
          this.appendChild(draggedCard);
          // Update column counts
          updateKanbanCounts();
          // Animate placement
          if (typeof gsap !== 'undefined') {
            gsap.fromTo(draggedCard,
              { scale: 0.9, rotation: -2 },
              { scale: 1, rotation: 0, duration: 0.3, ease: 'back.out(1.5)' }
            );
          }
        }
      });
    });

    function updateKanbanCounts() {
      document.querySelectorAll('.kanban-column').forEach(function (col) {
        var count = col.querySelectorAll('.kanban-card').length;
        var countEl = col.querySelector('.column-count');
        if (countEl) countEl.textContent = count;
      });
    }
  })();

  /* ============================== */
  /* SCHEMA RELATIONSHIP LINES      */
  /* ============================== */
  function drawSchemaLines() {
    var svgEl = document.getElementById('schemaLines');
    if (!svgEl) return;

    // Only draw on desktop where cards are absolutely positioned
    if (window.innerWidth <= 768) {
      svgEl.innerHTML = '';
      return;
    }

    svgEl.innerHTML = '';
    var canvas = document.querySelector('.schema-canvas');
    if (!canvas) return;

    var relationships = [
      { from: 'entity-user', to: 'entity-project' },
      { from: 'entity-project', to: 'entity-idea' },
      { from: 'entity-idea', to: 'entity-task' },
      { from: 'entity-idea', to: 'entity-comment' },
      { from: 'entity-user', to: 'entity-task' },
      { from: 'entity-user', to: 'entity-comment' }
    ];

    relationships.forEach(function (rel) {
      var fromEl = document.getElementById(rel.from);
      var toEl = document.getElementById(rel.to);
      if (!fromEl || !toEl) return;

      var fromRect = fromEl.getBoundingClientRect();
      var toRect = toEl.getBoundingClientRect();
      var canvasRect = canvas.getBoundingClientRect();

      var fromX = fromRect.left + fromRect.width / 2 - canvasRect.left + canvas.scrollLeft;
      var fromY = fromRect.top + fromRect.height - canvasRect.top + canvas.scrollTop;
      var toX = toRect.left + toRect.width / 2 - canvasRect.left + canvas.scrollLeft;
      var toY = toRect.top - canvasRect.top + canvas.scrollTop;

      try {
        var rc = rough.svg(svgEl);
        var line = rc.line(fromX, fromY, toX, toY, {
          stroke: '#C5B9A8',
          strokeWidth: 1.5,
          roughness: 1.5
        });
        svgEl.appendChild(line);
      } catch (e) {
        // Fallback: plain SVG line
        var svgNS = 'http://www.w3.org/2000/svg';
        var lineEl = document.createElementNS(svgNS, 'line');
        lineEl.setAttribute('x1', fromX);
        lineEl.setAttribute('y1', fromY);
        lineEl.setAttribute('x2', toX);
        lineEl.setAttribute('y2', toY);
        lineEl.setAttribute('stroke', '#C5B9A8');
        lineEl.setAttribute('stroke-width', '1.5');
        lineEl.setAttribute('stroke-dasharray', '6 4');
        svgEl.appendChild(lineEl);
      }
    });
  }

  // Draw schema lines when schema view is visible
  var schemaObserver = new MutationObserver(function () {
    var schemaView = document.getElementById('view-schema');
    if (schemaView && schemaView.classList.contains('active')) {
      setTimeout(drawSchemaLines, 100);
    }
  });

  views.forEach(function (view) {
    schemaObserver.observe(view, { attributes: true, attributeFilter: ['class'] });
  });

  /* ============================== */
  /* THEME OPTION BUTTONS           */
  /* ============================== */
  document.querySelectorAll('.theme-option').forEach(function (opt) {
    opt.addEventListener('click', function () {
      document.querySelectorAll('.theme-option').forEach(function (o) { o.classList.remove('active'); });
      this.classList.add('active');
    });
  });

  /* ============================== */
  /* FONT SIZE RANGE                */
  /* ============================== */
  var fontRange = document.querySelector('.form-range');
  var rangeValue = document.querySelector('.range-value');
  if (fontRange && rangeValue) {
    fontRange.addEventListener('input', function () {
      rangeValue.textContent = this.value + 'px';
    });
  }

  /* ============================== */
  /* INITIAL ROUGH BORDERS          */
  /* ============================== */
  // Draw after a short delay to allow layout
  setTimeout(function () {
    drawRoughBorders();
    drawSchemaLines();
  }, 300);

  /* ============================== */
  /* PAGE LOAD ANIMATION            */
  /* ============================== */
  if (typeof gsap !== 'undefined') {
    gsap.fromTo('.sidebar',
      { x: -20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
    );

    gsap.fromTo('.view-header',
      { y: -10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, delay: 0.2, ease: 'power2.out' }
    );
  }

})();
