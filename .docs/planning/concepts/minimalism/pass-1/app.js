/* ============================================================
   MINIMALISM PASS 1 — App Logic
   Hash routing, mock data, interactive components
   ============================================================ */

/* ========== MOCK DATA ========== */

const PROJECTS = [
  { name: 'Mobile App Redesign', description: 'Complete overhaul of the native iOS and Android apps with new design system', status: 'active', updated: '2026-03-04' },
  { name: 'API v3 Migration', description: 'Migrate all public endpoints from REST v2 to GraphQL v3', status: 'active', updated: '2026-03-03' },
  { name: 'Analytics Dashboard', description: 'Real-time analytics with custom chart builder and export functionality', status: 'active', updated: '2026-03-01' },
  { name: 'Onboarding Flow', description: 'Guided onboarding with interactive tutorials and progress tracking', status: 'active', updated: '2026-02-28' },
  { name: 'Design System v2', description: 'Comprehensive component library with Figma tokens and Storybook docs', status: 'archived', updated: '2026-02-15' },
  { name: 'Legacy Data Cleanup', description: 'Archive and clean up deprecated data models from the 2024 migration', status: 'archived', updated: '2026-01-20' }
];

const KANBAN_COLUMNS = [
  {
    title: 'Backlog',
    cards: [
      { title: 'Set up CI/CD pipeline', assignee: 'Alex M.', priority: 'medium' },
      { title: 'Write API documentation', assignee: 'Sara K.', priority: 'low' },
      { title: 'Research auth providers', assignee: 'Tom R.', priority: 'low' }
    ]
  },
  {
    title: 'In Progress',
    cards: [
      { title: 'Design system tokens', assignee: 'Jane D.', priority: 'high' },
      { title: 'User profile page', assignee: 'Mike L.', priority: 'medium' },
      { title: 'Database schema update', assignee: 'Alex M.', priority: 'high' }
    ]
  },
  {
    title: 'Review',
    cards: [
      { title: 'Landing page redesign', assignee: 'Sara K.', priority: 'high' },
      { title: 'Email template system', assignee: 'Tom R.', priority: 'medium' },
      { title: 'Performance audit fixes', assignee: 'Jane D.', priority: 'medium' }
    ]
  },
  {
    title: 'Done',
    cards: [
      { title: 'Setup project repo', assignee: 'Alex M.', priority: 'low' },
      { title: 'Define color palette', assignee: 'Jane D.', priority: 'medium' },
      { title: 'Stakeholder interviews', assignee: 'Mike L.', priority: 'high' }
    ]
  }
];

const IDEAS = [
  { title: 'AI-Powered Tagging', description: 'Automatically tag ideas using NLP to extract topics and themes from content', tags: ['AI', 'Automation'], priority: 'high', project: 'Analytics Dashboard' },
  { title: 'Keyboard Shortcuts Panel', description: 'Global keyboard shortcuts overlay with customizable key bindings', tags: ['UX', 'Accessibility'], priority: 'medium', project: 'Mobile App Redesign' },
  { title: 'Dark Mode Scheduler', description: 'Automatically switch between light and dark themes based on system time', tags: ['UI', 'Settings'], priority: 'low', project: 'Design System v2' },
  { title: 'Collaborative Whiteboard', description: 'Real-time multi-user whiteboard with cursor presence and live drawing', tags: ['Collaboration', 'Real-time'], priority: 'high', project: 'Mobile App Redesign' },
  { title: 'Export to PDF', description: 'One-click export of any view to a formatted PDF with custom headers', tags: ['Export', 'Productivity'], priority: 'medium', project: 'Analytics Dashboard' },
  { title: 'Weekly Digest Email', description: 'Automated weekly summary of project updates, new ideas, and metrics', tags: ['Email', 'Automation'], priority: 'low', project: 'Onboarding Flow' },
  { title: 'Template Library', description: 'Pre-built project templates for common workflows like sprints and launches', tags: ['Templates', 'Productivity'], priority: 'high', project: 'API v3 Migration' },
  { title: 'Activity Heatmap', description: 'Visual heatmap showing team activity patterns across days and hours', tags: ['Analytics', 'Visualization'], priority: 'medium', project: 'Analytics Dashboard' }
];

