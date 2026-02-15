/* ============================================================
   STRATA CONSOLE — Navigation & Interaction Controller
   CSS transitions only (300-400ms ease-out). No libraries.
   ============================================================ */

(function () {
  'use strict';

  var tabletTabs = document.querySelectorAll('.tablet-tab[data-view]');
  var strata = document.querySelectorAll('.stratum[data-page]');

  /**
   * Switch the visible stratum (page view).
   * Hides current, shows target with strata-reveal animation via CSS class.
   */
  function activateStratum(viewName) {
    // Update tablet tab active state
    tabletTabs.forEach(function (tab) {
      if (tab.getAttribute('data-view') === viewName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Switch visible stratum with emerge transition
    strata.forEach(function (section) {
      if (section.getAttribute('data-page') === viewName) {
        section.classList.remove('hidden');
        // Force reflow to restart CSS transition
        void section.offsetWidth;
        section.classList.add('visible');
      } else {
        section.classList.remove('visible');
        section.classList.add('hidden');
      }
    });

    // Scroll viewport to top
    var viewport = document.querySelector('.strata-viewport');
    if (viewport) {
      viewport.scrollTop = 0;
    }
  }

  // Handle tablet tab clicks
  tabletTabs.forEach(function (tab) {
    tab.addEventListener('click', function (e) {
      e.preventDefault();
      var view = tab.getAttribute('data-view');
      window.location.hash = view;
      activateStratum(view);
    });
  });

  // Handle browser back/forward via hash changes
  window.addEventListener('hashchange', function () {
    var hash = window.location.hash.replace('#', '');
    if (hash && document.querySelector('[data-page="' + hash + '"]')) {
      activateStratum(hash);
    }
  });

  // Initialize on page load
  function init() {
    var hash = window.location.hash.replace('#', '');
    if (hash && document.querySelector('[data-page="' + hash + '"]')) {
      activateStratum(hash);
    } else {
      activateStratum('dashboard');
    }
  }

  // Toggle switch interactions
  document.querySelectorAll('.set-switch').forEach(function (sw) {
    sw.addEventListener('click', function () {
      sw.classList.toggle('set-on');
      var row = sw.closest('.set-toggle-row');
      if (row) {
        var label = row.querySelector('.set-toggle-label');
        if (label) {
          label.textContent = sw.classList.contains('set-on') ? 'Enabled' : 'Disabled';
        }
      }
    });
  });

  // Settings tab switching
  var settingsTabs = document.querySelectorAll('.settings-tab[data-settab]');
  var settingsPanels = document.querySelectorAll('.settings-panel[data-setpanel]');

  settingsTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.getAttribute('data-settab');

      settingsTabs.forEach(function (t) {
        t.classList.toggle('settings-tab-active', t.getAttribute('data-settab') === target);
      });

      settingsPanels.forEach(function (panel) {
        panel.classList.toggle('settings-panel-active', panel.getAttribute('data-setpanel') === target);
      });
    });
  });

  init();
})();
