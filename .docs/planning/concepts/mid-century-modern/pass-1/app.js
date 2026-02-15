/* =========================================
   IdeaFlow — Mid-Century Modern Workspace
   Application Logic (Pass 1)
   Navigation, hash routing, view transitions
   ========================================= */

(function () {
  'use strict';

  // ---- DOM References ----
  const navButtons = document.querySelectorAll('.shelf-item[data-view]');
  const views = document.querySelectorAll('.view[data-page]');
  const settingsTabs = document.querySelectorAll('.settings-tab[data-settings-tab]');
  const settingsPanels = document.querySelectorAll('.settings-panel[data-settings-panel]');

  // ---- State ----
  let currentView = 'dashboard';

  // ---- View Switching ----
  function switchView(viewName) {
    if (!viewName) return;

    // Find the target view element
    const targetView = document.querySelector(`.view[data-page="${viewName}"]`);
    if (!targetView) return;

    currentView = viewName;

    // Update navigation active state
    navButtons.forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });

    // Hide all views, then show the target
    views.forEach(function (view) {
      if (view === targetView) {
        view.classList.add('active');
        // Trigger the entrance animation on next frame
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            view.classList.add('visible');
          });
        });
      } else {
        view.classList.remove('visible');
        view.classList.remove('active');
      }
    });

    // Update hash without triggering hashchange recursion
    if (window.location.hash !== '#' + viewName) {
      history.replaceState(null, '', '#' + viewName);
    }

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---- Navigation Click Handlers ----
  navButtons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var viewName = btn.getAttribute('data-view');
      switchView(viewName);
    });
  });

  // ---- Hash Routing ----
  function handleHash() {
    var hash = window.location.hash.replace('#', '');
    if (hash && document.querySelector(`.view[data-page="${hash}"]`)) {
      switchView(hash);
    } else {
      switchView('dashboard');
    }
  }

  window.addEventListener('hashchange', handleHash);

  // ---- Settings Tab Switching ----
  settingsTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var tabName = tab.getAttribute('data-settings-tab');

      settingsTabs.forEach(function (t) {
        t.classList.toggle('active', t === tab);
      });

      settingsPanels.forEach(function (panel) {
        panel.classList.toggle('active', panel.getAttribute('data-settings-panel') === tabName);
      });
    });
  });

  // ---- Directory Tree Toggle (for directory-tree view) ----
  document.querySelectorAll('.dir-row.folder').forEach(function (row) {
    row.addEventListener('click', function () {
      var chevron = row.querySelector('.dir-chevron');
      if (!chevron) return;

      var isExpanded = row.classList.contains('expanded');
      row.classList.toggle('expanded');

      // Toggle chevron direction
      chevron.innerHTML = isExpanded ? '&#9656;' : '&#9662;';

      // Show/hide child rows
      var depth = parseInt(row.getAttribute('data-depth') || '0', 10);
      var sibling = row.nextElementSibling;

      while (sibling) {
        var sibDepth = parseInt(sibling.getAttribute('data-depth') || '0', 10);
        if (sibDepth <= depth) break;

        if (isExpanded) {
          sibling.style.display = 'none';
        } else {
          // Only show direct children; deeper ones stay hidden unless their parent is expanded
          if (sibDepth === depth + 1) {
            sibling.style.display = '';
          }
        }
        sibling = sibling.nextElementSibling;
      }
    });
  });

  // ---- File Tree Toggle (for project-workspace view) ----
  document.querySelectorAll('.tree-folder > .tree-toggle').forEach(function (toggle) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var folder = toggle.closest('.tree-folder');
      var children = folder.querySelector('.tree-children');

      if (folder.classList.contains('open')) {
        folder.classList.remove('open');
        toggle.innerHTML = '&#9656;';
        if (children) children.style.display = 'none';
      } else {
        folder.classList.add('open');
        toggle.innerHTML = '&#9662;';
        if (children) children.style.display = '';
      }
    });
  });

  // ---- File Selection Highlight ----
  document.querySelectorAll('.tree-file').forEach(function (file) {
    file.addEventListener('click', function () {
      document.querySelectorAll('.tree-file').forEach(function (f) {
        f.classList.remove('selected');
      });
      file.classList.add('selected');
    });
  });

  // ---- Directory Row Selection ----
  document.querySelectorAll('.dir-row.file').forEach(function (row) {
    row.addEventListener('click', function () {
      document.querySelectorAll('.dir-row').forEach(function (r) {
        r.classList.remove('selected');
      });
      row.classList.add('selected');
    });
  });

  // ---- Initialize ----
  handleHash();

  // Ensure the initial view is visible on load
  var initialView = document.querySelector('.view.active');
  if (initialView) {
    requestAnimationFrame(function () {
      initialView.classList.add('visible');
    });
  }

})();
