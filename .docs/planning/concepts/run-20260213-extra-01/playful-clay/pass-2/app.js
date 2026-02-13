(() => {
  const buttons = Array.from(document.querySelectorAll("button[data-view]"));
  const pages = Array.from(document.querySelectorAll("[data-page]"));
  function activate(id) {
    buttons.forEach((btn) => btn.classList.toggle("active", btn.dataset.view === id));
    pages.forEach((page) => page.classList.toggle("active", page.dataset.page === id));
    const root = document.querySelector("[data-theme-root]") || document.body;
    root.setAttribute("data-active-view", id);
    const url = new URL(window.location.href);
    url.hash = id;
    history.replaceState({}, "", url);
  }
  buttons.forEach((btn) => btn.addEventListener("click", () => activate(btn.dataset.view)));
  activate(window.location.hash ? window.location.hash.slice(1) : "dashboard");
})();
