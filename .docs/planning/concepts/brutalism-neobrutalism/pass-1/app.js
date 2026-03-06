/* ============================================ */
/* BRUTALISM & NEOBRUTALISM — PASS 1           */
/* Application JavaScript                       */
/* ============================================ */

(function () {
  'use strict';

  /* ============================================ */
  /* MOCK DATA                                    */
  /* ============================================ */

  const PROJECTS = [
    { id: 1, title: 'MOBILE APP REDESIGN', desc: 'Complete overhaul of the mobile experience with new navigation patterns and gesture controls.', status: 'active', progress: 72, tasks: 24, dueDate: '2026-04-15' },
    { id: 2, title: 'API V3 MIGRATION', desc: 'Migrate all endpoints to v3 with improved rate limiting and authentication flow.', status: 'active', progress: 45, tasks: 18, dueDate: '2026-05-01' },
    { id: 3, title: 'DESIGN SYSTEM 2.0', desc: 'New component library with brutalist design tokens and accessibility-first approach.', status: 'review', progress: 88, tasks: 32, dueDate: '2026-03-20' },
    { id: 4, title: 'AI INTEGRATION', desc: 'Natural language processing pipeline for idea categorization and smart suggestions.', status: 'planning', progress: 15, tasks: 12, dueDate: '2026-06-01' },
    { id: 5, title: 'PERFORMANCE AUDIT', desc: 'Core Web Vitals optimization, bundle splitting, and lazy loading implementation.', status: 'active', progress: 60, tasks: 8, dueDate: '2026-03-30' },
    { id: 6, title: 'ONBOARDING FLOW', desc: 'Interactive tutorial system for new users with progressive disclosure of features.', status: 'paused', progress: 30, tasks: 14, dueDate: '2026-07-01' }
  ];

  const KANBAN_CARDS = [
    { id: 1, title: 'Setup CI/CD pipeline', tags: ['feature'], column: 'backlog' },
    { id: 2, title: 'Fix auth token refresh', tags: ['bug', 'urgent'], column: 'backlog' },
    { id: 3, title: 'Design onboarding screens', tags: ['feature'], column: 'backlog' },
    { id: 4, title: 'Implement dark mode toggle', tags: ['feature'], column: 'todo' },
    { id: 5, title: 'Add keyboard shortcuts', tags: ['feature'], column: 'todo' },
    { id: 6, title: 'Fix mobile nav overflow', tags: ['bug'], column: 'todo' },
    { id: 7, title: 'Build kanban drag-drop', tags: ['feature'], column: 'progress' },
    { id: 8, title: 'Schema validation layer', tags: ['feature'], column: 'progress' },
    { id: 9, title: 'Memory leak in whiteboard', tags: ['bug', 'urgent'], column: 'progress' },
    { id: 10, title: 'User profile page', tags: ['feature'], column: 'done' },
    { id: 11, title: 'Setup Convex backend', tags: ['feature'], column: 'done' },
    { id: 12, title: 'Landing page design', tags: ['feature'], column: 'done' }
  ];

  const IDEAS = [
    { id: 1, title: 'VOICE COMMAND INTEGRATION', body: 'Allow users to capture ideas via voice input with automatic transcription and tagging.', tags: ['feature', 'ai'], priority: 'high', date: '2 hours ago', author: 'Jane D.' },
    { id: 2, title: 'COLLABORATIVE WHITEBOARD', body: 'Real-time multi-user whiteboard with cursor presence and conflict resolution.', tags: ['feature', 'collab'], priority: 'high', date: '5 hours ago', author: 'Alex K.' },
    { id: 3, title: 'EXPORT TO NOTION', body: 'One-click export of project boards and ideas to Notion workspace with formatting preserved.', tags: ['integration'], priority: 'medium', date: '1 day ago', author: 'Sam R.' },
    { id: 4, title: 'SMART TAGGING SYSTEM', body: 'ML-powered auto-tagging that learns from user behavior and suggests relevant tags.', tags: ['ai', 'feature'], priority: 'medium', date: '1 day ago', author: 'Jane D.' },
    { id: 5, title: 'OFFLINE MODE', body: 'Progressive web app capabilities with local storage sync when connection resumes.', tags: ['feature', 'performance'], priority: 'low', date: '2 days ago', author: 'Chris M.' },
    { id: 6, title: 'THEME MARKETPLACE', body: 'Community-driven theme system where users can create and share custom UI themes.', tags: ['feature', 'design'], priority: 'low', date: '3 days ago', author: 'Pat L.' },
    { id: 7, title: 'GANTT CHART VIEW', body: 'Timeline visualization for project planning with dependency tracking and milestone markers.', tags: ['feature'], priority: 'high', date: '3 days ago', author: 'Alex K.' },
    { id: 8, title: 'WEBHOOK SYSTEM', body: 'Custom webhook endpoints for integrating with external services and automation tools.', tags: ['integration', 'feature'], priority: 'medium', date: '4 days ago', author: 'Sam R.' }
  ];

  const CHAT_MESSAGES = [
    { role: 'user', text: 'Can you help me brainstorm features for the mobile app redesign?' },
    { role: 'ai', text: 'Of course! Here are some directions to consider: gesture-based navigation, offline mode with smart sync, customizable dashboard widgets, and a quick-capture floating button for ideas on the go.' },
    { role: 'user', text: 'I like the gesture navigation idea. What patterns work best for productivity apps?' },
    { role: 'ai', text: 'For productivity apps, swipe-to-action on list items (archive, delete, flag) works great. Also consider pinch-to-zoom on kanban boards, pull-to-refresh, and a bottom sheet for quick actions. Keep gesture discoverability in mind — subtle hints on first use help.' },
    { role: 'user', text: 'What about accessibility with gesture controls?' },
    { role: 'ai', text: 'Critical point! Always provide button alternatives for every gesture. Use haptic feedback for confirmation, support VoiceOver/TalkBack for all interactive elements, and ensure tap targets are at least 44px. Consider adding a gesture guide in settings that users can reference anytime.' }
  ];

  const ACTIVITIES = [
    { text: 'Jane Doe created project "Mobile App Redesign"', time: '10 min ago', type: 'create' },
    { text: 'Alex Kim moved "Setup CI/CD" to In Progress', time: '25 min ago', type: 'move' },
    { text: 'Sam Rivera added idea "Export to Notion"', time: '1 hour ago', type: 'idea' },
    { text: 'Design System 2.0 marked for review', time: '2 hours ago', type: 'review' },
    { text: 'Chris Miller closed 3 tasks in Performance Audit', time: '3 hours ago', type: 'complete' },
    { text: 'New comment on "AI Integration" project', time: '4 hours ago', type: 'comment' },
    { text: 'Pat Lee shared whiteboard "Auth Flow v2"', time: '5 hours ago', type: 'share' },
    { text: 'Weekly sprint planning meeting scheduled', time: '6 hours ago', type: 'event' },
    { text: 'Alex Kim updated schema for Tasks entity', time: '8 hours ago', type: 'update' },
    { text: 'Backup completed successfully', time: '12 hours ago', type: 'system' }
  ];

  /* ============================================ */
  /* DOM REFERENCES                               */
  /* ============================================ */

  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navDrawer = document.getElementById('navDrawer');
  const navCloseBtn = document.getElementById('navCloseBtn');
  const navOverlay = document.getElementById('navOverlay');
  const navLinks = document.querySelectorAll('.nav-link');
  const viewTitle = document.getElementById('viewTitle');
  const mainContent = document.getElementById('mainContent');
  const views = document.querySelectorAll('.view');

  /* ============================================ */
  /* NAVIGATION — HAMBURGER DRAWER                */
  /* ============================================ */

  function openDrawer() {
    navDrawer.classList.add('open');
    navOverlay.classList.add('visible');
    hamburgerBtn.classList.add('open');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
  }

  function closeDrawer() {
    navDrawer.classList.remove('open');
    navOverlay.classList.remove('visible');
    hamburgerBtn.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  }

  hamburgerBtn.addEventListener('click', function () {
    if (navDrawer.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  navCloseBtn.addEventListener('click', closeDrawer);
  navOverlay.addEventListener('click', closeDrawer);

  /* ============================================ */
  /* VIEW ROUTING                                 */
  /* ============================================ */

  function switchView(viewId) {
    views.forEach(function (v) { v.classList.remove('active'); });
    var target = document.getElementById(viewId);
    if (target) {
      target.classList.add('active');
    }

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('data-view') === viewId) {
        link.classList.add('active');
      }
    });

    var titleMap = {
      'dashboard': 'DASHBOARD',
      'projects': 'PROJECTS',
      'workspace': 'WORKSPACE',
      'kanban': 'KANBAN',
      'whiteboard': 'WHITEBOARD',
      'schema': 'SCHEMA PLANNER',
      'directory-tree': 'DIRECTORY TREE',
      'ideas': 'IDEAS',
      'ai-chat': 'AI CHAT',
      'settings': 'SETTINGS'
    };
    viewTitle.textContent = titleMap[viewId] || viewId.toUpperCase();

    closeDrawer();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var view = this.getAttribute('data-view');
      window.location.hash = view;
    });
  });

  function handleHashChange() {
    var hash = window.location.hash.replace('#', '') || 'dashboard';
    switchView(hash);
  }

  window.addEventListener('hashchange', handleHashChange);
  handleHashChange();

  /* ============================================ */
  /* DASHBOARD — POPULATE                         */
  /* ============================================ */

  // Activity list
  var activityList = document.getElementById('activityList');
  if (activityList) {
    ACTIVITIES.forEach(function (item) {
      var li = document.createElement('li');
      li.className = 'activity-item';
      li.innerHTML =
        '<div class="activity-dot"></div>' +
        '<div>' +
          '<span class="activity-text">' + item.text + '</span>' +
          '<span class="activity-time">' + item.time + '</span>' +
        '</div>';
      activityList.appendChild(li);
    });
  }

  // Dashboard chart
  var dashCtx = document.getElementById('dashboardChart');
  if (dashCtx && typeof Chart !== 'undefined') {
    new Chart(dashCtx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
        datasets: [
          {
            label: 'Ideas Created',
            data: [4, 7, 3, 8, 5, 2, 6],
            backgroundColor: '#FF5E54',
            borderColor: '#282828',
            borderWidth: 3
          },
          {
            label: 'Tasks Completed',
            data: [6, 3, 5, 4, 9, 1, 4],
            backgroundColor: '#2BBF5D',
            borderColor: '#282828',
            borderWidth: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              font: { family: "'Space Grotesk'", weight: 'bold', size: 12 },
              color: '#282828',
              usePointStyle: true,
              padding: 16
            }
          }
        },
        scales: {
          x: {
            ticks: {
              font: { family: "'IBM Plex Mono'", weight: '600', size: 11 },
              color: '#282828'
            },
            grid: { color: 'rgba(0,0,0,0.1)' },
            border: { color: '#282828', width: 3 }
          },
          y: {
            ticks: {
              font: { family: "'IBM Plex Mono'", weight: '600', size: 11 },
              color: '#282828'
            },
            grid: { color: 'rgba(0,0,0,0.1)' },
            border: { color: '#282828', width: 3 }
          }
        }
      }
    });
  }

  /* ============================================ */
  /* PROJECTS — POPULATE                          */
  /* ============================================ */

  var projectsGrid = document.getElementById('projectsGrid');
  if (projectsGrid) {
    PROJECTS.forEach(function (proj) {
      var card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML =
        '<div class="project-card-header">' +
          '<span class="project-status project-status--' + proj.status + '">' + proj.status.toUpperCase() + '</span>' +
        '</div>' +
        '<h3 class="project-title">' + proj.title + '</h3>' +
        '<p class="project-desc">' + proj.desc + '</p>' +
        '<div class="project-meta">' +
          '<span>' + proj.tasks + ' TASKS</span>' +
          '<span>DUE ' + proj.dueDate + '</span>' +
        '</div>' +
        '<div class="project-progress-bar">' +
          '<div class="project-progress-fill" style="width:' + proj.progress + '%"></div>' +
        '</div>';
      projectsGrid.appendChild(card);
    });
  }

  /* ============================================ */
  /* KANBAN — POPULATE & SORTABLE                 */
  /* ============================================ */

  var kanbanContainers = {
    backlog: document.getElementById('kanbanBacklog'),
    todo: document.getElementById('kanbanTodo'),
    progress: document.getElementById('kanbanProgress'),
    done: document.getElementById('kanbanDone')
  };

  KANBAN_CARDS.forEach(function (card) {
    var container = kanbanContainers[card.column];
    if (!container) return;

    var el = document.createElement('div');
    el.className = 'kanban-card';
    el.setAttribute('data-id', card.id);

    var tagsHtml = card.tags.map(function (tag) {
      var cls = 'kanban-tag';
      if (tag === 'urgent') cls += ' kanban-tag--urgent';
      else if (tag === 'bug') cls += ' kanban-tag--bug';
      else if (tag === 'feature') cls += ' kanban-tag--feature';
      return '<span class="' + cls + '">' + tag.toUpperCase() + '</span>';
    }).join('');

    el.innerHTML =
      '<div class="kanban-card-title">' + card.title + '</div>' +
      '<div class="kanban-card-tags">' + tagsHtml + '</div>';
    container.appendChild(el);
  });

  // Init SortableJS on each kanban column
  if (typeof Sortable !== 'undefined') {
    Object.keys(kanbanContainers).forEach(function (key) {
      var container = kanbanContainers[key];
      if (container) {
        new Sortable(container, {
          group: 'kanban',
          animation: 200,
          ghostClass: 'kanban-card--ghost',
          chosenClass: 'kanban-card--chosen',
          dragClass: 'kanban-card--drag',
          onEnd: function () {
            // Update counts
            Object.keys(kanbanContainers).forEach(function (k) {
              var col = kanbanContainers[k];
              var countEl = col.closest('.kanban-column').querySelector('.kanban-count');
              if (countEl) countEl.textContent = col.children.length;
            });
          }
        });
      }
    });
  }

  /* ============================================ */
  /* IDEAS — POPULATE                             */
  /* ============================================ */

  var ideasGrid = document.getElementById('ideasGrid');
  if (ideasGrid) {
    IDEAS.forEach(function (idea) {
      var card = document.createElement('div');
      card.className = 'idea-card';

      var tagsHtml = idea.tags.map(function (tag) {
        return '<span class="idea-tag">' + tag.toUpperCase() + '</span>';
      }).join('');

      card.innerHTML =
        '<span class="idea-card-priority idea-card-priority--' + idea.priority + '">' + idea.priority.toUpperCase() + '</span>' +
        '<h3 class="idea-card-title">' + idea.title + '</h3>' +
        '<p class="idea-card-body">' + idea.body + '</p>' +
        '<div class="idea-card-tags">' + tagsHtml + '</div>' +
        '<div class="idea-card-footer">' +
          '<span>' + idea.author + '</span>' +
          '<span>' + idea.date + '</span>' +
        '</div>';
      ideasGrid.appendChild(card);
    });
  }

  /* ============================================ */
  /* AI CHAT — POPULATE & SEND                    */
  /* ============================================ */

  var chatMessages = document.getElementById('chatMessages');
  var chatInput = document.getElementById('chatInput');
  var chatSendBtn = document.getElementById('chatSendBtn');

  function addChatMessage(role, text) {
    if (!chatMessages) return;
    var msg = document.createElement('div');
    msg.className = 'chat-msg chat-msg--' + role;

    var avatarText = role === 'user' ? 'JD' : 'AI';
    msg.innerHTML =
      '<div class="chat-avatar">' + avatarText + '</div>' +
      '<div class="chat-bubble">' + text + '</div>';
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Populate initial messages
  CHAT_MESSAGES.forEach(function (m) {
    addChatMessage(m.role, m.text);
  });

  // Send handler
  if (chatSendBtn && chatInput) {
    chatSendBtn.addEventListener('click', function () {
      var text = chatInput.value.trim();
      if (!text) return;
      addChatMessage('user', text);
      chatInput.value = '';

      // Simulate AI response
      setTimeout(function () {
        addChatMessage('ai', 'That is an interesting point. Let me think about how we can incorporate that into the current project scope. I would suggest creating a new idea card and linking it to the relevant project for tracking.');
      }, 800);
    });

    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatSendBtn.click();
      }
    });
  }

  /* ============================================ */
  /* WORKSPACE — TAB SWITCHING                    */
  /* ============================================ */

  var workspaceTabs = document.querySelectorAll('.brutalist-tab[data-tab]');
  var workspacePanels = document.querySelectorAll('.workspace-panel[data-panel]');

  workspaceTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = this.getAttribute('data-tab');

      workspaceTabs.forEach(function (t) { t.classList.remove('active'); });
      this.classList.add('active');

      workspacePanels.forEach(function (p) { p.classList.remove('active'); });
      var targetPanel = document.querySelector('.workspace-panel[data-panel="' + target + '"]');
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  /* ============================================ */
  /* WHITEBOARD — TOOLS & DRAWING                 */
  /* ============================================ */

  var whiteboardCanvas = document.getElementById('whiteboardCanvas');
  var toolBtns = document.querySelectorAll('.tool-btn[data-tool]');
  var currentTool = 'select';

  toolBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      toolBtns.forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');
      currentTool = this.getAttribute('data-tool');

      if (whiteboardCanvas) {
        whiteboardCanvas.style.cursor = currentTool === 'draw' ? 'crosshair' : 'default';
      }
    });
  });

  // Simple drawing on whiteboard
  if (whiteboardCanvas) {
    var wbCtx = whiteboardCanvas.getContext('2d');
    var isDrawing = false;
    var lastX = 0;
    var lastY = 0;

    // Set actual canvas size to match display
    function resizeWhiteboard() {
      var rect = whiteboardCanvas.getBoundingClientRect();
      whiteboardCanvas.width = rect.width;
      whiteboardCanvas.height = rect.height;
      drawWhiteboardGrid();
    }

    function drawWhiteboardGrid() {
      wbCtx.strokeStyle = '#E5DDD3';
      wbCtx.lineWidth = 1;
      var step = 30;
      for (var x = 0; x < whiteboardCanvas.width; x += step) {
        wbCtx.beginPath();
        wbCtx.moveTo(x, 0);
        wbCtx.lineTo(x, whiteboardCanvas.height);
        wbCtx.stroke();
      }
      for (var y = 0; y < whiteboardCanvas.height; y += step) {
        wbCtx.beginPath();
        wbCtx.moveTo(0, y);
        wbCtx.lineTo(whiteboardCanvas.width, y);
        wbCtx.stroke();
      }
    }

    resizeWhiteboard();
    window.addEventListener('resize', resizeWhiteboard);

    whiteboardCanvas.addEventListener('mousedown', function (e) {
      if (currentTool !== 'draw') return;
      isDrawing = true;
      var rect = whiteboardCanvas.getBoundingClientRect();
      lastX = e.clientX - rect.left;
      lastY = e.clientY - rect.top;
    });

    whiteboardCanvas.addEventListener('mousemove', function (e) {
      if (!isDrawing || currentTool !== 'draw') return;
      var rect = whiteboardCanvas.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;

      wbCtx.beginPath();
      wbCtx.strokeStyle = '#282828';
      wbCtx.lineWidth = 3;
      wbCtx.lineCap = 'round';
      wbCtx.moveTo(lastX, lastY);
      wbCtx.lineTo(x, y);
      wbCtx.stroke();

      lastX = x;
      lastY = y;
    });

    whiteboardCanvas.addEventListener('mouseup', function () { isDrawing = false; });
    whiteboardCanvas.addEventListener('mouseleave', function () { isDrawing = false; });
  }

  // Draggable sticky notes
  var stickyNotes = document.querySelectorAll('.sticky-note[data-draggable]');
  stickyNotes.forEach(function (note) {
    var offsetX = 0, offsetY = 0, isDragging = false;

    note.addEventListener('mousedown', function (e) {
      isDragging = true;
      offsetX = e.clientX - note.offsetLeft;
      offsetY = e.clientY - note.offsetTop;
      note.style.zIndex = '20';
      note.style.cursor = 'grabbing';
      note.style.transform = 'rotate(0deg) scale(1.05)';
    });

    document.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      note.style.left = (e.clientX - offsetX) + 'px';
      note.style.top = (e.clientY - offsetY) + 'px';
    });

    document.addEventListener('mouseup', function () {
      if (isDragging) {
        isDragging = false;
        note.style.zIndex = '';
        note.style.cursor = 'grab';
        note.style.transform = '';
      }
    });
  });

  /* ============================================ */
  /* DIRECTORY TREE — TOGGLE & PREVIEW            */
  /* ============================================ */

  var dirTree = document.getElementById('dirTree');
  var filePreview = document.getElementById('filePreview');

  var FILE_CONTENTS = {
    'Dashboard.tsx': 'import { useQuery } from "convex/react";\nimport { api } from "../convex/_generated/api";\n\nexport function Dashboard() {\n  const stats = useQuery(api.stats.get);\n  return (\n    <div className="dashboard">\n      <StatsRow data={stats} />\n      <ActivityFeed />\n      <ChartPanel />\n    </div>\n  );\n}',
    'Kanban.tsx': 'import { useMutation } from "convex/react";\nimport { api } from "../convex/_generated/api";\n\nexport function Kanban() {\n  const moveCard = useMutation(api.tasks.move);\n  return (\n    <div className="kanban-board">\n      {columns.map(col => (\n        <KanbanColumn\n          key={col.id}\n          onDrop={moveCard}\n        />\n      ))}\n    </div>\n  );\n}',
    'Whiteboard.tsx': 'import { useRef, useEffect } from "react";\n\nexport function Whiteboard() {\n  const canvasRef = useRef(null);\n  useEffect(() => {\n    const ctx = canvasRef.current?.getContext("2d");\n    // Initialize drawing tools\n  }, []);\n  return <canvas ref={canvasRef} />;\n}',
    'useProjects.ts': 'import { useQuery } from "convex/react";\nimport { api } from "../convex/_generated/api";\n\nexport function useProjects() {\n  return useQuery(api.projects.list);\n}',
    'useAuth.ts': 'import { useUser } from "@clerk/nextjs";\n\nexport function useAuth() {\n  const { user, isLoaded } = useUser();\n  return { user, isLoaded };\n}',
    'schema.ts': 'import { defineSchema, defineTable } from "convex/server";\nimport { v } from "convex/values";\n\nexport default defineSchema({\n  users: defineTable({\n    name: v.string(),\n    email: v.string(),\n    role: v.string(),\n  }),\n  projects: defineTable({\n    title: v.string(),\n    description: v.string(),\n    ownerId: v.id("users"),\n    status: v.string(),\n  }),\n});',
    'projects.ts': 'import { query, mutation } from "./_generated/server";\nimport { v } from "convex/values";\n\nexport const list = query({\n  handler: async (ctx) => {\n    return await ctx.db.query("projects").collect();\n  },\n});',
    'ideas.ts': 'import { query, mutation } from "./_generated/server";\nimport { v } from "convex/values";\n\nexport const list = query({\n  handler: async (ctx) => {\n    return await ctx.db\n      .query("ideas")\n      .order("desc")\n      .collect();\n  },\n});',
    'app.tsx': 'import { ClerkProvider } from "@clerk/nextjs";\nimport { ConvexProviderWithClerk } from "convex/react-clerk";\n\nexport default function App({ children }) {\n  return (\n    <ClerkProvider>\n      <ConvexProviderWithClerk>\n        {children}\n      </ConvexProviderWithClerk>\n    </ClerkProvider>\n  );\n}',
    'index.css': '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n:root {\n  --primary: #282828;\n  --secondary: #FF5E54;\n  --accent: #2BBF5D;\n}',
    'package.json': '{\n  "name": "idea-management",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "next dev",\n    "build": "next build",\n    "start": "next start"\n  },\n  "dependencies": {\n    "next": "^14.0.0",\n    "convex": "^1.0.0",\n    "@clerk/nextjs": "^4.0.0"\n  }\n}',
    'tsconfig.json': '{\n  "compilerOptions": {\n    "target": "ES2020",\n    "module": "esnext",\n    "strict": true,\n    "jsx": "react-jsx",\n    "paths": {\n      "@/*": ["./src/*"]\n    }\n  }\n}',
    '.env.local': '# Environment variables\nCONVEX_DEPLOYMENT=dev:your-deployment\nNEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_***\nCLERK_SECRET_KEY=sk_test_***'
  };

  if (dirTree) {
    dirTree.addEventListener('click', function (e) {
      var target = e.target;

      // Folder toggle
      var dirItem = target.closest('.dir-item--folder');
      if (dirItem && (target.classList.contains('dir-toggle') || target.classList.contains('dir-name') || target.classList.contains('dir-icon'))) {
        var subList = dirItem.querySelector('ul');
        if (subList) {
          subList.classList.toggle('collapsed');
          var toggle = dirItem.querySelector('.dir-toggle');
          if (toggle) {
            toggle.innerHTML = subList.classList.contains('collapsed') ? '&#9654;' : '&#9660;';
          }
        }
        return;
      }

      // File preview
      var fileItem = target.closest('.dir-item--file');
      if (fileItem && filePreview) {
        var fileName = fileItem.querySelector('.dir-name').textContent;
        var content = FILE_CONTENTS[fileName] || '// No preview available for ' + fileName;
        filePreview.innerHTML = '<pre><code>' + escapeHtml(content) + '</code></pre>';

        // Highlight selected file
        dirTree.querySelectorAll('.dir-item').forEach(function (i) { i.style.background = ''; });
        fileItem.style.background = 'var(--color-accent)';
      }
    });
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /* ============================================ */
  /* IDEAS — FILTER CHIPS                         */
  /* ============================================ */

  var filterChips = document.querySelectorAll('.filter-chip');
  filterChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      filterChips.forEach(function (c) { c.classList.remove('active'); });
      this.classList.add('active');
      // In a real app, this would filter the ideas grid
    });
  });

  /* ============================================ */
  /* ROUGH.JS — HAND-DRAWN DECORATIONS            */
  /* ============================================ */

  if (typeof rough !== 'undefined') {
    // Draw hand-drawn elements on the workspace preview SVG
    var workspaceRoughSvg = document.getElementById('workspaceRoughSvg');
    if (workspaceRoughSvg) {
      var rc = rough.svg(workspaceRoughSvg);
      workspaceRoughSvg.appendChild(rc.rectangle(20, 20, 160, 80, {
        roughness: 2, stroke: '#FF5E54', strokeWidth: 3, fill: '#F8F3EC', fillStyle: 'hachure'
      }));
      workspaceRoughSvg.appendChild(rc.rectangle(220, 30, 150, 70, {
        roughness: 2, stroke: '#282828', strokeWidth: 3, fill: '#2BBF5D', fillStyle: 'cross-hatch'
      }));
      workspaceRoughSvg.appendChild(rc.line(180, 60, 220, 65, {
        roughness: 1.5, stroke: '#282828', strokeWidth: 2
      }));
      workspaceRoughSvg.appendChild(rc.circle(60, 150, 40, {
        roughness: 2, stroke: '#7B61FF', strokeWidth: 3
      }));
      workspaceRoughSvg.appendChild(rc.line(80, 150, 220, 100, {
        roughness: 1.5, stroke: '#282828', strokeWidth: 2
      }));
    }

    // Draw hand-drawn schema relation lines
    var schemaSvg = document.getElementById('schemaRelationsSvg');
    if (schemaSvg) {
      var srcSchema = rough.svg(schemaSvg);
      schemaSvg.appendChild(srcSchema.line(130, 10, 400, 10, {
        roughness: 2, stroke: '#FF5E54', strokeWidth: 3
      }));
      schemaSvg.appendChild(srcSchema.line(400, 10, 400, 40, {
        roughness: 2, stroke: '#FF5E54', strokeWidth: 3
      }));
      schemaSvg.appendChild(srcSchema.line(130, 10, 130, 40, {
        roughness: 2, stroke: '#2BBF5D', strokeWidth: 3
      }));
      schemaSvg.appendChild(srcSchema.circle(130, 10, 12, {
        roughness: 1.5, stroke: '#282828', strokeWidth: 2, fill: '#FF5E54', fillStyle: 'solid'
      }));
      schemaSvg.appendChild(srcSchema.circle(400, 10, 12, {
        roughness: 1.5, stroke: '#282828', strokeWidth: 2, fill: '#2BBF5D', fillStyle: 'solid'
      }));
    }
  }

  /* ============================================ */
  /* HOVER TRANSFORMS — AGGRESSIVE                */
  /* ============================================ */

  // Aggressive hover transform on stat cards via JS for more variety
  var statCards = document.querySelectorAll('.stat-card');
  statCards.forEach(function (card, index) {
    var rotations = [-2, 1.5, -1, 2];
    card.addEventListener('mouseenter', function () {
      this.style.transform = 'translate(-2px, -2px) rotate(' + rotations[index % 4] + 'deg) scale(1.02)';
    });
    card.addEventListener('mouseleave', function () {
      this.style.transform = '';
    });
  });

  /* ============================================ */
  /* KEYBOARD NAVIGATION                          */
  /* ============================================ */

  document.addEventListener('keydown', function (e) {
    // Escape closes drawer
    if (e.key === 'Escape' && navDrawer.classList.contains('open')) {
      closeDrawer();
      hamburgerBtn.focus();
    }
  });

})();
