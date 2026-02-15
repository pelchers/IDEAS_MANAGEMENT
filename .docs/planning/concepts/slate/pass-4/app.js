/* ==========================================================================
   Mesa Trail Manager — app.js
   Pass 4: Sandstone Desert Workspace
   Libraries: Anime.js, SortableJS, Tippy.js
   ========================================================================== */

(function () {
  'use strict';

  // ---- Constants ----
  const VIEWS = [
    'dashboard', 'projects', 'project-workspace', 'kanban',
    'whiteboard', 'schema-planner', 'directory-tree', 'ideas',
    'ai-chat', 'settings'
  ];

  // ---- DOM References ----
  const toolbarNav = document.getElementById('toolbar-nav');
  const mainContent = document.getElementById('main-content');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const loadingOverlay = document.getElementById('loading-overlay');
  const heatShimmer = document.getElementById('heat-shimmer');
  const dustContainer = document.getElementById('dust-puff-container');
  const microFeedback = document.getElementById('micro-feedback');

  // ---- State ----
  let currentView = 'dashboard';
  let isTransitioning = false;

  // ==================================================================
  // LOADING STATE: Sand Hourglass Flow
  // ==================================================================
  function dismissLoading() {
    setTimeout(function () {
      loadingOverlay.classList.add('fade-out');
      setTimeout(function () {
        loadingOverlay.style.display = 'none';
        startIdleAmbient();
        initScrollReveal();
      }, 600);
    }, 1200);
  }

  // ==================================================================
  // IDLE AMBIENT: Heat Shimmer Subtle
  // ==================================================================
  function startIdleAmbient() {
    heatShimmer.classList.add('active');
  }

  // ==================================================================
  // NAVIGATION: Hash-Based Routing
  // ==================================================================
  function navigateTo(viewName) {
    if (viewName === currentView || isTransitioning) return;
    if (!VIEWS.includes(viewName)) return;

    isTransitioning = true;

    var currentPage = mainContent.querySelector('.view-page.active');
    var nextPage = mainContent.querySelector('[data-page="' + viewName + '"]');

    if (!currentPage || !nextPage) {
      isTransitioning = false;
      return;
    }

    // Wind erosion page transition
    currentPage.classList.add('eroding-out');

    setTimeout(function () {
      currentPage.classList.remove('active', 'eroding-out');
      nextPage.classList.add('eroding-in');

      setTimeout(function () {
        nextPage.classList.remove('eroding-in');
        nextPage.classList.add('active');
        isTransitioning = false;

        // Update toolbar buttons
        updateActiveNav(viewName);
        currentView = viewName;

        // Reinit scroll reveals for the new view
        initScrollRevealForView(nextPage);
      }, 400);
    }, 400);
  }

  function updateActiveNav(viewName) {
    var allBtns = document.querySelectorAll('.toolbar-btn');
    allBtns.forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });

    // Update mobile drawer buttons
    var mobileBtns = mobileDrawer.querySelectorAll('.toolbar-btn');
    mobileBtns.forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });
  }

  // Toolbar navigation click handlers
  toolbarNav.addEventListener('click', function (e) {
    var btn = e.target.closest('.toolbar-btn');
    if (!btn) return;
    var view = btn.getAttribute('data-view');
    if (view) {
      window.location.hash = view;
    }
  });

  // Hash change listener
  window.addEventListener('hashchange', function () {
    var hash = window.location.hash.replace('#', '');
    if (hash && VIEWS.includes(hash)) {
      navigateTo(hash);
    }
  });

  // Initial hash
  function initFromHash() {
    var hash = window.location.hash.replace('#', '');
    if (hash && VIEWS.includes(hash)) {
      var page = mainContent.querySelector('[data-page="' + hash + '"]');
      var defaultPage = mainContent.querySelector('.view-page.active');
      if (defaultPage && page && defaultPage !== page) {
        defaultPage.classList.remove('active');
        page.classList.add('active');
        currentView = hash;
        updateActiveNav(hash);
      }
    }
  }

  // ==================================================================
  // MOBILE MENU
  // ==================================================================
  function setupMobileMenu() {
    // Clone toolbar buttons into mobile drawer
    var mobileInner = mobileDrawer.querySelector('.mobile-nav-inner');
    var navBtns = toolbarNav.querySelectorAll('.toolbar-btn');
    navBtns.forEach(function (btn) {
      var clone = btn.cloneNode(true);
      clone.addEventListener('click', function () {
        var view = clone.getAttribute('data-view');
        if (view) {
          window.location.hash = view;
          closeMobileMenu();
        }
      });
      mobileInner.appendChild(clone);
    });

    mobileToggle.addEventListener('click', function () {
      var isOpen = mobileDrawer.classList.contains('open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        mobileDrawer.classList.add('open');
        mobileToggle.classList.add('open');
      }
    });

    // Close drawer when clicking backdrop
    mobileDrawer.addEventListener('click', function (e) {
      if (e.target === mobileDrawer) {
        closeMobileMenu();
      }
    });
  }

  function closeMobileMenu() {
    mobileDrawer.classList.remove('open');
    mobileToggle.classList.remove('open');
  }

  // ==================================================================
  // BUTTON CLICK: Dust Puff Micro
  // ==================================================================
  function createDustPuff(x, y) {
    var particleCount = 6;
    for (var i = 0; i < particleCount; i++) {
      var particle = document.createElement('div');
      particle.className = 'dust-particle';
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      dustContainer.appendChild(particle);

      var angle = (Math.PI * 2 / particleCount) * i + (Math.random() * 0.5);
      var dist = 15 + Math.random() * 20;

      anime({
        targets: particle,
        translateX: Math.cos(angle) * dist,
        translateY: Math.sin(angle) * dist,
        opacity: [0.7, 0],
        scale: [1, 0.3],
        duration: 500 + Math.random() * 200,
        easing: 'easeOutQuad',
        complete: function () {
          particle.remove();
        }
      });
    }
  }

  // Attach dust puff to all buttons
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.btn, .toolbar-btn');
    if (btn) {
      createDustPuff(e.clientX, e.clientY);
    }
  });

  // ==================================================================
  // SCROLL REVEAL: Rise from Canyon Floor
  // ==================================================================
  function initScrollReveal() {
    // Tag elements for reveal
    var targets = mainContent.querySelectorAll(
      '.stat-formation, .activity-item, .event-card, .metric-bar-row, ' +
      '.waypoint, .field-report, .kanban-card, .idea-card, .field-note, ' +
      '.trail-step, .overview-stat, .tree-branch.depth-0 > .tree-label'
    );
    targets.forEach(function (el) {
      el.classList.add('canyon-rise');
    });

    // Initial reveal for active view
    var activeView = mainContent.querySelector('.view-page.active');
    if (activeView) {
      initScrollRevealForView(activeView);
    }
  }

  function initScrollRevealForView(viewEl) {
    var items = viewEl.querySelectorAll('.canyon-rise');
    var scrollRegions = viewEl.querySelectorAll('.scroll-region');

    // Immediate reveal for visible items
    items.forEach(function (item, i) {
      setTimeout(function () {
        item.classList.add('revealed');
      }, 80 * i);
    });

    // Observe scroll regions for dynamic reveals
    scrollRegions.forEach(function (region) {
      region.addEventListener('scroll', function () {
        var regionItems = region.querySelectorAll('.canyon-rise:not(.revealed)');
        regionItems.forEach(function (item) {
          var rect = item.getBoundingClientRect();
          var regionRect = region.getBoundingClientRect();
          if (rect.top < regionRect.bottom - 30) {
            item.classList.add('revealed');
          }
        });
      });
    });
  }

  // ==================================================================
  // PANE RESIZER: Drag to Resize Split Panes
  // ==================================================================
  function initResizers() {
    var resizers = document.querySelectorAll('.pane-resizer');
    resizers.forEach(function (resizer) {
      var prevPane = resizer.previousElementSibling;
      var nextPane = resizer.nextElementSibling;
      if (!prevPane || !nextPane) return;

      var isResizing = false;
      var startX = 0;
      var startWidth = 0;

      resizer.addEventListener('mousedown', function (e) {
        isResizing = true;
        startX = e.clientX;
        startWidth = prevPane.getBoundingClientRect().width;
        resizer.classList.add('dragging');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
      });

      document.addEventListener('mousemove', function (e) {
        if (!isResizing) return;
        var dx = e.clientX - startX;
        var newWidth = startWidth + dx;
        if (newWidth > 140 && newWidth < window.innerWidth - 200) {
          prevPane.style.flex = '0 0 ' + newWidth + 'px';
        }
      });

      document.addEventListener('mouseup', function () {
        if (isResizing) {
          isResizing = false;
          resizer.classList.remove('dragging');
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
        }
      });
    });
  }

  // ==================================================================
  // SORTABLEJS: Kanban Card Drag
  // ==================================================================
  function initKanbanSortable() {
    var lanes = document.querySelectorAll('[data-sortable="true"]');
    lanes.forEach(function (lane) {
      new Sortable(lane, {
        group: 'kanban-cards',
        animation: 200,
        ghostClass: 'sortable-ghost',
        handle: '.kanban-card',
        onEnd: function (evt) {
          // Update lane counts
          updateLaneCounts();
          // Micro feedback: sage checkmark
          showMicroFeedback('Task moved successfully');
        }
      });
    });
  }

  function updateLaneCounts() {
    var lanes = document.querySelectorAll('.kanban-lane');
    lanes.forEach(function (lane) {
      var cards = lane.querySelectorAll('.kanban-card');
      var countEl = lane.querySelector('.lane-count');
      if (countEl) {
        countEl.textContent = cards.length;
      }
    });
  }

  // ==================================================================
  // MICRO FEEDBACK: Sage Checkmark Fade
  // ==================================================================
  function showMicroFeedback(message) {
    var msgEl = microFeedback.querySelector('.feedback-msg');
    if (msgEl) msgEl.textContent = message;

    microFeedback.classList.remove('hidden');
    microFeedback.classList.add('visible');

    // Animate the checkmark
    anime({
      targets: '.sage-check polyline',
      strokeDashoffset: [40, 0],
      duration: 400,
      easing: 'easeOutQuad'
    });

    setTimeout(function () {
      microFeedback.classList.remove('visible');
      microFeedback.classList.add('hidden');
    }, 2200);
  }

  // ==================================================================
  // TIPPY.JS: Weathered Plaque Tooltips
  // ==================================================================
  function initTooltips() {
    tippy('[data-tippy-content]', {
      placement: 'bottom',
      animation: 'fade',
      duration: [200, 150],
      delay: [300, 0],
      arrow: true,
      theme: 'sandstone'
    });
  }

  // ==================================================================
  // TOGGLE SWITCHES: Slide with Dust Trail
  // ==================================================================
  function initToggleSwitches() {
    var toggles = document.querySelectorAll('[data-toggle="true"]');
    toggles.forEach(function (toggle) {
      toggle.addEventListener('click', function () {
        toggle.classList.toggle('active');

        // Dust trail effect
        var dustTrail = toggle.querySelector('.toggle-dust-trail');
        if (dustTrail) {
          anime({
            targets: dustTrail,
            opacity: [0.6, 0],
            width: [14, 0],
            duration: 400,
            easing: 'easeOutQuad',
            complete: function () {
              if (toggle.classList.contains('active')) {
                dustTrail.style.opacity = '0.4';
                dustTrail.style.width = '14px';
              }
            }
          });
        }

        showMicroFeedback('Setting updated');
      });
    });
  }

  // ==================================================================
  // DIRECTORY TREE: Click to Select Files
  // ==================================================================
  function initDirectoryTree() {
    var fileLabels = document.querySelectorAll('.tree-marker.file + .tree-label');
    var folderLabels = document.querySelectorAll('.tree-marker.folder + .tree-label');
    var fileInfo = document.getElementById('file-info');
    var placeholder = document.querySelector('.file-preview-placeholder');

    var fileData = {
      'trail-survey-2026.gpx': { type: 'GPS Exchange Format', size: '2.4 MB', modified: 'Feb 14, 2026', author: 'Ranger K. Sagebrush' },
      'erosion-report.pdf': { type: 'PDF Document', size: '845 KB', modified: 'Feb 10, 2026', author: 'Ranger J. Mesquite' },
      'wildlife-camera-log.csv': { type: 'CSV Spreadsheet', size: '1.2 MB', modified: 'Feb 12, 2026', author: 'Ranger A. Hawk' },
      'botanical-inventory.xlsx': { type: 'Excel Spreadsheet', size: '678 KB', modified: 'Jan 28, 2026', author: 'Ranger B. Yucca' },
      'sunset-arch-jan.jpg': { type: 'JPEG Image', size: '3.8 MB', modified: 'Jan 15, 2026', author: 'Ranger D. Petroglyph' },
      'petroglyph-panel-4.jpg': { type: 'JPEG Image', size: '4.2 MB', modified: 'Jan 20, 2026', author: 'Ranger D. Petroglyph' },
      'budget-fy2026.xlsx': { type: 'Excel Spreadsheet', size: '312 KB', modified: 'Feb 1, 2026', author: 'Admin P. Adobe' },
      'ranger-schedule-spring.pdf': { type: 'PDF Document', size: '128 KB', modified: 'Feb 5, 2026', author: 'Admin M. Juniper' },
      'nepa-compliance-checklist.docx': { type: 'Word Document', size: '256 KB', modified: 'Feb 8, 2026', author: 'Ranger J. Mesquite' }
    };

    fileLabels.forEach(function (label) {
      label.addEventListener('click', function () {
        var fileName = label.textContent.trim();
        var data = fileData[fileName];
        if (data && fileInfo) {
          document.getElementById('fi-name').textContent = fileName;
          document.getElementById('fi-type').textContent = data.type;
          document.getElementById('fi-size').textContent = data.size;
          document.getElementById('fi-modified').textContent = data.modified;
          document.getElementById('fi-author').textContent = data.author;

          if (placeholder) placeholder.style.display = 'none';
          fileInfo.classList.remove('hidden');

          showMicroFeedback('File selected');
        }
      });
    });

    // Toggle folder collapse
    folderLabels.forEach(function (label) {
      label.addEventListener('click', function () {
        var branch = label.closest('.tree-branch');
        var children = branch.querySelector('.tree-children');
        if (children) {
          var isCollapsed = children.style.display === 'none';
          children.style.display = isCollapsed ? '' : 'none';
        }
      });
    });
  }

  // ==================================================================
  // CHAT INPUT: Send Message
  // ==================================================================
  function initChatInput() {
    var chatInput = document.querySelector('.chat-input');
    var chatSendBtn = document.querySelector('.chat-send-btn');
    var chatThread = document.querySelector('.field-notes-thread');
    var chatScroll = document.getElementById('chat-scroll');

    if (!chatInput || !chatSendBtn || !chatThread) return;

    function sendMessage() {
      var text = chatInput.value.trim();
      if (!text) return;

      // Create ranger note
      var note = document.createElement('div');
      note.className = 'field-note ranger';
      note.innerHTML =
        '<div class="note-header">' +
          '<span class="note-badge">FIELD NOTE</span>' +
          '<span class="note-location">GPS: 36.8629\u00b0N, 111.3743\u00b0W</span>' +
          '<span class="note-timestamp">' + getCurrentTime() + '</span>' +
        '</div>' +
        '<div class="note-body"><p>' + escapeHtml(text) + '</p></div>';

      chatThread.appendChild(note);
      chatInput.value = '';

      // Scroll to bottom
      if (chatScroll) {
        chatScroll.scrollTop = chatScroll.scrollHeight;
      }

      // Simulate dispatch response after delay
      setTimeout(function () {
        var response = document.createElement('div');
        response.className = 'field-note dispatch';
        response.innerHTML =
          '<div class="note-header">' +
            '<span class="note-badge">DISPATCH</span>' +
            '<span class="note-location">Station: Mesa HQ</span>' +
            '<span class="note-timestamp">' + getCurrentTime() + '</span>' +
          '</div>' +
          '<div class="note-body"><p>Copy that, Ranger. Your observation has been logged and routed to the appropriate team. Stay safe on the trail.</p></div>';

        chatThread.appendChild(response);
        if (chatScroll) {
          chatScroll.scrollTop = chatScroll.scrollHeight;
        }
        showMicroFeedback('Dispatch acknowledged');
      }, 1500);
    }

    chatSendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  function getCurrentTime() {
    var now = new Date();
    var h = now.getHours().toString().padStart(2, '0');
    var m = now.getMinutes().toString().padStart(2, '0');
    return h + m + ' hrs';
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ==================================================================
  // SETTINGS: Trail Step Activation
  // ==================================================================
  function initSettings() {
    var steps = document.querySelectorAll('.trail-step');
    steps.forEach(function (step) {
      step.addEventListener('click', function () {
        steps.forEach(function (s) { s.classList.remove('active'); });
        step.classList.add('active');
      });
    });
  }

  // ==================================================================
  // WHITEBOARD: Node Interaction (simple drag)
  // ==================================================================
  function initWhiteboard() {
    var canvas = document.getElementById('whiteboard-canvas');
    if (!canvas) return;

    var nodes = canvas.querySelectorAll('.sandstone-node');
    nodes.forEach(function (node) {
      var isDragging = false;
      var offsetX = 0;
      var offsetY = 0;

      node.addEventListener('mousedown', function (e) {
        isDragging = true;
        offsetX = e.clientX - node.offsetLeft;
        offsetY = e.clientY - node.offsetTop;
        node.style.zIndex = '10';
        node.style.cursor = 'grabbing';
        e.preventDefault();
      });

      document.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        var canvasRect = canvas.getBoundingClientRect();
        var newX = e.clientX - offsetX;
        var newY = e.clientY - offsetY;

        // Clamp within canvas
        newX = Math.max(0, Math.min(canvasRect.width - node.offsetWidth, newX));
        newY = Math.max(0, Math.min(canvasRect.height - node.offsetHeight, newY));

        node.style.left = newX + 'px';
        node.style.top = newY + 'px';
      });

      document.addEventListener('mouseup', function () {
        if (isDragging) {
          isDragging = false;
          node.style.zIndex = '2';
          node.style.cursor = 'move';
        }
      });
    });
  }

  // ==================================================================
  // ANIME.JS: Entrance Animations
  // ==================================================================
  function animateBarCharts() {
    var bars = document.querySelectorAll('.bar-fill');
    bars.forEach(function (bar) {
      var targetWidth = bar.style.width;
      bar.style.width = '0%';
      anime({
        targets: bar,
        width: targetWidth,
        duration: 1200,
        delay: 300,
        easing: 'easeOutQuart'
      });
    });
  }

  function animateFormationValues() {
    var values = document.querySelectorAll('.formation-value');
    values.forEach(function (val, i) {
      anime({
        targets: val,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        delay: 200 + i * 100,
        easing: 'easeOutQuad'
      });
    });
  }

  // Trail path SVG drawing
  function animateTrailPath() {
    var path = document.querySelector('.trail-path-line');
    if (!path) return;
    var length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    anime({
      targets: path,
      strokeDashoffset: [length, 0],
      duration: 2500,
      delay: 400,
      easing: 'easeInOutQuad'
    });
  }

  // Fault line drawing for schema
  function animateFaultLines() {
    var lines = document.querySelectorAll('.fault-line');
    lines.forEach(function (line, i) {
      var length = line.getTotalLength ? line.getTotalLength() : 200;
      line.style.strokeDasharray = length;
      line.style.strokeDashoffset = length;
      anime({
        targets: line,
        strokeDashoffset: [length, 0],
        duration: 1000,
        delay: 200 + i * 150,
        easing: 'easeInOutQuad'
      });
    });
  }

  // Riverbed connector drawing for whiteboard
  function animateRiverbedPaths() {
    var paths = document.querySelectorAll('.riverbed-path');
    paths.forEach(function (path, i) {
      var length = path.getTotalLength();
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
      anime({
        targets: path,
        strokeDashoffset: [length, 0],
        duration: 1500,
        delay: 300 + i * 200,
        easing: 'easeInOutQuad'
      });
    });
  }

  // ==================================================================
  // NEW IDEA / ADD TASK BUTTON BEHAVIOR
  // ==================================================================
  function initActionButtons() {
    // "New Idea" button
    var ideaBtns = document.querySelectorAll('[data-page="ideas"] .btn-primary');
    ideaBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        showMicroFeedback('New idea form opened');
      });
    });

    // "Add Task Block" button
    var taskBtns = document.querySelectorAll('[data-page="kanban"] .btn-primary');
    taskBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        showMicroFeedback('New task created');
      });
    });

    // Workspace buttons
    var workspaceBtns = document.querySelectorAll('[data-page="project-workspace"] .btn');
    workspaceBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        showMicroFeedback('Action initiated');
      });
    });

    // Whiteboard buttons
    var wbBtns = document.querySelectorAll('[data-page="whiteboard"] .btn');
    wbBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        showMicroFeedback('Canvas updated');
      });
    });

    // Settings save
    var settingsBtns = document.querySelectorAll('[data-page="settings"] .btn-primary');
    settingsBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        showMicroFeedback('Configuration saved');
      });
    });
  }

  // ==================================================================
  // CLIFF NAV ITEMS (project-workspace sidebar)
  // ==================================================================
  function initCliffNav() {
    var cliffItems = document.querySelectorAll('.cliff-nav-item');
    cliffItems.forEach(function (item) {
      item.addEventListener('click', function () {
        cliffItems.forEach(function (ci) { ci.classList.remove('active'); });
        item.classList.add('active');
        showMicroFeedback('Section selected');
      });
    });
  }

  // ==================================================================
  // INITIALIZATION
  // ==================================================================
  function init() {
    initFromHash();
    dismissLoading();
    setupMobileMenu();
    initResizers();
    initTooltips();
    initToggleSwitches();
    initDirectoryTree();
    initChatInput();
    initSettings();
    initWhiteboard();
    initCliffNav();
    initActionButtons();

    // Delayed animation initialization
    setTimeout(function () {
      initKanbanSortable();
      animateBarCharts();
      animateFormationValues();
      animateTrailPath();
      animateFaultLines();
      animateRiverbedPaths();
    }, 1400);
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