const CHAT_MESSAGES = [
  { role: 'user', text: 'Can you summarize the progress on the Mobile App Redesign project?', time: '10:15 AM' },
  { role: 'ai', text: 'The Mobile App Redesign project is currently in its third sprint. The design system tokens are 80% complete, and the user profile page is under active development. Two review items are pending approval.', time: '10:15 AM' },
  { role: 'user', text: 'What are the highest priority tasks right now?', time: '10:18 AM' },
  { role: 'ai', text: 'There are three high-priority tasks: Design system tokens (In Progress), Landing page redesign (In Review), and Database schema update (In Progress). I recommend focusing on the schema update as it blocks other backend work.', time: '10:18 AM' },
  { role: 'user', text: 'Create a summary report for the stakeholder meeting tomorrow.', time: '10:22 AM' },
  { role: 'ai', text: 'I have drafted a summary report covering project status, sprint velocity, and key blockers. The report includes charts for task completion rates and a risk assessment matrix. Shall I add it to the shared workspace?', time: '10:23 AM' }
];

const ACTIVITY_FEED = [
  { type: 'create', text: 'Jane Doe created a new idea "AI-Powered Tagging"', time: '2 minutes ago' },
  { type: 'update', text: 'Alex M. moved "Design system tokens" to In Progress', time: '15 minutes ago' },
  { type: 'comment', text: 'Sara K. commented on "Landing page redesign"', time: '1 hour ago' },
  { type: 'complete', text: 'Tom R. completed "Setup project repo"', time: '2 hours ago' },
  { type: 'create', text: 'Mike L. created project "Analytics Dashboard"', time: '3 hours ago' },
  { type: 'update', text: 'Jane Doe updated schema for "User" entity', time: '4 hours ago' },
  { type: 'delete', text: 'Alex M. archived "Legacy Data Cleanup"', time: '5 hours ago' },
  { type: 'comment', text: 'Sara K. left feedback on "Onboarding Flow"', time: '6 hours ago' },
  { type: 'complete', text: 'Jane Doe completed "Define color palette"', time: '1 day ago' },
  { type: 'create', text: 'Tom R. added 3 new cards to Backlog', time: '1 day ago' }
];

const FILE_TREE = [
  {
    name: 'src', type: 'folder', expanded: true, children: [
      {
        name: 'components', type: 'folder', expanded: true, children: [
          { name: 'Button.tsx', type: 'file' },
          { name: 'Card.tsx', type: 'file' },
          { name: 'Modal.tsx', type: 'file' },
          { name: 'Sidebar.tsx', type: 'file' }
        ]
      },
      {
        name: 'pages', type: 'folder', expanded: false, children: [
          { name: 'Dashboard.tsx', type: 'file' },
          { name: 'Settings.tsx', type: 'file' },
          { name: 'Projects.tsx', type: 'file' }
        ]
      },
      {
        name: 'utils', type: 'folder', expanded: false, children: [
          { name: 'api.ts', type: 'file' },
          { name: 'helpers.ts', type: 'file' }
        ]
      },
      { name: 'App.tsx', type: 'file' },
      { name: 'index.ts', type: 'file' }
    ]
  },
  {
    name: 'public', type: 'folder', expanded: false, children: [
      { name: 'favicon.ico', type: 'file' },
      { name: 'manifest.json', type: 'file' }
    ]
  },
  { name: 'package.json', type: 'file' },
  { name: 'tsconfig.json', type: 'file' },
  { name: 'README.md', type: 'file' }
];

