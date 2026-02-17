/* ============================================
   PASS 6 — Kitchen Appliance Pastel
   app.js — Navigation, interactions, animations
   ============================================ */

(function () {
  'use strict';

  // ---- DOM REFERENCES ----
  const railNav = document.querySelector('.rail-nav');
  const railLinks = document.querySelectorAll('.rail-link');
  const views = document.querySelectorAll('.view');
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileOverlay = document.querySelector('.mobile-overlay');
  const tooltipEl = document.getElementById('tooltipNote');
  const tooltipText = tooltipEl.querySelector('.tooltip-text');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const dingFeedback = document.getElementById('dingFeedback');

  // ---- NAVIGATION ----
  function navigateTo(viewId, skipAnimation) {
    // Hide all views
    views.forEach(v => {
      v.classList.remove('active');
      v.style.animation = 'none';
    });

    // Show target
    const target = document.getElementById(viewId);
    if (!target) return;

    // Reset animation
    requestAnimationFrame(() => {
      target.style.animation = '';
      target.classList.add('active');
    });

    // Update nav links
    railLinks.forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`[data-view="${viewId}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Close mobile nav
    closeMobileNav();

    // Trigger scroll reveals for newly visible content
    setTimeout(() => revealShelfItems(target), 100);

    // Update hash without scroll
    history.replaceState(null, '', '#' + viewId);
  }

  // Rail link clicks
  railLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const viewId = link.getAttribute('data-view');
      showLoadingBriefly(() => navigateTo(viewId));
    });
  });

  // Hash routing
  function handleHash() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    navigateTo(hash, true);
  }
  window.addEventListener('hashchange', handleHash);

  // ---- MOBILE NAV ----
  function openMobileNav() {
    railNav.classList.add('open');
    mobileOverlay.classList.add('open');
    mobileOverlay.style.display = 'block';
    mobileOverlay.style.pointerEvents = 'auto';
  }
  function closeMobileNav() {
    railNav.classList.remove('open');
    mobileOverlay.classList.remove('open');
    setTimeout(() => {
      if (!mobileOverlay.classList.contains('open')) {
        mobileOverlay.style.pointerEvents = 'none';
      }
    }, 350);
  }
  mobileMenuBtn.addEventListener('click', () => {
    if (railNav.classList.contains('open')) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });
  mobileOverlay.addEventListener('click', closeMobileNav);

  // ---- LOADING — oven timer countdown ----
  function showLoadingBriefly(callback) {
    loadingOverlay.classList.add('active');
    loadingOverlay.setAttribute('aria-hidden', 'false');

    // Reset timer animation
    const progress = loadingOverlay.querySelector('.timer-progress');
    if (progress) {
      progress.style.animation = 'none';
      void progress.offsetWidth;
      progress.style.animation = '';
    }

    setTimeout(() => {
      loadingOverlay.classList.remove('active');
      loadingOverlay.setAttribute('aria-hidden', 'true');
      if (callback) callback();
    }, 400);
  }

  // ---- SCROLL REVEAL — shelf-slide-in ----
  function revealShelfItems(container) {
    const items = container.querySelectorAll('.shelf-anim');
    items.forEach((item, i) => {
      item.classList.remove('revealed');
      setTimeout(() => {
        item.classList.add('revealed');
      }, 80 * i);
    });
  }

  // Also observe on scroll for long views
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.shelf-anim').forEach(el => observer.observe(el));
  }

  // ---- TOOLTIP — recipe note tooltip ----
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.addEventListener('mouseenter', e => {
      const text = el.getAttribute('data-tooltip');
      if (!text) return;
      tooltipText.textContent = text;
      tooltipEl.classList.add('visible');

      const rect = el.getBoundingClientRect();
      // Position tooltip to the left of the nav item
      tooltipEl.style.top = rect.top + rect.height / 2 - 18 + 'px';
      tooltipEl.style.left = rect.left - tooltipEl.offsetWidth - 12 + 'px';
    });
    el.addEventListener('mouseleave', () => {
      tooltipEl.classList.remove('visible');
    });
  });

  // ---- MICRO FEEDBACK — ding timer done ----
  function showDing() {
    dingFeedback.classList.add('show');
    dingFeedback.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
      dingFeedback.classList.remove('show');
      dingFeedback.setAttribute('aria-hidden', 'true');
    }, 1500);
  }

  // Fire ding on checkbox changes
  document.querySelectorAll('.task-item input[type="checkbox"], .kcard-check input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) {
        showDing();
        // Fire confetti if available
        if (typeof confetti === 'function') {
          const rect = cb.getBoundingClientRect();
          confetti({
            particleCount: 20,
            spread: 40,
            origin: {
              x: rect.left / window.innerWidth,
              y: rect.top / window.innerHeight
            },
            colors: ['#6b8a3e', '#c4962a', '#b87333'],
            scalar: 0.6,
            gravity: 1.2,
            ticks: 60
          });
        }
      }
    });
  });

  // ---- IDEA SUBMIT — pin it with confetti ----
  const ideaSubmitBtn = document.querySelector('.idea-submit-btn');
  const ideaInput = document.querySelector('.idea-input');
  if (ideaSubmitBtn) {
    ideaSubmitBtn.addEventListener('click', () => {
      if (ideaInput && ideaInput.value.trim()) {
        showDing();
        if (typeof confetti === 'function') {
          const rect = ideaSubmitBtn.getBoundingClientRect();
          confetti({
            particleCount: 35,
            spread: 60,
            origin: {
              x: (rect.left + rect.width / 2) / window.innerWidth,
              y: (rect.top + rect.height / 2) / window.innerHeight
            },
            colors: ['#6b8a3e', '#c4962a', '#b87333', '#faf5e8'],
            scalar: 0.8,
            gravity: 0.8,
            ticks: 80
          });
        }
        ideaInput.value = '';
      }
    });
  }

  // ---- CHAT SEND BUTTON ----
  const chatSendBtn = document.querySelector('.chat-send-btn');
  const chatInput = document.querySelector('.chat-input');
  if (chatSendBtn) {
    chatSendBtn.addEventListener('click', () => {
      if (chatInput && chatInput.value.trim()) {
        const msgContainer = document.querySelector('.chat-messages');
        const newMsg = document.createElement('div');
        newMsg.className = 'chat-msg msg-user shelf-anim revealed';
        newMsg.innerHTML = `
          <div class="msg-bubble bubble-user">
            <p>${escapeHtml(chatInput.value.trim())}</p>
          </div>
        `;
        msgContainer.appendChild(newMsg);
        chatInput.value = '';
        msgContainer.scrollTop = msgContainer.scrollHeight;

        // Simulate AI response after a delay
        setTimeout(() => {
          const aiMsg = document.createElement('div');
          aiMsg.className = 'chat-msg msg-ai shelf-anim';
          aiMsg.innerHTML = `
            <div class="msg-avatar"><i class="ph ph-cooking-pot"></i></div>
            <div class="msg-bubble bubble-ai">
              <p>That's a great question! Let me look through my recipe collection and get back to you with some suggestions. In the meantime, make sure your oven is preheated!</p>
            </div>
          `;
          msgContainer.appendChild(aiMsg);
          msgContainer.scrollTop = msgContainer.scrollHeight;
          setTimeout(() => aiMsg.classList.add('revealed'), 50);
        }, 800);
      }
    });
    // Enter key sends
    if (chatInput) {
      chatInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') chatSendBtn.click();
      });
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ---- DIRECTORY TREE — collapse/expand ----
  document.querySelectorAll('.shelf-header, .item-header').forEach(header => {
    header.addEventListener('click', () => {
      const isExpanded = header.getAttribute('data-expanded') === 'true';
      const siblingList = header.nextElementSibling;
      const caret = header.querySelector('.shelf-caret');
      const folderIcon = header.querySelector('.shelf-icon');

      if (siblingList) {
        if (isExpanded) {
          siblingList.classList.add('collapsed');
          header.setAttribute('data-expanded', 'false');
          if (caret) { caret.classList.remove('ph-caret-down'); caret.classList.add('ph-caret-right'); }
          if (folderIcon) { folderIcon.classList.remove('ph-folder-open'); folderIcon.classList.add('ph-folder'); }
        } else {
          siblingList.classList.remove('collapsed');
          header.setAttribute('data-expanded', 'true');
          if (caret) { caret.classList.remove('ph-caret-right'); caret.classList.add('ph-caret-down'); }
          if (folderIcon) { folderIcon.classList.remove('ph-folder'); folderIcon.classList.add('ph-folder-open'); }
        }
      }
    });
  });

  // ---- RECIPE BOX TABS — filter ----
  const boxTabs = document.querySelectorAll('.box-tab');
  const recipeCards = document.querySelectorAll('.recipe-card');
  boxTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      boxTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.getAttribute('data-cat');
      recipeCards.forEach(card => {
        if (cat === 'all' || card.getAttribute('data-cat') === cat) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ---- SETTINGS TOGGLE GROUPS ----
  document.querySelectorAll('.setting-toggle-group').forEach(group => {
    const opts = group.querySelectorAll('.toggle-opt');
    opts.forEach(opt => {
      opt.addEventListener('click', () => {
        opts.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
      });
    });
  });

  // ---- COLOR SWATCH SELECTOR ----
  document.querySelectorAll('.color-swatches').forEach(container => {
    const swatches = container.querySelectorAll('.swatch');
    swatches.forEach(s => {
      s.addEventListener('click', () => {
        swatches.forEach(x => x.classList.remove('active'));
        s.classList.add('active');
        showDing();
      });
    });
  });

  // ---- APPLIANCE SWITCHES — dial turn animation ----
  document.querySelectorAll('.appliance-switch input').forEach(sw => {
    sw.addEventListener('change', () => {
      const knob = sw.nextElementSibling.querySelector('.switch-knob');
      if (knob) {
        knob.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s ease';
      }
    });
  });

  // ---- GSAP SCROLL TRIGGERS ----
  function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Stagger animate dashboard stats
    gsap.from('.dash-stat-card', {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.15,
      ease: 'back.out(1.4)',
      delay: 0.2
    });

    // Gauge fill animation on dashboard
    gsap.to('.gauge-fill', {
      strokeDashoffset: function (i, el) {
        const pct = parseFloat(getComputedStyle(el).getPropertyValue('--pct')) || 0.72;
        return 157 * (1 - pct);
      },
      duration: 1.5,
      ease: 'power2.out',
      delay: 0.5
    });
  }

  // ---- WARM KITCHEN GLOW — idle ambient ----
  // Already handled by CSS .ambient-glow with animation

  // ---- WHITEBOARD NODE DRAG (basic) ----
  document.querySelectorAll('.wb-node').forEach(node => {
    let isDragging = false;
    let startX, startY, nodeStartLeft, nodeStartTop;

    node.addEventListener('mousedown', e => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      nodeStartLeft = node.offsetLeft;
      nodeStartTop = node.offsetTop;
      node.style.zIndex = 10;
      node.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const canvas = node.parentElement;
      const maxX = canvas.offsetWidth - node.offsetWidth;
      const maxY = canvas.offsetHeight - node.offsetHeight;
      const newLeft = Math.max(0, Math.min(maxX, nodeStartLeft + dx));
      const newTop = Math.max(0, Math.min(maxY, nodeStartTop + dy));
      node.style.left = newLeft + 'px';
      node.style.top = newTop + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        node.style.zIndex = 2;
        node.style.cursor = 'move';
      }
    });

    // Touch support
    node.addEventListener('touchstart', e => {
      const touch = e.touches[0];
      isDragging = true;
      startX = touch.clientX;
      startY = touch.clientY;
      nodeStartLeft = node.offsetLeft;
      nodeStartTop = node.offsetTop;
      node.style.zIndex = 10;
    }, { passive: true });

    document.addEventListener('touchmove', e => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      const canvas = node.parentElement;
      const maxX = canvas.offsetWidth - node.offsetWidth;
      const maxY = canvas.offsetHeight - node.offsetHeight;
      const newLeft = Math.max(0, Math.min(maxX, nodeStartLeft + dx));
      const newTop = Math.max(0, Math.min(maxY, nodeStartTop + dy));
      node.style.left = newLeft + 'px';
      node.style.top = newTop + 'px';
    }, { passive: true });

    document.addEventListener('touchend', () => {
      isDragging = false;
      node.style.zIndex = 2;
    });
  });

  // ---- DIAL KNOB INTERACTION ----
  document.querySelectorAll('.dial-knob').forEach(knob => {
    let rotating = false;
    let startAngle = 0;
    let currentRotation = 0;
    const valueDisplay = knob.parentElement.querySelector('.dial-value');

    knob.addEventListener('mousedown', e => {
      rotating = true;
      const rect = knob.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      startAngle = Math.atan2(e.clientY - cy, e.clientX - cx);
      e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
      if (!rotating) return;
      const rect = knob.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
      const delta = (angle - startAngle) * (180 / Math.PI);
      currentRotation += delta;
      currentRotation = Math.max(-90, Math.min(90, currentRotation));
      startAngle = angle;
      knob.querySelector('.dial-pointer').style.transform = `translateX(-50%) rotate(${currentRotation}deg)`;
      // Map rotation to value (1-15 min)
      const val = Math.round(((currentRotation + 90) / 180) * 14) + 1;
      if (valueDisplay) valueDisplay.textContent = val + ' min';
    });

    document.addEventListener('mouseup', () => { rotating = false; });
  });

  // ---- INITIAL LOAD ----
  handleHash();
  initGSAP();

  // Reveal initial view items after a tick
  setTimeout(() => {
    const activeView = document.querySelector('.view.active');
    if (activeView) revealShelfItems(activeView);
  }, 200);

})();
