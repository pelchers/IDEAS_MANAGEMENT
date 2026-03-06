/* ============================================= */
/* BENTO PASS 1 — App Logic                      */
/* ============================================= */

(function () {
  'use strict';

  /* ---- Mock Data ---- */
  const PROJECTS = [
    { name: 'Mobile Redesign', desc: 'Overhaul the mobile UX for v3.0 launch.', progress: 72, color: '#0071E3', icon: 'M' },
    { name: 'API Gateway', desc: 'Build unified API gateway for microservices.', progress: 45, color: '#30D158', icon: 'A' },
    { name: 'Design System', desc: 'Create component library and tokens.', progress: 88, color: '#BF5AF2', icon: 'D' },
    { name: 'Analytics Dashboard', desc: 'Real-time metrics and reporting views.', progress: 30, color: '#FF9F0A', icon: 'R' },
    { name: 'Onboarding Flow', desc: 'Improve first-time user experience.', progress: 60, color: '#FF375F', icon: 'O' },
    { name: 'Security Audit', desc: 'Comprehensive security review and fixes.', progress: 15, color: '#5AC8FA', icon: 'S' }
  ];

  const KANBAN_COLUMNS = [
    {
      title: 'Backlog', cards: [
        { title: 'Research competitor pricing', tag: 'research', tagLabel: 'Research' },
        { title: 'Update onboarding copy', tag: 'design', tagLabel: 'Design' },
        { title: 'Review accessibility audit', tag: 'research', tagLabel: 'Research' }
      ]
    },
    {
      title: 'To Do', cards: [
        { title: 'Implement dark mode toggle', tag: 'feature', tagLabel: 'Feature' },
        { title: 'Fix mobile nav overflow', tag: 'bug', tagLabel: 'Bug' },
        { title: 'Design settings page', tag: 'design', tagLabel: 'Design' }
      ]
    },
    {
      title: 'In Progress', cards: [
        { title: 'Build project dashboard', tag: 'feature', tagLabel: 'Feature' },
        { title: 'API rate limiting', tag: 'feature', tagLabel: 'Feature' },
        { title: 'Fix chart rendering bug', tag: 'bug', tagLabel: 'Bug' }
      ]
    },
    {
      title: 'Done', cards: [
        { title: 'Setup CI/CD pipeline', tag: 'feature', tagLabel: 'Feature' },
        { title: 'Database schema migration', tag: 'feature', tagLabel: 'Feature' },
        { title: 'User authentication flow', tag: 'feature', tagLabel: 'Feature' }
      ]
    }
  ];

  const IDEAS = [
    { title: 'Voice Command Integration', excerpt: 'Add voice-to-text for quick idea capture on mobile devices.', category: 'Feature', priority: 'high', date: 'Mar 3' },
    { title: 'Auto-tagging System', excerpt: 'Use NLP to automatically categorize and tag new ideas.', category: 'Feature', priority: 'high', date: 'Mar 2' },
    { title: 'Weekly Summary Emails', excerpt: 'Send digest emails with project progress and new ideas.', category: 'Feature', priority: 'medium', date: 'Mar 1' },
    { title: 'Fix Duplicate Detection', excerpt: 'Improve algorithm to catch near-duplicate ideas better.', category: 'Bug Fix', priority: 'high', date: 'Feb 28' },
    { title: 'Collaborative Whiteboard', excerpt: 'Real-time multi-user whiteboard with cursor presence.', category: 'Feature', priority: 'medium', date: 'Feb 27' },
    { title: 'Dark Mode Refinements', excerpt: 'Fix contrast issues in dark mode for charts and cards.', category: 'Bug Fix', priority: 'low', date: 'Feb 26' },
    { title: 'Mobile Gesture Navigation', excerpt: 'Swipe between views and pinch-to-zoom on whiteboard.', category: 'Research', priority: 'medium', date: 'Feb 25' },
    { title: 'Template Gallery', excerpt: 'Pre-built project templates for common workflows.', category: 'Feature', priority: 'low', date: 'Feb 24' }
  ];

  const CHAT_MESSAGES = [
    { sender: 'You', text: 'Can you summarize the top ideas from this week?', type: 'user' },
    { sender: 'AI', text: 'This week you captured 12 new ideas. The top 3 by priority are: Voice Command Integration, Auto-tagging System, and Fix Duplicate Detection. Would you like details on any of these?', type: 'ai' },
    { sender: 'You', text: 'Tell me more about the auto-tagging idea.', type: 'user' },
    { sender: 'AI', text: 'The Auto-tagging System proposes using NLP to automatically categorize incoming ideas. It would analyze title and description text to assign relevant tags like "Feature", "Bug Fix", or "Research". This could reduce manual categorization time by an estimated 60%.', type: 'ai' },
    { sender: 'You', text: 'What technologies would we need?', type: 'user' },
    { sender: 'AI', text: 'For auto-tagging, you could use a lightweight NLP library like Compromise.js for client-side processing, or integrate with OpenAI\'s API for more sophisticated classification. The server-side approach would give better accuracy but requires API costs.', type: 'ai' }
  ];

  const ACTIVITY_ITEMS = [
    { text: '<strong>Jane</strong> created idea "Voice Commands"', time: '5 min ago', color: '#0071E3' },
    { text: '<strong>Alex</strong> moved card to In Progress', time: '12 min ago', color: '#30D158' },
    { text: '<strong>Maya</strong> updated project "API Gateway"', time: '28 min ago', color: '#BF5AF2' },
    { text: '<strong>Sam</strong> commented on schema change', time: '1h ago', color: '#FF9F0A' },
    { text: '<strong>Jane</strong> completed 3 tasks', time: '2h ago', color: '#0071E3' },
    { text: '<strong>Taylor</strong> joined Design System project', time: '3h ago', color: '#FF375F' },
    { text: '<strong>Alex</strong> pushed 4 commits', time: '4h ago', color: '#30D158' },
    { text: '<strong>Maya</strong> uploaded wireframe v2', time: '5h ago', color: '#BF5AF2' },
    { text: '<strong>Sam</strong> closed 2 bug reports', time: '6h ago', color: '#FF9F0A' },
    { text: '<strong>Jane</strong> scheduled team sync', time: '8h ago', color: '#0071E3' }
  ];

  const FILE_TREE = {
    name: 'idea-management', type: 'folder', children: [
      {
        name: 'src', type: 'folder', children: [
          {
            name: 'components', type: 'folder', children: [
              { name: 'Dashboard.tsx', type: 'file' },
              { name: 'KanbanBoard.tsx', type: 'file' },
              { name: 'Sidebar.tsx', type: 'file' },
              { name: 'IdeaCard.tsx', type: 'file' }
            ]
          },
          {
            name: 'lib', type: 'folder', children: [
              { name: 'api.ts', type: 'file' },
              { name: 'utils.ts', type: 'file' },
              { name: 'auth.ts', type: 'file' }
            ]
          },
          {
            name: 'styles', type: 'folder', children: [
              { name: 'globals.css', type: 'file' },
              { name: 'theme.css', type: 'file' }
            ]
          },
          { name: 'app.tsx', type: 'file' },
          { name: 'index.tsx', type: 'file' }
        ]
      },
      {
        name: 'convex', type: 'folder', children: [
          { name: 'schema.ts', type: 'file' },
          { name: 'projects.ts', type: 'file' },
          { name: 'ideas.ts', type: 'file' }
        ]
      },
      { name: 'package.json', type: 'file' },
      { name: 'tsconfig.json', type: 'file' },
      { name: 'README.md', type: 'file' }
    ]
  };

  /* ============================================= */
  /* ROUTER — Hash-based view switching            */
  /* ============================================= */
  const VIEWS = [
    'dashboard', 'projects', 'workspace', 'kanban',
    'whiteboard', 'schema', 'directory', 'ideas', 'aichat', 'settings'
  ];

  function getViewFromHash() {
    const hash = window.location.hash.replace('#', '');
    return VIEWS.includes(hash) ? hash : 'dashboard';
  }

  function switchView(viewName) {
    /* Hide all views */
    document.querySelectorAll('.view').forEach(function (v) {
      v.hidden = true;
    });

    /* Show target view */
    var target = document.getElementById('view-' + viewName);
    if (target) {
      target.hidden = false;
    }

    /* Update sidebar active link */
    document.querySelectorAll('.sidebar-link').forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('data-view') === viewName);
    });

    /* Update mobile nav active link */
    document.querySelectorAll('.mobile-nav-item[data-view]').forEach(function (item) {
      item.classList.toggle('active', item.getAttribute('data-view') === viewName);
    });

    /* Close mobile more menu */
    var moreMenu = document.getElementById('mobileMoreMenu');
    if (moreMenu) {
      moreMenu.classList.remove('open');
      moreMenu.setAttribute('aria-hidden', 'true');
    }

    /* Animate tiles in the new view */
    animateTilesIn(target);
  }

  function initRouter() {
    /* Listen for hash changes */
    window.addEventListener('hashchange', function () {
      switchView(getViewFromHash());
    });

    /* Handle sidebar clicks */
    document.querySelectorAll('.sidebar-link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var view = this.getAttribute('data-view');
        window.location.hash = view;
      });
    });

    /* Handle mobile nav clicks */
    document.querySelectorAll('.mobile-nav-item[data-view]').forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        var view = this.getAttribute('data-view');
        window.location.hash = view;
      });
    });

    /* Handle mobile more menu links */
    document.querySelectorAll('.mobile-more-link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var view = this.getAttribute('data-view');
        window.location.hash = view;
      });
    });

    /* Mobile more button */
    var moreBtn = document.getElementById('mobileMoreBtn');
    var moreMenu = document.getElementById('mobileMoreMenu');
    if (moreBtn && moreMenu) {
      moreBtn.addEventListener('click', function () {
        var isOpen = moreMenu.classList.toggle('open');
        moreMenu.setAttribute('aria-hidden', !isOpen);
      });
      moreMenu.addEventListener('click', function (e) {
        if (e.target === moreMenu) {
          moreMenu.classList.remove('open');
          moreMenu.setAttribute('aria-hidden', 'true');
        }
      });
    }

    /* Initial view */
    switchView(getViewFromHash());
  }

  /* ============================================= */
  /* TILE HOVER ANIMATIONS (GSAP)                  */
  /* ============================================= */
  function animateTilesIn(container) {
    if (!container || typeof gsap === 'undefined') return;
    var tiles = container.querySelectorAll('[data-tile]');
    gsap.fromTo(tiles, {
      opacity: 0,
      y: 16,
      scale: 0.97
    }, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.4,
      stagger: 0.06,
      ease: 'power2.out',
      clearProps: 'transform'
    });
  }

  function initTileHoverAnimations() {
    if (typeof gsap === 'undefined') return;

    document.querySelectorAll('[data-tile]').forEach(function (tile) {
      tile.addEventListener('mouseenter', function () {
        gsap.to(this, {
          scale: 1.015,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          duration: 0.25,
          ease: 'power2.out'
        });
      });
      tile.addEventListener('mouseleave', function () {
        gsap.to(this, {
          scale: 1,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          duration: 0.25,
          ease: 'power2.out'
        });
      });
    });
  }

  /* ============================================= */
  /* POPULATE: Activity Feed                       */
  /* ============================================= */
  function populateActivityFeed() {
    var feed = document.getElementById('activityFeed');
    if (!feed) return;
    var html = '';
    ACTIVITY_ITEMS.forEach(function (item) {
      html += '<li class="activity-item">' +
        '<span class="activity-dot" style="background:' + item.color + '"></span>' +
        '<div><span class="activity-text">' + item.text + '</span>' +
        '<span class="activity-time">' + item.time + '</span></div>' +
        '</li>';
    });
    feed.innerHTML = html;
  }

  /* ============================================= */
  /* POPULATE: Projects                            */
  /* ============================================= */
  function populateProjects() {
    var grid = document.querySelector('.bento-grid--projects');
    if (!grid) return;
    var html = '';
    PROJECTS.forEach(function (p) {
      html += '<div class="bento-tile bento-tile--1x1" data-tile>' +
        '<div class="project-card">' +
        '<div class="project-card-header">' +
        '<div class="project-icon" style="background:' + p.color + '">' + p.icon + '</div>' +
        '<span class="project-name">' + p.name + '</span>' +
        '</div>' +
        '<p class="project-desc">' + p.desc + '</p>' +
        '<div class="project-progress">' +
        '<div class="progress-bar"><div class="progress-fill" style="width:' + p.progress + '%"></div></div>' +
        '<div class="progress-label"><span>' + p.progress + '% complete</span><span>' + (100 - p.progress) + '% remaining</span></div>' +
        '</div>' +
        '</div></div>';
    });
    grid.innerHTML = html;
  }

  /* ============================================= */
  /* POPULATE: Kanban Board                        */
  /* ============================================= */
  function populateKanban() {
    var board = document.getElementById('kanbanBoard');
    if (!board) return;
    var html = '';
    KANBAN_COLUMNS.forEach(function (col) {
      html += '<div class="kanban-column">' +
        '<div class="kanban-column-header">' +
        '<span class="kanban-column-title">' + col.title + '</span>' +
        '<span class="kanban-count">' + col.cards.length + '</span>' +
        '</div>' +
        '<div class="kanban-cards">';
      col.cards.forEach(function (card) {
        html += '<div class="kanban-card">' +
          '<div class="kanban-card-title">' + card.title + '</div>' +
          '<div class="kanban-card-meta">' +
          '<span class="kanban-tag kanban-tag--' + card.tag + '">' + card.tagLabel + '</span>' +
          '</div></div>';
      });
      html += '</div></div>';
    });
    board.innerHTML = html;
  }

  /* ============================================= */
  /* POPULATE: Ideas                               */
  /* ============================================= */
  function populateIdeas() {
    var grid = document.getElementById('ideasGrid');
    if (!grid) return;
    var html = '';
    IDEAS.forEach(function (idea) {
      html += '<div class="bento-tile bento-tile--1x1" data-tile>' +
        '<div class="idea-card">' +
        '<div style="display:flex;align-items:center;gap:8px">' +
        '<span class="idea-priority idea-priority--' + idea.priority + '"></span>' +
        '<span class="idea-title">' + idea.title + '</span>' +
        '</div>' +
        '<p class="idea-excerpt">' + idea.excerpt + '</p>' +
        '<div class="idea-meta">' +
        '<span class="idea-category">' + idea.category + '</span>' +
        '<span>' + idea.date + '</span>' +
        '</div></div></div>';
    });
    grid.innerHTML = html;
  }

  /* ============================================= */
  /* POPULATE: AI Chat                             */
  /* ============================================= */
  function populateChat() {
    var messages = document.getElementById('chatMessages');
    if (!messages) return;
    var html = '';
    CHAT_MESSAGES.forEach(function (msg) {
      html += '<div class="chat-bubble chat-bubble--' + msg.type + '">' +
        '<span class="chat-sender">' + msg.sender + '</span>' +
        msg.text +
        '</div>';
    });
    messages.innerHTML = html;
    messages.scrollTop = messages.scrollHeight;
  }

  function initChatInteraction() {
    var input = document.getElementById('chatInput');
    var sendBtn = document.getElementById('chatSendBtn');
    var messages = document.getElementById('chatMessages');
    if (!input || !sendBtn || !messages) return;

    function sendMessage() {
      var text = input.value.trim();
      if (!text) return;

      /* Add user message */
      var userBubble = document.createElement('div');
      userBubble.className = 'chat-bubble chat-bubble--user';
      userBubble.innerHTML = '<span class="chat-sender">You</span>' + escapeHtml(text);
      messages.appendChild(userBubble);
      input.value = '';
      messages.scrollTop = messages.scrollHeight;

      /* Simulate AI response */
      setTimeout(function () {
        var aiBubble = document.createElement('div');
        aiBubble.className = 'chat-bubble chat-bubble--ai';
        aiBubble.innerHTML = '<span class="chat-sender">AI</span>That is an interesting question. Let me analyze your ideas and projects to provide a helpful response. Based on the current data, I would suggest focusing on the highest-priority items first.';
        messages.appendChild(aiBubble);
        messages.scrollTop = messages.scrollHeight;
      }, 800);
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') sendMessage();
    });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ============================================= */
  /* POPULATE: File Tree                           */
  /* ============================================= */
  function populateFileTree() {
    var container = document.getElementById('fileTree');
    if (!container) return;
    container.innerHTML = renderTreeNode(FILE_TREE);
    initTreeInteractions(container);
  }

  function renderTreeNode(node) {
    var isFolder = node.type === 'folder';
    var icon = isFolder ? '&#128193;' : '&#128196;';
    var arrowClass = isFolder ? 'tree-arrow' : 'tree-arrow empty';
    var html = '<div class="tree-node">' +
      '<div class="tree-row">' +
      '<span class="' + arrowClass + '">&#9654;</span>' +
      '<span class="tree-icon">' + icon + '</span>' +
      '<span class="tree-label">' + node.name + '</span>' +
      '</div>';

    if (isFolder && node.children) {
      html += '<div class="tree-children">';
      node.children.forEach(function (child) {
        html += renderTreeNode(child);
      });
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function initTreeInteractions(container) {
    container.querySelectorAll('.tree-row').forEach(function (row) {
      row.addEventListener('click', function () {
        var node = this.parentElement;
        var children = node.querySelector('.tree-children');
        var arrow = this.querySelector('.tree-arrow');
        if (children && arrow && !arrow.classList.contains('empty')) {
          children.classList.toggle('open');
          arrow.classList.toggle('open');
        }
      });
    });
  }

  /* ============================================= */
  /* CHARTS (Chart.js)                             */
  /* ============================================= */
  function initCharts() {
    if (typeof Chart === 'undefined') return;

    /* Weekly Activity - Line Chart */
    var weeklyCtx = document.getElementById('chartWeeklyActivity');
    if (weeklyCtx) {
      new Chart(weeklyCtx.getContext('2d'), {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Ideas',
            data: [4, 7, 3, 8, 5, 12, 6],
            borderColor: '#0071E3',
            backgroundColor: 'rgba(0, 113, 227, 0.08)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: '#0071E3'
          }, {
            label: 'Tasks',
            data: [6, 5, 9, 4, 7, 3, 8],
            borderColor: '#30D158',
            backgroundColor: 'rgba(48, 209, 88, 0.08)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: '#30D158'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                boxWidth: 8,
                boxHeight: 8,
                usePointStyle: true,
                pointStyle: 'circle',
                font: { size: 11, family: '-apple-system, system-ui, sans-serif' },
                color: '#86868B'
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { size: 11 }, color: '#86868B' }
            },
            y: {
              grid: { color: 'rgba(0,0,0,0.04)' },
              ticks: { font: { size: 11 }, color: '#86868B' },
              beginAtZero: true
            }
          }
        }
      });
    }

    /* Categories - Doughnut Chart */
    var catCtx = document.getElementById('chartCategories');
    if (catCtx) {
      new Chart(catCtx.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: ['Feature', 'Bug Fix', 'Research', 'Design'],
          datasets: [{
            data: [45, 20, 15, 20],
            backgroundColor: ['#0071E3', '#FF375F', '#BF5AF2', '#30D158'],
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }
  }

  /* ============================================= */
  /* WHITEBOARD TOOL SWITCHING                     */
  /* ============================================= */
  function initWhiteboardTools() {
    document.querySelectorAll('.wb-tool').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.wb-tool').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
      });
    });
  }

  /* ============================================= */
  /* IDEAS FILTER                                  */
  /* ============================================= */
  function initIdeasFilter() {
    document.querySelectorAll('.filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
      });
    });
  }

  /* ============================================= */
  /* SETTINGS: Theme Toggle                        */
  /* ============================================= */
  function initThemeToggle() {
    document.querySelectorAll('.theme-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.theme-btn').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
      });
    });
  }

  /* ============================================= */
  /* SETTINGS: Editor Toolbar                      */
  /* ============================================= */
  function initEditorToolbar() {
    document.querySelectorAll('.editor-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        this.classList.toggle('active');
      });
    });
  }

  /* ============================================= */
  /* INIT                                          */
  /* ============================================= */
  function init() {
    /* Populate all views */
    populateActivityFeed();
    populateProjects();
    populateKanban();
    populateIdeas();
    populateChat();
    populateFileTree();

    /* Init interactions */
    initRouter();
    initChatInteraction();
    initWhiteboardTools();
    initIdeasFilter();
    initThemeToggle();
    initEditorToolbar();

    /* Charts need Chart.js to be loaded */
    if (typeof Chart !== 'undefined') {
      initCharts();
    } else {
      /* Wait for Chart.js to load */
      var checkChart = setInterval(function () {
        if (typeof Chart !== 'undefined') {
          clearInterval(checkChart);
          initCharts();
        }
      }, 100);
      /* Give up after 5 seconds */
      setTimeout(function () { clearInterval(checkChart); }, 5000);
    }

    /* GSAP tile hover animations */
    if (typeof gsap !== 'undefined') {
      initTileHoverAnimations();
      /* Animate initial view tiles */
      var initialView = document.getElementById('view-' + getViewFromHash());
      if (initialView) animateTilesIn(initialView);
    } else {
      var checkGsap = setInterval(function () {
        if (typeof gsap !== 'undefined') {
          clearInterval(checkGsap);
          initTileHoverAnimations();
          var initialView = document.getElementById('view-' + getViewFromHash());
          if (initialView) animateTilesIn(initialView);
        }
      }, 100);
      setTimeout(function () { clearInterval(checkGsap); }, 5000);
    }
  }

  /* Run on DOM ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
