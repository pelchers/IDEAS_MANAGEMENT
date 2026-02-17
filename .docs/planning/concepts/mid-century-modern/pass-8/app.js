/**
 * IDEA-MANAGEMENT — Mid-Century Modern Pass 8
 * Timeline Exhibit Walkthrough
 * Right-rail vertical timeline navigation with museum docent experience
 */

(function () {
  'use strict';

  // ============ View Navigation ============
  const viewPanels = document.querySelectorAll('.view-panel[data-page]');
  const allNavItems = document.querySelectorAll('[data-view]');
  let currentView = 'dashboard';

  function navigateTo(viewName) {
    if (viewName === currentView) return;
    currentView = viewName;

    // Update view panels
    viewPanels.forEach(panel => {
      panel.classList.remove('active');
      if (panel.dataset.page === viewName) {
        panel.classList.add('active');
        // Re-trigger cascade animations
        triggerCascade(panel);
      }
    });

    // Update all nav items with data-view
    allNavItems.forEach(item => {
      item.classList.remove('active');
      if (item.dataset.view === viewName) {
        item.classList.add('active');
      }
    });

    // Close mobile drawer if open
    closeMobileDrawer();

    // Scroll view area to top
    const viewArea = document.getElementById('viewArea');
    if (viewArea) viewArea.scrollTop = 0;

    // Update hash
    history.replaceState(null, '', '#' + viewName);
  }

  function triggerCascade(panel) {
    const items = panel.querySelectorAll('.cascade-item');
    items.forEach((item, index) => {
      item.style.animation = 'none';
      item.offsetHeight; // Force reflow
      item.style.animation = '';
      item.style.animationDelay = (index * 80) + 'ms';
    });
  }

  // Click handlers on ALL [data-view] elements (timeline dots + mobile nav items)
  allNavItems.forEach(item => {
    item.addEventListener('click', () => {
      navigateTo(item.dataset.view);
    });
  });

  // Quick action and navigable element clicks
  document.addEventListener('click', (e) => {
    const navigable = e.target.closest('[data-navigate]');
    if (navigable) {
      e.preventDefault();
      navigateTo(navigable.dataset.navigate);
    }
  });

  // ============ Hash Routing ============
  function handleHash() {
    const hash = location.hash.replace('#', '');
    const validViews = [
      'dashboard', 'projects', 'project-workspace', 'kanban', 'whiteboard',
      'schema-planner', 'directory-tree', 'ideas', 'ai-chat', 'settings'
    ];
    if (hash && validViews.includes(hash)) {
      currentView = ''; // Reset so navigateTo doesn't short-circuit
      navigateTo(hash);
    }
  }

  window.addEventListener('hashchange', handleHash);

  // ============ Mobile Drawer ============
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileClose = document.getElementById('mobileClose');

  function openMobileDrawer() {
    mobileDrawer.classList.add('open');
    mobileOverlay.classList.add('open');
  }

  function closeMobileDrawer() {
    mobileDrawer.classList.remove('open');
    mobileOverlay.classList.remove('open');
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileDrawer);
  if (mobileClose) mobileClose.addEventListener('click', closeMobileDrawer);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileDrawer);

  // ============ Settings Tab Navigation ============
  const settingsTabs = document.querySelectorAll('.settings-tab[data-settings-tab]');
  const settingsSections = document.querySelectorAll('.settings-section[data-settings-section]');

  settingsTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.settingsTab;

      settingsTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      settingsSections.forEach(section => {
        section.classList.remove('active');
        if (section.dataset.settingsSection === target) {
          section.classList.add('active');
        }
      });
    });
  });

  // ============ Toggle Switches ============
  document.querySelectorAll('[data-toggle-switch]').forEach(toggle => {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
    });
  });

  // ============ Directory Tree Toggle ============
  document.querySelectorAll('.dir-tree__row[data-toggle]').forEach(row => {
    row.addEventListener('click', () => {
      const targetId = 'dir-' + row.dataset.toggle;
      const children = document.getElementById(targetId);
      if (children) {
        const isVisible = children.style.display !== 'none';
        children.style.display = isVisible ? 'none' : 'block';
      }
      // Toggle selected state
      document.querySelectorAll('.dir-tree__row').forEach(r => r.classList.remove('selected'));
      row.classList.add('selected');
    });
  });

  // ============ Whiteboard Tool Selection ============
  document.querySelectorAll('.whiteboard-tool').forEach(tool => {
    tool.addEventListener('click', () => {
      document.querySelectorAll('.whiteboard-tool').forEach(t => t.classList.remove('active'));
      tool.classList.add('active');
    });
  });

  // ============ Workspace Sidebar Navigation ============
  document.querySelectorAll('.workspace-sidebar__nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const nav = item.dataset.navigate;
      if (nav) {
        navigateTo(nav);
        return;
      }
      document.querySelectorAll('.workspace-sidebar__nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // ============ Kanban Card Drag Simulation ============
  document.querySelectorAll('.kanban-card').forEach(card => {
    card.addEventListener('mousedown', () => {
      card.style.cursor = 'grabbing';
      card.style.opacity = '0.85';
    });

    card.addEventListener('mouseup', () => {
      card.style.cursor = 'grab';
      card.style.opacity = '';
    });

    card.addEventListener('mouseleave', () => {
      card.style.cursor = 'grab';
      card.style.opacity = '';
    });
  });

  // ============ Chat Send Simulation ============
  const chatInput = document.querySelector('.chat-input-bar input');
  const chatSendBtn = document.querySelector('.chat-input-bar button');
  const chatContainer = document.querySelector('.chat-container');

  if (chatSendBtn && chatInput && chatContainer) {
    function sendChatMessage() {
      const text = chatInput.value.trim();
      if (!text) return;

      // Add user message
      const userMsg = document.createElement('div');
      userMsg.className = 'chat-message user';
      userMsg.innerHTML = `
        <div class="chat-avatar human">MW</div>
        <div class="chat-bubble">${escapeHtml(text)}</div>
      `;
      chatContainer.insertBefore(userMsg, document.querySelector('.chat-input-bar'));
      chatInput.value = '';

      // Loading state
      const loadingMsg = document.createElement('div');
      loadingMsg.className = 'chat-message assistant';
      loadingMsg.innerHTML = `
        <div class="chat-avatar ai">AI</div>
        <div class="loading-dots">
          <span></span><span></span><span></span>
        </div>
      `;
      chatContainer.insertBefore(loadingMsg, document.querySelector('.chat-input-bar'));

      // Simulate AI response
      setTimeout(() => {
        loadingMsg.innerHTML = `
          <div class="chat-avatar ai">AI</div>
          <div class="chat-bubble">Thank you for your message. I have noted your input and can assist with updating your project accordingly. Would you like me to take any specific action?</div>
        `;
      }, 1200);
    }

    chatSendBtn.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendChatMessage();
    });
  }

  // ============ Idea Promote Action ============
  document.querySelectorAll('.idea-action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (btn.textContent === 'Promote') {
        btn.textContent = 'Promoted';
        btn.style.color = 'var(--accent2)';
        btn.style.borderColor = 'var(--accent2)';
        btn.style.background = 'rgba(58, 124, 95, 0.06)';

        // Brief success animation
        const check = document.createElement('span');
        check.className = 'success-check';
        check.textContent = ' \u2713';
        check.style.marginLeft = '4px';
        btn.appendChild(check);

        setTimeout(() => {
          if (check.parentNode) check.remove();
        }, 2000);
      }
    });
  });

  // ============ Project Card Hover Sound-Free Animation ============
  document.querySelectorAll('.project-card[data-navigate]').forEach(card => {
    card.addEventListener('click', () => {
      navigateTo(card.dataset.navigate);
    });
  });

  // ============ Scroll Reveal for Timeline Nodes ============
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px'
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const node = entry.target;
        const index = Array.from(node.parentElement.children).indexOf(node);
        const isOdd = index % 2 === 0;
        node.classList.add(isOdd ? 'reveal-left' : 'reveal-right');
        revealObserver.unobserve(node);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.timeline-node').forEach(node => {
    revealObserver.observe(node);
  });

  // ============ Keyboard Navigation ============
  document.addEventListener('keydown', (e) => {
    const viewOrder = [
      'dashboard', 'projects', 'project-workspace', 'kanban', 'whiteboard',
      'schema-planner', 'directory-tree', 'ideas', 'ai-chat', 'settings'
    ];
    const currentIndex = viewOrder.indexOf(currentView);

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
      if (currentIndex < viewOrder.length - 1) {
        e.preventDefault();
        navigateTo(viewOrder[currentIndex + 1]);
      }
    }

    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
      if (currentIndex > 0) {
        e.preventDefault();
        navigateTo(viewOrder[currentIndex - 1]);
      }
    }

    // Escape closes mobile drawer
    if (e.key === 'Escape') {
      closeMobileDrawer();
    }
  });

  // ============ Utility: HTML Escaping ============
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ============ Initial Load ============
  // Check hash first, otherwise show dashboard
  const initHash = location.hash.replace('#', '');
  const validViews = [
    'dashboard', 'projects', 'project-workspace', 'kanban', 'whiteboard',
    'schema-planner', 'directory-tree', 'ideas', 'ai-chat', 'settings'
  ];

  if (initHash && validViews.includes(initHash)) {
    currentView = ''; // Reset so navigateTo doesn't short-circuit
    navigateTo(initHash);
  } else {
    // Dashboard is already active via HTML class, just trigger cascade
    const initialPanel = document.querySelector('.view-panel.active');
    if (initialPanel) {
      triggerCascade(initialPanel);
    }
  }

})();
