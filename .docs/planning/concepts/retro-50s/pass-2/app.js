/**
 * Retro 50s Pass 2 — Atomic-Age Googie
 * Navigation, interactions, hash routing, and UI logic
 */

(function () {
  'use strict';

  /* ============================
     DOM REFERENCES
     ============================ */
  const navTabs     = document.querySelectorAll('.nav-tab');
  const views       = document.querySelectorAll('.view[data-page]');
  const mobileBtn   = document.querySelector('.mobile-menu-btn');
  const googieNav   = document.querySelector('.googie-nav');
  const launchBtns  = document.querySelectorAll('.launch-btn');
  const toggleSwitches = document.querySelectorAll('.toggle-switch');
  const treeBranches   = document.querySelectorAll('.branch-toggle');
  const vpTabs         = document.querySelectorAll('.vp-tab');
  const mapTools       = document.querySelectorAll('.map-tool');

  /* ============================
     HASH ROUTING
     ============================ */
  const DEFAULT_VIEW = 'dashboard';

  function getHashView() {
    const hash = window.location.hash.replace('#', '').trim();
    return hash || DEFAULT_VIEW;
  }

  function navigateTo(viewName) {
    // Update hash without triggering a scroll
    history.pushState(null, '', '#' + viewName);
    activateView(viewName);
  }

  function activateView(viewName) {
    // Deactivate all views
    views.forEach(function (v) {
      v.classList.remove('active');
    });

    // Deactivate all nav tabs
    navTabs.forEach(function (t) {
      t.classList.remove('active');
    });

    // Find and activate the target view
    var targetView = document.querySelector('[data-page="' + viewName + '"]');
    if (targetView) {
      targetView.classList.add('active');
      // Re-trigger the entrance animation
      targetView.style.animation = 'none';
      // Force reflow
      void targetView.offsetHeight;
      targetView.style.animation = '';
    }

    // Activate the matching nav tab
    var targetTab = document.querySelector('[data-view="' + viewName + '"]');
    if (targetTab) {
      targetTab.classList.add('active');
      // Scroll the tab into view within the nav (for mobile overflow)
      targetTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    // Close mobile nav if open
    closeMobileNav();
  }

  /* ============================
     NAV TAB CLICKS
     ============================ */
  navTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var viewName = tab.getAttribute('data-view');
      if (viewName) {
        navigateTo(viewName);
      }
    });
  });

  /* ============================
     LAUNCH BUTTONS (Dashboard quick-launch)
     ============================ */
  launchBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var viewName = btn.getAttribute('data-view');
      if (viewName) {
        navigateTo(viewName);
      }
    });
  });

  /* ============================
     MOBILE MENU
     ============================ */
  function closeMobileNav() {
    googieNav.classList.remove('open');
    mobileBtn.setAttribute('aria-expanded', 'false');
    mobileBtn.classList.remove('open');
  }

  function toggleMobileNav() {
    var isOpen = googieNav.classList.toggle('open');
    mobileBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    mobileBtn.classList.toggle('open', isOpen);
  }

  if (mobileBtn) {
    mobileBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMobileNav();
    });
  }

  // Close mobile nav when clicking outside
  document.addEventListener('click', function (e) {
    if (googieNav.classList.contains('open') &&
        !googieNav.contains(e.target) &&
        !mobileBtn.contains(e.target)) {
      closeMobileNav();
    }
  });

  /* ============================
     TOGGLE SWITCHES (Settings)
     ============================ */
  toggleSwitches.forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      var isActive = toggle.classList.toggle('active');
      toggle.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  });

  /* ============================
     DIRECTORY TREE BRANCH TOGGLES
     ============================ */
  treeBranches.forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      var branch = toggle.closest('.tree-branch');
      if (branch) {
        branch.classList.toggle('open');
        // Update caret
        if (branch.classList.contains('open')) {
          toggle.textContent = '\u25BE'; // down caret
        } else {
          toggle.textContent = '\u25B6'; // right caret
        }
      }
    });
  });

  /* ============================
     VIEWPORT TABS (Project Workspace)
     ============================ */
  vpTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      vpTabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
    });
  });

  /* ============================
     MAP TOOLS (Whiteboard)
     ============================ */
  mapTools.forEach(function (tool) {
    tool.addEventListener('click', function () {
      // Only toggle within the tool group (skip zoom/fit which act immediately)
      var title = tool.getAttribute('title');
      if (title === 'Zoom In' || title === 'Zoom Out' || title === 'Fit View') {
        // Zoom actions — brief active flash
        tool.classList.add('active');
        setTimeout(function () { tool.classList.remove('active'); }, 300);
        return;
      }
      mapTools.forEach(function (t) {
        var tTitle = t.getAttribute('title');
        if (tTitle !== 'Zoom In' && tTitle !== 'Zoom Out' && tTitle !== 'Fit View') {
          t.classList.remove('active');
        }
      });
      tool.classList.add('active');
    });
  });

  /* ============================
     CONSTELLATION NODE DRAGGING (Whiteboard)
     ============================ */
  var dragNode = null;
  var dragOffsetX = 0;
  var dragOffsetY = 0;

  document.querySelectorAll('.constellation-node').forEach(function (node) {
    node.addEventListener('mousedown', function (e) {
      dragNode = node;
      var rect = node.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;
      node.style.zIndex = '10';
      e.preventDefault();
    });
  });

  document.addEventListener('mousemove', function (e) {
    if (!dragNode) return;
    var canvas = document.querySelector('.starmap-canvas');
    if (!canvas) return;
    var canvasRect = canvas.getBoundingClientRect();
    var x = e.clientX - canvasRect.left - dragOffsetX;
    var y = e.clientY - canvasRect.top - dragOffsetY;
    // Clamp to canvas
    x = Math.max(0, Math.min(canvasRect.width - 80, x));
    y = Math.max(0, Math.min(canvasRect.height - 50, y));
    // Convert to percentage
    dragNode.style.left = ((x / canvasRect.width) * 100) + '%';
    dragNode.style.top  = ((y / canvasRect.height) * 100) + '%';
  });

  document.addEventListener('mouseup', function () {
    if (dragNode) {
      dragNode.style.zIndex = '2';
      dragNode = null;
    }
  });

  /* ============================
     DIAL KNOB INTERACTION (Settings)
     ============================ */
  document.querySelectorAll('.dial-knob').forEach(function (knob) {
    var isDragging = false;
    var startAngle = 0;

    knob.addEventListener('mousedown', function (e) {
      isDragging = true;
      var rect = knob.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      startAngle = Math.atan2(e.clientY - cy, e.clientX - cx);
      e.preventDefault();
    });

    document.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      var rect = knob.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var angle = Math.atan2(e.clientY - cy, e.clientX - cx);
      var rotation = (angle - startAngle) * (180 / Math.PI);
      var indicator = knob.querySelector('.knob-indicator');
      if (indicator) {
        var current = parseFloat(indicator.dataset.rotation || '0');
        current += rotation;
        current = Math.max(-135, Math.min(135, current));
        indicator.dataset.rotation = current;
        indicator.style.transform = 'translateX(-50%) rotate(' + current + 'deg)';
      }
      startAngle = angle;
    });

    document.addEventListener('mouseup', function () {
      isDragging = false;
    });
  });

  /* ============================
     ANIMATED ORBITAL STAT RINGS
     ============================ */
  function animateRings() {
    document.querySelectorAll('.ring-fill').forEach(function (ring) {
      var percent = parseInt(ring.style.getPropertyValue('--percent'), 10) || 0;
      // Trigger re-animation by resetting
      ring.style.strokeDashoffset = '327';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          ring.style.strokeDashoffset = String(327 - (327 * percent) / 100);
        });
      });
    });
  }

  /* ============================
     AI CHAT — SIMULATED TRANSMIT
     ============================ */
  var commInput  = document.querySelector('.comm-input');
  var transmitBtn = document.querySelector('.transmit-btn');
  var commLog     = document.querySelector('.comm-log');

  function sendMessage() {
    if (!commInput || !commLog) return;
    var text = commInput.value.trim();
    if (!text) return;

    // Create outgoing message
    var msgDiv = document.createElement('div');
    msgDiv.className = 'comm-message outgoing';
    msgDiv.innerHTML =
      '<div class="msg-signal" aria-hidden="true">' +
        '<span class="wave-bar"></span><span class="wave-bar"></span><span class="wave-bar"></span>' +
      '</div>' +
      '<div class="msg-content">' +
        '<p>' + escapeHtml(text) + '</p>' +
        '<span class="msg-meta">You &middot; Just now</span>' +
      '</div>';
    commLog.appendChild(msgDiv);
    commInput.value = '';
    commLog.scrollTop = commLog.scrollHeight;

    // Simulate AI response after a brief delay
    setTimeout(function () {
      var aiDiv = document.createElement('div');
      aiDiv.className = 'comm-message incoming';
      aiDiv.innerHTML =
        '<div class="msg-signal" aria-hidden="true">' +
          '<span class="wave-bar"></span><span class="wave-bar"></span><span class="wave-bar"></span>' +
        '</div>' +
        '<div class="msg-content">' +
          '<p>Roger that, transmission received! I\'ll analyze your request and get back to you shortly. Over.</p>' +
          '<span class="msg-meta">AI Copilot &middot; Just now</span>' +
        '</div>';
      commLog.appendChild(aiDiv);
      commLog.scrollTop = commLog.scrollHeight;
    }, 1200);
  }

  if (transmitBtn) {
    transmitBtn.addEventListener('click', sendMessage);
  }

  if (commInput) {
    commInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  /* ============================
     IDEAS — SIMULATED LAUNCH
     ============================ */
  var ideaInput   = document.querySelector('.idea-input');
  var launchIdea  = document.querySelector('.launch-idea-btn');
  var cometStream = document.querySelector('.comet-stream');

  function launchNewIdea() {
    if (!ideaInput || !cometStream) return;
    var text = ideaInput.value.trim();
    if (!text) return;

    var card = document.createElement('div');
    card.className = 'comet-card';
    card.innerHTML =
      '<span class="comet-tail" aria-hidden="true"></span>' +
      '<div class="comet-body">' +
        '<h4>' + escapeHtml(text) + '</h4>' +
        '<p>A freshly launched idea — ready for orbit.</p>' +
        '<div class="comet-meta">' +
          '<span class="comet-author">You</span>' +
          '<span class="comet-time">Just now</span>' +
          '<span class="comet-votes">&#9733; 0</span>' +
        '</div>' +
      '</div>';

    // Insert at top
    cometStream.insertBefore(card, cometStream.firstChild);
    ideaInput.value = '';

    // Animate in
    card.style.opacity = '0';
    card.style.transform = 'translateX(-30px)';
    requestAnimationFrame(function () {
      card.style.transition = 'opacity .5s var(--ease-orbital), transform .5s var(--ease-orbital)';
      card.style.opacity = '1';
      card.style.transform = 'translateX(0)';
    });
  }

  if (launchIdea) {
    launchIdea.addEventListener('click', launchNewIdea);
  }

  if (ideaInput) {
    ideaInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        launchNewIdea();
      }
    });
  }

  /* ============================
     HTML ESCAPE UTILITY
     ============================ */
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ============================
     KEYBOARD NAV (A11Y)
     ============================ */
  document.addEventListener('keydown', function (e) {
    // Escape closes mobile nav
    if (e.key === 'Escape' && googieNav.classList.contains('open')) {
      closeMobileNav();
      mobileBtn.focus();
    }
  });

  /* ============================
     INTERSECTION OBSERVER — Animate rings on view
     ============================ */
  if ('IntersectionObserver' in window) {
    var ringObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateRings();
          ringObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    var dashboardView = document.querySelector('[data-page="dashboard"]');
    if (dashboardView) {
      ringObserver.observe(dashboardView);
    }
  }

  /* ============================
     HASHCHANGE LISTENER
     ============================ */
  window.addEventListener('hashchange', function () {
    var view = getHashView();
    activateView(view);
    if (view === 'dashboard') {
      animateRings();
    }
  });

  /* ============================
     INIT
     ============================ */
  function init() {
    var initialView = getHashView();
    activateView(initialView);
    if (initialView === 'dashboard') {
      // Small delay so the CSS transition fires properly
      setTimeout(animateRings, 300);
    }
  }

  // Wait for fonts + DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
