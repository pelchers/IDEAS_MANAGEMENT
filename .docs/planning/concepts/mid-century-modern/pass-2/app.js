/**
 * Mid-Century Modern - Pass 2: Saarinen Tulip Dashboard
 * ======================================================
 * Navigation logic, hash routing, interactions, and animations
 * for the orbital/tulip-pedestal UI concept.
 */

(function () {
  "use strict";

  // ============================================================
  // CONSTANTS
  // ============================================================
  const VIEWS = [
    "dashboard",
    "projects",
    "project-workspace",
    "kanban",
    "whiteboard",
    "schema-planner",
    "directory-tree",
    "ideas",
    "ai-chat",
    "settings",
  ];

  const DEFAULT_VIEW = "dashboard";
  const TRANSITION_DURATION = 500; // ms, matches CSS animation

  // ============================================================
  // DOM REFERENCES
  // ============================================================
  const navButtons = document.querySelectorAll("[data-view]");
  const pageViews = document.querySelectorAll("[data-page]");
  const navMobileToggle = document.getElementById("navMobileToggle");
  const orbitalNav = document.getElementById("orbitalNav");

  // ============================================================
  // STATE
  // ============================================================
  let currentView = null;
  let isTransitioning = false;

  // ============================================================
  // HASH ROUTING
  // ============================================================

  /**
   * Parse the current hash and return a valid view name.
   */
  function getViewFromHash() {
    const hash = window.location.hash.replace("#", "").trim();
    return VIEWS.includes(hash) ? hash : DEFAULT_VIEW;
  }

  /**
   * Navigate to a specific view with an orbital transition.
   */
  function navigateTo(viewName) {
    if (!VIEWS.includes(viewName)) viewName = DEFAULT_VIEW;
    if (viewName === currentView || isTransitioning) return;

    isTransitioning = true;

    // Update hash without triggering hashchange re-entry
    if (window.location.hash !== "#" + viewName) {
      history.pushState(null, "", "#" + viewName);
    }

    // Deactivate current view
    const outgoing = currentView
      ? document.querySelector(`[data-page="${currentView}"]`)
      : null;
    if (outgoing) {
      outgoing.style.opacity = "0";
      outgoing.style.transform = "scale(0.94) rotate(2deg)";
      setTimeout(() => {
        outgoing.classList.remove("active", "entering");
        outgoing.style.opacity = "";
        outgoing.style.transform = "";
      }, TRANSITION_DURATION / 2);
    }

    // Activate new view with orbital entrance
    const incoming = document.querySelector(`[data-page="${viewName}"]`);
    setTimeout(
      () => {
        if (incoming) {
          incoming.classList.add("active", "entering");
          // Remove entering class after animation completes
          setTimeout(() => {
            incoming.classList.remove("entering");
          }, TRANSITION_DURATION);
        }
        isTransitioning = false;
      },
      outgoing ? TRANSITION_DURATION / 2 : 0
    );

    // Update nav active states with orbital emphasis
    navButtons.forEach((btn) => {
      const isActive = btn.getAttribute("data-view") === viewName;
      btn.classList.toggle("active", isActive);
    });

    currentView = viewName;

    // Scroll content to top
    const contentArea = document.getElementById("contentArea");
    if (contentArea) contentArea.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Close mobile nav if open
    if (orbitalNav && orbitalNav.classList.contains("nav-open")) {
      orbitalNav.classList.remove("nav-open");
      if (navMobileToggle) navMobileToggle.classList.remove("open");
    }
  }

  // ============================================================
  // EVENT LISTENERS
  // ============================================================

  // Nav button clicks
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.getAttribute("data-view");
      navigateTo(view);
    });
  });

  // Hash change (back/forward browser nav)
  window.addEventListener("hashchange", () => {
    navigateTo(getViewFromHash());
  });

  // Mobile nav toggle
  if (navMobileToggle) {
    navMobileToggle.addEventListener("click", () => {
      orbitalNav.classList.toggle("nav-open");
      navMobileToggle.classList.toggle("open");
    });
  }

  // ============================================================
  // DIRECTORY TREE TOGGLE
  // ============================================================

  function initTreeToggles() {
    const treeToggles = document.querySelectorAll(".tree-toggle");
    treeToggles.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const parentNode = toggle.closest(".tree-node--folder");
        if (parentNode) {
          parentNode.classList.toggle("tree-node--open");
        }
      });
    });
  }

  // ============================================================
  // WHITEBOARD TOOL SELECTION
  // ============================================================

  function initWhiteboardTools() {
    const tools = document.querySelectorAll(".wb-tool");
    tools.forEach((tool) => {
      tool.addEventListener("click", () => {
        tools.forEach((t) => t.classList.remove("wb-tool--active"));
        tool.classList.add("wb-tool--active");
      });
    });

    // Make whiteboard nodes draggable (simple implementation)
    const nodes = document.querySelectorAll(".wb-node");
    nodes.forEach((node) => {
      let isDragging = false;
      let startX, startY, origLeft, origTop;

      node.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        origLeft = node.offsetLeft;
        origTop = node.offsetTop;
        node.style.zIndex = "20";
        node.style.transition = "none";
        e.preventDefault();
      });

      document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        node.style.left = origLeft + dx + "px";
        node.style.top = origTop + dy + "px";
      });

      document.addEventListener("mouseup", () => {
        if (isDragging) {
          isDragging = false;
          node.style.zIndex = "";
          node.style.transition = "";
        }
      });
    });
  }

  // ============================================================
  // SETTINGS RANGE INPUT
  // ============================================================

  function initSettingsControls() {
    const rangeInputs = document.querySelectorAll(".mcm-range");
    rangeInputs.forEach((input) => {
      const valueDisplay = input.parentElement.querySelector(".range-value");
      if (valueDisplay) {
        input.addEventListener("input", () => {
          valueDisplay.textContent = input.value + "px";
        });
      }
    });

    // Toggle switches - visual feedback
    const toggleInputs = document.querySelectorAll(".toggle-input");
    toggleInputs.forEach((input) => {
      input.addEventListener("change", () => {
        const track = input.nextElementSibling;
        if (track) {
          track.style.transform = "scale(0.95)";
          setTimeout(() => {
            track.style.transform = "";
          }, 150);
        }
      });
    });
  }

  // ============================================================
  // AI CHAT INTERACTION
  // ============================================================

  function initChat() {
    const chatInput = document.querySelector(".chat-input");
    const chatSendBtn = document.querySelector(".chat-send-btn");
    const chatMessages = document.getElementById("chatMessages");

    if (!chatInput || !chatSendBtn || !chatMessages) return;

    function sendMessage() {
      const text = chatInput.value.trim();
      if (!text) return;

      // Create user message
      const userBubble = document.createElement("div");
      userBubble.className = "chat-bubble chat-bubble--user";
      userBubble.innerHTML = `
        <div class="tulip-message-shape">
          <div class="bubble-content">
            <p>${escapeHtml(text)}</p>
          </div>
          <div class="tulip-message-stem"></div>
        </div>
        <span class="chat-time">${getCurrentTime()}</span>
      `;
      chatMessages.appendChild(userBubble);

      chatInput.value = "";

      // Simulate AI response after a short delay
      setTimeout(() => {
        const aiBubble = document.createElement("div");
        aiBubble.className = "chat-bubble chat-bubble--ai";
        aiBubble.innerHTML = `
          <div class="tulip-message-shape">
            <div class="bubble-content">
              <p>${generateAIResponse(text)}</p>
            </div>
            <div class="tulip-message-stem"></div>
          </div>
          <span class="chat-time">${getCurrentTime()}</span>
        `;
        chatMessages.appendChild(aiBubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 800);

      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    chatSendBtn.addEventListener("click", sendMessage);
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function generateAIResponse(input) {
    const responses = [
      "That's an interesting direction! Consider how it aligns with the overall project vision and what the first concrete step would be.",
      "I'd suggest breaking that down into smaller, more actionable components. What's the core piece that delivers the most value first?",
      "Great thinking. This connects well with some of the patterns we've discussed. Let me suggest a few variations to explore.",
      "Looking at this from a mid-century design lens, simplicity and functionality should guide the approach. Less ornamentation, more purposeful form.",
      "That could work well as a modular component. Think about how it composes with other pieces of the system.",
      "Interesting concept! I'd recommend sketching out the user flow first before diving into implementation details.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ============================================================
  // IDEA CAPTURE
  // ============================================================

  function initIdeaCapture() {
    const ideaInput = document.querySelector(".idea-input");
    const ideaSubmitBtn = document.querySelector(".idea-submit-btn");
    const orbitField = document.querySelector(".ideas-orbit-field");

    if (!ideaInput || !ideaSubmitBtn || !orbitField) return;

    function addIdea() {
      const text = ideaInput.value.trim();
      if (!text) return;

      const card = document.createElement("div");
      card.className = "idea-orbit-card";
      card.innerHTML = `
        <div class="idea-card-inner">
          <span class="idea-card-icon">&#9670;</span>
          <h3>${escapeHtml(text)}</h3>
          <p>New idea captured just now</p>
          <div class="idea-meta">
            <span class="idea-tag">New</span>
            <span class="idea-date">Just now</span>
          </div>
        </div>
      `;

      // Insert at the beginning with animation
      card.style.opacity = "0";
      card.style.transform = "scale(0.7) rotate(-10deg)";
      orbitField.insertBefore(card, orbitField.firstChild);

      requestAnimationFrame(() => {
        card.style.transition =
          "opacity 500ms ease, transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)";
        card.style.opacity = "1";
        card.style.transform = "scale(1) rotate(0deg)";
      });

      ideaInput.value = "";
      ideaInput.focus();
    }

    ideaSubmitBtn.addEventListener("click", addIdea);
    ideaInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addIdea();
      }
    });
  }

  // ============================================================
  // STARBURST ANIMATION OBSERVER
  // ============================================================

  function initStarburstObserver() {
    // Pause starburst animations when they're not visible (performance)
    if (!("IntersectionObserver" in window)) return;

    const starbursts = document.querySelectorAll(
      ".starburst-icon, .section-starburst, .crumb-separator"
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.style.animationPlayState = entry.isIntersecting
            ? "running"
            : "paused";
        });
      },
      { threshold: 0 }
    );

    starbursts.forEach((el) => observer.observe(el));
  }

  // ============================================================
  // PROGRESS BAR ANIMATION ON VIEW
  // ============================================================

  function initProgressAnimations() {
    if (!("IntersectionObserver" in window)) return;

    const progressBars = document.querySelectorAll(".progress-fill");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bar = entry.target;
            const targetWidth = bar.style.getPropertyValue("--progress");
            bar.style.width = "0%";
            requestAnimationFrame(() => {
              bar.style.width = targetWidth;
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    progressBars.forEach((bar) => observer.observe(bar));
  }

  // ============================================================
  // KEYBOARD NAVIGATION
  // ============================================================

  function initKeyboardNav() {
    document.addEventListener("keydown", (e) => {
      // Number keys 1-9 and 0 for quick view switching
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 9) {
          e.preventDefault();
          navigateTo(VIEWS[num - 1]);
        } else if (num === 0) {
          e.preventDefault();
          navigateTo(VIEWS[9]);
        }
      }

      // Escape closes mobile nav
      if (e.key === "Escape") {
        if (orbitalNav && orbitalNav.classList.contains("nav-open")) {
          orbitalNav.classList.remove("nav-open");
          if (navMobileToggle) navMobileToggle.classList.remove("open");
        }
      }
    });
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================

  function init() {
    // Initialize all interactive modules
    initTreeToggles();
    initWhiteboardTools();
    initSettingsControls();
    initChat();
    initIdeaCapture();
    initStarburstObserver();
    initProgressAnimations();
    initKeyboardNav();

    // Navigate to initial view from hash
    const initialView = getViewFromHash();
    // Set the initial view without transition animation
    const initialPage = document.querySelector(
      `[data-page="${initialView}"]`
    );
    if (initialPage) {
      initialPage.classList.add("active");
    }
    navButtons.forEach((btn) => {
      btn.classList.toggle(
        "active",
        btn.getAttribute("data-view") === initialView
      );
    });
    currentView = initialView;
  }

  // Start the application
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