const DIRECTORY_TREE = [
  {
    name: 'src', type: 'folder', expanded: true, children: [
      {
        name: 'components', type: 'folder', expanded: true, children: [
          {
            name: 'ui', type: 'folder', expanded: true, children: [
              { name: 'Button.tsx', type: 'file' },
              { name: 'Card.tsx', type: 'file' },
              { name: 'Dialog.tsx', type: 'file' },
              { name: 'Input.tsx', type: 'file' },
              { name: 'Toggle.tsx', type: 'file' }
            ]
          },
          {
            name: 'layout', type: 'folder', expanded: false, children: [
              { name: 'Header.tsx', type: 'file' },
              { name: 'Sidebar.tsx', type: 'file' },
              { name: 'Footer.tsx', type: 'file' }
            ]
          },
          {
            name: 'features', type: 'folder', expanded: false, children: [
              { name: 'KanbanBoard.tsx', type: 'file' },
              { name: 'IdeaCapture.tsx', type: 'file' },
              { name: 'SchemaPlanner.tsx', type: 'file' }
            ]
          }
        ]
      },
      {
        name: 'hooks', type: 'folder', expanded: false, children: [
          { name: 'useAuth.ts', type: 'file' },
          { name: 'useProjects.ts', type: 'file' },
          { name: 'useKanban.ts', type: 'file' }
        ]
      },
      {
        name: 'lib', type: 'folder', expanded: false, children: [
          { name: 'api.ts', type: 'file' },
          { name: 'utils.ts', type: 'file' },
          { name: 'constants.ts', type: 'file' }
        ]
      },
      {
        name: 'styles', type: 'folder', expanded: false, children: [
          { name: 'globals.css', type: 'file' },
          { name: 'tokens.css', type: 'file' }
        ]
      }
    ]
  },
  {
    name: 'convex', type: 'folder', expanded: false, children: [
      { name: 'schema.ts', type: 'file' },
      { name: 'projects.ts', type: 'file' },
      { name: 'ideas.ts', type: 'file' }
    ]
  },
  {
    name: 'tests', type: 'folder', expanded: false, children: [
      { name: 'e2e', type: 'folder', expanded: false, children: [
        { name: 'dashboard.spec.ts', type: 'file' },
        { name: 'kanban.spec.ts', type: 'file' }
      ]}
    ]
  },
  { name: 'package.json', type: 'file' },
  { name: 'tsconfig.json', type: 'file' },
  { name: 'next.config.js', type: 'file' },
  { name: '.env.local', type: 'file' }
];

const HEALTH_DATA = [
  { name: 'Mobile App Redesign', status: 'healthy', label: 'On track' },
  { name: 'API v3 Migration', status: 'warning', label: '2 days behind' },
  { name: 'Analytics Dashboard', status: 'healthy', label: 'Ahead of schedule' },
  { name: 'Onboarding Flow', status: 'critical', label: 'Blocked' },
  { name: 'Design System v2', status: 'healthy', label: 'Complete' },
  { name: 'Legacy Data Cleanup', status: 'warning', label: 'Needs review' }
];


/* ========== ROUTER ========== */

function initRouter() {
  const navLinks = document.querySelectorAll('.nav-link');
  const views = document.querySelectorAll('.view');

  function navigateTo(hash) {
    const viewId = hash.replace('#', '') || 'dashboard';

    /* Hide all views */
    views.forEach(function(v) { v.classList.remove('active'); });

    /* Deactivate all nav links */
    navLinks.forEach(function(l) { l.classList.remove('active'); });

    /* Show target view */
    var target = document.getElementById(viewId);
    if (target) {
      target.classList.add('active');
    }

    /* Activate matching nav link */
    var matchingLink = document.querySelector('.nav-link[data-view="' + viewId + '"]');
    if (matchingLink) {
      matchingLink.classList.add('active');
    }

    /* Close mobile sidebar */
    closeMobileSidebar();

    /* Animate view entry with GSAP */
    if (typeof gsap !== 'undefined' && target) {
      gsap.fromTo(target,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }
  }

  /* Listen for hash changes */
  window.addEventListener('hashchange', function() {
    navigateTo(window.location.hash);
  });

  /* Nav link clicks */
  navLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      var href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        /* Let the hashchange handle navigation */
      }
    });
  });

  /* Initial route */
  if (window.location.hash) {
    navigateTo(window.location.hash);
  } else {
    window.location.hash = '#dashboard';
  }
}


