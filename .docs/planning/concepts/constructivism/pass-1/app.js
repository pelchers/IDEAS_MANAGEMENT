/* =====================================================================
   CONSTRUCTIVISM PASS 1 — APP.JS
   Navigation, view switching, animations, chart rendering, interactions.
   ===================================================================== */

(function () {
  'use strict';

  /* ===================== DOM REFERENCES ===================== */
  const fabNav = document.getElementById('fab-nav');
  const fabToggle = fabNav.querySelector('.fab-toggle');
  const fabLinks = fabNav.querySelectorAll('.fab-link');
  const viewPanels = document.querySelectorAll('.view-panel');
  const viewTitle = document.getElementById('view-title');

  /* ===================== VIEW MAP ===================== */
  const viewNames = {
    dashboard: 'DASHBOARD',
    projects: 'PROJECTS',
    workspace: 'WORKSPACE',
    kanban: 'KANBAN',
    whiteboard: 'WHITEBOARD',
    schema: 'SCHEMA',
    directory: 'DIRECTORY TREE',
    ideas: 'IDEAS',
    chat: 'AI CHAT',
    settings: 'SETTINGS'
  };

  /* ===================== FAB TOGGLE ===================== */
  fabToggle.addEventListener('click', function () {
    fabNav.classList.toggle('open');
    const expanded = fabNav.classList.contains('open');
    fabToggle.setAttribute('aria-expanded', expanded);
  });

  /* Close FAB when clicking outside */
  document.addEventListener('click', function (e) {
    if (!fabNav.contains(e.target) && fabNav.classList.contains('open')) {
      fabNav.classList.remove('open');
      fabToggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* ===================== VIEW SWITCHING ===================== */
  function switchView(viewId) {
    /* Hide all panels */
    viewPanels.forEach(function (panel) {
      panel.classList.remove('active-view');
    });

    /* Remove active from all fab links */
    fabLinks.forEach(function (link) {
      link.classList.remove('active');
    });

    /* Show target panel */
    var target = document.getElementById(viewId);
    if (target) {
      target.classList.add('active-view');
    }

    /* Set active fab link */
    fabLinks.forEach(function (link) {
      if (link.getAttribute('data-view') === viewId) {
        link.classList.add('active');
      }
    });

    /* Update banner title */
    viewTitle.textContent = viewNames[viewId] || viewId.toUpperCase();

    /* Close FAB menu */
    fabNav.classList.remove('open');
    fabToggle.setAttribute('aria-expanded', 'false');

    /* Trigger reveal animations for new view */
    revealCardsInView(viewId);

    /* Initialize chart if switching to dashboard */
    if (viewId === 'dashboard') {
      initDashboardChart();
    }
  }

  /* FAB link click handlers */
  fabLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var viewId = this.getAttribute('data-view');
      window.location.hash = viewId;
      switchView(viewId);
    });
  });

  /* Hash routing */
  function handleHash() {
    var hash = window.location.hash.replace('#', '');
    if (hash && viewNames[hash]) {
      switchView(hash);
    } else {
      switchView('dashboard');
    }
  }

  window.addEventListener('hashchange', handleHash);

  /* ===================== CARD REVEAL ANIMATIONS ===================== */
  function revealCardsInView(viewId) {
    var panel = document.getElementById(viewId);
    if (!panel) return;

    var cards = panel.querySelectorAll('.card-anim');
    cards.forEach(function (card) {
      card.classList.remove('revealed');
    });

    /* Check for reduced motion preference */
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      cards.forEach(function (card) {
        card.classList.add('revealed');
      });
      return;
    }

    /* Use GSAP for diagonal reveal if available */
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(cards,
        { opacity: 0, x: -30, y: 20, rotation: -1 },
        {
          opacity: 1,
          x: 0,
          y: 0,
          rotation: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out',
          onComplete: function () {
            cards.forEach(function (card) {
              card.classList.add('revealed');
            });
          }
        }
      );
    } else {
      /* Fallback: simple staggered reveal */
      cards.forEach(function (card, i) {
        setTimeout(function () {
          card.classList.add('revealed');
        }, i * 80);
      });
    }
  }

  /* ===================== DASHBOARD CHART ===================== */
  var dashChartInstance = null;

  function initDashboardChart() {
    if (typeof Chart === 'undefined') return;

    var canvas = document.getElementById('dashChart');
    if (!canvas) return;

    /* Destroy existing chart if re-rendering */
    if (dashChartInstance) {
      dashChartInstance.destroy();
    }

    var ctx = canvas.getContext('2d');

    dashChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Tasks Completed',
            data: [5, 8, 6, 9, 7, 3, 4],
            backgroundColor: '#CC0000',
            borderColor: '#1A1A1A',
            borderWidth: 2
          },
          {
            label: 'Ideas Added',
            data: [2, 3, 1, 4, 2, 1, 3],
            backgroundColor: '#D4A017',
            borderColor: '#1A1A1A',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              font: { family: "'Bebas Neue', sans-serif", size: 13, weight: '400' },
              color: '#1A1A1A',
              padding: 16
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: "'Bebas Neue', sans-serif", size: 12 },
              color: '#555555'
            }
          },
          y: {
            grid: { color: 'rgba(26,26,26,0.1)' },
            ticks: {
              font: { family: "'Bebas Neue', sans-serif", size: 12 },
              color: '#555555'
            }
          }
        }
      }
    });
  }

  /* ===================== DIRECTORY TREE TOGGLE ===================== */
  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('.tree-toggle');
    if (toggle) {
      var folder = toggle.closest('.tree-folder');
      if (folder) {
        folder.classList.toggle('open');
        toggle.textContent = folder.classList.contains('open') ? '\u25BC' : '\u25B6';
      }
    }
  });

  /* ===================== SETTINGS TABS ===================== */
  var settingsTabs = document.querySelectorAll('.settings-tab');
  var settingsSections = document.querySelectorAll('.settings-section');

  settingsTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = this.getAttribute('data-settings');

      settingsTabs.forEach(function (t) { t.classList.remove('active'); });
      settingsSections.forEach(function (s) { s.classList.remove('active'); });

      this.classList.add('active');
      var section = document.getElementById('settings-' + target);
      if (section) {
        section.classList.add('active');
      }
    });
  });

  /* ===================== TOOLBAR BUTTON TOGGLING ===================== */
  document.addEventListener('click', function (e) {
    /* Editor toolbar buttons */
    var toolBtn = e.target.closest('.editor-toolbar .tool-btn');
    if (toolBtn) {
      var toolbar = toolBtn.closest('.editor-toolbar');
      /* For mode buttons (EDIT/PREVIEW/SPLIT), toggle active among first 3 */
      var allBtns = toolbar.querySelectorAll('.tool-btn');
      var btnIndex = Array.from(allBtns).indexOf(toolBtn);
      if (btnIndex < 3) {
        allBtns.forEach(function (b, i) {
          if (i < 3) b.classList.remove('active');
        });
        toolBtn.classList.add('active');
      }
    }

    /* Directory toolbar buttons */
    var dirBtn = e.target.closest('.dir-toolbar .tool-btn');
    if (dirBtn) {
      var dirToolbar = dirBtn.closest('.dir-toolbar');
      var dirBtns = dirToolbar.querySelectorAll('.tool-btn');
      var dirBtnIndex = Array.from(dirBtns).indexOf(dirBtn);
      if (dirBtnIndex < 2) {
        dirBtns.forEach(function (b, i) {
          if (i < 2) b.classList.remove('active');
        });
        dirBtn.classList.add('active');
      }
    }

    /* Whiteboard toolbar */
    var wbBtn = e.target.closest('.wb-tool');
    if (wbBtn) {
      var tool = wbBtn.getAttribute('data-tool');
      if (tool && tool !== 'zoomin' && tool !== 'zoomout') {
        var wbToolbar = wbBtn.closest('.whiteboard-toolbar');
        wbToolbar.querySelectorAll('.wb-tool').forEach(function (b) {
          if (b.getAttribute('data-tool') !== 'zoomin' && b.getAttribute('data-tool') !== 'zoomout') {
            b.classList.remove('active');
          }
        });
        wbBtn.classList.add('active');
      }
    }

    /* Theme toggle buttons */
    var toggleBtn = e.target.closest('.toggle-btn');
    if (toggleBtn) {
      var group = toggleBtn.closest('.toggle-group');
      if (group) {
        group.querySelectorAll('.toggle-btn').forEach(function (b) { b.classList.remove('active'); });
        toggleBtn.classList.add('active');
      }
    }
  });

  /* ===================== CHAT SIMULATION ===================== */
  var chatInput = document.querySelector('.chat-input');
  var chatSendBtn = document.querySelector('.chat-send-btn');
  var chatMessages = document.getElementById('chatMessages');

  function sendChatMessage() {
    if (!chatInput || !chatMessages) return;
    var text = chatInput.value.trim();
    if (!text) return;

    /* Create user message */
    var userMsg = document.createElement('div');
    userMsg.className = 'chat-msg msg-user';
    userMsg.innerHTML =
      '<div class="msg-content"><p>' + escapeHtml(text) + '</p><span class="msg-time">' + getCurrentTime() + '</span></div>' +
      '<div class="msg-avatar user-avatar">AK</div>';
    chatMessages.appendChild(userMsg);

    chatInput.value = '';

    /* Simulate AI response */
    setTimeout(function () {
      var aiMsg = document.createElement('div');
      aiMsg.className = 'chat-msg msg-ai';
      aiMsg.innerHTML =
        '<div class="msg-avatar ai-avatar">AI</div>' +
        '<div class="msg-content"><p>' + generateAIResponse(text) + '</p><span class="msg-time">' + getCurrentTime() + '</span></div>';
      chatMessages.appendChild(aiMsg);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 800);

    chatMessages.scrollTop = chatMessages.scrollHeight;
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

  function getCurrentTime() {
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    var ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    m = m < 10 ? '0' + m : m;
    return h + ':' + m + ' ' + ampm;
  }

  function generateAIResponse(input) {
    var responses = [
      'I have analyzed your request. Based on current project data, I recommend prioritizing tasks with the highest impact score.',
      'That is an interesting direction. Let me cross-reference this with your existing ideas database and provide relevant connections.',
      'I can help with that. Based on the team\'s current velocity, the estimated completion date aligns with the Q2 timeline.',
      'Great question. The data suggests a positive trend in productivity over the last sprint. Would you like a detailed breakdown?',
      'I have noted your input. Shall I create a new idea entry or link this to an existing project for tracking?'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /* ===================== SAVE BUTTON FEEDBACK ===================== */
  document.addEventListener('click', function (e) {
    var saveBtn = e.target.closest('.save-btn');
    if (saveBtn) {
      var originalText = saveBtn.textContent;
      saveBtn.textContent = 'SAVED!';
      saveBtn.style.background = '#2D8B46';
      setTimeout(function () {
        saveBtn.textContent = originalText;
        saveBtn.style.background = '';
      }, 1500);
    }
  });

  /* ===================== SEARCH INTERACTION ===================== */
  var searchInput = document.querySelector('.search-input');
  var searchBtn = document.querySelector('.search-btn');

  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', function () {
      var query = searchInput.value.trim().toLowerCase();
      if (!query) return;

      var ideaCards = document.querySelectorAll('.idea-card');
      ideaCards.forEach(function (card) {
        var text = card.textContent.toLowerCase();
        if (text.indexOf(query) !== -1) {
          card.style.display = '';
          card.style.opacity = '1';
        } else {
          card.style.opacity = '0.3';
        }
      });
    });

    searchInput.addEventListener('input', function () {
      if (this.value === '') {
        document.querySelectorAll('.idea-card').forEach(function (card) {
          card.style.display = '';
          card.style.opacity = '';
        });
      }
    });
  }

  /* ===================== BANNER ENTRANCE ANIMATION ===================== */
  function animateBanner() {
    if (typeof gsap === 'undefined') return;

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    gsap.from('.banner-diagonal', {
      x: 200,
      duration: 0.8,
      ease: 'power3.out'
    });

    gsap.from('.banner-tag', {
      opacity: 0,
      rotation: -10,
      duration: 0.6,
      delay: 0.3,
      ease: 'back.out(1.7)'
    });

    gsap.from('.banner-title', {
      opacity: 0,
      x: -50,
      duration: 0.6,
      delay: 0.2,
      ease: 'power3.out'
    });

    gsap.from('.banner-accent-circle', {
      scale: 0,
      opacity: 0,
      duration: 0.5,
      delay: 0.5,
      ease: 'back.out(2)'
    });
  }

  /* ===================== INITIALIZATION ===================== */
  function init() {
    animateBanner();
    handleHash();
  }

  /* Wait for fonts + DOM */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
