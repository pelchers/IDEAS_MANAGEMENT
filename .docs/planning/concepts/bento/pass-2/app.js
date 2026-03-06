/* ============================================================
   BENTO PASS 2 — Warm Editorial Bento
   Application JavaScript
   ============================================================ */

/* ============================================================
   INITIALIZATION
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initMobileNav();
  initTileExpansion();
  initCharts();
  initWhiteboard();
  initDirectoryTree();
  initTimer();
  initChatInput();
  initKanbanDrag();
  initFilterButtons();
  initSettingsInteractions();
  initLoadAnimations();
});

/* ============================================================
   NAVIGATION — Hash-based view switching
   ============================================================ */
function initNavigation() {
  const links = document.querySelectorAll('[data-view]');
  const views = document.querySelectorAll('.view');

  function switchView(viewId) {
    /* Deactivate all views */
    views.forEach(v => v.classList.remove('active'));

    /* Deactivate all nav links */
    links.forEach(l => l.classList.remove('active'));

    /* Activate target view */
    const targetView = document.getElementById(viewId);
    if (targetView) {
      targetView.classList.add('active');
    }

    /* Activate matching nav links */
    links.forEach(l => {
      if (l.dataset.view === viewId) {
        l.classList.add('active');
      }
    });

    /* Close mobile nav */
    closeMobileNav();

    /* Re-init charts if dashboard */
    if (viewId === 'dashboard') {
      setTimeout(() => initCharts(), 100);
    }

    /* Re-init whiteboard canvas if whiteboard */
    if (viewId === 'whiteboard') {
      setTimeout(() => initWhiteboardCanvas(), 100);
    }
  }

  /* Click handlers */
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const viewId = link.dataset.view;
      window.location.hash = viewId;
      switchView(viewId);
    });
  });

  /* Handle initial hash */
  function handleHash() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchView(hash);
  }

  window.addEventListener('hashchange', handleHash);
  handleHash();
}

/* ============================================================
   MOBILE NAVIGATION
   ============================================================ */
function initMobileNav() {
  const hamburger = document.getElementById('hamburger-btn');
  const overlay = document.getElementById('mobile-nav-overlay');

  if (!hamburger || !overlay) return;

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.contains('open');
    if (isOpen) {
      closeMobileNav();
    } else {
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      overlay.classList.add('open');
    }
  });

  /* Close when clicking overlay background */
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeMobileNav();
    }
  });
}

function closeMobileNav() {
  const hamburger = document.getElementById('hamburger-btn');
  const overlay = document.getElementById('mobile-nav-overlay');
  if (hamburger) {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
  if (overlay) {
    overlay.classList.remove('open');
  }
}

/* ============================================================
   TILE EXPANSION — GSAP hover-expand-transform
   ============================================================ */
function initTileExpansion() {
  const expandableTiles = document.querySelectorAll('[data-expandable]');

  expandableTiles.forEach(tile => {
    const expandedContent = tile.querySelector('.tile-expanded-content');
    if (!expandedContent) return;

    /* Desktop: hover */
    tile.addEventListener('mouseenter', () => {
      expandTile(tile, expandedContent);
    });

    tile.addEventListener('mouseleave', () => {
      collapseTile(tile, expandedContent);
    });

    /* Mobile: click toggle */
    tile.addEventListener('click', (e) => {
      /* Skip if clicking interactive elements */
      if (e.target.closest('button, a, input, textarea, select, [contenteditable]')) return;

      if (window.innerWidth <= 1024) {
        if (tile.classList.contains('expanded')) {
          collapseTile(tile, expandedContent);
        } else {
          collapseTile(tile, expandedContent);
          expandTile(tile, expandedContent);
        }
      }
    });
  });
}

function expandTile(tile, content) {
  if (typeof gsap !== 'undefined') {
    tile.classList.add('expanded');
    gsap.to(content, {
      maxHeight: 200,
      opacity: 1,
      marginTop: 16,
      duration: 0.4,
      ease: 'power2.out'
    });
    gsap.to(tile, {
      y: -4,
      boxShadow: '0 12px 32px rgba(45, 42, 38, 0.12)',
      duration: 0.3,
      ease: 'power2.out'
    });
  } else {
    tile.classList.add('expanded');
  }
}

function collapseTile(tile, content) {
  if (typeof gsap !== 'undefined') {
    gsap.to(content, {
      maxHeight: 0,
      opacity: 0,
      marginTop: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        tile.classList.remove('expanded');
      }
    });
    gsap.to(tile, {
      y: 0,
      boxShadow: '0 4px 12px rgba(45, 42, 38, 0.06)',
      duration: 0.3,
      ease: 'power2.in'
    });
  } else {
    tile.classList.remove('expanded');
  }
}

/* ============================================================
   CHARTS — Chart.js with warm palette
   ============================================================ */
