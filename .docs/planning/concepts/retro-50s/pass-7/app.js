/* ============================================================
   RETRO 50s — PASS 7: Carousel Fairground Ride
   Navigation, Interactions, Animations
   ============================================================ */

(function () {
  'use strict';

  // --- DOM refs ---
  const pillTickets = document.querySelectorAll('.pill-ticket');
  const viewPanels = document.querySelectorAll('.view-panel');
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const pillNavInner = document.querySelector('.pill-nav-inner');
  const loadingOverlay = document.getElementById('loading-overlay');
  const starburstEl = document.getElementById('starburst-feedback');

  // --- State ---
  let currentView = null;

  // =========================================
  // NAVIGATION — Pill Ticket Toggle
  // =========================================
  function navigateTo(viewId) {
    if (viewId === currentView) return;
    currentView = viewId;

    // Update active pill
    pillTickets.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewId);
      btn.setAttribute('aria-current', btn.dataset.view === viewId ? 'page' : 'false');
    });

    // Switch view panels with card-flip animation
    viewPanels.forEach(panel => {
      if (panel.dataset.view === viewId) {
        panel.classList.add('active');
        panel.style.animation = 'none';
        // Force reflow
        panel.offsetHeight;
        panel.style.animation = '';
        // Trigger scroll reveals for this panel
        requestAnimationFrame(() => revealElements(panel));
        // Animate stat numbers if dashboard
        if (viewId === 'dashboard') {
          animateStatNumbers();
        }
      } else {
        panel.classList.remove('active');
      }
    });

    // Close mobile menu if open
    if (pillNavInner.classList.contains('mobile-open')) {
      pillNavInner.classList.remove('mobile-open');
    }

    // Update hash
    window.location.hash = viewId;
  }

  pillTickets.forEach(btn => {
    btn.addEventListener('click', () => {
      navigateTo(btn.dataset.view);
    });
  });

  // Mobile menu toggle
  mobileToggle.addEventListener('click', () => {
    pillNavInner.classList.toggle('mobile-open');
  });

  // Hash routing
  function handleHash() {
    const hash = window.location.hash.replace('#', '');
    if (hash && document.querySelector(`[data-view="${hash}"]`)) {
      navigateTo(hash);
    }
  }
  window.addEventListener('hashchange', handleHash);

  // =========================================
  // LOADING OVERLAY
  // =========================================
  window.addEventListener('load', () => {
    setTimeout(() => {
      loadingOverlay.classList.add('hidden');
      // Init dashboard
      navigateTo(window.location.hash.replace('#', '') || 'dashboard');
      // Animate stat numbers
      animateStatNumbers();
      // Start ambient particles
      createAmbientParticles();
    }, 800);
  });

  // =========================================
  // STAT NUMBER SPIN ANIMATION
  // =========================================
  function animateStatNumbers() {
    const spinNumbers = document.querySelectorAll('.spin-number');
    spinNumbers.forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      if (isNaN(target)) return;

      let current = 0;
      const duration = 1200;
      const startTime = performance.now();

      function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out bounce approximation
        const eased = 1 - Math.pow(1 - progress, 3);
        current = Math.round(target * eased);
        el.textContent = current;
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = target;
        }
      }
      requestAnimationFrame(tick);
    });
  }

  // =========================================
  // SCROLL REVEAL — Bounce In
  // =========================================
  function revealElements(container) {
    const items = container.querySelectorAll(
      '.stat-card, .card-carousel-panel, .project-card, .kanban-column, ' +
      '.idea-balloon-card, .entity-node, .settings-section, .wb-container, ' +
      '.workspace-meta-card, .workspace-description, .workspace-collaborators'
    );
    items.forEach((item, i) => {
      item.classList.add('scroll-reveal');
      setTimeout(() => {
        item.classList.add('revealed');
      }, 80 * i);
    });
  }

  // =========================================
  // BUTTON HOVER & CLICK — Puff up + Squash
  // =========================================
  document.querySelectorAll('.btn-primary, .btn-secondary, .quick-action-btn, .submit-idea-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      showStarBurst(e.clientX, e.clientY);
    });
  });

  // =========================================
  // STAR BURST MICRO-FEEDBACK
  // =========================================
  function showStarBurst(x, y) {
    starburstEl.style.left = (x - 16) + 'px';
    starburstEl.style.top = (y - 16) + 'px';
    starburstEl.textContent = '\u2B50';
    starburstEl.classList.remove('show');
    void starburstEl.offsetHeight;
    starburstEl.classList.add('show');
    setTimeout(() => {
      starburstEl.classList.remove('show');
    }, 600);
  }

  // =========================================
  // DIRECTORY TREE — Toggle Folders
  // =========================================
  document.querySelectorAll('.tree-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const folder = toggle.closest('.tree-folder');
      if (folder) {
        folder.classList.toggle('open');
        const icon = toggle.querySelector('i');
        if (folder.classList.contains('open')) {
          icon.className = 'ph ph-caret-down';
          // Update folder icon
          const folderIcon = folder.querySelector(':scope > .tree-icon');
          if (folderIcon) {
            folderIcon.className = 'ph ph-folder-open tree-icon';
          }
        } else {
          icon.className = 'ph ph-caret-right';
          const folderIcon = folder.querySelector(':scope > .tree-icon');
          if (folderIcon) {
            folderIcon.className = 'ph ph-folder tree-icon';
          }
        }
      }
    });
  });

  // =========================================
  // KANBAN CARD — Drag simulation
  // =========================================
  document.querySelectorAll('.kanban-card').forEach(card => {
    card.addEventListener('mousedown', () => {
      card.style.cursor = 'grabbing';
    });
    card.addEventListener('mouseup', () => {
      card.style.cursor = 'grab';
    });
  });

  // =========================================
  // PRIORITY PILL TOGGLE (Ideas form)
  // =========================================
  document.querySelectorAll('.priority-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.priority-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });

  // =========================================
  // SIDEBAR ITEM ACTIVE STATE
  // =========================================
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // =========================================
  // SETTINGS TOGGLE GROUP
  // =========================================
  document.querySelectorAll('.carnival-toggle-group').forEach(group => {
    const options = group.querySelectorAll('.toggle-option');
    options.forEach(opt => {
      opt.addEventListener('click', () => {
        options.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
      });
    });
  });

  // =========================================
  // CARNIVAL LEVER — Toggle animation
  // =========================================
  document.querySelectorAll('.lever-input').forEach(lever => {
    lever.addEventListener('change', () => {
      const handle = lever.nextElementSibling.querySelector('.lever-handle');
      // Add mechanical bounce
      handle.style.animation = 'none';
      void handle.offsetHeight;
      handle.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });
  });

  // =========================================
  // WHITEBOARD — Basic drag
  // =========================================
  document.querySelectorAll('[data-draggable]').forEach(el => {
    let isDragging = false;
    let startX, startY, origLeft, origTop;

    el.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      origLeft = parseInt(el.style.left, 10) || 0;
      origTop = parseInt(el.style.top, 10) || 0;
      el.style.zIndex = 100;
      el.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      el.style.left = (origLeft + dx) + 'px';
      el.style.top = (origTop + dy) + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      el.style.zIndex = '';
      el.style.cursor = 'move';
    });
  });

  // =========================================
  // WHITEBOARD TOOLBAR — Active tool toggle
  // =========================================
  document.querySelectorAll('.whiteboard-toolbar .tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Only toggle active for the first group (tools, not undo/zoom)
      const toolbar = btn.closest('.whiteboard-toolbar');
      const firstDivider = toolbar.querySelector('.tool-divider');
      const toolButtons = [];
      let sibling = toolbar.firstElementChild;
      while (sibling && sibling !== firstDivider) {
        if (sibling.classList.contains('tool-btn')) {
          toolButtons.push(sibling);
        }
        sibling = sibling.nextElementSibling;
      }
      if (toolButtons.includes(btn)) {
        toolButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  });

  // =========================================
  // AI CHAT — Simulated send
  // =========================================
  const chatInput = document.querySelector('.chat-input');
  const chatSendBtn = document.querySelector('.chat-send-btn');
  const chatMessages = document.querySelector('.chat-messages');

  function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message user-message';
    userMsg.innerHTML = `
      <div class="message-bubble">
        <div class="message-sender">You</div>
        <p>${escapeHtml(text)}</p>
      </div>
      <div class="message-avatar user-avatar">AJ</div>
    `;
    chatMessages.appendChild(userMsg);
    chatInput.value = '';

    // Simulate AI response
    setTimeout(() => {
      const aiMsg = document.createElement('div');
      aiMsg.className = 'chat-message ai-message';
      aiMsg.innerHTML = `
        <div class="message-avatar ai-avatar"><i class="ph ph-robot"></i></div>
        <div class="message-bubble">
          <div class="message-sender">AI Assistant</div>
          <p>That's a fantastic idea! I'll look into that for you. The fairground is always buzzing with new possibilities. Let me check what we can set up for your project right away.</p>
        </div>
      `;
      chatMessages.appendChild(aiMsg);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Star burst feedback
      const rect = aiMsg.getBoundingClientRect();
      showStarBurst(rect.left + 40, rect.top + 20);
    }, 1000);

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  if (chatSendBtn) {
    chatSendBtn.addEventListener('click', sendChatMessage);
  }
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // =========================================
  // IDEAS FORM — Submit simulation
  // =========================================
  const submitIdeaBtn = document.querySelector('.submit-idea-btn');
  if (submitIdeaBtn) {
    submitIdeaBtn.addEventListener('click', (e) => {
      const titleInput = document.getElementById('idea-title');
      const descInput = document.getElementById('idea-desc');
      const title = titleInput.value.trim();
      const desc = descInput.value.trim();

      if (!title) {
        titleInput.focus();
        titleInput.style.borderColor = '#ff4444';
        setTimeout(() => { titleInput.style.borderColor = ''; }, 1500);
        return;
      }

      // Add new idea card
      const ideasList = document.querySelector('.ideas-list');
      const activePill = document.querySelector('.priority-pill.active');
      const priority = activePill ? activePill.textContent : 'Medium';
      const priorityClass = priority.toLowerCase() === 'high' ? 'priority-high' :
                            priority.toLowerCase() === 'low' ? 'priority-low' : 'priority-medium';

      const newCard = document.createElement('div');
      newCard.className = 'idea-balloon-card scroll-reveal';
      newCard.innerHTML = `
        <div class="balloon-priority ${priorityClass}">${priority}</div>
        <h4>${escapeHtml(title)}</h4>
        <p>${escapeHtml(desc || 'A brilliant new idea just popped!')}</p>
        <div class="balloon-meta">
          <span class="balloon-tag">New</span>
          <span class="balloon-votes"><i class="ph ph-heart"></i> 0</span>
        </div>
      `;

      ideasList.insertBefore(newCard, ideasList.firstChild);
      requestAnimationFrame(() => newCard.classList.add('revealed'));

      // Clear form
      titleInput.value = '';
      descInput.value = '';

      // Star burst
      showStarBurst(e.clientX, e.clientY);
    });
  }

  // =========================================
  // AMBIENT PARTICLES (CSS-based, 2-3 pieces)
  // =========================================
  function createAmbientParticles() {
    for (let i = 0; i < 3; i++) {
      const particle = document.createElement('div');
      particle.className = 'ambient-particle';
      document.body.appendChild(particle);
    }
  }

  // =========================================
  // GSAP ENHANCEMENTS (if available)
  // =========================================
  function initGSAP() {
    if (typeof gsap === 'undefined') return;

    // Progress bar fill animations
    gsap.utils.toArray('.progress-fill').forEach(fill => {
      const width = fill.style.width;
      fill.style.width = '0%';
      gsap.to(fill, {
        width: width,
        duration: 1.2,
        ease: 'back.out(1.4)',
        delay: 0.3
      });
    });

    // Card hover — lift and tilt
    document.querySelectorAll('.prize-card, .idea-balloon-card, .kanban-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: -8,
          rotation: -0.5,
          duration: 0.3,
          ease: 'back.out(2)',
          overwrite: true
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          y: 0,
          rotation: 0,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: true
        });
      });
    });

    // Button hover — puff up with shadow bloom
    document.querySelectorAll('.btn-primary').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        gsap.to(btn, {
          scale: 1.08,
          boxShadow: '0 8px 30px rgba(255, 107, 157, 0.45)',
          duration: 0.3,
          ease: 'back.out(2)',
          overwrite: true
        });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          scale: 1,
          boxShadow: '0 4px 16px rgba(255, 107, 157, 0.3)',
          duration: 0.25,
          ease: 'power2.out',
          overwrite: true
        });
      });
    });

    // Quick action buttons bounce on click
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        gsap.fromTo(btn,
          { scaleY: 0.9, scaleX: 1.05 },
          { scaleY: 1.1, scaleX: 0.95, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.out',
            onComplete: () => gsap.to(btn, { scaleX: 1, scaleY: 1, duration: 0.2 })
          }
        );
      });
    });
  }

  // Initialize GSAP after a slight delay to ensure library is loaded
  setTimeout(initGSAP, 200);

  // =========================================
  // TOOLTIP SYSTEM — Rounded speech bubbles
  // =========================================
  const tooltipEl = document.createElement('div');
  tooltipEl.className = 'speech-tooltip';
  tooltipEl.style.cssText = `
    position: fixed;
    background: #2d1810;
    color: #fff5f0;
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 0.78rem;
    padding: 6px 12px;
    border-radius: 12px;
    pointer-events: none;
    z-index: 9990;
    opacity: 0;
    transition: opacity 0.2s;
    white-space: nowrap;
  `;

  // Add arrow
  const tooltipArrow = document.createElement('div');
  tooltipArrow.style.cssText = `
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid #2d1810;
  `;
  tooltipEl.appendChild(tooltipArrow);
  document.body.appendChild(tooltipEl);

  document.querySelectorAll('[title]').forEach(el => {
    const titleText = el.getAttribute('title');
    el.removeAttribute('title');
    el.dataset.tooltip = titleText;

    el.addEventListener('mouseenter', (e) => {
      tooltipEl.firstChild.textContent = titleText;
      const rect = el.getBoundingClientRect();
      tooltipEl.style.left = (rect.left + rect.width / 2 - tooltipEl.offsetWidth / 2) + 'px';
      tooltipEl.style.top = (rect.top - 36) + 'px';
      tooltipEl.style.opacity = '1';
    });

    el.addEventListener('mouseleave', () => {
      tooltipEl.style.opacity = '0';
    });
  });

  // =========================================
  // INPUT FOCUS — Placeholder bounce-up
  // =========================================
  document.querySelectorAll('.fairground-input, .fairground-textarea').forEach(input => {
    input.addEventListener('focus', () => {
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(input, { y: 2 }, { y: 0, duration: 0.3, ease: 'back.out(3)' });
      }
    });
  });

  // =========================================
  // CREATE NEW PROJECT — Click handler
  // =========================================
  const createNewCard = document.querySelector('.card-create-new');
  if (createNewCard) {
    createNewCard.addEventListener('click', (e) => {
      showStarBurst(e.clientX, e.clientY);
    });
  }

  // =========================================
  // IDEA VOTE — Click heart to increment
  // =========================================
  document.querySelectorAll('.balloon-votes').forEach(voteBtn => {
    voteBtn.style.cursor = 'pointer';
    voteBtn.addEventListener('click', (e) => {
      const countText = voteBtn.textContent.trim();
      const count = parseInt(countText, 10) || 0;
      const icon = voteBtn.querySelector('i');
      voteBtn.innerHTML = '';
      voteBtn.appendChild(icon);
      voteBtn.appendChild(document.createTextNode(' ' + (count + 1)));

      showStarBurst(e.clientX, e.clientY);

      // GSAP bounce
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(voteBtn, { scale: 1.3 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' });
      }
    });
  });

})();
