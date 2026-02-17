/* ============================================================
   IDEA-MANAGEMENT — Liquid Pass 8: Split-Pane Aquarium
   app.js — Navigation, interactions, and micro-feedback
   ============================================================ */

(function () {
  'use strict';

  // ---- DOM refs ----
  const toolbarNav = document.getElementById('toolbarNav');
  const toolbarBtns = toolbarNav.querySelectorAll('.toolbar-btn[data-view]');
  const views = document.querySelectorAll('.view[data-view]');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const successFlash = document.getElementById('successFlash');
  const settingsPaneTitle = document.getElementById('settingsPaneTitle');

  // Valid view IDs
  var validViews = [
    'dashboard', 'projects', 'project-workspace', 'kanban', 'whiteboard',
    'schema-planner', 'directory-tree', 'ideas', 'ai-chat', 'settings'
  ];

  // ---- State ----
  let currentView = 'dashboard';
  let mobileNavOpen = false;

  // ---- Navigation ----
  function navigateTo(target, skipHash) {
    if (!target || validViews.indexOf(target) === -1) return;
    if (target === currentView) return;

    // Show loading briefly
    showLoading();

    setTimeout(function () {
      // Deactivate current
      toolbarBtns.forEach(function (btn) { btn.classList.remove('active'); });
      views.forEach(function (v) { v.classList.remove('active'); });

      // Activate target nav button
      var btn = toolbarNav.querySelector('[data-view="' + target + '"]');
      if (btn) btn.classList.add('active');

      // Activate target view section
      var view = document.querySelector('section.view[data-view="' + target + '"]');
      if (view) {
        view.classList.add('active');
        // Trigger scroll-reveal animations on child elements
        animateScrollReveal(view);
      }

      currentView = target;

      // Update hash
      if (!skipHash) {
        location.hash = target;
      }

      hideLoading();

      // Close mobile nav
      if (mobileNavOpen) {
        toolbarNav.classList.remove('open');
        mobileNavOpen = false;
      }
    }, 220);
  }

  // Toolbar button clicks — wire on ALL [data-view] elements
  document.querySelectorAll('[data-view]').forEach(function (el) {
    // Skip section elements (they are pages, not nav)
    if (el.tagName === 'SECTION') return;
    el.addEventListener('click', function () {
      var target = el.getAttribute('data-view');
      if (target) navigateTo(target);
    });
  });

  // Mobile menu toggle
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function () {
      mobileNavOpen = !mobileNavOpen;
      toolbarNav.classList.toggle('open', mobileNavOpen);
    });
  }

  // Quick action navigation buttons (data-nav)
  document.querySelectorAll('[data-nav]').forEach(function (el) {
    el.addEventListener('click', function () {
      var target = el.getAttribute('data-nav');
      if (target) navigateTo(target);
    });
  });

  // ---- Hash Routing ----
  function handleHash() {
    var hash = location.hash.replace('#', '');
    if (hash && validViews.indexOf(hash) !== -1) {
      // Force navigation even if same as currentView on initial load
      currentView = '';
      navigateTo(hash, true);
    }
  }

  window.addEventListener('hashchange', handleHash);

  // On initial load, check for hash
  var initialHash = location.hash.replace('#', '');
  if (initialHash && validViews.indexOf(initialHash) !== -1) {
    // Remove active from dashboard, navigate to hash target
    currentView = '';
    navigateTo(initialHash, true);
  }

  // ---- Loading ----
  function showLoading() {
    loadingOverlay.classList.add('visible');
  }
  function hideLoading() {
    loadingOverlay.classList.remove('visible');
  }

  // ---- Success Flash ----
  function flashSuccess(msg) {
    if (msg) {
      successFlash.querySelector('span').textContent = msg;
    }
    successFlash.classList.add('visible');
    setTimeout(function () {
      successFlash.classList.remove('visible');
    }, 1800);
  }

  // ---- Scroll Reveal Animation ----
  function animateScrollReveal(container) {
    var items = container.querySelectorAll('.stat-card, .project-list-item, .kanban-card, .idea-item, .activity-item, .ws-overview-card, .integration-card, .chat-msg');
    items.forEach(function (item, i) {
      item.style.opacity = '0';
      item.style.transform = 'translateY(12px)';
      setTimeout(function () {
        item.style.transition = 'opacity 350ms ease, transform 350ms ease';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, 40 * i);
    });
  }

  // Initial reveal
  var activeView = document.querySelector('.view.active');
  if (activeView) {
    setTimeout(function () { animateScrollReveal(activeView); }, 100);
  }

  // ---- Button Ripple Effect ----
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.action-btn, .toolbar-btn');
    if (!btn) return;

    var rect = btn.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    var size = Math.max(rect.width, rect.height) * 0.8;

    var ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (x - size / 2) + 'px';
    ripple.style.top = (y - size / 2) + 'px';
    btn.appendChild(ripple);

    setTimeout(function () { ripple.remove(); }, 600);
  });

  // ---- Action Button Flash Feedback ----
  document.querySelectorAll('.action-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.classList.contains('primary')) {
        flashSuccess('Action completed');
      }
    });
  });

  // ---- Settings Tabs ----
  var settingsNavItems = document.querySelectorAll('.settings-nav-item');
  var settingsPanels = document.querySelectorAll('.settings-panel');
  var settingsTitles = {
    account: 'Account Settings',
    subscription: 'Subscription',
    preferences: 'Preferences',
    integrations: 'Integrations',
    data: 'Data Management'
  };

  settingsNavItems.forEach(function (item) {
    item.addEventListener('click', function () {
      var tab = item.getAttribute('data-settings-tab');
      if (!tab) return;

      settingsNavItems.forEach(function (n) { n.classList.remove('active'); });
      item.classList.add('active');

      settingsPanels.forEach(function (p) { p.classList.remove('active'); });
      var panel = document.querySelector('[data-settings-panel="' + tab + '"]');
      if (panel) {
        panel.classList.add('active');
        animateScrollReveal(panel);
      }

      if (settingsPaneTitle && settingsTitles[tab]) {
        settingsPaneTitle.textContent = settingsTitles[tab];
      }
    });
  });

  // ---- Priority Selector ----
  document.querySelectorAll('.priority-selector').forEach(function (sel) {
    var btns = sel.querySelectorAll('.pri-btn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
      });
    });
  });

  // ---- Project List Selection ----
  document.querySelectorAll('.project-list-item').forEach(function (item) {
    item.addEventListener('click', function () {
      document.querySelectorAll('.project-list-item').forEach(function (i) { i.classList.remove('selected'); });
      item.classList.add('selected');
    });
  });

  // ---- Entity List Selection ----
  document.querySelectorAll('.entity-list-item').forEach(function (item) {
    item.addEventListener('click', function () {
      document.querySelectorAll('.entity-list-item').forEach(function (i) { i.classList.remove('selected'); });
      item.classList.add('selected');
    });
  });

  // ---- Whiteboard Tool Selection ----
  document.querySelectorAll('.wb-tool').forEach(function (tool) {
    tool.addEventListener('click', function () {
      if (tool.title === 'Zoom In' || tool.title === 'Zoom Out') return;
      document.querySelectorAll('.wb-tool').forEach(function (t) {
        if (t.title !== 'Zoom In' && t.title !== 'Zoom Out') t.classList.remove('active');
      });
      tool.classList.add('active');
    });
  });

  // ---- Chat Send ----
  var chatInput = document.querySelector('.chat-input');
  var chatSendBtn = document.querySelector('.chat-send-btn');
  var chatMessages = document.getElementById('chatMessages');

  function sendChatMessage() {
    if (!chatInput || !chatMessages) return;
    var text = chatInput.value.trim();
    if (!text) return;

    // Add user message
    var msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg user-msg';
    msgDiv.innerHTML =
      '<div class="chat-avatar user-avatar">AT</div>' +
      '<div class="chat-bubble"><p>' + escapeHtml(text) + '</p></div>';
    chatMessages.appendChild(msgDiv);
    chatInput.value = '';

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Simulate AI response
    setTimeout(function () {
      var aiDiv = document.createElement('div');
      aiDiv.className = 'chat-msg ai-msg';
      aiDiv.innerHTML =
        '<div class="chat-avatar ai-avatar">AI</div>' +
        '<div class="chat-bubble"><p>I\'ve received your message and I\'m analyzing it in the context of your current project. Let me process this and provide recommendations.</p></div>';
      chatMessages.appendChild(aiDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      animateScrollReveal(chatMessages);
    }, 800);
  }

  if (chatSendBtn) {
    chatSendBtn.addEventListener('click', sendChatMessage);
  }
  if (chatInput) {
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- Directory Tree Toggle ----
  document.querySelectorAll('.dir-folder').forEach(function (folder) {
    folder.addEventListener('click', function () {
      folder.classList.toggle('open');
      var icon = folder.querySelector('.dir-icon');
      if (icon) {
        icon.textContent = folder.classList.contains('open') ? '\u25BE' : '\u25B6';
      }
    });
  });

  // ---- Pane Resize (Desktop) ----
  var dividers = document.querySelectorAll('.pane-divider');
  dividers.forEach(function (divider) {
    var isResizing = false;
    var startX = 0;
    var leftPane = null;
    var startWidth = 0;

    divider.addEventListener('mousedown', function (e) {
      leftPane = divider.previousElementSibling;
      if (!leftPane || !leftPane.classList.contains('pane')) return;

      isResizing = true;
      startX = e.clientX;
      startWidth = leftPane.getBoundingClientRect().width;

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
      if (!isResizing) return;
      var diff = e.clientX - startX;
      var newWidth = Math.max(150, Math.min(startWidth + diff, window.innerWidth - 200));
      leftPane.style.flex = '0 0 ' + newWidth + 'px';
      leftPane.style.maxWidth = newWidth + 'px';
    }

    function onMouseUp() {
      isResizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
  });

  // ---- Keyboard Navigation ----
  document.addEventListener('keydown', function (e) {
    // Alt + number for quick nav
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
      var viewMap = {
        '1': 'dashboard',
        '2': 'projects',
        '3': 'project-workspace',
        '4': 'kanban',
        '5': 'whiteboard',
        '6': 'schema-planner',
        '7': 'directory-tree',
        '8': 'ideas',
        '9': 'ai-chat',
        '0': 'settings'
      };
      if (viewMap[e.key]) {
        e.preventDefault();
        navigateTo(viewMap[e.key]);
      }
    }
  });

  // ---- Kanban Card Drag (Visual Feedback) ----
  document.querySelectorAll('.kanban-card').forEach(function (card) {
    card.setAttribute('draggable', 'true');

    card.addEventListener('dragstart', function (e) {
      card.style.opacity = '0.5';
      card.style.transform = 'rotate(2deg)';
      e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragend', function () {
      card.style.opacity = '';
      card.style.transform = '';
    });
  });

  document.querySelectorAll('.kanban-cards').forEach(function (column) {
    column.addEventListener('dragover', function (e) {
      e.preventDefault();
      column.style.background = 'rgba(0,229,204,.04)';
    });

    column.addEventListener('dragleave', function () {
      column.style.background = '';
    });

    column.addEventListener('drop', function (e) {
      e.preventDefault();
      column.style.background = '';
      flashSuccess('Card moved');
    });
  });

  // ---- Chat Session Selection ----
  document.querySelectorAll('.chat-session').forEach(function (session) {
    session.addEventListener('click', function () {
      document.querySelectorAll('.chat-session').forEach(function (s) { s.classList.remove('active'); });
      session.classList.add('active');
    });
  });

  // ---- Workspace Nav Item Clicks ----
  document.querySelectorAll('.ws-nav-item[data-nav]').forEach(function (item) {
    item.addEventListener('click', function () {
      var target = item.getAttribute('data-nav');
      if (target) navigateTo(target);
    });
  });

  // ---- Tag Removal ----
  document.querySelectorAll('.tag-remove').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var tag = btn.closest('.tag');
      if (tag) tag.remove();
    });
  });

  // ---- Ideas Form Tag Add ----
  var tagInput = document.querySelector('.tag-input');
  if (tagInput) {
    tagInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var val = tagInput.value.trim();
        if (!val) return;
        var tagSpan = document.createElement('span');
        tagSpan.className = 'tag removable';
        tagSpan.textContent = val + ' ';
        var removeBtn = document.createElement('button');
        removeBtn.className = 'tag-remove';
        removeBtn.innerHTML = '&times;';
        removeBtn.addEventListener('click', function () { tagSpan.remove(); });
        tagSpan.appendChild(removeBtn);
        tagInput.parentNode.insertBefore(tagSpan, tagInput);
        tagInput.value = '';
      }
    });
  }

})();
