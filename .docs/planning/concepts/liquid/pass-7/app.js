/* ============================================================
   LIQUID PASS 7 — EDITORIAL INK FLOW
   app.js — Navigation, ink transitions, ambient canvas,
             parallax, scroll reveal, ink ripple interactions
   ============================================================ */

(function () {
  'use strict';

  // ---- DOM REFS ----
  const hamburger = document.getElementById('hamburger');
  const overlayNav = document.getElementById('overlayNav');
  const inkWashOverlay = document.getElementById('inkWashOverlay');
  const editorialMain = document.getElementById('editorialMain');
  const navLinks = document.querySelectorAll('.overlay-nav__link');
  const pages = document.querySelectorAll('.page[data-page]');
  const inkCanvas = document.getElementById('ink-ambient');
  const settingsTabs = document.querySelectorAll('[data-settings-tab]');
  const settingsPanels = document.querySelectorAll('[data-settings-panel]');

  let currentView = 'dashboard';
  let navOpen = false;

  // ---- HAMBURGER TOGGLE ----
  function toggleNav() {
    navOpen = !navOpen;
    hamburger.classList.toggle('is-open', navOpen);
    overlayNav.classList.toggle('is-open', navOpen);
    hamburger.setAttribute('aria-expanded', String(navOpen));
    overlayNav.setAttribute('aria-hidden', String(!navOpen));
    document.body.style.overflow = navOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', toggleNav);

  // Close nav on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navOpen) {
      toggleNav();
    }
  });

  // ---- INK WASH PAGE TRANSITION ----
  function playInkWashTransition(callback) {
    const layers = inkWashOverlay.querySelectorAll('.ink-wash-overlay__layer');
    const stagger = 80;
    const duration = 500;

    // Slide in layers
    layers.forEach(function (layer, i) {
      setTimeout(function () {
        layer.style.transition = 'transform ' + duration + 'ms cubic-bezier(0.16, 1, 0.3, 1)';
        layer.style.transform = 'translateX(0)';
      }, i * stagger);
    });

    // Execute callback at midpoint
    setTimeout(function () {
      if (callback) callback();
    }, stagger * layers.length + duration * 0.4);

    // Slide out layers
    setTimeout(function () {
      layers.forEach(function (layer, i) {
        setTimeout(function () {
          layer.style.transition = 'transform ' + duration + 'ms cubic-bezier(0.16, 1, 0.3, 1)';
          layer.style.transform = 'translateX(110%)';
        }, i * stagger);
      });
    }, stagger * layers.length + duration * 0.6);

    // Reset layers after transition
    setTimeout(function () {
      layers.forEach(function (layer) {
        layer.style.transition = 'none';
        layer.style.transform = 'translateX(-110%)';
      });
    }, stagger * layers.length * 2 + duration * 2);
  }

  // ---- VIEW SWITCHING ----
  function switchView(viewId) {
    if (viewId === currentView) {
      if (navOpen) toggleNav();
      return;
    }

    playInkWashTransition(function () {
      // Hide current page
      pages.forEach(function (page) {
        page.style.display = 'none';
      });

      // Show target page
      var target = document.querySelector('[data-page="' + viewId + '"]');
      if (target) {
        target.style.display = 'block';
        // Trigger reveal animations
        setTimeout(function () {
          initScrollReveal(target);
        }, 100);
      }

      // Update nav active state
      navLinks.forEach(function (link) {
        link.classList.toggle('active', link.getAttribute('data-view') === viewId);
      });

      currentView = viewId;
      window.scrollTo(0, 0);
    });

    // Close nav
    if (navOpen) {
      setTimeout(toggleNav, 200);
    }
  }

  // ---- NAV LINK CLICK HANDLERS ----
  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var viewId = this.getAttribute('data-view');
      switchView(viewId);
    });
  });

  // ---- HASH ROUTING ----
  function handleHash() {
    var hash = window.location.hash.replace('#', '');
    if (hash && document.querySelector('[data-page="' + hash + '"]')) {
      // Direct switch without transition on initial load
      pages.forEach(function (page) {
        page.style.display = 'none';
      });
      var target = document.querySelector('[data-page="' + hash + '"]');
      if (target) target.style.display = 'block';
      navLinks.forEach(function (link) {
        link.classList.toggle('active', link.getAttribute('data-view') === hash);
      });
      currentView = hash;
    }
  }

  window.addEventListener('hashchange', function () {
    var hash = window.location.hash.replace('#', '');
    if (hash !== currentView) {
      switchView(hash);
    }
  });

  // ---- SCROLL REVEAL ----
  function initScrollReveal(container) {
    var elements = container.querySelectorAll(
      '.stat-card, .project-card, .kanban-card, .idea-card, .activity-item, ' +
      '.workspace-section, .workspace-metadata, .chat-message, .setting-row, ' +
      '.integration-row, .data-section, .subscription-card, .tree-container, ' +
      '.tree-preview, .capture-form, .wb-container, .schema-entity, .editorial-aside'
    );

    elements.forEach(function (el, i) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ' + (i * 0.06) + 's, ' +
        'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ' + (i * 0.06) + 's';

      setTimeout(function () {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 50);
    });
  }

  // ---- INK RIPPLE ON BUTTONS ----
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-ripple]');
    if (!btn) return;

    var rect = btn.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    btn.style.setProperty('--ripple-x', x + 'px');
    btn.style.setProperty('--ripple-y', y + 'px');

    btn.classList.remove('rippling');
    // Force reflow
    void btn.offsetWidth;
    btn.classList.add('rippling');

    setTimeout(function () {
      btn.classList.remove('rippling');
    }, 600);

    // Create ink splash element
    var splash = document.createElement('span');
    splash.className = 'ink-ripple';
    splash.style.left = (x - 60) + 'px';
    splash.style.top = (y - 60) + 'px';
    btn.appendChild(splash);

    setTimeout(function () {
      if (splash.parentNode) splash.parentNode.removeChild(splash);
    }, 600);
  });

  // ---- PARALLAX ON CARDS ----
  var parallaxElements = document.querySelectorAll('[data-parallax]');

  function handleParallax() {
    parallaxElements.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var speed = parseFloat(el.getAttribute('data-parallax')) || 0.02;
      var center = rect.top + rect.height / 2;
      var viewCenter = window.innerHeight / 2;
      var offset = (center - viewCenter) * speed;

      el.style.transform = 'translateY(' + (-offset) + 'px)';
    });
  }

  var parallaxRaf;
  window.addEventListener('scroll', function () {
    if (parallaxRaf) cancelAnimationFrame(parallaxRaf);
    parallaxRaf = requestAnimationFrame(handleParallax);
  }, { passive: true });

  // ---- SETTINGS TABS ----
  settingsTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var tabId = this.getAttribute('data-settings-tab');

      settingsTabs.forEach(function (t) {
        t.classList.toggle('settings-tab--active', t.getAttribute('data-settings-tab') === tabId);
      });

      settingsPanels.forEach(function (panel) {
        var isActive = panel.getAttribute('data-settings-panel') === tabId;
        panel.classList.toggle('settings-panel--active', isActive);

        if (isActive) {
          // Animate reveal for active panel
          var children = panel.querySelectorAll('.form-group, .setting-row, .integration-row, .data-section, .subscription-card');
          children.forEach(function (child, i) {
            child.style.opacity = '0';
            child.style.transform = 'translateY(12px)';
            child.style.transition = 'opacity 0.4s ease ' + (i * 0.05) + 's, transform 0.4s ease ' + (i * 0.05) + 's';
            setTimeout(function () {
              child.style.opacity = '1';
              child.style.transform = 'translateY(0)';
            }, 30);
          });
        }
      });
    });
  });

  // ---- WORKSPACE NAV ----
  var workspaceNavItems = document.querySelectorAll('.workspace-nav__item');
  workspaceNavItems.forEach(function (item) {
    item.addEventListener('click', function () {
      workspaceNavItems.forEach(function (n) {
        n.classList.remove('workspace-nav__item--active');
      });
      this.classList.add('workspace-nav__item--active');
    });
  });

  // ---- TREE FOLDER TOGGLE ----
  var treeFolders = document.querySelectorAll('.tree-item--folder');
  treeFolders.forEach(function (folder) {
    folder.addEventListener('click', function () {
      this.classList.toggle('tree-item--open');
    });
  });

  // ---- INK AMBIENT CANVAS ----
  function initInkAmbient() {
    if (!inkCanvas) return;

    var ctx = inkCanvas.getContext('2d');
    var particles = [];
    var particleCount = 30;
    var w, h;

    function resize() {
      w = inkCanvas.width = window.innerWidth;
      h = inkCanvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    function Particle() {
      this.reset();
    }

    Particle.prototype.reset = function () {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.size = Math.random() * 3 + 1;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.15;
      this.opacity = Math.random() * 0.15 + 0.02;
      this.hue = Math.random() > 0.5 ? '123, 104, 238' : '0, 212, 170';
      this.life = Math.random() * 200 + 100;
      this.maxLife = this.life;
    };

    Particle.prototype.update = function () {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life--;

      if (this.life <= 0 || this.x < -20 || this.x > w + 20 || this.y < -20 || this.y > h + 20) {
        this.reset();
      }
    };

    Particle.prototype.draw = function () {
      var lifeFactor = this.life / this.maxLife;
      var alpha = this.opacity * lifeFactor;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + this.hue + ', ' + alpha + ')';
      ctx.fill();
    };

    // Initialize particles
    for (var i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, w, h);

      particles.forEach(function (p) {
        p.update();
        p.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  // ---- CARD HOVER EDGE SOFTENING ----
  document.addEventListener('mouseover', function (e) {
    var card = e.target.closest('.project-card, .kanban-card, .idea-card, .stat-card');
    if (card) {
      card.style.filter = 'blur(0px)';
      card.style.borderColor = 'rgba(123, 104, 238, 0.3)';
    }
  });

  document.addEventListener('mouseout', function (e) {
    var card = e.target.closest('.project-card, .kanban-card, .idea-card, .stat-card');
    if (card) {
      card.style.filter = '';
      card.style.borderColor = '';
    }
  });

  // ---- INPUT FOCUS LIQUID BORDER ----
  document.querySelectorAll('.form-input, .form-textarea, .form-select, .chat-input, .search-field__input').forEach(function (input) {
    input.addEventListener('focus', function () {
      var parent = this.closest('.search-field') || this;
      parent.style.transition = 'border-color 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    });
  });

  // ---- NAV LINK INK UNDERLINE ----
  navLinks.forEach(function (link) {
    link.addEventListener('mouseenter', function () {
      var after = this.querySelector('.overlay-nav__label');
      if (after) {
        after.style.transition = 'color 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      }
    });
  });

  // ---- MICRO FEEDBACK ----
  function showMicroFeedback(element) {
    if (!element) return;
    element.style.transition = 'box-shadow 0.3s ease';
    element.style.boxShadow = '0 0 15px rgba(123, 104, 238, 0.3)';
    setTimeout(function () {
      element.style.boxShadow = '';
    }, 300);
  }

  // Add micro-feedback to form submit buttons
  document.querySelectorAll('.btn--primary').forEach(function (btn) {
    btn.addEventListener('click', function () {
      showMicroFeedback(this);
    });
  });

  // ---- INITIALIZE ----
  function init() {
    handleHash();
    initInkAmbient();

    // Reveal initial page
    var initialPage = document.querySelector('[data-page="' + currentView + '"]');
    if (initialPage) {
      setTimeout(function () {
        initScrollReveal(initialPage);
      }, 300);
    }

    // Re-query parallax elements after reveal
    setTimeout(function () {
      parallaxElements = document.querySelectorAll('[data-parallax]');
    }, 500);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
