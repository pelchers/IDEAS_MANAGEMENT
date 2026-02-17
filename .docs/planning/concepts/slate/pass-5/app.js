/* ==========================================================================
   MERIDIAN PRIVATE WEALTH — App Controller
   Slate Pass 5 · Marble Luxury Banking
   ========================================================================== */

(function () {
  'use strict';

  /* --- DOM References --- */
  const pillNav = document.getElementById('pillNav');
  const pillToggleGroup = document.getElementById('pillToggleGroup');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const appMain = document.getElementById('appMain');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const goldSeal = document.getElementById('goldSeal');
  const engravedTooltip = document.getElementById('engravedTooltip');
  const marbleAmbient = document.getElementById('marbleAmbient');
  const ambientToggle = document.getElementById('ambientToggle');

  const pillItems = document.querySelectorAll('.pill-item');
  const viewPanels = document.querySelectorAll('.view-panel');
  const drawerHandles = document.querySelectorAll('.drawer-handle');
  const toggleSwitches = document.querySelectorAll('.brass-toggle input');
  const buttons = document.querySelectorAll('.btn-primary');

  let currentView = 'dashboard';
  let isTransitioning = false;

  /* --- Loading Screen --- */
  function dismissLoading() {
    setTimeout(function () {
      loadingOverlay.classList.add('hidden');
      // Trigger initial scroll reveals
      triggerScrollReveals();
    }, 1200);
  }

  /* --- Navigation --- */
  function navigateTo(viewId) {
    if (viewId === currentView || isTransitioning) return;
    isTransitioning = true;

    // Update pills
    pillItems.forEach(function (pill) {
      pill.classList.toggle('active', pill.dataset.view === viewId);
    });

    // Close mobile menu
    if (pillToggleGroup.classList.contains('open')) {
      pillToggleGroup.classList.remove('open');
      mobileMenuBtn.classList.remove('open');
    }

    // Vault door transition out
    const currentPanel = document.getElementById('view-' + currentView);
    if (currentPanel) {
      currentPanel.classList.add('exiting');
      currentPanel.classList.remove('active');
    }

    setTimeout(function () {
      // Hide old view
      if (currentPanel) {
        currentPanel.classList.remove('exiting');
        currentPanel.style.display = 'none';
      }

      // Show new view
      currentView = viewId;
      const newPanel = document.getElementById('view-' + viewId);
      if (newPanel) {
        newPanel.style.display = '';
        // Force reflow before adding class
        void newPanel.offsetHeight;
        newPanel.classList.add('active');

        // Reset scroll reveals for new view
        var reveals = newPanel.querySelectorAll('[data-scroll-reveal]');
        reveals.forEach(function (el) {
          el.classList.remove('revealed');
        });

        // Trigger reveals after panel animation
        setTimeout(function () {
          triggerScrollReveals();
          isTransitioning = false;
        }, 100);
      } else {
        isTransitioning = false;
      }
    }, 350);
  }

  // Nav click handlers
  pillItems.forEach(function (pill) {
    pill.addEventListener('click', function () {
      navigateTo(this.dataset.view);
    });
  });

  // Mobile menu toggle
  mobileMenuBtn.addEventListener('click', function () {
    pillToggleGroup.classList.toggle('open');
    mobileMenuBtn.classList.toggle('open');
  });

  /* --- Scroll Reveal (Marble Slab Slide-In) --- */
  function triggerScrollReveals() {
    var reveals = document.querySelectorAll('[data-scroll-reveal]');
    var delay = 0;
    reveals.forEach(function (el) {
      if (isElementInViewport(el) && !el.classList.contains('revealed')) {
        setTimeout(function () {
          el.classList.add('revealed');
        }, delay);
        delay += 120; // Stagger
      }
    });
  }

  function isElementInViewport(el) {
    var rect = el.getBoundingClientRect();
    return (
      rect.top < (window.innerHeight || document.documentElement.clientHeight) + 100 &&
      rect.bottom > -100
    );
  }

  window.addEventListener('scroll', function () {
    triggerScrollReveals();
  }, { passive: true });

  /* --- Engraved Plaque Tooltips --- */
  var tooltipElements = document.querySelectorAll('[data-tooltip]');
  tooltipElements.forEach(function (el) {
    el.addEventListener('mouseenter', function (e) {
      var text = this.getAttribute('data-tooltip');
      if (!text) return;
      var tooltipContent = engravedTooltip.querySelector('.tooltip-content');
      tooltipContent.textContent = text;
      engravedTooltip.classList.add('visible');

      var rect = this.getBoundingClientRect();
      engravedTooltip.style.left = (rect.left + rect.width / 2) + 'px';
      engravedTooltip.style.top = (rect.bottom + 8) + 'px';
      engravedTooltip.style.transform = 'translateX(-50%)';
    });

    el.addEventListener('mouseleave', function () {
      engravedTooltip.classList.remove('visible');
    });
  });

  /* --- Card Catalog Drawer Toggles --- */
  drawerHandles.forEach(function (handle) {
    handle.addEventListener('click', function () {
      var contents = this.nextElementSibling;
      if (contents && contents.classList.contains('drawer-contents')) {
        var isOpen = contents.classList.contains('open');
        contents.classList.toggle('open');
        // Chevron rotation
        var chevron = this.querySelector('.drawer-chevron');
        if (chevron) {
          chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
        }
      }
    });
  });

  /* --- Brass Toggle Switch Animation --- */
  toggleSwitches.forEach(function (toggle) {
    toggle.addEventListener('change', function () {
      var thumb = this.parentElement.querySelector('.toggle-thumb');
      if (thumb && typeof anime !== 'undefined') {
        // Brass lever heavy toggle effect
        anime({
          targets: thumb,
          scale: [1, 1.15, 1],
          duration: 400,
          easing: 'easeInOutCubic'
        });
      }

      // Show gold seal confirmation
      showGoldSeal();

      // Ambient toggle special handler
      if (this.id === 'ambientToggle') {
        marbleAmbient.style.opacity = this.checked ? '0.03' : '0';
      }
    });
  });

  /* --- Gold Seal Micro-Feedback --- */
  function showGoldSeal() {
    goldSeal.classList.add('active');
    if (typeof anime !== 'undefined') {
      anime({
        targets: goldSeal.querySelector('.seal-circle'),
        scale: [0, 1.1, 1],
        rotate: ['-10deg', '0deg'],
        duration: 600,
        easing: 'easeOutBack'
      });
    }
    setTimeout(function () {
      goldSeal.classList.remove('active');
    }, 1000);
  }

  /* --- Button Gold-Foil Edge Reveal & Vault Press --- */
  buttons.forEach(function (btn) {
    btn.addEventListener('mouseenter', function () {
      if (typeof anime !== 'undefined') {
        anime({
          targets: this,
          borderColor: ['transparent', '#b8963a'],
          duration: 300,
          easing: 'easeOutQuad'
        });
      }
    });

    btn.addEventListener('click', function (e) {
      // Vault door press feedback
      var btn = this;
      btn.style.transition = 'transform 0.15s cubic-bezier(0.7, 0, 0.3, 1)';
      btn.style.transform = 'scale(0.96) translateY(2px)';
      setTimeout(function () {
        btn.style.transform = '';
      }, 200);

      // Show gold seal for primary actions
      showGoldSeal();
    });
  });

  /* --- Marble Light Drift (Idle Ambient) --- */
  function initAmbientDrift() {
    if (typeof anime === 'undefined') return;
    // The CSS animation handles the ambient drift
    // Add subtle parallax to marble cards on mouse move
    document.addEventListener('mousemove', function (e) {
      if (!ambientToggle || !ambientToggle.checked) return;

      var mouseX = e.clientX / window.innerWidth - 0.5;
      var mouseY = e.clientY / window.innerHeight - 0.5;

      marbleAmbient.style.backgroundPosition =
        (50 + mouseX * 10) + '% ' + (50 + mouseY * 10) + '%';
    });
  }

  /* --- Deposit Box Hover (Kanban) --- */
  var depositBoxes = document.querySelectorAll('.deposit-box');
  depositBoxes.forEach(function (box) {
    box.addEventListener('mouseenter', function () {
      if (typeof anime !== 'undefined') {
        anime({
          targets: this.querySelector('.box-latch'),
          translateX: [0, 4],
          duration: 300,
          easing: 'easeOutQuad'
        });
      }
    });

    box.addEventListener('mouseleave', function () {
      if (typeof anime !== 'undefined') {
        anime({
          targets: this.querySelector('.box-latch'),
          translateX: [4, 0],
          duration: 300,
          easing: 'easeOutQuad'
        });
      }
    });
  });

  /* --- Horizontal Swipe for Carousel --- */
  var carousel = document.getElementById('dashboardCarousel');
  if (carousel) {
    var isDown = false;
    var startX;
    var scrollLeft;

    carousel.addEventListener('mousedown', function (e) {
      isDown = true;
      startX = e.pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
      carousel.style.cursor = 'grabbing';
    });

    carousel.addEventListener('mouseleave', function () {
      isDown = false;
      carousel.style.cursor = '';
    });

    carousel.addEventListener('mouseup', function () {
      isDown = false;
      carousel.style.cursor = '';
    });

    carousel.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - carousel.offsetLeft;
      var walk = (x - startX) * 2;
      carousel.scrollLeft = scrollLeft - walk;
    });

    // Touch support
    carousel.addEventListener('touchstart', function (e) {
      startX = e.touches[0].pageX;
      scrollLeft = carousel.scrollLeft;
    }, { passive: true });

    carousel.addEventListener('touchmove', function (e) {
      var x = e.touches[0].pageX;
      var walk = (x - startX) * 1.5;
      carousel.scrollLeft = scrollLeft - walk;
    }, { passive: true });
  }

  /* --- Anime.js Stagger Animations on View Enter --- */
  function animateViewEnter(viewId) {
    if (typeof anime === 'undefined') return;

    var panel = document.getElementById('view-' + viewId);
    if (!panel) return;

    // Stagger marble cards
    var cards = panel.querySelectorAll('.marble-card');
    if (cards.length > 0) {
      anime({
        targets: cards,
        opacity: [0, 1],
        translateY: [30, 0],
        delay: anime.stagger(80, { start: 200 }),
        duration: 600,
        easing: 'easeOutCubic'
      });
    }
  }

  /* --- Whiteboard Node Hover --- */
  var boardNodes = document.querySelectorAll('.board-node');
  boardNodes.forEach(function (node) {
    node.addEventListener('mouseenter', function () {
      if (typeof anime !== 'undefined') {
        anime({
          targets: this.querySelector('.node-frame'),
          scale: 1.03,
          boxShadow: '0 8px 32px rgba(184, 150, 58, 0.15)',
          duration: 300,
          easing: 'easeOutQuad'
        });
      }
    });

    node.addEventListener('mouseleave', function () {
      if (typeof anime !== 'undefined') {
        anime({
          targets: this.querySelector('.node-frame'),
          scale: 1,
          boxShadow: '0 2px 12px rgba(26, 42, 26, 0.06)',
          duration: 300,
          easing: 'easeOutQuad'
        });
      }
    });
  });

  /* --- Gallery Frame Hover --- */
  var galleryFrames = document.querySelectorAll('.gallery-frame');
  galleryFrames.forEach(function (frame) {
    frame.addEventListener('mouseenter', function () {
      if (typeof anime !== 'undefined') {
        anime({
          targets: this.querySelector('.frame-brass-border'),
          borderColor: ['#b8963a', '#d4b84a'],
          boxShadow: ['0 0 0 rgba(184,150,58,0)', '0 0 16px rgba(184,150,58,0.15)'],
          duration: 400,
          easing: 'easeOutQuad'
        });
      }
    });

    frame.addEventListener('mouseleave', function () {
      if (typeof anime !== 'undefined') {
        anime({
          targets: this.querySelector('.frame-brass-border'),
          borderColor: '#b8963a',
          boxShadow: '0 0 0 rgba(184,150,58,0)',
          duration: 400,
          easing: 'easeOutQuad'
        });
      }
    });
  });

  /* --- Send Button (Chat) --- */
  var sendBtn = document.querySelector('.send-btn');
  var chatInput = document.querySelector('.chat-input');
  if (sendBtn && chatInput) {
    sendBtn.addEventListener('click', function () {
      var text = chatInput.value.trim();
      if (!text) return;

      var thread = document.getElementById('letterThread');

      // Add user message
      var userLetter = document.createElement('div');
      userLetter.className = 'letter user-letter';
      userLetter.innerHTML =
        '<div class="letter-card">' +
          '<div class="letter-meta">' +
            '<span class="letter-sender">V. Ashworth, Managing Partner</span>' +
            '<span class="letter-date">Just now</span>' +
          '</div>' +
          '<p class="letter-body">' + escapeHtml(text) + '</p>' +
        '</div>';

      thread.appendChild(userLetter);
      chatInput.value = '';

      // Animate in
      if (typeof anime !== 'undefined') {
        anime({
          targets: userLetter,
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 400,
          easing: 'easeOutCubic'
        });
      }

      // Auto-reply
      setTimeout(function () {
        var aiLetter = document.createElement('div');
        aiLetter.className = 'letter ai-letter';
        aiLetter.innerHTML =
          '<div class="letter-card">' +
            '<div class="letter-header-emboss">' +
              '<span class="emboss-logo">M</span>' +
              '<span class="emboss-name">Meridian AI Counsel</span>' +
            '</div>' +
            '<div class="letter-meta">' +
              '<span class="letter-date">Just now</span>' +
            '</div>' +
            '<p class="letter-body">Thank you for your inquiry, Ms. Ashworth. I am reviewing the relevant data and will provide a comprehensive analysis shortly. In the meantime, please note that all current positions remain within their risk parameters and no immediate action is required.</p>' +
            '<div class="letter-seal"><div class="wax-seal"><span>M</span></div></div>' +
          '</div>';

        thread.appendChild(aiLetter);
        thread.scrollTop = thread.scrollHeight;

        if (typeof anime !== 'undefined') {
          anime({
            targets: aiLetter,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 400,
            easing: 'easeOutCubic'
          });
        }
      }, 1200);

      thread.scrollTop = thread.scrollHeight;
    });

    // Enter key to send
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
      }
    });
  }

  /* --- Metric Bar Animation --- */
  function animateMetricBars() {
    var fills = document.querySelectorAll('.metric-fill');
    fills.forEach(function (fill) {
      var width = fill.style.width;
      fill.style.width = '0';
      setTimeout(function () {
        fill.style.width = width;
      }, 500);
    });
  }

  /* --- Escape HTML --- */
  function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  /* --- Initialization --- */
  function init() {
    dismissLoading();
    initAmbientDrift();

    // Set initial reveal for first drawer
    var firstDrawerContents = document.querySelector('.drawer-contents');
    if (firstDrawerContents) {
      firstDrawerContents.classList.add('open');
      var firstChevron = firstDrawerContents.previousElementSibling.querySelector('.drawer-chevron');
      if (firstChevron) {
        firstChevron.style.transform = 'rotate(180deg)';
      }
    }

    // Animate metric bars after load
    setTimeout(animateMetricBars, 1500);

    // Trigger initial scroll reveals
    setTimeout(triggerScrollReveals, 200);
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
