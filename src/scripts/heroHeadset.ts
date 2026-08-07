import * as THREE from "three";

type DragState = {
  active: boolean;
  lastX: number;
  lastY: number;
  velocityX: number;
  velocityY: number;
};

function createRoundedPanel(width: number, height: number, depth: number, radius: number) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();

  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  return new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 8,
    bevelSize: 0.1,
    bevelThickness: 0.08
  });
}

function addCameraStack(parent: { add: (...objects: unknown[]) => void }, x: number) {
  const cameraMaterial = new THREE.MeshStandardMaterial({ color: 0x05070d, metalness: 0.2, roughness: 0.22 });
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x101623,
    metalness: 0.1,
    roughness: 0.08,
    clearcoat: 0.9,
    clearcoatRoughness: 0.05
  });

  const pill = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.46, 10, 18), cameraMaterial);
  pill.position.set(x, 0.06, 0.56);
  parent.add(pill);

  [-0.16, 0.16].forEach((offset) => {
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 28), glassMaterial);
    lens.position.set(x, offset + 0.06, 0.7);
    lens.rotation.x = Math.PI / 2;
    parent.add(lens);
  });
}

export function initHeroHeadset() {
  const stage = document.querySelector<HTMLElement>("[data-headset-hero]");
  const canvas = document.querySelector<HTMLCanvasElement>("[data-headset-canvas]");
  if (!stage || !canvas) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0.1, 7.4);

  const headset = new THREE.Group();
  headset.rotation.set(-0.1, -0.34, 0.02);
  scene.add(headset);

  const shellMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xdedcf0,
    metalness: 0.12,
    roughness: 0.48,
    clearcoat: 0.55,
    clearcoatRoughness: 0.26
  });
  const trimMaterial = new THREE.MeshStandardMaterial({ color: 0x9b9bb2, metalness: 0.24, roughness: 0.5 });
  const cushionMaterial = new THREE.MeshStandardMaterial({ color: 0x171820, metalness: 0.05, roughness: 0.72 });
  const fabricMaterial = new THREE.MeshStandardMaterial({ color: 0xc9c3dd, metalness: 0.04, roughness: 0.82 });
  const accentMaterial = new THREE.MeshStandardMaterial({ color: 0x246bfd, emissive: 0x0d3ea0, emissiveIntensity: 0.2 });

  const body = new THREE.Mesh(createRoundedPanel(3.9, 1.42, 0.62, 0.48), shellMaterial);
  body.position.z = -0.3;
  headset.add(body);

  const trim = new THREE.Mesh(createRoundedPanel(3.98, 1.5, 0.05, 0.5), trimMaterial);
  trim.position.z = -0.33;
  trim.scale.set(1.02, 1.02, 1);
  headset.add(trim);

  const visor = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.58, 14, 18), cushionMaterial);
  visor.position.set(0, 0, 0.62);
  visor.scale.set(1.05, 1.32, 1);
  headset.add(visor);

  const leftCushion = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.15, 18, 58), cushionMaterial);
  const rightCushion = leftCushion.clone();
  leftCushion.position.set(-0.72, -0.58, 0.1);
  rightCushion.position.set(0.72, -0.58, 0.1);
  leftCushion.scale.set(1.05, 0.62, 0.28);
  rightCushion.scale.copy(leftCushion.scale);
  headset.add(leftCushion, rightCushion);

  addCameraStack(headset, -1.0);
  addCameraStack(headset, 1.0);

  const centerSensor = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.52, 12, 16), cushionMaterial);
  centerSensor.position.set(0, 0.04, 0.72);
  headset.add(centerSensor);

  const strap = new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.08, 18, 96, Math.PI * 1.22), fabricMaterial);
  strap.position.set(0, -0.66, -0.52);
  strap.rotation.x = Math.PI * 0.5;
  strap.rotation.z = Math.PI * 0.89;
  strap.scale.set(1.16, 0.72, 1);
  headset.add(strap);

  [-1.98, 1.98].forEach((x) => {
    const side = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.78, 10, 18), trimMaterial);
    side.position.set(x, -0.02, -0.2);
    side.rotation.y = x < 0 ? -0.58 : 0.58;
    headset.add(side);
  });

  [-0.55, 0.55, 0].forEach((x, index) => {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(index === 2 ? 0.045 : 0.06, 18, 18), accentMaterial);
    dot.position.set(x, index === 2 ? -0.56 : -0.47, 0.72);
    headset.add(dot);
  });

  scene.add(new THREE.HemisphereLight(0xffffff, 0xb7c6e8, 2.1));
  const keyLight = new THREE.DirectionalLight(0xffffff, 3.7);
  keyLight.position.set(2.6, 3.6, 4.2);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0x92f2ff, 1.4);
  rimLight.position.set(-3.5, 1.6, -2.2);
  scene.add(rimLight);

  const target = { x: -0.1, y: -0.34 };
  const current = { x: target.x, y: target.y };
  const drag: DragState = { active: false, lastX: 0, lastY: 0, velocityX: 0, velocityY: 0 };

  const resize = () => {
    const { width, height } = stage.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
  };

  const onPointerDown = (event: PointerEvent) => {
    drag.active = true;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.velocityX = 0;
    drag.velocityY = 0;
    stage.classList.add("is-dragging");
    stage.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!drag.active) return;
    const deltaX = event.clientX - drag.lastX;
    const deltaY = event.clientY - drag.lastY;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.velocityX = deltaX * 0.006;
    drag.velocityY = deltaY * 0.005;
    target.y += drag.velocityX;
    target.x += drag.velocityY;
    target.x = THREE.MathUtils.clamp(target.x, -0.58, 0.48);
  };

  const endDrag = (event: PointerEvent) => {
    drag.active = false;
    stage.classList.remove("is-dragging");
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
  };

  stage.addEventListener("pointerdown", onPointerDown);
  stage.addEventListener("pointermove", onPointerMove);
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);
  window.addEventListener("resize", resize, { passive: true });

  resize();

  let frame = 0;
  const animate = (time: number) => {
    if (!drag.active) {
      target.y += drag.velocityX;
      target.x += drag.velocityY;
      drag.velocityX *= 0.92;
      drag.velocityY *= 0.9;
      if (!reduceMotion) target.y += 0.002;
    }

    current.x += (target.x - current.x) * 0.09;
    current.y += (target.y - current.y) * 0.09;
    headset.rotation.x = current.x + Math.sin(time * 0.001) * (reduceMotion ? 0 : 0.018);
    headset.rotation.y = current.y;
    headset.rotation.z = 0.02 + Math.sin(time * 0.0008) * (reduceMotion ? 0 : 0.012);

    renderer.render(scene, camera);
    frame = requestAnimationFrame(animate);
  };

  frame = requestAnimationFrame(animate);

  window.addEventListener("pagehide", () => {
    cancelAnimationFrame(frame);
    renderer.dispose();
  });
}
