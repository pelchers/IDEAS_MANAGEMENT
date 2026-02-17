/* ================================================================
   SLATE PASS 8 — TERMINAL MINE SHAFT
   App logic: Navigation, keyboard shortcuts, interactions,
   typewriter cascade, terminal behaviors
   ================================================================ */

(function () {
  'use strict';

  // ---- STATE ----
  const state = {
    currentView: 'dashboard',
    views: [
      'dashboard', 'projects', 'project-workspace', 'kanban',
      'whiteboard', 'schema-planner', 'directory-tree',
      'ideas', 'ai-chat', 'settings'
    ],
    shortcutMap: {
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
    }
  };

  // ---- DOM REFERENCES ----
  const terminalOutput = document.getElementById('terminal-output');
  const statusMessage = document.getElementById('status-message');
  const clockEl = document.getElementById('clock');
  const idleCursor = document.getElementById('idle-cursor');
  const navButtons = document.querySelectorAll('.cmd-key[data-view]');

  // ---- NAVIGATION ----
  function navigateTo(viewId) {
    if (viewId === state.currentView) return;
    if (!state.views.includes(viewId)) return;

    const oldPanel = document.querySelector('.view-panel[data-page="' + state.currentView + '"]');
    const newPanel = document.querySelector('.view-panel[data-page="' + viewId + '"]');
    if (!oldPanel || !newPanel) return;

    // Update state
    state.currentView = viewId;

    // Update nav buttons
    navButtons.forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-view') === viewId);
    });

    // Transition: old scrolls up, new types in
    oldPanel.style.display = 'none';
    newPanel.style.display = 'block';

    // Reset scroll
    terminalOutput.scrollTop = 0;

    // Typewriter cascade effect on child elements
    typewriterCascade(newPanel);

    // Update hash
    window.location.hash = '#' + viewId;

    // Update status
    var viewLabel = viewId.replace(/-/g, ' ').toUpperCase();
    setStatus('NAVIGATED TO ' + viewLabel);

    // Flash the idle cursor
    idleCursor.classList.remove('blink');
    void idleCursor.offsetWidth;
    idleCursor.classList.add('blink');
  }

  function typewriterCascade(panel) {
    // Get direct children of the output-block
    var outputBlock = panel.querySelector('.output-block');
    if (!outputBlock) return;

    var children = outputBlock.children;
    var delay = 0;
    var increment = 30; // ms between each child appearing

    for (var i = 0; i < children.length; i++) {
      (function (el, d) {
        el.style.opacity = '0';
        el.style.transform = 'translateX(-4px)';
        setTimeout(function () {
          el.style.transition = 'opacity 0.12s ease-out, transform 0.12s ease-out';
          el.style.opacity = '1';
          el.style.transform = 'translateX(0)';
        }, d);
      })(children[i], delay);
      delay += increment;
    }
  }

  // ---- STATUS BAR ----
  function setStatus(msg) {
    statusMessage.textContent = msg;
    statusMessage.style.color = '#d4943a';
    setTimeout(function () {
      statusMessage.textContent = 'READY';
      statusMessage.style.color = '';
    }, 2000);
  }

  // ---- CLOCK ----
  function updateClock() {
    var now = new Date();
    var h = String(now.getUTCHours()).padStart(2, '0');
    var m = String(now.getUTCMinutes()).padStart(2, '0');
    var s = String(now.getUTCSeconds()).padStart(2, '0');
    clockEl.textContent = h + ':' + m + ':' + s;
  }

  setInterval(updateClock, 1000);
  updateClock();

  // ---- KEYBOARD NAVIGATION ----
  document.addEventListener('keydown', function (e) {
    // Don't capture when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    var key = e.key;

    // Number keys for navigation
    if (state.shortcutMap[key]) {
      e.preventDefault();
      navigateTo(state.shortcutMap[key]);
      return;
    }
  });

  // ---- CLICK NAVIGATION ----
  navButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var viewId = this.getAttribute('data-view');
      navigateTo(viewId);
      sparkEffect(this);
    });
  });

  // ---- SPARK EFFECT ON BUTTONS ----
  function sparkEffect(el) {
    el.classList.add('spark');
    setTimeout(function () {
      el.classList.remove('spark');
    }, 150);
  }

  // All terminal buttons get spark effect
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.terminal-btn');
    if (btn) {
      sparkEffect(btn);

      // Micro-feedback
      var actionFeedback = document.createElement('span');
      actionFeedback.className = 'micro-ok';
      actionFeedback.textContent = ' [OK]';
      actionFeedback.style.transition = 'opacity 0.3s';
      btn.parentNode.insertBefore(actionFeedback, btn.nextSibling);
      setTimeout(function () {
        actionFeedback.style.opacity = '0';
        setTimeout(function () {
          if (actionFeedback.parentNode) {
            actionFeedback.parentNode.removeChild(actionFeedback);
          }
        }, 300);
      }, 1200);
    }
  });

  // ---- DIRECTORY TREE EXPAND/COLLAPSE ----
  document.querySelectorAll('.expandable').forEach(function (el) {
    el.addEventListener('click', function () {
      var targetId = this.getAttribute('data-expand');
      var target = document.getElementById(targetId);
      if (!target) return;

      var hint = this.querySelector('.expand-hint');
      if (target.style.display === 'none') {
        target.style.display = 'block';
        if (hint) hint.textContent = '[-]';
        setStatus('EXPANDED: ' + targetId.toUpperCase());
      } else {
        target.style.display = 'none';
        if (hint) hint.textContent = '[+]';
        setStatus('COLLAPSED: ' + targetId.toUpperCase());
      }
    });
  });

  // ---- PRIORITY BUTTON TOGGLE ----
  document.querySelectorAll('.priority-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.priority-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      this.classList.add('active');
    });
  });

  // ---- SETTINGS TOGGLE TEXT ----
  document.querySelectorAll('.setting-toggle-text').forEach(function (el) {
    el.addEventListener('click', function () {
      if (this.textContent.trim() === '[ON]') {
        this.textContent = '[OFF]';
        this.classList.remove('accent2');
        this.classList.add('dim');
      } else {
        this.textContent = '[ON]';
        this.classList.remove('dim');
        this.classList.add('accent2');
      }
      sparkEffect(this);
    });
  });

  // ---- THEME TOGGLE ----
  document.querySelectorAll('.toggle-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var siblings = this.parentNode.querySelectorAll('.toggle-btn');
      siblings.forEach(function (s) { s.classList.remove('active'); });
      this.classList.add('active');
    });
  });

  // ---- WHITEBOARD TOOL TOGGLE ----
  document.querySelectorAll('.wb-toolbar .terminal-btn.small').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var siblings = this.parentNode.querySelectorAll('.terminal-btn.small');
      siblings.forEach(function (s) { s.classList.remove('active'); });
      this.classList.add('active');
    });
  });

  // ---- WORKSPACE NAV TOGGLE ----
  document.querySelectorAll('.tree-item').forEach(function (item) {
    item.addEventListener('click', function () {
      var siblings = this.parentNode.querySelectorAll('.tree-item');
      siblings.forEach(function (s) { s.classList.remove('active'); });
      this.classList.add('active');

      // Update the tree icon
      siblings.forEach(function (s) {
        var icon = s.querySelector('.tree-icon');
        if (icon) icon.textContent = '[.]';
      });
      var activeIcon = this.querySelector('.tree-icon');
      if (activeIcon) activeIcon.textContent = '[>]';
    });
  });

  // ---- PROJECT ROW CLICK ----
  document.querySelectorAll('.table-row[data-project]').forEach(function (row) {
    row.addEventListener('click', function () {
      navigateTo('project-workspace');
    });
  });

  // ---- PROJECT SEARCH FILTER ----
  var projectSearch = document.getElementById('project-search');
  if (projectSearch) {
    projectSearch.addEventListener('input', function () {
      var query = this.value.toLowerCase();
      document.querySelectorAll('.table-row[data-project]').forEach(function (row) {
        var name = row.querySelector('.col-name');
        if (name) {
          var text = name.textContent.toLowerCase();
          row.style.display = text.includes(query) ? '' : 'none';
        }
      });
    });
  }

  // ---- AI CHAT SEND ----
  var chatInput = document.getElementById('chat-input');
  if (chatInput) {
    var chatForm = chatInput.closest('.chat-input-area');
    var chatLog = document.querySelector('.chat-log');

    function sendChat() {
      var msg = chatInput.value.trim();
      if (!msg) return;

      // Add user message
      var userMsg = document.createElement('div');
      userMsg.className = 'chat-message user';
      var now = new Date();
      var ts = String(now.getUTCHours()).padStart(2, '0') + ':' +
               String(now.getUTCMinutes()).padStart(2, '0') + ':' +
               String(now.getUTCSeconds()).padStart(2, '0');
      userMsg.innerHTML = '<div class="chat-sender">[FOREMAN] <span class="timestamp">' + ts + '</span></div>' +
                          '<div class="chat-text">' + escapeHtml(msg) + '</div>';
      chatLog.appendChild(userMsg);

      chatInput.value = '';

      // Simulate AI response after short delay
      setTimeout(function () {
        var aiMsg = document.createElement('div');
        aiMsg.className = 'chat-message ai';
        var aiTs = String(now.getUTCHours()).padStart(2, '0') + ':' +
                   String(now.getUTCMinutes()).padStart(2, '0') + ':' +
                   String(now.getUTCSeconds() + 2).padStart(2, '0');
        aiMsg.innerHTML = '<div class="chat-sender accent2">[AI-ASSIST] <span class="timestamp">' + aiTs + '</span></div>' +
                          '<div class="chat-text">Acknowledged. Processing your request...\n<span class="micro-ok">[OK]</span> Command received. I can help with that. What else do you need, Foreman?</div>';
        chatLog.appendChild(aiMsg);

        // Scroll to bottom
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
      }, 800);

      // Scroll to bottom
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
      setStatus('MESSAGE SENT');
    }

    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendChat();
      }
    });

    // Send button
    var sendBtn = chatForm ? chatForm.querySelector('.terminal-btn') : null;
    if (sendBtn) {
      sendBtn.addEventListener('click', function (e) {
        e.preventDefault();
        sendChat();
      });
    }
  }

  // ---- IDEA SUBMISSION ----
  var ideaForm = document.querySelector('.capture-form');
  if (ideaForm) {
    var submitBtn = ideaForm.querySelector('.terminal-btn');
    var clearBtn = ideaForm.querySelectorAll('.terminal-btn')[1];

    if (submitBtn) {
      submitBtn.addEventListener('click', function () {
        var title = document.getElementById('idea-title');
        var desc = document.getElementById('idea-desc');
        var tags = document.getElementById('idea-tags');

        if (title && title.value.trim()) {
          // Get active priority
          var activePriority = ideaForm.querySelector('.priority-btn.active');
          var priorityText = activePriority ? activePriority.getAttribute('data-priority').toUpperCase() : 'MED';

          // Add to idea list
          var ideaList = document.querySelector('.idea-list');
          if (ideaList) {
            var newEntry = document.createElement('div');
            newEntry.className = 'idea-entry';
            var priorityClass = 'priority-' + (activePriority ? activePriority.getAttribute('data-priority') : 'med');
            newEntry.innerHTML = '<span class="idea-id dim">IDX-NEW</span>' +
                                 '<span class="' + priorityClass + '">' + priorityText + '</span>' +
                                 '<span class="idea-title accent">' + escapeHtml(title.value.trim()) + '</span>' +
                                 '<span class="idea-tags dim">' + (tags && tags.value ? '[' + tags.value.split(',').map(function(t){return t.trim();}).join('] [') + ']' : '') + '</span>' +
                                 '<span class="idea-status accent2">[ACTIVE]</span>';
            ideaList.insertBefore(newEntry, ideaList.firstChild);
          }

          // Clear form
          if (title) title.value = '';
          if (desc) desc.value = '';
          if (tags) tags.value = '';

          setStatus('IDEA LOGGED');
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        var title = document.getElementById('idea-title');
        var desc = document.getElementById('idea-desc');
        var tags = document.getElementById('idea-tags');
        if (title) title.value = '';
        if (desc) desc.value = '';
        if (tags) tags.value = '';
        setStatus('FORM CLEARED');
      });
    }
  }

  // ---- QUICK ACTIONS ----
  document.querySelectorAll('.terminal-btn[data-action]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var action = this.getAttribute('data-action');
      switch (action) {
        case 'new-project':
          navigateTo('projects');
          break;
        case 'new-idea':
          navigateTo('ideas');
          break;
        case 'open-chat':
          navigateTo('ai-chat');
          break;
        case 'view-kanban':
          navigateTo('kanban');
          break;
      }
    });
  });

  // ---- INPUT FOCUS STYLE (command prompt cursor) ----
  document.querySelectorAll('.terminal-input').forEach(function (input) {
    input.addEventListener('focus', function () {
      // Add a prompt marker if not already present
      var parent = this.parentNode;
      if (!parent.querySelector('.focus-prompt')) {
        this.style.borderBottomColor = 'var(--accent)';
      }
    });

    input.addEventListener('blur', function () {
      this.style.borderBottomColor = '';
    });
  });

  // ---- ESCAPE HTML ----
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ---- INITIAL TYPEWRITER CASCADE ON DASHBOARD ----
  var dashboardPanel = document.querySelector('.view-panel[data-page="dashboard"]');
  if (dashboardPanel) {
    typewriterCascade(dashboardPanel);
  }

  // ---- STAT BAR ANIMATION ON LOAD ----
  setTimeout(function () {
    document.querySelectorAll('.stat-fill').forEach(function (fill) {
      var width = fill.style.width;
      fill.style.width = '0';
      setTimeout(function () {
        fill.style.width = width;
      }, 100);
    });
  }, 200);

  // ---- NAV ITEM HOVER: KEY BADGE AMBER GLOW ----
  navButtons.forEach(function (btn) {
    btn.addEventListener('mouseenter', function () {
      var badge = this.querySelector('.key-badge');
      if (badge && !this.classList.contains('active')) {
        badge.style.boxShadow = '0 0 6px rgba(212, 148, 58, 0.5)';
      }
    });
    btn.addEventListener('mouseleave', function () {
      var badge = this.querySelector('.key-badge');
      if (badge) {
        badge.style.boxShadow = '';
      }
    });
  });

  // ---- KANBAN CARD HOVER: AMBER BORDER ILLUMINATE ----
  document.querySelectorAll('.kanban-card').forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      this.style.boxShadow = '0 0 8px rgba(212, 148, 58, 0.15)';
    });
    card.addEventListener('mouseleave', function () {
      this.style.boxShadow = '';
    });
  });

  // ---- HASH ROUTING ----
  function handleHash() {
    var hash = window.location.hash.replace('#', '');
    if (hash && state.views.includes(hash) && hash !== state.currentView) {
      navigateTo(hash);
    }
  }

  window.addEventListener('hashchange', handleHash);
  handleHash();

})();
