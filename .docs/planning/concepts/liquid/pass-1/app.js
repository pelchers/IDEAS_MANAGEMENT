/* ═══════════════════════════════════════════════════════
   LIQUID MOTION — Pass 1 (Morphing Blob Surfaces)
   app.js — GSAP-powered interactions & view management
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── CONSTANTS ── */
  const EASE_LIQUID = 'power2.inOut';
  const EASE_SPRING = 'elastic.out(1, 0.5)';
  const EASE_SMOOTH = 'power3.out';
  const VIEW_DURATION = 0.5;
  const STAGGER_BASE = 0.06;

  /* ── DOM REFERENCES ── */
  const navBtns = document.querySelectorAll('.blob-nav__btn');
  const views = document.querySelectorAll('.view');
  const pageTitle = document.getElementById('pageTitle');
  const pageSub = document.getElementById('pageSub');
  const chatSendBtn = document.querySelector('.chat-send-btn');
  const contentArea = document.getElementById('contentArea');

  /* ── VIEW METADATA ── */
  const viewMeta = {
    'dashboard':         { title: 'Dashboard',         sub: 'Overview of all your ideas and projects' },
    'projects':          { title: 'Projects',           sub: 'Manage and explore your project portfolio' },
    'project-workspace': { title: 'Workspace',          sub: 'Deep dive into project files and code' },
    'kanban':            { title: 'Kanban Board',       sub: 'Track tasks across your workflow stages' },
    'whiteboard':        { title: 'Whiteboard',         sub: 'Visual brainstorming and idea mapping' },
    'schema-planner':    { title: 'Schema Planner',     sub: 'Design your data models and relationships' },
    'directory-tree':    { title: 'Directory Tree',     sub: 'Browse and navigate your file structure' },
    'ideas':             { title: 'Ideas',              sub: 'Capture, organize, and prioritize ideas' },
    'ai-chat':           { title: 'AI Assistant',       sub: 'Chat with AI to refine your ideas' },
    'settings':          { title: 'Settings',           sub: 'Configure your workspace preferences' }
  };

  /* ═══════════════════════════════════════
     VIEW SWITCHING
     ═══════════════════════════════════════ */

  function switchView(targetView) {
    const currentActive = document.querySelector('.view.active');
    const nextView = document.querySelector(`[data-page="${targetView}"]`);
    if (!nextView || nextView === currentActive) return;

    // Update nav active state
    navBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === targetView);
    });

    // Animate header title change
    const meta = viewMeta[targetView] || { title: targetView, sub: '' };
    gsap.to(pageTitle, {
      y: -10,
      opacity: 0,
      duration: 0.2,
      ease: EASE_SMOOTH,
      onComplete: () => {
        pageTitle.textContent = meta.title;
        gsap.fromTo(pageTitle,
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, ease: EASE_SPRING }
        );
      }
    });

    gsap.to(pageSub, {
      opacity: 0,
      duration: 0.15,
      onComplete: () => {
        pageSub.textContent = meta.sub;
        gsap.to(pageSub, { opacity: 1, duration: 0.3, delay: 0.1 });
      }
    });

    // Animate out current view
    if (currentActive) {
      gsap.to(currentActive, {
        opacity: 0,
        y: 20,
        scale: 0.98,
        duration: VIEW_DURATION * 0.6,
        ease: EASE_LIQUID,
        onComplete: () => {
          currentActive.classList.remove('active');
          currentActive.style.display = 'none';
          gsap.set(currentActive, { clearProps: 'all' });

          // Show and animate in next view
          nextView.style.display = 'block';
          nextView.classList.add('active');

          gsap.fromTo(nextView,
            { opacity: 0, y: 30, scale: 0.98 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: VIEW_DURATION,
              ease: EASE_SMOOTH,
              onComplete: () => {
                animateViewContent(targetView);
              }
            }
          );
        }
      });
    }

    // Update hash
    window.location.hash = targetView;
  }

  /* ═══════════════════════════════════════
     STAGGERED CONTENT REVEAL
     ═══════════════════════════════════════ */

  function animateViewContent(viewName) {
    const viewEl = document.querySelector(`[data-page="${viewName}"]`);
    if (!viewEl) return;

    // Find staggerable children
    const cards = viewEl.querySelectorAll(
      '.bento-card, .kanban-card, .idea-bubble, .project-card, .schema-entity, ' +
      '.wb-node, .dir-item, .settings-row, .chat-message, .activity-item, .team-member'
    );

    if (cards.length) {
      gsap.fromTo(cards,
        { y: 20, opacity: 0, scale: 0.97 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: STAGGER_BASE,
          ease: EASE_SMOOTH,
          clearProps: 'transform'
        }
      );
    }

    // Animate progress bars in projects view
    if (viewName === 'projects') {
      const fills = viewEl.querySelectorAll('.project-card__progress-fill');
      fills.forEach(fill => {
        const targetWidth = fill.style.width;
        fill.style.width = '0%';
        gsap.to(fill, { width: targetWidth, duration: 0.8, delay: 0.3, ease: EASE_LIQUID });
      });
    }

    // Animate chart bars in dashboard
    if (viewName === 'dashboard') {
      const bars = viewEl.querySelectorAll('.chart-bar');
      gsap.fromTo(bars,
        { scaleY: 0, transformOrigin: 'bottom center' },
        { scaleY: 1, duration: 0.6, stagger: 0.08, ease: EASE_SPRING, delay: 0.2 }
      );
    }
  }

  /* ═══════════════════════════════════════
     NAV BUTTON INTERACTIONS
     ═══════════════════════════════════════ */

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchView(btn.dataset.view);
    });

    // Blob morph on hover with GSAP
    btn.addEventListener('mouseenter', () => {
      if (btn.classList.contains('active')) return;
      gsap.to(btn, {
        scale: 1.06,
        duration: 0.35,
        ease: EASE_SPRING,
        borderRadius: randomBlobRadius()
      });
    });

    btn.addEventListener('mouseleave', () => {
      if (btn.classList.contains('active')) return;
      gsap.to(btn, {
        scale: 1,
        duration: 0.4,
        ease: EASE_LIQUID,
        borderRadius: '40% 60% 50% 50% / 55% 40% 60% 45%'
      });
    });
  });

  function randomBlobRadius() {
    const r = () => Math.floor(Math.random() * 30 + 30);
    return `${r()}% ${100 - r()}% ${r()}% ${100 - r()}% / ${r()}% ${r()}% ${100 - r()}% ${100 - r()}%`;
  }

  /* ═══════════════════════════════════════
     PARALLAX ON MOUSE MOVE
     ═══════════════════════════════════════ */

  let parallaxEnabled = true;
  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function updateParallax() {
    if (!parallaxEnabled) {
      requestAnimationFrame(updateParallax);
      return;
    }

    // Smooth interpolation
    currentX += (mouseX - currentX) * 0.06;
    currentY += (mouseY - currentY) * 0.06;

    // Apply subtle parallax to active view cards
    const activeView = document.querySelector('.view.active');
    if (activeView) {
      const cards = activeView.querySelectorAll('.bento-card, .kanban-card, .idea-bubble, .wb-node');
      cards.forEach((card, i) => {
        const depth = (i % 3 + 1) * 0.6;
        const x = currentX * depth;
        const y = currentY * depth;
        card.style.transform = `translate(${x}px, ${y}px)`;
      });
    }

    requestAnimationFrame(updateParallax);
  }

  updateParallax();

  /* ═══════════════════════════════════════
     BREATHING IDLE ANIMATION
     ═══════════════════════════════════════ */

  function initBreathingAnimation() {
    // Give each bento card a slightly different breathing delay
    const allCards = document.querySelectorAll('.bento-card');
    allCards.forEach((card, i) => {
      card.style.setProperty('--stagger', `${i * 400}ms`);
    });

    // Subtle idle pulse on the logo
    const logo = document.querySelector('.blob-nav__logo');
    if (logo) {
      gsap.to(logo, {
        scale: 1.04,
        duration: 2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1
      });
    }

    // Breathing glow on activity dots
    const activityDots = document.querySelectorAll('.activity-dot');
    activityDots.forEach((dot, i) => {
      gsap.to(dot, {
        boxShadow: '0 0 12px 3px rgba(59, 130, 246, 0.3)',
        duration: 1.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.3
      });
    });
  }

  /* ═══════════════════════════════════════
     CARD HOVER INTERACTIONS
     ═══════════════════════════════════════ */

  function initCardHovers() {
    // Project cards: lift + glow
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: -8,
          scale: 1.02,
          boxShadow: '0 16px 48px rgba(59, 130, 246, 0.18)',
          duration: 0.4,
          ease: EASE_SPRING
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          boxShadow: '0 4px 24px rgba(59, 130, 246, 0.08)',
          duration: 0.5,
          ease: EASE_LIQUID
        });
      });
    });

    // Idea bubbles: float up
    document.querySelectorAll('.idea-bubble').forEach(bubble => {
      bubble.addEventListener('mouseenter', () => {
        gsap.to(bubble, {
          y: -8,
          scale: 1.03,
          boxShadow: '0 16px 48px rgba(59, 130, 246, 0.2)',
          duration: 0.4,
          ease: EASE_SPRING
        });
      });
      bubble.addEventListener('mouseleave', () => {
        gsap.to(bubble, {
          y: 0,
          scale: 1,
          boxShadow: '0 4px 24px rgba(59, 130, 246, 0.08)',
          duration: 0.5,
          ease: EASE_LIQUID
        });
      });
    });

    // Whiteboard nodes
    document.querySelectorAll('.wb-node').forEach(node => {
      node.addEventListener('mouseenter', () => {
        gsap.to(node, {
          scale: 1.08,
          boxShadow: '0 12px 40px rgba(59, 130, 246, 0.2)',
          duration: 0.3,
          ease: EASE_SPRING
        });
      });
      node.addEventListener('mouseleave', () => {
        gsap.to(node, {
          scale: 1,
          boxShadow: '0 4px 24px rgba(59, 130, 246, 0.08)',
          duration: 0.4,
          ease: EASE_LIQUID
        });
      });
    });

    // Schema entities
    document.querySelectorAll('.schema-entity').forEach(entity => {
      entity.addEventListener('mouseenter', () => {
        gsap.to(entity, {
          y: -6,
          scale: 1.04,
          boxShadow: '0 12px 40px rgba(59, 130, 246, 0.18)',
          duration: 0.35,
          ease: EASE_SPRING
        });
      });
      entity.addEventListener('mouseleave', () => {
        gsap.to(entity, {
          y: 0,
          scale: 1,
          boxShadow: '0 4px 24px rgba(59, 130, 246, 0.08)',
          duration: 0.45,
          ease: EASE_LIQUID
        });
      });
    });
  }

  /* ═══════════════════════════════════════
     PILL BUTTON RIPPLE
     ═══════════════════════════════════════ */

  function initButtonRipples() {
    document.querySelectorAll('.pill-btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        const rect = btn.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        btn.style.setProperty('--ripple-x', x + '%');
        btn.style.setProperty('--ripple-y', y + '%');

        gsap.fromTo(btn,
          { scale: 0.96 },
          { scale: 1, duration: 0.4, ease: EASE_SPRING }
        );
      });
    });
  }

  /* ═══════════════════════════════════════
     CHAT SEND RIPPLE
     ═══════════════════════════════════════ */

  function initChatSend() {
    if (!chatSendBtn) return;

    chatSendBtn.addEventListener('click', () => {
      // Create ripple element
      const ripple = document.createElement('span');
      ripple.classList.add('ripple-effect');
      chatSendBtn.appendChild(ripple);

      gsap.fromTo(chatSendBtn,
        { scale: 0.9 },
        { scale: 1, duration: 0.5, ease: EASE_SPRING }
      );

      setTimeout(() => ripple.remove(), 600);
    });
  }

  /* ═══════════════════════════════════════
     MORPH INPUT FOCUS
     ═══════════════════════════════════════ */

  function initMorphInputs() {
    document.querySelectorAll('.morph-input, .chat-input-blob').forEach(container => {
      const input = container.querySelector('input, textarea');
      if (!input) return;

      input.addEventListener('focus', () => {
        gsap.to(container, {
          borderRadius: '20px',
          borderColor: '#3b82f6',
          boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)',
          duration: 0.4,
          ease: EASE_LIQUID
        });
      });

      input.addEventListener('blur', () => {
        gsap.to(container, {
          borderRadius: '100px',
          borderColor: '#c7d2fe',
          boxShadow: 'none',
          duration: 0.4,
          ease: EASE_LIQUID
        });
      });
    });
  }

  /* ═══════════════════════════════════════
     SETTINGS TABS
     ═══════════════════════════════════════ */

  function initSettingsTabs() {
    const tabs = document.querySelectorAll('.settings-tab');
    const panels = document.querySelectorAll('.settings-section');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.settingsTab;

        // Morph tab active state
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Spring animation on active tab
        gsap.fromTo(tab,
          { scale: 0.95 },
          { scale: 1, duration: 0.4, ease: EASE_SPRING }
        );

        // Switch panels with cross-fade
        panels.forEach(panel => {
          if (panel.dataset.settingsPanel === target) {
            panel.classList.add('active');
            gsap.fromTo(panel,
              { opacity: 0, y: 12 },
              { opacity: 1, y: 0, duration: 0.4, ease: EASE_SMOOTH }
            );

            // Stagger settings rows
            const rows = panel.querySelectorAll('.settings-row, .team-member');
            gsap.fromTo(rows,
              { opacity: 0, x: -10 },
              { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: EASE_SMOOTH, delay: 0.1 }
            );
          } else {
            panel.classList.remove('active');
          }
        });
      });
    });
  }

  /* ═══════════════════════════════════════
     TOGGLE SWITCHES (GSAP SPRING)
     ═══════════════════════════════════════ */

  function initToggleSwitches() {
    document.querySelectorAll('.liquid-toggle input').forEach(input => {
      input.addEventListener('change', function () {
        const thumb = this.closest('.liquid-toggle').querySelector('.liquid-toggle__thumb');
        const track = this.closest('.liquid-toggle').querySelector('.liquid-toggle__track');

        if (this.checked) {
          gsap.to(thumb, {
            x: 22,
            duration: 0.45,
            ease: EASE_SPRING
          });
          gsap.to(track, {
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            duration: 0.3
          });
        } else {
          gsap.to(thumb, {
            x: 0,
            duration: 0.45,
            ease: EASE_SPRING
          });
          gsap.to(track, {
            background: 'rgba(10, 22, 40, 0.12)',
            duration: 0.3
          });
        }
      });
    });
  }

  /* ═══════════════════════════════════════
     PRIORITY BUTTONS
     ═══════════════════════════════════════ */

  function initPriorityButtons() {
    const priorityBtns = document.querySelectorAll('.priority-btn');
    priorityBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        priorityBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gsap.fromTo(btn,
          { scale: 0.9 },
          { scale: 1, duration: 0.4, ease: EASE_SPRING }
        );
      });
    });
  }

  /* ═══════════════════════════════════════
     DIRECTORY TREE EXPAND/COLLAPSE
     ═══════════════════════════════════════ */

  function initDirectoryTree() {
    document.querySelectorAll('.dir-folder > .dir-item__row, .tree-folder').forEach(row => {
      row.addEventListener('click', function () {
        const folder = this.closest('.dir-folder') || this;
        folder.classList.toggle('open');

        const chevron = folder.querySelector('.dir-chevron');
        if (chevron) {
          gsap.to(chevron, {
            rotation: folder.classList.contains('open') ? 90 : 0,
            duration: 0.3,
            ease: EASE_SPRING
          });
        }

        // Morph the folder icon
        const icon = folder.querySelector('.folder-icon svg, .tree-folder__icon svg');
        if (icon) {
          gsap.fromTo(icon,
            { scale: 0.8 },
            { scale: 1, duration: 0.4, ease: EASE_SPRING }
          );
        }
      });
    });
  }

  /* ═══════════════════════════════════════
     HEADER GRADIENT MORPH
     ═══════════════════════════════════════ */

  function initHeaderGradient() {
    const bg = document.querySelector('.morph-header__bg');
    if (!bg) return;

    gsap.to(bg, {
      backgroundPosition: '100% 50%',
      duration: 6,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });
  }

  /* ═══════════════════════════════════════
     KANBAN CARD DRAG INDICATOR
     ═══════════════════════════════════════ */

  function initKanbanDragHints() {
    document.querySelectorAll('.kanban-card').forEach(card => {
      card.addEventListener('mousedown', () => {
        gsap.to(card, {
          scale: 1.04,
          boxShadow: '0 16px 48px rgba(59, 130, 246, 0.25)',
          duration: 0.2,
          ease: EASE_LIQUID
        });
      });

      card.addEventListener('mouseup', () => {
        gsap.to(card, {
          scale: 1,
          boxShadow: '0 4px 24px rgba(59, 130, 246, 0.08)',
          duration: 0.4,
          ease: EASE_SPRING
        });
      });
    });
  }

  /* ═══════════════════════════════════════
     HASH ROUTING
     ═══════════════════════════════════════ */

  function initHashRouting() {
    const hash = window.location.hash.replace('#', '');
    if (hash && viewMeta[hash]) {
      // Defer to allow DOM to render
      requestAnimationFrame(() => {
        switchView(hash);
      });
    } else {
      // Animate initial dashboard content
      requestAnimationFrame(() => {
        animateViewContent('dashboard');
      });
    }

    window.addEventListener('hashchange', () => {
      const newHash = window.location.hash.replace('#', '');
      if (newHash && viewMeta[newHash]) {
        switchView(newHash);
      }
    });
  }

  /* ═══════════════════════════════════════
     WHITEBOARD TOOLBAR
     ═══════════════════════════════════════ */

  function initWhiteboardToolbar() {
    document.querySelectorAll('.wb-tool').forEach(tool => {
      tool.addEventListener('click', () => {
        document.querySelectorAll('.wb-tool').forEach(t => t.classList.remove('active'));
        tool.classList.add('active');

        gsap.fromTo(tool,
          { scale: 0.85 },
          { scale: 1, duration: 0.4, ease: EASE_SPRING }
        );
      });
    });
  }

  /* ═══════════════════════════════════════
     RANGE SLIDER VALUE UPDATE
     ═══════════════════════════════════════ */

  function initSliders() {
    document.querySelectorAll('.liquid-slider').forEach(slider => {
      const valueDisplay = slider.parentElement.querySelector('.slider-value');
      if (!valueDisplay) return;

      slider.addEventListener('input', function () {
        valueDisplay.textContent = this.value + 'px';
      });
    });
  }

  /* ═══════════════════════════════════════
     SCROLL-BASED PARALLAX (MOMENTUM)
     ═══════════════════════════════════════ */

  function initScrollParallax() {
    let scrollTarget = 0;
    let currentScroll = 0;

    window.addEventListener('scroll', () => {
      scrollTarget = window.scrollY;
    }, { passive: true });

    function smoothScroll() {
      currentScroll += (scrollTarget - currentScroll) * 0.08;

      const header = document.querySelector('.morph-header');
      if (header) {
        const offset = currentScroll * 0.3;
        header.style.transform = `translateY(${Math.min(offset, 30)}px)`;
        header.style.opacity = Math.max(1 - currentScroll / 400, 0.6);
      }

      requestAnimationFrame(smoothScroll);
    }

    smoothScroll();
  }

  /* ═══════════════════════════════════════
     INITIALIZE EVERYTHING
     ═══════════════════════════════════════ */

  function init() {
    initBreathingAnimation();
    initCardHovers();
    initButtonRipples();
    initChatSend();
    initMorphInputs();
    initSettingsTabs();
    initToggleSwitches();
    initPriorityButtons();
    initDirectoryTree();
    initHeaderGradient();
    initKanbanDragHints();
    initWhiteboardToolbar();
    initSliders();
    initScrollParallax();
    initHashRouting();

    // Initial fade-in of the whole UI
    gsap.fromTo(document.body,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: 'power2.out' }
    );

    // Stagger nav buttons entry
    gsap.fromTo(navBtns,
      { x: -20, opacity: 0 },
      { x: 0, opacity: 0.65, duration: 0.4, stagger: 0.04, ease: EASE_SMOOTH, delay: 0.2 }
    );

    // Animate active nav button to full opacity
    const activeNav = document.querySelector('.blob-nav__btn.active');
    if (activeNav) {
      gsap.to(activeNav, { opacity: 1, delay: 0.6, duration: 0.3 });
    }
  }

  // Wait for GSAP and DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
