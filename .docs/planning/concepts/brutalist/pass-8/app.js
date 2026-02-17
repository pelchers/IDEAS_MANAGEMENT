/* ==============================================
   BRUTALIST PASS-8 — GRID TILE SURVEILLANCE
   app.js — Navigation, interactions, clock
   ============================================== */

(function () {
  'use strict';

  // --- CONSTANTS ---
  const VIEWS = [
    'dashboard', 'projects', 'project-workspace', 'kanban',
    'whiteboard', 'schema-planner', 'directory-tree',
    'ideas', 'ai-chat', 'settings'
  ];

  // --- DOM CACHE ---
  const navButtons = document.querySelectorAll('.sv-nav-icon[data-view]');
  const viewSections = document.querySelectorAll('.sv-view[data-page]');
  const clockEl = document.getElementById('sv-clock');

  // --- STATE ---
  let currentView = 'dashboard';

  // ============================================
  // NAVIGATION
  // ============================================
  function navigateTo(viewId) {
    if (!VIEWS.includes(viewId)) return;
    currentView = viewId;

    // Update nav icons
    navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewId);
    });

    // Update view sections with boot-up animation
    viewSections.forEach(section => {
      const isTarget = section.dataset.page === viewId;
      section.classList.toggle('sv-view--active', isTarget);

      if (isTarget) {
        section.classList.add('sv-view--entering');
        const tiles = section.querySelectorAll('.sv-tile, .sv-kanban-col, .sv-chat-msg');
        tiles.forEach((tile, i) => {
          tile.style.setProperty('--tile-index', i);
          tile.classList.remove('sv-tile--booting');
          // Force reflow
          void tile.offsetWidth;
          tile.classList.add('sv-tile--booting');
        });
        // Clean up entering class
        setTimeout(() => {
          section.classList.remove('sv-view--entering');
        }, tiles.length * 40 + 300);
      }
    });

    // Update hash
    window.location.hash = viewId;
  }

  // Nav button clicks
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      navigateTo(btn.dataset.view);
    });
  });

  // Hash routing
  function handleHash() {
    const hash = window.location.hash.replace('#', '');
    if (VIEWS.includes(hash)) {
      navigateTo(hash);
    }
  }

  window.addEventListener('hashchange', handleHash);

  // Quick action buttons (dashboard)
  document.querySelectorAll('.sv-action-btn[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
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
      // Red flash micro-feedback
      flashTile(btn.closest('.sv-tile'));
    });
  });

  // ============================================
  // CLOCK
  // ============================================
  function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = h + ':' + m + ':' + s;
  }

  setInterval(updateClock, 1000);
  updateClock();

  // ============================================
  // BUTTON INTERACTIONS
  // ============================================

  // Button hover: border thickens (handled in CSS)
  // Button click: tile briefly pulses red accent
  document.querySelectorAll('.sv-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tile = btn.closest('.sv-tile');
      if (tile) flashTile(tile);
    });
  });

  function flashTile(tile) {
    if (!tile) return;
    tile.classList.remove('sv-tile--flash');
    void tile.offsetWidth;
    tile.classList.add('sv-tile--flash');
    tile.addEventListener('animationend', () => {
      tile.classList.remove('sv-tile--flash');
    }, { once: true });
  }

  // ============================================
  // TOGGLE SWITCHES
  // ============================================
  document.querySelectorAll('.sv-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const state = toggle.dataset.state;
      toggle.dataset.state = state === 'on' ? 'off' : 'on';
      // LED indicator feedback — dot changes via CSS
    });
  });

  // ============================================
  // DIRECTORY TREE TOGGLE
  // ============================================
  document.querySelectorAll('.sv-tree-toggle').forEach(toggleBtn => {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const node = toggleBtn.closest('.sv-tree-node');
      if (!node) return;

      const isExpanded = node.dataset.expanded === 'true';
      node.dataset.expanded = isExpanded ? 'false' : 'true';
      toggleBtn.innerHTML = isExpanded ? '[+]' : '[&minus;]';

      // Toggle next sibling tree-children
      const nextSibling = node.nextElementSibling;
      if (nextSibling && nextSibling.classList.contains('sv-tree-children')) {
        nextSibling.style.display = isExpanded ? 'none' : 'block';
      }
    });
  });

  // Hide collapsed tree children on init
  document.querySelectorAll('.sv-tree-node[data-expanded="false"]').forEach(node => {
    const nextSibling = node.nextElementSibling;
    if (nextSibling && nextSibling.classList.contains('sv-tree-children')) {
      nextSibling.style.display = 'none';
    }
  });

  // ============================================
  // KANBAN DRAG & DROP
  // ============================================
  let draggedCard = null;

  document.querySelectorAll('.sv-kanban-card[draggable="true"]').forEach(card => {
    card.addEventListener('dragstart', (e) => {
      draggedCard = card;
      card.style.opacity = '0.5';
      e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragend', () => {
      card.style.opacity = '1';
      draggedCard = null;
      // Remove all drop indicators
      document.querySelectorAll('.sv-kanban-col__cards').forEach(col => {
        col.style.outline = 'none';
      });
    });
  });

  document.querySelectorAll('.sv-kanban-col__cards').forEach(colCards => {
    colCards.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      colCards.style.outline = '2px solid var(--accent)';
    });

    colCards.addEventListener('dragleave', () => {
      colCards.style.outline = 'none';
    });

    colCards.addEventListener('drop', (e) => {
      e.preventDefault();
      colCards.style.outline = 'none';
      if (draggedCard) {
        colCards.appendChild(draggedCard);
        // Update column counts
        updateKanbanCounts();
        // Flash the receiving tile
        flashTile(colCards.closest('.sv-kanban-col'));
      }
    });
  });

  function updateKanbanCounts() {
    document.querySelectorAll('.sv-kanban-col').forEach(col => {
      const count = col.querySelectorAll('.sv-kanban-card').length;
      const countEl = col.querySelector('.sv-kanban-col__count');
      if (countEl) countEl.textContent = count;
    });
  }

  // ============================================
  // PROMOTE TO CARD (Ideas)
  // ============================================
  document.querySelectorAll('.sv-idea-actions .sv-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tile = btn.closest('.sv-tile--idea');
      if (!tile) return;

      // Visual feedback
      btn.textContent = 'PROMOTED';
      btn.classList.add('sv-action-btn--disabled');
      btn.disabled = true;
      tile.style.opacity = '0.5';
      flashTile(tile);
    });
  });

  // ============================================
  // CHAT SEND
  // ============================================
  const chatInput = document.querySelector('.sv-chat-input');
  const chatSendBtn = document.querySelector('.sv-chat-input-bar .sv-action-btn--primary');
  const chatFeed = document.querySelector('.sv-chat-feed');

  function sendChatMessage() {
    if (!chatInput || !chatFeed) return;
    const msg = chatInput.value.trim();
    if (!msg) return;

    const now = new Date();
    const ts = String(now.getHours()).padStart(2, '0') + ':' +
               String(now.getMinutes()).padStart(2, '0') + ':' +
               String(now.getSeconds()).padStart(2, '0');

    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'sv-chat-msg sv-chat-msg--user';
    userMsg.innerHTML = `
      <div class="sv-chat-msg__header">
        <span class="sv-chat-msg__sender">OPERATOR</span>
        <span class="sv-chat-msg__ts">${ts}</span>
      </div>
      <div class="sv-chat-msg__body">${escapeHtml(msg)}</div>
    `;
    chatFeed.appendChild(userMsg);

    chatInput.value = '';

    // Simulate AI response after delay
    setTimeout(() => {
      const aiMsg = document.createElement('div');
      aiMsg.className = 'sv-chat-msg sv-chat-msg--ai';
      const aiTs = String(now.getHours()).padStart(2, '0') + ':' +
                   String(now.getMinutes()).padStart(2, '0') + ':' +
                   String(Math.min(59, now.getSeconds() + 2)).padStart(2, '0');
      aiMsg.innerHTML = `
        <div class="sv-chat-msg__header">
          <span class="sv-chat-msg__sender">AI CTRL</span>
          <span class="sv-chat-msg__ts">${aiTs}</span>
        </div>
        <div class="sv-chat-msg__body">Command acknowledged. Processing request: "${escapeHtml(msg)}".\nStandby for results.</div>
      `;
      chatFeed.appendChild(aiMsg);
      chatFeed.scrollTop = chatFeed.scrollHeight;
    }, 800);

    chatFeed.scrollTop = chatFeed.scrollHeight;
  }

  if (chatSendBtn) {
    chatSendBtn.addEventListener('click', sendChatMessage);
  }
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }

  // ============================================
  // SEARCH FILTER (Projects)
  // ============================================
  const searchInput = document.querySelector('.sv-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      document.querySelectorAll('.sv-tile--project').forEach(tile => {
        const name = tile.querySelector('.sv-tile__project-name');
        const desc = tile.querySelector('.sv-tile__project-desc');
        const text = (name ? name.textContent : '') + ' ' + (desc ? desc.textContent : '');
        tile.style.display = text.toLowerCase().includes(query) ? '' : 'none';
      });
    });
  }

  // ============================================
  // WHITEBOARD TOOL SELECTION
  // ============================================
  document.querySelectorAll('.sv-wb-tool').forEach(tool => {
    tool.addEventListener('click', () => {
      document.querySelectorAll('.sv-wb-tool').forEach(t => t.classList.remove('sv-wb-tool--active'));
      tool.classList.add('sv-wb-tool--active');
    });
  });

  // ============================================
  // KEYBOARD SHORTCUTS
  // ============================================
  document.addEventListener('keydown', (e) => {
    // Only if not focused on input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

    const keyMap = {
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

    if (keyMap[e.key]) {
      e.preventDefault();
      navigateTo(keyMap[e.key]);
    }
  });

  // ============================================
  // UTILITY
  // ============================================
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ============================================
  // INIT
  // ============================================
  // Handle initial hash or default to dashboard
  const initialHash = window.location.hash.replace('#', '');
  if (VIEWS.includes(initialHash)) {
    navigateTo(initialHash);
  } else {
    navigateTo('dashboard');
  }

})();
