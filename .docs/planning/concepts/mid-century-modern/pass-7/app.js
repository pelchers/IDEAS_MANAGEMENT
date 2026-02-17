/* ============================================================
   IDEA-MANAGEMENT — Mid-Century Modern Pass 7
   "Floating Dock Lounge" / Showroom Curator
   app.js — Navigation, interactions, animations
   ============================================================ */

(function () {
  'use strict';

  // --- State ---
  let currentView = 'dashboard';
  const views = [
    'dashboard', 'projects', 'project-workspace', 'kanban',
    'whiteboard', 'schema-planner', 'directory-tree',
    'ideas', 'ai-chat', 'settings'
  ];

  // --- DOM References ---
  const dockItems = document.querySelectorAll('.dock-item[data-view]');
  const pages = document.querySelectorAll('.page[data-page]');
  const toast = document.getElementById('toast');

  // --- Navigation ---
  function navigateTo(viewId) {
    if (!views.includes(viewId)) return;
    if (viewId === currentView) return;

    // Deactivate current page
    const currentPage = document.querySelector('.page.active');
    if (currentPage) {
      currentPage.style.animation = 'none';
      currentPage.classList.remove('active');
    }

    // Activate new page
    const newPage = document.querySelector(`.page[data-page="${viewId}"]`);
    if (newPage) {
      newPage.classList.add('active');
      // Reset animation trigger
      newPage.style.animation = 'none';
      newPage.offsetHeight; // Force reflow
      newPage.style.animation = '';

      // Trigger scroll reveals on new page
      requestAnimationFrame(() => {
        initScrollReveals(newPage);
      });
    }

    // Update dock
    dockItems.forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewId);
    });

    // Update state
    currentView = viewId;

    // Update hash
    window.location.hash = viewId;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Dock Click Handlers ---
  dockItems.forEach(item => {
    item.addEventListener('click', () => {
      navigateTo(item.dataset.view);

      // Spring bounce micro-feedback
      item.style.transform = 'scale(0.97)';
      setTimeout(() => {
        item.style.transform = 'scale(1.04) translateY(-3px)';
        setTimeout(() => {
          item.style.transform = '';
        }, 150);
      }, 80);
    });
  });

  // --- Breadcrumb Navigation ---
  document.querySelectorAll('.breadcrumb-link[data-view]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.dataset.view);
    });
  });

  // --- Hash Routing ---
  function handleHashChange() {
    const hash = window.location.hash.replace('#', '');
    if (hash && views.includes(hash)) {
      navigateTo(hash);
    }
  }

  window.addEventListener('hashchange', handleHashChange);

  // --- Scroll Reveal (IntersectionObserver) ---
  function initScrollReveals(container) {
    const revealElements = container.querySelectorAll(
      '.specimen-card, .project-card, .kanban-card, .idea-card, .settings-group, ' +
      '.hero-gradient-card, .workspace-meta-card, .workspace-tasks-card, .chat-msg, ' +
      '.tree-container, .whiteboard-canvas, .schema-canvas, .chat-container'
    );

    revealElements.forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${i * 80}ms`;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => observer.observe(el));
  }

  // --- Button Click Spring ---
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.action-btn, .promote-btn, .filter-pill');
    if (!btn) return;

    btn.style.transition = 'transform 0.1s ease';
    btn.style.transform = 'scale(0.97)';
    setTimeout(() => {
      btn.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
      btn.style.transform = 'scale(1.02)';
      setTimeout(() => {
        btn.style.transform = '';
        btn.style.transition = '';
      }, 200);
    }, 100);
  });

  // --- Toast System ---
  let toastTimeout;
  function showToast(message) {
    clearTimeout(toastTimeout);
    toast.textContent = message;
    toast.classList.add('visible');
    toastTimeout = setTimeout(() => {
      toast.classList.remove('visible');
    }, 2800);
  }

  // --- Promote to Kanban ---
  document.querySelectorAll('.promote-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const ideaCard = btn.closest('.idea-card');
      const title = ideaCard.querySelector('.idea-title').textContent;

      // Animate card
      ideaCard.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
      ideaCard.style.transform = 'scale(0.98)';
      ideaCard.style.opacity = '0.6';
      ideaCard.classList.add('idea-promoted');

      // Replace button with badge
      btn.outerHTML = '<span class="promoted-badge">Promoted</span>';

      showToast(`"${title}" promoted to Kanban`);
    });
  });

  // --- Filter Pills ---
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      showToast(`Filter: ${pill.textContent}`);
    });
  });

  // --- Directory Tree Toggle ---
  document.querySelectorAll('.tree-folder').forEach(folder => {
    const toggle = folder.querySelector(':scope > .tree-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      folder.classList.toggle('open');
    });

    // Also toggle on folder name click
    const name = folder.querySelector(':scope > .tree-name');
    if (name) {
      name.addEventListener('click', (e) => {
        e.stopPropagation();
        folder.classList.toggle('open');
      });
    }
  });

  // --- Whiteboard Node Drag ---
  (function initWhiteboardDrag() {
    const canvas = document.querySelector('.whiteboard-canvas');
    if (!canvas) return;

    const nodes = canvas.querySelectorAll('.wb-node');
    let dragNode = null;
    let offsetX = 0, offsetY = 0;

    nodes.forEach(node => {
      node.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'A') return;
        dragNode = node;
        const rect = node.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        node.style.zIndex = '10';
        node.style.transition = 'none';
        e.preventDefault();
      });
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragNode) return;
      const canvasRect = canvas.getBoundingClientRect();
      const x = e.clientX - canvasRect.left - offsetX;
      const y = e.clientY - canvasRect.top - offsetY;
      dragNode.style.left = Math.max(0, Math.min(canvasRect.width - 200, x)) + 'px';
      dragNode.style.top = Math.max(0, Math.min(canvasRect.height - 80, y)) + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (dragNode) {
        dragNode.style.zIndex = '2';
        dragNode.style.transition = '';
        dragNode = null;
      }
    });
  })();

  // --- Kanban Card Drag (simplified) ---
  (function initKanbanDrag() {
    const columns = document.querySelectorAll('.kanban-cards');

    columns.forEach(col => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        col.style.background = 'rgba(196, 107, 46, 0.05)';
        col.style.borderRadius = '8px';
      });

      col.addEventListener('dragleave', () => {
        col.style.background = '';
      });

      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.style.background = '';
        const card = document.querySelector('.kanban-card.dragging');
        if (card) {
          col.appendChild(card);
          card.classList.remove('dragging');
          updateColumnCounts();
          showToast('Card moved successfully');
        }
      });
    });

    document.querySelectorAll('.kanban-card').forEach(card => {
      card.addEventListener('dragstart', () => {
        card.classList.add('dragging');
        card.style.opacity = '0.5';
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        card.style.opacity = '';
      });
    });

    function updateColumnCounts() {
      document.querySelectorAll('.kanban-column').forEach(col => {
        const count = col.querySelectorAll('.kanban-card').length;
        const countEl = col.querySelector('.kanban-col-count');
        if (countEl) countEl.textContent = count;
      });
    }
  })();

  // --- AI Chat Send ---
  (function initChat() {
    const input = document.querySelector('.chat-input');
    const sendBtn = document.querySelector('.chat-send-btn');
    const messages = document.querySelector('.chat-messages');

    if (!input || !sendBtn || !messages) return;

    function sendMessage() {
      const text = input.value.trim();
      if (!text) return;

      // Add user message
      const userMsg = document.createElement('div');
      userMsg.className = 'chat-msg msg-user';
      userMsg.innerHTML = `
        <div class="msg-content"><p>${escapeHtml(text)}</p></div>
        <div class="msg-avatar">You</div>
      `;
      userMsg.style.animation = 'pageEnter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
      messages.appendChild(userMsg);

      input.value = '';

      // Simulate AI response
      setTimeout(() => {
        const aiMsg = document.createElement('div');
        aiMsg.className = 'chat-msg msg-ai';
        aiMsg.innerHTML = `
          <div class="msg-avatar">AI</div>
          <div class="msg-content">
            <p>I understand you're asking about "${escapeHtml(text.substring(0, 50))}". Let me help you with that. As your project assistant, I can update kanban cards, capture ideas, or generate directory structures. What specific action would you like me to take?</p>
          </div>
        `;
        aiMsg.style.animation = 'pageEnter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        messages.appendChild(aiMsg);
        messages.scrollTop = messages.scrollHeight;
      }, 800);

      messages.scrollTop = messages.scrollHeight;
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  })();

  // --- Idea Capture ---
  (function initIdeaCapture() {
    const captureBtn = document.querySelector('.idea-capture-form .action-primary');
    const ideaInput = document.querySelector('.idea-input');
    const ideasList = document.querySelector('.ideas-list');

    if (!captureBtn || !ideaInput || !ideasList) return;

    captureBtn.addEventListener('click', () => {
      const text = ideaInput.value.trim();
      if (!text) {
        showToast('Please enter an idea');
        return;
      }

      const select = document.querySelector('.idea-select');
      const priority = select ? select.value.replace('Priority: ', '').toLowerCase() : 'medium';
      const tagInput = document.querySelector('.idea-tag-input');
      const tags = tagInput ? tagInput.value.split(',').map(t => t.trim()).filter(Boolean) : [];

      const card = document.createElement('div');
      card.className = 'idea-card';
      card.style.animation = 'pageEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
      card.innerHTML = `
        <div class="idea-card-main">
          <h3 class="idea-title">${escapeHtml(text)}</h3>
          <div class="idea-tags">
            ${tags.map(t => `<span class="idea-tag">${escapeHtml(t)}</span>`).join('')}
          </div>
        </div>
        <div class="idea-card-side">
          <span class="idea-priority priority-${priority}">${priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
          <button class="promote-btn">Promote to Kanban</button>
        </div>
      `;

      // Add promote handler
      card.querySelector('.promote-btn').addEventListener('click', function () {
        card.classList.add('idea-promoted');
        card.style.opacity = '0.55';
        this.outerHTML = '<span class="promoted-badge">Promoted</span>';
        showToast(`"${text}" promoted to Kanban`);
      });

      ideasList.prepend(card);
      ideaInput.value = '';
      if (tagInput) tagInput.value = '';

      showToast('Idea captured successfully');
    });
  })();

  // --- Task Checkbox Toggle ---
  document.querySelectorAll('.task-check').forEach(check => {
    check.addEventListener('click', () => {
      check.classList.toggle('checked');
      const text = check.nextElementSibling;
      if (text) text.classList.toggle('done');

      // Warm pulse feedback
      check.style.transform = 'scale(1.3)';
      setTimeout(() => {
        check.style.transform = '';
      }, 200);
    });
  });

  // --- Whiteboard Tool Selection ---
  document.querySelectorAll('.wb-tool[title]').forEach(tool => {
    tool.addEventListener('click', () => {
      // Only toggle active for the first 4 tools (not zoom)
      const tools = document.querySelectorAll('.wb-tool[title]');
      const toolIndex = Array.from(tools).indexOf(tool);
      if (toolIndex < 4) {
        tools.forEach((t, i) => {
          if (i < 4) t.classList.remove('active');
        });
        tool.classList.add('active');
      }
    });
  });

  // --- Input Focus Glow ---
  document.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('focus', () => {
      input.style.transition = 'border-color 0.3s, box-shadow 0.3s';
    });
  });

  // --- Keyboard Navigation ---
  document.addEventListener('keydown', (e) => {
    // Alt + number for quick view switching
    if (e.altKey && e.key >= '1' && e.key <= '9') {
      e.preventDefault();
      const index = parseInt(e.key) - 1;
      if (index < views.length) {
        navigateTo(views[index]);
      }
    }

    // Alt + 0 for settings (10th view)
    if (e.altKey && e.key === '0') {
      e.preventDefault();
      navigateTo('settings');
    }

    // Escape to close any open state
    if (e.key === 'Escape') {
      // Could be used for modal dismissal in future
    }
  });

  // --- Utility: HTML Escape ---
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Idle Ambient: Subtle warm light flicker ---
  (function initAmbientFlicker() {
    const glow = document.querySelector('.ambient-glow');
    if (!glow || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // The CSS animation already handles the subtle flicker
    // This JS layer adds randomized micro-variations
    let flickerInterval;

    function startFlicker() {
      flickerInterval = setInterval(() => {
        const variation = 0.85 + Math.random() * 0.3;
        glow.style.opacity = variation;
      }, 3000 + Math.random() * 2000);
    }

    // Only run when page is visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearInterval(flickerInterval);
      } else {
        startFlicker();
      }
    });

    startFlicker();
  })();

  // --- Progress Bar Animation ---
  (function animateProgressBars() {
    const fills = document.querySelectorAll('.progress-fill');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const width = el.style.width;
          el.style.width = '0%';
          requestAnimationFrame(() => {
            setTimeout(() => {
              el.style.width = width;
            }, 200);
          });
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    fills.forEach(fill => observer.observe(fill));
  })();

  // --- Initialize ---
  function init() {
    // Set initial view from hash or default
    const hash = window.location.hash.replace('#', '');
    const startView = views.includes(hash) ? hash : 'dashboard';

    // Show initial page
    const initialPage = document.querySelector(`.page[data-page="${startView}"]`);
    if (initialPage) {
      initialPage.classList.add('active');
      initScrollReveals(initialPage);
    }

    // Set active dock item
    dockItems.forEach(item => {
      item.classList.toggle('active', item.dataset.view === startView);
    });

    currentView = startView;
  }

  // Wait for DOM + fonts
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
