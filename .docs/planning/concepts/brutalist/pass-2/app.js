/* ============================================= */
/* BRUTALIST IDEA MANAGEMENT - MANIFESTO LOGIC   */
/* Pass 2 | stamp-grid-manifesto                  */
/* ============================================= */

(function () {
  'use strict';

  // --- DOM references ---
  var stampBadges = document.querySelectorAll('.stamp-badge[data-view]');
  var broadsheetPages = document.querySelectorAll('.broadsheet-page[data-page]');
  var chatInput = document.getElementById('chatInput');
  var chatSend = document.getElementById('chatSend');
  var correspondenceThread = document.getElementById('correspondenceThread');
  var settSave = document.getElementById('settSave');

  // =============================================
  // NAVIGATION: stamp-badge view switching
  // =============================================
  function switchPage(pageName) {
    // Hide all pages immediately (no animation — harsh instant cut)
    for (var i = 0; i < broadsheetPages.length; i++) {
      broadsheetPages[i].style.display = 'none';
    }

    // Show target page
    var target = document.querySelector('.broadsheet-page[data-page="' + pageName + '"]');
    if (target) {
      target.style.display = 'block';
    }

    // Update active stamp badge
    for (var j = 0; j < stampBadges.length; j++) {
      stampBadges[j].classList.remove('active');
      if (stampBadges[j].getAttribute('data-view') === pageName) {
        stampBadges[j].classList.add('active');
      }
    }

    // Update URL hash
    window.location.hash = pageName;

    // Scroll to top instantly
    window.scrollTo(0, 0);
  }

  // Attach click listeners to stamp badges
  for (var i = 0; i < stampBadges.length; i++) {
    stampBadges[i].addEventListener('click', function () {
      switchPage(this.getAttribute('data-view'));
    });
  }

  // =============================================
  // HASH ROUTING: restore view from URL hash
  // =============================================
  function restoreFromHash() {
    var hash = window.location.hash.replace('#', '');
    if (hash) {
      // Check if the hash matches a valid page
      var validPage = document.querySelector('.broadsheet-page[data-page="' + hash + '"]');
      if (validPage) {
        switchPage(hash);
        return;
      }
    }
    // Default to dashboard
    switchPage('dashboard');
  }

  // Listen for hash changes (browser back/forward)
  window.addEventListener('hashchange', restoreFromHash);

  // Initial load
  restoreFromHash();

  // =============================================
  // AI CHAT: typewriter correspondence
  // =============================================
  var chatResponses = [
    'I have reviewed the current sprint data. There are 3 tasks at risk of missing their deadlines. Shall I draft a mitigation plan?',
    'The schema planner shows 6 entities with 7 relationships. The normalized structure looks solid. No circular dependencies detected.',
    'Based on the manifesto wall, the highest-priority unaddressed idea is "Real-time Collaboration." It has been in URGENT status for 5 days.',
    'I can generate a weekly digest report for your team. It would cover: completed tasks, new ideas submitted, and velocity trends. Shall I proceed?',
    'The directory tree shows 14 source files across 4 directories. Test coverage is at 72% based on the last CI run. I recommend adding tests for the cache module.',
    'Understood. I have noted your feedback. The settings have been updated according to your preferences.',
    'The Platform Core project is on track for Sprint 3 completion. Two blockers remain: the rate limiter WebSocket conflict and the Redis cache timeout configuration.'
  ];

  var chatResponseIndex = 0;

  function getCurrentTimestamp() {
    var now = new Date();
    var hours = String(now.getHours()).padStart(2, '0');
    var minutes = String(now.getMinutes()).padStart(2, '0');
    return hours + ':' + minutes;
  }

  function appendMessage(text, sender) {
    var msgDiv = document.createElement('div');
    msgDiv.className = 'correspondence-msg correspondence-msg--' + sender;

    var senderLabel = sender === 'user' ? 'J. DOE' : 'AI ASSISTANT';
    var stampClass = sender === 'user' ? 'msg-stamp--user' : 'msg-stamp--ai';

    msgDiv.innerHTML =
      '<div class="msg-header">' +
        '<span class="msg-stamp ' + stampClass + '">' + senderLabel + '</span>' +
        '<span class="msg-time">' + getCurrentTimestamp() + '</span>' +
      '</div>' +
      '<div class="msg-rule"></div>' +
      '<p class="msg-body">' + escapeHtml(text) + '</p>';

    correspondenceThread.appendChild(msgDiv);
    msgDiv.scrollIntoView({ block: 'end' });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function handleChatSend() {
    if (!chatInput) return;
    var message = chatInput.value.trim();
    if (!message) return;

    // Append user message
    appendMessage(message, 'user');
    chatInput.value = '';

    // Append AI response (instant — no delay, no animation)
    var response = chatResponses[chatResponseIndex % chatResponses.length];
    chatResponseIndex++;
    appendMessage(response, 'ai');
  }

  if (chatSend) {
    chatSend.addEventListener('click', handleChatSend);
  }

  if (chatInput) {
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleChatSend();
      }
    });
  }

  // =============================================
  // SETTINGS: save confirmation
  // =============================================
  if (settSave) {
    settSave.addEventListener('click', function () {
      var originalText = settSave.textContent;
      settSave.textContent = 'CHANGES RECORDED';
      settSave.style.background = '#2d6a2e';
      settSave.style.borderColor = '#2d6a2e';

      setTimeout(function () {
        settSave.textContent = originalText;
        settSave.style.background = '';
        settSave.style.borderColor = '';
      }, 2000);
    });
  }

  // =============================================
  // WHITEBOARD: tool selection
  // =============================================
  var toolStamps = document.querySelectorAll('.tool-stamp[data-tool]');
  var activeToolStamp = null;

  for (var t = 0; t < toolStamps.length; t++) {
    toolStamps[t].addEventListener('click', function () {
      // Remove active from all tools
      for (var k = 0; k < toolStamps.length; k++) {
        toolStamps[k].style.borderColor = '';
        toolStamps[k].style.background = '';
      }
      // Set active
      this.style.borderColor = 'var(--accent)';
      this.style.background = 'rgba(255, 59, 0, 0.2)';
      activeToolStamp = this.getAttribute('data-tool');
    });
  }

  // =============================================
  // KEYBOARD NAVIGATION: number keys for stamps
  // =============================================
  var viewOrder = [
    'dashboard', 'projects', 'project-workspace', 'kanban', 'whiteboard',
    'schema-planner', 'directory-tree', 'ideas', 'ai-chat', 'settings'
  ];

  document.addEventListener('keydown', function (e) {
    // Ignore if user is typing in an input/textarea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      return;
    }

    // Number keys 1-9 and 0 for views
    var keyNum = parseInt(e.key, 10);
    if (!isNaN(keyNum)) {
      var viewIndex = keyNum === 0 ? 9 : keyNum - 1;
      if (viewIndex >= 0 && viewIndex < viewOrder.length) {
        e.preventDefault();
        switchPage(viewOrder[viewIndex]);
      }
    }
  });

  // =============================================
  // TOC ITEM INTERACTION (project workspace)
  // =============================================
  var tocItems = document.querySelectorAll('.toc-item');
  for (var ti = 0; ti < tocItems.length; ti++) {
    tocItems[ti].addEventListener('click', function () {
      // Toggle selected state
      for (var tk = 0; tk < tocItems.length; tk++) {
        tocItems[tk].style.background = '';
      }
      this.style.background = 'rgba(255, 59, 0, 0.08)';
    });
  }

})();
