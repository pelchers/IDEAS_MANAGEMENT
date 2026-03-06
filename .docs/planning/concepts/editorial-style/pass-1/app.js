/* ============================================
   EDITORIAL STYLE — PASS 1
   App Logic: Navigation, Interactions, Animations
   ============================================ */

(function () {
  'use strict';

  /* ============================================
     CONSTANTS & STATE
     ============================================ */
  const VIEWS = [
    'dashboard', 'projects', 'workspace', 'kanban',
    'whiteboard', 'schema', 'directory', 'ideas', 'chat', 'settings'
  ];

  let currentView = 'dashboard';

  /* ============================================
     DOM ELEMENTS
     ============================================ */
  const masthead = document.getElementById('masthead');
  const hamburger = document.getElementById('hamburger');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const desktopNavLinks = document.querySelectorAll('#desktop-nav .nav-link');
  const mobileNavLinks = document.querySelectorAll('.mobile-drawer-nav .mobile-nav-link');
  const views = document.querySelectorAll('.view');
  const settingsNavLinks = document.querySelectorAll('.settings-nav-link');
  const settingsTabs = document.querySelectorAll('.settings-tab-content');
  const switchToggles = document.querySelectorAll('.switch-toggle');
  const toggleBtnGroups = document.querySelectorAll('.toggle-group');
  const treeToggles = document.querySelectorAll('.tree-toggle');

  /* ============================================
     HASH-BASED ROUTING
     ============================================ */
  function getViewFromHash() {
    const hash = window.location.hash.replace('#', '');
    return VIEWS.includes(hash) ? hash : 'dashboard';
  }

  function navigateToView(viewName) {
    if (!VIEWS.includes(viewName)) return;

    currentView = viewName;

    // Update views
    views.forEach(function (v) {
      if (v.getAttribute('data-view') === viewName) {
        v.classList.add('active');
      } else {
        v.classList.remove('active');
      }
    });

    // Update desktop nav
    desktopNavLinks.forEach(function (link) {
      if (link.getAttribute('data-view') === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update mobile nav
    mobileNavLinks.forEach(function (link) {
      if (link.getAttribute('data-view') === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Close mobile drawer
    closeMobileDrawer();

    // Scroll to top
    window.scrollTo(0, 0);

    // Run Splitting.js on the active view's title
    initSplittingForView(viewName);

    // Run GSAP animations for the view
    animateView(viewName);
  }

  function handleHashChange() {
    var view = getViewFromHash();
    navigateToView(view);
  }

  window.addEventListener('hashchange', handleHashChange);

  /* ============================================
     MOBILE DRAWER
     ============================================ */
  function openMobileDrawer() {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileDrawer.classList.add('open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileDrawer.classList.remove('open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    if (mobileDrawer.classList.contains('open')) {
      closeMobileDrawer();
    } else {
      openMobileDrawer();
    }
  });

  /* ============================================
     MASTHEAD SCROLL SHADOW
     ============================================ */
  var lastScrollY = 0;
  window.addEventListener('scroll', function () {
    lastScrollY = window.scrollY;
    if (lastScrollY > 10) {
      masthead.classList.add('scrolled');
    } else {
      masthead.classList.remove('scrolled');
    }
  }, { passive: true });

  /* ============================================
     SPLITTING.JS — PER-CHARACTER ANIMATION
     ============================================ */
  function initSplittingForView(viewName) {
    if (typeof Splitting === 'undefined') return;

    var viewEl = document.querySelector('.view[data-view="' + viewName + '"]');
    if (!viewEl) return;

    var title = viewEl.querySelector('.spread-title[data-splitting]');
    if (!title || title.classList.contains('split-done')) return;

    Splitting({ target: title, by: 'chars' });

    // Animate characters with stagger
    var chars = title.querySelectorAll('.char');
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(chars,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.03,
          ease: 'power2.out',
          onComplete: function () {
            title.classList.add('split-done');
          }
        }
      );
    } else {
      // Fallback: just show them
      title.classList.add('split-done');
    }
  }

  /* ============================================
     GSAP ANIMATIONS
     ============================================ */
  function animateView(viewName) {
    if (typeof gsap === 'undefined') return;

    var viewEl = document.querySelector('.view[data-view="' + viewName + '"]');
    if (!viewEl) return;

    // Animate spread header
    var kicker = viewEl.querySelector('.spread-kicker');
    var rule = viewEl.querySelector('.ornamental-rule');
    var subtitle = viewEl.querySelector('.spread-subtitle');

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    if (kicker) {
      tl.fromTo(kicker, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4 }, 0);
    }
    if (rule) {
      tl.fromTo(rule, { scaleX: 0, transformOrigin: 'left' }, { scaleX: 1, duration: 0.6 }, 0.2);
    }
    if (subtitle) {
      tl.fromTo(subtitle, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 }, 0.4);
    }

    // Animate cards/items in the view
    var cards = viewEl.querySelectorAll('.stat-card, .project-card, .kanban-card, .idea-card, .activity-item, .integration-item');
    if (cards.length > 0) {
      gsap.fromTo(cards,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.06,
          ease: 'power2.out',
          delay: 0.3
        }
      );
    }
  }

  /* ============================================
     SETTINGS TABS
     ============================================ */
  settingsNavLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var tab = this.getAttribute('data-settings-tab');

      // Update active nav link
      settingsNavLinks.forEach(function (l) { l.classList.remove('settings-nav-link--active'); });
      this.classList.add('settings-nav-link--active');

      // Show corresponding tab content
      settingsTabs.forEach(function (content) {
        if (content.getAttribute('data-settings-content') === tab) {
          content.hidden = false;
        } else {
          content.hidden = true;
        }
      });
    });
  });

  /* ============================================
     SWITCH TOGGLES
     ============================================ */
  switchToggles.forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      var isOn = this.classList.contains('switch-toggle--on');
      if (isOn) {
        this.classList.remove('switch-toggle--on');
        this.setAttribute('aria-checked', 'false');
      } else {
        this.classList.add('switch-toggle--on');
        this.setAttribute('aria-checked', 'true');
      }
    });
  });

  /* ============================================
     TOGGLE BUTTON GROUPS
     ============================================ */
  toggleBtnGroups.forEach(function (group) {
    var buttons = group.querySelectorAll('.toggle-btn');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('toggle-btn--active'); });
        this.classList.add('toggle-btn--active');
      });
    });
  });

  /* ============================================
     DIRECTORY TREE TOGGLE
     ============================================ */
  treeToggles.forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      var parent = this.closest('.tree-item');
      var children = parent.querySelector('.tree-children');
      if (!children) return;

      var isOpen = !children.hidden;
      if (isOpen) {
        children.hidden = true;
        this.textContent = '\u25B6';
        this.setAttribute('aria-expanded', 'false');
        parent.classList.remove('tree-item--open');
      } else {
        children.hidden = false;
        this.textContent = '\u25BC';
        this.setAttribute('aria-expanded', 'true');
        parent.classList.add('tree-item--open');
      }
    });

    toggle.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });

  /* ============================================
     WHITEBOARD TOOL SELECTION
     ============================================ */
  var wbTools = document.querySelectorAll('.wb-tool');
  wbTools.forEach(function (tool) {
    tool.addEventListener('click', function () {
      wbTools.forEach(function (t) { t.classList.remove('wb-tool--active'); });
      this.classList.add('wb-tool--active');
    });
  });

  /* ============================================
     SCHEMA ENTITY SELECTION
     ============================================ */
  var schemaEntities = document.querySelectorAll('.schema-entity');
  schemaEntities.forEach(function (entity) {
    entity.addEventListener('click', function () {
      schemaEntities.forEach(function (e) { e.classList.remove('schema-entity--active'); });
      this.classList.add('schema-entity--active');
    });
  });

  /* ============================================
     CHAT — SEND MESSAGE MOCK
     ============================================ */
  var chatInput = document.querySelector('.chat-input');
  var chatSend = document.querySelector('.chat-send');
  var chatMessages = document.getElementById('chat-messages');

  function sendChatMessage() {
    if (!chatInput || !chatMessages) return;
    var text = chatInput.value.trim();
    if (!text) return;

    // Add user message
    var userMsg = document.createElement('div');
    userMsg.className = 'chat-message chat-message--user';
    userMsg.innerHTML =
      '<div class="chat-bubble">' +
        '<p>' + escapeHtml(text) + '</p>' +
        '<time class="chat-time">Just now</time>' +
      '</div>' +
      '<div class="chat-avatar chat-avatar--user">You</div>';
    chatMessages.appendChild(userMsg);

    chatInput.value = '';

    // Add AI response after delay
    setTimeout(function () {
      var aiMsg = document.createElement('div');
      aiMsg.className = 'chat-message chat-message--ai';
      aiMsg.innerHTML =
        '<div class="chat-avatar chat-avatar--ai">AI</div>' +
        '<div class="chat-bubble">' +
          '<p>Thank you for your input. I am processing your request and will provide detailed analysis shortly. This is a prototype response for demonstration purposes.</p>' +
          '<time class="chat-time">Just now</time>' +
        '</div>';
      chatMessages.appendChild(aiMsg);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      if (typeof gsap !== 'undefined') {
        gsap.fromTo(aiMsg, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 });
      }
    }, 800);

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  if (chatSend) {
    chatSend.addEventListener('click', sendChatMessage);
  }

  if (chatInput) {
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        sendChatMessage();
      }
    });
  }

  /* Chat suggestion buttons */
  var chatSuggestions = document.querySelectorAll('.chat-suggestion');
  chatSuggestions.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (chatInput) {
        chatInput.value = this.textContent;
        chatInput.focus();
      }
    });
  });

  /* ============================================
     DASHBOARD CHART — CANVAS
     ============================================ */
  function drawDashboardChart() {
    var canvas = document.getElementById('dashboard-chart');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    var w = rect.width;
    var h = rect.height;

    // Data
    var months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    var values = [18, 32, 28, 45, 52, 41, 67];
    var maxVal = 80;

    var padding = { top: 20, right: 20, bottom: 40, left: 40 };
    var chartW = w - padding.left - padding.right;
    var chartH = h - padding.top - padding.bottom;

    // Grid lines
    ctx.strokeStyle = '#E8DDD1';
    ctx.lineWidth = 1;
    for (var i = 0; i <= 4; i++) {
      var gy = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, gy);
      ctx.lineTo(w - padding.right, gy);
      ctx.stroke();
    }

    // Y axis labels
    ctx.fillStyle = '#8C7A6B';
    ctx.font = '11px Montserrat, sans-serif';
    ctx.textAlign = 'right';
    for (var i = 0; i <= 4; i++) {
      var val = maxVal - (maxVal / 4) * i;
      var gy = padding.top + (chartH / 4) * i;
      ctx.fillText(Math.round(val), padding.left - 8, gy + 4);
    }

    // X axis labels
    ctx.textAlign = 'center';
    for (var i = 0; i < months.length; i++) {
      var gx = padding.left + (chartW / (months.length - 1)) * i;
      ctx.fillText(months[i], gx, h - 10);
    }

    // Area fill
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartH);
    for (var i = 0; i < values.length; i++) {
      var x = padding.left + (chartW / (values.length - 1)) * i;
      var y = padding.top + chartH - (values[i] / maxVal) * chartH;
      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        // Smooth curve
        var prevX = padding.left + (chartW / (values.length - 1)) * (i - 1);
        var prevY = padding.top + chartH - (values[i - 1] / maxVal) * chartH;
        var cpx = (prevX + x) / 2;
        ctx.bezierCurveTo(cpx, prevY, cpx, y, x, y);
      }
    }
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = 'rgba(193, 120, 23, 0.08)';
    ctx.fill();

    // Line
    ctx.beginPath();
    for (var i = 0; i < values.length; i++) {
      var x = padding.left + (chartW / (values.length - 1)) * i;
      var y = padding.top + chartH - (values[i] / maxVal) * chartH;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        var prevX = padding.left + (chartW / (values.length - 1)) * (i - 1);
        var prevY = padding.top + chartH - (values[i - 1] / maxVal) * chartH;
        var cpx = (prevX + x) / 2;
        ctx.bezierCurveTo(cpx, prevY, cpx, y, x, y);
      }
    }
    ctx.strokeStyle = '#C17817';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dots
    for (var i = 0; i < values.length; i++) {
      var x = padding.left + (chartW / (values.length - 1)) * i;
      var y = padding.top + chartH - (values[i] / maxVal) * chartH;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#C17817';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
    }
  }

  /* ============================================
     UTILITY FUNCTIONS
     ============================================ */
  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /* ============================================
     INITIALIZATION
     ============================================ */
  function init() {
    // Set initial view from hash
    var initialView = getViewFromHash();
    if (!window.location.hash) {
      window.location.hash = '#dashboard';
    }
    navigateToView(initialView);

    // Draw chart
    setTimeout(drawDashboardChart, 100);

    // Redraw chart on resize
    var resizeTimeout;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(drawDashboardChart, 200);
    });
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
