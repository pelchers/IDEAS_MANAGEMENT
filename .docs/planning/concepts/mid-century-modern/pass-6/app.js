/* =============================================
   POP! STUDIO - Pop Art Warhol Screen Print
   Pass 6 Application Logic
   ============================================= */

(function () {
  'use strict';

  // ---- DOM References ----
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const collapseBtn = document.getElementById('sidebarCollapseBtn');
  const powBurst = document.getElementById('pow-burst');
  const zapBurst = document.getElementById('zap-burst');
  const tooltip = document.getElementById('speechBubbleTooltip');
  const tooltipText = tooltip.querySelector('.tooltip-text');
  const cmykLoader = document.getElementById('cmyk-loader');

  // ---- CMYK Loading Screen ----
  function hideCmykLoader() {
    setTimeout(function () {
      cmykLoader.classList.add('hidden');
    }, 1600);
  }

  // ---- Navigation ----
  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.view');

  function switchView(viewId) {
    views.forEach(function (v) {
      v.classList.remove('active');
    });
    navItems.forEach(function (n) {
      n.classList.remove('active');
    });

    var target = document.getElementById('view-' + viewId);
    if (target) {
      target.classList.add('active');
      // Trigger scroll reveals for the new view
      setTimeout(function () {
        checkScrollReveals();
      }, 100);
    }

    navItems.forEach(function (n) {
      if (n.getAttribute('data-view') === viewId) {
        n.classList.add('active');
      }
    });

    // Close mobile menu
    closeMobileMenu();
  }

  navItems.forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      var viewId = this.getAttribute('data-view');
      switchView(viewId);
    });
  });

  // ---- Accordion Navigation ----
  var sectionHeaders = document.querySelectorAll('.nav-section-header');
  sectionHeaders.forEach(function (header) {
    header.addEventListener('click', function () {
      var section = this.getAttribute('data-section');
      var items = document.querySelector('[data-section-items="' + section + '"]');
      var isExpanded = this.getAttribute('aria-expanded') === 'true';

      this.setAttribute('aria-expanded', !isExpanded);
      if (isExpanded) {
        items.classList.add('collapsed');
      } else {
        items.classList.remove('collapsed');
      }
    });
  });

  // ---- Sidebar Collapse ----
  collapseBtn.addEventListener('click', function () {
    sidebar.classList.toggle('collapsed');
  });

  // ---- Mobile Menu ----
  var sidebarOverlay = document.createElement('div');
  sidebarOverlay.className = 'sidebar-overlay';
  document.body.appendChild(sidebarOverlay);

  function openMobileMenu() {
    sidebar.classList.add('mobile-open');
    mobileToggle.classList.add('active');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    sidebar.classList.remove('mobile-open');
    mobileToggle.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  mobileToggle.addEventListener('click', function () {
    if (sidebar.classList.contains('mobile-open')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  sidebarOverlay.addEventListener('click', closeMobileMenu);

  // ---- POW! Burst (Button Click) ----
  function triggerPow(x, y) {
    powBurst.style.left = (x - 40) + 'px';
    powBurst.style.top = (y - 40) + 'px';
    powBurst.classList.remove('active');
    void powBurst.offsetWidth; // reflow
    powBurst.classList.add('active');
    setTimeout(function () {
      powBurst.classList.remove('active');
    }, 600);
  }

  // ---- ZAP! Starburst (Micro Feedback) ----
  function triggerZap(x, y) {
    zapBurst.style.left = (x - 35) + 'px';
    zapBurst.style.top = (y - 35) + 'px';
    zapBurst.classList.remove('active');
    void zapBurst.offsetWidth;
    zapBurst.classList.add('active');
    setTimeout(function () {
      zapBurst.classList.remove('active');
    }, 500);
  }

  // Attach POW to all pop buttons
  document.querySelectorAll('.pop-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      triggerPow(e.clientX, e.clientY);
    });
  });

  // ---- Comic Speech Bubble Tooltips ----
  var tooltipElements = document.querySelectorAll('[data-tooltip]');

  tooltipElements.forEach(function (el) {
    el.addEventListener('mouseenter', function (e) {
      var text = this.getAttribute('data-tooltip');
      tooltipText.textContent = text;
      tooltip.classList.add('visible');

      var rect = this.getBoundingClientRect();
      var ttWidth = tooltip.offsetWidth || 150;
      tooltip.style.left = (rect.left + rect.width / 2 - ttWidth / 2) + 'px';
      tooltip.style.top = (rect.top - 46) + 'px';
    });

    el.addEventListener('mouseleave', function () {
      tooltip.classList.remove('visible');
    });
  });

  // ---- Comic Toggle SMASH Effect ----
  document.querySelectorAll('.comic-toggle input').forEach(function (toggle) {
    toggle.addEventListener('change', function () {
      var parent = this.closest('.comic-toggle');
      parent.classList.remove('smash');
      void parent.offsetWidth;
      parent.classList.add('smash');
      setTimeout(function () {
        parent.classList.remove('smash');
      }, 400);

      // ZAP micro-feedback on toggle
      var rect = parent.getBoundingClientRect();
      triggerZap(rect.left + rect.width / 2, rect.top);
    });
  });

  // ---- Color Swatch Selection ----
  document.querySelectorAll('.color-swatch').forEach(function (swatch) {
    swatch.addEventListener('click', function (e) {
      document.querySelectorAll('.color-swatch').forEach(function (s) {
        s.classList.remove('swatch-active');
      });
      this.classList.add('swatch-active');
      triggerZap(e.clientX, e.clientY);
    });
  });

  // ---- Scroll Reveal (Halftone Fade Resolve) ----
  function checkScrollReveals() {
    var reveals = document.querySelectorAll('.scroll-reveal');
    reveals.forEach(function (el, index) {
      var rect = el.getBoundingClientRect();
      var windowHeight = window.innerHeight;

      if (rect.top < windowHeight - 50) {
        // Stagger the reveal timing
        setTimeout(function () {
          el.classList.add('revealed');
        }, index * 80);
      }
    });
  }

  // Run on scroll and on load
  window.addEventListener('scroll', checkScrollReveals, { passive: true });
  mainContent.addEventListener('scroll', checkScrollReveals, { passive: true });

  // ---- Nav Item Hover Color Swap ----
  // Implemented via CSS, but we add dynamic hover class for JS-triggered transitions
  navItems.forEach(function (item) {
    item.addEventListener('mouseenter', function () {
      this.style.transition = 'background 0.15s, color 0.15s';
    });
  });

  // ---- Whiteboard Node Drag ----
  var whiteboardCanvas = document.getElementById('whiteboardCanvas');
  if (whiteboardCanvas) {
    var nodes = whiteboardCanvas.querySelectorAll('.wb-node');
    var dragTarget = null;
    var dragOffsetX = 0;
    var dragOffsetY = 0;

    nodes.forEach(function (node) {
      node.addEventListener('mousedown', startDrag);
      node.addEventListener('touchstart', startDragTouch, { passive: false });
    });

    function startDrag(e) {
      dragTarget = this;
      var rect = dragTarget.getBoundingClientRect();
      var canvasRect = whiteboardCanvas.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;
      dragTarget.style.zIndex = 20;
      dragTarget.style.cursor = 'grabbing';
      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', endDrag);
    }

    function startDragTouch(e) {
      e.preventDefault();
      dragTarget = this;
      var touch = e.touches[0];
      var rect = dragTarget.getBoundingClientRect();
      dragOffsetX = touch.clientX - rect.left;
      dragOffsetY = touch.clientY - rect.top;
      dragTarget.style.zIndex = 20;
      document.addEventListener('touchmove', onDragTouch, { passive: false });
      document.addEventListener('touchend', endDragTouch);
    }

    function onDrag(e) {
      if (!dragTarget) return;
      var canvasRect = whiteboardCanvas.getBoundingClientRect();
      var x = e.clientX - canvasRect.left - dragOffsetX;
      var y = e.clientY - canvasRect.top - dragOffsetY;
      x = Math.max(0, Math.min(x, canvasRect.width - dragTarget.offsetWidth));
      y = Math.max(0, Math.min(y, canvasRect.height - dragTarget.offsetHeight));
      dragTarget.style.left = x + 'px';
      dragTarget.style.top = y + 'px';
    }

    function onDragTouch(e) {
      e.preventDefault();
      if (!dragTarget) return;
      var touch = e.touches[0];
      var canvasRect = whiteboardCanvas.getBoundingClientRect();
      var x = touch.clientX - canvasRect.left - dragOffsetX;
      var y = touch.clientY - canvasRect.top - dragOffsetY;
      x = Math.max(0, Math.min(x, canvasRect.width - dragTarget.offsetWidth));
      y = Math.max(0, Math.min(y, canvasRect.height - dragTarget.offsetHeight));
      dragTarget.style.left = x + 'px';
      dragTarget.style.top = y + 'px';
    }

    function endDrag() {
      if (dragTarget) {
        dragTarget.style.zIndex = '';
        dragTarget.style.cursor = 'grab';
      }
      dragTarget = null;
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', endDrag);
    }

    function endDragTouch() {
      if (dragTarget) {
        dragTarget.style.zIndex = '';
      }
      dragTarget = null;
      document.removeEventListener('touchmove', onDragTouch);
      document.removeEventListener('touchend', endDragTouch);
    }
  }

  // ---- Whiteboard Toolbar ----
  document.querySelectorAll('.wb-tool:not(.wb-color)').forEach(function (tool) {
    tool.addEventListener('click', function () {
      document.querySelectorAll('.wb-tool:not(.wb-color)').forEach(function (t) {
        t.classList.remove('active');
      });
      this.classList.add('active');
    });
  });

  document.querySelectorAll('.wb-color').forEach(function (color) {
    color.addEventListener('click', function () {
      document.querySelectorAll('.wb-color').forEach(function (c) {
        c.classList.remove('active');
      });
      this.classList.add('active');
    });
  });

  // ---- Chat Send ----
  var chatInput = document.querySelector('.chat-input');
  var chatSendBtn = document.querySelector('.chat-send-btn');
  var chatMessages = document.getElementById('chatMessages');

  if (chatSendBtn && chatInput && chatMessages) {
    function sendMessage() {
      var text = chatInput.value.trim();
      if (!text) return;

      // Create user bubble
      var bubble = document.createElement('div');
      bubble.className = 'chat-bubble bubble-user';
      bubble.innerHTML =
        '<div class="bubble-content"><p>' + escapeHtml(text) + '</p></div>' +
        '<div class="bubble-avatar">YOU</div>';
      chatMessages.appendChild(bubble);

      chatInput.value = '';
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Simulate AI response after delay
      setTimeout(function () {
        var aiBubble = document.createElement('div');
        aiBubble.className = 'chat-bubble bubble-ai';
        aiBubble.innerHTML =
          '<div class="bubble-avatar">AI</div>' +
          '<div class="bubble-content">' +
          '<p>Great question! Let me think about that in the context of our editorial calendar and brand voice. I\'ll put together some options for you.</p>' +
          '<div class="bubble-emphasis">ZAP!</div>' +
          '</div>';
        chatMessages.appendChild(aiBubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 1200);
    }

    chatSendBtn.addEventListener('click', function (e) {
      sendMessage();
      triggerPow(e.clientX, e.clientY);
    });

    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ---- Halftone Ambient Background Drift ----
  // Already handled with CSS animation

  // ---- Input Focus Halftone Border ----
  // Already handled with CSS box-shadow on focus

  // ---- Page Transition (Comic Panel Wipe) ----
  // Already handled with CSS animation on .view.active

  // ---- Initialize ----
  function init() {
    hideCmykLoader();

    // Initial scroll reveal check
    setTimeout(function () {
      checkScrollReveals();
    }, 200);

    // Set initial view
    switchView('dashboard');
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
