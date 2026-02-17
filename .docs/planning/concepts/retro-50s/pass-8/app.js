/* ============================================================
   IDEA-MANAGEMENT | Retro 50s Pass 8: Command-Palette Automat
   app.js — Navigation, Command Palette, Interactions
   ============================================================ */

(function () {
  'use strict';

  // ---------- State ----------
  let currentView = 'dashboard';
  let cmdPaletteOpen = false;
  let mobileDrawerOpen = false;
  let cmdHighlightIndex = 0;

  // ---------- DOM refs ----------
  const topBar = document.querySelector('.top-bar');
  const cmdTrigger = document.querySelector('.cmd-trigger');
  const cmdOverlay = document.querySelector('.cmd-overlay');
  const cmdPalette = document.querySelector('.cmd-palette');
  const cmdInput = document.querySelector('.cmd-palette-input');
  const cmdBody = document.querySelector('.cmd-palette-body');
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  const mobileOverlay = document.querySelector('.mobile-drawer-overlay');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const mobileDrawerClose = document.querySelector('.mobile-drawer-close');
  const dingFlash = document.querySelector('.ding-flash');

  // ---------- View navigation data ----------
  const views = [
    { id: 'dashboard',          label: 'Dashboard',        icon: 'ph-house',          sub: 'Overview & stats' },
    { id: 'projects',           label: 'Projects',         icon: 'ph-folders',        sub: 'All projects' },
    { id: 'project-workspace',  label: 'Project Workspace',icon: 'ph-briefcase',      sub: 'Wavz.fm workspace' },
    { id: 'kanban',             label: 'Kanban Board',     icon: 'ph-kanban',         sub: 'Task columns' },
    { id: 'whiteboard',         label: 'Whiteboard',       icon: 'ph-chalkboard',     sub: 'Infinite canvas' },
    { id: 'schema-planner',     label: 'Schema Planner',   icon: 'ph-graph',          sub: 'Entity relationships' },
    { id: 'directory-tree',     label: 'Directory Tree',   icon: 'ph-tree-structure',  sub: 'File structure' },
    { id: 'ideas',              label: 'Ideas',            icon: 'ph-lightbulb',      sub: 'Capture & manage' },
    { id: 'ai-chat',            label: 'AI Chat',          icon: 'ph-robot',          sub: 'Assistant' },
    { id: 'settings',           label: 'Settings',         icon: 'ph-gear',           sub: 'Preferences' }
  ];

  // ---------- Navigate to view ----------
  function navigateTo(viewId) {
    if (!document.getElementById('view-' + viewId)) return;

    // Hide all views
    document.querySelectorAll('.view-page').forEach(function (v) {
      v.classList.remove('active');
    });

    // Show target view
    var target = document.getElementById('view-' + viewId);
    target.classList.add('active');
    currentView = viewId;

    // Update persistent nav active states
    document.querySelectorAll('.persistent-nav-item').forEach(function (item) {
      item.classList.toggle('active', item.getAttribute('data-view') === viewId);
    });

    // Update mobile drawer active states
    document.querySelectorAll('.mobile-nav-item').forEach(function (item) {
      item.classList.toggle('active', item.getAttribute('data-view') === viewId);
    });

    // Update hash
    if (window.location.hash !== '#' + viewId) {
      history.pushState(null, '', '#' + viewId);
    }

    // Close command palette and mobile drawer
    closeCmdPalette();
    closeMobileDrawer();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Trigger scroll reveal on new view
    setTimeout(triggerScrollReveal, 100);

    // Show ding feedback
    showDing('Opened: ' + viewId.replace(/-/g, ' '));
  }

  // ---------- Command Palette ----------
  function openCmdPalette() {
    cmdPaletteOpen = true;
    cmdOverlay.classList.add('active');
    cmdPalette.classList.add('active');
    cmdInput.value = '';
    cmdHighlightIndex = 0;
    renderCmdResults('');
    setTimeout(function () { cmdInput.focus(); }, 80);
  }

  function closeCmdPalette() {
    cmdPaletteOpen = false;
    cmdOverlay.classList.remove('active');
    cmdPalette.classList.remove('active');
    cmdInput.value = '';
  }

  function renderCmdResults(query) {
    var q = query.toLowerCase().trim();
    var filtered = views.filter(function (v) {
      if (!q) return true;
      return v.label.toLowerCase().indexOf(q) !== -1 ||
             v.sub.toLowerCase().indexOf(q) !== -1 ||
             v.id.indexOf(q) !== -1;
    });

    var html = '<div class="cmd-group-label">Navigate To</div>';
    filtered.forEach(function (v, i) {
      html += '<div class="cmd-item' + (i === cmdHighlightIndex ? ' highlighted' : '') +
              '" data-view="' + v.id + '">' +
              '<div class="cmd-item-icon"><i class="ph ' + v.icon + '"></i></div>' +
              '<div class="cmd-item-label">' + v.label + '</div>' +
              '<div class="cmd-item-sub">' + v.sub + '</div>' +
              '</div>';
    });

    if (filtered.length === 0) {
      html += '<div style="padding:24px;text-align:center;color:#90a4ae;font-size:0.88rem;">' +
              '<i class="ph ph-magnifying-glass" style="font-size:2rem;display:block;margin-bottom:8px;"></i>' +
              'No matching views found</div>';
    }

    cmdBody.innerHTML = html;

    // Re-bind click events
    cmdBody.querySelectorAll('.cmd-item').forEach(function (item) {
      item.addEventListener('click', function () {
        navigateTo(item.getAttribute('data-view'));
      });
    });
  }

  // ---------- Mobile Drawer ----------
  function openMobileDrawer() {
    mobileDrawerOpen = true;
    mobileOverlay.classList.add('active');
    mobileDrawer.classList.add('active');
  }

  function closeMobileDrawer() {
    mobileDrawerOpen = false;
    mobileOverlay.classList.remove('active');
    mobileDrawer.classList.remove('active');
  }

  // ---------- Ding Flash Feedback ----------
  function showDing(message) {
    if (!dingFlash) return;
    dingFlash.innerHTML = '<i class="ph ph-check-circle"></i> ' + message;
    dingFlash.classList.add('show');
    setTimeout(function () {
      dingFlash.classList.remove('show');
    }, 1500);
  }

  // ---------- Scroll Reveal ----------
  function triggerScrollReveal() {
    var els = document.querySelectorAll('.view-page.active .scroll-reveal');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    els.forEach(function (el, i) {
      el.style.transitionDelay = (i * 0.07) + 's';
      observer.observe(el);
    });
  }

  // ---------- Toggle switches ----------
  function initToggles() {
    document.querySelectorAll('.toggle-switch').forEach(function (toggle) {
      toggle.addEventListener('click', function () {
        toggle.classList.toggle('on');
        // Snap feedback
        toggle.style.transform = 'scale(0.92)';
        setTimeout(function () { toggle.style.transform = 'scale(1)'; }, 100);
      });
    });
  }

  // ---------- Settings tabs ----------
  function initSettingsTabs() {
    document.querySelectorAll('.settings-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var section = tab.getAttribute('data-section');
        document.querySelectorAll('.settings-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        document.querySelectorAll('.settings-content-section').forEach(function (s) {
          s.style.display = s.getAttribute('data-section') === section ? 'block' : 'none';
        });
      });
    });
  }

  // ---------- Tree toggle ----------
  function initTreeToggles() {
    document.querySelectorAll('.tree-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        btn.classList.toggle('open');
        var children = btn.closest('.tree-item').nextElementSibling;
        if (children && children.classList.contains('tree-node')) {
          children.style.display = children.style.display === 'none' ? 'block' : 'none';
        }
      });
    });
  }

  // ---------- Button click effects ----------
  function initButtonEffects() {
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        // Coin-drop depress + ding visual
        btn.style.transform = 'translateY(2px) scale(0.97)';
        setTimeout(function () {
          btn.style.transform = '';
        }, 150);
      });
    });
  }

  // ---------- Kanban card drag placeholder ----------
  function initKanbanDrag() {
    document.querySelectorAll('.kanban-card').forEach(function (card) {
      card.setAttribute('draggable', 'true');
      card.addEventListener('dragstart', function (e) {
        card.style.opacity = '0.5';
        e.dataTransfer.setData('text/plain', card.querySelector('.kanban-card-title').textContent);
      });
      card.addEventListener('dragend', function () {
        card.style.opacity = '1';
      });
    });

    document.querySelectorAll('.kanban-column').forEach(function (col) {
      col.addEventListener('dragover', function (e) {
        e.preventDefault();
        col.style.background = 'rgba(0,137,123,0.06)';
      });
      col.addEventListener('dragleave', function () {
        col.style.background = '';
      });
      col.addEventListener('drop', function (e) {
        e.preventDefault();
        col.style.background = '';
        showDing('Card moved!');
      });
    });
  }

  // ---------- Idea form ----------
  function initIdeaForm() {
    var form = document.getElementById('idea-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      showDing('Idea captured!');
      form.reset();
    });
  }

  // ---------- Chat input ----------
  function initChatInput() {
    var chatForm = document.getElementById('chat-form');
    if (!chatForm) return;
    chatForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = chatForm.querySelector('input');
      if (input.value.trim()) {
        showDing('Message sent');
        input.value = '';
      }
    });
  }

  // ---------- Workspace folder nav ----------
  function initFolderNav() {
    document.querySelectorAll('.folder-nav-item').forEach(function (item) {
      item.addEventListener('click', function () {
        document.querySelectorAll('.folder-nav-item').forEach(function (i) { i.classList.remove('active'); });
        item.classList.add('active');
      });
    });
  }

  // ---------- Project card clicks ----------
  function initProjectCards() {
    document.querySelectorAll('.project-card').forEach(function (card) {
      card.addEventListener('click', function () {
        navigateTo('project-workspace');
      });
    });
  }

  // ---------- Search hero bars ----------
  function initSearchHeros() {
    document.querySelectorAll('.search-hero-bar input').forEach(function (input) {
      input.addEventListener('focus', function () {
        openCmdPalette();
        input.blur();
      });
    });
  }

  // ---------- Event Listeners ----------
  function bindEvents() {
    // Command palette trigger
    if (cmdTrigger) {
      cmdTrigger.addEventListener('click', openCmdPalette);
    }

    // Overlay close
    if (cmdOverlay) {
      cmdOverlay.addEventListener('click', closeCmdPalette);
    }

    // Command palette input
    if (cmdInput) {
      cmdInput.addEventListener('input', function () {
        cmdHighlightIndex = 0;
        renderCmdResults(cmdInput.value);
      });

      cmdInput.addEventListener('keydown', function (e) {
        var items = cmdBody.querySelectorAll('.cmd-item');
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          cmdHighlightIndex = Math.min(cmdHighlightIndex + 1, items.length - 1);
          updateHighlight(items);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          cmdHighlightIndex = Math.max(cmdHighlightIndex - 1, 0);
          updateHighlight(items);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (items[cmdHighlightIndex]) {
            var viewId = items[cmdHighlightIndex].getAttribute('data-view');
            navigateTo(viewId);
          }
        } else if (e.key === 'Escape') {
          closeCmdPalette();
        }
      });
    }

    // Keyboard shortcut: Ctrl+K / Cmd+K
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (cmdPaletteOpen) {
          closeCmdPalette();
        } else {
          openCmdPalette();
        }
      }
      if (e.key === 'Escape') {
        if (cmdPaletteOpen) closeCmdPalette();
        if (mobileDrawerOpen) closeMobileDrawer();
      }
    });

    // Hamburger
    if (hamburgerBtn) {
      hamburgerBtn.addEventListener('click', openMobileDrawer);
    }

    // Mobile drawer overlay
    if (mobileOverlay) {
      mobileOverlay.addEventListener('click', closeMobileDrawer);
    }

    // Mobile drawer close
    if (mobileDrawerClose) {
      mobileDrawerClose.addEventListener('click', closeMobileDrawer);
    }

    // Mobile nav items
    document.querySelectorAll('.mobile-nav-item').forEach(function (item) {
      item.addEventListener('click', function () {
        navigateTo(item.getAttribute('data-view'));
      });
    });

    // Persistent nav items (desktop bar)
    document.querySelectorAll('.persistent-nav-item').forEach(function (item) {
      item.addEventListener('click', function () {
        navigateTo(item.getAttribute('data-view'));
      });
    });

    // Hash routing: respond to browser back/forward
    window.addEventListener('hashchange', function () {
      var hash = window.location.hash.replace('#', '');
      if (hash && hash !== currentView && document.getElementById('view-' + hash)) {
        navigateTo(hash);
      }
    });
  }

  function updateHighlight(items) {
    items.forEach(function (item, i) {
      item.classList.toggle('highlighted', i === cmdHighlightIndex);
    });
    // Scroll highlighted into view
    if (items[cmdHighlightIndex]) {
      items[cmdHighlightIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  // ---------- Init ----------
  function init() {
    // Expose showDing globally (used in inline HTML onclick handlers)
    window.showDing = showDing;

    bindEvents();
    initToggles();
    initSettingsTabs();
    initTreeToggles();
    initButtonEffects();
    initKanbanDrag();
    initIdeaForm();
    initChatInput();
    initFolderNav();
    initProjectCards();
    initSearchHeros();

    // Load view from hash, default to dashboard
    var hash = window.location.hash.replace('#', '');
    var startView = (hash && document.getElementById('view-' + hash)) ? hash : 'dashboard';
    navigateTo(startView);

    // Initial scroll reveal
    setTimeout(triggerScrollReveal, 200);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
