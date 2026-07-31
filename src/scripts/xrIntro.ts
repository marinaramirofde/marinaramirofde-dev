import * as THREE from "three";

export function initXrIntro() {
  const intro = document.querySelector<HTMLElement>("[data-xr-intro]");
  const canvas = document.querySelector<HTMLCanvasElement>("[data-xr-canvas]");
  const skip = document.querySelector<HTMLButtonElement>("[data-xr-skip]");
  if (!intro || !canvas) return;

  const storageKey = intro.dataset.storageKey ?? "marina-xr-intro-seen";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const smallViewport = window.matchMedia("(max-width: 768px)").matches;

  const finish = () => {
    sessionStorage.setItem(storageKey, "true");
    intro.classList.add("is-complete");
    window.setTimeout(() => intro.remove(), 520);
  };

  if (sessionStorage.getItem(storageKey) === "true" || reduceMotion) {
    intro.remove();
    return;
  }

  skip?.addEventListener("click", finish);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !smallViewport });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, smallViewport ? 1.25 : 1.75));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 7);

  const group = new THREE.Group();
  scene.add(group);

  const material = new THREE.MeshStandardMaterial({
    color: 0x050505,
    metalness: 0.45,
    roughness: 0.32
  });
  const lensMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x2f80ed,
    transparent: true,
    opacity: 0.38,
    roughness: 0.1,
    transmission: 0.35
  });
  const handMaterial = new THREE.MeshStandardMaterial({ color: 0xf2d2bd, roughness: 0.7 });

  // Build a lightweight XR glasses silhouette from primitives to avoid blocking model downloads.
  const frameGeometry = new THREE.TorusGeometry(0.95, 0.055, 16, 80);
  const leftFrame = new THREE.Mesh(frameGeometry, material);
  const rightFrame = new THREE.Mesh(frameGeometry, material);
  leftFrame.position.x = -1.05;
  rightFrame.position.x = 1.05;
  group.add(leftFrame, rightFrame);

  const lensGeometry = new THREE.CircleGeometry(0.82, 48);
  const leftLens = new THREE.Mesh(lensGeometry, lensMaterial);
  const rightLens = new THREE.Mesh(lensGeometry, lensMaterial);
  leftLens.position.set(-1.05, 0, 0.04);
  rightLens.position.set(1.05, 0, 0.04);
  group.add(leftLens, rightLens);

  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.1, 0.08), material);
  bridge.position.y = 0.04;
  group.add(bridge);

  const handGeometry = new THREE.CapsuleGeometry(0.16, 1.15, 8, 16);
  const leftHand = new THREE.Mesh(handGeometry, handMaterial);
  const rightHand = new THREE.Mesh(handGeometry, handMaterial);
  leftHand.position.set(-3.1, -1.15, 0.2);
  rightHand.position.set(3.1, -1.15, 0.2);
  leftHand.rotation.z = -0.72;
  rightHand.rotation.z = 0.72;
  scene.add(leftHand, rightHand);

  scene.add(new THREE.AmbientLight(0xffffff, 1.3));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(2, 3, 4);
  scene.add(keyLight);

  const resize = () => {
    const width = intro.clientWidth;
    const height = intro.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  resize();
  window.addEventListener("resize", resize, { passive: true });

  const start = performance.now();
  const duration = Number(intro.dataset.duration || 4200);
  let frame = 0;

  const animate = (time: number) => {
    const progress = Math.min((time - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);

    group.position.z = -1 + ease * 4.2;
    group.rotation.y = Math.sin(progress * Math.PI * 2) * 0.12;
    group.scale.setScalar(0.72 + ease * 1.45);
    leftHand.position.x = -3.1 + ease * 1.55;
    rightHand.position.x = 3.1 - ease * 1.55;
    leftHand.position.y = -1.15 + Math.sin(progress * Math.PI) * 0.5;
    rightHand.position.y = leftHand.position.y;

    renderer.render(scene, camera);
    if (progress < 1) {
      frame = requestAnimationFrame(animate);
    } else {
      finish();
    }
  };

  frame = requestAnimationFrame(animate);

  window.addEventListener("pagehide", () => {
    cancelAnimationFrame(frame);
    renderer.dispose();
  });
}
