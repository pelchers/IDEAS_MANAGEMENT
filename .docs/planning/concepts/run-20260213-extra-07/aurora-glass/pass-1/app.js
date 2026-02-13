(() => {
  const root = document.querySelector("[data-theme-root]") || document.body;
  const buttons = Array.from(document.querySelectorAll("button[data-view]"));
  const pages = Array.from(document.querySelectorAll("[data-page]"));
  const contentFlow = root.dataset.contentFlow || "cards";
  const scrollMode = root.dataset.scrollMode || "reveal";
  const motionLanguage = root.dataset.motionLanguage || "calm";

  function activate(id) {
    buttons.forEach((btn) => btn.classList.toggle("active", btn.dataset.view === id));
    pages.forEach((page) => page.classList.toggle("active", page.dataset.page === id));
    root.setAttribute("data-active-view", id);
    const activePage = pages.find((page) => page.dataset.page === id);
    if (contentFlow === "horizontal" && activePage?.scrollIntoView) {
      activePage.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
    if (window.gsap && activePage) {
      gsap.fromTo(activePage, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.38, ease: "power2.out" });
    }
    const url = new URL(window.location.href);
    url.hash = id;
    history.replaceState({}, "", url);
  }

  function setupScroll() {
    if (scrollMode === "parallax") {
      window.addEventListener("mousemove", (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 9;
        const y = (e.clientY / window.innerHeight - 0.5) * 9;
        root.style.setProperty("--parallax-x", `${x}px`);
        root.style.setProperty("--parallax-y", `${y}px`);
      });
    }
    if (scrollMode === "horizontal") {
      const track = document.querySelector(".flow-horizontal");
      if (track) {
        track.addEventListener("wheel", (e) => {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault();
            track.scrollLeft += e.deltaY;
          }
        }, { passive: false });
      }
    }
  }

  function initThree() {
    if (!window.THREE) return;
    const stage = document.getElementById("fx-3d-stage");
    if (!stage) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 7);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    stage.appendChild(renderer.domElement);
    const map = {
      orbit: new THREE.TorusKnotGeometry(1.7, 0.32, 170, 22),
      drift: new THREE.IcosahedronGeometry(2.0, 1),
      elastic: new THREE.OctahedronGeometry(2.2, 0),
      strobe: new THREE.TorusGeometry(2.1, 0.52, 16, 110),
      calm: new THREE.SphereGeometry(2.0, 38, 24)
    };
    const geometry = map[motionLanguage] || map.calm;
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.34, roughness: 0.32, transparent: true, opacity: 0.66, wireframe: motionLanguage === "strobe" });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    scene.add(new THREE.AmbientLight(0xffffff, 0.44));
    const key = new THREE.PointLight(0x7fd8ff, 1.2, 30); key.position.set(3, 4, 6); scene.add(key);
    const fill = new THREE.PointLight(0xff8fc6, 1.0, 26); fill.position.set(-3, -2, 4); scene.add(fill);
    if (window.gsap) {
      const speed = motionLanguage === "strobe" ? 9 : motionLanguage === "orbit" ? 16 : 22;
      gsap.to(mesh.rotation, { y: Math.PI * 2, duration: speed, ease: "none", repeat: -1 });
    }
    let raf = 0;
    const tick = () => {
      const t = performance.now() * 0.001;
      mesh.rotation.x = Math.sin(t * 0.42) * 0.34;
      mesh.position.y = Math.cos(t * 0.6) * 0.2;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
    window.addEventListener("beforeunload", () => {
      cancelAnimationFrame(raf);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    });
  }

  buttons.forEach((btn) => btn.addEventListener("click", () => activate(btn.dataset.view)));
  activate(window.location.hash ? window.location.hash.slice(1) : "dashboard");
  setupScroll();
  initThree();
  if (window.gsap && buttons.length) {
    gsap.from(buttons, { y: 12, opacity: 0, duration: 0.34, stagger: 0.03, ease: "power2.out" });
  }
})();
