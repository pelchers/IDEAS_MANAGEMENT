/* ============================================================
   MERIDIAN CIVIL — app.js
   Construction-Zone Blueprint | Pass 4 | Brutalist
   ============================================================ */

(function () {
  'use strict';

  // --- DOM REFS ---
  const navBtns = document.querySelectorAll('.nav-btn');
  const mobileNavBtns = document.querySelectorAll('.mobile-nav-btn');
  const pages = document.querySelectorAll('.page');
  const hamburger = document.getElementById('hamburger-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const tooltip = document.getElementById('tooltip');
  const tooltipText = tooltip.querySelector('.tooltip-text');
  const loadingOverlay = document.getElementById('loading-overlay');
  const microFeedback = document.getElementById('micro-feedback');
  const dispatchInput = document.getElementById('dispatch-input');
  const dispatchSend = document.getElementById('dispatch-send');
  const dispatchLog = document.getElementById('dispatch-log');
  const deployBtn = document.getElementById('deploy-btn');

  // --- LOADING: construction-barrier-pulse → dismiss ---
  window.addEventListener('load', function () {
    setTimeout(function () {
      loadingOverlay.classList.add('hidden');
      setTimeout(function () { loadingOverlay.style.display = 'none'; }, 600);
      initSplitting();
      triggerScrollReveals();
    }, 1200);
  });

  // --- SPLITTING.JS: character-level animation on page titles ---
  function initSplitting() {
    if (typeof Splitting === 'function') {
      Splitting({ target: '[data-splitting]', by: 'chars' });
    }
  }

  // --- HASH-BASED NAVIGATION ---
  function navigateTo(viewId) {
    // deactivate all
    pages.forEach(function (p) { p.classList.remove('active'); });
    navBtns.forEach(function (b) { b.classList.remove('active'); });
    mobileNavBtns.forEach(function (b) { b.classList.remove('active'); });

    // activate target
    var target = document.querySelector('[data-page="' + viewId + '"]');
    if (target) {
      target.classList.add('active');
      // re-trigger unfold animation
      target.style.animation = 'none';
      target.offsetHeight; // force reflow
      target.style.animation = '';
    }

    // activate nav buttons
    navBtns.forEach(function (b) {
      if (b.getAttribute('data-view') === viewId) b.classList.add('active');
    });
    mobileNavBtns.forEach(function (b) {
      if (b.getAttribute('data-view') === viewId) b.classList.add('active');
    });

    // close mobile drawer
    mobileDrawer.classList.remove('open');
    hamburger.classList.remove('open');

    // re-init splitting for newly visible title
    setTimeout(function () {
      var titleEl = target ? target.querySelector('[data-splitting]') : null;
      if (titleEl && typeof Splitting === 'function') {
        Splitting({ target: titleEl, by: 'chars' });
      }
      triggerScrollReveals();
      // Draw rough.js connections for whiteboard / schema when those views load
      if (viewId === 'whiteboard') drawWhiteboardConnections();
      if (viewId === 'schema-planner') drawSchemaWires();
    }, 100);

    // update hash
    window.location.hash = viewId;
  }

  // bind nav buttons
  navBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      navigateTo(this.getAttribute('data-view'));
    });
  });
  mobileNavBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      navigateTo(this.getAttribute('data-view'));
    });
  });

  // handle hash on load
  function onHashChange() {
    var hash = window.location.hash.replace('#', '');
    if (hash && document.querySelector('[data-page="' + hash + '"]')) {
      navigateTo(hash);
    }
  }
  window.addEventListener('hashchange', onHashChange);
  if (window.location.hash) {
    onHashChange();
  }

  // --- HAMBURGER ---
  hamburger.addEventListener('click', function () {
    this.classList.toggle('open');
    mobileDrawer.classList.toggle('open');
  });

  // --- TOOLTIPS: callout-annotation-line ---
  navBtns.forEach(function (btn) {
    btn.addEventListener('mouseenter', function (e) {
      var tip = this.getAttribute('data-tooltip');
      if (!tip) return;
      tooltipText.textContent = tip;
      tooltip.classList.remove('hidden');
      var rect = this.getBoundingClientRect();
      tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
      tooltip.style.top = (rect.bottom + 4) + 'px';
    });
    btn.addEventListener('mouseleave', function () {
      tooltip.classList.add('hidden');
    });
  });

  // --- IDEA BUBBLE TOOLTIPS ---
  document.querySelectorAll('.idea-bubble').forEach(function (bubble) {
    bubble.addEventListener('mouseenter', function (e) {
      var idea = this.getAttribute('data-idea');
      if (!idea) return;
      tooltipText.textContent = idea;
      tooltip.classList.remove('hidden');
      var rect = this.getBoundingClientRect();
      tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
      tooltip.style.top = (rect.bottom + 6) + 'px';
    });
    bubble.addEventListener('mouseleave', function () {
      tooltip.classList.add('hidden');
    });
  });

  // --- SCROLL REVEAL: fade-in-with-grid-snap ---
  function triggerScrollReveals() {
    var els = document.querySelectorAll('.page.active .scroll-reveal');
    if (typeof anime === 'function') {
      // use anime.js staggered reveal
      els.forEach(function (el) {
        el.classList.remove('revealed');
      });
      anime({
        targets: Array.from(els),
        opacity: [0, 1],
        translateY: [12, 0],
        easing: 'easeOutCubic',
        duration: 500,
        delay: anime.stagger(80, { start: 100 }),
        begin: function () {
          els.forEach(function (el) { el.style.opacity = '0'; });
        },
        complete: function () {
          els.forEach(function (el) { el.classList.add('revealed'); });
        }
      });
    } else {
      // fallback: CSS-only
      var delay = 0;
      els.forEach(function (el) {
        setTimeout(function () { el.classList.add('revealed'); }, delay);
        delay += 80;
      });
    }
  }

  // Also reveal on scroll for pages with long content
  var scrollObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.scroll-reveal').forEach(function (el) {
    scrollObserver.observe(el);
  });

  // --- TOGGLE SWITCHES: lever-pull-horizontal ---
  document.querySelectorAll('.toggle-switch').forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      this.classList.toggle('active');
      showMicroFeedback();
    });
  });

  // --- MICRO-FEEDBACK: checkmark-stamp-orange ---
  function showMicroFeedback() {
    microFeedback.classList.remove('hidden', 'show');
    microFeedback.offsetHeight; // force reflow
    microFeedback.classList.add('show');
    setTimeout(function () {
      microFeedback.classList.add('hidden');
      microFeedback.classList.remove('show');
    }, 700);
  }

  // --- DISPATCH (AI CHAT) ---
  function sendDispatch() {
    var msg = dispatchInput.value.trim();
    if (!msg) return;

    var time = new Date();
    var ts = ('0' + time.getHours()).slice(-2) + ':' +
             ('0' + time.getMinutes()).slice(-2) + ':' +
             ('0' + time.getSeconds()).slice(-2);

    var msgEl = document.createElement('div');
    msgEl.className = 'dispatch-msg outgoing';
    msgEl.innerHTML =
      '<div class="msg-header">' +
        '<span class="callsign">OPERATOR</span>' +
        '<span class="msg-time">' + ts + '</span>' +
        '<span class="msg-freq">CH-ALPHA</span>' +
      '</div>' +
      '<div class="msg-body">' + escapeHtml(msg) + '</div>';
    dispatchLog.appendChild(msgEl);
    dispatchInput.value = '';
    dispatchLog.scrollTop = dispatchLog.scrollHeight;

    showMicroFeedback();

    // AI auto-response after delay
    setTimeout(function () {
      var aiTime = new Date();
      var aiTs = ('0' + aiTime.getHours()).slice(-2) + ':' +
                 ('0' + aiTime.getMinutes()).slice(-2) + ':' +
                 ('0' + aiTime.getSeconds()).slice(-2);
      var responses = [
        'Acknowledged. Updating site log with your report. All zone supervisors notified.',
        'Copy that. Dispatching crew to your specified coordinates. ETA 8 minutes.',
        'Roger. Forwarding to engineering review queue. Priority level assigned based on zone classification.',
        'Understood. Safety protocol updated. Daily briefing will include this item at next shift change.',
        'Confirmed. Material order queued for procurement. Estimated delivery window: 48 hours.'
      ];
      var resp = responses[Math.floor(Math.random() * responses.length)];

      var respEl = document.createElement('div');
      respEl.className = 'dispatch-msg system';
      respEl.innerHTML =
        '<div class="msg-header">' +
          '<span class="callsign">AI-ASSIST</span>' +
          '<span class="msg-time">' + aiTs + '</span>' +
          '<span class="msg-freq">AUTO</span>' +
        '</div>' +
        '<div class="msg-body">' + resp + '</div>';
      dispatchLog.appendChild(respEl);
      dispatchLog.scrollTop = dispatchLog.scrollHeight;
    }, 1500);
  }

  if (dispatchSend) {
    dispatchSend.addEventListener('click', sendDispatch);
  }
  if (dispatchInput) {
    dispatchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') sendDispatch();
    });
  }

  // --- DEPLOY BUTTON ---
  if (deployBtn) {
    deployBtn.addEventListener('click', function () {
      showMicroFeedback();
      this.textContent = 'DEPLOYED';
      this.disabled = true;
      this.style.opacity = '0.6';
    });
  }

  // --- SORTABLE.JS: kanban drag ---
  var kanbanCols = ['kanban-queued', 'kanban-progress', 'kanban-review', 'kanban-complete'];
  kanbanCols.forEach(function (colId) {
    var el = document.getElementById(colId);
    if (el && typeof Sortable !== 'undefined') {
      Sortable.create(el, {
        group: 'kanban',
        animation: 200,
        ghostClass: 'sortable-ghost',
        onEnd: function () {
          // update zone counts
          kanbanCols.forEach(function (cid) {
            var col = document.getElementById(cid);
            if (col) {
              var count = col.querySelectorAll('.kanban-card').length;
              var header = col.closest('.kanban-zone');
              if (header) {
                var countEl = header.querySelector('.zone-count');
                if (countEl) countEl.textContent = count;
              }
            }
          });
          showMicroFeedback();
        }
      });
    }
  });

  // --- ROUGH.JS: Whiteboard connections ---
  function drawWhiteboardConnections() {
    var canvas = document.getElementById('rough-canvas');
    if (!canvas || typeof rough === 'undefined') return;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var rc = rough.canvas(canvas);

    // resize canvas to container
    var container = canvas.parentElement;
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    var nodes = container.querySelectorAll('.wb-node');
    var positions = [];
    nodes.forEach(function (n) {
      var x = n.offsetLeft + n.offsetWidth / 2;
      var y = n.offsetTop + n.offsetHeight / 2;
      positions.push({ x: x, y: y, w: n.offsetWidth, h: n.offsetHeight });
    });

    // draw connections: 0->1, 1->2, 0->3, 1->3, 2->4, 1->4, 3->5, 4->5
    var connections = [
      [0, 1], [1, 2], [0, 3], [1, 3], [2, 4], [1, 4], [3, 5], [4, 5]
    ];
    connections.forEach(function (c) {
      if (positions[c[0]] && positions[c[1]]) {
        rc.line(
          positions[c[0]].x, positions[c[0]].y,
          positions[c[1]].x, positions[c[1]].y,
          { stroke: '#ff6600', strokeWidth: 1.5, roughness: 1.2 }
        );
      }
    });
  }

  // --- ROUGH.JS: Schema wires ---
  function drawSchemaWires() {
    var canvas = document.getElementById('schema-canvas');
    if (!canvas || typeof rough === 'undefined') return;
    var ctx = canvas.getContext('2d');
    var container = canvas.parentElement;
    canvas.width = container.scrollWidth;
    canvas.height = container.scrollHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var rc = rough.canvas(canvas);

    var blocks = container.querySelectorAll('.terminal-block');
    var pos = [];
    blocks.forEach(function (b) {
      pos.push({
        x: b.offsetLeft,
        y: b.offsetTop,
        w: b.offsetWidth,
        h: b.offsetHeight,
        cx: b.offsetLeft + b.offsetWidth / 2,
        cy: b.offsetTop + b.offsetHeight / 2,
        r: b.offsetLeft + b.offsetWidth,
        b: b.offsetTop + b.offsetHeight
      });
    });

    // Wire connections: PROJECT->TASK, TASK->CREW, TASK->INSPECTION, INSPECTION->CREW, PROJECT->MATERIAL, INSPECTION->EQUIPMENT
    var wires = [
      [0, 1], // PROJECT -> TASK
      [1, 2], // TASK -> CREW
      [1, 4], // TASK -> INSPECTION
      [4, 2], // INSPECTION -> CREW
      [0, 3], // PROJECT -> MATERIAL
      [4, 5], // INSPECTION -> EQUIPMENT
    ];

    wires.forEach(function (w) {
      var a = pos[w[0]];
      var b = pos[w[1]];
      if (a && b) {
        var startX = a.r;
        var startY = a.cy;
        var endX = b.x;
        var endY = b.cy;

        // if blocks are vertically separated, adjust
        if (Math.abs(a.cy - b.cy) > 100) {
          startX = a.cx;
          startY = a.b;
          endX = b.cx;
          endY = b.y;
        }

        rc.line(startX, startY, endX, endY, {
          stroke: '#ff6600',
          strokeWidth: 1.5,
          roughness: 0.8
        });

        // small circle at endpoints (terminal connectors)
        rc.circle(startX, startY, 8, { fill: '#ff6600', fillStyle: 'solid', stroke: 'none' });
        rc.circle(endX, endY, 8, { fill: '#ff6600', fillStyle: 'solid', stroke: 'none' });
      }
    });
  }

  // --- HELPER ---
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --- INITIAL SETUP ---
  // Trigger reveals for the initial page
  setTimeout(triggerScrollReveals, 200);

  // Draw canvases once visible
  setTimeout(function () {
    var hash = window.location.hash.replace('#', '');
    if (hash === 'whiteboard') drawWhiteboardConnections();
    if (hash === 'schema-planner') drawSchemaWires();
  }, 500);

  // Redraw rough.js canvases on window resize
  window.addEventListener('resize', function () {
    var hash = window.location.hash.replace('#', '');
    if (hash === 'whiteboard') drawWhiteboardConnections();
    if (hash === 'schema-planner') drawSchemaWires();
  });

})();
