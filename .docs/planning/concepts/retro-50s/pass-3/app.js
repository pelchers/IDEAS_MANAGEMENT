/* ============================================
   STARLIGHT PICTURES — app.js
   Pass 3: Drive-In Movie Theater Night
   Navigation, interactions, library init
   ============================================ */

(function () {
  'use strict';

  // ---- State ----
  let currentView = 'dashboard';
  let tooltipEl = null;
  const VIEWS = [
    'dashboard', 'projects', 'project-workspace', 'kanban',
    'whiteboard', 'schema-planner', 'directory-tree',
    'ideas', 'ai-chat', 'settings'
  ];

  // ---- DOM Ready ----
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    createTooltipElement();
    initFilmCountdownLoader();
    initDustParticles();
    initNavigation();
    initHashRouting();
    initScrollReveal();
    initButtonInteractions();
    initToggleSwitches();
    initTooltips();
    initChatInput();
    initSplitting();
    initGSAPChaserLights();
  }

  // ---- Film Countdown Loader (loadingState: film-countdown-leader) ----
  function initFilmCountdownLoader() {
    const loader = document.getElementById('film-loader');
    const numberEl = loader.querySelector('.countdown-number');
    let count = 5;

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        numberEl.textContent = count;
      } else {
        clearInterval(interval);
        numberEl.textContent = '';
        loader.classList.add('hidden');
        // Show initial view after loader hides
        setTimeout(() => {
          const initialView = window.location.hash.slice(1) || 'dashboard';
          navigateTo(initialView, false);
        }, 200);
      }
    }, 400);
  }

  // ---- Projector Dust Particles (idleAmbient: projector-dust-particles) ----
  function initDustParticles() {
    const container = document.getElementById('dust-particles');
    const PARTICLE_COUNT = 30;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const particle = document.createElement('div');
      particle.className = 'dust-particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (8 + Math.random() * 12) + 's';
      particle.style.animationDelay = (Math.random() * 10) + 's';
      particle.style.width = (1.5 + Math.random() * 3) + 'px';
      particle.style.height = particle.style.width;
      particle.style.opacity = 0.15 + Math.random() * 0.3;
      container.appendChild(particle);
    }
  }

  // ---- Navigation ----
  function initNavigation() {
    const navDots = document.querySelectorAll('.nav-dot[data-view]');
    navDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const view = dot.getAttribute('data-view');
        navigateTo(view, true);
        // Close mobile nav
        closeMobileNav();
      });
    });

    // Mobile hamburger
    const hamburger = document.getElementById('mobileMenuToggle');
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      document.getElementById('rightRailNav').classList.toggle('open');
    });
  }

  function closeMobileNav() {
    document.getElementById('mobileMenuToggle').classList.remove('open');
    document.getElementById('rightRailNav').classList.remove('open');
  }

  // ---- Hash-Based Routing ----
  function initHashRouting() {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1);
      if (VIEWS.includes(hash)) {
        navigateTo(hash, true);
      }
    });
  }

  function navigateTo(viewName, animate) {
    if (!VIEWS.includes(viewName)) viewName = 'dashboard';

    if (animate && currentView !== viewName) {
      // Film reel wipe transition (pageTransition: film-reel-wipe)
      filmWipeTransition(() => {
        switchView(viewName);
      });
    } else {
      switchView(viewName);
    }

    currentView = viewName;
    window.location.hash = viewName;

    // Update nav active state
    updateNavActive(viewName);
  }

  function switchView(viewName) {
    const allViews = document.querySelectorAll('.view[data-page]');
    allViews.forEach(v => {
      v.classList.remove('active', 'visible');
    });

    const targetView = document.querySelector(`.view[data-page="${viewName}"]`);
    if (targetView) {
      targetView.classList.add('active');
      // Trigger visible animation after display change
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          targetView.classList.add('visible');
          // Re-trigger scroll reveals for new view
          observeScrollReveals(targetView);
        });
      });
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function updateNavActive(viewName) {
    document.querySelectorAll('.nav-dot').forEach(dot => {
      dot.classList.remove('active');
      if (dot.getAttribute('data-view') === viewName) {
        dot.classList.add('active');
      }
    });
  }

  // ---- Film Wipe Transition (pageTransition: film-reel-wipe) ----
  function filmWipeTransition(callback) {
    const wipe = document.getElementById('film-wipe');
    wipe.classList.add('active');

    setTimeout(() => {
      if (callback) callback();
      setTimeout(() => {
        wipe.classList.remove('active');
      }, 350);
    }, 400);
  }

  // ---- Scroll Reveal (scrollReveal: fade-in-spotlight) ----
  function initScrollReveal() {
    // Initial reveal for active view
    const activeView = document.querySelector('.view.active');
    if (activeView) {
      observeScrollReveals(activeView);
    }
  }

  function observeScrollReveals(container) {
    const elements = container.querySelectorAll('.scroll-reveal');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          // Stagger the reveal like a spotlight sweep
          const delay = idx * 80;
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => {
      el.classList.remove('revealed');
      observer.observe(el);
    });
  }

  // ---- Button Interactions ----
  function initButtonInteractions() {
    // marquee-light-chase hover + projection-flash click
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.marquee-btn, .action-btn');
      if (btn) {
        // Projection flash (buttonClick: projection-flash)
        btn.classList.remove('flash');
        void btn.offsetWidth; // Force reflow
        btn.classList.add('flash');

        // Star pop micro-feedback (microFeedback: star-rating-pop)
        showStarPop(e.clientX, e.clientY);

        setTimeout(() => {
          btn.classList.remove('flash');
        }, 300);
      }
    });
  }

  // ---- Micro Feedback: star-rating-pop ----
  function showStarPop(x, y) {
    const star = document.createElement('div');
    star.className = 'star-pop';
    star.textContent = '\u2733'; // star symbol
    star.style.left = x + 'px';
    star.style.top = y + 'px';
    document.body.appendChild(star);

    // Also fire confetti if available
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 12,
        spread: 40,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight
        },
        colors: ['#ffe014', '#ff4488', '#f5f0e8'],
        gravity: 1.5,
        ticks: 60,
        scalar: 0.6
      });
    }

    setTimeout(() => {
      star.remove();
    }, 800);
  }

  // ---- Toggle Switches (toggleSwitch: film-switch-click) ----
  function initToggleSwitches() {
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
      const input = toggle.querySelector('input');
      input.addEventListener('change', () => {
        // Mechanical click animation
        toggle.classList.remove('clicked');
        void toggle.offsetWidth;
        toggle.classList.add('clicked');

        // Update CSS custom property for animation direction
        toggle.style.setProperty('--toggle-x', input.checked ? '28px' : '0');

        setTimeout(() => {
          toggle.classList.remove('clicked');
        }, 200);
      });
    });
  }

  // ---- Tooltips (tooltips: ticket-stub-popup) ----
  function createTooltipElement() {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'tooltip-popup';
    document.body.appendChild(tooltipEl);
  }

  function initTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach(el => {
      el.addEventListener('mouseenter', (e) => {
        const text = el.getAttribute('data-tooltip');
        if (!text) return;
        tooltipEl.textContent = text;
        tooltipEl.classList.add('visible');
        positionTooltip(e);
      });

      el.addEventListener('mousemove', positionTooltip);

      el.addEventListener('mouseleave', () => {
        tooltipEl.classList.remove('visible');
      });
    });
  }

  function positionTooltip(e) {
    const x = e.clientX + 12;
    const y = e.clientY - 32;
    tooltipEl.style.left = x + 'px';
    tooltipEl.style.top = y + 'px';
  }

  // ---- Chat Input (AI Chat view) ----
  function initChatInput() {
    const input = document.querySelector('.chat-input');
    const sendBtn = document.querySelector('.chat-send-btn');

    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        if (input && input.value.trim()) {
          // Add user message to chat
          addChatMessage(input.value.trim(), 'user');
          const question = input.value.trim();
          input.value = '';

          // Simulate AI response after delay
          setTimeout(() => {
            addChatMessage(generateAIResponse(question), 'ai');
          }, 1200);
        }
      });
    }

    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          sendBtn.click();
        }
      });
    }
  }

  function addChatMessage(text, sender) {
    const chatContainer = document.querySelector('.comic-panel-chat');
    const inputRow = chatContainer.querySelector('.chat-input-row');

    const row = document.createElement('div');
    row.className = 'comic-row';

    const isUser = sender === 'user';
    row.innerHTML = `
      <div class="comic-panel ${isUser ? 'user-panel' : 'ai-panel'}">
        ${isUser ? '' : `
          <div class="panel-character ai-character">
            <div class="character-avatar ai-avatar">SD</div>
            <span class="character-name">Script Doctor</span>
          </div>
        `}
        <div class="speech-bubble ${isUser ? 'user-bubble' : 'ai-bubble'}">
          <div class="${isUser ? 'bubble-tail-user' : 'bubble-tail-ai'}"></div>
          <p>${escapeHtml(text)}</p>
        </div>
        ${isUser ? `
          <div class="panel-character user-character">
            <div class="character-avatar user-avatar">MC</div>
            <span class="character-name">Mara Chen</span>
          </div>
        ` : ''}
      </div>
    `;

    chatContainer.insertBefore(row, inputRow);

    // Scroll to bottom
    row.scrollIntoView({ behavior: 'smooth', block: 'end' });

    // Star pop feedback on send
    if (isUser) {
      const rect = row.getBoundingClientRect();
      showStarPop(rect.right - 20, rect.top + 20);
    }
  }

  function generateAIResponse(question) {
    const responses = [
      "That's a strong instinct. Consider setting up a visual motif in Act I that pays off in the climax — something the audience registers subconsciously, like a recurring color or prop.",
      "The pacing issue might be structural rather than dialogue-based. Try intercutting with a parallel timeline to create urgency without adding new action scenes.",
      "Think about what your character wants versus what they need. The tension between those two things is where your third act lives.",
      "A technique that works well in noir: let the environment tell the story. Instead of exposition, show the detective walking through spaces that reveal information visually.",
      "Consider the Hitchcock principle — give the audience information the character doesn't have. That transforms a conversation into a suspense sequence."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ---- Splitting.js Init ----
  function initSplitting() {
    if (typeof Splitting === 'function') {
      Splitting({ target: '.splitting-target', by: 'chars' });
    }
  }

  // ---- GSAP: Marquee Chaser Lights ----
  function initGSAPChaserLights() {
    if (typeof gsap === 'undefined') return;

    // Animate the marquee header chaser lights
    gsap.to('.chaser-lights', {
      '--chaser-angle': '360deg',
      duration: 3,
      repeat: -1,
      ease: 'none'
    });

    // Stagger the marquee column headers shimmer
    gsap.utils.toArray('.marquee-column-header').forEach(header => {
      gsap.fromTo(header.querySelector('::before') || header, {
        backgroundPosition: '-100%',
      }, {
        backgroundPosition: '100%',
        duration: 2,
        repeat: -1,
        ease: 'none'
      });
    });

    // Scroll-triggered reveals using GSAP ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      // Enhanced spotlight reveal for timeline nodes
      gsap.utils.toArray('.timeline-node').forEach((node, i) => {
        gsap.from(node, {
          opacity: 0,
          y: 30,
          duration: 0.6,
          delay: i * 0.15,
          scrollTrigger: {
            trigger: node,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        });
      });

      // Stagger storyboard cells
      gsap.utils.toArray('.storyboard-cell').forEach((cell, i) => {
        gsap.from(cell, {
          opacity: 0,
          scale: 0.9,
          duration: 0.5,
          delay: i * 0.1,
          scrollTrigger: {
            trigger: cell,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        });
      });

      // Credits entries stagger
      gsap.utils.toArray('.credit-entry').forEach((entry, i) => {
        gsap.from(entry, {
          opacity: 0,
          x: -20,
          duration: 0.4,
          delay: i * 0.05,
          scrollTrigger: {
            trigger: entry,
            start: 'top 90%',
            toggleActions: 'play none none none'
          }
        });
      });
    }
  }

})();
