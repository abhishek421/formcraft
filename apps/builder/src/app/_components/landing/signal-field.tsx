"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// A field of ~13k points undulating like a surface of incoming responses.
// Most points are ink; a sparse few are orange "events" that pulse — the
// visual metaphor for the optimizer noticing signal inside noise.
// Mouse acts as a ripple source so the field feels alive under the cursor.

const COLS = 150;
const ROWS = 90;
const W = 38;
const D = 24;

const VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uMouseStrength;
  varying float vSeed;
  varying float vElev;
  varying float vDist;

  void main() {
    vec3 p = position;
    float t = uTime;

    float wave =
      sin(p.x * 0.55 + t * 0.9)  * 0.22 +
      sin(p.z * 0.85 - t * 0.6)  * 0.18 +
      sin((p.x + p.z) * 0.32 + t * 0.45) * 0.30;

    float d = distance(p.xz, uMouse);
    float ripple = exp(-d * 0.5) * sin(d * 2.4 - t * 3.4) * 1.1 * uMouseStrength;

    p.y += wave + ripple;
    vElev = wave + ripple;
    vSeed = aSeed;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDist = -mv.z;
    gl_PointSize = (150.0 / vDist) * (1.0 + step(0.992, aSeed) * 1.2);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  uniform float uTime;
  varying float vSeed;
  varying float vElev;
  varying float vDist;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv);
    float disc = smoothstep(0.5, 0.16, r);

    vec3 ink    = vec3(0.110, 0.098, 0.090);
    vec3 accent = vec3(0.910, 0.365, 0.227);

    float isEvent = step(0.992, vSeed);
    float pulse = 0.5 + 0.5 * sin(uTime * 2.2 + vSeed * 90.0);

    vec3 color = mix(ink, accent, isEvent);
    float base = mix(0.13 + clamp(vElev, 0.0, 1.0) * 0.16, 0.55 + 0.45 * pulse, isEvent);

    float fade = smoothstep(30.0, 10.0, vDist);
    gl_FragColor = vec4(color, disc * base * fade);
  }
`;

export function SignalField() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 5.4, 11.5);
    camera.lookAt(0, 0, -2.5);

    const count = COLS * ROWS;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    let i = 0;
    for (let z = 0; z < ROWS; z++) {
      for (let x = 0; x < COLS; x++) {
        positions[i * 3]     = (x / (COLS - 1) - 0.5) * W;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = (z / (ROWS - 1) - 0.5) * D - 2.5;
        seeds[i] = Math.random();
        i++;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 100) },
        uMouseStrength: { value: 0 },
      },
    });

    scene.add(new THREE.Points(geo, mat));

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    // Project the cursor onto the field's plane so the ripple tracks it in world space.
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();
    const target = new THREE.Vector2(0, 100);
    let strengthTarget = 0;

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) { strengthTarget = 0; return; }
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(plane, hit)) {
        target.set(hit.x, hit.z);
        strengthTarget = 1;
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    io.observe(host);

    const start = performance.now();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      const u = mat.uniforms;
      u.uTime.value = (performance.now() - start) / 1000;
      (u.uMouse.value as THREE.Vector2).lerp(target, 0.08);
      u.uMouseStrength.value += (strengthTarget - u.uMouseStrength.value) * 0.06;
      renderer.render(scene, camera);
    };

    if (reduced) {
      mat.uniforms.uTime.value = 4.2;
      renderer.render(scene, camera);
    } else {
      tick();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
      io.disconnect();
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    />
  );
}
