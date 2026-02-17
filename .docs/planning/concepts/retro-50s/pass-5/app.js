/* ============================================================
   ROUTEKEEPER - PASS 5: MOTEL NEON ROADSIDE
   app.js - Navigation, interactions, GSAP animations
   ============================================================ */

(function () {
  'use strict';

  // ---- DOM REFS ----
  const loadingOverlay = document.getElementById('loading-overlay');
  const cmdTrigger = document.getElementById('cmd-palette-trigger');
  const cmdBackdrop = document.getElementById('cmd-palette-backdrop');
  const cmdPalette = document.getElementById('cmd-palette');
  const cmdSearchInput = document.getElementById('cmd-search-input');
  const cmdResults = document.getElementById('cmd-palette-results');
  const viewBadge = document.getElementById('current-view-badge');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileBackdrop = document.getElementById('mobile-nav-backdrop');
  const mobileClose = document.getElementById('mobile-nav-close');
  const checkinStamp = document.getElementById('checkin-stamp');
  const tooltip = document.getElementById('road-sign-tooltip');
  const mainContent = document.getElementById('main-content');

  const VIEW_LABELS = {
    'dashboard': 'Dashboard',
    'projects': 'Road Trips',
    'project-workspace': 'Trip Planner',
    'kanban': 'Route Board',
    'whiteboard': 'Route Map',
    'schema-planner': 'Stop Planner',
    'directory-tree': 'Highway Guide',
    'ideas': 'Snapshots',
    'ai-chat': 'CB Radio',
    'settings': 'Front Desk'
  };

  let currentView = 'dashboard';
  let highlightedIndex = -1;

  // ---- LOADING (VACANCY SIGN) ----
  function runVacancyLoading() {
    const letters = document.querySelectorAll('.v-letter');
    let idx = 0;
    const interval = setInterval(() => {
      letters.forEach(l => { l.classList.remove('lit', 'lit-pink'); });
      if (idx < letters.length) {
        for (let i = 0; i <= idx; i++) {
          letters[i].classList.add(i % 2 === 0 ? 'lit' : 'lit-pink');
        }
        idx++;
      } else {
        clearInterval(interval);
        // All lit, then hide
        setTimeout(() => {
          loadingOverlay.classList.add('hidden');
          initScrollReveals();
          startAmbientFlicker();
        }, 400);
      }
    }, 150);
  }
  runVacancyLoading();

  // ---- VIEW NAVIGATION ----
  function navigateTo(viewId) {
    if (viewId === currentView) return;

    // Hide all
    document.querySelectorAll('.view-panel').forEach(p => {
      p.style.display = 'none';
    });

    // Show target
    const target = document.getElementById('view-' + viewId);
    if (!target) return;
    target.style.display = '';

    // Re-trigger headlight sweep animation
    target.style.animation = 'none';
    target.offsetHeight; // reflow
    target.style.animation = 'headlight-sweep 0.7s ease-out';

    currentView = viewId;
    viewBadge.textContent = VIEW_LABELS[viewId] || viewId;

    // Update mobile nav active state
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewId);
    });

    // Re-trigger scroll reveals for new view
    setTimeout(() => initScrollReveals(), 100);

    // Show check-in stamp feedback
    showCheckinStamp();

    // Close palettes
    closeCmdPalette();
    closeMobileNav();
  }

  // ---- COMMAND PALETTE ----
  function openCmdPalette() {
    cmdBackdrop.classList.add('open');
    cmdSearchInput.value = '';
    filterCmdItems('');
    highlightedIndex = -1;
    setTimeout(() => cmdSearchInput.focus(), 100);
  }

  function closeCmdPalette() {
    cmdBackdrop.classList.remove('open');
    highlightedIndex = -1;
  }

  function filterCmdItems(query) {
    const items = cmdResults.querySelectorAll('.cmd-item');
    const q = query.toLowerCase().trim();
    items.forEach(item => {
      const label = item.querySelector('.cmd-item-label').textContent.toLowerCase();
      const hint = item.querySelector('.cmd-item-hint').textContent.toLowerCase();
      const match = !q || label.includes(q) || hint.includes(q);
      item.style.display = match ? '' : 'none';
      item.classList.remove('highlighted');
    });
    highlightedIndex = -1;
  }

  function getVisibleCmdItems() {
    return Array.from(cmdResults.querySelectorAll('.cmd-item'))
      .filter(i => i.style.display !== 'none');
  }

  function navigateCmdItems(direction) {
    const items = getVisibleCmdItems();
    if (!items.length) return;
    items.forEach(i => i.classList.remove('highlighted'));
    highlightedIndex += direction;
    if (highlightedIndex < 0) highlightedIndex = items.length - 1;
    if (highlightedIndex >= items.length) highlightedIndex = 0;
    items[highlightedIndex].classList.add('highlighted');
    items[highlightedIndex].scrollIntoView({ block: 'nearest' });
  }

  function selectHighlightedCmd() {
    const items = getVisibleCmdItems();
    if (highlightedIndex >= 0 && highlightedIndex < items.length) {
      const view = items[highlightedIndex].dataset.view;
      if (view) navigateTo(view);
    }
  }

  // Command palette trigger
  cmdTrigger.addEventListener('click', openCmdPalette);

  // Backdrop click
  cmdBackdrop.addEventListener('click', (e) => {
    if (e.target === cmdBackdrop) closeCmdPalette();
  });

  // Search input
  cmdSearchInput.addEventListener('input', () => {
    filterCmdItems(cmdSearchInput.value);
  });

  // Keyboard nav
  cmdSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateCmdItems(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateCmdItems(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      selectHighlightedCmd();
    } else if (e.key === 'Escape') {
      closeCmdPalette();
    }
  });

  // Ctrl+K shortcut
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (cmdBackdrop.classList.contains('open')) {
        closeCmdPalette();
      } else {
        openCmdPalette();
      }
    }
    if (e.key === 'Escape' && cmdBackdrop.classList.contains('open')) {
      closeCmdPalette();
    }
  });

  // Click nav items in command palette
  cmdResults.addEventListener('click', (e) => {
    const item = e.target.closest('.cmd-item');
    if (item && item.dataset.view) {
      navigateTo(item.dataset.view);
    }
  });

  // ---- MOBILE NAV ----
  function openMobileNav() {
    mobileBackdrop.classList.add('open');
  }
  function closeMobileNav() {
    mobileBackdrop.classList.remove('open');
  }

  mobileMenuBtn.addEventListener('click', openMobileNav);
  mobileClose.addEventListener('click', closeMobileNav);
  mobileBackdrop.addEventListener('click', (e) => {
    if (e.target === mobileBackdrop) closeMobileNav();
  });

  document.querySelectorAll('.mobile-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      if (item.dataset.view) navigateTo(item.dataset.view);
    });
  });

  // Set initial active
  document.querySelector('.mobile-nav-item[data-view="dashboard"]')?.classList.add('active');

  // ---- CHECKIN STAMP (Micro Feedback) ----
  function showCheckinStamp() {
    checkinStamp.classList.remove('show');
    void checkinStamp.offsetHeight;
    checkinStamp.classList.add('show');
    setTimeout(() => {
      checkinStamp.classList.remove('show');
    }, 900);
  }

  // ---- ROAD SIGN TOOLTIP ----
  function showTooltip(el, text) {
    tooltip.textContent = text;
    tooltip.classList.add('visible');
    const rect = el.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';

    // Clamp to viewport
    const ttRect = tooltip.getBoundingClientRect();
    if (ttRect.left < 8) tooltip.style.left = '8px';
    if (ttRect.right > window.innerWidth - 8) {
      tooltip.style.left = (window.innerWidth - tooltip.offsetWidth - 8) + 'px';
    }
    if (ttRect.top < 8) {
      tooltip.style.top = rect.bottom + 8 + 'px';
    }
  }

  function hideTooltip() {
    tooltip.classList.remove('visible');
  }

  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.addEventListener('mouseenter', () => showTooltip(el, el.dataset.tooltip));
    el.addEventListener('mouseleave', hideTooltip);
    el.addEventListener('focus', () => showTooltip(el, el.dataset.tooltip));
    el.addEventListener('blur', hideTooltip);
  });

  // ---- NEON TUBE FLICKER ON BUTTON HOVER ----
  document.querySelectorAll('button:not(.neon-toggle):not(.mobile-nav-item):not(.cmd-item)').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.animation = 'neon-tube-flicker 0.4s ease-out forwards';
      btn.style.boxShadow = '0 0 8px var(--accent), 2px 2px 0 var(--accent2)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.animation = '';
      btn.style.boxShadow = '';
    });
  });

  // ---- NEON BUZZ SNAP ON CLICK ----
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button, .license-card, .postcard-card, .polaroid');
    if (!btn) return;

    // Flash effect
    const flash = document.createElement('span');
    flash.className = 'neon-click-flash';
    btn.appendChild(flash);
    setTimeout(() => flash.remove(), 400);
  });

  // ---- VACANCY SIGN GLOW ON CARD HOVER ----
  // (Handled in CSS with vacancy-glow animation on .license-card:hover, .postcard-card:hover etc.)

  // ---- SCROLL REVEAL (road-sign-zoom-past) ----
  function initScrollReveals() {
    const reveals = document.querySelectorAll('.scroll-reveal');
    reveals.forEach(el => {
      el.classList.remove('revealed');
    });

    // Use IntersectionObserver for visible view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Stagger based on position among siblings
          const parent = entry.target.parentElement;
          if (parent) {
            const siblings = Array.from(parent.querySelectorAll('.scroll-reveal'));
            const idx = siblings.indexOf(entry.target);
            setTimeout(() => {
              entry.target.classList.add('revealed');
            }, idx * 120);
          } else {
            entry.target.classList.add('revealed');
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    // Only observe elements in the currently visible view
    const activeView = document.getElementById('view-' + currentView);
    if (activeView) {
      activeView.querySelectorAll('.scroll-reveal').forEach(el => {
        observer.observe(el);
      });
    }
  }

  // ---- NEON AMBIENT FLICKER ----
  function startAmbientFlicker() {
    const flickerTargets = document.querySelectorAll(
      '.stat-indicator.on, .vacancy-light.on, .cb-channel, .logo-neon'
    );
    flickerTargets.forEach(el => {
      el.classList.add('neon-ambient');
    });

    // Occasional micro-stutter on random accent elements
    setInterval(() => {
      const accents = document.querySelectorAll(
        '.stat-neon-value, .postcard-neon-name, .neon-heading, .section-neon-title, .plate-number'
      );
      if (!accents.length) return;
      const rand = accents[Math.floor(Math.random() * accents.length)];
      rand.style.opacity = '0.5';
      setTimeout(() => {
        rand.style.opacity = '1';
      }, 80);
      setTimeout(() => {
        rand.style.opacity = '0.7';
      }, 120);
      setTimeout(() => {
        rand.style.opacity = '1';
      }, 180);
    }, 3000);
  }

  // ---- TOGGLE SWITCH (light-switch-snap-neon) ----
  document.querySelectorAll('.neon-toggle input').forEach(toggle => {
    toggle.addEventListener('change', () => {
      const track = toggle.nextElementSibling;
      if (toggle.checked) {
        // Snap ON glow burst
        track.style.boxShadow = '0 0 20px var(--accent), 0 0 40px var(--accent)';
        setTimeout(() => {
          track.style.boxShadow = '';
        }, 400);
      }
    });
  });

  // ---- INPUT FOCUS (neon-glow-border-teal) ----
  // Handled in CSS: .cb-input:focus, .setting-input:focus

  // ---- GSAP SCROLLTRIGGER FOR ENHANCED REVEALS ----
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Dashboard gauge fill animation
    gsap.from('.gauge-fill', {
      width: '0%',
      duration: 1.5,
      ease: 'power2.out',
      delay: 1.2
    });

    // Animate stat values with counting effect
    document.querySelectorAll('.stat-neon-value').forEach(el => {
      const text = el.textContent.trim();
      const num = parseInt(text.replace(/,/g, ''));
      if (!isNaN(num)) {
        const formatted = text.includes(',');
        el.textContent = '0';
        const obj = { val: 0 };
        gsap.to(obj, {
          val: num,
          duration: 1.5,
          delay: 1,
          ease: 'power2.out',
          onUpdate: () => {
            const v = Math.round(obj.val);
            el.textContent = formatted ? v.toLocaleString() : v;
          }
        });
      }
    });
  }

  // ---- TASK CHECK TOGGLING ----
  document.querySelectorAll('.task-check').forEach(check => {
    check.addEventListener('click', () => {
      check.classList.toggle('done');
      const icon = check.querySelector('i');
      if (check.classList.contains('done')) {
        icon.className = 'ph ph-check-circle';
        showCheckinStamp();
      } else {
        icon.className = 'ph ph-circle';
      }
    });
  });

  // ---- CB RADIO SEND ----
  const cbInput = document.querySelector('.cb-input');
  const cbSendBtn = document.querySelector('.cb-send-btn');
  const cbMessages = document.querySelector('.cb-messages');

  function sendCBMessage() {
    const text = cbInput?.value?.trim();
    if (!text) return;

    const userMsg = document.createElement('div');
    userMsg.className = 'cb-msg user';
    userMsg.innerHTML = `
      <div class="cb-handle">ROAD_RUNNER_99</div>
      <div class="cb-bubble user-bubble">${escapeHTML(text)}</div>
      <div class="cb-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
    `;
    cbMessages.appendChild(userMsg);
    cbInput.value = '';
    cbMessages.scrollTop = cbMessages.scrollHeight;

    // Simulate AI response
    setTimeout(() => {
      const aiMsg = document.createElement('div');
      aiMsg.className = 'cb-msg ai';
      const responses = [
        '10-4, good buddy! Let me look into that for you. Keep your eyes on the road and I\'ll radio back shortly.',
        'Copy that! That\'s a solid idea. Reminds me of a rest stop we catalogued near Gallup, NM. Want me to add it to your route?',
        'Roger roger! I\'ve got your coordinates locked in. That stretch of highway has some amazing neon signs after dark.',
        'Breaker breaker! Great thinking there, Road Runner. I\'ll flag that as a must-visit stop on your next run.'
      ];
      aiMsg.innerHTML = `
        <div class="cb-handle">DISPATCH_AI</div>
        <div class="cb-bubble ai-bubble">${responses[Math.floor(Math.random() * responses.length)]}</div>
        <div class="cb-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      `;
      cbMessages.appendChild(aiMsg);
      cbMessages.scrollTop = cbMessages.scrollHeight;
    }, 1200);
  }

  if (cbSendBtn) cbSendBtn.addEventListener('click', sendCBMessage);
  if (cbInput) {
    cbInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendCBMessage();
      }
    });
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- WHITEBOARD NODE INTERACTION ----
  document.querySelectorAll('.wb-node').forEach(node => {
    node.addEventListener('click', () => {
      // Brief glow pulse
      const marker = node.querySelector('.node-marker');
      if (marker) {
        marker.style.boxShadow = '0 0 30px var(--accent), 0 0 60px var(--accent2)';
        marker.style.borderColor = 'var(--accent)';
        setTimeout(() => {
          marker.style.boxShadow = '';
          marker.style.borderColor = '';
        }, 600);
      }
    });
  });

  // ---- HIGHWAY TREE TOGGLE ----
  document.querySelectorAll('.hw-level').forEach(level => {
    const children = level.querySelector('.hw-children');
    if (children) {
      const shield = level.querySelector('.hw-shield');
      if (shield) {
        shield.style.cursor = 'pointer';
        shield.addEventListener('click', (e) => {
          e.stopPropagation();
          if (children.style.display === 'none') {
            children.style.display = '';
            shield.style.transform = '';
          } else {
            children.style.display = 'none';
            shield.style.opacity = '0.5';
            setTimeout(() => { shield.style.opacity = ''; }, 300);
          }
        });
      }
    }
  });

  // ---- INITIAL SETUP ----
  // Set dashboard as initial view
  document.querySelectorAll('.view-panel').forEach(p => {
    p.style.display = p.id === 'view-dashboard' ? '' : 'none';
  });

})();
