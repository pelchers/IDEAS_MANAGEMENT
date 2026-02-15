/* ================================================================
   SERENOVA — Mid-Century Modern Pass 4
   Noguchi Sculpture Garden Aesthetic
   App JS: Navigation, Interactions, Library Initialization
   ================================================================ */

(function () {
  'use strict';

  // --------------------------------
  // CONSTANTS
  // --------------------------------
  const VIEWS = [
    'dashboard', 'projects', 'project-workspace', 'kanban',
    'whiteboard', 'schema-planner', 'directory-tree',
    'ideas', 'ai-chat', 'settings'
  ];

  const TRANSITION_DURATION = 400; // ms — fade through white

  // --------------------------------
  // DOM REFERENCES
  // --------------------------------
  const hamburgerTrigger = document.getElementById('hamburgerTrigger');
  const overlayNav = document.getElementById('overlayNav');
  const overlayClose = document.getElementById('overlayClose');
  const navItems = document.querySelectorAll('.nav-item[data-view]');
  const pages = document.querySelectorAll('.page[data-page]');
  const transitionOverlay = document.getElementById('pageTransitionOverlay');
  const loadingState = document.getElementById('loadingState');
  const microFeedback = document.getElementById('microFeedback');

  // --------------------------------
  // LENIS SMOOTH SCROLL
  // --------------------------------
  let lenis = null;

  function initLenis() {
    if (typeof Lenis === 'undefined') return;
    lenis = new Lenis({
      duration: 1.6,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      orientation: 'vertical',
      smoothWheel: true
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // --------------------------------
  // TIPPY.JS — Whisper fade-in tooltips
  // --------------------------------
  function initTippy() {
    if (typeof tippy === 'undefined') return;
    tippy('[data-tippy-content]', {
      animation: 'fade',
      duration: [600, 300],  // slow fade-in like a gallery placard
      delay: [300, 0],
      arrow: true,
      placement: 'top',
      theme: '',
      offset: [0, 10]
    });
  }

  // --------------------------------
  // GSAP + SCROLLTRIGGER
  // Parallax layers & scroll reveal
  // --------------------------------
  function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // We will re-init scroll triggers when a view activates
  }

  function setupScrollReveals(pageEl) {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    // Kill old triggers
    ScrollTrigger.getAll().forEach(function (t) { t.kill(); });

    var reveals = pageEl.querySelectorAll('.reveal-element');
    reveals.forEach(function (el, i) {
      // First mark them as not revealed
      el.classList.remove('is-revealed');

      gsap.fromTo(el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power2.out',
          delay: i * 0.08,
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none',
            once: true,
            scroller: typeof lenis !== 'undefined' && lenis ? undefined : undefined
          },
          onComplete: function () {
            el.classList.add('is-revealed');
          }
        }
      );
    });

    // Parallax layers for elements with data-parallax
    var parallaxEls = pageEl.querySelectorAll('[data-parallax]');
    parallaxEls.forEach(function (el) {
      var speed = parseFloat(el.getAttribute('data-parallax')) || 0.03;
      gsap.to(el, {
        y: function () { return -100 * speed; },
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5
        }
      });
    });

    ScrollTrigger.refresh();
  }

  // Fallback scroll reveal without GSAP
  function setupFallbackReveals(pageEl) {
    var reveals = pageEl.querySelectorAll('.reveal-element');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    reveals.forEach(function (el) {
      el.classList.remove('is-revealed');
      observer.observe(el);
    });
  }

  // --------------------------------
  // NAVIGATION — Hash-based routing
  // --------------------------------
  function getViewFromHash() {
    var hash = window.location.hash.replace('#', '');
    if (VIEWS.indexOf(hash) !== -1) return hash;
    return 'dashboard';
  }

  function showView(viewName, skipTransition) {
    var targetPage = document.querySelector('.page[data-page="' + viewName + '"]');
    if (!targetPage) return;

    var currentActive = document.querySelector('.page.is-active');

    // Update nav active state
    navItems.forEach(function (item) {
      item.classList.remove('active');
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      }
    });

    if (skipTransition || !currentActive || currentActive === targetPage) {
      // No transition needed
      pages.forEach(function (p) { p.classList.remove('is-active'); });
      targetPage.classList.add('is-active');
      window.scrollTo(0, 0);
      if (lenis) lenis.scrollTo(0, { immediate: true });
      activatePageContent(targetPage);
      return;
    }

    // Fade through white transition
    transitionOverlay.classList.add('is-transitioning');

    setTimeout(function () {
      pages.forEach(function (p) { p.classList.remove('is-active'); });
      targetPage.classList.add('is-active');
      window.scrollTo(0, 0);
      if (lenis) lenis.scrollTo(0, { immediate: true });

      setTimeout(function () {
        transitionOverlay.classList.remove('is-transitioning');
        activatePageContent(targetPage);
      }, 100);
    }, TRANSITION_DURATION);
  }

  function activatePageContent(pageEl) {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      setupScrollReveals(pageEl);
    } else {
      setupFallbackReveals(pageEl);
    }
  }

  // --------------------------------
  // OVERLAY NAV CONTROLS
  // --------------------------------
  function openNav() {
    overlayNav.classList.add('is-open');
    overlayNav.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    overlayNav.classList.remove('is-open');
    overlayNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  hamburgerTrigger.addEventListener('click', openNav);
  overlayClose.addEventListener('click', closeNav);

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlayNav.classList.contains('is-open')) {
      closeNav();
    }
  });

  // Nav item click
  navItems.forEach(function (item) {
    item.addEventListener('click', function () {
      var view = this.getAttribute('data-view');
      window.location.hash = view;
      closeNav();
    });
  });

  // Hash change listener
  window.addEventListener('hashchange', function () {
    showView(getViewFromHash());
  });

  // --------------------------------
  // DIRECTORY TREE TOGGLE
  // --------------------------------
  function initDirectoryTree() {
    var toggles = document.querySelectorAll('.tree-toggle');
    toggles.forEach(function (toggle) {
      toggle.addEventListener('click', function () {
        var parentLi = this.closest('.tree-item--folder');
        if (!parentLi) return;

        var children = parentLi.querySelector('.tree-children');
        if (!children) return;

        var isOpen = parentLi.classList.contains('tree-item--open');
        if (isOpen) {
          children.style.display = 'none';
          parentLi.classList.remove('tree-item--open');
          var icon = this.querySelector('i');
          if (icon) {
            icon.className = icon.className.replace('ph-folder-open', 'ph-folder');
          }
        } else {
          children.style.display = '';
          parentLi.classList.add('tree-item--open');
          var icon2 = this.querySelector('i');
          if (icon2) {
            icon2.className = icon2.className.replace('ph-folder', 'ph-folder-open');
          }
        }
      });

      // Keyboard support
      toggle.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });
  }

  // --------------------------------
  // MICRO FEEDBACK TOAST
  // (gentle-fade-confirm)
  // --------------------------------
  function showFeedback(message) {
    microFeedback.textContent = message;
    microFeedback.classList.add('is-visible');

    setTimeout(function () {
      microFeedback.classList.remove('is-visible');
    }, 2200);
  }

  // Wire up feedback triggers
  function initFeedbackTriggers() {
    var saveBtn = document.getElementById('saveSettingsBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        showFeedback('Settings saved');
      });
    }

    var addIdeaBtn = document.getElementById('addIdeaBtn');
    if (addIdeaBtn) {
      addIdeaBtn.addEventListener('click', function () {
        showFeedback('New entry created');
      });
    }

    var chatSend = document.querySelector('.chat-send');
    var chatInput = document.querySelector('.chat-input');
    if (chatSend && chatInput) {
      chatSend.addEventListener('click', function () {
        if (chatInput.value.trim()) {
          showFeedback('Message sent');
          chatInput.value = '';
        }
      });
      chatInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && this.value.trim()) {
          showFeedback('Message sent');
          this.value = '';
        }
      });
    }

    // Toggle switches feedback
    var toggleSwitches = document.querySelectorAll('.toggle-switch input');
    toggleSwitches.forEach(function (toggle) {
      toggle.addEventListener('change', function () {
        showFeedback(this.checked ? 'Enabled' : 'Disabled');
      });
    });
  }

  // --------------------------------
  // LOADING STATE
  // (stone-ripple-slow)
  // --------------------------------
  function hideLoading() {
    setTimeout(function () {
      loadingState.classList.add('is-hidden');
      // After loading fades, initialize the first view
      var view = getViewFromHash();
      showView(view, true);
    }, 1200);
  }

  // --------------------------------
  // INITIALIZATION
  // --------------------------------
  function init() {
    initLenis();
    initGSAP();
    initTippy();
    initDirectoryTree();
    initFeedbackTriggers();
    hideLoading();
  }

  // Wait for DOM + fonts
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
