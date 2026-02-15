/* ============================================= */
/* BRUTALIST IDEA MANAGEMENT - APP LOGIC          */
/* Pass 1 | concrete-slab-monolith                 */
/* ============================================= */

(function () {
  'use strict';

  // --- DOM references ---
  var navButtons = document.querySelectorAll('[data-view]');
  var views = document.querySelectorAll('[data-page]');
  var settingsTabs = document.querySelectorAll('[data-settings-tab]');
  var settingsPanels = document.querySelectorAll('[data-settings-panel]');

  // =============================================
  // NAVIGATION: view switching
  // =============================================
  function showView(viewName) {
    // Hide all views immediately (harsh cut, no animation)
    for (var i = 0; i < views.length; i++) {
      views[i].style.display = 'none';
    }
    // Show target view
    var target = document.querySelector('[data-page="' + viewName + '"]');
    if (target) {
      target.style.display = 'block';
    }
    // Update active nav button
    for (var j = 0; j < navButtons.length; j++) {
      navButtons[j].classList.remove('active');
      if (navButtons[j].getAttribute('data-view') === viewName) {
        navButtons[j].classList.add('active');
      }
    }
    // Update URL hash
    window.location.hash = viewName;
    // Scroll content area to top
    var contentArea = document.getElementById('contentArea');
    if (contentArea) {
      contentArea.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }

  // Attach click listeners to nav buttons
  for (var i = 0; i < navButtons.length; i++) {
    navButtons[i].addEventListener('click', function () {
      showView(this.getAttribute('data-view'));
    });
  }

  // =============================================
  // HASH-BASED URL TRACKING
  // =============================================
  function handleHash() {
    var hash = window.location.hash.replace('#', '');
    if (hash) {
      // Validate the hash corresponds to a real view
      var valid = document.querySelector('[data-page="' + hash + '"]');
      if (valid) {
        showView(hash);
        return;
      }
    }
    // Default to dashboard
    showView('dashboard');
  }

  window.addEventListener('hashchange', handleHash);
  // Initialize on load
  handleHash();

  // =============================================
  // SETTINGS: tab switching
  // =============================================
  function showSettingsTab(tabName) {
    for (var i = 0; i < settingsPanels.length; i++) {
      settingsPanels[i].style.display = 'none';
    }
    var target = document.querySelector('[data-settings-panel="' + tabName + '"]');
    if (target) {
      target.style.display = 'block';
    }
    for (var j = 0; j < settingsTabs.length; j++) {
      settingsTabs[j].classList.remove('active');
      if (settingsTabs[j].getAttribute('data-settings-tab') === tabName) {
        settingsTabs[j].classList.add('active');
      }
    }
  }

  for (var k = 0; k < settingsTabs.length; k++) {
    settingsTabs[k].addEventListener('click', function () {
      showSettingsTab(this.getAttribute('data-settings-tab'));
    });
  }

  // =============================================
  // DIRECTORY TREE: folder toggle
  // =============================================
  var dirToggles = document.querySelectorAll('.dir-toggle');
  for (var d = 0; d < dirToggles.length; d++) {
    dirToggles[d].addEventListener('click', function (e) {
      e.stopPropagation();
      var folderItem = this.closest('.dir-folder');
      if (!folderItem) return;
      var children = folderItem.querySelector('.dir-children');
      if (!children) return;

      if (folderItem.classList.contains('open')) {
        folderItem.classList.remove('open');
        children.style.display = 'none';
        this.innerHTML = '[+]';
      } else {
        folderItem.classList.add('open');
        children.style.display = '';
        this.innerHTML = '[&minus;]';
      }
    });
  }

  // =============================================
  // WHITEBOARD: zoom controls
  // =============================================
  var zoomLevel = 100;
  var zoomDisplay = document.getElementById('zoomLevel');
  var zoomInBtn = document.getElementById('zoomIn');
  var zoomOutBtn = document.getElementById('zoomOut');
  var canvas = document.getElementById('whiteboardCanvas');

  function updateZoom() {
    if (zoomDisplay) zoomDisplay.textContent = zoomLevel + '%';
    if (canvas) canvas.style.transform = 'scale(' + (zoomLevel / 100) + ')';
    if (canvas) canvas.style.transformOrigin = 'top left';
  }

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', function () {
      if (zoomLevel < 200) {
        zoomLevel += 10;
        updateZoom();
      }
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', function () {
      if (zoomLevel > 50) {
        zoomLevel -= 10;
        updateZoom();
      }
    });
  }

  // =============================================
  // TOOLBAR BUTTONS: filter state toggling
  // =============================================
  var toolbarGroups = document.querySelectorAll('.toolbar-controls');
  for (var t = 0; t < toolbarGroups.length; t++) {
    var buttons = toolbarGroups[t].querySelectorAll('.tool-btn');
    for (var b = 0; b < buttons.length; b++) {
      buttons[b].addEventListener('click', function () {
        var siblings = this.parentElement.querySelectorAll('.tool-btn');
        for (var s = 0; s < siblings.length; s++) {
          siblings[s].classList.remove('active');
        }
        this.classList.add('active');
      });
    }
  }

  // =============================================
  // WHITEBOARD TOOLBAR: tool selection
  // =============================================
  var wbTools = document.querySelectorAll('.wb-tool:not(#zoomIn):not(#zoomOut)');
  for (var w = 0; w < wbTools.length; w++) {
    wbTools[w].addEventListener('click', function () {
      for (var x = 0; x < wbTools.length; x++) {
        wbTools[x].classList.remove('active');
      }
      this.classList.add('active');
    });
  }

})();
