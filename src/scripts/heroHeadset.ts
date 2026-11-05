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
  const cameraMaterial = new THREE.MeshStandardMaterial({ color: 0x171b23, metalness: 0.72, roughness: 0.2 });
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x153a59,
    metalness: 0.16,
    roughness: 0.04,
    clearcoat: 1,
    clearcoatRoughness: 0.02
  });

  [-0.29, 0.29].forEach((offset) => {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.055, 36), cameraMaterial);
    ring.position.set(x, offset, 0.48);
    ring.rotation.x = Math.PI / 2;
    parent.add(ring);

    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.09, 0.065, 36), glassMaterial);
    lens.position.set(x, offset, 0.53);
    lens.rotation.x = Math.PI / 2;
    parent.add(lens);

    const glint = new THREE.Mesh(
      new THREE.SphereGeometry(0.026, 12, 10),
      new THREE.MeshBasicMaterial({ color: 0xc9f4ff, transparent: true, opacity: 0.72 })
    );
    glint.position.set(x - 0.035, offset + 0.035, 0.575);
    parent.add(glint);
  });
}

function createStrap(points: unknown[], radius: number, material: unknown, segments = 48) {
  const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.45);
  return new THREE.Mesh(new THREE.TubeGeometry(curve, segments, radius, 10, false), material);
}

