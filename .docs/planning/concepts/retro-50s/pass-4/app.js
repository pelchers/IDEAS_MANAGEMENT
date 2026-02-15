/* ============================================
   SWEET COUNTER - App Logic
   Soda Fountain Pharmacy / Pass 4 / Retro 50s
   ============================================ */

(function () {
  'use strict';

  // --- State ---
  let currentView = 'dashboard';
  let tooltipTimer = null;

  // --- DOM refs ---
  const contentPanel = document.getElementById('content-panel');
  const dock = document.getElementById('floating-dock');
  const dockItems = dock.querySelectorAll('.dock-item');
  const views = contentPanel.querySelectorAll('.view');
  const loadingScreen = document.getElementById('loading-screen');
  const cherryFeedback = document.getElementById('cherry-feedback');
  const tooltipLayer = document.getElementById('tooltip-layer');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');

  // --- Loading Screen (straw-bubbles-rise) ---
  function hideLoadingScreen() {
    loadingScreen.classList.add('hidden');
    // Start entrance animations after load
    setTimeout(() => {
      applyScrollReveals();
    }, 300);
  }

  window.addEventListener('load', function () {
    setTimeout(hideLoadingScreen, 1200);
  });

  // --- Hash-based Navigation ---
  function navigateTo(viewName) {
    if (viewName === currentView) return;

    // Deactivate current
    views.forEach(function (v) {
      v.classList.remove('active');
    });
    dockItems.forEach(function (d) {
      d.classList.remove('active');
    });

    // Activate target
    var target = contentPanel.querySelector('[data-page="' + viewName + '"]');
    if (!target) return;

    currentView = viewName;
    target.classList.add('active');

    // Receipt-roll-down page transition: re-trigger animation
    var inner = target.querySelector('.view-inner');
    if (inner) {
      inner.classList.remove('receipt-roll');
      // Force reflow
      void inner.offsetWidth;
      inner.classList.add('receipt-roll');
    }

    // Update dock active state (cherry-dot-marker)
    var dockBtn = dock.querySelector('[data-view="' + viewName + '"]');
    if (dockBtn) {
      dockBtn.classList.add('active');
    }

    // Update hash
    window.location.hash = viewName;

    // Scroll content to top
    contentPanel.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Re-apply scroll reveals for new view
    setTimeout(function () {
      applyScrollReveals();
    }, 100);

    // Close mobile expanded dock
    dock.classList.remove('mobile-expanded');
    mobileMenuBtn.classList.remove('open');
  }

  // Dock click handlers
  dockItems.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var viewName = this.getAttribute('data-view');
      navigateTo(viewName);
    });
  });

  // Hash change listener
  window.addEventListener('hashchange', function () {
    var hash = window.location.hash.replace('#', '');
    if (hash && hash !== currentView) {
      navigateTo(hash);
    }
  });

  // Initial view from hash or default
  function initView() {
    var hash = window.location.hash.replace('#', '');
    var validViews = [];
    views.forEach(function (v) {
      validViews.push(v.getAttribute('data-page'));
    });

    if (hash && validViews.indexOf(hash) !== -1) {
      currentView = '';
      navigateTo(hash);
    } else {
      // Activate dashboard
      var dashView = contentPanel.querySelector('[data-page="dashboard"]');
      if (dashView) dashView.classList.add('active');
      var dashBtn = dock.querySelector('[data-view="dashboard"]');
      if (dashBtn) dashBtn.classList.add('active');
    }
  }

  initView();

  // --- Mobile Hamburger Menu ---
  mobileMenuBtn.addEventListener('click', function () {
    this.classList.toggle('open');
    dock.classList.toggle('mobile-expanded');
  });

  // --- Soda Fizz Burst on Button Click (buttonClick) ---
  function createFizzBurst(element) {
    var rect = element.getBoundingClientRect();
    var centerX = rect.left + rect.width / 2;
    var centerY = rect.top + rect.height / 2;

    for (var i = 0; i < 8; i++) {
      var particle = document.createElement('div');
      particle.className = 'fizz-particle';
      particle.style.position = 'fixed';
      particle.style.left = centerX + 'px';
      particle.style.top = centerY + 'px';
      particle.style.zIndex = '9999';
      document.body.appendChild(particle);

      var angle = (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.5;
      var distance = 20 + Math.random() * 30;
      var size = 3 + Math.random() * 4;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';

      // Use GSAP for spring-bounce fizz animation
      if (typeof gsap !== 'undefined') {
        gsap.to(particle, {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance - 30, // bias upward like bubbles
          opacity: 0,
          scale: 0.3,
          duration: 0.6,
          ease: 'power2.out',
          onComplete: function () {
            if (particle.parentNode) {
              particle.parentNode.removeChild(particle);
            }
          }
        });
      } else {
        // Fallback: simple removal
        setTimeout(function () {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, 600);
      }
    }
  }

  // Attach fizz burst to all primary buttons
  document.querySelectorAll('.btn-primary, .btn-send').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      createFizzBurst(this);
    });
  });

  // --- Cherry on Top - Micro Feedback (microFeedback) ---
  function showCherryFeedback(x, y) {
    cherryFeedback.style.left = x + 'px';
    cherryFeedback.style.top = (y - 40) + 'px';
    cherryFeedback.classList.add('show');

    setTimeout(function () {
      cherryFeedback.classList.remove('show');
    }, 800);
  }

  // Cherry feedback on checkbox toggle
  document.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
    cb.addEventListener('change', function () {
      if (this.checked) {
        var rect = this.getBoundingClientRect();
        showCherryFeedback(rect.left + rect.width / 2, rect.top);

        // Also fire confetti on check
        if (typeof confetti === 'function') {
          confetti({
            particleCount: 12,
            spread: 40,
            origin: {
              x: (rect.left + rect.width / 2) / window.innerWidth,
              y: rect.top / window.innerHeight
            },
            colors: ['#cc2233', '#88c8e8', '#f5f0e8'],
            gravity: 1.2,
            scalar: 0.6,
            ticks: 40
          });
        }
      }
    });
  });

  // Cherry feedback on save settings
  document.querySelectorAll('[data-action="save-settings"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var rect = this.getBoundingClientRect();
      showCherryFeedback(rect.left + rect.width / 2, rect.top);

      if (typeof confetti === 'function') {
        confetti({
          particleCount: 30,
          spread: 60,
          origin: {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: rect.top / window.innerHeight
          },
          colors: ['#cc2233', '#88c8e8', '#f5f0e8', '#3a8a4a'],
          gravity: 1,
          scalar: 0.7,
          ticks: 60
        });
      }
    });
  });

  // --- Recipe Card Tooltip (tooltips: recipe-card-popup) ---
  var tooltipElements = document.querySelectorAll('[data-tooltip]');

  tooltipElements.forEach(function (el) {
    el.addEventListener('mouseenter', function (e) {
      var text = this.getAttribute('data-tooltip');
      if (!text) return;

      clearTimeout(tooltipTimer);

      var tooltipBody = tooltipLayer.querySelector('.tooltip-body');
      var tooltipHeader = tooltipLayer.querySelector('.tooltip-header');
      tooltipHeader.textContent = 'Note';
      tooltipBody.textContent = text;

      var rect = this.getBoundingClientRect();
      tooltipLayer.style.left = rect.left + 'px';
      tooltipLayer.style.top = (rect.bottom + 10) + 'px';
      tooltipLayer.classList.add('visible');
    });

    el.addEventListener('mouseleave', function () {
      tooltipTimer = setTimeout(function () {
        tooltipLayer.classList.remove('visible');
      }, 150);
    });
  });

  // --- Toggle Switch: Soda Tap Pull (toggleSwitch) ---
  document.querySelectorAll('.soda-toggle').forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      this.classList.toggle('active');
      var label = this.querySelector('.toggle-label');
      if (label) {
        label.textContent = this.classList.contains('active') ? 'On' : 'Off';
      }

      // Animate handle with GSAP spring bounce
      var handle = this.querySelector('.toggle-handle');
      if (typeof gsap !== 'undefined' && handle) {
        gsap.fromTo(handle, {
          scaleY: 0.75
        }, {
          scaleY: 1,
          duration: 0.4,
          ease: 'elastic.out(1.2, 0.5)'
        });
      }
    });
  });

  // --- Workspace Stool Tab Navigation ---
  document.querySelectorAll('.stool-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var tabName = this.getAttribute('data-ws-tab');
      var parent = this.closest('.view');

      // Deactivate all tabs
      parent.querySelectorAll('.stool-tab').forEach(function (t) {
        t.classList.remove('active');
      });
      parent.querySelectorAll('.ws-panel').forEach(function (p) {
        p.classList.remove('active');
      });

      // Activate clicked tab
      this.classList.add('active');
      var panel = parent.querySelector('[data-ws-panel="' + tabName + '"]');
      if (panel) {
        panel.classList.add('active');
        // Animate panel entrance
        if (typeof gsap !== 'undefined') {
          gsap.from(panel, {
            y: 20,
            opacity: 0,
            duration: 0.35,
            ease: 'back.out(1.5)'
          });
        }
      }
    });
  });

  // --- Scroll Reveal: Stagger Slide In Right ---
  function applyScrollReveals() {
    var activeView = contentPanel.querySelector('.view.active');
    if (!activeView) return;

    // Find revealable elements: cards, list items, sections
    var revealTargets = activeView.querySelectorAll(
      '.special-card, .menu-card, .recipe-card-k, .schema-recipe-card, ' +
      '.dir-section, .order-line-item, .napkin-message, .control-group, ' +
      '.task-item, .receipt-line, .milestone, .recipe-item, .team-member'
    );

    if (typeof gsap !== 'undefined') {
      gsap.set(revealTargets, { opacity: 0, x: 30 });
      gsap.to(revealTargets, {
        opacity: 1,
        x: 0,
        duration: 0.45,
        ease: 'back.out(1.2)',
        stagger: 0.05,
        delay: 0.1
      });
    } else {
      // CSS fallback
      revealTargets.forEach(function (el, i) {
        el.classList.add('scroll-reveal-item');
        setTimeout(function () {
          el.classList.add('revealed');
        }, 60 * i + 100);
      });
    }
  }

  // --- Input Focus: Blue Tint Border (handled in CSS) ---
  // The CSS handles focus states for .chat-input and .setting-input

  // --- Scroll-triggered reveals using GSAP ScrollTrigger ---
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Re-trigger scroll reveals on scroll for cards that are below the fold
    ScrollTrigger.defaults({
      toggleActions: 'play none none none'
    });
  }

  // --- Idle Ambient: none (per profile) ---
  // No ambient animation per the interaction profile

  // --- Keyboard Accessibility ---
  document.addEventListener('keydown', function (e) {
    // Allow keyboard navigation of dock items
    if (e.key === 'Tab' && document.activeElement) {
      var activeDock = document.activeElement.closest('.floating-dock');
      if (activeDock) {
        // Let natural tab flow work within dock
      }
    }
  });

  // --- GSAP Spring Bounce Motion Language for interactive elements ---
  if (typeof gsap !== 'undefined') {
    // Add hover spring to all cards
    document.querySelectorAll('.special-card, .menu-card, .recipe-card-k, .schema-recipe-card').forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        gsap.to(this, {
          y: -4,
          rotation: 1,
          duration: 0.3,
          ease: 'back.out(2)'
        });
      });
      card.addEventListener('mouseleave', function () {
        gsap.to(this, {
          y: 0,
          rotation: 0,
          duration: 0.4,
          ease: 'elastic.out(0.8, 0.5)'
        });
      });
    });

    // Spring bounce on dock items
    dockItems.forEach(function (item) {
      item.addEventListener('mouseenter', function () {
        gsap.to(this, {
          scale: 1.08,
          duration: 0.25,
          ease: 'back.out(2.5)'
        });
      });
      item.addEventListener('mouseleave', function () {
        gsap.to(this, {
          scale: 1,
          duration: 0.3,
          ease: 'elastic.out(0.6, 0.4)'
        });
      });
    });
  }

  // --- Add-project and Add-idea button feedback ---
  document.querySelectorAll('[data-action="add-project"], [data-action="add-idea"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var rect = this.getBoundingClientRect();
      showCherryFeedback(rect.left + rect.width / 2, rect.top);
    });
  });

  // --- Chat Send ---
  var chatInput = document.querySelector('.chat-input');
  var sendBtn = document.querySelector('.btn-send');

  if (sendBtn && chatInput) {
    sendBtn.addEventListener('click', function () {
      var text = chatInput.value.trim();
      if (!text) return;

      var chatContainer = document.querySelector('.napkin-chat');

      // Add user message
      var userMsg = document.createElement('div');
      userMsg.className = 'napkin-message from-user';
      userMsg.innerHTML = '<div class="napkin-paper user"><span class="napkin-sender">You</span><p>' + escapeHtml(text) + '</p></div>';
      chatContainer.appendChild(userMsg);

      // Animate in
      if (typeof gsap !== 'undefined') {
        gsap.from(userMsg, { x: 30, opacity: 0, duration: 0.35, ease: 'back.out(1.5)' });
      }

      chatInput.value = '';

      // Auto-scroll chat
      chatContainer.scrollTop = chatContainer.scrollHeight;

      // Simulate AI response after delay
      setTimeout(function () {
        var aiMsg = document.createElement('div');
        aiMsg.className = 'napkin-message from-ai';
        aiMsg.innerHTML = '<div class="napkin-paper"><span class="napkin-sender">Counter Assistant</span><p>Got it! I have noted that down. Let me check the kitchen schedule and get back to you with a plan.</p></div>';
        chatContainer.appendChild(aiMsg);

        if (typeof gsap !== 'undefined') {
          gsap.from(aiMsg, { x: -30, opacity: 0, duration: 0.35, ease: 'back.out(1.5)' });
        }

        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Cherry feedback on AI response
        var rect = aiMsg.getBoundingClientRect();
        showCherryFeedback(rect.left + 20, rect.top);
      }, 1000);
    });

    // Send on Enter key
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        sendBtn.click();
      }
    });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Chalkboard tool buttons ---
  document.querySelectorAll('.chalk-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var parent = this.closest('.chalk-tools');
      parent.querySelectorAll('.chalk-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      this.classList.add('active');
    });
  });

  // --- Make sticky notes draggable on whiteboard ---
  var stickies = document.querySelectorAll('.chalk-sticky');
  stickies.forEach(function (sticky) {
    var isDragging = false;
    var startX, startY, origLeft, origTop;

    sticky.addEventListener('mousedown', function (e) {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      origLeft = sticky.offsetLeft;
      origTop = sticky.offsetTop;
      sticky.style.zIndex = '10';
      sticky.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      sticky.style.left = origLeft + dx + 'px';
      sticky.style.top = origTop + dy + 'px';
    });

    document.addEventListener('mouseup', function () {
      if (isDragging) {
        isDragging = false;
        sticky.style.zIndex = '';
        sticky.style.cursor = 'move';
      }
    });
  });

})();
