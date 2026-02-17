/* =============================================
   HYGGE STUDIO — Pass 5: Danish Hygge Warmth
   App JavaScript — Navigation, Interactions, Libraries
   ============================================= */

(function () {
  'use strict';

  /* ---------- DOM References ---------- */
  const loadingScreen = document.getElementById('loading-screen');
  const appShell = document.getElementById('app');
  const dockNav = document.getElementById('dock-nav');
  const dockItems = document.querySelectorAll('.dock-item');
  const views = document.querySelectorAll('.view');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const toastContainer = document.getElementById('toast-container');

  /* ---------- Loading Screen ---------- */
  function hideLoading() {
    loadingScreen.classList.add('hidden');
    appShell.style.display = '';
    // Trigger entrance animation for first view
    setTimeout(initScrollReveal, 100);
    setTimeout(initAmbientCandle, 200);
  }

  // Simulate brief loading
  setTimeout(hideLoading, 1200);

  /* ---------- Navigation (Hash Routing) ---------- */
  function navigateTo(viewId) {
    // Deactivate all
    views.forEach(function (v) {
      v.classList.remove('active');
    });
    dockItems.forEach(function (d) {
      d.classList.remove('active');
    });

    // Activate target
    var targetView = document.getElementById('view-' + viewId);
    if (targetView) {
      targetView.classList.add('active');
      // Re-trigger animation
      targetView.style.animation = 'none';
      targetView.offsetHeight; // force reflow
      targetView.style.animation = '';
    }

    // Activate dock item
    var targetDock = document.querySelector('.dock-item[data-target="' + viewId + '"]');
    if (targetDock) {
      targetDock.classList.add('active');
    }

    // Close mobile menu
    dockNav.classList.remove('mobile-open');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Re-init scroll reveals for new view
    setTimeout(initScrollReveal, 150);

    // Update hash
    window.location.hash = viewId;

    // Re-draw yarn lines if whiteboard
    if (viewId === 'whiteboard') {
      setTimeout(drawYarnLines, 300);
    }
  }

  // Dock click handlers
  dockItems.forEach(function (item) {
    item.addEventListener('click', function () {
      var target = item.getAttribute('data-target');
      navigateTo(target);
    });
  });

  // Hash routing on load
  function handleHash() {
    var hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById('view-' + hash)) {
      navigateTo(hash);
    }
  }

  window.addEventListener('hashchange', handleHash);

  // Initial hash check after loading
  setTimeout(function () {
    var hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById('view-' + hash)) {
      navigateTo(hash);
    }
  }, 1300);

  /* ---------- Mobile Menu ---------- */
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function () {
      dockNav.classList.toggle('mobile-open');
    });
  }

  // Close mobile menu on outside click
  document.addEventListener('click', function (e) {
    if (dockNav.classList.contains('mobile-open') &&
        !dockNav.contains(e.target) &&
        !mobileMenuBtn.contains(e.target)) {
      dockNav.classList.remove('mobile-open');
    }
  });

  /* ---------- Scroll Reveal (warm-fade-rise-gentle) ---------- */
  function initScrollReveal() {
    var revealElements = document.querySelectorAll('[data-scroll-reveal]:not(.revealed)');

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

      revealElements.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      // Fallback: reveal all
      revealElements.forEach(function (el) {
        el.classList.add('revealed');
      });
    }
  }

  /* ---------- Candlelight Ambient (idle animation) ---------- */
  function initAmbientCandle() {
    // The candle-ambient div already has CSS animation.
    // Also apply subtle warm glow variation to accent elements
    var glowElements = document.querySelectorAll('.candle-glow-text');
    if (glowElements.length > 0 && typeof gsap !== 'undefined') {
      gsap.to(glowElements, {
        textShadow: '0 0 30px rgba(255, 220, 180, 0.5)',
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        stagger: 0.3
      });
    }
  }

  /* ---------- Tooltips (Tippy.js — linen-card-tooltip) ---------- */
  function initTooltips() {
    if (typeof tippy !== 'undefined') {
      tippy('[data-tippy-content]', {
        animation: 'fade',
        duration: [200, 150],
        delay: [300, 0],
        placement: 'top',
        arrow: true,
        theme: 'hygge'
      });
    }
  }

  setTimeout(initTooltips, 1400);

  /* ---------- Toast / Micro-feedback (heart-warmth-pulse) ---------- */
  function showToast(message) {
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '<span class="heart-icon"><i class="ph-duotone ph-heart"></i></span>' + message;
    toastContainer.appendChild(toast);

    // Trigger show
    requestAnimationFrame(function () {
      toast.classList.add('show');
    });

    // Remove after 3s
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 400);
    }, 3000);
  }

  /* ---------- Ideas — Add Idea ---------- */
  var addIdeaBtn = document.getElementById('add-idea-btn');
  var ideaInput = document.getElementById('idea-input');

  if (addIdeaBtn && ideaInput) {
    addIdeaBtn.addEventListener('click', function () {
      var text = ideaInput.value.trim();
      if (!text) return;

      var grid = document.querySelector('.idea-cards-grid');
      var colors = ['#d4927a', '#a08060', '#8b7355', '#c4a882', '#b08878', '#9a8a70'];
      var categories = ['Furniture', 'Textiles', 'Ceramics', 'Lighting', 'Accessories'];
      var color = colors[Math.floor(Math.random() * colors.length)];
      var cat = categories[Math.floor(Math.random() * categories.length)];

      var card = document.createElement('div');
      card.className = 'idea-card';
      card.setAttribute('data-scroll-reveal', '');
      card.innerHTML =
        '<div class="idea-card-tab" style="background: ' + color + ';"></div>' +
        '<div class="idea-card-body">' +
          '<h3>' + escapeHtml(text) + '</h3>' +
          '<p>A new idea just captured from your creative stream.</p>' +
          '<div class="idea-card-footer">' +
            '<span class="idea-category">' + cat + '</span>' +
            '<span class="idea-votes"><i class="ph-duotone ph-heart"></i> 0</span>' +
            '<span class="idea-author">Astrid L.</span>' +
          '</div>' +
        '</div>';

      grid.insertBefore(card, grid.firstChild);
      ideaInput.value = '';

      // Animate entrance
      setTimeout(function () {
        card.classList.add('revealed');
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 50);

      showToast('Idea card pinned!');
    });

    ideaInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') addIdeaBtn.click();
    });
  }

  /* ---------- Chat — Send Message ---------- */
  var sendChatBtn = document.getElementById('send-chat-btn');
  var chatInput = document.getElementById('chat-input');

  if (sendChatBtn && chatInput) {
    sendChatBtn.addEventListener('click', function () {
      var text = chatInput.value.trim();
      if (!text) return;

      var chatLetters = document.querySelector('.chat-letters');
      var now = new Date();
      var timeStr = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0') +
        (now.getHours() >= 12 ? ' PM' : ' AM');

      // User letter
      var userLetter = document.createElement('div');
      userLetter.className = 'letter user-letter';
      userLetter.innerHTML =
        '<div class="letter-header">' +
          '<div class="letter-avatar user">AL</div>' +
          '<div class="letter-meta">' +
            '<strong>Astrid Lindqvist</strong>' +
            '<span class="letter-time wax-seal">' + timeStr + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="letter-body"><p>' + escapeHtml(text) + '</p></div>';

      chatLetters.appendChild(userLetter);
      chatInput.value = '';

      // Animate in
      userLetter.style.opacity = '0';
      userLetter.style.transform = 'translateY(20px)';
      requestAnimationFrame(function () {
        userLetter.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        userLetter.style.opacity = '1';
        userLetter.style.transform = 'translateY(0)';
      });

      // AI response after delay
      setTimeout(function () {
        var aiResponses = [
          'That is a lovely thought, Astrid. It speaks to the quiet intention behind every piece we create -- the belief that beautiful objects can make everyday moments feel special.',
          'I can see how that connects to our philosophy. The Danish concept of "det gode liv" -- the good life -- is really about finding joy in simple, well-made things.',
          'What a wonderful direction. Let me think about how we can translate that into our next collection. Perhaps something that bridges indoor comfort with the changing seasons.',
          'That resonates beautifully with our brand story. The warmth of handmade objects, the invitation to slow down -- these are the things that matter most.',
        ];
        var response = aiResponses[Math.floor(Math.random() * aiResponses.length)];

        var aiLetter = document.createElement('div');
        aiLetter.className = 'letter ai-letter';
        aiLetter.innerHTML =
          '<div class="letter-header">' +
            '<div class="letter-avatar ai"><i class="ph-duotone ph-sparkle"></i></div>' +
            '<div class="letter-meta">' +
              '<strong>Studio Companion</strong>' +
              '<span class="letter-time wax-seal">' + timeStr + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="letter-body"><p>' + response + '</p></div>';

        chatLetters.appendChild(aiLetter);

        aiLetter.style.opacity = '0';
        aiLetter.style.transform = 'translateY(20px)';
        requestAnimationFrame(function () {
          aiLetter.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          aiLetter.style.opacity = '1';
          aiLetter.style.transform = 'translateY(0)';
        });

        // Scroll to bottom
        aiLetter.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 1200);

      showToast('Letter sent');
    });

    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') sendChatBtn.click();
    });
  }

  /* ---------- Directory Tree Toggle ---------- */
  document.querySelectorAll('.tree-folder-header').forEach(function (header) {
    header.addEventListener('click', function () {
      var folder = header.parentElement;
      folder.classList.toggle('open');

      // Update icon
      var icon = header.querySelector('i');
      if (icon) {
        if (folder.classList.contains('open')) {
          icon.className = 'ph-duotone ph-folder-open';
        } else {
          icon.className = 'ph-duotone ph-folder';
        }
      }
    });

    // Keyboard support
    header.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        header.click();
      }
    });
  });

  /* ---------- Whiteboard — Yarn Lines (SVG) ---------- */
  function drawYarnLines() {
    var svg = document.getElementById('yarn-svg');
    if (!svg) return;

    var board = document.querySelector('.yarn-board');
    if (!board) return;

    // Clear existing lines
    var existingLines = svg.querySelectorAll('line');
    existingLines.forEach(function (l) { l.remove(); });

    var nodes = document.querySelectorAll('.yarn-node');
    nodes.forEach(function (node) {
      var connects = node.getAttribute('data-connects');
      if (!connects) return;

      var targets = connects.split(',');
      targets.forEach(function (targetId) {
        var target = document.getElementById(targetId.trim());
        if (!target) return;

        var fromRect = node.getBoundingClientRect();
        var toRect = target.getBoundingClientRect();
        var boardRect = board.getBoundingClientRect();

        var x1 = fromRect.left + fromRect.width / 2 - boardRect.left;
        var y1 = fromRect.top + fromRect.height / 2 - boardRect.top;
        var x2 = toRect.left + toRect.width / 2 - boardRect.left;
        var y2 = toRect.top + toRect.height / 2 - boardRect.top;

        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);

        svg.appendChild(line);
      });
    });
  }

  /* ---------- Whiteboard — Draggable Nodes ---------- */
  function initWhiteboardDrag() {
    var nodes = document.querySelectorAll('.yarn-node');
    nodes.forEach(function (node) {
      var isDragging = false;
      var offsetX = 0, offsetY = 0;
      var board = node.parentElement;

      function onPointerDown(e) {
        isDragging = true;
        var rect = node.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        node.style.zIndex = '10';
        node.style.transition = 'none';
        e.preventDefault();
      }

      function onPointerMove(e) {
        if (!isDragging) return;
        var boardRect = board.getBoundingClientRect();
        var x = e.clientX - boardRect.left - offsetX;
        var y = e.clientY - boardRect.top - offsetY;

        // Clamp inside board
        x = Math.max(0, Math.min(boardRect.width - node.offsetWidth, x));
        y = Math.max(0, Math.min(boardRect.height - node.offsetHeight, y));

        node.style.left = (x / boardRect.width * 100) + '%';
        node.style.top = (y / boardRect.height * 100) + '%';

        drawYarnLines();
      }

      function onPointerUp() {
        isDragging = false;
        node.style.zIndex = '2';
        node.style.transition = '';
      }

      node.addEventListener('pointerdown', onPointerDown);
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
    });
  }

  initWhiteboardDrag();

  /* ---------- Kanban — SortableJS ---------- */
  function initKanban() {
    if (typeof Sortable === 'undefined') return;

    var columns = ['kanban-prep', 'kanban-craft', 'kanban-finish', 'kanban-ship'];
    columns.forEach(function (colId) {
      var el = document.getElementById(colId);
      if (el) {
        Sortable.create(el, {
          group: 'kanban',
          animation: 200,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          ghostClass: 'kanban-ghost',
          dragClass: 'kanban-dragging',
          onEnd: function (evt) {
            updateKanbanCounts();
            showToast('Card moved!');
          }
        });
      }
    });
  }

  function updateKanbanCounts() {
    document.querySelectorAll('.kanban-column').forEach(function (col) {
      var cards = col.querySelectorAll('.kanban-card');
      var count = col.querySelector('.kanban-count');
      if (count) count.textContent = cards.length;
    });
  }

  setTimeout(initKanban, 1500);

  /* ---------- Settings — Toggle Feedback ---------- */
  document.querySelectorAll('.toggle-switch input').forEach(function (input) {
    input.addEventListener('change', function () {
      var label = input.closest('.settings-toggle-row');
      if (label) {
        var name = label.querySelector('.toggle-label strong');
        var state = input.checked ? 'enabled' : 'disabled';
        showToast((name ? name.textContent : 'Setting') + ' ' + state);
      }
    });
  });

  /* ---------- GSAP — Spring Bounce on Dock Items ---------- */
  function initGSAPAnimations() {
    if (typeof gsap === 'undefined') return;

    // Spring bounce entrance for dock
    gsap.from('.dock-item', {
      y: 40,
      opacity: 0,
      duration: 0.6,
      stagger: 0.05,
      ease: 'back.out(1.7)',
      delay: 1.3
    });

    // ScrollTrigger for budget bars
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      gsap.utils.toArray('.budget-fill').forEach(function (bar) {
        var w = bar.style.width;
        bar.style.width = '0%';
        gsap.to(bar, {
          width: w,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: bar,
            start: 'top 90%',
            toggleActions: 'play none none none'
          }
        });
      });
    }
  }

  setTimeout(initGSAPAnimations, 1400);

  /* ---------- Vote Heart Click ---------- */
  document.addEventListener('click', function (e) {
    var voteEl = e.target.closest('.idea-votes');
    if (voteEl) {
      var txt = voteEl.textContent.trim();
      var num = parseInt(txt.replace(/[^\d]/g, '')) || 0;
      num++;
      voteEl.innerHTML = '<i class="ph-duotone ph-heart"></i> ' + num;
      showToast('Liked!');
    }
  });

  /* ---------- Bookshelf Spine Click ---------- */
  document.querySelectorAll('.book-spine').forEach(function (spine) {
    spine.addEventListener('click', function () {
      var title = spine.querySelector('.spine-title').textContent;
      showToast('Opening ' + title + '...');
      // Navigate to workspace after a brief pause
      setTimeout(function () {
        navigateTo('project-workspace');
      }, 600);
    });
  });

  /* ---------- Utility ---------- */
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ---------- Keyboard Navigation ---------- */
  document.addEventListener('keydown', function (e) {
    // Escape closes mobile menu
    if (e.key === 'Escape') {
      dockNav.classList.remove('mobile-open');
    }

    // Number keys 1-9 and 0 for quick nav
    if (!e.ctrlKey && !e.altKey && !e.metaKey) {
      var target = e.target;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      var viewMap = {
        '1': 'dashboard',
        '2': 'projects',
        '3': 'project-workspace',
        '4': 'kanban',
        '5': 'whiteboard',
        '6': 'schema-planner',
        '7': 'directory-tree',
        '8': 'ideas',
        '9': 'ai-chat',
        '0': 'settings'
      };

      if (viewMap[e.key]) {
        navigateTo(viewMap[e.key]);
      }
    }
  });

  /* ---------- Window Resize — Redraw Yarn ---------- */
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var activeView = document.querySelector('.view.active');
      if (activeView && activeView.dataset.view === 'whiteboard') {
        drawYarnLines();
      }
    }, 200);
  });

})();