let lineChart = null;
let donutChart = null;

function initCharts() {
  if (typeof Chart === 'undefined') return;

  initLineChart();
  initDonutChart();
}

function initLineChart() {
  const ctx = document.getElementById('dashboard-line-chart');
  if (!ctx) return;

  /* Destroy existing chart if any */
  if (lineChart) {
    lineChart.destroy();
    lineChart = null;
  }

  const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 220);
  gradient.addColorStop(0, 'rgba(255, 179, 71, 0.3)');
  gradient.addColorStop(1, 'rgba(255, 179, 71, 0.0)');

  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Ideas Created',
        data: [12, 19, 8, 15, 22, 18, 25],
        borderColor: '#E8734A',
        backgroundColor: gradient,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#E8734A',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#2D2A26',
          titleColor: '#FFB347',
          bodyColor: '#FFFFFF',
          cornerRadius: 8,
          padding: 12,
          titleFont: { family: 'Plus Jakarta Sans', weight: '600' },
          bodyFont: { family: 'Plus Jakarta Sans' }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#8B8177',
            font: { family: 'Plus Jakarta Sans', size: 12 }
          }
        },
        y: {
          grid: {
            color: 'rgba(45, 42, 38, 0.06)',
            drawBorder: false
          },
          ticks: {
            color: '#8B8177',
            font: { family: 'Plus Jakarta Sans', size: 12 }
          },
          beginAtZero: true
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  });
}

function initDonutChart() {
  const ctx = document.getElementById('dashboard-donut-chart');
  if (!ctx) return;

  /* Destroy existing chart if any */
  if (donutChart) {
    donutChart.destroy();
    donutChart = null;
  }

  donutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Product', 'Design', 'Engineering', 'Growth', 'Research'],
      datasets: [{
        data: [35, 28, 20, 10, 7],
        backgroundColor: [
          '#E8734A',
          '#FFB347',
          '#B8860B',
          '#5a9e6f',
          '#8B7355'
        ],
        borderColor: '#FFFFFF',
        borderWidth: 3,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#2D2A26',
            font: { family: 'Plus Jakarta Sans', size: 11 },
            padding: 12,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: '#2D2A26',
          titleColor: '#FFB347',
          bodyColor: '#FFFFFF',
          cornerRadius: 8,
          padding: 12,
          titleFont: { family: 'Plus Jakarta Sans', weight: '600' },
          bodyFont: { family: 'Plus Jakarta Sans' }
        }
      }
    }
  });
}

/* ============================================================
   WHITEBOARD — Canvas drawing
   ============================================================ */
function initWhiteboard() {
  initWhiteboardCanvas();
  initWhiteboardTools();
}

function initWhiteboardCanvas() {
  const canvas = document.getElementById('whiteboard-canvas');
  if (!canvas) return;

  const container = canvas.parentElement;
  canvas.width = container.offsetWidth;
  canvas.height = 400;

  const ctx = canvas.getContext('2d');

  /* Draw default grid */
  drawWhiteboardGrid(ctx, canvas.width, canvas.height);

  /* Draw some sample shapes */
  drawSampleShapes(ctx);

  /* Simple drawing handler */
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#2D2A26';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();

    lastX = x;
    lastY = y;
  });

  canvas.addEventListener('mouseup', () => { isDrawing = false; });
  canvas.addEventListener('mouseleave', () => { isDrawing = false; });

  /* Touch support */
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    isDrawing = true;
    lastX = touch.clientX - rect.left;
    lastY = touch.clientY - rect.top;
  });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#2D2A26';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();

    lastX = x;
    lastY = y;
  });

  canvas.addEventListener('touchend', () => { isDrawing = false; });
}

