/* ============================================================
   IDEAHUB DINER - Retro 50s Idea Management
   Application Logic: Jukebox Navigation + View Switching
   ============================================================ */

(function () {
  'use strict';

  // ---------- DOM REFERENCES ----------
  const jukeboxBtns = document.querySelectorAll('.jukebox-btn[data-view]');
  const viewPanels = document.querySelectorAll('.view-panel[data-page]');
  const categoryHeaders = document.querySelectorAll('.category-header');

  // ---------- VIEW SWITCHING ----------
  function switchView(viewName) {
    // Deactivate all buttons
    jukeboxBtns.forEach(function (btn) {
      btn.classList.remove('active');
      if (btn.dataset.view === viewName) {
        btn.classList.add('active');
        // Bouncy flip animation on the active button
        btn.style.animation = 'none';
        // Force reflow
        void btn.offsetHeight;
        btn.style.animation = 'jukeboxFlip 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      }
    });

    // Switch view panels
    viewPanels.forEach(function (panel) {
      if (panel.dataset.page === viewName) {
        panel.classList.add('active');
        // Re-trigger slide-in animation
        panel.style.animation = 'none';
        void panel.offsetHeight;
        panel.style.animation = 'viewSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both';
      } else {
        panel.classList.remove('active');
      }
    });

    // Update hash without scrolling
    history.replaceState(null, '', '#' + viewName);
  }

  // ---------- JUKEBOX BUTTON CLICK HANDLERS ----------
  jukeboxBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var viewName = btn.dataset.view;
      if (viewName) {
        switchView(viewName);
      }
    });
  });

  // ---------- HASH ROUTING ----------
  function handleHash() {
    var hash = window.location.hash.replace('#', '');
    if (hash && document.querySelector('[data-page="' + hash + '"]')) {
      switchView(hash);
    } else {
      switchView('dashboard');
    }
  }

  window.addEventListener('hashchange', handleHash);

  // ---------- DIRECTORY TREE EXPAND/COLLAPSE ----------
  categoryHeaders.forEach(function (header) {
    header.addEventListener('click', function () {
      var listing = header.nextElementSibling;
      if (listing && listing.classList.contains('track-listing')) {
        listing.classList.toggle('collapsed');
      }
    });
  });

  // ---------- FILTER PILLS (Projects view) ----------
  var filterPills = document.querySelectorAll('.filter-pills .pill-btn');
  filterPills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      filterPills.forEach(function (p) { p.classList.remove('active'); });
      pill.classList.add('active');
    });
  });

  // ---------- CHROME KNOBS (Whiteboard toolbar) ----------
  var chromeKnobs = document.querySelectorAll('.diner-counter-toolbar .chrome-knob:not(.color-knob)');
  chromeKnobs.forEach(function (knob) {
    knob.addEventListener('click', function () {
      chromeKnobs.forEach(function (k) { k.classList.remove('active'); });
      knob.classList.add('active');
    });
  });

  // ---------- RANGE SLIDER VALUE DISPLAY ----------
  var rangeSliders = document.querySelectorAll('.retro-slider');
  rangeSliders.forEach(function (slider) {
    var valueDisplay = slider.parentElement.querySelector('.knob-value');
    if (valueDisplay) {
      slider.addEventListener('input', function () {
        valueDisplay.textContent = slider.value + '%';
      });
    }
  });

  // ---------- COIN DROP ANIMATION ----------
  var coinDropBtn = document.querySelector('.coin-drop-btn');
  var coinInput = document.querySelector('.coin-input');
  if (coinDropBtn && coinInput) {
    coinDropBtn.addEventListener('click', function () {
      if (coinInput.value.trim()) {
        // Bounce animation on the button
        coinDropBtn.style.animation = 'none';
        void coinDropBtn.offsetHeight;
        coinDropBtn.style.animation = 'coinDrop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';

        // Flash the coin slit
        var slit = document.querySelector('.coin-slit');
        if (slit) {
          slit.style.background = 'linear-gradient(180deg, #ff6b8a, #ff8fa8, #ff6b8a)';
          slit.style.boxShadow = '0 0 12px rgba(255, 107, 138, 0.6)';
          setTimeout(function () {
            slit.style.background = '';
            slit.style.boxShadow = '';
          }, 600);
        }

        // Clear input after "drop"
        setTimeout(function () {
          coinInput.value = '';
          coinInput.placeholder = 'Great idea! Drop another...';
        }, 500);
      }
    });
  }

  // ---------- INJECT KEYFRAME ANIMATIONS ----------
  var styleSheet = document.createElement('style');
  styleSheet.textContent = [
    '@keyframes jukeboxFlip {',
    '  0% { transform: scale(0.9) rotateX(30deg); }',
    '  50% { transform: scale(1.1) rotateX(-5deg); }',
    '  100% { transform: scale(1) rotateX(0); }',
    '}',
    '@keyframes coinDrop {',
    '  0% { transform: scale(1); }',
    '  25% { transform: scale(0.9) translateY(3px); }',
    '  50% { transform: scale(1.15) translateY(-4px); }',
    '  75% { transform: scale(0.98); }',
    '  100% { transform: scale(1); }',
    '}'
  ].join('\n');
  document.head.appendChild(styleSheet);

  // ---------- INIT ----------
  handleHash();

})();
