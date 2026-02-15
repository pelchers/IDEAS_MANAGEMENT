/* ============================================================
   SLATE CONSOLE — Navigation Controller
   Minimal JS. CSS transitions only. No libraries.
   ============================================================ */

(function () {
  'use strict';

  var navItems = document.querySelectorAll('.nav-item[data-view]');
  var pages = document.querySelectorAll('.page[data-page]');

  function switchView(viewName) {
    // Update nav active state
    navItems.forEach(function (item) {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Switch page with opacity transition
    pages.forEach(function (page) {
      if (page.getAttribute('data-page') === viewName) {
        page.classList.add('active');
      } else {
        page.classList.remove('active');
      }
    });

    // Scroll content to top
    var content = document.querySelector('.content');
    if (content) {
      content.scrollTop = 0;
    }
  }

  // Handle nav clicks
  navItems.forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      var view = item.getAttribute('data-view');
      window.location.hash = view;
      switchView(view);
    });
  });

  // Handle hash changes (back/forward navigation)
  window.addEventListener('hashchange', function () {
    var hash = window.location.hash.replace('#', '');
    if (hash && document.querySelector('[data-page="' + hash + '"]')) {
      switchView(hash);
    }
  });

  // Handle initial hash on page load
  function init() {
    var hash = window.location.hash.replace('#', '');
    if (hash && document.querySelector('[data-page="' + hash + '"]')) {
      switchView(hash);
    } else {
      switchView('dashboard');
    }
  }

  // Toggle switches interaction
  document.querySelectorAll('.toggle-switch').forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      toggle.classList.toggle('active-toggle');
      var knob = toggle.querySelector('.toggle-knob');
      var label = toggle.closest('.toggle-row');
      if (label) {
        var labelText = label.querySelector('.toggle-label');
        if (labelText) {
          labelText.textContent = toggle.classList.contains('active-toggle') ? 'Enabled' : 'Disabled';
        }
      }
    });
  });

  // Tree folder toggle
  document.querySelectorAll('.tree-folder > .tree-toggle').forEach(function (toggle) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var folder = toggle.parentElement;
      folder.classList.toggle('open');
      toggle.textContent = folder.classList.contains('open') ? '\u25BE' : '\u25B6';
    });
  });

  init();
})();
