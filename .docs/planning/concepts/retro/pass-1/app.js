/* ============================================
   IDEA-OS v1.0 — Retro Terminal Theme
   Application Logic
   Style: Retro (1970s-80s CRT / BBS)
   Pass: 1
   ============================================ */

(function () {
  'use strict';

  /* ===== Constants & Mock Data ===== */
  const VIEWS = [
    'dashboard', 'projects', 'workspace', 'kanban',
    'whiteboard', 'schema', 'directory', 'ideas', 'chat', 'settings'
  ];

  const PROJECTS = [
    { name: 'Project Alpha', status: 'active', date: '2026-03-01', icon: '>' },
    { name: 'Mobile Redesign', status: 'active', date: '2026-02-28', icon: '>' },
    { name: 'API Gateway v2', status: 'paused', date: '2026-02-15', icon: '>' },
    { name: 'Data Pipeline', status: 'active', date: '2026-02-10', icon: '>' },
    { name: 'Landing Page', status: 'completed', date: '2026-01-20', icon: '>' },
    { name: 'Auth Service', status: 'completed', date: '2026-01-05', icon: '>' },
    { name: 'ML Recommendation', status: 'active', date: '2026-03-03', icon: '>' },
    { name: 'DevOps Automation', status: 'paused', date: '2026-02-22', icon: '>' },
  ];

  const KANBAN_TASKS = {
    backlog: [
      { title: 'Setup CI/CD pipeline', priority: 'high', assignee: 'DEV-01' },
      { title: 'Design system tokens', priority: 'medium', assignee: 'DES-03' },
      { title: 'Write API documentation', priority: 'low', assignee: 'DOC-02' },
      { title: 'Performance audit', priority: 'high', assignee: 'DEV-04' },
    ],
    progress: [
      { title: 'User auth flow', priority: 'high', assignee: 'DEV-02' },
      { title: 'Dashboard widgets', priority: 'medium', assignee: 'DEV-01' },
      { title: 'Mobile responsive nav', priority: 'medium', assignee: 'DES-01' },
    ],
    done: [
      { title: 'Database schema', priority: 'high', assignee: 'DEV-03' },
      { title: 'Logo design', priority: 'low', assignee: 'DES-02' },
      { title: 'Wireframe review', priority: 'medium', assignee: 'DES-01' },
      { title: 'Git repo setup', priority: 'low', assignee: 'DEV-01' },
      { title: 'Project kickoff', priority: 'medium', assignee: 'PM-01' },
    ]
  };

  const ACTIVITY_LOG = [
    { time: '14:32', type: 'CREATE', msg: 'New idea: ML-powered search suggestions' },
    { time: '14:15', type: 'UPDATE', msg: 'Project Alpha status changed to IN PROGRESS' },
    { time: '13:58', type: 'MOVE', msg: 'Task "User auth flow" moved to IN PROGRESS' },
    { time: '13:42', type: 'DELETE', msg: 'Removed stale tag: legacy-support' },
    { time: '12:30', type: 'CREATE', msg: 'New project: ML Recommendation Engine' },
    { time: '12:15', type: 'SYSTEM', msg: 'Auto-save completed (47 items synced)' },
    { time: '11:50', type: 'UPDATE', msg: 'Schema updated: added TAGS junction table' },
    { time: '11:22', type: 'CREATE', msg: 'New idea: Real-time collaboration module' },
  ];

  const IDEAS = [
    { title: 'AI-Powered Idea Clustering', desc: 'Use ML to automatically group similar ideas and suggest connections.', tags: ['AI', 'ML'], date: '2026-03-04', status: 'active', starred: true },
    { title: 'Voice-to-Idea Capture', desc: 'Record voice memos and auto-transcribe them into structured ideas.', tags: ['VOICE', 'UX'], date: '2026-03-03', status: 'active', starred: false },
    { title: 'Kanban Workflow Templates', desc: 'Pre-built workflow templates for common project types.', tags: ['WORKFLOW'], date: '2026-03-01', status: 'active', starred: true },
    { title: 'Collaborative Whiteboard', desc: 'Real-time whiteboard with multi-user support and shape recognition.', tags: ['COLLAB', 'UI'], date: '2026-02-28', status: 'active', starred: false },
    { title: 'Auto-Tag Suggestions', desc: 'Suggest tags based on idea content using NLP analysis.', tags: ['AI', 'NLP'], date: '2026-02-25', status: 'active', starred: false },
    { title: 'Export to PDF/Markdown', desc: 'Export ideas, projects, and schemas to PDF or Markdown format.', tags: ['EXPORT'], date: '2026-02-20', status: 'archived', starred: false },
    { title: 'Dark Mode Toggle', desc: 'System-wide dark mode with phosphor green theme option.', tags: ['UI', 'UX'], date: '2026-02-15', status: 'archived', starred: true },
    { title: 'Idea Version History', desc: 'Track changes to ideas over time with diff view.', tags: ['VERSIONING'], date: '2026-02-10', status: 'active', starred: false },
    { title: 'Priority Matrix View', desc: 'Eisenhower matrix visualization for idea prioritization.', tags: ['VIEW', 'UX'], date: '2026-02-05', status: 'active', starred: false },
  ];

  const DIR_TREE = {
    name: 'C:\\IDEA-OS',
    type: 'folder',
    children: [
      {
        name: 'projects', type: 'folder', children: [
          { name: 'project-alpha', type: 'folder', children: [
            { name: 'README.md', type: 'file' },
            { name: 'config.json', type: 'file' },
            { name: 'src', type: 'folder', children: [
              { name: 'main.ts', type: 'file' },
              { name: 'utils.ts', type: 'file' },
              { name: 'types.ts', type: 'file' },
            ]}
          ]},
          { name: 'mobile-redesign', type: 'folder', children: [
            { name: 'mockups.fig', type: 'file' },
            { name: 'style-guide.css', type: 'file' },
          ]},
          { name: 'api-gateway', type: 'folder', children: [
            { name: 'routes.js', type: 'file' },
            { name: 'middleware.js', type: 'file' },
            { name: 'tests', type: 'folder', children: [
              { name: 'api.test.js', type: 'file' },
              { name: 'auth.test.js', type: 'file' },
            ]}
          ]}
        ]
      },
      {
        name: 'ideas', type: 'folder', children: [
          { name: 'backlog.json', type: 'file' },
          { name: 'archived.json', type: 'file' },
          { name: 'starred.json', type: 'file' },
        ]
      },
      {
        name: 'schemas', type: 'folder', children: [
          { name: 'users.sql', type: 'file' },
          { name: 'ideas.sql', type: 'file' },
          { name: 'projects.sql', type: 'file' },
        ]
      },
      { name: 'CONFIG.SYS', type: 'file' },
      { name: 'AUTOEXEC.BAT', type: 'file' },
      { name: 'README.TXT', type: 'file' },
    ]
  };

  const AI_RESPONSES = [
    'PROCESSING... Based on your query, I recommend structuring your ideas using a hierarchical tagging system. This allows for flexible categorization while maintaining clear relationships.',
    'ANALYSIS COMPLETE. The most effective approach would be to combine kanban workflows with regular review cycles. This ensures ideas progress through defined stages with accountability checkpoints.',
    'SCANNING DATABASE... I found 3 similar ideas in your archive. Consider merging "Voice-to-Idea" with "Auto-Tag Suggestions" for a more powerful feature set.',
    'COMPUTING OPTIMAL LAYOUT... For your schema, I suggest normalizing the TAGS table and adding a composite index on (idea_id, tag_id) in the junction table for faster queries.',
    'SYSTEM RECOMMENDATION: Enable auto-save at 30-second intervals to prevent data loss. Additionally, consider implementing version history for critical ideas.',
  ];

  /* ===== DOM References ===== */
  const contentArea = document.getElementById('contentArea');
  const commandBar = document.getElementById('commandBar');
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const statusMessage = document.getElementById('statusMessage');
  const systemClock = document.getElementById('systemClock');

  /* ===== Router / View Switching ===== */
  function navigateToView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(function (v) {
      v.classList.remove('active');
    });

    // Show target view
    var target = document.getElementById('view-' + viewName);
    if (target) {
      target.classList.add('active');
    }

    // Update nav active state
    document.querySelectorAll('.cmd-tab').forEach(function (tab) {
      tab.classList.remove('active');
      if (tab.dataset.view === viewName) {
        tab.classList.add('active');
      }
    });

    // Update status message
    if (statusMessage) {
      statusMessage.textContent = 'LOADED: ' + viewName.toUpperCase() + '.EXE';
    }

    // Close mobile menu
    if (commandBar) commandBar.classList.remove('open');
    if (mobileToggle) mobileToggle.classList.remove('open');

    // Scroll content to top
    if (contentArea) contentArea.scrollTop = 0;

    // View-specific init
    if (viewName === 'dashboard') initDashboard();
    if (viewName === 'whiteboard') initWhiteboard();
    if (viewName === 'workspace') initLineNumbers();
    if (viewName === 'schema') drawSchemaLines();
  }

  function handleHashChange() {
    var hash = window.location.hash.replace('#', '') || 'dashboard';
    if (VIEWS.indexOf(hash) !== -1) {
      navigateToView(hash);
    } else {
      navigateToView('dashboard');
    }
  }

  /* ===== Navigation Event Listeners ===== */
  document.querySelectorAll('.cmd-tab').forEach(function (tab) {
    tab.addEventListener('click', function (e) {
      e.preventDefault();
      var view = this.dataset.view;
      window.location.hash = view;
    });
  });

  // Mobile menu toggle
  if (mobileToggle) {
    mobileToggle.addEventListener('click', function () {
      commandBar.classList.toggle('open');
      this.classList.toggle('open');
    });
  }

  // Hash routing
  window.addEventListener('hashchange', handleHashChange);

  /* ===== System Clock ===== */
  function updateClock() {
    var now = new Date();
    var h = String(now.getHours()).padStart(2, '0');
    var m = String(now.getMinutes()).padStart(2, '0');
    var s = String(now.getSeconds()).padStart(2, '0');
    if (systemClock) systemClock.textContent = h + ':' + m + ':' + s;
  }
  setInterval(updateClock, 1000);
  updateClock();

  /* ===== Dashboard Initialization ===== */
  var dashboardInitialized = false;

  function initDashboard() {
    if (dashboardInitialized) return;
    dashboardInitialized = true;

    // Typed.js welcome message
    if (typeof Typed !== 'undefined') {
      new Typed('#dashboardTyped', {
        strings: ['LOADING DASHBOARD... COMPLETE. WELCOME BACK, ADMIN.'],
        typeSpeed: 30,
        showCursor: true,
        cursorChar: '\u2588',
        onComplete: function () { }
      });
    }

    // Animate stat counters
    document.querySelectorAll('.stat-value[data-count]').forEach(function (el) {
      var target = parseInt(el.dataset.count, 10);
      var current = 0;
      var step = Math.ceil(target / 30);
      var interval = setInterval(function () {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        el.textContent = current;
      }, 40);
    });

    // Initialize charts
    initCharts();

    // Populate activity log
    populateActivityLog();
  }

  /* ===== Charts ===== */
  function initCharts() {
    if (typeof Chart === 'undefined') return;

    // Set Chart.js defaults for retro look
    Chart.defaults.color = '#00FF41';
    Chart.defaults.borderColor = 'rgba(0, 255, 65, 0.2)';
    Chart.defaults.font.family = "'Share Tech Mono', monospace";

    // Activity Chart (Line)
    var activityCtx = document.getElementById('activityChart');
    if (activityCtx) {
      new Chart(activityCtx.getContext('2d'), {
        type: 'line',
        data: {
          labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
          datasets: [
            {
              label: 'IDEAS',
              data: [5, 8, 12, 7, 15, 9, 11],
              borderColor: '#00FF41',
              backgroundColor: 'rgba(0, 255, 65, 0.1)',
              borderWidth: 2,
              pointBackgroundColor: '#00FF41',
              pointRadius: 4,
              fill: true,
              tension: 0.1
            },
            {
              label: 'TASKS',
              data: [3, 6, 4, 9, 7, 5, 8],
              borderColor: '#FF6B00',
              backgroundColor: 'rgba(255, 107, 0, 0.1)',
              borderWidth: 2,
              pointBackgroundColor: '#FF6B00',
              pointRadius: 4,
              fill: true,
              tension: 0.1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                font: { family: "'Press Start 2P'", size: 8 },
                color: '#00FF41',
                padding: 12,
                usePointStyle: true,
                pointStyleWidth: 10
              }
            }
          },
          scales: {
            x: {
              ticks: { font: { family: "'Press Start 2P'", size: 7 }, color: '#00cc34' },
              grid: { color: 'rgba(0, 255, 65, 0.1)' }
            },
            y: {
              ticks: { font: { family: "'Press Start 2P'", size: 7 }, color: '#00cc34' },
              grid: { color: 'rgba(0, 255, 65, 0.1)' }
            }
          }
        }
      });
    }

    // Category Chart (Doughnut)
    var categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
      new Chart(categoryCtx.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: ['DEV', 'DESIGN', 'RESEARCH', 'DOCS', 'OPS'],
          datasets: [{
            data: [35, 22, 18, 12, 13],
            backgroundColor: [
              '#00FF41',
              '#FF6B00',
              '#FF00FF',
              '#00FFFF',
              '#FFFF00'
            ],
            borderColor: '#0A0A0A',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: { family: "'Press Start 2P'", size: 7 },
                color: '#00FF41',
                padding: 8,
                usePointStyle: true,
                pointStyleWidth: 8
              }
            }
          }
        }
      });
    }
  }

  /* ===== Activity Log ===== */
  function populateActivityLog() {
    var container = document.getElementById('activityLog');
    if (!container) return;

    container.innerHTML = '';
    ACTIVITY_LOG.forEach(function (entry) {
      var div = document.createElement('div');
      div.className = 'log-entry';
      div.innerHTML =
        '<span class="log-time">[' + entry.time + ']</span>' +
        '<span class="log-type">' + entry.type + '</span>' +
        '<span class="log-msg">' + entry.msg + '</span>';
      container.appendChild(div);
    });
  }

  /* ===== Projects List ===== */
  function populateProjects() {
    var container = document.getElementById('projectList');
    if (!container) return;

    container.innerHTML = '';
    PROJECTS.forEach(function (proj) {
      var div = document.createElement('div');
      div.className = 'project-item';
      div.innerHTML =
        '<span class="project-icon">' + proj.icon + '</span>' +
        '<span class="project-name">' + proj.name + '</span>' +
        '<span class="project-status ' + proj.status + '">' + proj.status.toUpperCase() + '</span>' +
        '<span class="project-date">' + proj.date + '</span>';
      container.appendChild(div);
    });
  }

  // Project search
  var projectSearch = document.getElementById('projectSearch');
  if (projectSearch) {
    projectSearch.addEventListener('input', function () {
      var query = this.value.toLowerCase();
      document.querySelectorAll('.project-item').forEach(function (item) {
        var name = item.querySelector('.project-name').textContent.toLowerCase();
        item.style.display = name.indexOf(query) !== -1 ? '' : 'none';
      });
    });
  }

  /* ===== Kanban Board ===== */
  function populateKanban() {
    var columns = {
      backlog: document.getElementById('backlogCards'),
      progress: document.getElementById('progressCards'),
      done: document.getElementById('doneCards')
    };

    Object.keys(columns).forEach(function (key) {
      var container = columns[key];
      if (!container) return;
      container.innerHTML = '';

      KANBAN_TASKS[key].forEach(function (task) {
        var card = document.createElement('div');
        card.className = 'kanban-card';
        card.innerHTML =
          '<div class="card-title">' + task.title + '</div>' +
          '<div class="card-meta">' +
          '  <span class="card-priority ' + task.priority + '">' + task.priority.toUpperCase() + '</span>' +
          '  <span>' + task.assignee + '</span>' +
          '</div>';
        container.appendChild(card);
      });
    });

    // Initialize SortableJS for drag-and-drop
    if (typeof Sortable !== 'undefined') {
      Object.keys(columns).forEach(function (key) {
        if (columns[key]) {
          new Sortable(columns[key], {
            group: 'kanban',
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            onEnd: function () {
              updateKanbanCounts();
            }
          });
        }
      });
    }
  }

  function updateKanbanCounts() {
    var backlog = document.getElementById('backlogCards');
    var progress = document.getElementById('progressCards');
    var done = document.getElementById('doneCards');

    var backlogCount = document.getElementById('backlogCount');
    var progressCount = document.getElementById('progressCount');
    var doneCount = document.getElementById('doneCount');

    if (backlogCount && backlog) backlogCount.textContent = backlog.children.length;
    if (progressCount && progress) progressCount.textContent = progress.children.length;
    if (doneCount && done) doneCount.textContent = done.children.length;
  }

  /* ===== Whiteboard ===== */
  var whiteboardActive = false;
  var drawColor = '#00FF41';
  var drawTool = 'draw';

  function initWhiteboard() {
    if (whiteboardActive) return;
    whiteboardActive = true;

    var canvas = document.getElementById('whiteboardCanvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var drawing = false;
    var lastX = 0;
    var lastY = 0;

    function resizeCanvas() {
      var parent = canvas.parentElement;
      canvas.width = parent.clientWidth - 2;
      canvas.height = 500;
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.05)';
      ctx.lineWidth = 1;
      for (var x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (var y = 0; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    resizeCanvas();

    function getPos(e) {
      var rect = canvas.getBoundingClientRect();
      var clientX, clientY;
      if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }

    function startDraw(e) {
      e.preventDefault();
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

      if (drawTool === 'erase') {
        ctx.strokeStyle = '#0A0A0A';
        ctx.lineWidth = 20;
      } else {
        ctx.strokeStyle = drawColor;
        ctx.lineWidth = 2;
        ctx.shadowColor = drawColor;
        ctx.shadowBlur = 4;
      }

      ctx.stroke();
      ctx.shadowBlur = 0;

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

    // Tool buttons
    document.querySelectorAll('.tool-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.tool-btn').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        drawTool = this.dataset.tool;
        canvas.style.cursor = drawTool === 'erase' ? 'cell' : 'crosshair';
      });
    });

    // Color dots
    document.querySelectorAll('.color-dot').forEach(function (dot) {
      dot.addEventListener('click', function () {
        document.querySelectorAll('.color-dot').forEach(function (d) { d.classList.remove('active'); });
        this.classList.add('active');
        drawColor = this.dataset.color;
      });
    });

    // Clear canvas
    var clearBtn = document.getElementById('clearCanvasBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        resizeCanvas();
      });
    }
  }

  /* ===== Schema Lines (SVG) ===== */
  function drawSchemaLines() {
    var svg = document.getElementById('schemaLines');
    if (!svg) return;

    // Only draw lines on wider screens
    if (window.innerWidth <= 1024) return;

    var canvas = document.getElementById('schemaCanvas');
    if (!canvas) return;

    svg.innerHTML = '';
    svg.setAttribute('width', canvas.scrollWidth);
    svg.setAttribute('height', canvas.scrollHeight);

    var connections = [
      { from: 'tableUsers', to: 'tableIdeas', fromSide: 'right', toSide: 'left' },
      { from: 'tableIdeas', to: 'tableProjects', fromSide: 'right', toSide: 'left' },
      { from: 'tableIdeas', to: 'tableIdeaTags', fromSide: 'bottom', toSide: 'top' },
      { from: 'tableTags', to: 'tableIdeaTags', fromSide: 'right', toSide: 'left' },
    ];

    connections.forEach(function (conn) {
      var fromEl = document.getElementById(conn.from);
      var toEl = document.getElementById(conn.to);
      if (!fromEl || !toEl) return;

      var fromRect = fromEl.getBoundingClientRect();
      var toRect = toEl.getBoundingClientRect();
      var canvasRect = canvas.getBoundingClientRect();

      var x1, y1, x2, y2;

      if (conn.fromSide === 'right') {
        x1 = fromRect.right - canvasRect.left;
        y1 = fromRect.top + fromRect.height / 2 - canvasRect.top;
      } else {
        x1 = fromRect.left + fromRect.width / 2 - canvasRect.left;
        y1 = fromRect.bottom - canvasRect.top;
      }

      if (conn.toSide === 'left') {
        x2 = toRect.left - canvasRect.left;
        y2 = toRect.top + toRect.height / 2 - canvasRect.top;
      } else {
        x2 = toRect.left + toRect.width / 2 - canvasRect.left;
        y2 = toRect.top - canvasRect.top;
      }

      var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      svg.appendChild(line);
    });
  }

  /* ===== Directory Tree ===== */
  function buildTree(node, depth) {
    var html = '';
    if (node.type === 'folder') {
      var isOpen = depth < 2;
      html += '<div class="tree-node">';
      html += '<div class="tree-folder" data-depth="' + depth + '">';
      html += '<span class="folder-arrow ' + (isOpen ? 'open' : '') + '">&#9654;</span>';
      html += '<span class="folder-icon">&#128193;</span> ';
      html += node.name;
      html += '</div>';
      html += '<div class="tree-children' + (isOpen ? '' : ' collapsed') + '">';
      if (node.children) {
        node.children.forEach(function (child) {
          html += buildTree(child, depth + 1);
        });
      }
      html += '</div></div>';
    } else {
      html += '<div class="tree-node">';
      html += '<div class="tree-file">';
      html += '<span class="file-type-icon">&#9632;</span> ';
      html += node.name;
      html += '</div></div>';
    }
    return html;
  }

  function populateDirectory() {
    var container = document.getElementById('dirTree');
    if (!container) return;
    container.innerHTML = buildTree(DIR_TREE, 0);

    // Toggle folders
    container.addEventListener('click', function (e) {
      var folder = e.target.closest('.tree-folder');
      if (!folder) return;
      var children = folder.nextElementSibling;
      var arrow = folder.querySelector('.folder-arrow');
      if (children && children.classList.contains('tree-children')) {
        children.classList.toggle('collapsed');
        if (arrow) arrow.classList.toggle('open');
      }
    });
  }

  // Expand/Collapse All
  var expandAllBtn = document.getElementById('expandAllBtn');
  var collapseAllBtn = document.getElementById('collapseAllBtn');

  if (expandAllBtn) {
    expandAllBtn.addEventListener('click', function () {
      document.querySelectorAll('.tree-children').forEach(function (c) { c.classList.remove('collapsed'); });
      document.querySelectorAll('.folder-arrow').forEach(function (a) { a.classList.add('open'); });
    });
  }

  if (collapseAllBtn) {
    collapseAllBtn.addEventListener('click', function () {
      document.querySelectorAll('.tree-children').forEach(function (c) { c.classList.add('collapsed'); });
      document.querySelectorAll('.folder-arrow').forEach(function (a) { a.classList.remove('open'); });
    });
  }

  /* ===== Ideas Grid ===== */
  function populateIdeas(filter) {
    var container = document.getElementById('ideasGrid');
    if (!container) return;

    container.innerHTML = '';
    var filtered = IDEAS.filter(function (idea) {
      if (!filter || filter === 'all') return true;
      if (filter === 'starred') return idea.starred;
      return idea.status === filter;
    });

    filtered.forEach(function (idea, idx) {
      var card = document.createElement('div');
      card.className = 'idea-card' + (idea.starred ? ' starred' : '');
      card.innerHTML =
        '<div class="idea-title">' + idea.title + '</div>' +
        '<div class="idea-desc">' + idea.desc + '</div>' +
        '<div class="idea-tags">' +
        idea.tags.map(function (t) { return '<span class="idea-tag">' + t + '</span>'; }).join('') +
        '</div>' +
        '<div class="idea-footer">' +
        '  <span>' + idea.date + '</span>' +
        '  <span class="idea-star" data-idx="' + idx + '">' + (idea.starred ? '\u2605' : '\u2606') + '</span>' +
        '</div>';
      container.appendChild(card);
    });

    // Star toggle
    container.querySelectorAll('.idea-star').forEach(function (star) {
      star.addEventListener('click', function (e) {
        e.stopPropagation();
        var idx = parseInt(this.dataset.idx, 10);
        IDEAS[idx].starred = !IDEAS[idx].starred;
        populateIdeas(getCurrentFilter());
      });
    });
  }

  function getCurrentFilter() {
    var active = document.querySelector('.filter-btn.active');
    return active ? active.dataset.filter : 'all';
  }

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');
      populateIdeas(this.dataset.filter);
    });
  });

  /* ===== AI Chat ===== */
  var aiResponseIndex = 0;
  var chatInput = document.getElementById('chatInput');
  var chatSendBtn = document.getElementById('chatSendBtn');
  var chatMessages = document.getElementById('chatMessages');

  function sendChatMessage() {
    if (!chatInput || !chatMessages) return;
    var msg = chatInput.value.trim();
    if (!msg) return;

    // Add user message
    var userDiv = document.createElement('div');
    userDiv.className = 'chat-msg user';
    userDiv.innerHTML =
      '<span class="msg-prefix">USR&gt;</span>' +
      '<span class="msg-text">' + escapeHtml(msg) + '</span>';
    chatMessages.appendChild(userDiv);

    chatInput.value = '';

    // Simulate AI response with delay
    setTimeout(function () {
      var aiDiv = document.createElement('div');
      aiDiv.className = 'chat-msg ai';
      var response = AI_RESPONSES[aiResponseIndex % AI_RESPONSES.length];
      aiResponseIndex++;
      aiDiv.innerHTML =
        '<span class="msg-prefix">AI&gt;&nbsp;</span>' +
        '<span class="msg-text">' + response + '</span>';
      chatMessages.appendChild(aiDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 800);

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  if (chatSendBtn) {
    chatSendBtn.addEventListener('click', sendChatMessage);
  }

  if (chatInput) {
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        sendChatMessage();
      }
    });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ===== Settings ===== */
  // Settings nav
  document.querySelectorAll('.settings-nav-item').forEach(function (item) {
    item.addEventListener('click', function () {
      document.querySelectorAll('.settings-nav-item').forEach(function (i) { i.classList.remove('active'); });
      document.querySelectorAll('.settings-panel').forEach(function (p) { p.classList.remove('active'); });
      this.classList.add('active');
      var panel = document.getElementById('panel-' + this.dataset.panel);
      if (panel) panel.classList.add('active');
    });
  });

  // Toggle labels
  document.querySelectorAll('.retro-toggle input').forEach(function (input) {
    input.addEventListener('change', function () {
      var label = this.closest('.retro-toggle').querySelector('.toggle-label');
      if (label) {
        if (this.checked) {
          label.textContent = label.textContent === 'OFF' ? 'ON' : 'ENABLED';
        } else {
          label.textContent = label.textContent === 'ON' ? 'OFF' : 'DISABLED';
        }
      }
    });
  });

  // Scanline toggle
  var toggleScanlines = document.getElementById('toggleScanlines');
  if (toggleScanlines) {
    toggleScanlines.addEventListener('change', function () {
      var overlay = document.querySelector('.crt-overlay');
      if (overlay) overlay.style.display = this.checked ? '' : 'none';
    });
  }

  // Flicker toggle
  var toggleFlicker = document.getElementById('toggleFlicker');
  if (toggleFlicker) {
    toggleFlicker.addEventListener('change', function () {
      var flicker = document.querySelector('.crt-flicker');
      if (flicker) {
        if (this.checked) {
          flicker.classList.remove('disabled');
        } else {
          flicker.classList.add('disabled');
        }
      }
    });
  }

  // Font size slider
  var fontSizeSlider = document.getElementById('fontSizeSlider');
  var fontSizeValue = document.getElementById('fontSizeValue');
  if (fontSizeSlider) {
    fontSizeSlider.addEventListener('input', function () {
      if (fontSizeValue) fontSizeValue.textContent = this.value + 'px';
      document.body.style.fontSize = this.value + 'px';
    });
  }

  // Color theme buttons
  document.querySelectorAll('.color-opt').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.color-opt').forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');

      var theme = this.dataset.theme;
      if (theme === 'green') {
        document.documentElement.style.setProperty('--color-primary', '#00FF41');
        document.documentElement.style.setProperty('--color-text', '#00FF41');
      } else if (theme === 'amber') {
        document.documentElement.style.setProperty('--color-primary', '#FF6B00');
        document.documentElement.style.setProperty('--color-text', '#FF6B00');
      } else if (theme === 'blue') {
        document.documentElement.style.setProperty('--color-primary', '#00BFFF');
        document.documentElement.style.setProperty('--color-text', '#00BFFF');
      }
    });
  });

  /* ===== Workspace Line Numbers ===== */
  function initLineNumbers() {
    var editor = document.getElementById('editorContent');
    var lineNums = document.getElementById('lineNumbers');
    if (!editor || !lineNums) return;

    function updateLineNumbers() {
      var text = editor.textContent || editor.innerText;
      var lines = text.split('\n').length;
      var html = '';
      for (var i = 1; i <= lines; i++) {
        html += i + '\n';
      }
      lineNums.textContent = html;
    }

    updateLineNumbers();
    editor.addEventListener('input', updateLineNumbers);
  }

  /* ===== Window Chrome Interactions ===== */
  document.querySelectorAll('.win-btn.minimize').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var body = this.closest('.retro-window').querySelector('.window-body');
      if (body) body.style.display = body.style.display === 'none' ? '' : 'none';
    });
  });

  /* ===== New Project Button ===== */
  var newProjectBtn = document.getElementById('newProjectBtn');
  if (newProjectBtn) {
    newProjectBtn.addEventListener('click', function () {
      var name = prompt('Enter project name:');
      if (name) {
        PROJECTS.unshift({
          name: name,
          status: 'active',
          date: new Date().toISOString().split('T')[0],
          icon: '>'
        });
        populateProjects();
      }
    });
  }

  /* ===== New Idea Button ===== */
  var newIdeaBtn = document.getElementById('newIdeaBtn');
  if (newIdeaBtn) {
    newIdeaBtn.addEventListener('click', function () {
      var title = prompt('Enter idea title:');
      if (title) {
        IDEAS.unshift({
          title: title,
          desc: 'New idea captured via IDEA-OS terminal.',
          tags: ['NEW'],
          date: new Date().toISOString().split('T')[0],
          status: 'active',
          starred: false
        });
        populateIdeas(getCurrentFilter());
      }
    });
  }

  /* ===== Add Task Button ===== */
  var addTaskBtn = document.getElementById('addTaskBtn');
  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', function () {
      var title = prompt('Enter task title:');
      if (title) {
        KANBAN_TASKS.backlog.push({
          title: title,
          priority: 'medium',
          assignee: 'USR-01'
        });
        populateKanban();
      }
    });
  }

  /* ===== Schema - Add Table Button ===== */
  var addTableBtn = document.getElementById('addTableBtn');
  if (addTableBtn) {
    addTableBtn.addEventListener('click', function () {
      var name = prompt('Enter table name:');
      if (name) {
        var canvas = document.getElementById('schemaCanvas');
        if (!canvas) return;
        var table = document.createElement('div');
        table.className = 'schema-table';
        table.style.left = '200px';
        table.style.top = (canvas.children.length * 60 + 30) + 'px';
        table.innerHTML =
          '<div class="table-header">' + name.toUpperCase() + '</div>' +
          '<div class="table-row pk">id : INT [PK]</div>' +
          '<div class="table-row">name : VARCHAR(100)</div>';
        canvas.insertBefore(table, canvas.querySelector('.schema-lines'));
      }
    });
  }

  /* ===== File List Click (Workspace) ===== */
  document.querySelectorAll('.file-item').forEach(function (item) {
    item.addEventListener('click', function () {
      document.querySelectorAll('.file-item').forEach(function (f) { f.classList.remove('active'); });
      this.classList.add('active');
    });
  });

  /* ===== Initial Population ===== */
  populateProjects();
  populateKanban();
  populateDirectory();
  populateIdeas('all');

  /* ===== Handle initial route ===== */
  handleHashChange();

  /* ===== Window Resize Handler ===== */
  window.addEventListener('resize', function () {
    drawSchemaLines();
  });

})();
