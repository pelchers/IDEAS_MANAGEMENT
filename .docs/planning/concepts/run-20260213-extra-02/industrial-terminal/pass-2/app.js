(() => {
  const root = document.querySelector("[data-theme-root]") || document.body;
  const buttons = Array.from(document.querySelectorAll("button[data-view]"));
  const pages = Array.from(document.querySelectorAll("[data-page]"));
  const runtime = {
    motionSeed: Number(root.dataset.motionSeed || 1),
    motionProfile: root.dataset.motionProfile || "vortex"
  };

  function animateView(page) {
    if (!window.gsap || !page) return;
    gsap.fromTo(
      page,
      { y: 24, opacity: 0, rotateX: 2 },
      { y: 0, opacity: 1, rotateX: 0, duration: 0.45, ease: "power2.out" }
    );
  }

  function activate(id) {
    buttons.forEach((btn) => btn.classList.toggle("active", btn.dataset.view === id));
    pages.forEach((page) => page.classList.toggle("active", page.dataset.page === id));
    root.setAttribute("data-active-view", id);
    const activePage = pages.find((page) => page.dataset.page === id);
    animateView(activePage);
    const url = new URL(window.location.href);
    url.hash = id;
    history.replaceState({}, "", url);
  }

  function animateNavigation() {
    if (!window.gsap || buttons.length === 0) return;
    gsap.from(buttons, {
      y: 14,
      opacity: 0,
      duration: 0.36,
      ease: "power2.out",
      stagger: 0.03
    });
  }

  function initThreeScene() {
    if (!window.THREE) return;
    const stage = document.getElementById("fx-3d-stage");
    if (!stage) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1200);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    stage.appendChild(renderer.domElement);

    const geometries = [
      new THREE.TorusKnotGeometry(1.8, 0.36, 180, 32),
      new THREE.IcosahedronGeometry(2.0, 1),
      new THREE.OctahedronGeometry(2.1, 0),
      new THREE.TorusGeometry(2.0, 0.55, 16, 120)
    ];
    const geometry = geometries[runtime.motionSeed % geometries.length];
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.35,
      roughness: 0.32,
      transparent: true,
      opacity: 0.7,
      wireframe: runtime.motionProfile === "lattice"
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const rim = new THREE.PointLight(0x7fd8ff, 1.2, 30);
    rim.position.set(3, 4, 5);
    const fill = new THREE.PointLight(0xff9dd1, 1.1, 26);
    fill.position.set(-3, -2, 4);
    scene.add(rim);
    scene.add(fill);
    scene.add(new THREE.AmbientLight(0xffffff, 0.42));

    if (window.gsap) {
      gsap.to(mesh.rotation, {
        y: Math.PI * 2,
        duration: 20,
        ease: "none",
        repeat: -1
      });
    }

    let raf = 0;
    const tick = () => {
      const t = performance.now() * 0.001;
      mesh.rotation.x = Math.sin(t * 0.42) * 0.42;
      mesh.position.y = Math.cos(t * 0.8) * 0.24;
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
  animateNavigation();
  initThreeScene();
})();