/* ========== MOBILE NAV ========== */

function initMobileNav() {
  var hamburger = document.getElementById('hamburger');
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebar-overlay');

  if (!hamburger || !sidebar || !overlay) return;

  hamburger.addEventListener('click', function() {
    var isOpen = sidebar.classList.contains('open');
    if (isOpen) {
      closeMobileSidebar();
    } else {
      sidebar.classList.add('open');
      overlay.classList.add('visible');
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
    }
  });

  overlay.addEventListener('click', closeMobileSidebar);
}

function closeMobileSidebar() {
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebar-overlay');
  var hamburger = document.getElementById('hamburger');

  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('visible');
  if (hamburger) {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
}


/* ========== DASHBOARD ========== */

function renderActivityFeed() {
  var feed = document.getElementById('activity-feed');
  if (!feed) return;

  feed.innerHTML = ACTIVITY_FEED.map(function(item) {
    return '<li class="activity-item">' +
      '<span class="activity-dot ' + item.type + '"></span>' +
      '<div>' +
        '<div class="activity-text">' + item.text + '</div>' +
        '<div class="activity-time">' + item.time + '</div>' +
      '</div>' +
    '</li>';
  }).join('');
}

function renderHealthGrid() {
  var grid = document.getElementById('health-grid');
  if (!grid) return;

  grid.innerHTML = HEALTH_DATA.map(function(item) {
    return '<div class="health-item">' +
      '<span class="health-indicator ' + item.status + '"></span>' +
      '<div class="health-info">' +
        '<span class="health-name">' + item.name + '</span>' +
        '<span class="health-status">' + item.label + '</span>' +
      '</div>' +
    '</div>';
  }).join('');
}

function initDashboardChart() {
  var canvas = document.getElementById('activity-chart');
  if (!canvas || typeof Chart === 'undefined') return;

  var ctx = canvas.getContext('2d');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Tasks Completed',
          data: [4, 7, 5, 9, 6, 3, 8],
          borderColor: '#0066FF',
          backgroundColor: 'rgba(0, 102, 255, 0.05)',
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointRadius: 3,
          pointBackgroundColor: '#0066FF'
        },
        {
          label: 'Tasks Created',
          data: [6, 4, 8, 5, 7, 4, 6],
          borderColor: '#999999',
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderDash: [5, 5],
          fill: false,
          tension: 0.3,
          pointRadius: 3,
          pointBackgroundColor: '#999999'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { family: "'Inter', sans-serif", size: 12 },
            color: '#999999',
            boxWidth: 12,
            padding: 16
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: "'Inter', sans-serif", size: 12 },
            color: '#999999'
          },
          border: { display: false }
        },
        y: {
          beginAtZero: true,
          grid: { color: '#E5E5E5', lineWidth: 0.5 },
          ticks: {
            font: { family: "'Inter', sans-serif", size: 12 },
            color: '#999999',
            stepSize: 2
          },
          border: { display: false }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  });
}


/* ========== PROJECTS ========== */

function renderProjects() {
  var grid = document.getElementById('projects-grid');
  if (!grid) return;

  grid.innerHTML = PROJECTS.map(function(p) {
    return '<article class="project-card">' +
      '<div class="project-card-header">' +
        '<span class="project-name">' + p.name + '</span>' +
        '<span class="project-status ' + p.status + '">' + p.status + '</span>' +
      '</div>' +
      '<p class="project-description">' + p.description + '</p>' +
      '<span class="project-meta">Updated ' + formatDate(p.updated) + '</span>' +
    '</article>';
  }).join('');
}