function drawWhiteboardGrid(ctx, w, h) {
  ctx.fillStyle = '#FBF7F2';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(45, 42, 38, 0.06)';
  ctx.lineWidth = 1;

  const gridSize = 24;

  for (let x = 0; x <= w; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  for (let y = 0; y <= h; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function drawSampleShapes(ctx) {
  /* Sample rectangle */
  ctx.strokeStyle = '#E8734A';
  ctx.lineWidth = 2;
  ctx.strokeRect(80, 60, 200, 120);

  /* Label */
  ctx.fillStyle = '#2D2A26';
  ctx.font = '14px Plus Jakarta Sans, sans-serif';
  ctx.fillText('User Dashboard', 110, 130);

  /* Arrow line */
  ctx.beginPath();
  ctx.moveTo(280, 120);
  ctx.lineTo(380, 120);
  ctx.strokeStyle = '#B8860B';
  ctx.lineWidth = 2;
  ctx.stroke();

  /* Arrowhead */
  ctx.beginPath();
  ctx.moveTo(380, 120);
  ctx.lineTo(370, 115);
  ctx.lineTo(370, 125);
  ctx.closePath();
  ctx.fillStyle = '#B8860B';
  ctx.fill();

  /* Second rectangle */
  ctx.strokeStyle = '#FFB347';
  ctx.lineWidth = 2;
  ctx.strokeRect(390, 60, 180, 120);

  ctx.fillStyle = '#2D2A26';
  ctx.fillText('Project View', 420, 130);

  /* Circle */
  ctx.beginPath();
  ctx.arc(180, 280, 50, 0, Math.PI * 2);
  ctx.strokeStyle = '#5a9e6f';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#2D2A26';
  ctx.font = '12px Plus Jakarta Sans, sans-serif';
  ctx.fillText('API Layer', 152, 284);
}

function initWhiteboardTools() {
  const tools = document.querySelectorAll('.wb-tool[data-tool]');
  tools.forEach(tool => {
    tool.addEventListener('click', () => {
      /* Remove active from all tools except undo */
      if (tool.dataset.tool !== 'undo') {
        tools.forEach(t => {
          if (t.dataset.tool !== 'undo') t.classList.remove('active');
        });
        tool.classList.add('active');
      }

      if (tool.dataset.tool === 'undo') {
        /* Re-draw whiteboard */
        const canvas = document.getElementById('whiteboard-canvas');
        if (canvas) {
          const ctx = canvas.getContext('2d');
          drawWhiteboardGrid(ctx, canvas.width, canvas.height);
          drawSampleShapes(ctx);
        }
      }
    });
  });

  /* Color swatches */
  const swatches = document.querySelectorAll('.wb-color-swatch');
  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
    });
  });
}

/* ============================================================
   DIRECTORY TREE — Toggle folders
   ============================================================ */
function initDirectoryTree() {
  const toggles = document.querySelectorAll('.tree-toggle');

  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const folder = toggle.parentElement;
      folder.classList.toggle('tree-open');

      const isOpen = folder.classList.contains('tree-open');
      toggle.setAttribute('aria-expanded', isOpen);
    });

    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle.click();
      }
    });
  });
}

/* ============================================================
   FOCUS TIMER
   ============================================================ */
function initTimer() {
  const timerDisplay = document.getElementById('timer-value');
  const startBtn = document.getElementById('timer-start');
  const resetBtn = document.getElementById('timer-reset');

  if (!timerDisplay || !startBtn || !resetBtn) return;

  let timeLeft = 25 * 60; /* 25 minutes in seconds */
  let timerInterval = null;
  let isRunning = false;

  function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  startBtn.addEventListener('click', () => {
    if (isRunning) {
      clearInterval(timerInterval);
      startBtn.textContent = 'Start';
      isRunning = false;
    } else {
      timerInterval = setInterval(() => {
        if (timeLeft > 0) {
          timeLeft--;
          updateDisplay();
        } else {
          clearInterval(timerInterval);
          startBtn.textContent = 'Start';
          isRunning = false;
        }
      }, 1000);
      startBtn.textContent = 'Pause';
      isRunning = true;
    }
  });

  resetBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    timeLeft = 25 * 60;
    isRunning = false;
    startBtn.textContent = 'Start';
    updateDisplay();
  });
}

/* ============================================================
   AI CHAT — Input handling
   ============================================================ */
function initChatInput() {
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send-btn');
  const messagesContainer = document.getElementById('chat-messages');

  if (!input || !sendBtn || !messagesContainer) return;

  /* Auto-resize textarea */
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });

  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    /* Add user message */
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-msg chat-msg-user';
    userMsg.innerHTML = `
      <div class="chat-bubble chat-bubble-user">
        <p>${escapeHTML(text)}</p>
      </div>
      <div class="chat-avatar chat-avatar-user">You</div>
    `;
    messagesContainer.appendChild(userMsg);

    /* Clear input */
    input.value = '';
    input.style.height = 'auto';

    /* Scroll to bottom */
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    /* Simulate AI response */
    setTimeout(() => {
      const aiMsg = document.createElement('div');
      aiMsg.className = 'chat-msg chat-msg-ai';
      aiMsg.innerHTML = `
        <div class="chat-avatar chat-avatar-ai">AI</div>
        <div class="chat-bubble chat-bubble-ai">
          <p>That's an interesting thought! Let me think about how we can explore that further. Would you like me to break it down into actionable steps or brainstorm related ideas?</p>
        </div>
      `;
      messagesContainer.appendChild(aiMsg);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      /* Animate in */
      if (typeof gsap !== 'undefined') {
        gsap.from(aiMsg, {
          opacity: 0,
          y: 10,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    }, 800);

    /* Animate in user message */
    if (typeof gsap !== 'undefined') {
      gsap.from(userMsg, {
        opacity: 0,
        y: 10,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  }

  sendBtn.addEventListener('click', sendMessage);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  /* Suggestion chips */
  const chips = document.querySelectorAll('.suggestion-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.textContent;
      input.focus();
    });
  });
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ============================================================
   KANBAN — Drag and drop
   ============================================================ */
function initKanbanDrag() {
  const cards = document.querySelectorAll('.kanban-card');
  const columns = document.querySelectorAll('.kanban-cards');

  let draggedCard = null;

  cards.forEach(card => {
    card.addEventListener('dragstart', (e) => {
      draggedCard = card;
      card.style.opacity = '0.5';
      e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragend', () => {
      card.style.opacity = '1';
      draggedCard = null;
      /* Remove all drag-over indicators */
      columns.forEach(col => col.classList.remove('drag-over'));
    });
  });

  columns.forEach(col => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      col.classList.add('drag-over');
    });

    col.addEventListener('dragleave', () => {
      col.classList.remove('drag-over');
    });

    col.addEventListener('drop', (e) => {
      e.preventDefault();
      col.classList.remove('drag-over');
      if (draggedCard) {
        col.appendChild(draggedCard);
        updateKanbanCounts();
      }
    });
  });
}

