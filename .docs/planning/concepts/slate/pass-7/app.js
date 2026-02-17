/* ========================================================
   SLATE PASS 7 — Accordion Cavern Archive
   app.js — Navigation, interactions, ambient effects
   ======================================================== */

(function () {
  'use strict';

  // ---- CONSTANTS ----
  const VIEWS = [
    'dashboard', 'projects', 'project-workspace', 'kanban',
    'whiteboard', 'schema-planner', 'directory-tree', 'ideas',
    'ai-chat', 'settings'
  ];

  // Map each view to its accordion section
  const VIEW_TO_SECTION = {
    'dashboard': 'overview',
    'projects': 'overview',
    'project-workspace': 'workspace',
    'kanban': 'workspace',
    'whiteboard': 'design',
    'schema-planner': 'design',
    'directory-tree': 'design',
    'ideas': 'capture',
    'ai-chat': 'capture',
    'settings': 'system'
  };

  // ---- DOM REFS ----
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileHeader = document.getElementById('mobile-header');
  const mainContent = document.getElementById('main-content');
  const loadingOverlay = document.getElementById('loading-overlay');
  const dustCanvas = document.getElementById('dust-canvas');
  const tooltip = document.getElementById('tooltip');

  // ---- LOADING OVERLAY ----
  function dismissLoading() {
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
      setTimeout(function () {
        loadingOverlay.style.display = 'none';
      }, 700);
    }
  }

  // ---- MOBILE BACKDROP ----
  let mobileBackdrop = document.querySelector('.mobile-backdrop');
  if (!mobileBackdrop) {
    mobileBackdrop = document.createElement('div');
    mobileBackdrop.className = 'mobile-backdrop';
    document.body.appendChild(mobileBackdrop);
  }

  // ---- SIDEBAR COLLAPSE / EXPAND ----
  function toggleSidebar() {
    sidebar.classList.toggle('collapsed');
    const isCollapsed = sidebar.classList.contains('collapsed');
    sidebarToggle.setAttribute('aria-label', isCollapsed ? 'Expand sidebar' : 'Collapse sidebar');
    sidebarToggle.setAttribute('title', isCollapsed ? 'Expand sidebar' : 'Collapse sidebar');
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', toggleSidebar);
  }

  // ---- MOBILE MENU ----
  function openMobileMenu() {
    sidebar.classList.add('mobile-open');
    mobileBackdrop.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    sidebar.classList.remove('mobile-open');
    mobileBackdrop.classList.remove('visible');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', openMobileMenu);
  }

  mobileBackdrop.addEventListener('click', closeMobileMenu);

  // ---- ACCORDION NAVIGATION ----
  const accordionTriggers = document.querySelectorAll('.accordion-trigger');

  function toggleAccordion(trigger) {
    const section = trigger.closest('.accordion-section');
    const panelId = trigger.getAttribute('aria-controls');
    const panel = document.getElementById(panelId);
    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

    if (isExpanded) {
      // Collapse this section
      trigger.setAttribute('aria-expanded', 'false');
      trigger.classList.remove('active');
      panel.classList.remove('open');
    } else {
      // Expand this section
      trigger.setAttribute('aria-expanded', 'true');
      trigger.classList.add('active');
      panel.classList.add('open');
    }
  }

  accordionTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      toggleAccordion(trigger);
    });
  });

  // Ensure the accordion section for a given view is open
  function ensureAccordionOpen(viewName) {
    var sectionName = VIEW_TO_SECTION[viewName];
    if (!sectionName) return;

    var section = document.querySelector('.accordion-section[data-section="' + sectionName + '"]');
    if (!section) return;

    var trigger = section.querySelector('.accordion-trigger');
    var panelId = trigger.getAttribute('aria-controls');
    var panel = document.getElementById(panelId);

    if (!panel.classList.contains('open')) {
      trigger.setAttribute('aria-expanded', 'true');
      trigger.classList.add('active');
      panel.classList.add('open');
    }
  }

  // ---- VIEW SWITCHING ----
  function switchView(viewName) {
    if (VIEWS.indexOf(viewName) === -1) return;

    // Deactivate all views
    var allViews = document.querySelectorAll('.view');
    allViews.forEach(function (v) { v.classList.remove('active'); });

    // Activate target view
    var targetView = document.querySelector('.view[data-view="' + viewName + '"]');
    if (targetView) {
      targetView.classList.add('active');
    }

    // Update nav items
    var allNavItems = document.querySelectorAll('.nav-item');
    allNavItems.forEach(function (item) {
      item.classList.remove('active');
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      }
    });

    // Open the relevant accordion section
    ensureAccordionOpen(viewName);

    // Update hash
    history.pushState(null, '', '#' + viewName);

    // Close mobile menu if open
    closeMobileMenu();

    // Scroll to top
    mainContent.scrollTo(0, 0);
    window.scrollTo(0, 0);

    // Re-trigger reveal animations for the new view
    revealElementsInView(targetView);

    // Animate strata bars if on dashboard
    if (viewName === 'dashboard') {
      animateStrataFills();
      animateCounters();
    }
  }

  // Nav item clicks
  document.querySelectorAll('.nav-item[data-view]').forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      switchView(item.getAttribute('data-view'));
    });
  });

  // Quick action buttons on dashboard
  document.querySelectorAll('[data-nav]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      switchView(btn.getAttribute('data-nav'));
    });
  });

  // Breadcrumb links
  document.querySelectorAll('.breadcrumb-link[data-nav]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      switchView(link.getAttribute('data-nav'));
    });
  });

  // ---- HASH-BASED ROUTING ----
  function handleHash() {
    var hash = window.location.hash.replace('#', '');
    if (hash && VIEWS.indexOf(hash) !== -1) {
      switchView(hash);
    } else {
      switchView('dashboard');
    }
  }

  window.addEventListener('hashchange', handleHash);

  // ---- SETTINGS TABS ----
  var settingsTabs = document.querySelectorAll('.settings-tab[data-settings-tab]');
  var settingsPanels = document.querySelectorAll('.settings-panel[data-settings-panel]');

  settingsTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var tabId = tab.getAttribute('data-settings-tab');

      // Deactivate all
      settingsTabs.forEach(function (t) { t.classList.remove('active'); });
      settingsPanels.forEach(function (p) { p.classList.remove('active'); });

      // Activate target
      tab.classList.add('active');
      var targetPanel = document.querySelector('.settings-panel[data-settings-panel="' + tabId + '"]');
      if (targetPanel) {
        targetPanel.classList.add('active');
        revealElementsInView(targetPanel);
      }
    });
  });

  // ---- DIRECTORY TREE EXPAND/COLLAPSE ----
  document.querySelectorAll('.tree-node').forEach(function (node) {
    // Only act on folder nodes (those with a tree-toggle)
    var toggle = node.querySelector('.tree-toggle');
    if (!toggle || node.classList.contains('file')) return;

    node.addEventListener('click', function (e) {
      e.stopPropagation();

      var isOpen = node.classList.contains('open');
      // The children div is the next sibling element
      var childrenEl = node.nextElementSibling;

      if (isOpen) {
        node.classList.remove('open');
        toggle.innerHTML = '&#9656;'; // right-pointing triangle
        if (childrenEl && childrenEl.classList.contains('tree-children')) {
          childrenEl.style.display = 'none';
        }
      } else {
        node.classList.add('open');
        toggle.innerHTML = '&#9662;'; // down-pointing triangle
        if (childrenEl && childrenEl.classList.contains('tree-children')) {
          childrenEl.style.display = 'block';
        }
      }
    });
  });

  // "Collapse All" button for directory tree
  document.querySelectorAll('.view[data-view="directory-tree"] .btn-outline').forEach(function (btn) {
    if (btn.textContent.trim() === 'Collapse All') {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.tree-view .tree-node').forEach(function (node) {
          if (node.classList.contains('file')) return;
          var toggle = node.querySelector('.tree-toggle');
          if (!toggle) return;
          node.classList.remove('open');
          toggle.innerHTML = '&#9656;';
          var childrenEl = node.nextElementSibling;
          if (childrenEl && childrenEl.classList.contains('tree-children')) {
            childrenEl.style.display = 'none';
          }
        });
        // Change button text to indicate it can expand
        btn.textContent = 'Expand All';
      });
    }
  });

  // Handle the dynamic Collapse All / Expand All toggle
  document.addEventListener('click', function (e) {
    if (e.target.textContent.trim() === 'Expand All' && e.target.closest('.view[data-view="directory-tree"]')) {
      document.querySelectorAll('.tree-view .tree-node').forEach(function (node) {
        if (node.classList.contains('file')) return;
        var toggle = node.querySelector('.tree-toggle');
        if (!toggle) return;
        node.classList.add('open');
        toggle.innerHTML = '&#9662;';
        var childrenEl = node.nextElementSibling;
        if (childrenEl && childrenEl.classList.contains('tree-children')) {
          childrenEl.style.display = 'block';
        }
      });
      e.target.textContent = 'Collapse All';
    }
  });

  // ---- AI CHAT MESSAGE SIMULATION ----
  var chatInput = document.querySelector('.chat-input');
  var chatSendBtn = document.querySelector('.chat-send-btn');
  var chatMessages = document.querySelector('.chat-messages');

  var aiResponses = [
    'I have processed your request, Archivist. The archive has been updated accordingly.',
    'Interesting observation. Let me cross-reference that with the existing geological data in the specimens catalog.',
    'I have analyzed the strata layers for that project. Would you like me to generate a summary report?',
    'That mineral sample has been cataloged. I recommend tagging it for further analysis in the Schema Planner.',
    'The resonance patterns indicate a strong correlation with your existing kanban workflow. Shall I create a new card?',
    'Archive entry recorded. The geological survey data has been appended to the project workspace.',
    'I detect multiple similar specimens in the archive. Would you like me to consolidate them?',
    'Processing complete. The stratigraphy for this project suggests we should prioritize the authentication layer first.'
  ];

  function sendChatMessage() {
    if (!chatInput || !chatMessages) return;
    var text = chatInput.value.trim();
    if (!text) return;

    // Add user message
    var userMsg = document.createElement('div');
    userMsg.className = 'chat-message user';
    userMsg.innerHTML =
      '<div class="chat-bubble"><p>' + escapeHtml(text) + '</p></div>' +
      '<div class="chat-avatar user-avatar">AG</div>';
    chatMessages.appendChild(userMsg);

    chatInput.value = '';
    autoResizeChatInput();
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Simulate AI response after a delay
    setTimeout(function () {
      var response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      var aiMsg = document.createElement('div');
      aiMsg.className = 'chat-message ai';
      aiMsg.setAttribute('data-reveal', '');
      aiMsg.innerHTML =
        '<div class="chat-avatar ai-avatar">AI</div>' +
        '<div class="chat-bubble"><p>' + response + '</p></div>';
      chatMessages.appendChild(aiMsg);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Trigger reveal
      setTimeout(function () {
        aiMsg.classList.add('revealed');
      }, 50);
    }, 800 + Math.random() * 600);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  if (chatSendBtn) {
    chatSendBtn.addEventListener('click', sendChatMessage);
  }

  if (chatInput) {
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });

    // Auto-resize textarea
    chatInput.addEventListener('input', autoResizeChatInput);
  }

  function autoResizeChatInput() {
    if (!chatInput) return;
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
  }

  // ---- COUNTER ANIMATION ----
  function animateCounters() {
    var counters = document.querySelectorAll('.stat-value[data-count]');
    counters.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      if (isNaN(target)) return;

      var current = 0;
      var duration = 1200;
      var stepTime = Math.max(Math.floor(duration / target), 20);
      var increment = Math.ceil(target / (duration / stepTime));

      function step() {
        current += increment;
        if (current >= target) {
          el.textContent = target;
          return;
        }
        el.textContent = current;
        setTimeout(step, stepTime);
      }

      el.textContent = '0';
      step();
    });
  }

  // ---- STRATA BAR ANIMATION ----
  function animateStrataFills() {
    var fills = document.querySelectorAll('.strata-fill');
    fills.forEach(function (fill) {
      // Reset and re-animate
      fill.style.width = '0';
      setTimeout(function () {
        var pct = fill.style.getPropertyValue('--fill-pct') || '0';
        fill.style.width = pct;
      }, 100);
    });
  }

  // ---- SCROLL REVEAL ----
  function revealElementsInView(container) {
    var root = container || document;
    var elements = root.querySelectorAll('[data-reveal]');
    elements.forEach(function (el, i) {
      setTimeout(function () {
        el.classList.add('revealed');
      }, 80 * i);
    });
  }

  // IntersectionObserver for scroll-based reveal
  var revealObserver;
  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: reveal everything immediately
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.classList.add('revealed');
    });
  }

  // ---- TOOLTIP SYSTEM ----
  document.querySelectorAll('[title]').forEach(function (el) {
    var originalTitle = el.getAttribute('title');
    if (!originalTitle) return;

    el.removeAttribute('title');
    el.setAttribute('data-tooltip', originalTitle);

    el.addEventListener('mouseenter', function (e) {
      tooltip.textContent = originalTitle;
      tooltip.classList.add('visible');
      positionTooltip(e);
    });

    el.addEventListener('mousemove', positionTooltip);

    el.addEventListener('mouseleave', function () {
      tooltip.classList.remove('visible');
    });
  });

  function positionTooltip(e) {
    var x = e.clientX + 12;
    var y = e.clientY - 30;
    // Clamp within viewport
    var rect = tooltip.getBoundingClientRect();
    if (x + rect.width > window.innerWidth - 8) {
      x = window.innerWidth - rect.width - 8;
    }
    if (y < 4) y = e.clientY + 16;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
  }

  // ---- WHITEBOARD TOOL SELECTION ----
  document.querySelectorAll('.wb-tool').forEach(function (tool) {
    tool.addEventListener('click', function () {
      // Only toggle active within toolbar tools, not undo/redo
      var toolbar = tool.closest('.wb-toolbar');
      var divider = toolbar.querySelector('.wb-divider');
      // Check if this tool comes before the divider (is a shape tool, not undo/redo)
      var allTools = Array.from(toolbar.querySelectorAll('.wb-tool'));
      var dividerIndex = allTools.length;
      for (var i = 0; i < allTools.length; i++) {
        if (allTools[i].nextElementSibling === divider || allTools[i] === divider) {
          // Find index of divider
          break;
        }
      }

      // Simple approach: tools before divider are shape tools
      var shapeTools = [];
      var foundDivider = false;
      allTools.forEach(function (t) {
        if (t.nextElementSibling && t.nextElementSibling.classList && t.nextElementSibling.classList.contains('wb-divider')) {
          shapeTools.push(t);
          foundDivider = true;
          return;
        }
        if (!foundDivider) {
          shapeTools.push(t);
        }
      });

      if (shapeTools.indexOf(tool) !== -1) {
        shapeTools.forEach(function (t) { t.classList.remove('active'); });
        tool.classList.add('active');
      }

      // Amber flash feedback
      tool.classList.add('amber-flash');
      setTimeout(function () { tool.classList.remove('amber-flash'); }, 400);
    });
  });

  // ---- FOLDER ITEM SELECTION (Project Workspace) ----
  document.querySelectorAll('.folder-item').forEach(function (item) {
    item.addEventListener('click', function () {
      document.querySelectorAll('.folder-item').forEach(function (f) {
        f.classList.remove('active');
      });
      item.classList.add('active');
    });
  });

  // ---- IDEA FORM HANDLING ----
  var ideaForm = document.querySelector('.idea-form');
  if (ideaForm) {
    ideaForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var titleInput = ideaForm.querySelector('.form-input');
      if (titleInput && titleInput.value.trim()) {
        // Flash feedback on the form
        ideaForm.closest('.panel-card').classList.add('amber-flash');
        setTimeout(function () {
          ideaForm.closest('.panel-card').classList.remove('amber-flash');
        }, 400);

        // Reset form
        ideaForm.reset();
      }
    });

    // Clear button
    var clearBtn = ideaForm.querySelector('.btn-outline');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        ideaForm.reset();
      });
    }
  }

  // ---- IDEA PROMOTE BUTTON FEEDBACK ----
  document.querySelectorAll('.idea-promote').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var ideaItem = btn.closest('.idea-item');
      if (ideaItem) {
        ideaItem.classList.add('amber-flash');
        setTimeout(function () {
          ideaItem.classList.remove('amber-flash');
        }, 400);
      }
    });
  });

  // ---- KANBAN CARD HOVER FEEDBACK ----
  // (Handled via CSS, but add click interaction for visual feedback)
  document.querySelectorAll('.kanban-card').forEach(function (card) {
    card.addEventListener('click', function () {
      card.classList.add('amber-flash');
      setTimeout(function () { card.classList.remove('amber-flash'); }, 400);
    });
  });

  // ---- PROJECT CARD CLICK -> PROJECT WORKSPACE ----
  document.querySelectorAll('.project-card:not(.project-card-new)').forEach(function (card) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function () {
      switchView('project-workspace');
    });
  });

  // ---- NEW PROJECT CARD ----
  var newProjectCard = document.querySelector('.project-card-new');
  if (newProjectCard) {
    newProjectCard.addEventListener('click', function () {
      newProjectCard.classList.add('amber-flash');
      setTimeout(function () { newProjectCard.classList.remove('amber-flash'); }, 400);
    });
  }

  // ---- AMBIENT DUST MOTES (Canvas) ----
  var dustCtx = null;
  var dustParticles = [];
  var dustAnimFrame = null;

  function initDust() {
    if (!dustCanvas) return;
    dustCtx = dustCanvas.getContext('2d');
    resizeDust();
    createDustParticles();
    animateDust();
  }

  function resizeDust() {
    if (!dustCanvas) return;
    dustCanvas.width = window.innerWidth;
    dustCanvas.height = window.innerHeight;
  }

  function createDustParticles() {
    dustParticles = [];
    var count = Math.floor((window.innerWidth * window.innerHeight) / 18000);
    count = Math.min(count, 80);
    count = Math.max(count, 20);

    for (var i = 0; i < count; i++) {
      dustParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2.2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: -Math.random() * 0.2 - 0.05,
        opacity: Math.random() * 0.5 + 0.1,
        drift: Math.random() * Math.PI * 2,
        driftSpeed: Math.random() * 0.008 + 0.002
      });
    }
  }

  function animateDust() {
    if (!dustCtx) return;
    dustCtx.clearRect(0, 0, dustCanvas.width, dustCanvas.height);

    dustParticles.forEach(function (p) {
      p.drift += p.driftSpeed;
      p.x += p.speedX + Math.sin(p.drift) * 0.15;
      p.y += p.speedY;

      // Wrap around edges
      if (p.y < -5) p.y = dustCanvas.height + 5;
      if (p.x < -5) p.x = dustCanvas.width + 5;
      if (p.x > dustCanvas.width + 5) p.x = -5;

      dustCtx.beginPath();
      dustCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      dustCtx.fillStyle = 'rgba(212, 160, 74, ' + p.opacity + ')';
      dustCtx.fill();
    });

    dustAnimFrame = requestAnimationFrame(animateDust);
  }

  window.addEventListener('resize', function () {
    resizeDust();
    createDustParticles();
  });

  // ---- SEARCH BOX FUNCTIONALITY ----
  var searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      var query = searchInput.value.toLowerCase().trim();
      var cards = document.querySelectorAll('.project-card:not(.project-card-new)');

      cards.forEach(function (card) {
        var name = (card.querySelector('.project-name') || {}).textContent || '';
        var desc = (card.querySelector('.project-desc') || {}).textContent || '';
        var matchText = (name + ' ' + desc).toLowerCase();

        if (!query || matchText.indexOf(query) !== -1) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // ---- KEYBOARD SHORTCUTS ----
  document.addEventListener('keydown', function (e) {
    // Escape closes mobile menu
    if (e.key === 'Escape') {
      closeMobileMenu();
    }

    // Ctrl/Cmd + B toggles sidebar
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      toggleSidebar();
    }
  });

  // ---- INITIALIZATION ----
  function init() {
    // Dismiss loading overlay
    setTimeout(dismissLoading, 800);

    // Initialize dust particles
    initDust();

    // Handle initial hash
    handleHash();

    // Animate dashboard stats on first load
    setTimeout(function () {
      animateCounters();
      animateStrataFills();
    }, 900);
  }

  // Start when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