function initProjectToggles() {
  var gridBtn = document.getElementById('grid-view-btn');
  var listBtn = document.getElementById('list-view-btn');
  var grid = document.getElementById('projects-grid');

  if (!gridBtn || !listBtn || !grid) return;

  gridBtn.addEventListener('click', function() {
    grid.classList.remove('list-view');
    gridBtn.classList.add('active');
    gridBtn.setAttribute('aria-pressed', 'true');
    listBtn.classList.remove('active');
    listBtn.setAttribute('aria-pressed', 'false');
  });

  listBtn.addEventListener('click', function() {
    grid.classList.add('list-view');
    listBtn.classList.add('active');
    listBtn.setAttribute('aria-pressed', 'true');
    gridBtn.classList.remove('active');
    gridBtn.setAttribute('aria-pressed', 'false');
  });
}

function initProjectSearch() {
  var input = document.getElementById('project-search');
  if (!input) return;

  input.addEventListener('input', function() {
    var query = this.value.toLowerCase();
    var cards = document.querySelectorAll('.project-card');

    cards.forEach(function(card) {
      var name = card.querySelector('.project-name').textContent.toLowerCase();
      var desc = card.querySelector('.project-description').textContent.toLowerCase();
      if (name.indexOf(query) > -1 || desc.indexOf(query) > -1) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
}


/* ========== WORKSPACE ========== */

function renderFileTree() {
  var container = document.getElementById('file-tree');
  if (!container) return;

  container.innerHTML = buildTreeHTML(FILE_TREE, 0);
  initTreeToggles(container);
}

function buildTreeHTML(items, depth) {
  return items.map(function(item) {
    if (item.type === 'folder') {
      var expandedClass = item.expanded ? 'expanded' : '';
      var childrenClass = item.expanded ? '' : 'collapsed';

      return '<li>' +
        '<div class="tree-item folder" data-depth="' + depth + '">' +
          '<span class="tree-toggle ' + expandedClass + '">&#9654;</span>' +
          '<svg class="tree-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>' +
          '<span>' + item.name + '</span>' +
        '</div>' +
        '<ul class="tree-children ' + childrenClass + '">' +
          buildTreeHTML(item.children, depth + 1) +
        '</ul>' +
      '</li>';
    } else {
      return '<li>' +
        '<div class="tree-item" data-depth="' + depth + '">' +
          '<span class="tree-toggle" style="visibility:hidden">&#9654;</span>' +
          '<svg class="tree-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
          '<span>' + item.name + '</span>' +
        '</div>' +
      '</li>';
    }
  }).join('');
}

function initTreeToggles(container) {
  container.addEventListener('click', function(e) {
    var treeItem = e.target.closest('.tree-item.folder');
    if (!treeItem) return;

    var toggle = treeItem.querySelector('.tree-toggle');
    var children = treeItem.parentElement.querySelector('.tree-children');

    if (toggle && children) {
      toggle.classList.toggle('expanded');
      children.classList.toggle('collapsed');
    }
  });
}


/* ========== KANBAN ========== */

function renderKanban() {
  var board = document.getElementById('kanban-board');
  if (!board) return;

  board.innerHTML = KANBAN_COLUMNS.map(function(col) {
    return '<div class="kanban-column">' +
      '<div class="kanban-column-header">' +
        '<span class="kanban-column-title">' + col.title + '</span>' +
        '<span class="kanban-column-count">' + col.cards.length + '</span>' +
      '</div>' +
      '<div class="kanban-cards">' +
        col.cards.map(function(card) {
          return '<div class="kanban-card">' +
            '<div class="kanban-card-title">' + card.title + '</div>' +
            '<div class="kanban-card-meta">' +
              '<span class="kanban-card-assignee">' + card.assignee + '</span>' +
              '<span class="kanban-card-priority ' + card.priority + '">' + card.priority + '</span>' +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>';
  }).join('');

  /* Initialize SortableJS on each column */
  if (typeof Sortable !== 'undefined') {
    var columns = board.querySelectorAll('.kanban-cards');
    columns.forEach(function(col) {
      new Sortable(col, {
        group: 'kanban',
        animation: 200,
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        onEnd: function(evt) {
          /* Update card counts */
          updateKanbanCounts();
        }
      });
    });
  }
}

function updateKanbanCounts() {
  var columns = document.querySelectorAll('.kanban-column');
  columns.forEach(function(col) {
    var count = col.querySelectorAll('.kanban-card').length;
    var countEl = col.querySelector('.kanban-column-count');
    if (countEl) countEl.textContent = count;
  });
}


/* ========== WHITEBOARD ========== */

function initWhiteboard() {
  var toolbar = document.getElementById('whiteboard-toolbar');
  if (!toolbar) return;

  toolbar.addEventListener('click', function(e) {
    var btn = e.target.closest('.tool-btn');
    if (!btn) return;

    var tool = btn.getAttribute('data-tool');
    if (tool === 'zoom-in' || tool === 'zoom-out') {
      handleZoom(tool);
      return;
    }

    /* Toggle active tool */
    toolbar.querySelectorAll('.tool-btn').forEach(function(b) {
      if (!['zoom-in', 'zoom-out'].includes(b.getAttribute('data-tool'))) {
        b.classList.remove('active');
      }
    });
    btn.classList.add('active');
  });
}

var currentZoom = 100;

function handleZoom(direction) {
  if (direction === 'zoom-in' && currentZoom < 200) {
    currentZoom += 10;
  } else if (direction === 'zoom-out' && currentZoom > 50) {
    currentZoom -= 10;
  }

  var zoomEl = document.getElementById('zoom-level');
  if (zoomEl) zoomEl.textContent = currentZoom + '%';

  var canvas = document.getElementById('whiteboard-canvas');
  if (canvas) {
    canvas.style.transform = 'scale(' + (currentZoom / 100) + ')';
    canvas.style.transformOrigin = 'top left';
  }
}


/* ========== SCHEMA ========== */

function initSchema() {
  drawSchemaLines();

  var addBtn = document.getElementById('add-entity-btn');
  if (addBtn) {
    addBtn.addEventListener('click', function() {
      /* Simple demo: just show feedback */
      this.textContent = 'Entity Added!';
      this.style.opacity = '0.7';
      var self = this;
      setTimeout(function() {
        self.textContent = '+ Add Entity';
        self.style.opacity = '';
      }, 1500);
    });
  }
}

function drawSchemaLines() {
  var svg = document.getElementById('schema-lines');
  if (!svg) return;

  var canvas = document.getElementById('schema-canvas');
  if (!canvas) return;

  /* Get entity positions */
  var userBox = document.getElementById('entity-user');
  var projectBox = document.getElementById('entity-project');
  var ideaBox = document.getElementById('entity-idea');
  var taskBox = document.getElementById('entity-task');

  if (!userBox || !projectBox || !ideaBox || !taskBox) return;

  /* Position entities */
  userBox.style.left = userBox.dataset.x + 'px';
  userBox.style.top = userBox.dataset.y + 'px';
  projectBox.style.left = projectBox.dataset.x + 'px';
  projectBox.style.top = projectBox.dataset.y + 'px';
  ideaBox.style.left = ideaBox.dataset.x + 'px';
  ideaBox.style.top = ideaBox.dataset.y + 'px';
  taskBox.style.left = taskBox.dataset.x + 'px';
  taskBox.style.top = taskBox.dataset.y + 'px';

  /* Draw relationship lines */
  var lines = [
    { from: userBox, to: projectBox },
    { from: projectBox, to: ideaBox },
    { from: projectBox, to: taskBox },
    { from: userBox, to: ideaBox }
  ];

  svg.innerHTML = lines.map(function(rel) {
    var fromRect = rel.from.getBoundingClientRect();
    var toRect = rel.to.getBoundingClientRect();
    var canvasRect = canvas.getBoundingClientRect();

    var x1 = fromRect.left - canvasRect.left + fromRect.width / 2;
    var y1 = fromRect.top - canvasRect.top + fromRect.height;
    var x2 = toRect.left - canvasRect.left + toRect.width / 2;
    var y2 = toRect.top - canvasRect.top;

    /* If boxes are on the same row, connect from side */
    if (Math.abs(fromRect.top - toRect.top) < 50) {
      x1 = fromRect.left - canvasRect.left + fromRect.width;
      y1 = fromRect.top - canvasRect.top + fromRect.height / 2;
      x2 = toRect.left - canvasRect.left;
      y2 = toRect.top - canvasRect.top + toRect.height / 2;
    }

    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/>';
  }).join('');
}


/* ========== DIRECTORY TREE ========== */

function renderDirectoryTree() {
  var container = document.getElementById('dir-tree');
  if (!container) return;

  container.innerHTML = buildDirTreeHTML(DIRECTORY_TREE);
  initDirTreeToggles(container);
}

function buildDirTreeHTML(items) {
  return items.map(function(item) {
    if (item.type === 'folder') {
      var expandedClass = item.expanded ? 'expanded' : '';
      var childrenClass = item.expanded ? '' : 'collapsed';

      return '<li>' +
        '<div class="dir-item">' +
          '<span class="dir-item-toggle ' + expandedClass + '">&#9654;</span>' +
          '<svg class="dir-item-icon folder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>' +
          '<span>' + item.name + '</span>' +
        '</div>' +
        '<ul class="dir-children ' + childrenClass + '">' +
          buildDirTreeHTML(item.children || []) +
        '</ul>' +
      '</li>';
    } else {
      return '<li>' +
        '<div class="dir-item">' +
          '<span class="dir-item-toggle hidden">&#9654;</span>' +
          '<svg class="dir-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
          '<span>' + item.name + '</span>' +
        '</div>' +
      '</li>';
    }
  }).join('');
}

function initDirTreeToggles(container) {
  container.addEventListener('click', function(e) {
    var dirItem = e.target.closest('.dir-item');
    if (!dirItem) return;

    var toggle = dirItem.querySelector('.dir-item-toggle');
    if (!toggle || toggle.classList.contains('hidden')) return;

    var children = dirItem.parentElement.querySelector('.dir-children');

    if (toggle && children) {
      toggle.classList.toggle('expanded');
      children.classList.toggle('collapsed');
    }
  });
}


/* ========== IDEAS ========== */

function renderIdeas() {
  var grid = document.getElementById('ideas-grid');
  if (!grid) return;

  grid.innerHTML = IDEAS.map(function(idea) {
    return '<article class="idea-card">' +
      '<h3 class="idea-card-title">' + idea.title + '</h3>' +
      '<p class="idea-card-desc">' + idea.description + '</p>' +
      '<div class="idea-card-tags">' +
        idea.tags.map(function(t) { return '<span class="idea-tag">' + t + '</span>'; }).join('') +
      '</div>' +
      '<div class="idea-card-footer">' +
        '<span class="idea-priority ' + idea.priority + '">' + idea.priority + ' priority</span>' +
        '<span class="idea-project-link">' + idea.project + '</span>' +
      '</div>' +
    '</article>';
  }).join('');
}

function initIdeaCapture() {
  var input = document.getElementById('idea-input');
  var btn = document.getElementById('idea-submit-btn');
  if (!input || !btn) return;

  btn.addEventListener('click', function() {
    var val = input.value.trim();
    if (!val) return;

    /* Add new idea card at top */
    var grid = document.getElementById('ideas-grid');
    if (!grid) return;

    var newCard = document.createElement('article');
    newCard.className = 'idea-card';
    newCard.innerHTML =
      '<h3 class="idea-card-title">' + val + '</h3>' +
      '<p class="idea-card-desc">Newly captured idea</p>' +
      '<div class="idea-card-tags"><span class="idea-tag">New</span></div>' +
      '<div class="idea-card-footer">' +
        '<span class="idea-priority medium">medium priority</span>' +
        '<span class="idea-project-link">Unassigned</span>' +
      '</div>';

    grid.insertBefore(newCard, grid.firstChild);
    input.value = '';

    /* Animate new card */
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(newCard,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  });

  /* Also submit on Enter */
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      btn.click();
    }
  });
}


/* ========== AI CHAT ========== */

function renderChat() {
  var container = document.getElementById('chat-messages');
  if (!container) return;

  container.innerHTML = CHAT_MESSAGES.map(function(msg) {
    return '<div class="chat-message ' + msg.role + '">' +
      '<div class="chat-bubble">' + msg.text + '</div>' +
      '<span class="chat-time">' + msg.time + '</span>' +
    '</div>';
  }).join('');

  /* Scroll to bottom */
  container.scrollTop = container.scrollHeight;
}

function initChat() {
  var input = document.getElementById('chat-input');
  var sendBtn = document.getElementById('chat-send-btn');
  var container = document.getElementById('chat-messages');
  var typing = document.getElementById('chat-typing');

  if (!input || !sendBtn || !container) return;

  function sendMessage() {
    var text = input.value.trim();
    if (!text) return;

    /* Add user message */
    var userMsg = document.createElement('div');
    userMsg.className = 'chat-message user';
    userMsg.innerHTML = '<div class="chat-bubble">' + text + '</div>' +
      '<span class="chat-time">Just now</span>';
    container.appendChild(userMsg);

    input.value = '';
    container.scrollTop = container.scrollHeight;

    /* Animate user message */
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(userMsg,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
      );
    }

    /* Show typing indicator */
    if (typing) typing.classList.add('visible');

    /* Simulate AI response */
    setTimeout(function() {
      if (typing) typing.classList.remove('visible');

      var aiMsg = document.createElement('div');
      aiMsg.className = 'chat-message ai';
      aiMsg.innerHTML = '<div class="chat-bubble">I understand your request. Let me analyze the relevant project data and provide a comprehensive response. Based on the current metrics, everything looks aligned with the sprint goals.</div>' +
        '<span class="chat-time">Just now</span>';
      container.appendChild(aiMsg);
      container.scrollTop = container.scrollHeight;

      if (typeof gsap !== 'undefined') {
        gsap.fromTo(aiMsg,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
        );
      }
    }, 1500);
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') sendMessage();
  });
}


/* ========== SETTINGS ========== */

function initSettings() {
  var tabs = document.querySelectorAll('.settings-tab');
  var panels = document.querySelectorAll('.settings-panel');

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      var target = this.getAttribute('data-tab');

      /* Deactivate all */
      tabs.forEach(function(t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(function(p) { p.classList.remove('active'); });

      /* Activate target */
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');

      var targetPanel = document.getElementById('settings-' + target);
      if (targetPanel) {
        targetPanel.classList.add('active');

        if (typeof gsap !== 'undefined') {
          gsap.fromTo(targetPanel,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
          );
        }
      }
    });
  });
}


