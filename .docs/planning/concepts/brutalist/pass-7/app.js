/* ============================================================
   IDEA-MANAGEMENT // BRUTALIST PASS 7
   PUNCHED-CARD-DATA-WALL
   Navigation, interactions, and system logic
   ============================================================ */

(function () {
  'use strict';

  // ── VIEW ORDERING (for slide direction) ──
  const VIEW_ORDER = [
    'dashboard', 'projects', 'workspace', 'kanban',
    'whiteboard', 'schema', 'directory', 'ideas', 'chat', 'settings'
  ];

  // ── STATE ──
  let currentView = 'dashboard';
  let currentSettingsPane = 'account';

  // ── DOM CACHE ──
  const tabs = document.querySelectorAll('.tab-strip__tabs .tab');
  const panels = document.querySelectorAll('.panel');
  const settingsTabs = document.querySelectorAll('.settings-tab');
  const settingsPanes = document.querySelectorAll('.settings-pane');
  const clockEl = document.getElementById('sysClock');
  const sessionTimeEl = document.getElementById('sessionTime');

  // ── SYSTEM CLOCK ──
  function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    if (clockEl) clockEl.textContent = h + ':' + m + ':' + s;
  }

  function updateSessionTime() {
    const now = new Date();
    const y = now.getFullYear();
    const mo = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    if (sessionTimeEl) sessionTimeEl.textContent = y + '-' + mo + '-' + d + ' ' + h + ':' + mi + ':' + s;
  }

  updateClock();
  updateSessionTime();
  setInterval(updateClock, 1000);

  // ── NAVIGATION: TAB SWITCHING WITH HORIZONTAL SLIDE ──
  function navigateTo(viewId) {
    if (viewId === currentView) return;

    const oldIndex = VIEW_ORDER.indexOf(currentView);
    const newIndex = VIEW_ORDER.indexOf(viewId);
    const goingRight = newIndex > oldIndex;

    const currentPanel = document.querySelector('.panel[data-page="' + currentView + '"]');
    const nextPanel = document.querySelector('.panel[data-page="' + viewId + '"]');

    if (!currentPanel || !nextPanel) return;

    // Update tab states
    tabs.forEach(function (tab) {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
    });
    const activeTab = document.querySelector('.tab[data-view="' + viewId + '"]');
    if (activeTab) {
      activeTab.classList.add('active');
      activeTab.setAttribute('aria-selected', 'true');
    }

    // Slide animation
    var outClass = goingRight ? 'slide-out-left' : 'slide-out-right';
    var inClass = goingRight ? 'slide-in-right' : 'slide-in-left';

    currentPanel.classList.remove('active');
    currentPanel.classList.add(outClass);

    nextPanel.classList.remove('active');
    nextPanel.classList.add(inClass);

    // After animation ends, clean up
    setTimeout(function () {
      currentPanel.classList.remove(outClass);
      currentPanel.style.display = 'none';

      nextPanel.classList.remove(inClass);
      nextPanel.classList.add('active');

      currentView = viewId;
    }, 200);
  }

  // Tab click listeners
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var viewId = this.getAttribute('data-view');
      navigateTo(viewId);
    });
  });

  // Quick action buttons that navigate
  document.querySelectorAll('.action-btn[data-view]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var viewId = this.getAttribute('data-view');
      navigateTo(viewId);
    });
  });

  // Breadcrumb navigation
  document.querySelectorAll('.crumb[data-view]').forEach(function (crumb) {
    crumb.addEventListener('click', function () {
      var viewId = this.getAttribute('data-view');
      navigateTo(viewId);
    });
  });

  // ── SETTINGS: SUB-TAB NAVIGATION ──
  settingsTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var paneId = this.getAttribute('data-settings');
      if (paneId === currentSettingsPane) return;

      settingsTabs.forEach(function (t) { t.classList.remove('active'); });
      this.classList.add('active');

      settingsPanes.forEach(function (pane) { pane.classList.remove('active'); });
      var targetPane = document.querySelector('.settings-pane[data-settings-pane="' + paneId + '"]');
      if (targetPane) targetPane.classList.add('active');

      currentSettingsPane = paneId;
    });
  });

  // ── BUTTON CLICK FLASH (border accent for 100ms) ──
  function flashBorder(el) {
    var original = el.style.borderColor;
    el.style.borderColor = '#cc4400';
    setTimeout(function () {
      el.style.borderColor = original;
    }, 100);
  }

  document.querySelectorAll('.action-btn, .card-action, .filter-btn, .plan-btn, .wb-tool').forEach(function (btn) {
    btn.addEventListener('click', function () {
      flashBorder(this);
    });
  });

  // ── FILTER BUTTON TOGGLE ──
  document.querySelectorAll('.toolbar__filters').forEach(function (group) {
    var buttons = group.querySelectorAll('.filter-btn');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
      });
    });
  });

  // ── TOGGLE SWITCHES (Binary 0/1) ──
  document.querySelectorAll('.toggle-switch').forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      var isActive = this.classList.toggle('active');
      var valEl = this.querySelector('.toggle-val');
      if (valEl) {
        valEl.textContent = isActive ? '1' : '0';
      }
      this.setAttribute('data-state', isActive ? '1' : '0');
    });
  });

  // ── WHITEBOARD TOOL SELECTION ──
  var wbTools = document.querySelectorAll('.wb-tool-group:first-child .wb-tool');
  wbTools.forEach(function (tool) {
    tool.addEventListener('click', function () {
      wbTools.forEach(function (t) { t.classList.remove('active'); });
      this.classList.add('active');
    });
  });

  // ── CARD HOVER: 1px right shift with hard shadow ──
  // Handled via CSS :hover, but we add the interaction reference here
  // for accessibility
  document.querySelectorAll('.punch-card').forEach(function (card) {
    card.setAttribute('tabindex', '0');
  });

  // ── INPUT FOCUS: Already handled in CSS with 3px border ──

  // ── PROMOTE TO KANBAN BUTTON ──
  document.querySelectorAll('.promote-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var ideaCard = this.closest('.idea-card');
      if (ideaCard) {
        ideaCard.classList.add('promoted');
        this.textContent = 'PROMOTED';
        this.disabled = true;

        // Flash feedback
        var title = ideaCard.querySelector('.punch-label');
        if (title) {
          title.classList.add('flash-feedback');
          setTimeout(function () {
            title.classList.remove('flash-feedback');
          }, 150);
        }

        // Update footer meta
        var meta = ideaCard.querySelector('.punch-meta');
        if (meta) {
          var ref = ideaCard.querySelector('.punch-ref');
          meta.textContent = 'STATUS: PROMOTED -> KBN-' + (Math.floor(Math.random() * 90) + 10);
        }
      }
    });
  });

  // ── FOLDER NAV ACTIVE STATE ──
  document.querySelectorAll('.folder-item').forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.stopPropagation();
      document.querySelectorAll('.folder-item').forEach(function (fi) { fi.classList.remove('active'); });
      this.classList.add('active');
    });
  });

  // ── CHAT INPUT (simulated response) ──
  var chatInput = document.querySelector('.chat-input');
  var chatSendBtn = document.querySelector('.chat-input-area .action-btn');
  var chatMessages = document.querySelector('.chat-messages');

  function addChatMessage(sender, body, type) {
    var msgNum = chatMessages.querySelectorAll('.chat-msg').length;
    var now = new Date();
    var time = String(now.getHours()).padStart(2, '0') + ':' +
               String(now.getMinutes()).padStart(2, '0') + ':' +
               String(now.getSeconds()).padStart(2, '0');

    var msg = document.createElement('div');
    msg.className = 'chat-msg ' + type;
    msg.innerHTML =
      '<div class="msg-header">' +
        '<span class="msg-ref">MSG-' + String(msgNum).padStart(3, '0') + '</span>' +
        '<span class="msg-sender">' + sender + '</span>' +
        '<span class="msg-time">' + time + '</span>' +
      '</div>' +
      '<div class="msg-body">' + body + '</div>';

    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function handleChatSend() {
    if (!chatInput) return;
    var text = chatInput.value.trim();
    if (!text) return;

    addChatMessage('OPR::ADMIN', text, 'user');
    chatInput.value = '';

    // Simulate AI response after 600ms
    setTimeout(function () {
      var responses = [
        'I\'ve processed your request. The system registers confirm the operation. Would you like to proceed with additional actions?',
        'Query acknowledged. Scanning the project registry for matching entries. 3 results found in the active dataset.',
        'Operation logged to AuditLog. The changes will propagate across all connected views. Refresh any open panels to see updates.',
        'Understood. I can help with that. Let me cross-reference the kanban board and idea registry for relevant entries.',
        'Request received. Processing through the data pipeline. All subsystems reporting nominal status for this operation.'
      ];
      var response = responses[Math.floor(Math.random() * responses.length)];
      addChatMessage('AI::ASSISTANT', response, 'assistant');
    }, 600);
  }

  if (chatSendBtn) {
    chatSendBtn.addEventListener('click', handleChatSend);
  }

  if (chatInput) {
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleChatSend();
      }
    });
  }

  // ── KEYBOARD NAVIGATION ──
  document.addEventListener('keydown', function (e) {
    // Alt + number keys for tab switching
    if (e.altKey && !e.ctrlKey && !e.shiftKey) {
      var num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        e.preventDefault();
        navigateTo(VIEW_ORDER[num - 1]);
      } else if (e.key === '0') {
        e.preventDefault();
        navigateTo(VIEW_ORDER[9]); // settings
      }
    }
  });

  // ── TOOLTIP SYSTEM (monospace reference boxes) ──
  var tooltip = document.createElement('div');
  tooltip.className = 'sys-tooltip';
  tooltip.style.cssText =
    'position:fixed;' +
    'display:none;' +
    'background:#2a2a2a;' +
    'color:#f0ece4;' +
    'font-family:"Fira Code","SF Mono",monospace;' +
    'font-size:0.65rem;' +
    'padding:4px 8px;' +
    'border:1px solid #cc4400;' +
    'z-index:10000;' +
    'pointer-events:none;' +
    'letter-spacing:0.5px;' +
    'max-width:240px;' +
    'white-space:nowrap;';
  document.body.appendChild(tooltip);

  document.querySelectorAll('[title]').forEach(function (el) {
    var titleText = el.getAttribute('title');
    el.removeAttribute('title');
    el.setAttribute('data-tooltip', titleText);

    el.addEventListener('mouseenter', function (e) {
      tooltip.textContent = 'REF:: ' + this.getAttribute('data-tooltip');
      tooltip.style.display = 'block';
      var rect = this.getBoundingClientRect();
      tooltip.style.left = rect.left + 'px';
      tooltip.style.top = (rect.bottom + 4) + 'px';
    });

    el.addEventListener('mouseleave', function () {
      tooltip.style.display = 'none';
    });
  });

  // ── INITIAL STATE ──
  // Ensure only dashboard is visible on load
  panels.forEach(function (panel) {
    if (panel.getAttribute('data-page') === 'dashboard') {
      panel.classList.add('active');
      panel.style.display = 'block';
    } else {
      panel.classList.remove('active');
      panel.style.display = 'none';
    }
  });

})();