export function initHeroHeadset() {
  const stage = document.querySelector<HTMLElement>("[data-headset-hero]");
  const canvas = document.querySelector<HTMLCanvasElement>("[data-headset-canvas]");
  if (!stage || !canvas) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.08, 7.5);

  const headset = new THREE.Group();
  headset.rotation.set(-0.08, -0.38, 0.015);
  scene.add(headset);

  const shellMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xe7e8ec,
    metalness: 0.08,
    roughness: 0.34,
    clearcoat: 0.62,
    clearcoatRoughness: 0.2
  });
  const trimMaterial = new THREE.MeshStandardMaterial({ color: 0x747985, metalness: 0.42, roughness: 0.3 });
  const cushionMaterial = new THREE.MeshStandardMaterial({ color: 0x111318, metalness: 0.02, roughness: 0.78 });
  const fabricMaterial = new THREE.MeshStandardMaterial({ color: 0x484b53, metalness: 0.01, roughness: 0.92 });
  const visorMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x07101c,
    metalness: 0.24,
    roughness: 0.08,
    clearcoat: 1,
    clearcoatRoughness: 0.035,
    transparent: true,
    opacity: 0.96
  });
  const sensorMaterial = new THREE.MeshStandardMaterial({
    color: 0x15354a,
    emissive: 0x0a5577,
    emissiveIntensity: 0.18,
    metalness: 0.28,
    roughness: 0.16
  });

  // A layered manufactured shell reads more naturally than a single floating panel.
  const body = new THREE.Mesh(createRoundedPanel(3.76, 1.46, 0.68, 0.49), shellMaterial);
  body.position.z = -0.34;
  headset.add(body);

  const trim = new THREE.Mesh(createRoundedPanel(3.84, 1.52, 0.16, 0.51), trimMaterial);
  trim.position.z = 0.06;
  headset.add(trim);

  const visor = new THREE.Mesh(createRoundedPanel(3.67, 1.34, 0.13, 0.43), visorMaterial);
  visor.position.set(0, 0.01, 0.24);
  headset.add(visor);

  addCameraStack(headset, -1.28);
  addCameraStack(headset, 1.28);

  const centerSensorRing = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.055, 36), trimMaterial);
  centerSensorRing.position.set(0, -0.35, 0.48);
  centerSensorRing.rotation.x = Math.PI / 2;
  headset.add(centerSensorRing);

  const centerSensor = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.09, 0.065, 36), sensorMaterial);
  centerSensor.position.set(0, -0.35, 0.53);
  centerSensor.rotation.x = Math.PI / 2;
  headset.add(centerSensor);

  const statusLed = new THREE.Mesh(
    new THREE.SphereGeometry(0.028, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0x7cf5c8, emissive: 0x42e4aa, emissiveIntensity: 1.7 })
  );
  statusLed.position.set(0.48, -0.48, 0.5);
  headset.add(statusLed);

  // Rear facial interface and optics appear when the visitor rotates the model.
  const faceGasket = new THREE.Mesh(createRoundedPanel(3.14, 1.22, 0.2, 0.46), cushionMaterial);
  faceGasket.position.z = -0.83;
  headset.add(faceGasket);

  [-0.68, 0.68].forEach((x) => {
    const eyepiece = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.09, 16, 44), cushionMaterial);
    eyepiece.position.set(x, -0.03, -0.98);
    eyepiece.scale.set(1.18, 0.92, 0.55);
    headset.add(eyepiece);

    const innerLens = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.25, 0.06, 40), sensorMaterial);
    innerLens.position.set(x, -0.03, -1.02);
    innerLens.rotation.x = Math.PI / 2;
    headset.add(innerLens);
  });

  const noseBridge = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.27, 10, 20), cushionMaterial);
  noseBridge.position.set(0, -0.65, -0.91);
  noseBridge.rotation.z = Math.PI / 2;
  noseBridge.scale.set(0.74, 1, 1);
  headset.add(noseBridge);

  [-1, 1].forEach((side) => {
    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.14, 32), trimMaterial);
    hinge.position.set(side * 1.93, -0.02, -0.28);
    hinge.rotation.z = Math.PI / 2;
    headset.add(hinge);

    const hingeCap = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.15, 32), shellMaterial);
    hingeCap.position.set(side * 1.99, -0.02, -0.28);
    hingeCap.rotation.z = Math.PI / 2;
    headset.add(hingeCap);

    headset.add(createStrap([
      new THREE.Vector3(side * 1.94, -0.02, -0.3),
      new THREE.Vector3(side * 2.1, 0.02, -0.88),
      new THREE.Vector3(side * 1.8, 0.07, -1.58),
      new THREE.Vector3(side * 1.2, 0.08, -2.02)
    ], 0.105, fabricMaterial));
  });

  headset.add(createStrap([
    new THREE.Vector3(-1.2, 0.08, -2.02),
    new THREE.Vector3(-0.64, 0.06, -2.28),
    new THREE.Vector3(0, 0.02, -2.37),
    new THREE.Vector3(0.64, 0.06, -2.28),
    new THREE.Vector3(1.2, 0.08, -2.02)
  ], 0.14, fabricMaterial, 64));

  headset.add(createStrap([
    new THREE.Vector3(0, 0.68, -0.5),
    new THREE.Vector3(0, 1.17, -0.95),
    new THREE.Vector3(0, 1.24, -1.58),
    new THREE.Vector3(0, 0.66, -2.14)
  ], 0.115, fabricMaterial));

  const adjustmentDial = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.15, 36), trimMaterial);
  adjustmentDial.position.set(0, 0.03, -2.43);
  adjustmentDial.rotation.x = Math.PI / 2;
  headset.add(adjustmentDial);

  for (let index = -3; index <= 3; index += 1) {
    const vent = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.026, 0.07), cushionMaterial);
    vent.position.set(index * 0.29, 0.75, -0.1);
    vent.rotation.x = -0.22;
    headset.add(vent);
  }

  scene.add(new THREE.HemisphereLight(0xf4f8ff, 0x52617d, 1.65));
  const keyLight = new THREE.DirectionalLight(0xffffff, 4.4);
  keyLight.position.set(3.4, 4.6, 5.5);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0x9eb9ff, 1.55);
  fillLight.position.set(-4.2, -0.8, 3.2);
  scene.add(fillLight);
  const rimLight = new THREE.DirectionalLight(0x70e8ff, 2.15);
  rimLight.position.set(-3.8, 2.2, -3.5);
  scene.add(rimLight);

  const target = { x: -0.08, y: -0.38 };
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
      if (!reduceMotion) target.y += 0.00135;
    }

    current.x += (target.x - current.x) * 0.09;
    current.y += (target.y - current.y) * 0.09;
    headset.rotation.x = current.x + Math.sin(time * 0.001) * (reduceMotion ? 0 : 0.014);
    headset.rotation.y = current.y;
    headset.rotation.z = 0.015 + Math.sin(time * 0.0008) * (reduceMotion ? 0 : 0.009);

    renderer.render(scene, camera);
    frame = requestAnimationFrame(animate);
  };

  frame = requestAnimationFrame(animate);

  window.addEventListener("pagehide", () => {
    cancelAnimationFrame(frame);
    renderer.dispose();
  });
}
