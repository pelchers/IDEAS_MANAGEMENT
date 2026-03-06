/* ============================================
   BRUTALISM & NEOBRUTALISM — PASS 2
   Monochromatic Split-Pane Concrete System
   app.js — All application logic
   ============================================ */

(function () {
  'use strict';

  /* ---- DOM References ---- */
  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.view');
  const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const leftPanel = document.getElementById('leftPanel');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');
  const chatMessages = document.getElementById('chatMessages');
  const newIdeaBtn = document.getElementById('newIdeaBtn');
  const ideaForm = document.getElementById('ideaForm');
  const closeIdeaForm = document.getElementById('closeIdeaForm');

  /* ============================================
     HASH ROUTING
     ============================================ */
  const viewMap = {
    '#dashboard': 'dashboard',
    '#projects': 'projects',
    '#workspace': 'workspace',
    '#kanban': 'kanban',
    '#whiteboard': 'whiteboard',
    '#schema': 'schema',
    '#directory': 'directory',
    '#ideas': 'ideas',
    '#chat': 'chat',
    '#settings': 'settings'
  };

  const labelMap = {
    'dashboard': 'DASHBOARD',
    'projects': 'PROJECTS',
    'workspace': 'WORKSPACE',
    'kanban': 'KANBAN',
    'whiteboard': 'WHITEBOARD',
    'schema': 'SCHEMA',
    'directory': 'DIRECTORY',
    'ideas': 'IDEAS',
    'chat': 'AI CHAT',
    'settings': 'SETTINGS'
  };

  function activateView(hash) {
    const viewId = viewMap[hash];
    if (!viewId) return;

    /* Hide all views */
    views.forEach(function (v) { v.classList.remove('active'); });

    /* Show target view */
    var target = document.getElementById(viewId);
    if (target) {
      target.classList.add('active');
    }

    /* Update nav active state */
    navItems.forEach(function (item) {
      item.classList.remove('active');
      if (item.getAttribute('href') === hash) {
        item.classList.add('active');
      }
    });

    /* Update breadcrumb */
    if (breadcrumbCurrent) {
      breadcrumbCurrent.textContent = labelMap[viewId] || viewId.toUpperCase();
    }

    /* Close mobile nav */
    closeMobileNav();

    /* Scroll right panel to top */
    var rightPanel = document.getElementById('rightPanel');
    if (rightPanel) {
      rightPanel.scrollTop = 0;
    }
  }

  function handleHashChange() {
    var hash = window.location.hash || '#dashboard';
    if (!viewMap[hash]) {
      hash = '#dashboard';
      window.location.hash = hash;
    }
    activateView(hash);
  }

  window.addEventListener('hashchange', handleHashChange);

  /* Nav item clicks */
  navItems.forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      var hash = this.getAttribute('href');
      window.location.hash = hash;
    });
  });

  /* ============================================
     MOBILE NAVIGATION
     ============================================ */
  function openMobileNav() {
    if (leftPanel) leftPanel.classList.add('is-open');
    if (mobileOverlay) mobileOverlay.classList.add('is-visible');
    if (hamburgerBtn) {
      hamburgerBtn.classList.add('is-open');
      hamburgerBtn.setAttribute('aria-expanded', 'true');
    }
  }

  function closeMobileNav() {
    if (leftPanel) leftPanel.classList.remove('is-open');
    if (mobileOverlay) mobileOverlay.classList.remove('is-visible');
    if (hamburgerBtn) {
      hamburgerBtn.classList.remove('is-open');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    }
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', function () {
      if (leftPanel && leftPanel.classList.contains('is-open')) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileNav);
  }

  /* ============================================
     TASK CHECK TOGGLES (Workspace)
     ============================================ */
  document.querySelectorAll('.task-check').forEach(function (btn) {
    btn.addEventListener('click', function () {
      this.classList.toggle('task-check--done');
      var content = this.nextElementSibling;
      if (content) {
        content.classList.toggle('task-item__content--done');
      }
    });
  });

  /* ============================================
     WHITEBOARD TOOL SELECTION
     ============================================ */
  document.querySelectorAll('.wb-tool[data-tool]').forEach(function (tool) {
    tool.addEventListener('click', function () {
      var toolType = this.getAttribute('data-tool');

      /* Handle undo/clear differently */
      if (toolType === 'undo' || toolType === 'clear') {
        if (toolType === 'clear') {
          var svg = document.getElementById('wbSvg');
          if (svg) {
            /* Keep original content, just flash a visual feedback */
            svg.style.opacity = '0.3';
            setTimeout(function () { svg.style.opacity = '1'; }, 200);
          }
        }
        return;
      }

      /* Toggle active state for drawing tools */
      document.querySelectorAll('.wb-tool[data-tool]').forEach(function (t) {
        var tt = t.getAttribute('data-tool');
        if (tt !== 'undo' && tt !== 'clear') {
          t.classList.remove('wb-tool--active');
        }
      });
      this.classList.add('wb-tool--active');
    });
  });

  /* ============================================
     DIRECTORY TREE TOGGLES
     ============================================ */
  document.querySelectorAll('.tree-toggle').forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      var isExpanded = this.getAttribute('aria-expanded') === 'true';
      var icon = this.querySelector('.tree-icon');
      var parentNode = this.closest('.tree-node');
      var children = parentNode ? parentNode.nextElementSibling : null;

      if (children && children.classList.contains('tree-children')) {
        if (isExpanded) {
          children.classList.add('tree-children--collapsed');
          this.setAttribute('aria-expanded', 'false');
          if (icon) icon.innerHTML = '&#9654;';
        } else {
          children.classList.remove('tree-children--collapsed');
          this.setAttribute('aria-expanded', 'true');
          if (icon) icon.innerHTML = '&#9660;';
        }
      }
    });
  });

  /* ============================================
     IDEAS: New Idea Form Toggle
     ============================================ */
  if (newIdeaBtn && ideaForm) {
    newIdeaBtn.addEventListener('click', function () {
      ideaForm.style.display = ideaForm.style.display === 'none' ? 'block' : 'none';
    });
  }

  if (closeIdeaForm && ideaForm) {
    closeIdeaForm.addEventListener('click', function () {
      ideaForm.style.display = 'none';
    });
  }

  /* ============================================
     IDEAS: Filter Buttons
     ============================================ */
  document.querySelectorAll('.filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(function (b) {
        b.classList.remove('filter-btn--active');
      });
      this.classList.add('filter-btn--active');
    });
  });

  /* ============================================
     AI CHAT: Mock Message Sending
     ============================================ */
  function sendChatMessage() {
    if (!chatInput || !chatMessages) return;
    var text = chatInput.value.trim();
    if (!text) return;

    var now = new Date();
    var timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

    /* User message */
    var userMsg = document.createElement('div');
    userMsg.className = 'chat-msg chat-msg--user';
    userMsg.innerHTML =
      '<div class="chat-msg__body">' +
        '<div class="chat-msg__text">' + escapeHtml(text) + '</div>' +
        '<div class="chat-msg__time">' + timeStr + '</div>' +
      '</div>' +
      '<div class="chat-msg__avatar">JD</div>';
    chatMessages.appendChild(userMsg);
    chatInput.value = '';

    /* AI response after delay */
    setTimeout(function () {
      var aiMsg = document.createElement('div');
      aiMsg.className = 'chat-msg chat-msg--ai';
      aiMsg.innerHTML =
        '<div class="chat-msg__avatar">AI</div>' +
        '<div class="chat-msg__body">' +
          '<div class="chat-msg__text">I understand your request. Let me analyze the relevant project data and provide a detailed response. This is a simulated AI response for the prototype.</div>' +
          '<div class="chat-msg__time">' + timeStr + '</div>' +
        '</div>';
      chatMessages.appendChild(aiMsg);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 800);

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  if (chatSend) {
    chatSend.addEventListener('click', sendChatMessage);
  }

  if (chatInput) {
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }

  /* ============================================
     SETTINGS: Toggle Groups
     ============================================ */
  document.querySelectorAll('.toggle-group').forEach(function (group) {
    var btns = group.querySelectorAll('.toggle-btn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('toggle-btn--active'); });
        this.classList.add('toggle-btn--active');
      });
    });
  });

  /* ============================================
     GSAP: Continuous Ambient Animations
     ============================================ */
  function initAmbientAnimations() {
    if (typeof gsap === 'undefined') return;

    /* Check reduced-motion preference */
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    /* Pulsing accent line on active nav indicator */
    gsap.to('.nav-item.active .nav-item__indicator', {
      opacity: 0.3,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    /* Slow breathing on stat card accent lines */
    gsap.to('.stat-card::before', {
      opacity: 0.5,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    /* Chart bars subtle pulse on dashboard load */
    gsap.from('.chart-bar', {
      scaleY: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out',
      transformOrigin: 'bottom'
    });

    /* Grid overlay very slow drift */
    gsap.to('.grid-overlay', {
      backgroundPosition: '80px 80px',
      duration: 60,
      repeat: -1,
      ease: 'none'
    });

    /* Brand block slow rotation pulse */
    gsap.to('.brand-block', {
      rotation: 90,
      duration: 8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    /* Meta dot pulse */
    gsap.to('.meta-dot--active', {
      opacity: 0.4,
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    /* Kanban card subtle entrance */
    gsap.from('.kanban-card', {
      y: 10,
      opacity: 0,
      duration: 0.4,
      stagger: 0.05,
      ease: 'power2.out',
      delay: 0.2
    });

    /* Schema table entrance */
    gsap.from('.schema-table', {
      y: 15,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out'
    });

    /* Project cards stagger */
    gsap.from('.project-card', {
      y: 12,
      opacity: 0,
      duration: 0.4,
      stagger: 0.06,
      ease: 'power2.out'
    });

    /* Idea cards stagger */
    gsap.from('.idea-card', {
      y: 12,
      opacity: 0,
      duration: 0.4,
      stagger: 0.06,
      ease: 'power2.out'
    });
  }

  /* ============================================
     KANBAN: Basic Drag and Drop
     ============================================ */
  function initKanbanDragDrop() {
    var cards = document.querySelectorAll('.kanban-card');
    var columns = document.querySelectorAll('.kanban-column__body');

    cards.forEach(function (card) {
      card.addEventListener('dragstart', function (e) {
        e.dataTransfer.setData('text/plain', '');
        this.classList.add('dragging');
        setTimeout(function () {
          card.style.opacity = '0.4';
        }, 0);
      });

      card.addEventListener('dragend', function () {
        this.classList.remove('dragging');
        this.style.opacity = '1';
        /* Update column counts */
        updateKanbanCounts();
      });
    });

    columns.forEach(function (col) {
      col.addEventListener('dragover', function (e) {
        e.preventDefault();
        this.style.background = 'rgba(230, 57, 70, 0.06)';
      });

      col.addEventListener('dragleave', function () {
        this.style.background = '';
      });

      col.addEventListener('drop', function (e) {
        e.preventDefault();
        this.style.background = '';
        var dragging = document.querySelector('.dragging');
        if (dragging) {
          this.appendChild(dragging);
        }
      });
    });
  }

  function updateKanbanCounts() {
    document.querySelectorAll('.kanban-column').forEach(function (col) {
      var count = col.querySelectorAll('.kanban-card').length;
      var badge = col.querySelector('.kanban-column__count');
      if (badge) badge.textContent = count;
    });
  }

  /* ============================================
     INITIALIZATION
     ============================================ */
  function init() {
    /* Set initial view from hash */
    handleHashChange();

    /* Initialize GSAP animations */
    initAmbientAnimations();

    /* Initialize kanban drag/drop */
    initKanbanDragDrop();
  }

  /* Wait for DOM and fonts */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
