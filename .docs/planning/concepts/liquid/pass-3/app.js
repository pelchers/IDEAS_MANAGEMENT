/* ============================================
   MercuryFi — Liquid Metal Fintech Platform
   Pass 3: app.js
   Navigation, interactions, GSAP, Tippy.js
   ============================================ */

(function () {
  'use strict';

  // ===== DOM References =====
  const loadingOverlay = document.getElementById('loading-overlay');
  const commandBackdrop = document.getElementById('command-palette-backdrop');
  const commandInput = document.getElementById('command-input');
  const commandItems = document.querySelectorAll('.command-item');
  const navTrigger = document.getElementById('nav-trigger');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const ambientCanvas = document.getElementById('ambient-canvas');
  const microFeedback = document.getElementById('micro-feedback');
  const pageSections = document.querySelectorAll('.page-section');
  const typingIndicator = document.getElementById('typing-indicator');

  let currentView = 'dashboard';
  let commandPaletteOpen = false;
  let activePaletteIndex = 0;

  // ===== LOADING STATE — mercury flow fill =====
  function hideLoading() {
    setTimeout(function () {
      loadingOverlay.classList.add('hidden');
      initPageReveal();
    }, 2000);
  }

  // ===== NAVIGATION — hash-based routing =====
  function navigateTo(viewName) {
    if (viewName === currentView) return;

    // Close command palette
    closeCommandPalette();

    // Hide current
    pageSections.forEach(function (s) {
      s.classList.remove('active');
    });

    // Show next
    var target = document.querySelector('[data-page="' + viewName + '"]');
    if (target) {
      target.classList.add('active');
      currentView = viewName;
      window.location.hash = viewName;
      updateActiveCommandItem();
      initScrollReveals();
      initGauges();
      initProgressBars();
      showMicroFeedback('Navigated to ' + viewName.replace(/-/g, ' '));

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function updateActiveCommandItem() {
    commandItems.forEach(function (item) {
      item.classList.remove('active');
      if (item.getAttribute('data-view') === currentView) {
        item.classList.add('active');
      }
    });
  }

  function initFromHash() {
    var hash = window.location.hash.replace('#', '');
    if (hash && document.querySelector('[data-page="' + hash + '"]')) {
      currentView = hash;
    }
    var target = document.querySelector('[data-page="' + currentView + '"]');
    if (target) {
      target.classList.add('active');
    }
    updateActiveCommandItem();
  }

  // ===== COMMAND PALETTE =====
  function openCommandPalette() {
    commandBackdrop.classList.add('open');
    commandPaletteOpen = true;
    commandInput.value = '';
    commandInput.focus();
    filterCommandItems('');
    activePaletteIndex = 0;
    highlightPaletteItem();
  }

  function closeCommandPalette() {
    commandBackdrop.classList.remove('open');
    commandPaletteOpen = false;
  }

  function toggleCommandPalette() {
    if (commandPaletteOpen) {
      closeCommandPalette();
    } else {
      openCommandPalette();
    }
  }

  function filterCommandItems(query) {
    var q = query.toLowerCase().trim();
    var visibleCount = 0;
    commandItems.forEach(function (item) {
      var text = item.querySelector('span').textContent.toLowerCase();
      if (!q || text.includes(q)) {
        item.style.display = 'flex';
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });
    activePaletteIndex = 0;
    highlightPaletteItem();
  }

  function highlightPaletteItem() {
    var visibleItems = [];
    commandItems.forEach(function (item) {
      if (item.style.display !== 'none') {
        visibleItems.push(item);
      }
    });
    visibleItems.forEach(function (item, i) {
      if (i === activePaletteIndex) {
        item.style.background = 'rgba(167,139,250,0.08)';
      } else {
        item.style.background = '';
      }
    });
  }

  function navigatePaletteDown() {
    var visibleItems = [];
    commandItems.forEach(function (item) {
      if (item.style.display !== 'none') visibleItems.push(item);
    });
    activePaletteIndex = Math.min(activePaletteIndex + 1, visibleItems.length - 1);
    highlightPaletteItem();
  }

  function navigatePaletteUp() {
    activePaletteIndex = Math.max(activePaletteIndex - 1, 0);
    highlightPaletteItem();
  }

  function selectPaletteItem() {
    var visibleItems = [];
    commandItems.forEach(function (item) {
      if (item.style.display !== 'none') visibleItems.push(item);
    });
    if (visibleItems[activePaletteIndex]) {
      var view = visibleItems[activePaletteIndex].getAttribute('data-view');
      navigateTo(view);
    }
  }

  // ===== COMMAND PALETTE EVENTS =====
  navTrigger.addEventListener('click', function () {
    openCommandPalette();
  });

  commandBackdrop.addEventListener('click', function (e) {
    if (e.target === commandBackdrop) {
      closeCommandPalette();
    }
  });

  commandInput.addEventListener('input', function () {
    filterCommandItems(commandInput.value);
  });

  commandInput.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigatePaletteDown();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigatePaletteUp();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      selectPaletteItem();
    } else if (e.key === 'Escape') {
      closeCommandPalette();
    }
  });

  commandItems.forEach(function (item) {
    item.addEventListener('click', function () {
      var view = item.getAttribute('data-view');
      navigateTo(view);
    });
  });

  // Global keyboard shortcut: Ctrl+K
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      toggleCommandPalette();
    }
    if (e.key === 'Escape' && commandPaletteOpen) {
      closeCommandPalette();
    }
    // Number keys for quick nav (when palette closed)
    if (!commandPaletteOpen && !e.ctrlKey && !e.metaKey && !e.altKey) {
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
      var focused = document.activeElement;
      var isInput = focused.tagName === 'INPUT' || focused.tagName === 'TEXTAREA' || focused.tagName === 'SELECT';
      if (!isInput && viewMap[e.key]) {
        navigateTo(viewMap[e.key]);
      }
    }
  });

  // Mobile menu
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function () {
      openCommandPalette();
    });
  }

  // ===== MICRO FEEDBACK — metal ding flash =====
  var feedbackTimeout;
  function showMicroFeedback(msg) {
    if (feedbackTimeout) clearTimeout(feedbackTimeout);
    var span = microFeedback.querySelector('span');
    if (span) span.textContent = msg || 'Action confirmed';
    microFeedback.classList.add('show');
    feedbackTimeout = setTimeout(function () {
      microFeedback.classList.remove('show');
    }, 1800);
  }

  // ===== SCROLL REVEAL — metal drop coalesce =====
  function initScrollReveals() {
    var reveals = document.querySelectorAll('.page-section.active .scroll-reveal:not(.revealed)');
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      // Use GSAP ScrollTrigger for scroll reveals
      gsap.registerPlugin(ScrollTrigger);
      reveals.forEach(function (el, i) {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter: function () {
            gsap.to(el, {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: 'blur(0px)',
              duration: 0.6,
              delay: i * 0.08,
              ease: 'power2.out',
              onStart: function () {
                el.classList.add('revealed');
              }
            });
          }
        });
      });
    } else {
      // Fallback: simple IntersectionObserver
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      reveals.forEach(function (el) {
        observer.observe(el);
      });
    }
  }

  function initPageReveal() {
    // Immediately reveal visible items on first page
    var reveals = document.querySelectorAll('.page-section.active .scroll-reveal');
    reveals.forEach(function (el, i) {
      setTimeout(function () {
        el.classList.add('revealed');
      }, 200 + i * 80);
    });
  }

  // ===== GAUGE ANIMATIONS =====
  function initGauges() {
    var gauges = document.querySelectorAll('.page-section.active .gauge-fill');
    gauges.forEach(function (g) {
      var pct = g.getAttribute('data-pct') || 0;
      g.style.setProperty('--pct', pct);
    });
  }

  // ===== PROGRESS BAR ANIMATIONS =====
  function initProgressBars() {
    var fills = document.querySelectorAll('.page-section.active .mercury-progress-fill');
    fills.forEach(function (fill) {
      var w = fill.getAttribute('data-width') || 0;
      setTimeout(function () {
        fill.style.width = w + '%';
      }, 400);
    });
  }

  // ===== RISK BARS =====
  function initRiskBars() {
    var bars = document.querySelectorAll('.risk-bar');
    bars.forEach(function (bar) {
      var risk = parseInt(bar.getAttribute('data-risk'), 10) || 0;
      bar.innerHTML = '';
      for (var i = 0; i < 5; i++) {
        var dot = document.createElement('span');
        dot.style.display = 'inline-block';
        dot.style.width = '6px';
        dot.style.height = '6px';
        dot.style.borderRadius = '50%';
        dot.style.marginRight = '2px';
        if (i < risk) {
          var colors = ['#34d399', '#34d399', '#fbbf24', '#f87171', '#f87171'];
          dot.style.background = colors[i] || '#f87171';
        } else {
          dot.style.background = '#3f3f46';
        }
        bar.appendChild(dot);
      }
    });
  }

  // ===== IDLE AMBIENT — chrome light drift =====
  function initAmbientCanvas() {
    if (!ambientCanvas) return;
    var ctx = ambientCanvas.getContext('2d');
    var w, h;
    var orbs = [];
    var numOrbs = 5;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      ambientCanvas.width = w;
      ambientCanvas.height = h;
    }

    function createOrbs() {
      orbs = [];
      for (var i = 0; i < numOrbs; i++) {
        orbs.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.2,
          radius: 150 + Math.random() * 200,
          alpha: 0.02 + Math.random() * 0.03
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      orbs.forEach(function (orb) {
        // Update position
        orb.x += orb.vx;
        orb.y += orb.vy;

        // Wrap
        if (orb.x < -orb.radius) orb.x = w + orb.radius;
        if (orb.x > w + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = h + orb.radius;
        if (orb.y > h + orb.radius) orb.y = -orb.radius;

        // Draw radial gradient (chrome light)
        var grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        grad.addColorStop(0, 'rgba(192,192,192,' + orb.alpha + ')');
        grad.addColorStop(0.5, 'rgba(167,139,250,' + (orb.alpha * 0.4) + ')');
        grad.addColorStop(1, 'rgba(192,192,192,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(orb.x - orb.radius, orb.y - orb.radius, orb.radius * 2, orb.radius * 2);
      });

      requestAnimationFrame(draw);
    }

    resize();
    createOrbs();
    draw();

    window.addEventListener('resize', function () {
      resize();
      createOrbs();
    });
  }

  // ===== TIPPY.JS — chrome bubble tooltips =====
  function initTooltips() {
    if (typeof tippy !== 'undefined') {
      tippy('[data-tippy-content]', {
        theme: 'mercury',
        animation: 'scale',
        duration: [200, 150],
        arrow: true,
        delay: [300, 0],
        placement: 'top'
      });
    }
  }

  // ===== GSAP INTERACTIONS =====
  function initGSAPInteractions() {
    if (typeof gsap === 'undefined') return;

    // Button click — magnetic snap press
    var buttons = document.querySelectorAll('.chrome-btn');
    buttons.forEach(function (btn) {
      btn.addEventListener('mousedown', function () {
        gsap.to(btn, {
          scale: 0.94,
          duration: 0.08,
          ease: 'power2.in'
        });
      });
      btn.addEventListener('mouseup', function () {
        gsap.to(btn, {
          scale: 1,
          duration: 0.3,
          ease: 'elastic.out(1,0.4)'
        });
      });
      btn.addEventListener('mouseleave', function () {
        gsap.to(btn, {
          scale: 1,
          duration: 0.2,
          ease: 'power2.out'
        });
      });
    });

    // Card hover — slight magnetic pull
    var cards = document.querySelectorAll('.kanban-card, .gauge-card, .idea-entry, .wb-node');
    cards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        gsap.to(card, {
          y: -2,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
      card.addEventListener('mouseleave', function () {
        gsap.to(card, {
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });

    // Command palette modal — scale in
    var modal = document.querySelector('.command-palette-modal');
    if (modal) {
      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
          if (m.type === 'attributes' && m.attributeName === 'class') {
            if (commandBackdrop.classList.contains('open')) {
              gsap.fromTo(modal,
                { scale: 0.92, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.3, ease: 'power3.out' }
              );
            }
          }
        });
      });
      observer.observe(commandBackdrop, { attributes: true });
    }
  }

  // ===== DIRECTORY TREE TOGGLE =====
  function initTreeToggles() {
    var toggles = document.querySelectorAll('.tree-item:not(.file)');
    toggles.forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.stopPropagation();
        var sibling = item.nextElementSibling;
        if (sibling && sibling.classList.contains('tree-children')) {
          var isOpen = item.classList.contains('open');
          if (isOpen) {
            item.classList.remove('open');
            sibling.style.display = 'none';
          } else {
            item.classList.add('open');
            sibling.style.display = 'block';
          }
        }
      });
    });
  }

  // ===== WORKSPACE TAB SWITCHING =====
  function initWorkspaceTabs() {
    var tabs = document.querySelectorAll('.ws-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        showMicroFeedback('Switched to ' + tab.textContent);
      });
    });
  }

  // ===== WHITEBOARD TOOLBAR =====
  function initWhiteboardToolbar() {
    var tools = document.querySelectorAll('.wb-toolbar .chrome-btn');
    tools.forEach(function (tool) {
      tool.addEventListener('click', function () {
        tools.forEach(function (t) { t.classList.remove('active'); });
        tool.classList.add('active');
      });
    });
  }

  // ===== CHAT SEND =====
  function initChat() {
    var chatInput = document.querySelector('.chat-input');
    var chatSend = document.querySelector('.chat-send');
    var chatMessages = document.querySelector('.chat-messages');

    function sendMessage() {
      var text = chatInput.value.trim();
      if (!text) return;

      // Create user message
      var msgDiv = document.createElement('div');
      msgDiv.className = 'chat-msg user';
      msgDiv.innerHTML = '<div class="chat-sender-badge user-badge">AC</div>' +
        '<div class="chat-bubble user-bubble"><p>' + escapeHtml(text) + '</p></div>' +
        '<span class="chat-time mono">' + getCurrentTime() + '</span>';
      chatMessages.appendChild(msgDiv);
      chatInput.value = '';

      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Show typing indicator
      if (typingIndicator) typingIndicator.style.display = 'flex';

      // Simulate AI response
      setTimeout(function () {
        if (typingIndicator) typingIndicator.style.display = 'none';
        var aiDiv = document.createElement('div');
        aiDiv.className = 'chat-msg ai';
        aiDiv.innerHTML = '<div class="chat-sender-badge ai-badge">Hg</div>' +
          '<div class="chat-bubble ai-bubble"><p>I\'ve analyzed your query regarding "' + escapeHtml(text.substring(0, 60)) + '". Based on current portfolio metrics and market conditions, I recommend reviewing the risk-adjusted returns against the benchmark before proceeding.</p></div>' +
          '<span class="chat-time mono">' + getCurrentTime() + '</span>';
        chatMessages.appendChild(aiDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        showMicroFeedback('Response received');
      }, 2000);
    }

    if (chatSend) {
      chatSend.addEventListener('click', sendMessage);
    }

    if (chatInput) {
      chatInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });
    }
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function getCurrentTime() {
    var now = new Date();
    return String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  }

  // ===== HASH CHANGE LISTENER =====
  window.addEventListener('hashchange', function () {
    var hash = window.location.hash.replace('#', '');
    if (hash && hash !== currentView) {
      navigateTo(hash);
    }
  });

  // ===== INIT =====
  function init() {
    initFromHash();
    hideLoading();
    initAmbientCanvas();
    initTooltips();
    initGSAPInteractions();
    initRiskBars();
    initGauges();
    initProgressBars();
    initTreeToggles();
    initWorkspaceTabs();
    initWhiteboardToolbar();
    initChat();

    // Delayed scroll reveal init
    setTimeout(function () {
      initScrollReveals();
    }, 2200);
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
