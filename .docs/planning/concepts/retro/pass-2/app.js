/* ============================================
   RETRO PASS 2 — Application Script
   1950s-60s Mid-Century / Atomic Age
   ============================================ */

(function () {
  'use strict';

  /* ============================================
     NAVIGATION & VIEW SWITCHING
     ============================================ */

  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.view');
  const sidebar = document.getElementById('sidebar');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const sidebarOverlay = document.getElementById('sidebar-overlay');

  /**
   * Switch to a view by its id (without 'view-' prefix)
   */
  function switchView(viewName) {
    // Deactivate all views
    views.forEach(function (v) {
      v.classList.remove('active');
    });

    // Deactivate all nav items
    navItems.forEach(function (n) {
      n.classList.remove('active');
    });

    // Activate target view
    var targetView = document.getElementById('view-' + viewName);
    if (targetView) {
      targetView.classList.add('active');
    }

    // Activate matching nav item
    var targetNav = document.querySelector('.nav-item[data-view="' + viewName + '"]');
    if (targetNav) {
      targetNav.classList.add('active');
    }

    // Close mobile sidebar
    closeMobileSidebar();
  }

  // Handle nav item clicks
  navItems.forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      var viewName = item.getAttribute('data-view');
      window.location.hash = viewName;
    });
  });

  // Handle hash routing
  function handleHash() {
    var hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById('view-' + hash)) {
      switchView(hash);
    } else {
      switchView('dashboard');
    }
  }

  window.addEventListener('hashchange', handleHash);

  // Initialize on load
  handleHash();

  /* ============================================
     MOBILE SIDEBAR TOGGLE
     ============================================ */

  function openMobileSidebar() {
    sidebar.classList.add('open');
    hamburgerBtn.classList.add('open');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    sidebarOverlay.classList.add('visible');
    sidebarOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileSidebar() {
    sidebar.classList.remove('open');
    hamburgerBtn.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    sidebarOverlay.classList.remove('visible');
    sidebarOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  hamburgerBtn.addEventListener('click', function () {
    if (sidebar.classList.contains('open')) {
      closeMobileSidebar();
    } else {
      openMobileSidebar();
    }
  });

  sidebarOverlay.addEventListener('click', closeMobileSidebar);

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
      closeMobileSidebar();
    }
  });

  /* ============================================
     GSAP ANIMATIONS — Springy Hover Effects
     ============================================ */

  if (typeof gsap !== 'undefined') {

    // Stat cards spring on hover
    var statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        gsap.to(card, {
          scale: 1.04,
          y: -4,
          duration: 0.4,
          ease: 'elastic.out(1, 0.5)'
        });
      });
      card.addEventListener('mouseleave', function () {
        gsap.to(card, {
          scale: 1,
          y: 0,
          duration: 0.35,
          ease: 'power2.out'
        });
      });
    });

    // Project cards spring animation
    var projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        gsap.to(card, {
          y: -6,
          scale: 1.02,
          duration: 0.4,
          ease: 'elastic.out(1, 0.6)'
        });
      });
      card.addEventListener('mouseleave', function () {
        gsap.to(card, {
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });

    // Idea cards spring animation
    var ideaCards = document.querySelectorAll('.idea-card');
    ideaCards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        gsap.to(card, {
          y: -5,
          rotation: -0.5,
          scale: 1.02,
          duration: 0.4,
          ease: 'elastic.out(1, 0.5)'
        });
      });
      card.addEventListener('mouseleave', function () {
        gsap.to(card, {
          y: 0,
          rotation: 0,
          scale: 1,
          duration: 0.35,
          ease: 'power2.out'
        });
      });
    });

    // Kanban card hover
    var kanbanCards = document.querySelectorAll('.kanban-card');
    kanbanCards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        gsap.to(card, {
          y: -3,
          rotation: -1,
          scale: 1.03,
          duration: 0.35,
          ease: 'elastic.out(1, 0.5)'
        });
      });
      card.addEventListener('mouseleave', function () {
        gsap.to(card, {
          y: 0,
          rotation: 0,
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });

    // Nav items spring
    navItems.forEach(function (item) {
      item.addEventListener('mouseenter', function () {
        if (!item.classList.contains('active')) {
          gsap.to(item, {
            x: 6,
            duration: 0.3,
            ease: 'elastic.out(1, 0.6)'
          });
        }
      });
      item.addEventListener('mouseleave', function () {
        if (!item.classList.contains('active')) {
          gsap.to(item, {
            x: 0,
            duration: 0.25,
            ease: 'power2.out'
          });
        }
      });
    });

    // Retro buttons spring
    var retroBtns = document.querySelectorAll('.retro-btn');
    retroBtns.forEach(function (btn) {
      btn.addEventListener('mouseenter', function () {
        gsap.to(btn, {
          scale: 1.06,
          duration: 0.3,
          ease: 'elastic.out(1, 0.5)'
        });
      });
      btn.addEventListener('mouseleave', function () {
        gsap.to(btn, {
          scale: 1,
          duration: 0.25,
          ease: 'power2.out'
        });
      });
    });

    // Page load: stagger the active view's children
    gsap.from('.view.active > *', {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power2.out',
      delay: 0.2
    });

    // Brand icon spin is already CSS, but add a bounce on load
    gsap.from('.brand-icon', {
      scale: 0,
      rotation: -180,
      duration: 0.8,
      ease: 'elastic.out(1, 0.5)',
      delay: 0.1
    });

    // Brand text reveal
    gsap.from('.brand-text', {
      x: -30,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
      delay: 0.3
    });
  }

  /* ============================================
     CHART.JS — Dashboard Weekly Activity Chart
     ============================================ */

  if (typeof Chart !== 'undefined') {
    var ctx = document.getElementById('weeklyChart');
    if (ctx) {
      new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              label: 'Ideas Created',
              data: [4, 7, 3, 8, 5, 2, 6],
              backgroundColor: 'rgba(255, 107, 107, 0.6)',
              borderColor: '#FF6B6B',
              borderWidth: 2,
              borderRadius: 8,
              borderSkipped: false
            },
            {
              label: 'Tasks Completed',
              data: [3, 5, 6, 4, 7, 1, 4],
              backgroundColor: 'rgba(78, 205, 196, 0.6)',
              borderColor: '#4ECDC4',
              borderWidth: 2,
              borderRadius: 8,
              borderSkipped: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: {
                  family: "'Quicksand', sans-serif",
                  size: 13,
                  weight: '600'
                },
                color: '#2C3E50',
                padding: 16,
                usePointStyle: true,
                pointStyleWidth: 20
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                font: {
                  family: "'Quicksand', sans-serif",
                  size: 13,
                  weight: '500'
                },
                color: '#5D6D7E'
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(232, 221, 208, 0.5)'
              },
              ticks: {
                stepSize: 2,
                font: {
                  family: "'Quicksand', sans-serif",
                  size: 12,
                  weight: '500'
                },
                color: '#5D6D7E'
              }
            }
          }
        }
      });
    }
  }

  /* ============================================
     SORTABLE.JS — Kanban Drag & Drop
     ============================================ */

  if (typeof Sortable !== 'undefined') {
    var kanbanColumns = document.querySelectorAll('.kanban-cards');
    kanbanColumns.forEach(function (col) {
      new Sortable(col, {
        group: 'kanban',
        animation: 250,
        ghostClass: 'kanban-card--ghost',
        chosenClass: 'kanban-card--chosen',
        dragClass: 'kanban-card--drag',
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        onEnd: function () {
          // Update column counts
          document.querySelectorAll('.kanban-column').forEach(function (column) {
            var count = column.querySelectorAll('.kanban-card').length;
            var badge = column.querySelector('.kanban-count');
            if (badge) {
              badge.textContent = count;
            }
          });
        }
      });
    });
  }

  /* ============================================
     SETTINGS — Tab Switching
     ============================================ */

  var settingsTabs = document.querySelectorAll('.settings-tab');
  var settingsPanels = document.querySelectorAll('.settings-panel');

  settingsTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.getAttribute('data-settings-tab');

      settingsTabs.forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      settingsPanels.forEach(function (p) {
        p.classList.remove('active');
      });

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      var targetPanel = document.getElementById('settings-' + target);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  /* ============================================
     WORKSPACE — Toolbar Tab Switching
     ============================================ */

  var workspaceToolbarBtns = document.querySelectorAll('.workspace-toolbar .toolbar-group:first-child .toolbar-btn');
  workspaceToolbarBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      workspaceToolbarBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });

  /* ============================================
     WHITEBOARD — Tool Switching
     ============================================ */

  var wbTools = document.querySelectorAll('.whiteboard-tools .toolbar-btn');
  wbTools.forEach(function (btn) {
    btn.addEventListener('click', function () {
      wbTools.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });

  /* ============================================
     DIRECTORY — Tree Toggle
     ============================================ */

  var treeToggles = document.querySelectorAll('.tree-toggle');
  treeToggles.forEach(function (toggle) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var item = toggle.closest('.tree-item');
      if (!item) return;

      var sublist = item.querySelector(':scope > .tree-list');
      if (!sublist) return;

      var isOpen = item.classList.contains('tree-item--open');
      if (isOpen) {
        item.classList.remove('tree-item--open');
        item.setAttribute('aria-expanded', 'false');
        sublist.style.display = 'none';
      } else {
        item.classList.add('tree-item--open');
        item.setAttribute('aria-expanded', 'true');
        sublist.style.display = '';
      }
    });

    // Keyboard support
    toggle.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle.click();
      }
    });
  });

  /* ============================================
     IDEAS — Filter Buttons
     ============================================ */

  var filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });

  /* ============================================
     AI CHAT — Send Message Simulation
     ============================================ */

  var chatInput = document.getElementById('chat-input');
  var chatSendBtn = document.getElementById('chat-send-btn');
  var chatMessages = document.getElementById('chat-messages');

  function sendMessage() {
    if (!chatInput || !chatMessages) return;
    var text = chatInput.value.trim();
    if (!text) return;

    // Create user message
    var userMsg = document.createElement('div');
    userMsg.className = 'chat-msg chat-msg--user';
    userMsg.innerHTML =
      '<div class="chat-bubble"><p>' + escapeHtml(text) + '</p></div>' +
      '<div class="chat-avatar chat-avatar--user">JD</div>';
    chatMessages.appendChild(userMsg);

    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Simulate AI typing response
    setTimeout(function () {
      var aiMsg = document.createElement('div');
      aiMsg.className = 'chat-msg chat-msg--ai';
      aiMsg.innerHTML =
        '<div class="chat-avatar chat-avatar--ai">AI</div>' +
        '<div class="chat-bubble"><p>That is a great thought! Let me analyze your input and suggest some related ideas based on your project context. I will get back to you with detailed recommendations shortly.</p></div>';
      chatMessages.appendChild(aiMsg);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // GSAP animate the new message
      if (typeof gsap !== 'undefined') {
        gsap.from(aiMsg, {
          y: 20,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    }, 800);
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

  /* ============================================
     CHAT HISTORY — Item Switching
     ============================================ */

  var chatHistoryItems = document.querySelectorAll('.chat-history-item');
  chatHistoryItems.forEach(function (item) {
    item.addEventListener('click', function () {
      chatHistoryItems.forEach(function (i) { i.classList.remove('active'); });
      item.classList.add('active');
    });
  });

  /* ============================================
     REDUCED MOTION CHECK
     ============================================ */

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches && typeof gsap !== 'undefined') {
    gsap.globalTimeline.timeScale(100); // Effectively skip animations
  }

})();
