/* ============================================================
   SWISS STYLE — PASS 2
   Data-dense, sidebar-driven, Muller-Brockmann grid
   Application JavaScript — Navigation, Charts, Interactions
   ============================================================ */

(function () {
  'use strict';

  /* ========== DOM REFERENCES ========== */
  const sidebar = document.getElementById('sidebar');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
  const topBarTime = document.getElementById('topBarTime');
  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.view');

  /* ========== VIEW NAME MAP ========== */
  const viewNames = {
    dashboard: 'Dashboard',
    projects: 'Projects',
    workspace: 'Workspace',
    kanban: 'Kanban',
    whiteboard: 'Whiteboard',
    schema: 'Schema Planner',
    directory: 'Directory Tree',
    ideas: 'Ideas',
    chat: 'AI Chat',
    settings: 'Settings'
  };

  /* ========== HASH ROUTER ========== */
  function navigateToView(viewId) {
    /* Hide all views */
    views.forEach(function (v) { v.classList.remove('active'); });

    /* Deactivate all nav items */
    navItems.forEach(function (n) { n.classList.remove('active'); });

    /* Show target view */
    var target = document.getElementById('view-' + viewId);
    if (target) {
      target.classList.add('active');
    }

    /* Activate nav item */
    var navTarget = document.querySelector('.nav-item[data-view="' + viewId + '"]');
    if (navTarget) {
      navTarget.classList.add('active');
    }

    /* Update breadcrumb */
    if (breadcrumbCurrent) {
      breadcrumbCurrent.textContent = viewNames[viewId] || viewId;
    }

    /* Close mobile sidebar */
    closeMobileSidebar();

    /* Re-init AOS for the new view */
    if (typeof AOS !== 'undefined') {
      AOS.refresh();
    }

    /* Init charts if dashboard */
    if (viewId === 'dashboard') {
      initCharts();
    }
  }

  function handleHashChange() {
    var hash = window.location.hash.replace('#', '') || 'dashboard';
    navigateToView(hash);
  }

  /* Listen for hash changes */
  window.addEventListener('hashchange', handleHashChange);

  /* Nav item clicks */
  navItems.forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      var viewId = this.getAttribute('data-view');
      window.location.hash = '#' + viewId;
    });
  });

  /* ========== MOBILE SIDEBAR ========== */
  function openMobileSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('active');
    hamburgerBtn.classList.add('active');
  }

  function closeMobileSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
    hamburgerBtn.classList.remove('active');
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', function () {
      if (sidebar.classList.contains('open')) {
        closeMobileSidebar();
      } else {
        openMobileSidebar();
      }
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeMobileSidebar);
  }

  /* ========== TOP BAR CLOCK ========== */
  function updateClock() {
    if (topBarTime) {
      var now = new Date();
      var h = String(now.getHours()).padStart(2, '0');
      var m = String(now.getMinutes()).padStart(2, '0');
      var s = String(now.getSeconds()).padStart(2, '0');
      topBarTime.textContent = h + ':' + m + ':' + s;
    }
  }

  updateClock();
  setInterval(updateClock, 1000);

  /* ========== CHARTS (Chart.js) ========== */
  var chartsInitialized = false;

  function initCharts() {
    if (chartsInitialized) return;
    if (typeof Chart === 'undefined') return;

    /* Chart.js global defaults — Swiss style */
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.font.size = 11;
    Chart.defaults.color = '#888888';
    Chart.defaults.plugins.legend.display = false;
    Chart.defaults.animation.duration = 600;

    /* Idea Volume — Bar Chart */
    var ctxVolume = document.getElementById('chartIdeaVolume');
    if (ctxVolume) {
      new Chart(ctxVolume.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['W01', 'W02', 'W03', 'W04', 'W05', 'W06', 'W07', 'W08', 'W09', 'W10', 'W11', 'W12'],
          datasets: [{
            data: [42, 38, 55, 47, 63, 51, 69, 58, 72, 65, 81, 77],
            backgroundColor: '#000000',
            hoverBackgroundColor: '#D72638',
            borderWidth: 0,
            borderRadius: 0,
            barPercentage: 0.7
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: { display: false },
              border: { color: '#000000', width: 2 },
              ticks: { font: { family: "'JetBrains Mono', monospace", size: 10 } }
            },
            y: {
              grid: { color: '#E0E0E0', lineWidth: 1 },
              border: { display: false },
              ticks: { font: { family: "'JetBrains Mono', monospace", size: 10 } }
            }
          },
          plugins: {
            tooltip: {
              backgroundColor: '#000000',
              titleFont: { family: "'Inter', sans-serif", weight: 'bold', size: 11 },
              bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
              cornerRadius: 1,
              padding: 8
            }
          }
        }
      });
    }

    /* Category Distribution — Doughnut Chart */
    var ctxCategory = document.getElementById('chartCategory');
    if (ctxCategory) {
      new Chart(ctxCategory.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: ['Feature', 'Bug Fix', 'Research', 'Design', 'DevOps', 'Docs'],
          datasets: [{
            data: [38, 22, 18, 12, 6, 4],
            backgroundColor: ['#000000', '#444444', '#777777', '#AAAAAA', '#CCCCCC', '#E0E0E0'],
            hoverBackgroundColor: ['#D72638', '#000000', '#444444', '#777777', '#AAAAAA', '#CCCCCC'],
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
                boxWidth: 10,
                boxHeight: 10,
                padding: 12,
                font: { size: 10, family: "'Inter', sans-serif" },
                usePointStyle: false
              }
            },
            tooltip: {
              backgroundColor: '#000000',
              titleFont: { family: "'Inter', sans-serif", weight: 'bold', size: 11 },
              bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
              cornerRadius: 1,
              padding: 8,
              callbacks: {
                label: function (context) {
                  return context.label + ': ' + context.parsed + '%';
                }
              }
            }
          }
        }
      });
    }

    chartsInitialized = true;
  }

  /* ========== KANBAN — SORTABLE ========== */
  function initKanban() {
    if (typeof Sortable === 'undefined') return;

    var kanbanLists = document.querySelectorAll('.kanban-cards');
    kanbanLists.forEach(function (list) {
      new Sortable(list, {
        group: 'kanban',
        animation: 200,
        ghostClass: 'kanban-card-ghost',
        dragClass: 'kanban-card-drag',
        onEnd: function () {
          /* Update column counts */
          document.querySelectorAll('.kanban-column').forEach(function (col) {
            var count = col.querySelectorAll('.kanban-card').length;
            var countEl = col.querySelector('.kanban-col-count');
            if (countEl) countEl.textContent = count;
          });
        }
      });
    });
  }

  /* ========== SETTINGS TABS ========== */
  function initSettingsTabs() {
    var tabs = document.querySelectorAll('.settings-tab');
    var panels = document.querySelectorAll('.settings-panel');

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var targetTab = this.getAttribute('data-settings-tab');

        /* Deactivate all */
        tabs.forEach(function (t) { t.classList.remove('active'); });
        panels.forEach(function (p) { p.classList.remove('active'); });

        /* Activate target */
        this.classList.add('active');
        var targetPanel = document.getElementById('settings-' + targetTab);
        if (targetPanel) targetPanel.classList.add('active');
      });
    });
  }

  /* ========== WHITEBOARD TOOLS ========== */
  function initWhiteboard() {
    var tools = document.querySelectorAll('.wb-tool[data-tool]');
    tools.forEach(function (tool) {
      tool.addEventListener('click', function () {
        var toolType = this.getAttribute('data-tool');

        if (toolType === 'zoomin' || toolType === 'zoomout') {
          var zoomEl = document.querySelector('.wb-zoom-level');
          if (zoomEl) {
            var current = parseInt(zoomEl.textContent) || 100;
            if (toolType === 'zoomin' && current < 200) current += 25;
            if (toolType === 'zoomout' && current > 25) current -= 25;
            zoomEl.textContent = current + '%';
          }
          return;
        }

        /* Toggle active tool */
        tools.forEach(function (t) {
          if (t.getAttribute('data-tool') !== 'zoomin' && t.getAttribute('data-tool') !== 'zoomout') {
            t.classList.remove('active');
          }
        });
        this.classList.add('active');
      });
    });
  }

  /* ========== DIRECTORY TREE TOGGLE ========== */
  function initDirectoryTree() {
    var folders = document.querySelectorAll('.tree-folder .tree-toggle');
    folders.forEach(function (toggle) {
      toggle.addEventListener('click', function () {
        var item = this.closest('.tree-item');
        var isOpen = item.classList.contains('open');

        if (isOpen) {
          item.classList.remove('open');
          this.textContent = '\u25B6'; /* right triangle */
          /* Hide children */
          hideChildren(item);
        } else {
          item.classList.add('open');
          this.textContent = '\u25BC'; /* down triangle */
          /* Show children */
          showChildren(item);
        }
      });
    });
  }

  function hideChildren(parent) {
    var depth = parseInt(parent.getAttribute('data-depth')) || 0;
    var sibling = parent.nextElementSibling;
    while (sibling) {
      var sibDepth = parseInt(sibling.getAttribute('data-depth')) || 0;
      if (sibDepth <= depth) break;
      sibling.style.display = 'none';
      sibling = sibling.nextElementSibling;
    }
  }

  function showChildren(parent) {
    var depth = parseInt(parent.getAttribute('data-depth')) || 0;
    var sibling = parent.nextElementSibling;
    while (sibling) {
      var sibDepth = parseInt(sibling.getAttribute('data-depth')) || 0;
      if (sibDepth <= depth) break;
      if (sibDepth === depth + 1) {
        sibling.style.display = '';
        /* If it's a closed folder, don't show its children */
        if (sibling.classList.contains('tree-folder') && !sibling.classList.contains('open')) {
          var innerSib = sibling.nextElementSibling;
          while (innerSib) {
            var innerDepth = parseInt(innerSib.getAttribute('data-depth')) || 0;
            if (innerDepth <= sibDepth) break;
            innerSib.style.display = 'none';
            innerSib = innerSib.nextElementSibling;
          }
        }
      }
      sibling = sibling.nextElementSibling;
    }
  }

  /* ========== CHAT INTERACTION ========== */
  function initChat() {
    var chatInput = document.getElementById('chatInput');
    var chatSendBtn = document.getElementById('chatSendBtn');
    var chatMessages = document.getElementById('chatMessages');

    function sendMessage() {
      if (!chatInput || !chatMessages) return;
      var text = chatInput.value.trim();
      if (!text) return;

      /* Add user message */
      var userMsg = document.createElement('div');
      userMsg.className = 'chat-msg chat-msg-user';
      userMsg.innerHTML =
        '<div class="chat-msg-avatar">JB</div>' +
        '<div class="chat-msg-content">' +
        '<div class="chat-msg-sender">J. Brockmann</div>' +
        '<p>' + escapeHtml(text) + '</p>' +
        '</div>';
      chatMessages.appendChild(userMsg);

      chatInput.value = '';

      /* Simulate AI response */
      setTimeout(function () {
        var aiMsg = document.createElement('div');
        aiMsg.className = 'chat-msg chat-msg-ai';
        aiMsg.innerHTML =
          '<div class="chat-msg-avatar">AI</div>' +
          '<div class="chat-msg-content">' +
          '<div class="chat-msg-sender mono">AI ASSISTANT</div>' +
          '<p>I understand your request. Let me analyze the data across all 23 active projects and 1,247 ideas to provide a comprehensive response.</p>' +
          '</div>';
        chatMessages.appendChild(aiMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 800);

      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    if (chatSendBtn) {
      chatSendBtn.addEventListener('click', sendMessage);
    }

    if (chatInput) {
      chatInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          sendMessage();
        }
      });
    }
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  /* ========== COLOR SWATCH INTERACTION ========== */
  function initColorSwatches() {
    var swatches = document.querySelectorAll('.color-swatch');
    swatches.forEach(function (swatch) {
      swatch.addEventListener('click', function () {
        swatches.forEach(function (s) { s.classList.remove('active'); });
        this.classList.add('active');
      });
    });
  }

  /* ========== INIT AOS ========== */
  function initAOS() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 400,
        easing: 'ease-out',
        once: true,
        offset: 50,
        disable: function () {
          return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }
      });
    }
  }

  /* ========== BOOT ========== */
  function init() {
    initAOS();
    handleHashChange();
    initCharts();
    initKanban();
    initSettingsTabs();
    initWhiteboard();
    initDirectoryTree();
    initChat();
    initColorSwatches();
  }

  /* Wait for DOM and libraries */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