function updateKanbanCounts() {
  const columns = document.querySelectorAll('.kanban-column');
  columns.forEach(col => {
    const count = col.querySelectorAll('.kanban-card').length;
    const countEl = col.querySelector('.kanban-count');
    if (countEl) {
      countEl.textContent = count;
    }
  });
}

/* ============================================================
   FILTER BUTTONS
   ============================================================ */
function initFilterButtons() {
  const filterGroups = document.querySelectorAll('.ideas-filters');

  filterGroups.forEach(group => {
    const buttons = group.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  });

  /* Chart period buttons */
  const periodBtns = document.querySelectorAll('.chart-period-btn');
  periodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.tile-chart-controls');
      if (group) {
        group.querySelectorAll('.chart-period-btn').forEach(b => b.classList.remove('active'));
      }
      btn.classList.add('active');
    });
  });
}

/* ============================================================
   SETTINGS INTERACTIONS
   ============================================================ */
function initSettingsInteractions() {
  /* Theme toggle buttons */
  const themeBtns = document.querySelectorAll('.theme-btn');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  /* Accent color swatches */
  const accentSwatches = document.querySelectorAll('.accent-swatch');
  accentSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      accentSwatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
    });
  });

  /* Star toggles */
  const stars = document.querySelectorAll('.idea-star');
  stars.forEach(star => {
    star.addEventListener('click', (e) => {
      e.stopPropagation();
      star.classList.toggle('starred');
      const isFilled = star.classList.contains('starred');
      if (isFilled) {
        star.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l2.2 4.6L15 6.3l-3.5 3.5.8 4.8L8 12.4l-4.3 2.2.8-4.8L1 6.3l4.8-.7z"/></svg>';
      } else {
        star.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 1l2.2 4.6L15 6.3l-3.5 3.5.8 4.8L8 12.4l-4.3 2.2.8-4.8L1 6.3l4.8-.7z"/></svg>';
      }
    });
  });
}

/* ============================================================
   LOAD ANIMATIONS — GSAP entry animations
   Uses gsap.fromTo to ensure elements are visible even if
   animation is interrupted or captured mid-flight.
   ============================================================ */
function initLoadAnimations() {
  if (typeof gsap === 'undefined') return;

  /* Ensure all tiles are immediately visible (in case GSAP lags) */
  document.querySelectorAll('.bento-tile').forEach(tile => {
    tile.style.opacity = '1';
    tile.style.transform = 'none';
  });

  /* Animate topbar */
  gsap.fromTo('.topbar',
    { y: -20 },
    { y: 0, duration: 0.6, ease: 'power3.out' }
  );

  /* Animate view header */
  gsap.fromTo('.view.active .view-title',
    { y: 12 },
    { y: 0, duration: 0.5, delay: 0.1, ease: 'power2.out' }
  );

  gsap.fromTo('.view.active .view-subtitle',
    { y: 12 },
    { y: 0, duration: 0.5, delay: 0.15, ease: 'power2.out' }
  );

  /* Stagger animate tiles with fromTo (never hides them) */
  gsap.fromTo('.view.active .bento-tile',
    { y: 16, scale: 0.98 },
    { y: 0, scale: 1, duration: 0.4, stagger: 0.06, delay: 0.15, ease: 'power2.out' }
  );

  /* Animate progress bars */
  setTimeout(() => {
    const progressBars = document.querySelectorAll('.progress-bar[data-progress]');
    progressBars.forEach(bar => {
      const progress = bar.dataset.progress;
      gsap.to(bar, {
        width: progress + '%',
        duration: 1,
        ease: 'power2.out'
      });
    });
  }, 300);
}