/* ========== GSAP MICRO-ANIMATIONS ========== */

function initAnimations() {
  if (typeof gsap === 'undefined') return;

  /* Animate stat cards on dashboard load */
  gsap.fromTo('.stat-card',
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.1 }
  );

  /* Subtle hover lift for cards */
  document.querySelectorAll('.stat-card, .project-card, .idea-card, .kanban-card').forEach(function(card) {
    card.addEventListener('mouseenter', function() {
      gsap.to(this, { y: -2, duration: 0.2, ease: 'power2.out' });
    });
    card.addEventListener('mouseleave', function() {
      gsap.to(this, { y: 0, duration: 0.2, ease: 'power2.out' });
    });
  });
}


/* ========== UTILITIES ========== */

function formatDate(dateStr) {
  var d = new Date(dateStr);
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
}


/* ========== INITIALIZATION ========== */

document.addEventListener('DOMContentLoaded', function() {
  /* Render static content */
  renderActivityFeed();
  renderHealthGrid();
  renderProjects();
  renderFileTree();
  renderKanban();
  renderDirectoryTree();
  renderIdeas();
  renderChat();

  /* Initialize interactive features */
  initRouter();
  initMobileNav();
  initDashboardChart();
  initProjectToggles();
  initProjectSearch();
  initWhiteboard();
  initSchema();
  initIdeaCapture();
  initChat();
  initSettings();

  /* Start animations */
  initAnimations();

  /* Redraw schema lines on resize */
  window.addEventListener('resize', function() {
    drawSchemaLines();
  });
});
